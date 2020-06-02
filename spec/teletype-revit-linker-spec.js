/* eslint no-undef: off */
const fs = require('fs');
const path = require('path');
const url = require('url');
const TeletypePackage = require('./mock-teletype');
const TeletypeRevitLinker = require('./mock-teletype-revit-linker');
const NOOP = () => {};

describe('TeletypeRevitLinkerPackage', () => {

  describe('activate', () => {
    let teletypeRevitLinker;
    beforeEach(() => {
      teletypeRevitLinker = TeletypeRevitLinker();
    });

    it('requires atom-package-deps', async () => {
      const atom_package_deps = require('atom-package-deps');
      const installSpy = spyOn(atom_package_deps, 'install');
      await teletypeRevitLinker.activate();
      expect(installSpy).toHaveBeenCalledWith('teletype-revit-linker');
    });

    it('adds subscription to onDidAddTextEditor', async () => {
      const atom_package_deps = require('atom-package-deps');
      spyOn(atom_package_deps, 'install');  // silence console.error

      const onDidAddTextEditorSpy = spyOn(
        teletypeRevitLinker.workspace, 'onDidAddTextEditor'
      ).andCallThrough();

      await teletypeRevitLinker.activate();
      expect(onDidAddTextEditorSpy).toHaveBeenCalled();
      expect(teletypeRevitLinker.subscriptions.disposables.size).toBe(1);
    });

    afterEach(() => {
      teletypeRevitLinker.deactivate();
    });
  });

  describe('deactivate', () => {
    let teletypeRevitLinker;
    beforeEach(async () => {
      teletypeRevitLinker = TeletypeRevitLinker();
      const atom_package_deps = require('atom-package-deps');
      spyOn(atom_package_deps, 'install');  // silence console.error
      await teletypeRevitLinker.activate();
    });

    it('unlocks files', () => {
      const unlockFilesSpy = spyOn(teletypeRevitLinker, 'unlockFiles');
      teletypeRevitLinker.deactivate();
      expect(unlockFilesSpy).toHaveBeenCalled();
    });

    it('deactivates notifier', () => {
      const deactivateSpy = spyOn(teletypeRevitLinker.notifier, 'deactivate');
      teletypeRevitLinker.deactivate();
      expect(deactivateSpy).toHaveBeenCalled();
    });

    it('disposes of subscriptions', () => {
      teletypeRevitLinker.deactivate();
      expect(teletypeRevitLinker.subscriptions.disposed).toBe(true);
    });
  });

  describe('consumeTeletype', () => {
    beforeEach(() => {
      teletypeRevitLinker = TeletypeRevitLinker();
    });

    it('consumes teletype', () => {
      const teletypeService = {
        teletypePackage: new TeletypePackage()
      };

      teletypeRevitLinker.consumeTeletype(teletypeService);
      expect(teletypeRevitLinker.teletype)
        .toBe(teletypeService.teletypePackage);
    });
  });

  describe('provideTeletypeRevitLinker', () => {
    beforeEach(() => {
      teletypeRevitLinker = TeletypeRevitLinker();
    });

    it('provides teletype-revit-linker', () => {
      expect(
        teletypeRevitLinker.provideTeletypeRevitLinker()
      ).toBe(teletypeRevitLinker);
    });
  });

  describe('getTeletype', () => {
    beforeEach(() => {
      teletypeRevitLinker = TeletypeRevitLinker();
    });

    describe('success', () => {
      it('returns teletype if consumed', async () => {
        teletypeRevitLinker.teletype = 'mock';
        const teletype = await teletypeRevitLinker.getTeletype();
        expect(teletype).toBe('mock');
      });
    });

    describe('failure', () => {
      it('emits teletype-not-installed appropriately', async () => {
        const emitSpy = spyOn(teletypeRevitLinker.emitter, 'emit');

        await teletypeRevitLinker.getTeletype();
        expect(emitSpy).toHaveBeenCalledWith('teletype-not-installed');
      });

      it('emits teletype-disabled appropriately', async () => {
        teletypeRevitLinker.packageManager.getAvailablePackageNames = () => {
          return ['teletype'];
        };
        teletypeRevitLinker.packageManager.isPackageDisabled = () => true;
        const emitSpy = spyOn(teletypeRevitLinker.emitter, 'emit');

        await teletypeRevitLinker.getTeletype();
        expect(emitSpy).toHaveBeenCalledWith('teletype-disabled');
      });

      it('emits teletype-not-activated appropriately', async () => {
        teletypeRevitLinker.packageManager.getAvailablePackageNames = () => {
          return ['teletype'];
        };
        teletypeRevitLinker.packageManager.isPackageDisabled = () => false;
        teletypeRevitLinker.packageManager.isPackageActive = () => false;
        teletypeRevitLinker.packageManager.activatePackage = () => false;

        const emitSpy = spyOn(teletypeRevitLinker.emitter, 'emit');

        await teletypeRevitLinker.getTeletype();
        expect(emitSpy).toHaveBeenCalledWith('teletype-not-activated');
      });
    });
  });

  describe('isSignedIn', () => {
    beforeEach(() => {
      teletypeRevitLinker = TeletypeRevitLinker();
    });

    describe('success', () => {
      it('returns true', async () => {
        teletypeRevitLinker.teletype = new TeletypePackage();
        teletypeRevitLinker.teletype.isSignedIn = () => true;

        jasmine.useRealClock.apply(setTimeout);
        const isSignedIn = await teletypeRevitLinker.isSignedIn();
        expect(isSignedIn).toBe(true);
      });
    });

    describe('failure', () => {
      it('returns false if teletype isnt working', async () => {
        const isSignedIn = await teletypeRevitLinker.isSignedIn();
        expect(isSignedIn).toBe(false);
      });

      it('returns false if not signed in', async () => {
        teletypeRevitLinker.teletype = new TeletypePackage();
        teletypeRevitLinker.teletype.isSignedIn = () => false;
        spyOn(teletypeRevitLinker.emitter, 'emit'); // silence cb error

        jasmine.useRealClock.apply(setTimeout);
        const isSignedIn = await teletypeRevitLinker.isSignedIn();
        expect(isSignedIn).toBe(false);
      });

      it('emits teletype-not-signed-in', async () => {
        teletypeRevitLinker.teletype = new TeletypePackage();
        teletypeRevitLinker.teletype.isSignedIn = () => false;
        const emitSpy = spyOn(teletypeRevitLinker.emitter, 'emit');

        jasmine.useRealClock.apply(setTimeout);
        await teletypeRevitLinker.isSignedIn();
        expect(emitSpy).toHaveBeenCalledWith(
          'teletype-not-signed-in', teletypeRevitLinker.teletype
        );
      });
    });
  });

  describe('handleURI', () => {
    beforeEach(() => {
      teletypeRevitLinker = TeletypeRevitLinker();
    });

    it('returns without error if no teletype', async () => {
      const newUri = `atom://teletype-revit-linker/new?file=file.txt`;
      const value =
        await teletypeRevitLinker.handleURI(url.parse(newUri, true));

      expect(value).toBeUndefined();
    });

    it('returns without error if not signed in', async () => {
      teletypeRevitLinker.teletype = new TeletypePackage();
      teletypeRevitLinker.isSignedIn = () => false;

      const newUri = `atom://teletype-revit-linker/new?file=file.txt`;
      const value =
        await teletypeRevitLinker.handleURI(url.parse(newUri, true));

      expect(value).toBeUndefined();
    });

    it('calls sharePortal for path /new', async () => {
      teletypeRevitLinker.teletype = new TeletypePackage();
      teletypeRevitLinker.isSignedIn = () => true;

      const newUri = 'atom://teletype-revit-linker/new?file=file.txt';
      const sharePortalSpy = spyOn(teletypeRevitLinker, 'sharePortal');
      await teletypeRevitLinker.handleURI(url.parse(newUri, true));
      expect(sharePortalSpy).toHaveBeenCalledWith(url.parse(newUri, true));
    });

    it('calls joinPortal for path /join', async () => {
      teletypeRevitLinker.teletype = new TeletypePackage();
      teletypeRevitLinker.isSignedIn = () => true;

      const joinUri = 'atom://teletype-revit-linker/join?teletypeURI=uri';
      const joinPortalSpy = spyOn(teletypeRevitLinker, 'joinPortal');
      await teletypeRevitLinker.handleURI(url.parse(joinUri, true));
      expect(joinPortalSpy).toHaveBeenCalledWith(url.parse(joinUri, true));
    });
  });

  describe('sharePortal', () => {
    const file = path.join(__dirname, 'test.txt');
    const lockFile = file + '.lock';

    describe('success', () => {
      beforeEach(() => {
        teletypeRevitLinker = TeletypeRevitLinker();
      });

      it('locks the file', async () => {
        teletypeRevitLinker.teletype = new TeletypePackage();
        const lockFileSpy = spyOn(teletypeRevitLinker, 'lockFile');
        spyOn(teletypeRevitLinker.emitter, 'emit'); // silence cb error

        const newUri = `atom://teletype-revit-linker/new?file=${file}`;
        await teletypeRevitLinker.sharePortal(url.parse(newUri, true));
        expect(lockFileSpy).toHaveBeenCalled();
      });

      it('emits shared-file', async () => {
        teletypeRevitLinker.teletype = new TeletypePackage();
        const emitSpy = spyOn(teletypeRevitLinker.emitter, 'emit');

        const newUri = `atom://teletype-revit-linker/new?file=${file}`;
        await teletypeRevitLinker.sharePortal(url.parse(newUri, true));

        waitsFor(() => {
          return teletypeRevitLinker.editors.size === 1;
        }, 'shared file editor to open', 500);

        runs(() => {
          expect(emitSpy).toHaveBeenCalledWith('shared-file', file);
          fs.unlinkSync(lockFile);
        });
      });

      it('subscribes to host portal changes', async () => {
        teletypeRevitLinker.teletype = new TeletypePackage();
        spyOn(teletypeRevitLinker.emitter, 'emit'); // silence cb error
        const manager = teletypeRevitLinker.teletype.getPortalBindingManager();
        const managerOnDidChangeSpy = spyOn(
          manager, 'onDidChange'
        ).andCallThrough();

        const newUri = `atom://teletype-revit-linker/new?file=${file}`;
        await teletypeRevitLinker.sharePortal(url.parse(newUri, true));
        expect(managerOnDidChangeSpy).toHaveBeenCalled();

        waitsFor(() => {
          return teletypeRevitLinker.editors.size === 1;
        }, 'shared file editor to open', 500);

        runs(() => {
          fs.unlinkSync(lockFile);
        });
      });
    });
  });

  describe('joinPortal', () => {
    beforeEach(() => {
      teletypeRevitLinker = TeletypeRevitLinker();
    });

    it('calls teletype.handleURI with appropriate args', async () => {
      teletypeRevitLinker.teletype = new TeletypePackage();
      const handleURISpy =
        spyOn(teletypeRevitLinker.teletype, 'handleURI');

      const teletypeURI = 'atom://teletype/test';
      const parsedTeletypeURI = url.parse(teletypeURI, true);
      const newUri =
        `atom://teletype-revit-linker/join?teletypeURI=${teletypeURI}`;

      await teletypeRevitLinker.joinPortal(url.parse(newUri, true));

      expect(
        handleURISpy
      ).toHaveBeenCalledWith(parsedTeletypeURI, teletypeURI);
    });
  });

  describe('lockFile', () => {
    const file = path.join(__dirname, 'test.txt');
    const lockFile = file + '.lock';

    beforeEach(() => {
      teletypeRevitLinker = TeletypeRevitLinker();
      teletypeRevitLinker.teletype = new TeletypePackage();
    });

    describe('success', () => {
      it('creates a lock file', () => {
        const portal = teletypeRevitLinker.teletype.sharePortal();

        let completed = false;
        teletypeRevitLinker.lockFile(file, portal, () => {
          completed = true;
        });
        waitsFor(() => completed, 'lockFile cb to be called', 500);

        runs(() => {
          expect(fs.existsSync(lockFile)).toBe(true);
        });
      });

      it('emits locked-file', () => {
        const portal = teletypeRevitLinker.teletype.sharePortal();
        const emitSpy = spyOn(teletypeRevitLinker.emitter, 'emit');

        let completed = false;
        teletypeRevitLinker.lockFile(file, portal, () => {
          completed = true;
        });
        waitsFor(() => completed, 'lockFile cb to be called', 500);

        runs(() => {
          expect(emitSpy).toHaveBeenCalledWith('locked-file', file);
        });
      });

      afterEach(() => {
        fs.unlinkSync(lockFile);
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        fs.writeFileSync(lockFile, 'test', {flag: 'wx'});
      });

      it('fails if lockfile already exists', () => {
        const portal = teletypeRevitLinker.teletype.sharePortal();
        spyOn(teletypeRevitLinker.emitter, 'emit'); // silence cb error

        let completed = false;
        teletypeRevitLinker.lockFile(file, portal, (err) => {
          expect(err.code).toBe('EEXIST');
          completed = true;
        });
        waitsFor(() => completed, 'lockFile cb to be called', 500);
      });

      it('emits failed-lock-file', () => {
        const portal = teletypeRevitLinker.teletype.sharePortal();
        const emitSpy = spyOn(teletypeRevitLinker.emitter, 'emit');
        let completed = false;
        teletypeRevitLinker.lockFile(file, portal, (err) => {
          expect(emitSpy).toHaveBeenCalledWith(
            'failed-lock-file', {'err': err, 'file': file}
          );
          completed = true;
        });
        waitsFor(() => completed, 'lockFile cb to be called', 500);
      });

      afterEach(() => {
        fs.unlinkSync(lockFile);
      });
    });
  });

  describe('unlockFile', () => {
    const file = path.join(__dirname, 'test.txt');
    const lockFile = file + '.lock';

    beforeEach(() => {
      teletypeRevitLinker = TeletypeRevitLinker();
    });

    describe('success', () => {
      beforeEach(() => {
        fs.writeFileSync(lockFile, 'test', {flag: 'wx'});
      });

      it('deletes a lock file', () => {
        let completed = false;
        teletypeRevitLinker.unlockFile(file, () => {
          completed = true;
        });
        waitsFor(() => completed, 'unlockFile cb to be called', 500);
        waitsFor(() => !fs.existsSync(lockFile), 'file to be unlocked', 500);
      });

      it('emits unlocked-file', () => {
        const emitSpy = spyOn(teletypeRevitLinker.emitter, 'emit');
        let completed = false;
        teletypeRevitLinker.unlockFile(file, () => {
          expect(emitSpy).toHaveBeenCalledWith('unlocked-file', file);
          completed = true;
        });
        waitsFor(() => completed, 'unlockFile cb to be called', 500);
        runs(() => {
          expect(fs.existsSync(lockFile)).toBe(false);
        });
      });
    });

    describe('failure', () => {
      it('emits failed-unlock-file', () => {
        const emitSpy = spyOn(teletypeRevitLinker.emitter, 'emit');
        const dir = path.join(__dirname, '/dummy/');
        let completed = false;
        teletypeRevitLinker.unlockFile(dir, (err) => {
          expect(emitSpy).toHaveBeenCalledWith(
            'failed-unlock-file', {'err': err, 'file': dir}
          );
          completed = true;
        });
        waitsFor(() => completed, 'unlockFile cb to be called', 500);
      });
    });
  });

  describe('unlockFiles', () => {
    const filenames = ['test.txt', 'test2.txt', 'test3.txt', 'test4.txt'];
    let files = [];
    let lockFiles = [];
    for (let filename of filenames) {
      const file = path.join(__dirname, filename);
      files.push(file);

      const lockFile = file + '.lock';
      lockFiles.push(lockFile);
    }

    beforeEach(() => {
      teletypeRevitLinker = TeletypeRevitLinker();
      teletypeRevitLinker.teletype = new TeletypePackage();

      for (let file of files) {
        const editor = {
          isRemote: false,
          getPath: () => file
        };
        teletypeRevitLinker.editors.add(editor);
      }

      for (let lockFile of lockFiles) {
        fs.writeFileSync(lockFile, 'test', {flag: 'wx'});
      }
    });

    it('deletes all created lock files', () => {
      spyOn(teletypeRevitLinker.emitter, 'emit'); // silence cb error

      waitsFor(() => {
        return lockFiles.every(f => fs.existsSync(f));
      }, 'lockfiles to exist', 500);

      runs(() => teletypeRevitLinker.unlockFiles());

      waitsFor(() => {
        return lockFiles.every(f => !fs.existsSync(f));
      }, 'lockfiles to be deleted', 500);
    });
  });

  describe('addEditor', () => {
    const editor = {
      isRemote: false,
      getPath: () => 'test',
      setSoftTabs: (v) => v,
      setSoftWrapped: (v) => v,
      onDidDestroy: () => {
        return {
          dispose: NOOP
        };
      }
    };

    beforeEach(() => {
      teletypeRevitLinker = TeletypeRevitLinker();
    });

    it('adds an editor to the tracked set', () => {
      teletypeRevitLinker.addEditor(editor);
      expect(teletypeRevitLinker.editors.has(editor)).toBe(true);
    });

    it('sets appropriate editor settings', () => {
      const setSoftTabsSpy = spyOn(editor, 'setSoftTabs');
      const setSoftWrappedSpy = spyOn(editor, 'setSoftWrapped');

      teletypeRevitLinker.addEditor(editor);
      expect(setSoftTabsSpy).toHaveBeenCalledWith(false);
      expect(setSoftWrappedSpy).toHaveBeenCalledWith(true);
    });

    it('emits added-editor', () => {
      const emitSpy = spyOn(teletypeRevitLinker.emitter, 'emit');
      teletypeRevitLinker.addEditor(editor);
      expect(emitSpy).toHaveBeenCalledWith('added-editor', editor);
    });
  });
});
