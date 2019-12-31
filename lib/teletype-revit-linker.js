'use babel';

import { CompositeDisposable } from 'atom';
const fs = require('fs');

export default {
  subscriptions: null,
  portal: null,
  files: new Set(),

  activate() {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();
  },

  deactivate() {
    this.files.forEach(file => {
      fs.unlinkSync(file);
    });

    this.subscriptions.dispose();
  },

  async handleURI(parsedURI) {
    atom.workspace.open(parsedURI.query.file, {searchAllPanes: true});

    // Open a portal if there isn't one open
    if (!this.portal) {
      if (await this.teletypePackage.isSignedIn()) {
        this.sharePortal();
      } else {
        const authenticationProvider = await this.teletypePackage.getAuthenticationProvider();
        authenticationProvider.onDidChange(() => {
          if (authenticationProvider.isSignedIn() && !this.portal) {
            this.portal = 'creating';
            this.sharePortal();
          }
        });
      }
    }
  },

  consumeTeletype(teletypeService) {
    this.teletypePackage = teletypeService.teletypePackage;
  },

  async sharePortal() {
    // Share portal using teletype
    if (this.portal = await this.teletypePackage.sharePortal()) {
      // Start listening for editors to open
      this.subscriptions.add(atom.workspace.observeTextEditors((editor) => {

        const path = editor.getPath();
        const dir = path.substring(0, path.lastIndexOf('\\')+1);
        const fileName = path.split('\\').pop();
        const lockFile = dir + '\.' + fileName + '.lock';
        fs.writeFile(lockFile, this.portal.delegate.uri, (err) => {
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
    } else {
      this.portal = null;
      alert("Could not start teletype to share keynote files. You're working in local only mode.\nIf you continue and others write to the file, you will lose work.");
    }
  }
};
