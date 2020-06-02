/* eslint no-undef: off */
const TeletypeRevitLinker = require('./mock-teletype-revit-linker');

const teletypeRevitLinker = TeletypeRevitLinker();
const notifier = teletypeRevitLinker.notifier;
const emitter = teletypeRevitLinker.emitter;

describe('Notifier', () => {
  it('notifies on added-editor', () => {
    const notifySpy = spyOn(notifier, 'notifyAddedEditor');
    emitter.emit('added-editor');
    expect(notifySpy).toHaveBeenCalled();
  });

  it('notifies on shared-file', () => {
    const notifySpy = spyOn(notifier, 'notifySharedFile');
    emitter.emit('shared-file');
    expect(notifySpy).toHaveBeenCalled();
  });

  it('notifies on closed-file', () => {
    const notifySpy = spyOn(notifier, 'notifyClosedPortal');
    emitter.emit('closed-portal');
    expect(notifySpy).toHaveBeenCalled();
  });

  it('notifies on locked-file', () => {
    const notifySpy = spyOn(notifier, 'notifyLockedFile');
    emitter.emit('locked-file');
    expect(notifySpy).toHaveBeenCalled();
  });

  it('notifies on failed-lock-file', () => {
    const notifySpy = spyOn(notifier, 'notifyFailedToLockFile');
    emitter.emit('failed-lock-file', {err: 'err', file: 'file'});
    expect(notifySpy).toHaveBeenCalled();
  });

  it('notifies on unlocked-file', () => {
    const notifySpy = spyOn(notifier, 'notifyUnlockedFile');
    emitter.emit('unlocked-file');
    expect(notifySpy).toHaveBeenCalled();
  });

  it('notifies on failed-unlock-file', () => {
    const notifySpy = spyOn(notifier, 'notifyFailedToUnlockFile');
    emitter.emit('failed-unlock-file', {err: 'err', file: 'file'});
    expect(notifySpy).toHaveBeenCalled();
  });

  it('notifies on teletype-not-installed', () => {
    const notifySpy = spyOn(notifier, 'notifyTeletypeNotInstalled');
    emitter.emit('teletype-not-installed');
    expect(notifySpy).toHaveBeenCalled();
  });

  it('notifies on teletype-disabled', () => {
    const notifySpy = spyOn(notifier, 'notifyTeletypeDisabled');
    emitter.emit('teletype-disabled');
    expect(notifySpy).toHaveBeenCalled();
  });

  it('notifies on teletype-not-activated', () => {
    const notifySpy = spyOn(notifier, 'notifyTeletypeNotActivated');
    emitter.emit('teletype-not-activated');
    expect(notifySpy).toHaveBeenCalled();
  });

  it('notifies on teletype-not-consumed', () => {
    const notifySpy = spyOn(notifier, 'notifyTeletypeNotConsumed');
    emitter.emit('teletype-not-consumed');
    expect(notifySpy).toHaveBeenCalled();
  });

  it('notifies on teletype-not-signed-in', () => {
    const notifySpy = spyOn(notifier, 'notifyTeletypeNotSignedIn');
    emitter.emit('teletype-not-signed-in');
    expect(notifySpy).toHaveBeenCalled();
  });

  it('notifies on teletype-failed-share-portal', () => {
    const notifySpy = spyOn(notifier, 'notifyTeletypeFailedToSharePortal');
    emitter.emit('teletype-failed-share-portal');
    expect(notifySpy).toHaveBeenCalled();
  });

  it('notifies on atom-not-onAtomNotRegisteredURIHandler', () => {
    const notifySpy = spyOn(notifier, 'notifyAtomNotRegisteredURIHandler');
    emitter.emit('atom-not-registered-uri-handler');
    expect(notifySpy).toHaveBeenCalled();
  });
});
