/**
 * Object representing a marker
 * @param {Object} properties
 * @param {PhotoSphereViewer} psv
 * @constructor
 */
function PSVMarker(properties, psv) {
  if (!properties.id) {
    throw new PSVError('missing marker id');
  }

  if (properties.image && (!properties.width || !properties.height)) {
    throw new PSVError('missing marker width/height');
  }

  if (properties.image || properties.html) {
    if ((!properties.hasOwnProperty('x') || !properties.hasOwnProperty('y')) && (!properties.hasOwnProperty('latitude') || !properties.hasOwnProperty('longitude'))) {
      throw new PSVError('missing marker position, latitude/longitude or x/y');
    }
  }

  // public properties
  this.psv = psv;
  this.visible = true;
  this.lockRotation = false;
  this.dynamicSize = false;

  // private properties
  var _id = properties.id;
  var _type = PSVMarker.getType(properties, false);
  var $el;

  // readonly properties
  Object.defineProperties(this, {
    id: {
      configurable: false,
      enumerable: true,
      get: function() {
        return _id;
      },
      set: function(value) {
      }
    },
    type: {
      configurable: false,
      enumerable: true,
      get: function() {
        return _type;
      },
      set: function(value) {
      }
    },
    $el: {
      configurable: false,
      enumerable: true,
      get: function() {
        return $el;
      },
      set: function(value) {
      }
    },
    _def: {
      configurable: false,
      enumerable: true,
      get: function() {
        return this[_type];
      },
      set: function(value) {
        this[_type] = value;
      }
    }
  });

  // create element
  if (this.isNormal()) {
    $el = document.createElement('div');
  }
  else if (this.isPolygon()) {
    $el = document.createElementNS(PSVHUD.svgNS, 'polygon');
  }
  else {
    $el = document.createElementNS(PSVHUD.svgNS, this.type);
  }

  $el.id = 'psv-marker-' + this.id;
  $el.psvMarker = this;

  this.update(properties);
}

/**
 * Determines the type of a marker by the available properties
 * @param {object} properties
 * @param {boolean} allowNone
 * @returns {string}
 */
PSVMarker.getType = function(properties, allowNone) {
  var definitions = ['image', 'html', 'polygon_px', 'polygon_rad', 'rect', 'circle', 'ellipse', 'path'];

  var found = [];
  definitions.forEach(function(type) {
    if (properties[type]) {
      found.push(type);
    }
  });

  if (found.length === 0 && !allowNone) {
    throw new PSVError('missing marker content, either ' + definitions.join(', '));
  }
  else if (found.length > 1) {
    throw new PSVError('multiple marker content, either ' + definitions.join(', '));
  }

  return found[0];
};

/**
 * Is it a normal marker (image or html)
 * @returns {boolean}
 */
PSVMarker.prototype.isNormal = function() {
  return this.type == 'image' || this.type == 'html';
};

/**
 * Is it a polygon marker
 * @returns {boolean}
 */
PSVMarker.prototype.isPolygon = function() {
  return this.type == 'polygon_px' || this.type == 'polygon_rad';
};

/**
 * Is it an SVG marker
 * @returns {boolean}
 */
PSVMarker.prototype.isSvg = function() {
  return this.type == 'rect' || this.type == 'circle' || this.type == 'ellipse' || this.type == 'path';
};

/**
 * Update the marker with new or current properties
 * @param {object} [properties]
 */
PSVMarker.prototype.update = function(properties) {
  // merge objects
  if (properties && properties !== this) {
    var newType = PSVMarker.getType(properties, true);

    if (newType !== undefined && newType !== this.type) {
      throw new PSVError('cannot change marker type');
    }

    PSVUtils.deepmerge(this, properties);
  }

  // reset CSS class
  if (this.isNormal()) {
    this.$el.setAttribute('class', 'psv-marker psv-marker--normal');
  }
  else {
    this.$el.setAttribute('class', 'psv-marker psv-marker--svg');
  }

  // add CSS classes
  if (this.className) {
    PSVUtils.addClasses(this.$el, this.className);
  }
  if (this.tooltip) {
    this.$el.classList.add('has-tooltip');
    if (typeof this.tooltip === 'string') {
      this.tooltip = { content: this.tooltip };
    }
  }

  // apply style
  if (this.style) {
    PSVUtils.deepmerge(this.$el.style, this.style);
  }

  // parse anchor
  this.anchor = PSVUtils.parsePosition(this.anchor);
  this.$el.style.transformOrigin = this.anchor.left * 100 + '% ' + this.anchor.top * 100 + '%';

  if (this.isNormal()) {
    this._updateNormal();
  }
  else if (this.isPolygon()) {
    this._updatePolygon();
  }
  else {
    this._updateSvg();
  }
};

/**
 * Update a normal marker
 * @private
 */
PSVMarker.prototype._updateNormal = function() {
  if (this.width && this.height) {
    this.$el.style.width = this.width + 'px';
    this.$el.style.height = this.height + 'px';
    this.dynamicSize = false;
  }
  else {
    this.dynamicSize = true;
  }

  if (this.image) {
    this.$el.style.backgroundImage = 'url(' + this.image + ')';
  }
  else {
    this.$el.innerHTML = this.html;
  }

  // convert texture coordinates to spherical coordinates
  this.psv.cleanPosition(this);

  // compute x/y/z position
  this.position3D = this.psv.sphericalCoordsToVector3(this.longitude, this.latitude);
};

/**
 * Update an SVG marker
 * @private
 */
PSVMarker.prototype._updateSvg = function() {
  this.dynamicSize = true;

  // set content
  switch (this.type) {
    case 'rect':
      if (typeof this._def == 'number') {
        this._def = {
          x: 0,
          y: 0,
          width: this._def,
          height: this._def
        };
      }
      else if (Array.isArray(this._def)) {
        this._def = {
          x: 0,
          y: 0,
          width: this._def[0],
          height: this._def[1]
        };
      }
      else {
        this._def.x = this._def.y = 0;
      }
      break;

    case 'circle':
      if (typeof this._def == 'number') {
        this._def = {
          cx: this._def,
          cy: this._def,
          r: this._def
        };
      }
      else if (Array.isArray(this._def)) {
        this._def = {
          cx: this._def[0],
          cy: this._def[0],
          r: this._def[0]
        };
      }
      else {
        this._def.cx = this._def.cy = this._def.r;
      }
      break;

    case 'ellipse':
      if (typeof this._def == 'number') {
        this._def = {
          cx: this._def,
          cy: this._def,
          rx: this._def,
          ry: this._def
        };
      }
      else if (Array.isArray(this._def)) {
        this._def = {
          cx: this._def[0],
          cy: this._def[1],
          rx: this._def[0],
          ry: this._def[1]
        };
      }
      else {
        this._def.cx = this._def.rx;
        this._def.cy = this._def.ry;
      }
      break;

    case 'path':
      if (typeof this._def == 'string') {
        this._def = {
          d: this._def
        };
      }
      break;
  }

  Object.getOwnPropertyNames(this._def).forEach(function(prop) {
    this.$el.setAttributeNS(null, prop, this._def[prop]);
  }, this);

  // set style
  if (this.svgStyle) {
    Object.getOwnPropertyNames(this.svgStyle).forEach(function(prop) {
      this.$el.setAttributeNS(null, prop, this.svgStyle[prop]);
    }, this);
  }
  else {
    this.$el.setAttributeNS(null, 'fill', 'rgba(0,0,0,0.5)');
  }

  // convert texture coordinates to spherical coordinates
  this.psv.cleanPosition(this);

  // compute x/y/z position
  this.position3D = this.psv.sphericalCoordsToVector3(this.longitude, this.latitude);
};

/**
 * Update a polygon marker
 * @private
 */
PSVMarker.prototype._updatePolygon = function() {
  this.dynamicSize = true;

  // set style
  if (this.svgStyle) {
    Object.getOwnPropertyNames(this.svgStyle).forEach(function(prop) {
      this.$el.setAttributeNS(null, prop, this.svgStyle[prop]);
    }, this);
  }
  else {
    this.$el.setAttributeNS(null, 'fill', 'rgba(0,0,0,0.5)');
  }

  // fold arrays: [1,2,3,4] => [[1,2],[3,4]]
  [this.polygon_rad, this.polygon_px].forEach(function(polygon) {
    if (polygon && typeof polygon[0] != 'object') {
      for (var i = 0; i < polygon.length; i++) {
        polygon.splice(i, 2, [polygon[i], polygon[i + 1]]);
      }
    }
  });

  // convert texture coordinates to spherical coordinates
  if (this.polygon_px) {
    this.polygon_rad = this.polygon_px.map(function(coord) {
      var sphericalCoords = this.psv.textureCoordsToSphericalCoords(coord[0], coord[1]);
      return [sphericalCoords.longitude, sphericalCoords.latitude];
    }, this);
  }
  // clean angles
  else {
    this.polygon_rad = this.polygon_rad.map(function(coord) {
      return [
        PSVUtils.parseAngle(coord[0]),
        PSVUtils.stayBetween(PSVUtils.parseAngle(coord[1], -Math.PI), -PSVUtils.HalfPI, PSVUtils.HalfPI)
      ];
    });
  }

  // TODO : compute the center of the polygon
  this.longitude = this.polygon_rad[0][0];
  this.latitude = this.polygon_rad[0][1];

  // compute x/y/z positions
  this.positions3D = this.polygon_rad.map(function(coord) {
    return this.psv.sphericalCoordsToVector3(coord[0], coord[1]);
  }, this);
};
