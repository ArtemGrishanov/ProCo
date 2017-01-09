/**
 * Panel class
 * @param {PhotoSphereViewer} psv
 * @constructor
 */
function PSVPanel(psv) {
  PSVComponent.call(this, psv);

  this.content = null;

  this.prop = {
    mouse_x: 0,
    mouse_y: 0,
    mousedown: false,
    opened: false
  };

  this.create();
}

PSVPanel.prototype = Object.create(PSVComponent.prototype);
PSVPanel.prototype.constructor = PSVPanel;

PSVPanel.className = 'psv-panel';
PSVPanel.publicMethods = ['showPanel', 'hidePanel'];

/**
 * Creates the panel
 */
PSVPanel.prototype.create = function() {
  PSVComponent.prototype.create.call(this);

  this.container.innerHTML =
    '<div class="psv-panel-resizer"></div>' +
    '<div class="psv-panel-close-button"></div>' +
    '<div class="psv-panel-content"></div>';

  this.content = this.container.querySelector('.psv-panel-content');

  var closeBtn = this.container.querySelector('.psv-panel-close-button');
  closeBtn.addEventListener('click', this.hidePanel.bind(this));

  // Stop event bubling from panel
  if (this.psv.config.mousewheel) {
    this.container.addEventListener(PhotoSphereViewer.SYSTEM.mouseWheelEvent, function(e) {
      e.stopPropagation();
    });
  }

  // Event for panel resizing + stop bubling
  var resizer = this.container.querySelector('.psv-panel-resizer');
  resizer.addEventListener('mousedown', this);
  resizer.addEventListener('touchstart', this);
  this.psv.container.addEventListener('mouseup', this);
  this.psv.container.addEventListener('touchend', this);
  this.psv.container.addEventListener('mousemove', this);
  this.psv.container.addEventListener('touchmove', this);
};

/**
 * Destroys the panel
 */
PSVPanel.prototype.destroy = function() {
  this.psv.container.removeEventListener('mousemove', this);
  this.psv.container.removeEventListener('touchmove', this);
  this.psv.container.removeEventListener('mouseup', this);
  this.psv.container.removeEventListener('touchend', this);

  delete this.prop;
  delete this.content;

  PSVComponent.prototype.destroy.call(this);
};

/**
 * Handle events
 * @param {Event} e
 * @private
 */
PSVPanel.prototype.handleEvent = function(e) {
  switch (e.type) {
    // @formatter:off
    case 'mousedown': this._onMouseDown(e); break;
    case 'touchstart': this._onTouchStart(e); break;
    case 'mousemove': this._onMouseMove(e); break;
    case 'touchmove': this._onTouchMove(e); break;
    case 'mouseup': this._onMouseUp(e); break;
    case 'touchend': this._onMouseUp(e); break;
    // @formatter:on
  }
};

/**
 * Shows the panel
 * @param {string} content
 * @param {boolean} noMargin
 */
PSVPanel.prototype.showPanel = function(content, noMargin) {
  this.content.innerHTML = content;
  this.content.scrollTop = 0;
  this.container.classList.add('psv-panel--open');

  PSVUtils.toggleClass(this.content, 'psv-panel-content--no-margin', !!noMargin);

  this.prop.opened = true;
  this.psv.trigger('open-panel');
};


/**
 * Hides the panel
 */
PSVPanel.prototype.hidePanel = function() {
  this.content.innerHTML = null;
  this.prop.opened = false;
  this.container.classList.remove('psv-panel--open');
  this.psv.trigger('close-panel');
};

/**
 * The user wants to move
 * @param {MouseEvent} evt
 * @private
 */
PSVPanel.prototype._onMouseDown = function(evt) {
  evt.stopPropagation();
  this._startResize(evt);
};

/**
 * The user wants to move (mobile version)
 * @param {TouchEvent} evt
 * @private
 */
PSVPanel.prototype._onTouchStart = function(evt) {
  evt.stopPropagation();
  this._startResize(evt.changedTouches[0]);
};

/**
 * Initializes the movement
 * @param {MouseEvent|Touch} evt
 * @private
 */
PSVPanel.prototype._startResize = function(evt) {
  this.prop.mouse_x = parseInt(evt.clientX);
  this.prop.mouse_y = parseInt(evt.clientY);
  this.prop.mousedown = true;
  this.content.classList.add('psv-panel-content--no-interaction');
};

/**
 * The user wants to stop moving
 * @param {MouseEvent} evt
 * @private
 */
PSVPanel.prototype._onMouseUp = function(evt) {
  if (this.prop.mousedown) {
    evt.stopPropagation();
    this.prop.mousedown = false;
    this.content.classList.remove('psv-panel-content--no-interaction');
  }
};

/**
 * The user resizes the panel
 * @param {MouseEvent} evt
 * @private
 */
PSVPanel.prototype._onMouseMove = function(evt) {
  if (this.prop.mousedown) {
    evt.stopPropagation();
    this._resize(evt);
  }
};

/**
 * The user resizes the panel (mobile version)
 * @param {TouchEvent} evt
 * @private
 */
PSVPanel.prototype._onTouchMove = function(evt) {
  if (this.prop.mousedown) {
    evt.stopPropagation();
    this._resize(evt.touches[0]);
  }
};

/**
 * Panel resizing
 * @param {MouseEvent|Touch} evt
 * @private
 */
PSVPanel.prototype._resize = function(evt) {
  var x = parseInt(evt.clientX);
  var y = parseInt(evt.clientY);

  this.container.style.width = (this.container.offsetWidth - (x - this.prop.mouse_x)) + 'px';

  this.prop.mouse_x = x;
  this.prop.mouse_y = y;
};
