# Teletype-Revit-Linker
Provides the interface between the Revit KeynotesRTC add-in and the Teletype
for Atom package. Allows real-time collaboration on Revit keynote files.

You can install this linker through the package manager in the Atom editor found under
Settings > Install. Make sure you have the teletype package installed and URI handling 
turned on as well.

You must turn on URI Handling in Settings > URI Handling > Register as default
atom:// protocol handler.

Since keynote files are tab delimited text files, I recommend the following
settings in Atom:
- Syntax Theme: One Light
- :heavy_check_mark: Settings > Editor > Show Invisibles
- :x: Settings > Editor > Soft Tabs
- :heavy_check_mark: Settings > Editor > Soft Wrap

As of now, the [KeynotesRTC add-in](https://github.com/zachcmathews/keynotesRTC)
for Revit must be installed manually.

Instructions for installation can be found in the
[KeynotesRTC add-in repository](https://github.com/zachcmathews/keynotesRTC).
