# Teletype-Revit-Linker
Provides the interface between the Revit KeynotesRTC add-in and the Teletype
for Atom package. Allows real-time collaboration on Revit keynote files.

You can install this linker through the package manager in the [Atom editor](https://atom.io/)
found under Settings > Install. Make sure you have the teletype package installed and URI 
handling turned on as well.

You must turn on URI Handling in Settings > URI Handling > Register as default
atom:// protocol handler.

You must create a token for Teletype to enable collaborative editing sessions by clicking
the telephone tower icon in the bottom right taskbar of Atom and following the instructions.
Luckily you can reuse the same account on different machines so everyone in your organization
will not have to create a Github account.

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
