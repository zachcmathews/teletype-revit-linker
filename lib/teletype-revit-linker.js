'use babel';

import { CompositeDisposable } from 'atom';
const fs = require('fs');
const url = require('url');

export default {
  files: new Set(),
  portal: null,

  activate() {
    this.subscriptions = new CompositeDisposable();
  },
  deactivate() {
    this.destroyLockFiles();
    this.subscriptions.dispose();
  },
  consumeTeletype(teletypeService) {
    this.teletype = teletypeService.teletypePackage;
  },

  async handleURI(parsedURI, rawURI) {
    if (await this.teletype.signInUsingSavedToken()) {
      if (parsedURI.pathname == '/new') {
        atom.workspace.open(parsedURI.query.file, {searchAllPanes: true});

        const manager = await this.teletype.getPortalBindingManager();
        const hostPortalBinding = await manager.getHostPortalBinding();
        this.portal = await this.teletype.sharePortal();
        if (this.portal && !this.activated) {
          this.activated = true;
          this.createLockFiles();
          atom.notifications.addSuccess('You are now collaborating.');
        }

        manager.onDidChange(async () => {
          const manager = await this.teletype.getPortalBindingManager();
          const hostPortalBinding = await manager.getHostPortalBinding();
          if (!hostPortalBinding && this.activated) {
            this.activated = false;
            atom.notifications.addError('You are no longer collaborating on keynotes. Any additional changes you make to the file may be lost.', {dismissable: true});
            atom.notifications.addError('Use the Revit \'Edit Keynotes\' button to start collaborating.', {dismissable: true});
            this.deactivate();
          }
        });
      }
      else if (parsedURI.pathname == '/join') {
        teletypeURI = parsedURI.query.teletypeURI;
        this.teletype.handleURI(url.parse(teletypeURI), teletypeURI);
      }
    }
    else {
      atom.notifications.addError('You must sign in to Teletype before collaborating on keynotes.', {dismissable: true});
      atom.notifications.addError('Use the Revit \'Edit Keynotes\' button to start collaborating.', {dismissable: true});
      this.teletype.showPopover();
      this.deactivate();
    }
  },

  async createLockFiles() {
    this.subscriptions.add(atom.workspace.observeTextEditors((editor) => {
      if (!this.activated) return;

      const path = editor.getPath();
      const dir = path.substring(0, path.lastIndexOf('\\')+1);
      const fileName = path.split('\\').pop();
      const lockFile = dir + fileName + '.lock';
      const uri = 'atom://teletype-revit-linker/join?teletypeURI=' + this.portal.delegate.uri;
      fs.writeFile(lockFile, uri, (err) => {
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
  async destroyLockFiles() {
    this.files.forEach(lockFile => {
      fs.unlink(lockFile, (err) => {
        (err) ? console.error(err) : console.info('Lock file deleted: ' + lockFile);
        this.files.delete(lockFile);
      });
    });
  }
};
