'use babel';
/* global atom */

import { CompositeDisposable } from 'atom';
const fs = require('fs');
const url = require('url');
const path = require('path');

export default {
  lockFiles: new Set(),

  async activate() {
    this.subscriptions = new CompositeDisposable();
  },

  deactivate() {
    this.unlockFiles();
    this.activated = false;
    this.subscriptions.dispose();
  },

  consumeTeletype(teletypeService) {
    this.teletype = teletypeService.teletypePackage;
  },

  async getTeletype() {
    // Handle teletype not installed
    if (!atom.packages.isPackageLoaded('teletype')) {
      atom.notifications.addError(
        'You must install Teletype before using Teletype-Revit-Linker.',
        { dismissable: true }
      );

      this.deactivate();
      return null;
    }

    // Handle disabled teletype
    if (atom.packages.isPackageDisabled('teletype')) {
      atom.notifications.addError(
        'You must enable Teletype before using Teletype-Revit-Linker.',
        { dismissable: true }
      );

      this.deactivate();
      return null;
    }

    // Handle inactive teletype
    if (!atom.packages.isPackageActive('teletype')) {
      const teletypePromise = atom.packages.activatePackage('teletype');
      if (!await teletypePromise) {
        atom.notifications.addError(
          'Could not activate Teletype package.',
          { dismissable: true }
        );

        this.deactivate();
        return null;
      }
    }

    if (!this.teletype) {
      atom.notifications.addError(
        'Could not consume Teletype service.',
        { dismissable: true }
      );

      this.deactivate();
      return null;
    }

    return this.teletype;
  },

  async handleURI(parsedURI) {
    // Do this everytime in case something changes
    const teletype = await this.getTeletype();
    if (!teletype) return;

    if (!await teletype.isSignedIn()) {
      atom.notifications.addError(
        'You must sign in to Teletype before collaborating on keynotes.',
        { dismissable: true }
      );
      atom.notifications.addError(
        'Use the Revit \'Edit Keynotes\' button to start collaborating.',
        { dismissable: true }
      );

      teletype.showPopover();
      this.deactivate();
      return;
    }

    if (parsedURI.pathname == '/new') this.sharePortal(parsedURI);
    else if (parsedURI.pathname == '/join') this.joinPortal(parsedURI);
  },

  async sharePortal(parsedURI) {
    const file = parsedURI.query.file;
    const teletype = await this.getTeletype();
    if (!teletype) return;

    const manager = await teletype.getPortalBindingManager();
    const hostPortalBinding = await manager.getHostPortalBinding();
    const portal = await teletype.sharePortal();

    // Initializate and inform user
    if (portal && !this.activated) {
      this.activated = true;
      atom.notifications.addSuccess('You are now collaborating.');
    }

    // Lock file
    if (portal) {
      // This will fail if lock file already exists
      try {
        this.createLock(file, portal, async (lockFile) => {
          // Create new editor
          const editor =
            await atom.workspace.open(file, { searchAllPanes: true });

          // Handle closing of editor
          this.subscriptions.add(
            editor.onDidDestroy(() => this.unlockFile(lockFile))
          );
        });
      }
      // Notify user why their file isn't opening
      catch (err) {
        atom.notifications.addError(
          `Could not create lock for ${file}. `
          + 'It may have already been opened. Try again!',
          { dismissable: true }
        );
        console.error(err);
      }
    }

    // Handle teletype disconnecting
    manager.onDidChange(() => {
      if (!hostPortalBinding && this.activated) {
        this.handleClosedPortal();
      }
    });
  },

  async joinPortal(parsedURI) {
    const teletype = await this.getTeletype();
    if (!teletype) return;

    const teletypeURI = parsedURI.query.teletypeURI;
    teletype.handleURI(url.parse(teletypeURI), teletypeURI);
  },

  handleClosedPortal() {
    atom.notifications.addError(
      'You are no longer collaborating on keynotes. Any additional \
      changes you make to the file may be lost.',
      { dismissable: true }
    );
    atom.notifications.addError(
      'Use the Revit \'Edit Keynotes\' button to start collaborating.',
      { dismissable: true }
    );

    this.deactivate();
  },

  createLock(file, portal, cb) {
    const lockFile = file + '.lock';
    const uri =
      `atom://teletype-revit-linker/join?teletypeURI=${portal.delegate.uri}`;

    fs.open(lockFile, 'w', (err, fd) => {
      if (err && err.code === 'EEXIST') throw err;
      fs.write(fd, uri, (err) => {
        if (err) throw err;

        this.lockFiles.add(lockFile);
        console.info('Lock file created: ' + lockFile);

        cb(lockFile);
      });
    });
  },

  unlockFiles() {
    this.lockFiles.forEach(lockFile => this.unlockFile(lockFile));
  },

  unlockFile(lockFile) {
    fs.unlink(lockFile, (err) => {
      if (err) {
        atom.notifications.addError(
          'Failed to release lock on ' + path.basename(lockFile, '.lock'),
          { dismissable: true }
        );
        console.error(err);
      }
      else {
        this.lockFiles.delete(lockFile);
        console.info('Lock file deleted: ' + lockFile);
      }
    });
  }
};
