/**
 * Navigation bar download button class
 * @param {PSVNavBar} navbar
 * @constructor
 */
function PSVNavBarDownloadButton(navbar) {
  PSVNavBarButton.call(this, navbar);

  this.create();
}

PSVNavBarDownloadButton.prototype = Object.create(PSVNavBarButton.prototype);
PSVNavBarDownloadButton.prototype.constructor = PSVNavBarDownloadButton;

PSVNavBarDownloadButton.id = 'download';
PSVNavBarDownloadButton.className = 'psv-button psv-button--hover-scale psv-download-button';
PSVNavBarDownloadButton.icon = 'download.svg';

/**
 * Creates the button
 */
PSVNavBarDownloadButton.prototype.create = function() {
  PSVNavBarButton.prototype.create.call(this);

  this.container.title = this.psv.config.lang.download;
};

/**
 * Asks the browser to download the panorama source file
 * @private
 */
PSVNavBarDownloadButton.prototype._onClick = function() {
  var link = document.createElement('a');
  link.href = this.psv.config.panorama;
  link.download = this.psv.config.panorama;
  this.psv.container.appendChild(link);
  link.click();
};
