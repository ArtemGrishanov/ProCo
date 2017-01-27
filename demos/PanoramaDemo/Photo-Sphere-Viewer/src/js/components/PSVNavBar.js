/**
 * Navigation bar class
 * @param {PhotoSphereViewer} psv
 * @constructor
 */
function PSVNavBar(psv) {
  PSVComponent.call(this, psv);

  this.config = this.psv.config.navbar;
  this.items = [];

  // all buttons
  if (this.config === true) {
    this.config = PSVUtils.clone(PhotoSphereViewer.DEFAULTS.navbar);
  }
  // space separated list
  else if (typeof this.config == 'string') {
    this.config = this.config.split(' ');
  }
  // migration from object
  else if (!Array.isArray(this.config)) {
    console.warn('PhotoSphereViewer: hashmap form of "navbar" is deprecated, use an array instead.');

    var config = this.config;
    this.config = [];
    for (var key in config) {
      if (config[key]) {
        this.config.push(key);
      }
    }

    this.config.sort(function(a, b) {
      return PhotoSphereViewer.DEFAULTS.navbar.indexOf(a) - PhotoSphereViewer.DEFAULTS.navbar.indexOf(b);
    });
  }

  this.create();
}

PSVNavBar.prototype = Object.create(PSVComponent.prototype);
PSVNavBar.prototype.constructor = PSVNavBar;

PSVNavBar.className = 'psv-navbar psv-navbar--open';
PSVNavBar.publicMethods = ['showNavbar', 'hideNavbar', 'toggleNavbar', 'getNavbarButton'];

/**
 * Creates the navbar
 */
PSVNavBar.prototype.create = function() {
  PSVComponent.prototype.create.call(this);

  this.config.forEach(function(button) {
    if (typeof button == 'object') {
      this.items.push(new PSVNavBarCustomButton(this, button));
    }
    else {
      switch (button) {
        case PSVNavBarAutorotateButton.id:
          this.items.push(new PSVNavBarAutorotateButton(this));
          break;

        case PSVNavBarZoomButton.id:
          this.items.push(new PSVNavBarZoomButton(this));
          break;

        case PSVNavBarDownloadButton.id:
          this.items.push(new PSVNavBarDownloadButton(this));
          break;

        case PSVNavBarMarkersButton.id:
          this.items.push(new PSVNavBarMarkersButton(this));
          break;

        case PSVNavBarFullscreenButton.id:
          this.items.push(new PSVNavBarFullscreenButton(this));
          break;

        case PSVNavBarGyroscopeButton.id:
          if (this.psv.config.gyroscope) {
            this.items.push(new PSVNavBarGyroscopeButton(this));
          }
          break;

        case 'caption':
          this.items.push(new PSVNavBarCaption(this, this.psv.config.caption));
          break;

        case 'spacer':
          button = 'spacer-5';
        /* falls through */
        default:
          var matches = button.match(/^spacer\-([0-9]+)$/);
          if (matches !== null) {
            this.items.push(new PSVNavBarSpacer(this, matches[1]));
          }
          else {
            throw new PSVError('Unknown button ' + button);
          }
          break;
      }
    }
  }, this);
};

/**
 * Destroys the navbar
 */
PSVNavBar.prototype.destroy = function() {
  this.items.forEach(function(item) {
    item.destroy();
  });

  delete this.items;
  delete this.config;

  PSVComponent.prototype.destroy.call(this);
};

/**
 * Returns a button by it's identifier
 * @param {string|number} id
 * @returns {PSVNavBarButton}
 */
PSVNavBar.prototype.getNavbarButton = function(id) {
  var button = null;

  this.items.some(function(item) {
    if (item.id === id) {
      button = item;
      return true;
    }
  });

  if (!button) {
    console.warn('PhotoSphereViewer: button "' + id + '" not found in the navbar.');
  }

  return button;
};

/**
 * Show the navbar
 */
PSVNavBar.prototype.showNavbar = function() {
  this.toggleNavbar(true);
};

/**
 * Hides the navbar
 */
PSVNavBar.prototype.hideNavbar = function() {
  this.toggleNavbar(false);
};

/**
 * Toggles the navbar
 * @param active
 */
PSVNavBar.prototype.toggleNavbar = function(active) {
  PSVUtils.toggleClass(this.container, 'psv-navbar--open', active);
};
