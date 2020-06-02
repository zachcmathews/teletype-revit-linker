const { CompositeDisposable, Emitter } = require('atom');
const fs = require('fs');
const url = require('url');
const Notifier = require('./notifier');

module.exports =
class TeletypeRevitLinker {
  constructor(options) {
    const {
      config,
      workspace,
      notificationManager,
      packageManager
    } = options;

    this.config = config;
    this.workspace = workspace;
    this.notificationManager = notificationManager;
    this.packageManager = packageManager;

    this.emitter = new Emitter();
    this.subscriptions = new CompositeDisposable();
    this.editors = new Set();
    this.notifier = new Notifier({ teletypeRevitLinker: this });

    if (!this.config.settings.core.uriHandlerRegistration === 'always') {
      this.emitter.emit('atom-not-registered-uri-handler');
    }
  }

  async activate() {
    await require('atom-package-deps').install('teletype-revit-linker');

    this.subscriptions.add(
      this.workspace.onDidAddTextEditor(editor => {
        if (editor.isRemote) this.addEditor(editor);
      })
    );
  }

  deactivate() {
    this.unlockFiles();
    this.notifier.deactivate();
    this.subscriptions.dispose();
  }

  consumeTeletype(teletypeService) {
    this.teletype = teletypeService.teletypePackage;
  }

  provideTeletypeRevitLinker() {
    return this;
  }

  async getTeletype(triesRemaining = 5) {
    if (this.teletype) return this.teletype;
    if (!triesRemaining) {
      this.emitter.emit('teletype-not-consumed');
      return null;
    }

    const packages = this.packageManager.getAvailablePackageNames();
    if (!packages.find(p => p === 'teletype')) {
      this.emitter.emit('teletype-not-installed');
      return null;
    }

    if (this.packageManager.isPackageDisabled('teletype')) {
      this.emitter.emit('teletype-disabled');
      return null;
    }

    if (!this.packageManager.isPackageActive('teletype')) {
      const teletypeDidActivate =
        await this.packageManager.activatePackage('teletype');

      if (!teletypeDidActivate) {
        this.emitter.emit('teletype-not-activated');
        return null;
      }
    }

    return new Promise(resolve => {
      setTimeout(async () => {
        resolve(await this.getTeletype(--triesRemaining));
      }, 500);
    });
  }

  async isSignedIn(triesRemaining = 5) {
    const teletype = await this.getTeletype();
    if (!teletype) return false;
    if (!triesRemaining) {
      this.emitter.emit('teletype-not-signed-in', teletype);
      return false;
    }

    if (await teletype.isSignedIn()) return true;

    return new Promise(resolve => {
      setTimeout(async () => {
        resolve(await this.isSignedIn(--triesRemaining));
      }, 500);
    });
  }

  async handleURI(parsedURI) {
    if (!await this.getTeletype()) return;
    if (!await this.isSignedIn()) return;

    if (parsedURI.pathname == '/new') this.sharePortal(parsedURI);
    else if (parsedURI.pathname == '/join') this.joinPortal(parsedURI);
  }

  async sharePortal(parsedURI) {
    const teletype = await this.getTeletype();
    const portal = await teletype.sharePortal();
    if (!portal) {
      this.emitter.emit('teletype-failed-share-portal');
      return;
    }

    const file = parsedURI.query.file;
    this.lockFile(file, portal, async (err) => {
      if (err) return;

      this.emitter.emit('shared-file', file);
      const editor = await this.workspace.open(file);
      this.addEditor(editor);
    });

    if (!this.subscribedToHostPortalChanges) {
      const manager = await teletype.getPortalBindingManager();
      this.subscriptions.add(
        manager.onDidChange(async () => {
          let affectedEditors = [];
          this.editors.forEach(editor => {
            if (!editor.isRemote) affectedEditors.push(editor);
          });

          if (!await manager.getHostPortalBinding()) {
            this.emitter.emit('closed-portal', affectedEditors);
          }
        })
      );
      this.subscribedToHostPortalChanges = true;
    }
  }

  async joinPortal(parsedURI) {
    const teletype = await this.getTeletype();
    const teletypeURI = parsedURI.query.teletypeURI;
    teletype.handleURI(url.parse(teletypeURI, true), teletypeURI);
  }

  lockFile(file, portal, cb) {
    const lockFile = file + '.lock';
    const uri =
      `atom://teletype-revit-linker/join?teletypeURI=${portal.delegate.uri}`;

    fs.writeFile(lockFile, uri, {flag: 'wx'}, (err) => {
      if (err) this.emitter.emit('failed-lock-file', {err, file});
      else this.emitter.emit('locked-file', file);
      cb(err);
    });
  }

  unlockFile(file, cb) {
    const lockFile = file + '.lock';
    fs.unlink(lockFile, (err) => {
      if (err) this.emitter.emit('failed-unlock-file', {err, file});
      else this.emitter.emit('unlocked-file', file);

      if (cb) cb(err);  // used for testing
    });
  }

  unlockFiles() {
    this.editors.forEach(editor => {
      if (!editor.isRemote) this.unlockFile(editor.getPath());
    });
  }

  addEditor(editor) {
    this.editors.add(editor);
    editor.setSoftTabs(false);
    editor.setSoftWrapped(true);

    const file = editor.getPath();
    const isRemote = editor.isRemote;
    this.subscriptions.add(
      editor.onDidDestroy(() => {
        if (!isRemote) this.unlockFile(file);
        this.editors.delete(editor);
      })
    );

    this.emitter.emit('added-editor', editor);
  }

  onAddedEditor(cb) {
    return this.emitter.on('added-editor', cb);
  }

  onSharedFile(cb) {
    return this.emitter.on('shared-file', cb);
  }

  onClosedPortal(cb) {
    return this.emitter.on('closed-portal', cb);
  }

  onLockedFile(cb) {
    return this.emitter.on('locked-file', cb);
  }

  onFailedToLockFile(cb) {
    return this.emitter.on('failed-lock-file', cb);
  }

  onUnlockedFile(cb) {
    return this.emitter.on('unlocked-file', cb);
  }

  onFailedToUnlockFile(cb) {
    return this.emitter.on('failed-unlock-file', cb);
  }

  onTeletypeNotInstalled(cb) {
    return this.emitter.on('teletype-not-installed', cb);
  }

  onTeletypeDisabled(cb) {
    return this.emitter.on('teletype-disabled', cb);
  }

  onTeletypeNotActivated(cb) {
    return this.emitter.on('teletype-not-activated', cb);
  }

  onTeletypeNotConsumed(cb) {
    return this.emitter.on('teletype-not-consumed', cb);
  }

  onTeletypeNotSignedIn(cb) {
    return this.emitter.on('teletype-not-signed-in', cb);
  }

  onTeletypeFailedToSharePortal(cb) {
    return this.emitter.on('teletype-failed-share-portal', cb);
  }

  onAtomNotRegisteredURIHandler(cb) {
    return this.emitter.on('atom-not-registered-uri-handler', cb);
  }
};
