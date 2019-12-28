'use babel';

import { CompositeDisposable } from 'atom';
const fs = require('fs');
const url = require('url');

export default {
  subscriptions: null,
  portal: null,
  files: new Set(),

  activate() {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'teletype-revit-linker:test': () => this.test()
    }));
  },

  deactivate() {
    this.files.forEach(file => {
      fs.unlinkSync(file);
    });

    this.subscriptions.dispose();
  },

  async handleURI(parsedURI) {
    if (parsedURI.pathname === '/new') {
      // Open the file if it's not already open
      atom.workspace.open(parsedURI.query.file, {searchAllPanes: true});

      // Open a portal if there isn't one open
      if (!this.portal) {
        this.sharePortal();
      }
    }
    else {
      // If ends in portal id, join the portal using teletype
      const teletypeURI = parsedURI.protocol + '//teletype' + parsedURI.pathname;
      const teletypeParsedURI = url.parse(teletypeURI, true);
      this.joinPortal(teletypeParsedURI);
    }
  },

  consumeTeletype(teletypeService) {
    this.teletypePackage = teletypeService.teletypePackage;
  },

  async sharePortal() {
    // Create a portal with teletype
    this.portal = await this.teletypePackage.sharePortal();
    this.portal.uri = 'atom://teletype/portal/' + this.portal.id;

    // Start listening for editors to open
    this.subscriptions.add(atom.workspace.observeTextEditors((editor) => {

      const path = editor.getPath();
      const dir = path.substring(0, path.lastIndexOf('\\')+1);
      const fileName = path.split('\\').pop();
      const lockFile = dir + '\.' + fileName + '.lock';
      fs.writeFile(lockFile, this.portal.uri, (err) => {
        (err) ? console.error(err) : console.info('Lock file created: ' + lockFile);
        this.files.add(lockFile);

        // When editor is destroyed delete the lock file
        this.subscriptions.add(editor.onDidDestroy(() => {
          fs.unlink(lockFile, (err) => {
            (err) ? console.error(err) : console.info('Lock file deleted: ' + lockFile);
            this.files.delete(lockFile);
          });
        }));
      });

    }));
  },

  joinPortal(teletypeParsedURI) {
    teletypePackage.handleURI(teletypeParsedURI);
  }
};
