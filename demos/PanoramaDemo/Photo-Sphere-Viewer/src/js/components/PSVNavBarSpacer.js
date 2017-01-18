/**
 * Navbar spacer class
 * @param {PSVNavBar} navbar
 * @param {int} weight
 * @constructor
 */
function PSVNavBarSpacer(navbar, weight) {
  PSVComponent.call(this, navbar);

  this.weight = weight;

  this.create();

  this.container.classList.add('psv-spacer--weight-' + (weight || 5));
}

PSVNavBarSpacer.prototype = Object.create(PSVComponent.prototype);
PSVNavBarSpacer.prototype.constructor = PSVNavBarSpacer;

PSVNavBarSpacer.className = 'psv-spacer';
