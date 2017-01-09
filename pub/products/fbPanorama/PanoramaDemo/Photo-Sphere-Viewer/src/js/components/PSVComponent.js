/**
 * Base sub-component class
 * @param {PhotoSphereViewer | PSVComponent} parent - the parent with a "container" property
 * @constructor
 */
function PSVComponent(parent) {
  this.psv = parent instanceof PhotoSphereViewer ? parent : parent.psv;
  this.parent = parent;
  this.container = null;

  // expose some methods to the viewer
  if (this.constructor.publicMethods) {
    this.constructor.publicMethods.forEach(function(method) {
      this.psv[method] = this[method].bind(this);
    }, this);
  }
}

/**
 * Creates the component
 */
PSVComponent.prototype.create = function() {
  this.container = document.createElement('div');

  if (this.constructor.className) {
    this.container.className = this.constructor.className;
  }

  this.parent.container.appendChild(this.container);
};

/**
 * Destroys the component
 */
PSVComponent.prototype.destroy = function() {
  this.parent.container.removeChild(this.container);

  if (this.constructor.publicMethods) {
    this.constructor.publicMethods.forEach(function(method) {
      delete this.psv[method];
    }, this);
  }

  delete this.container;
  delete this.psv;
  delete this.parent;
};

/**
 * Hides the component
 */
PSVComponent.prototype.hide = function() {
  this.container.style.display = 'none';
};

/**
 * Restores component visibility
 */
PSVComponent.prototype.show = function() {
  this.container.style.display = null;
};
