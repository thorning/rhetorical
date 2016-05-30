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

  rhetorical.opts = opts || {};

  var calling_file_path = path.parse(getCallingStack()[1].getFileName());

  var assert_directory = opts.assert_directory || './';
  var assert_directory = path.resolve(calling_file_path.dir, assert_directory);


  var assert_file = opts.assert_file;

  //if file is specified, use that path
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

Rhetorical.prototype.ask = function (question, data, meta_data, opts) {
  var rhetorical = this;

  if (meta_data) {
    rhetorical.checkMetaData(data, meta_data);
  }  
  
  var data_json_like = rhetorical.getJsonLikeData(data, meta_data)

  var assertion_data = rhetorical.getAssertionData(question);

  if (!assertion_data) {
    rhetorical.saveAssertionData(question, data_json_like);
    return true;
  }


  var diff = jsondiffpatch.diff(data_json_like, assertion_data)

  if (!diff) {
    return true;
  }

  var message = question;


  //TODO: make a RhetoricalError class in own file
  var error = new assert.AssertionError({
    actual   : data_json_like,
    expected : assertion_data,
    operator : "==",
    message  : message,
    stackStartFunction : rhetorical.ask,
  });

  error.name = 'RhetoricalError'
  throw error
}

Rhetorical.prototype.tell = function (question, data, meta_data, opts) {
  var rhetorical = this;

  rhetorical.deleteAssertionData(question, opts);
  return rhetorical.ask(question, data, meta_data, opts)
}

Rhetorical.prototype.peek = function (question) {
  var rhetorical = this;

  var assertion_data = rhetorical.getAssertionData(question);
  return assertion_data;
}

Rhetorical.prototype.getJsonLikeData = function (data, meta_data) {
  var rhetorical = this;

  var json_like_data = JSON.parse(JSON.stringify(data));

  //TODO: filter out meta_data
  return json_like_data;
}

Rhetorical.prototype.getAssertionData = function (question) {
  var rhetorical = this;

  var test_asserts = rhetorical.asserts_data[rhetorical.current_test_title] || {}; 

  return test_asserts[question];
}

Rhetorical.prototype.saveAssertionData = function (question, data) {
  var rhetorical = this;

  if (!rhetorical.asserts_data[rhetorical.current_test_title]) {
    rhetorical.asserts_data[rhetorical.current_test_title] = {};
  }

  rhetorical.asserts_data[rhetorical.current_test_title][question] = data;

  if (rhetorical.opts.file) {
    fs.outputJsonSync(rhetorical.opts.file, rhetorical.asserts_data);
    rhetorical.asserts_data = fs.readJsonSync(rhetorical.opts.file);  
  }
}

Rhetorical.prototype.deleteAssertionData = function (question) {
  var rhetorical = this;

  if (!rhetorical.asserts_data[rhetorical.current_test_title]) {
    return;
  }

  delete rhetorical.asserts_data[rhetorical.current_test_title][question]

  if (rhetorical.opts.file) {
    fs.outputJsonSync(rhetorical.opts.file, rhetorical.asserts_data);
    rhetorical.asserts_data = fs.readJsonSync(rhetorical.opts.file);  
  }
}

module.exports = exports = Rhetorical;