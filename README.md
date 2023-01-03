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
1. Install [Atom](https://atom.io/).
1. Enable URI handling.
    - `Settings → URI Handling → Register as default atom:// protocol handler`
1. Install [Teletype for Atom](https://atom.io/packages/teletype).
1. Install [teletype-revit-linker](https://atom.io/packages/teletype-revit-linker).
1. Run **Edit Keynotes** from a project document.

# :heavy_exclamation_mark::heavy_exclamation_mark: Update 2023 :heavy_exclamation_mark::heavy_exclamation_mark:
The original Teletype server was sunset along with the Atom text editor on December 15, 2022. I have set up a server for personal
use at [https://teletype.zacharymathews.com](https://teletype.zacharymathews.com). Feel free to use it. See instructions below:

Make the following changes to File > Settings > Packages > teletype > Settings > Development Settings:

    API server base URL: https://teletype.zacharymathews.com
    Pusher service key: 3a582d9d72f0ad8fc640
    Pusher cluster name: us2

Generate the token:

    Navigate your web browser to [https://teletype.zacharymathews.com/auth/github/](https://teletype.zacharymathews.com/auth/github/).
    You will be redirected to a GitHub sign in page.
    Sign in and authorize the Teletype application.
    You will be redirected to [https://teletype.zacharymathews.com/auth/github/callback?code=CODE](https://teletype.zacharymathews.com/auth/github/callback?code=CODE) where your OAuth token is given. 

Restart Atom.
Click the Telephone tower icon in the bottom right, and it will ask for the OAuth token.
