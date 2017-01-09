(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['three', 'D.js', 'uevent', 'doT'], factory);
  }
  else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('three'), require('d.js'), require('uevent'), require('dot'));
  }
  else {
    root.PhotoSphereViewer = factory(root.THREE, root.D, root.uEvent, root.doT);
  }
}(this, function(THREE, D, uEvent, doT) {
"use strict";

@@js

PhotoSphereViewer.Error = PSVError;
PhotoSphereViewer.Utils = PSVUtils;

return PhotoSphereViewer;
}));
