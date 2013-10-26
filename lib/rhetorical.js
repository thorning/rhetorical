var _ = require('underscore');
var fs = require('fs-extra');
var assert = require('assert');
var chai = require('chai')

var rhetorical = function (question, data, meta_data) {
  return rhetorical.ask(question, data, meta_data);
}

rhetorical.state = {};

rhetorical.init = function (opts) {
  var rhetorical = this;

  rhetorical.state = {};
  rhetorical.state.opts = opts;
  rhetorical.read_assert_data();
}

rhetorical.read_assert_data = function () {
  var rhetorical = this;

  var state = rhetorical.state;
  var opts = state.opts;
  if (fs.existsSync(opts.file)) {
    state.asserts_data = fs.readJsonSync(opts.file);  
  } else {
    state.asserts_data = {};
  }
}

rhetorical.ask = function (question, data, meta_data) {
  var rhetorical = this;

  rhetorical.matches_meta_data(data, meta_data);

  data = rhetorical.get_exact_match_json(data, meta_data);

  var assertion = rhetorical.get_assertion_data(question);

  if (!assertion) {
    rhetorical.save_assertion_data(question, data);
    console.warn('no assertions found, added data', data);
    return true;
  }
  if (_.isEqual(assertion, data)) {
    return true;
  }
  // throw new assert.AssertionError({
  //   actual   : data,
  //   expected : assertion,
  //   operator : "==",
  //   stackStartFunction : rhetorical
  // });
  chai.expect(data).to.deep.equal(assertion);
}

rhetorical.matches_meta_data = function (data, meta_data) {
  var rhetorical = this;

  if (!meta_data) {
    return true;
  }

  var keys = _.keys(meta_data);
  _.each(keys, function (key) {
    if (meta_data[key]['$exists'] != null && data[key] == null) {
      chai.expect(data).to.have.property(key)
    }
    if (_.isObject(meta_data[key]) && _.keys(meta_data[key]).length > 0) {
      rhetorical.matches_meta_data(data[key], meta_data[key]);
    }
  })
  return true;
}

rhetorical.get_exact_match_json = function (data, meta_data) {
  var rhetorical = this;

  var result = JSON.parse(JSON.stringify(data));

  remove_meta_keys(result, meta_data);

  return result;
}

function remove_meta_keys (data, meta_data) {
  if (!meta_data) {
    return;
  }
  var keys = _.keys(meta_data);
  _.each(keys, function (key) {
    if (should_delete(meta_data[key])) {
      delete data[key];
    }
    else if (_.isObject(meta_data[key]) && _.keys(meta_data[key]).length > 0) {
      remove_meta_keys(data[key], meta_data[key]);
    }
  })
}

function should_delete (meta_data_object) {
  var keys = _.keys(meta_data_object);
  var res = false;
  _.each(keys, function (key) {
    if (_.first(key) == "$") {
      res = true;
    }
  })
  return res;
}

rhetorical.get_assertion_data = function (question) {
  var rhetorical = this;
  return rhetorical.state.asserts_data[question];
}

rhetorical.save_assertion_data = function (question, data) {
  var rhetorical = this;

  var state = rhetorical.state;
  state.asserts_data[question] = data;
  fs.outputJsonSync(state.opts.file, state.asserts_data);
  state.asserts_data = fs.readJsonSync(state.opts.file);  
}
module.exports = exports = rhetorical;