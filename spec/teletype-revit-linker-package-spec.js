/* eslint no-undef: off */
const url = require('url');
const TeletypePackage = require('./mock-teletype');
const TeletypeRevitLinkerPackage =
  require('../lib/teletype-revit-linker-package');

describe('teletype-revit-linker-package', () => {
  atom.config.settings = atom.config.defaultSettings;

  let teletypeRevitLinkerPackage;
  const makeNewPackage = () => {
    teletypeRevitLinkerPackage = new TeletypeRevitLinkerPackage({
      config: atom.config,
      workspace: atom.workspace,
      notificationManager: atom.notifications,
      packageManager: atom.packages
    });
  };

  describe('activate', () => {
    beforeEach(async () => {
      makeNewPackage();
      await teletypeRevitLinkerPackage.activate();
    });

    it('adds subscription to onDidAddTextEditor', () => {
      expect(
        teletypeRevitLinkerPackage.subscriptions.disposables.size
      ).toBe(1);
    });

    afterEach(() => {
      teletypeRevitLinkerPackage.deactivate();
    });
  });

  describe('getTeletype', () => {
    beforeEach(async () => {
      makeNewPackage();
      await teletypeRevitLinkerPackage.activate();
    });

    it('returns teletype if consumed', async () => {
      teletypeRevitLinkerPackage.teletype = 'mock';
      const teletype = await teletypeRevitLinkerPackage.getTeletype();
      expect(teletype).toBe('mock');
    });

    it('emits teletype-not-installed appropriately', async () => {
      const emitSpy = spyOn(teletypeRevitLinkerPackage.emitter, 'emit');
      await teletypeRevitLinkerPackage.getTeletype();
      expect(emitSpy).toHaveBeenCalledWith('teletype-not-installed');
    });

    afterEach(() => {
      teletypeRevitLinkerPackage.deactivate();
    });
  });

  describe('isSignedIn', () => {
    beforeEach(async () => {
      makeNewPackage();
      await teletypeRevitLinkerPackage.activate();
    });

    it('returns null if teletype isnt working', async () => {
      const isSignedIn = await teletypeRevitLinkerPackage.isSignedIn();
      expect(isSignedIn).toBeNull();
    });

    afterEach(() => {
      teletypeRevitLinkerPackage.deactivate();
    });
  });

  describe('handleURI', () => {
    beforeEach(async () => {
      makeNewPackage();
      await teletypeRevitLinkerPackage.activate();
    });

    it('calls sharePortal for path /new', () => {
      const newUri = 'atom://teletype-revit-linker/new?file=file.txt';
      const sharePortalSpy = spyOn(teletypeRevitLinkerPackage, 'sharePortal');
      teletypeRevitLinkerPackage.handleURI(url.parse(newUri, true));
      expect(sharePortalSpy).toHaveBeenCalled();
    });

    it('calls joinPortal for path /join', () => {
      const joinUri = 'atom://teletype-revit-linker/join?teletypeURI=uri';
      const joinPortalSpy = spyOn(teletypeRevitLinkerPackage, 'joinPortal');
      teletypeRevitLinkerPackage.handleURI(url.parse(joinUri, true));
      expect(joinPortalSpy).toHaveBeenCalled();
    });

    afterEach(() => {
      teletypeRevitLinkerPackage.deactivate();
    });
  });

  describe('sharePortal', () => {
    beforeEach(async () => {
      makeNewPackage();
      await teletypeRevitLinkerPackage.activate();

      teletypeRevitLinkerPackage.isSignedIn = () => {
        return true;
      };
      teletypeRevitLinkerPackage.teletype = new TeletypePackage();
    });

    it('locks the file specified in uri', async () => {
      const lockFileSpy = spyOn(teletypeRevitLinkerPackage, 'lockFile');

      const newUri = 'atom://teletype-revit-linker/new?file=file.txt';
      await teletypeRevitLinkerPackage.sharePortal(url.parse(newUri, true));

      expect(lockFileSpy).toHaveBeenCalled();
    });

    afterEach(() => {
      teletypeRevitLinkerPackage.deactivate();
    });
  });
});
