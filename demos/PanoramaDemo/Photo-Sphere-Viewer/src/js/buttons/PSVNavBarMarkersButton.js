/**
 * Navigation bar markers button class
 * @param {PSVNavBar} navbar
 * @constructor
 */
function PSVNavBarMarkersButton(navbar) {
  PSVNavBarButton.call(this, navbar);

  this.prop = {
    panelOpened: false,
    panelOpening: false
  };

  this.create();
}

PSVNavBarMarkersButton.prototype = Object.create(PSVNavBarButton.prototype);
PSVNavBarMarkersButton.prototype.constructor = PSVNavBarMarkersButton;

PSVNavBarMarkersButton.id = 'markers';
PSVNavBarMarkersButton.className = 'psv-button psv-button--hover-scale psv-markers-button';
PSVNavBarMarkersButton.icon = 'pin.svg';
PSVNavBarMarkersButton.publicMethods = ['toggleMarkersList', 'showMarkersList', 'hideMarkersList'];

/**
 * Creates the button
 */
PSVNavBarMarkersButton.prototype.create = function() {
  PSVNavBarButton.prototype.create.call(this);

  this.container.title = this.psv.config.lang.markers;

  this.psv.on('open-panel', this);
  this.psv.on('close-panel', this);
};

/**
 * Destroys the button
 */
PSVNavBarMarkersButton.prototype.destroy = function() {
  this.psv.off('open-panel', this);
  this.psv.off('close-panel', this);

  delete this.prop;

  PSVNavBarButton.prototype.destroy.call(this);
};

/**
 * Handle events
 * @param {Event} e
 * @private
 */
PSVNavBarMarkersButton.prototype.handleEvent = function(e) {
  switch (e.type) {
    // @formatter:off
    case 'open-panel': this._onPanelOpened(); break;
    case 'close-panel': this._onPanelClosed(); break;
    // @formatter:on
  }
};

/**
 * Toggles markers list on click
 * @private
 */
PSVNavBarMarkersButton.prototype._onClick = function() {
  this.toggleMarkersList();
};

/**
 * Toggle the visibility of markers list
 */
PSVNavBarMarkersButton.prototype.toggleMarkersList = function() {
  if (this.prop.panelOpened) {
    this.hideMarkersList();
  }
  else {
    this.showMarkersList();
  }
};

/**
 * Open side panel with list of markers
 */
PSVNavBarMarkersButton.prototype.showMarkersList = function() {
  var markers = [];
  for (var id in this.psv.hud.markers) {
    markers.push(this.psv.hud.markers[id]);
  }

  var html = this.psv.config.templates.markersList({
    markers: this.psv.change('render-markers-list', markers),
    config: this.psv.config
  });

  this.prop.panelOpening = true;
  this.psv.panel.showPanel(html, true);

  this.psv.panel.container.querySelector('.psv-markers-list').addEventListener('click', this._onClickItem.bind(this));
};

/**
 * Close side panel
 */
PSVNavBarMarkersButton.prototype.hideMarkersList = function() {
  if (this.prop.panelOpened) {
    this.psv.panel.hidePanel();
  }
};

/**
 * Click on an item
 * @param {MouseEvent} e
 * @private
 */
PSVNavBarMarkersButton.prototype._onClickItem = function(e) {
  var li;
  if (e.target && (li = PSVUtils.getClosest(e.target, 'li')) && li.dataset.psvMarker) {
    this.psv.hud.gotoMarker(li.dataset.psvMarker, 1000);
    this.psv.panel.hidePanel();
  }
};

/**
 * Update status when the panel is updated
 * @private
 */
PSVNavBarMarkersButton.prototype._onPanelOpened = function() {
  if (this.prop.panelOpening) {
    this.prop.panelOpening = false;
    this.prop.panelOpened = true;
  }
  else {
    this.prop.panelOpened = false;
  }

  this.toggleActive(this.prop.panelOpened);
};

/**
 * Update status when the panel is updated
 * @private
 */
PSVNavBarMarkersButton.prototype._onPanelClosed = function() {
  this.prop.panelOpened = false;
  this.prop.panelOpening = false;

  this.toggleActive(this.prop.panelOpened);
};
