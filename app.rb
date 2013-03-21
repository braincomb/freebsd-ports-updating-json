#!/usr/bin/env ruby

# Author: Aleksandr Melentiev
# URL: http://github.com/braincomb/freebsd-ports-updating-json
# Description: parses UPDATING file and generates JSON
# Usage: run manually or setup a crontab at 1 hour interval

require 'json'
require 'open-uri'
require 'openssl'

INPUT_FILE = "/usr/ports/UPDATING"
INPUT_URL = "https://raw.github.com/freebsd/freebsd-ports/master/UPDATING"
OUTPUT_FILE = File.dirname(__FILE__) + "/UPDATING.json"

# Uses INPUT_URL by default.
# Set to false if you want to use your local /usr/ports/UPDATING file.
USE_REMOTE = true

def parse_updating_file
  hash = { :updating => [] }
  date = affects = author = content = ''
  getcontent = false
  
  remote_data = open(INPUT_URL, :ssl_verify_mode => OpenSSL::SSL::VERIFY_NONE) if USE_REMOTE == true
  IO.foreach(USE_REMOTE ? remote_data : INPUT_FILE) do |line|
    if line =~ /^\d{8}(:)/
      if !content.empty?
        hash[:updating] << { :date => date, :affects => affects, :author => author, :content => content }
      end
    getcontent = false
    content = ''
    date = line.chomp(":\n")
    elsif line =~ /^ +AFFECTS/
      affects = line.tap{ |s| s.slice!("  AFFECTS: ") }.chomp
    elsif line =~ /^ +AUTHOR/
      author = line.tap{ |s| s.slice!("  AUTHOR: ") }.chomp
      getcontent = true
    else
      content << line if getcontent == true
    end
  end
  return hash
end

def create_json(hash)
  current_json = JSON.parse(File.read(OUTPUT_FILE)) if File.file?(OUTPUT_FILE)
  unless hash.to_json == current_json.to_json
    File.open(OUTPUT_FILE, "w") do |f|
      f.write(JSON.pretty_generate hash)
    end
  end
end

if USE_REMOTE == false and !File.file?(INPUT_FILE)
  puts "ERROR: " + INPUT_FILE + " was not found or is not a valid file."
else
  hash = parse_updating_file
  create_json(hash)
end
