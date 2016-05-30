var assert = require('assert');
var path = require('path')
var Rhetorical = require('../lib/rhetorical');




describe.only('rhetorical assert file path generation', function () {

  it('should accept false as file parameter', function () {
    var rhetorical = new Rhetorical({
      assert_file : false
    });

    assert.equal(rhetorical.full_asset_file_path, null);
  })

  it('should handle no file or directory name', function () {

    var rhetorical = new Rhetorical({

    });

    var result_path = path.parse(rhetorical.full_asset_file_path);
    var current_file_path = path.parse(__filename);

    //default to same dir as test file
    assert.equal(result_path.dir, current_file_path.dir);

    //remove test file extention and add .assert.json
    assert.equal(result_path.name, current_file_path.name + '.assert');
    assert.equal(result_path.ext, '.json');

  })

  it('should handle only a relative file path', function () {
    var file_name = 'asserts/rhetorical.assert.json';

    var rhetorical = new Rhetorical({
      assert_file : file_name,
    });

    var expected_path = path.resolve(__dirname, file_name)

    assert.equal(rhetorical.full_asset_file_path, expected_path)
  })

  it('should handle only a absolute file path', function () {
    var file_name = path.resolve(__dirname, 'rhetorical.assert.json')

    var rhetorical = new Rhetorical({
      assert_file : file_name,
    });

    assert.equal(rhetorical.full_asset_file_path, file_name)
  })

  it('should handle only a relative directory path', function () {
    var directory_name = 'asserts';

    var rhetorical = new Rhetorical({
      assert_directory : directory_name,
    });

    var current_file_path = path.parse(__filename);

    var expected_path = path.parse(path.resolve(__dirname, directory_name, current_file_path.name + '.assert.json'))
    

    var result_path = path.parse(rhetorical.full_asset_file_path);

    assert.equal(result_path.dir, expected_path.dir);

    //remove test file extention and add .assert.json
    assert.equal(result_path.name, expected_path.name);
    assert.equal(result_path.ext, expected_path.ext);
  })

  it('should handle only a absolute directory path', function () {
    var directory_name = __dirname + '/asserts';

    var rhetorical = new Rhetorical({
      assert_directory : directory_name,
    });

    var current_file_path = path.parse(__filename);

    var result_path = path.parse(rhetorical.full_asset_file_path);

    assert.equal(result_path.dir, directory_name);

    //remove test file extention and add .assert.json
    assert.equal(result_path.name, current_file_path.name + '.assert');
    assert.equal(result_path.ext, '.json');
  })

  //abs abs
  //abs rel
  //rel abs
  //rel rel
})

describe('rhetorical', function () {
  var rhetorical = new Rhetorical({
    //TODO:context, defaults to filename+testtitle
    //TODO: file
    assert_file : 'rhetorical.asserts.json'
  });

  it('should be equal to test data', function () {

    var test_data = 1;

    rhetorical.ask('is test data', test_data);
    rhetorical.ask('is test data', test_data);

    assert.throws(function () {
      test_data = 2;
      rhetorical.ask('is test data', test_data);
    })
    
  })

  it('should be equal to test data', function () {
    //NOTE: because the test share name, it will map to the same rethorical questions
    var test_data = 10;

    assert.throws(function () {
      rhetorical.ask('is test data', test_data);
    })
  })

  it('should be equal to new test data', function () {

    var test_data = {
      data : 'data',
      nested : {
        data : 'data'
      }
    };

    rhetorical.ask('is test data', test_data);
    rhetorical.ask('is test data', test_data);

    assert.throws(function () {
      test_data.data = 'other data'
      rhetorical.ask('is test data', test_data);
    })
  })

})

//TODO: reorder arguments to ask(data, [metadata], [question])