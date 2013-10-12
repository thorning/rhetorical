var _ = require('underscore');

var asserts;

Rhetorical = function () {
  return this.ask;
}

Rhetorical.prototype.init = function () {
  asserts = undefined;
}

Rhetorical.prototype.ask = function (data) {
  if (!asserts) {
    asserts = _.clone(data);
  }
  if (_.isEqual(asserts, data)) {
    return true;
  }
  throw new Error('not equal');
}


var rhetorical = module.exports = exports = new Rhetorical();