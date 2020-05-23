/* eslint no-undef: off */
const url = require('url');
const TeletypeRevitLinkerPackage
  = require('../lib/teletype-revit-linker-package');

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
    beforeEach(() => {
      makeNewPackage();
      waitsForPromise(() => teletypeRevitLinkerPackage.activate());
    });

    it('adds subscription to onDidAddTextEditor', () => {
      expect(
        teletypeRevitLinkerPackage
          .subscriptions
          .disposables
          .size
      ).toBe(1);
    });

    afterEach(() => {
      teletypeRevitLinkerPackage.deactivate();
    });
  });

  describe('deactivate', () => {
    beforeEach(() => {
      makeNewPackage();
      waitsForPromise(() => teletypeRevitLinkerPackage.activate());
    });

    it('disposes of subscriptions', () => {
      teletypeRevitLinkerPackage.deactivate();
      expect(
        teletypeRevitLinkerPackage
          .subscriptions
          .disposables
      ).toBeNull();
    });

    it('calls unlockFiles', () => {
      const unlockFilesSpy = spyOn(teletypeRevitLinkerPackage, 'unlockFiles');
      teletypeRevitLinkerPackage.deactivate();
      expect(unlockFilesSpy).toHaveBeenCalled();
    });
  });

  describe('consumeTeletype', () => {
    beforeEach(() => {
      makeNewPackage();
      waitsForPromise(() => teletypeRevitLinkerPackage.activate());
    });

    it('provides access to teletype package', () => {
      teletypeRevitLinkerPackage.consumeTeletype({teletypePackage: 'mock'});
      expect(teletypeRevitLinkerPackage.teletype).toBeDefined();
    });

    afterEach(() => {
      teletypeRevitLinkerPackage.deactivate();
    });
  });

  describe('provideTeletypeRevitLinker', () => {
    beforeEach(() => {
      makeNewPackage();
      waitsForPromise(() => teletypeRevitLinkerPackage.activate());
    });

    it('provides current teletype-revit-linker package', () => {
      service = teletypeRevitLinkerPackage.provideTeletypeRevitLinker();
      expect(service).toBe(teletypeRevitLinkerPackage);
    });

    afterEach(() => {
      teletypeRevitLinkerPackage.deactivate();
    });
  });

  describe('getTeletype', () => {
    beforeEach(() => {
      makeNewPackage();
      waitsForPromise(() => teletypeRevitLinkerPackage.activate());
    });

    it('returns teletype if consumed', () => {
      teletypeRevitLinkerPackage.consumeTeletype({teletypePackage: 'mock'});
      teletypeRevitLinkerPackage.getTeletype().then((teletype) => {
        expect(teletype).toBe('mock');
      });
    });

    it('emits teletype-not-installed appropriately', () => {
      const emitSpy = spyOn(teletypeRevitLinkerPackage.emitter, 'emit');
      teletypeRevitLinkerPackage.getTeletype().then((teletype) => {
        expect(teletype).toBeNull();
        expect(emitSpy).toHaveBeenCalledWith('teletype-not-installed');
      });
    });

    it('emits teletype-disabled appropriately', () => {
      const emitSpy = spyOn(teletypeRevitLinkerPackage.emitter, 'emit');
      atom.packages.loadPackage('teletype');
      teletypeRevitLinkerPackage.getTeletype().then((teletype) => {
        expect(teletype).toBeNull();
        expect(emitSpy).toHaveBeenCalledWith('teletype-disabled');
      });
    });

    it('emits teletype-not-activated appropriately', () => {
      const emitSpy = spyOn(teletypeRevitLinkerPackage.emitter, 'emit');
      teletypeRevitLinkerPackage.getTeletype().then((teletype) => {
        expect(teletype).toBeNull();
        expect(emitSpy).toHaveBeenCalledWith('teletype-not-activated');
      });
    });

    afterEach(() => {
      teletypeRevitLinkerPackage.deactivate();
    });
  });

  describe('handleURI', () => {
    beforeEach(() => {
      makeNewPackage();
      waitsForPromise(() => teletypeRevitLinkerPackage.activate());
    });

    it('calls sharePortal for path /new', () => {
      const newUri = 'atom://teletype-revit-linker/new?file=file.txt';
      const sharePortalSpy = spyOn(teletypeRevitLinkerPackage, 'sharePortal');
      teletypeRevitLinkerPackage.handleURI(url.parse(newUri));
      expect(sharePortalSpy).toHaveBeenCalled();
    });

    it('calls joinPortal for path /join', () => {
      const joinUri = 'atom://teletype-revit-linker/join?teletypeURI=uri';
      const joinPortalSpy = spyOn(teletypeRevitLinkerPackage, 'joinPortal');
      teletypeRevitLinkerPackage.handleURI(url.parse(joinUri));
      expect(joinPortalSpy).toHaveBeenCalled();
    });

    afterEach(() => {
      teletypeRevitLinkerPackage.deactivate();
    });
  });
});
