/**
 * Navigation bar fullscreen button class
 * @param {PSVNavBar} navbar
 * @constructor
 */
function PSVNavBarFullscreenButton(navbar) {
  PSVNavBarButton.call(this, navbar);

  this.create();
}

PSVNavBarFullscreenButton.prototype = Object.create(PSVNavBarButton.prototype);
PSVNavBarFullscreenButton.prototype.constructor = PSVNavBarFullscreenButton;

PSVNavBarFullscreenButton.id = 'fullscreen';
PSVNavBarFullscreenButton.className = 'psv-button psv-button--hover-scale psv-fullscreen-button';
PSVNavBarFullscreenButton.icon = 'fullscreen-in.svg';
PSVNavBarFullscreenButton.iconActive = 'fullscreen-out.svg';

/**
 * Creates the button
 */
PSVNavBarFullscreenButton.prototype.create = function() {
  PSVNavBarButton.prototype.create.call(this);

  this.container.title = this.psv.config.lang.fullscreen;

  this.psv.on('fullscreen-updated', this);
};

/**
 * Destroys the button
 */
PSVNavBarFullscreenButton.prototype.destroy = function() {
  this.psv.off('fullscreen-updated', this);

  PSVNavBarButton.prototype.destroy.call(this);
};

/**
 * Handle events
 * @param {Event} e
 * @private
 */
PSVNavBarFullscreenButton.prototype.handleEvent = function(e) {
  switch (e.type) {
    // @formatter:off
    case 'fullscreen-updated': this.toggleActive(e.args[0]); break;
    // @formatter:on
  }
};

/**
 * Toggles fullscreen on click
 * @private
 */
PSVNavBarFullscreenButton.prototype._onClick = function() {
  this.psv.toggleFullscreen();
};
