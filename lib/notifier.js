/* eslint no-console: off */
module.exports =
class Notifier {
  constructor({ teletypeRevitLinkerPackage }) {
    this.config = teletypeRevitLinkerPackage.config;
    this.notificationManager =
      teletypeRevitLinkerPackage.notificationManager;

    this.config.observe('teletype-revit-linker.devMode', (value) => {
      this.devMode = value;
    });

    teletypeRevitLinkerPackage
      .onAddedEditor(this.notifyAddedEditor.bind(this))
      .onSharedFile(this.notifySharedFile.bind(this))
      .onClosedPortal(this.notifyClosedPortal.bind(this));

    teletypeRevitLinkerPackage
      .onLockedFile(this.notifyLockedFile.bind(this))
      .onFailedToLockFile(this.notifyFailedToLockFile.bind(this))
      .onUnlockedFile(this.notifyUnlockedFile.bind(this))
      .onFailedToUnlockFile(this.notifyFailedToUnlockFile.bind(this));

    teletypeRevitLinkerPackage
      .onTeletypeNotInstalled(this.notifyTeletypeNotInstalled.bind(this))
      .onTeletypeDisabled(this.notifyTeletypeDisabled.bind(this))
      .onTeletypeNotActivated(this.notifyTeletypeNotActivated.bind(this))
      .onTeletypeNotConsumed(this.notifyTeletypeNotConsumed.bind(this))
      .onTeletypeNotSignedIn(this.notifyTeletypeNotSignedIn.bind(this))
      .onTeletypeFailedToSharePortal(
        this.notifyTeletypeFailedToSharePortal.bind(this)
      )
      .onAtomNotRegisteredURIHandler(
        this.notifyAtomNotRegisteredURIHandler.bind(this)
      );
  }

  notifyAddedEditor(editor) {
    if (this.devMode) console.log(editor);
  }

  notifySharedFile(file) {
    this.notificationManager.addSuccess(
      'teletype-revit-linker',
      {
        detail: `You are now collaborating on ${file}.`
      }
    );
  }

  notifyClosedPortal(affectedEditors) {
    if (!affectedEditors) return;

    let affectedFiles = [];
    affectedEditors.forEach(editor => affectedFiles.push(editor.getPath()));

    const notification = this.notificationManager.addError(
      'teletype-revit-linker',
      {
        buttons: [
          {
            text: 'Close Files',
            onDidClick: () => {
              affectedEditors.forEach((editor) => editor.destroy());
              notification.dismiss();
            }
          }
        ],
        detail: (
          'You are no longer collaborating and are currently blocking ' +
          'other users from opening the following keynote files:\n' +
          affectedFiles.join('\n')
        ),
        dismissable: true
      }
    );
    this.notificationManager.addError(
      'teletype-revit-linker',
      {
        detail: (
          'Use the Revit \'Edit Keynotes\' button to start collaborating.'
        ),
        dismissable: true
      }
    );
  }

  notifyLockedFile(file) {
    if (this.devMode) console.info('Locked file: ' + file);
  }

  notifyFailedToLockFile({err, file}) {
    if (this.devMode) console.error(err);
    this.notificationManager.addError(
      'teletype-revit-linker',
      {
        detail: (
          `Could not lock ${file}. ` +
          'It may have already been opened by another user. Try again!'
        ),
        dismissable: true
      }
    );
  }

  notifyUnlockedFile(file) {
    if (this.devMode) console.info('Unlocked file: ' + file);
  }

  notifyFailedToUnlockFile({err, file}) {
    if (this.devMode) console.error(err);
    this.notificationManager.addError(
      `Failed to release lock on ${file}`,
      { dismissable: true }
    );
  }

  notifyTeletypeNotInstalled() {
    this.notificationManager.addError(
      'You must install Teletype before using teletype-revit-linker.',
      { dismissable: true }
    );
  }

  notifyTeletypeDisabled() {
    this.notificationManager.addError(
      'You must enable Teletype before using teletype-revit-linker.',
      { dismissable: true }
    );
  }

  notifyTeletypeNotActivated() {
    this.notificationManager.addError(
      'Could not activate Teletype package.',
      { dismissable: true }
    );
  }

  notifyTeletypeNotConsumed() {
    this.notificationManager.addError(
      'Could not consume Teletype service.',
      { dismissable: true }
    );
  }

  notifyTeletypeNotSignedIn(teletype) {
    this.notificationManager.addError(
      'You must sign in to Teletype before collaborating on keynotes.',
      { dismissable: true }
    );
    this.notificationManager.addError(
      'Use the Revit \'Edit Keynotes\' button to start collaborating.',
      { dismissable: true }
    );
    teletype.showPopover();
  }

  notifyTeletypeFailedToSharePortal() {
    this.notificationManager.addError(
      'teletype-revit-linker',
      {
        detail: (
          "Unable to share portal. Something's broken. " +
          "Maybe try reinstalling teletype and teletype-revit-linker."
        ),
        dismissable: true
      }
    );
  }

  notifyAtomNotRegisteredURIHandler() {
    const notification = this.notificationManager.addInfo(
      'teletype-revit-linker',
      {
        buttons: [
          {
            text: 'Register as Default URI Handler',
            onDidClick: () => {
              this.config.settings.core.uriHandlerRegistration = 'always';
              notification.dismiss();
            }
          }
        ]
      }
    );
  }
};
