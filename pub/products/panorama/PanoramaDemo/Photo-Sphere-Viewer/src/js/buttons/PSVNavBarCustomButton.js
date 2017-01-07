/**
 * Navigation bar custom button class
 * @param {PSVNavBar} navbar
 * @param config {Object}
 * @constructor
 */
function PSVNavBarCustomButton(navbar, config) {
  PSVNavBarButton.call(this, navbar);

  this.config = config;

  if (this.config.id) {
    this.id = this.config.id;
  }

  this.create();
}

PSVNavBarCustomButton.prototype = Object.create(PSVNavBarButton.prototype);
PSVNavBarCustomButton.prototype.constructor = PSVNavBarCustomButton;

PSVNavBarCustomButton.className = 'psv-button psv-custom-button';

/**
 * Creates the button
 */
PSVNavBarCustomButton.prototype.create = function() {
  PSVNavBarButton.prototype.create.call(this);

  if (this.config.className) {
    PSVUtils.addClasses(this.container, this.config.className);
  }

  if (this.config.title) {
    this.container.title = this.config.title;
  }

  if (this.config.content) {
    this.container.innerHTML = this.config.content;
  }

  if (this.config.enabled === false || this.config.disabled === true) {
    this.disable();
  }

  if (this.config.visible === false || this.config.hidden === true) {
    this.hide();
  }
};

/**
 * Destroys the button
 */
PSVNavBarCustomButton.prototype.destroy = function() {
  delete this.config;

  PSVNavBarButton.prototype.destroy.call(this);
};

/**
 * Calls user method on click
 * @private
 */
PSVNavBarCustomButton.prototype._onClick = function() {
  if (this.config.onClick) {
    this.config.onClick.apply(this.psv);
  }
};
