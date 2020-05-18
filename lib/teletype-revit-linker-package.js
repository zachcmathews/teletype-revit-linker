const { CompositeDisposable, Emitter } = require('atom');
const fs = require('fs');
const url = require('url');
const TeletypeRevitLinkerService = require('./teletype-revit-linker-service');
const Notifier = require('./notifier');

module.exports =
class TeletypeRevitLinkerPackage {
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
    this.notifier = new Notifier({ teletypeRevitLinkerPackage: this });

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
    this.subscriptions.dispose();
  }

  consumeTeletype(teletypeService) {
    this.teletype = teletypeService.teletypePackage;
  }

  provideTeletypeRevitLinker() {
    return new TeletypeRevitLinkerService(
      { teletypeRevitLinkerPackage: this }
    );
  }

  async getTeletype(triesRemaining = 5) {
    if (this.teletype) return this.teletype;
    if (!triesRemaining) {
      this.emitter.emit('teletype-not-consumed');
      return null;
    }

    if (!this.packageManager.isPackageLoaded('teletype')) {
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
    if (!teletype) return null;
    if (!triesRemaining) {
      this.emitter.emit('teletype-not-signed-in', teletype);
      return null;
    }

    const isSignedIn = await teletype.isSignedIn();
    if (!isSignedIn) {
      return new Promise(resolve => {
        setTimeout(async () => {
          resolve(await this.isSignedIn(--triesRemaining));
        }, 500);
      });
    }

    return isSignedIn;
  }

  handleURI(parsedURI) {
    if (parsedURI.pathname == '/new') this.sharePortal(parsedURI);
    else if (parsedURI.pathname == '/join') this.joinPortal(parsedURI);
  }

  async sharePortal(parsedURI) {
    const teletype = await this.getTeletype();
    if (!teletype) return;
    if (!await this.isSignedIn()) return;

    const portal = await teletype.sharePortal();
    if (!portal) {
      this.emitter.emit('teletype-failed-share-portal');
      return;
    }

    const file = parsedURI.query.file;
    const currentFileEditor =
      this.workspace.getTextEditors().find((editor) => {
        editor.getPath() === file;
      });
    if (currentFileEditor) {
      this.workspace.open(file, { searchAllPanes: true });
      return;
    }

    this.lockFile(file, portal, async (err) => {
      if (err) {
        this.emitter.emit('failed-lock-file', {err, file});
        return;
      }

      this.emitter.emit('shared-file', file);
      const editor = await this.workspace.open(file);
      this.addEditor(editor);
    });

    if (!this.hosting) {
      const manager = await teletype.getPortalBindingManager();
      manager.onDidChange(async () => {
        if (!await manager.getHostPortalBinding()) {
          this.hosting = false;

          let affectedEditors = [];
          this.editors.forEach(editor => {
            if (!editor.isRemote) affectedEditors.push(editor);
          });

          this.emitter.emit('closed-portal', affectedEditors);
        }
      });

      this.hosting = true;
    }
  }

  async joinPortal(parsedURI) {
    const teletype = await this.getTeletype();
    if (!teletype) return;
    if (!await this.isSignedIn()) return;

    const teletypeURI = parsedURI.query.teletypeURI;
    teletype.handleURI(url.parse(teletypeURI), teletypeURI);
  }

  lockFile(file, portal, cb) {
    const lockFile = file + '.lock';
    const uri =
      `atom://teletype-revit-linker/join?teletypeURI=${portal.delegate.uri}`;

    fs.writeFile(lockFile, uri, {flag: 'wx'}, (err) => {
      if (!err) this.emitter.emit('locked-file', file);
      cb(err);
    });
  }

  unlockFile(file) {
    const lockFile = file + '.lock';
    fs.unlink(lockFile, (err) => {
      if (err) {
        this.emitter.emit('failed-unlock-file', {err, file});
        return;
      }

      this.emitter.emit('unlocked-file', file);
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
    this.emitter.on('added-editor', cb);
    return this;
  }

  onSharedFile(cb) {
    this.emitter.on('shared-file', cb);
    return this;
  }

  onClosedPortal(cb) {
    this.emitter.on('closed-portal', cb);
    return this;
  }

  onLockedFile(cb) {
    this.emitter.on('locked-file', cb);
    return this;
  }

  onFailedToLockFile(cb) {
    this.emitter.on('failed-lock-file', cb);
    return this;
  }

  onUnlockedFile(cb) {
    this.emitter.on('unlocked-file', cb);
    return this;
  }

  onFailedToUnlockFile(cb) {
    this.emitter.on('failed-unlock-file', cb);
    return this;
  }

  onTeletypeNotInstalled(cb) {
    this.emitter.on('teletype-not-installed', cb);
    return this;
  }

  onTeletypeDisabled(cb) {
    this.emitter.on('teletype-disabled', cb);
    return this;
  }

  onTeletypeNotActivated(cb) {
    this.emitter.on('teletype-not-activated', cb);
    return this;
  }

  onTeletypeNotConsumed(cb) {
    this.emitter.on('teletype-not-consumed', cb);
    return this;
  }

  onTeletypeNotSignedIn(cb) {
    this.emitter.on('teletype-not-signed-in', cb);
    return this;
  }

  onTeletypeFailedToSharePortal(cb) {
    this.emitter.on('teletype-failed-share-portal', cb);
    return this;
  }

  onAtomNotRegisteredURIHandler(cb) {
    this.emitter.on('atom-not-registered-uri-handler', cb);
    return this;
  }
};