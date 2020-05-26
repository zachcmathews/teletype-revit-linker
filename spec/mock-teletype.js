const { Emitter } = require('atom');

module.exports =
class TeletypePackage {
  constructor() {
    this.portalBindingManager = new PortalBindingManager();
  }

  sharePortal() {
    return true;
  }

  getPortalBindingManager() {
    return this.portalBindingManager;
  }
};

class PortalBindingManager {
  constructor() {
    this.emitter = new Emitter();
  }

  getHostPortalBinding() {
    return true;
  }

  onDidChange(cb) {
    return this.emitter.on('did-change', cb);
  }
}
