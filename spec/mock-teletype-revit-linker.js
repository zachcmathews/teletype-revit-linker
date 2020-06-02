/* global atom */
const TeletypeRevitLinker = require('../lib/teletype-revit-linker');

atom.config.settings = atom.config.defaultSettings;
module.exports = () => {
  return new TeletypeRevitLinker({
    config: atom.config,
    workspace: atom.workspace,
    notificationManager: atom.notifications,
    packageManager: atom.packages
  });
};
