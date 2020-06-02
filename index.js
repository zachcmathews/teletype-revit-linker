/* global atom */
const TeletypeRevitLinker = require('./lib/teletype-revit-linker');

module.exports = new TeletypeRevitLinker({
  config: atom.config,
  workspace: atom.workspace,
  notificationManager: atom.notifications,
  packageManager: atom.packages
});
