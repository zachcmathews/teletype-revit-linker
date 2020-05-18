/* global atom */
const TeletypeRevitLinkerPackage =
  require('./lib/teletype-revit-linker-package');

module.exports = new TeletypeRevitLinkerPackage({
  config: atom.config,
  workspace: atom.workspace,
  notificationManager: atom.notifications,
  packageManager: atom.packages
});
