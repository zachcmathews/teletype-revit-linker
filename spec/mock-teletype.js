/* eslint no-unused-vars: off */
const { Emitter } = require('atom');

module.exports =
class TeletypePackage {
  constructor(options) {
    this.portalBindingManager = new PortalBindingManager();
  }

  handleURI() {}
  showPopover() {}

  sharePortal() {
    return {
      delegate: {
        uri: 'test'
      }
    };
  }

  getPortalBindingManager() {
    return this.portalBindingManager;
  }
};

class PortalBindingManager {
  constructor() {
  }

  getHostPortalBinding() {
    return true;
  }

  onDidChange(cb) {
    return {
      dispose: () => {}
    };
  }
}
