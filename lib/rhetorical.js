var fs = require('fs-extra');
var assert = require('assert');
var path = require('path');

var jsondiffpatch = require('jsondiffpatch').create({
  arrays : {
    detectMove : false,
  }
});

var getCallingStack = function () {
  //based on https://github.com/tj/callsite/blob/master/index.js
  //https://github.com/v8/v8/wiki/Stack-Trace-API for CallSite documentation
  var orig = Error.prepareStackTrace;
  Error.prepareStackTrace = function(_, stack){ return stack; };
  var err = new Error;
  Error.captureStackTrace(err, arguments.callee);
  var stack = err.stack;
  Error.prepareStackTrace = orig;
  return stack;
}

var Rhetorical = function (opts) {
  var rhetorical = this;


  if (!global.beforeEach || !global.after) {
    console.log('Rhetorical must be run within mocha')
    return;
  }

  rhetorical.opts = opts || {};

  var calling_file_path = path.parse(getCallingStack()[1].getFileName());

  var assert_directory = opts.assert_directory || './';
  var assert_directory = path.resolve(calling_file_path.dir, assert_directory);

  var assert_file = opts.assert_file;

  if (!assert_file && assert_file !== false) {
    assert_file = calling_file_path.name + '.assert.json'
  }

  if (!assert_file) {
    rhetorical.full_asset_file_path = null;
  } else {
    rhetorical.full_asset_file_path = path.resolve(assert_directory, assert_file)
  }


  rhetorical.loadAssertData();

  beforeEach(function (){
    rhetorical.current_test_title = this.currentTest.fullTitle();
  })

  after(function () {
    //TODO: report unused, created and updated questions
  })
}

Rhetorical.prototype.loadAssertData = function () {
  var rhetorical = this;

  var opts = rhetorical.opts;
  if (fs.existsSync(opts.file)) {
    rhetorical.asserts_data = fs.readJsonSync(opts.file);  
  } else {
    rhetorical.asserts_data = {};
  }
}

Rhetorical.prototype.ask = function (data, validators, question) {
  var rhetorical = this;

  //overload, to accept data, question calls
  if (!question && typeof validators == 'string') {
    question = validators;
    validators = undefined;
  }

  //default question to '?''
  question = question || '?';
  
  var data_json_like = rhetorical.getJsonLikeData(data)

  var assertion_data = rhetorical.getAssertionData(question);

  if (!assertion_data) {
    rhetorical.saveAssertionData(question, data_json_like);
    assertion_data = rhetorical.getAssertionData(question);
  }

  var assert_value = assertion_data.assert_value;

  //if validators is a function, it needs to validate the entire data object
  if (validators && typeof validators == 'function') {
    if (validators(data, assert_value)) {
      return true;
    } else {
      
      var message = "'"+data+"'" + ' failed validation'

      if (validators.name) {
        message += ' for ' + validators.name
      }

      var error = new assert.AssertionError({
        actual   : data,
        expected : assert_value,
        message  : message,
        stackStartFunction : rhetorical.ask,
      });

      error.name = 'RhetoricalValidationError'
      throw error
    }
  }

  if (validators) {
    rhetorical.handleValidators(data_json_like, assert_value, validators);
  }

  var diff = jsondiffpatch.diff(data_json_like, assert_value)

  if (!diff) {
    return true;
  }


  var message = question;


  //TODO: make a RhetoricalError class in own file
  var error = new assert.AssertionError({
    actual   : data_json_like,
    expected : assert_value,
    operator : "==",
    message  : message,
    stackStartFunction : rhetorical.ask,
  });

  error.name = 'RhetoricalError'
  throw error
}

Rhetorical.prototype.tell = function (data, validators, question) {
  var rhetorical = this;
  question = question || '?';

  rhetorical.deleteAssertionData(question);
  return rhetorical.ask(data, validators, question)
}

Rhetorical.prototype.peek = function (question) {
  var rhetorical = this;
  question = question || '?';

  var assertion_data = rhetorical.getAssertionData(question);
  return assertion_data;
}

Rhetorical.prototype.handleValidators = function (data, assert_value, validators) {
  var rhetorical = this;

  var keys = Object.keys(validators);

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var data_object = data[key];
    var assert_object = assert_value[key];
    var validator = validators[key];

    if (typeof validator == 'function') {
      if (!validator(data_object, assert_object)) {
        var message = "'"+data_object+"'" + ' failed validation'

        if (validator.name) {
          message += ' for ' + validator.name
        }

        var error = new assert.AssertionError({
          actual   : data,
          expected : assert_value,
          message  : message,
          stackStartFunction : rhetorical.ask,
        });

        error.name = 'RhetoricalValidationError'
        throw error
      }

      delete data[key];
      delete assert_value[key];

    } else {
      rhetorical.handleValidators(data_object, assert_object, validator)
    }
  }
}

Rhetorical.prototype.getJsonLikeData = function (data) {
  var rhetorical = this;

  if (data === undefined) {
    return data;
  }

  var json_like_data = JSON.parse(JSON.stringify(data));

  return json_like_data;
}

Rhetorical.prototype.getAssertionData = function (question) {
  var rhetorical = this;

  var test_asserts = rhetorical.asserts_data[rhetorical.current_test_title] || {}; 

  return rhetorical.getJsonLikeData(test_asserts[question]);
}

Rhetorical.prototype.saveAssertionData = function (question, data) {
  var rhetorical = this;

  data = rhetorical.getJsonLikeData(data);

  if (!rhetorical.asserts_data[rhetorical.current_test_title]) {
    rhetorical.asserts_data[rhetorical.current_test_title] = {};
  }

  var assert_data = {
    assert_value : data,
    full_test_title : rhetorical.current_test_title,
    question : question,
  }

  rhetorical.asserts_data[rhetorical.current_test_title][question] = assert_data;
  if (rhetorical.full_asset_file_path) {
    fs.outputJsonSync(rhetorical.full_asset_file_path, rhetorical.asserts_data);
    rhetorical.asserts_data = fs.readJsonSync(rhetorical.full_asset_file_path);  
  }
}

Rhetorical.prototype.deleteAssertionData = function (question) {
  var rhetorical = this;

  if (!rhetorical.asserts_data[rhetorical.current_test_title]) {
    return;
  }

  delete rhetorical.asserts_data[rhetorical.current_test_title][question]

  if (rhetorical.full_asset_file_path) {
    fs.outputJsonSync(rhetorical.full_asset_file_path, rhetorical.asserts_data);
    rhetorical.asserts_data = fs.readJsonSync(rhetorical.full_asset_file_path);  
  }
}

module.exports = exports = Rhetorical;