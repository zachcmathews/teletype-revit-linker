/* eslint no-undef: off */
const url = require('url');
const TeletypeRevitLinkerPackage
  = require('../lib/teletype-revit-linker-package');

describe('teletype-revit-linker-package', function() {
  const teletypeRevitLinkerPackage = new TeletypeRevitLinkerPackage({
    config: atom.config,
    workspace: atom.workspace,
    notificationManager: atom.notifications,
    packageManager: atom.packages
  });

  describe('handleURI', function () {
    const newUri = 'atom://teletype-revit-linker/new?file=dummy.txt';
    const joinUri = 'atom://teletype-revit-linker/join?teletypeURI=uri';

    it('calls sharePortal for path /new', function() {
      const sharePortalSpy = spyOn(teletypeRevitLinkerPackage, 'sharePortal');
      teletypeRevitLinkerPackage.handleURI(url.parse(newUri));
      expect(sharePortalSpy).toHaveBeenCalled();
    });

    it('calls joinPortal for path /join', function() {
      const joinPortalSpy = spyOn(teletypeRevitLinkerPackage, 'joinPortal');
      teletypeRevitLinkerPackage.handleURI(url.parse(joinUri));
      expect(joinPortalSpy).toHaveBeenCalled();
    });
  });
});
