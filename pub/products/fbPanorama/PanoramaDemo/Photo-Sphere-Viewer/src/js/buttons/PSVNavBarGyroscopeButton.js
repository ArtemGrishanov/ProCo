/**
 * Navigation bar gyroscope button class
 * @param {PSVNavBar} navbar
 * @constructor
 */
function PSVNavBarGyroscopeButton(navbar) {
  PSVNavBarButton.call(this, navbar);

  this.create();
}

PSVNavBarGyroscopeButton.prototype = Object.create(PSVNavBarButton.prototype);
PSVNavBarGyroscopeButton.prototype.constructor = PSVNavBarGyroscopeButton;

PSVNavBarGyroscopeButton.id = 'gyroscope';
PSVNavBarGyroscopeButton.className = 'psv-button psv-button--hover-scale psv-gyroscope-button';
PSVNavBarGyroscopeButton.icon = 'compass.svg';

/**
 * Creates the button
 * The buttons get visible once the gyroscope API is ready
 */
PSVNavBarGyroscopeButton.prototype.create = function() {
  PSVNavBarButton.prototype.create.call(this);

  this.container.title = this.psv.config.lang.gyroscope;

  PhotoSphereViewer.SYSTEM.deviceOrientationSupported.promise.then(
    this._onAvailabilityChange.bind(this, true),
    this._onAvailabilityChange.bind(this, false)
  );

  this.hide();

  this.psv.on('gyroscope-updated', this);
};

/**
 * Destroys the button
 */
PSVNavBarGyroscopeButton.prototype.destroy = function() {
  this.psv.off('gyroscope-updated', this);

  PSVNavBarButton.prototype.destroy.call(this);
};

/**
 * Handle events
 * @param {Event} e
 * @private
 */
PSVNavBarGyroscopeButton.prototype.handleEvent = function(e) {
  switch (e.type) {
    // @formatter:off
    case 'gyroscope-updated': this.toggleActive(e.args[0]); break;
    // @formatter:on
  }
};

/**
 * Toggle gyroscope on click
 * @private
 */
PSVNavBarGyroscopeButton.prototype._onClick = function() {
  this.psv.toggleGyroscopeControl();
};

/**
 * Update button display when API is ready
 * @param {boolean} available
 * @private
 */
PSVNavBarGyroscopeButton.prototype._onAvailabilityChange = function(available) {
  if (available) {
    if (PSVUtils.checkTHREE('DeviceOrientationControls')) {
      this.show();
    }
    else {
      throw new PSVError('Missing Three.js components: DeviceOrientationControls. Get them from three.js-examples package.');
    }
  }
};
