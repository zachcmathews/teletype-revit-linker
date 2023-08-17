# Teletype-Revit-Linker
Provides the interface between pyRevitBoost's **Edit Keynotes** command 
and the Teletype for Atom package.

## Installation
1. Install [pyRevit](https://github.com/eirannejad/pyRevit/releases).
1. Install [pyRevitBoost](http://zacharymathews.com/pyRevitBoost).
    - Download [here](https://github.com/zachcmathews/pyRevitBoost/archive/master.zip).
    - Extract into an appropriate location.
    - Then, follow the instructions [here](https://www.notion.so/Install-Extensions-0753ab78c0ce46149f962acc50892491) 
    for adding a pyRevit extension manually.
1. Download and extract [Atom](https://github.com/atom/atom/releases/download/v1.60.0/atom-windows.zip) to suitable location.
1. Run Atom/atom.exe at extracted location.
1. Enable URI handling.
    - `Settings → URI Handling → Register as default atom:// protocol handler`
1. Enable Show Invisibles.
    - `Settings → Editor → Show Invisibles`
1. Disable Soft Tabs.
    - `Settings → Editor → Soft Tabs`
1. Set Tab Type to hard.
    - `Settings → Editor → Tab Type`
1. Create .atom directory in same directory as Atom directory.
1. Create packages directory in .atom directory.
1. Download [Teletype for Atom](https://github.com/atom/teletype/archive/refs/tags/v0.13.3.zip) and extract in packages directory.
1. Download [teletype-revit-linker](https://github.com/zachcmathews/teletype-revit-linker/archive/refs/tags/v1.0.0.zip) and extract in packages directory.
1. Run **Edit Keynotes** from a project document.

# :heavy_exclamation_mark::heavy_exclamation_mark: Update 2023 :heavy_exclamation_mark::heavy_exclamation_mark:
The original Teletype server was sunset along with the Atom text editor on December 15, 2022. I have set up a server for personal
use at [https://teletype.zacharymathews.com](https://teletype.zacharymathews.com). Feel free to use it. See instructions below:

Make the following changes to File > Settings > Packages > teletype > Settings > Development Settings:

- API server base URL: https://teletype.zacharymathews.com
- Pusher service key: 3a582d9d72f0ad8fc640
- Pusher cluster name: us2

Generate the token:

1. Navigate your web browser to https://teletype.zacharymathews.com/auth/github/.
1. You will be redirected to a GitHub sign in page.
1. Sign in and authorize the Teletype application.
1. You will be redirected to https://teletype.zacharymathews.com/auth/github/callback?code=CODE where your OAuth token is given. 

Restart Atom.

Click the Telephone tower icon in the bottom right, and it will ask for the OAuth token.
