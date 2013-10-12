var _ = require('underscore');
var fs = require('fs-extra');

var state = {};

var rhetorical = function (question, data) {
  var asserts = state.asserts_data[question];
  if (!asserts) {
    state.asserts_data[question] = data;
    fs.outputJsonSync(state.opts.file, state.asserts_data);
    console.log('No data found, adding data');
    state.asserts_data = fs.readJsonSync(state.opts.file);  
    return true;
  }
  if (_.isEqual(asserts, data)) {
    return true;
  }
  throw new Error('not equal');
}

rhetorical.init = function (opts) {
  state.opts = opts;
  if (fs.existsSync(opts.file)) {
    state.asserts_data = fs.readJsonSync(opts.file);  
  } else {
    state.asserts_data = {};
  }
}


module.exports = exports = rhetorical;