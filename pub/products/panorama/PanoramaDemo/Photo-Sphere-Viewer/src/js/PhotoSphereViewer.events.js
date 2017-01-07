/**
 * Add all needed event listeners
 * @private
 */
PhotoSphereViewer.prototype._bindEvents = function() {
  window.addEventListener('resize', this);
  document.addEventListener(PhotoSphereViewer.SYSTEM.fullscreenEvent, this);

  // all interation events are binded to the HUD only
  if (this.config.mousemove) {
    this.hud.container.style.cursor = 'move';
    this.hud.container.addEventListener('mousedown', this);
    this.hud.container.addEventListener('touchstart', this);
    window.addEventListener('mouseup', this);
    window.addEventListener('touchend', this);
    this.hud.container.addEventListener('mousemove', this);
    this.hud.container.addEventListener('touchmove', this);
  }

  if (this.config.mousewheel) {
    this.hud.container.addEventListener(PhotoSphereViewer.SYSTEM.mouseWheelEvent, this);
  }

  this.on('_side-reached', function(side) {
    if (this.isAutorotateEnabled()) {
      if (side === 'left' || side === 'right') {
        this._reverseAutorotate();
      }
    }
  });
};

/**
 * Handle events
 * @param {Event} evt
 * @private
 */
PhotoSphereViewer.prototype.handleEvent = function(evt) {
  switch (evt.type) {
    // @formatter:off
    case 'resize': PSVUtils.throttle(this._onResize(), 50); break;
    case 'keydown':     this._onKeyDown(evt);     break;
    case 'mousedown':   this._onMouseDown(evt);   break;
    case 'touchstart':  this._onTouchStart(evt);  break;
    case 'mouseup':     this._onMouseUp(evt);     break;
    case 'touchend':    this._onTouchEnd(evt);    break;
    case 'mousemove':   this._onMouseMove(evt);   break;
    case 'touchmove':   this._onTouchMove(evt);   break;
    case PhotoSphereViewer.SYSTEM.fullscreenEvent:  this._fullscreenToggled();  break;
    case PhotoSphereViewer.SYSTEM.mouseWheelEvent:  this._onMouseWheel(evt);      break;
    // @formatter:on
  }
};

/**
 * Resizes the canvas when the window is resized
 * @private
 */
PhotoSphereViewer.prototype._onResize = function() {
  if (this.container.clientWidth != this.prop.size.width || this.container.clientHeight != this.prop.size.height) {
    this.prop.size.width = parseInt(this.container.clientWidth);
    this.prop.size.height = parseInt(this.container.clientHeight);
    this.prop.aspect = this.prop.size.width / this.prop.size.height;

    if (this.renderer) {
      this.renderer.setSize(this.prop.size.width, this.prop.size.height);
      if (this.composer) {
        this.composer.reset(new THREE.WebGLRenderTarget(this.prop.size.width, this.prop.size.height));
      }
      this.render();
    }

    this.trigger('size-updated', this.getSize());
  }
};

/**
 * Rotate or zoom on key down
 * @param {KeyboardEvent} evt
 * @private
 */
PhotoSphereViewer.prototype._onKeyDown = function(evt) {
  var dLong = 0;
  var dLat = 0;
  var dZoom = 0;

  var key = evt.key || PhotoSphereViewer.KEYMAP[evt.keyCode || evt.which];

  switch (key) {
    // @formatter:off
    case 'ArrowUp': dLat = 0.01; break;
    case 'ArrowDown': dLat = -0.01; break;
    case 'ArrowRight': dLong = 0.01; break;
    case 'ArrowLeft': dLong = -0.01; break;
    case 'PageUp':case '+': dZoom = 1; break;
    case 'PageDown':case '-': dZoom = -1; break;
    // @formatter:on
  }

  if (dZoom !== 0) {
    this.zoom(this.prop.zoom_lvl + dZoom);
  }
  else if (dLat !== 0 || dLong !== 0) {
    this.rotate({
      longitude: this.prop.longitude + dLong * this.prop.move_speed * this.prop.hFov,
      latitude: this.prop.latitude + dLat * this.prop.move_speed * this.prop.vFov
    });
  }
};

/**
 * The user wants to move
 * @param {MouseEvent} evt
 * @private
 */
PhotoSphereViewer.prototype._onMouseDown = function(evt) {
  this._startMove(evt);
};

/**
 * The user wants to move (touch version)
 * @param {TouchEvent} evt
 * @private
 */
PhotoSphereViewer.prototype._onTouchStart = function(evt) {
  if (evt.touches.length === 1) {
    this._startMove(evt.touches[0]);
  }
  else if (evt.touches.length === 2) {
    this._startZoom(evt);
  }
};

/**
 * Initializes the movement
 * @param {MouseEvent|Touch} evt
 * @private
 */
PhotoSphereViewer.prototype._startMove = function(evt) {
  if (this.isGyroscopeEnabled()) {
    return;
  }

  this.stopAll();

  this.prop.mouse_x = this.prop.start_mouse_x = parseInt(evt.clientX);
  this.prop.mouse_y = this.prop.start_mouse_y = parseInt(evt.clientY);
  this.prop.moving = true;
  this.prop.zooming = false;

  this.prop.mouse_history.length = 0;
  this._logMouseMove(evt);
};

/**
 * Initializes the zoom
 * @param {TouchEvent} evt
 * @private
 */
PhotoSphereViewer.prototype._startZoom = function(evt) {
  var t = [
    { x: parseInt(evt.touches[0].clientX), y: parseInt(evt.touches[0].clientY) },
    { x: parseInt(evt.touches[1].clientX), y: parseInt(evt.touches[1].clientY) }
  ];

  this.prop.pinch_dist = Math.sqrt(Math.pow(t[0].x - t[1].x, 2) + Math.pow(t[0].y - t[1].y, 2));
  this.prop.moving = false;
  this.prop.zooming = true;
};

/**
 * The user wants to stop moving
 * @param {MouseEvent} evt
 * @private
 */
PhotoSphereViewer.prototype._onMouseUp = function(evt) {
  this._stopMove(evt);
};

/**
 * The user wants to stop moving (touch version)
 * @param {TouchEvent} evt
 * @private
 */
PhotoSphereViewer.prototype._onTouchEnd = function(evt) {
  this._stopMove(evt.changedTouches[0]);
};

/**
 * Stops the movement
 * If the move threshold was not reached, a click event is triggered
 *    otherwise a animation is launched to simulate inertia
 * @param {MouseEvent|Touch} evt
 * @private
 */
PhotoSphereViewer.prototype._stopMove = function(evt) {
  if (this.isGyroscopeEnabled()) {
    this._click(evt);
    return;
  }

  if (this.prop.moving) {
    // move threshold to trigger a click
    if (Math.abs(evt.clientX - this.prop.start_mouse_x) < PhotoSphereViewer.MOVE_THRESHOLD && Math.abs(evt.clientY - this.prop.start_mouse_y) < PhotoSphereViewer.MOVE_THRESHOLD) {
      this._click(evt);
      this.prop.moving = false;
    }
    // inertia animation
    else if (this.config.move_inertia) {
      this._logMouseMove(evt);
      this._stopMoveInertia(evt);
    }
    else {
      this.prop.moving = false;
    }
  }

  this.prop.mouse_history.length = 0;
  this.prop.zooming = false;
};

/**
 * Performs an animation to simulate inertia when stop moving
 * @param {MouseEvent|Touch} evt
 * @private
 */
PhotoSphereViewer.prototype._stopMoveInertia = function(evt) {
  var self = this;

  var direction = {
    x: evt.clientX - this.prop.mouse_history[0][1],
    y: evt.clientY - this.prop.mouse_history[0][2]
  };

  var norm = Math.sqrt(direction.x * direction.x + direction.y * direction.y);

  this.prop.animation_promise = PSVUtils.animation({
    properties: {
      clientX: { start: evt.clientX, end: evt.clientX + direction.x },
      clientY: { start: evt.clientY, end: evt.clientY + direction.y }
    },
    duration: norm * PhotoSphereViewer.INERTIA_WINDOW / 100,
    easing: 'outCirc',
    onTick: function(properties) {
      self._move(properties);
    },
    onCancel: function() {
      self.prop.moving = false;
    },
    onDone: function() {
      self.prop.moving = false;
    }
  });
};

/**
 * Trigger an event with all coordinates when a simple click is performed
 * @param {MouseEvent|Touch} evt
 * @private
 */
PhotoSphereViewer.prototype._click = function(evt) {
  var boundingRect = this.container.getBoundingClientRect();

  var data = {
    target: evt.target,
    client_x: evt.clientX,
    client_y: evt.clientY,
    viewer_x: parseInt(evt.clientX - boundingRect.left),
    viewer_y: parseInt(evt.clientY - boundingRect.top)
  };

  var intersect = this.viewerCoordsToVector3(data.viewer_x, data.viewer_y);

  if (intersect) {
    var sphericalCoords = this.vector3ToSphericalCoords(intersect);

    data.longitude = sphericalCoords.longitude;
    data.latitude = sphericalCoords.latitude;

    var textureCoords = this.sphericalCoordsToTextureCoords(data.longitude, data.latitude);

    data.texture_x = textureCoords.x;
    data.texture_y = textureCoords.y;

    this.trigger('click', data);
  }
};

/**
 * The user moves the image
 * @param {MouseEvent} evt
 * @private
 */
PhotoSphereViewer.prototype._onMouseMove = function(evt) {
  if (evt.buttons !== 0) {
    evt.preventDefault();
    this._move(evt);
  }
};

/**
 * The user moves the image (touch version)
 * @param {TouchEvent} evt
 * @private
 */
PhotoSphereViewer.prototype._onTouchMove = function(evt) {
  if (evt.touches.length === 1) {
    evt.preventDefault();
    this._move(evt.touches[0]);
  }
  else if (evt.touches.length === 2) {
    evt.preventDefault();
    this._zoom(evt);
  }
};

/**
 * Performs movement
 * @param {MouseEvent|Touch} evt
 * @private
 */
PhotoSphereViewer.prototype._move = function(evt) {
  if (this.prop.moving) {
    var x = parseInt(evt.clientX);
    var y = parseInt(evt.clientY);

    this.rotate({
      longitude: this.prop.longitude - (x - this.prop.mouse_x) / this.prop.size.width * this.prop.move_speed * this.prop.hFov,
      latitude: this.prop.latitude + (y - this.prop.mouse_y) / this.prop.size.height * this.prop.move_speed * this.prop.vFov
    });

    this.prop.mouse_x = x;
    this.prop.mouse_y = y;

    this._logMouseMove(evt);
  }
};

/**
 * Zoom
 * @param {TouchEvent} evt
 * @private
 */
PhotoSphereViewer.prototype._zoom = function(evt) {
  if (this.prop.zooming) {
    var t = [
      { x: parseInt(evt.touches[0].clientX), y: parseInt(evt.touches[0].clientY) },
      { x: parseInt(evt.touches[1].clientX), y: parseInt(evt.touches[1].clientY) }
    ];

    var p = Math.sqrt(Math.pow(t[0].x - t[1].x, 2) + Math.pow(t[0].y - t[1].y, 2));
    var delta = 80 * (p - this.prop.pinch_dist) / this.prop.size.width;

    this.zoom(this.prop.zoom_lvl + delta);

    this.prop.pinch_dist = p;
  }
};

/**
 * The user wants to zoom (wheel version)
 * @param {MouseWheelEvent} evt
 * @private
 */
PhotoSphereViewer.prototype._onMouseWheel = function(evt) {
  evt.preventDefault();
  evt.stopPropagation();

  var delta = evt.deltaY !== undefined ? -evt.deltaY : (evt.wheelDelta !== undefined ? evt.wheelDelta : -evt.detail);

  if (delta !== 0) {
    var direction = parseInt(delta / Math.abs(delta));
    this.zoom(this.prop.zoom_lvl + direction);
  }
};

/**
 * Fullscreen state has changed
 * @private
 */
PhotoSphereViewer.prototype._fullscreenToggled = function() {
  var enabled = this.isFullscreenEnabled();

  if (this.config.keyboard) {
    if (enabled) {
      this.startKeyboardControl();
    }
    else {
      this.stopKeyboardControl();
    }
  }

  this.trigger('fullscreen-updated', enabled);
};

/**
 * Store each mouse position during a mouse move
 * Positions older than "INERTIA_WINDOW" are removed
 * Positions before a pause of "INERTIA_WINDOW" / 10 are removed
 * @param {MouseEvent|Touch} evt
 * @private
 */
PhotoSphereViewer.prototype._logMouseMove = function(evt) {
  var now = Date.now();
  this.prop.mouse_history.push([now, evt.clientX, evt.clientY]);

  var previous = null;

  for (var i = 0; i < this.prop.mouse_history.length;) {
    if (this.prop.mouse_history[0][i] < now - PhotoSphereViewer.INERTIA_WINDOW) {
      this.prop.mouse_history.splice(i, 1);
    }
    else if (previous && this.prop.mouse_history[0][i] - previous > PhotoSphereViewer.INERTIA_WINDOW / 10) {
      this.prop.mouse_history.splice(0, i);
      i = 0;
      previous = this.prop.mouse_history[0][i];
    }
    else {
      i++;
      previous = this.prop.mouse_history[0][i];
    }
  }
};

