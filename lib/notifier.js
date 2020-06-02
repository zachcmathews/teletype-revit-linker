/* eslint no-console: off */
const { CompositeDisposable } = require('atom');

module.exports =
class Notifier {
  constructor({ teletypeRevitLinker }) {
    this.config = teletypeRevitLinker.config;
    this.notificationManager = teletypeRevitLinker.notificationManager;
    this.subscriptions = new CompositeDisposable();

    this.config.observe('teletype-revit-linker.devMode', (value) => {
      this.devMode = value;
    });

    this.subscriptions.add(
      teletypeRevitLinker.onAddedEditor(
        (editor) => this.notifyAddedEditor(editor)
      )
    );
    this.subscriptions.add(
      teletypeRevitLinker.onSharedFile(
        (file) => this.notifySharedFile(file)
      )
    );
    this.subscriptions.add(
      teletypeRevitLinker.onClosedPortal(
        (affectedEditors) => this.notifyClosedPortal(affectedEditors)
      )
    );

    this.subscriptions.add(
      teletypeRevitLinker.onLockedFile(
        (file) => this.notifyLockedFile(file)
      )
    );
    this.subscriptions.add(
      teletypeRevitLinker.onFailedToLockFile(
        ({err, file}) => this.notifyFailedToLockFile({err, file})
      )
    );
    this.subscriptions.add(
      teletypeRevitLinker.onUnlockedFile(
        (file) => this.notifyUnlockedFile(file)
      )
    );
    this.subscriptions.add(
      teletypeRevitLinker.onFailedToUnlockFile(
        ({err, file}) => this.notifyFailedToUnlockFile({err, file})
      )
    );

    this.subscriptions.add(
      teletypeRevitLinker.onTeletypeNotInstalled(
        () => this.notifyTeletypeNotInstalled()
      )
    );
    this.subscriptions.add(
      teletypeRevitLinker.onTeletypeDisabled(
        () => this.notifyTeletypeDisabled()
      )
    );
    this.subscriptions.add(
      teletypeRevitLinker.onTeletypeNotActivated(
        () => this.notifyTeletypeNotActivated()
      )
    );
    this.subscriptions.add(
      teletypeRevitLinker.onTeletypeNotConsumed(
        () => this.notifyTeletypeNotConsumed()
      )
    );
    this.subscriptions.add(
      teletypeRevitLinker.onTeletypeNotSignedIn(
        (teletype) => this.notifyTeletypeNotSignedIn(teletype)
      )
    );
    this.subscriptions.add(
      teletypeRevitLinker.onTeletypeFailedToSharePortal(
        () => this.notifyTeletypeFailedToSharePortal()
      )
    );
    this.subscriptions.add(
      teletypeRevitLinker.onAtomNotRegisteredURIHandler(
        () => this.notifyAtomNotRegisteredURIHandler()
      )
    );
  }

  deactivate() {
    this.subscriptions.dispose();
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
    if (!affectedEditors.length) return;

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
