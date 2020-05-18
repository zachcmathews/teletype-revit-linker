/* eslint no-undef: off */
const url = require('url');
const matchers = require('./matchers');
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

  describe('handleURI', () => {
    const newUri = 'atom://teletype-revit-linker/new?file=file.txt';
    const joinUri = 'atom://teletype-revit-linker/join?teletypeURI=uri';

    it('calls sharePortal for path /new', () => {
      const sharePortalSpy = spyOn(teletypeRevitLinkerPackage, 'sharePortal');
      teletypeRevitLinkerPackage.handleURI(url.parse(newUri));
      expect(sharePortalSpy).toHaveBeenCalled();
    });

    it('calls joinPortal for path /join', () => {
      const joinPortalSpy = spyOn(teletypeRevitLinkerPackage, 'joinPortal');
      teletypeRevitLinkerPackage.handleURI(url.parse(joinUri));
      expect(joinPortalSpy).toHaveBeenCalled();
    });
  });
});
