/**
 * Navigation bar button class
 * @param {PSVNavBar} navbar
 * @constructor
 */
function PSVNavBarButton(navbar) {
  PSVComponent.call(this, navbar);

  if (this.constructor.id) {
    this.id = this.constructor.id;
  }

  this.enabled = true;
}

PSVNavBarButton.prototype = Object.create(PSVComponent.prototype);
PSVNavBarButton.prototype.constructor = PSVNavBarButton;

/**
 * Creates the button
 */
PSVNavBarButton.prototype.create = function() {
  PSVComponent.prototype.create.call(this);

  if (this.constructor.icon) {
    this.setIcon(this.constructor.icon);
  }

  this.container.addEventListener('click', function() {
    if (this.enabled) {
      this._onClick();
    }
  }.bind(this));
};

/**
 * Set the button icon (from PSV icons list)
 * @param {string} icon
 * @param {HTMLElement} [container] - default is the main button container
 */
PSVNavBarButton.prototype.setIcon = function(icon, container) {
  if (!container) {
    container = this.container;
  }
  if (icon) {
    container.innerHTML = PhotoSphereViewer.ICONS[icon];
    // classList not supported on IE11, className is read-only !!!!
    container.querySelector('svg').setAttribute('class', 'psv-button-svg');
  }
  else {
    container.innerHTML = '';
  }
};

/**
 * Changes the active state of the button
 * @param {boolean} [active] - forced state
 */
PSVNavBarButton.prototype.toggleActive = function(active) {
  active = PSVUtils.toggleClass(this.container, 'psv-button--active', active);

  if (this.constructor.iconActive) {
    this.setIcon(active ? this.constructor.iconActive : this.constructor.icon);
  }
};

/**
 * Disables the button
 */
PSVNavBarButton.prototype.disable = function() {
  this.container.classList.add('psv-button--disabled');

  this.enabled = false;
};

/**
 * Enables the button
 */
PSVNavBarButton.prototype.enable = function() {
  this.container.classList.remove('psv-button--disabled');

  this.enabled = true;
};

/**
 * Action when the button is clicked
 * @private
 * @abstract
 */
PSVNavBarButton.prototype._onClick = function() {

};
