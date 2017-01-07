/**
 * Navbar caption class
 * @param {PSVNavBar} navbar
 * @param caption (String)
 * @constructor
 */
function PSVNavBarCaption(navbar, caption) {
  PSVComponent.call(this, navbar);

  this.create();

  this.setCaption(caption);
}

PSVNavBarCaption.prototype = Object.create(PSVComponent.prototype);
PSVNavBarCaption.prototype.constructor = PSVNavBarCaption;

PSVNavBarCaption.className = 'psv-caption';
PSVNavBarCaption.publicMethods = ['setCaption'];

/**
 * Sets the bar caption
 * @param {string} html
 */
PSVNavBarCaption.prototype.setCaption = function(html) {
  if (!html) {
    this.container.innerHTML = '';
  }
  else {
    this.container.innerHTML = html;
  }
};
