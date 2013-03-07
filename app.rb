#!/usr/bin/env ruby
require 'json'

# Author: Aleksandr Melentiev
# URL: http://github.com/braincomb/freebsd-ports-updating-json
# Description: parse /usr/ports/UPDATING and generate JSON

INPUT_FILE = "/usr/ports/UPDATING"
OUTPUT_FILE = "UPDATING.json"

def parse_updating_file
  hash = { :updating => [] }
  date = affects = author = content = ''
  id = 0
  getcontent = false

  IO.foreach(INPUT_FILE) do |line|
    if line =~ /^\d{8}(:)/
      if !content.empty?
        hash[:updating] << { :id => id += 1, :date => date, :affects => affects, :author => author, :content => content }
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
  File.open(OUTPUT_FILE, "w") do |f|
    f.write(JSON.pretty_generate hash)
  end
end

if File.file?(INPUT_FILE)
  hash = parse_updating_file
  create_json(hash)
else
  puts "ERROR: " + INPUT_FILE + " was not found or is not a valid file."
end
