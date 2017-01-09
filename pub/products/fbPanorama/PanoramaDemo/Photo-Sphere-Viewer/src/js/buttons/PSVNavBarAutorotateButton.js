/**
 * Navigation bar autorotate button class
 * @param {PSVNavBar} navbar
 * @constructor
 */
function PSVNavBarAutorotateButton(navbar) {
  PSVNavBarButton.call(this, navbar);

  this.create();
}

PSVNavBarAutorotateButton.prototype = Object.create(PSVNavBarButton.prototype);
PSVNavBarAutorotateButton.prototype.constructor = PSVNavBarAutorotateButton;

PSVNavBarAutorotateButton.id = 'autorotate';
PSVNavBarAutorotateButton.className = 'psv-button psv-button--hover-scale psv-autorotate-button';
PSVNavBarAutorotateButton.icon = 'play.svg';
PSVNavBarAutorotateButton.iconActive = 'play-active.svg';

/**
 * Creates the button
 */
PSVNavBarAutorotateButton.prototype.create = function() {
  PSVNavBarButton.prototype.create.call(this);

  this.container.title = this.psv.config.lang.autorotate;

  this.psv.on('autorotate', this);
};

/**
 * Destroys the button
 */
PSVNavBarAutorotateButton.prototype.destroy = function() {
  this.psv.off('autorotate', this);

  PSVNavBarButton.prototype.destroy.call(this);
};

/**
 * Handle events
 * @param {Event} e
 * @private
 */
PSVNavBarAutorotateButton.prototype.handleEvent = function(e) {
  switch (e.type) {
    // @formatter:off
    case 'autorotate': this.toggleActive(e.args[0]); break;
    // @formatter:on
  }
};

/**
 * Toggles autorotate on click
 * @private
 */
PSVNavBarAutorotateButton.prototype._onClick = function() {
  this.psv.toggleAutorotate();
};
