var assert = require('assert');
var path = require('path')
var Rhetorical = require('../lib/rhetorical');




describe('rhetorical assert file path generation', function () {

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

  it('should handle only a relative directory path alternative notation', function () {
    var directory_name = './asserts';

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

  it('should handle absolute file and directory path', function () {
    var directory_name = __dirname + '/asserts';
    var file_name = path.resolve(__dirname, 'rhetorical.assert.json')

    var rhetorical = new Rhetorical({
      assert_directory : directory_name,
      assert_file : file_name
    });

    //Absolute file name should take preference
    assert.equal(rhetorical.full_asset_file_path, file_name);
  })

  it('should handle absolute file and relative directory path', function () {
    var directory_name = 'asserts';
    var file_name = path.resolve(__dirname, 'rhetorical.assert.json')

    var rhetorical = new Rhetorical({
      assert_directory : directory_name,
      assert_file : file_name
    });

    //Absolute file name should take preference
    assert.equal(rhetorical.full_asset_file_path, file_name);
  })

  it('should handle relative file and absolute directory path', function () {
    var directory_name = __dirname + '/asserts';
    var file_name = 'test.assert.json'

    var rhetorical = new Rhetorical({
      assert_directory : directory_name,
      assert_file : file_name,
    });

    var expected_path = path.resolve(directory_name, file_name)

    assert.equal(rhetorical.full_asset_file_path, expected_path);
  })

  it('should handle relative directory and file path', function () {
    var directory_name = 'asserts';
    var file_name = 'test';

    var rhetorical = new Rhetorical({
      assert_directory : directory_name,
      assert_file : file_name,
    });

    var current_file_path = path.parse(__filename);

    var expected_path = path.parse(path.resolve(__dirname, directory_name, file_name))
    
    var result_path = path.parse(rhetorical.full_asset_file_path);

    assert.equal(result_path.dir, expected_path.dir);

    //remove test file extention and add .assert.json
    assert.equal(result_path.name, expected_path.name);
    assert.equal(result_path.ext, expected_path.ext);
  })


})

describe('rhetorical simple primitives', function () {
  var rhetorical = new Rhetorical({
    assert_file : false
  });

  it('should handle simple numbers', function () {

    var test_data = 1;

    var existing_assert = rhetorical.peek();

    //no existing asserts for this test
    assert.equal(existing_assert, null);

    //first ask is rhetorical, and sets the asserts
    rhetorical.ask(test_data);
    existing_assert = rhetorical.peek();
    assert.notEqual(existing_assert, null);

    //next ask with same data should succeed
    rhetorical.ask(test_data);

    assert.throws(function () {
      //ask with different data should fail
      rhetorical.ask(test_data + 1);
    })

    //tell to force success for different data
    rhetorical.tell(test_data + 1);
    rhetorical.ask(test_data + 1);
    
    //old data should now fail
    assert.throws(function () {
      rhetorical.ask(test_data);
    })    
  })

  it('should handle simple strings', function () {

    var test_data = 'test';

    var existing_assert = rhetorical.peek();

    //no existing asserts for this test
    assert.equal(existing_assert, null);

    //first ask is rhetorical, and sets the asserts
    rhetorical.ask(test_data);
    existing_assert = rhetorical.peek();
    assert.notEqual(existing_assert, null);

    //next ask with same data should succeed
    rhetorical.ask(test_data);

    assert.throws(function () {
      //ask with different data should fail
      rhetorical.ask('not' + test_data);
    })

    //tell to force success for different data
    rhetorical.tell('not' + test_data);
    rhetorical.ask('not' + test_data);
    
    //old data should now fail
    assert.throws(function () {
      rhetorical.ask(test_data);
    })    
  })

  it('should handle simple booleans', function () {

    var test_data = true;

    var existing_assert = rhetorical.peek();

    //no existing asserts for this test
    assert.equal(existing_assert, null);

    //first ask is rhetorical, and sets the asserts
    rhetorical.ask(test_data);
    existing_assert = rhetorical.peek();
    assert.notEqual(existing_assert, null);

    //next ask with same data should succeed
    rhetorical.ask(test_data);

    assert.throws(function () {
      //ask with different data should fail
      rhetorical.ask(!test_data);
    })

    //tell to force success for different data
    rhetorical.tell(!test_data);
    rhetorical.ask(!test_data);
    
    //old data should now fail
    assert.throws(function () {
      rhetorical.ask(test_data);
    })    
  })

  it('should handle nulls', function () {

    var test_data = null;

    var existing_assert = rhetorical.peek();

    //no existing asserts for this test
    assert.equal(existing_assert, null);

    //first ask is rhetorical, and sets the asserts
    rhetorical.ask(test_data);
    existing_assert = rhetorical.peek();
    assert.notEqual(existing_assert, null);

    //next ask with same data should succeed
    rhetorical.ask(test_data);

    assert.throws(function () {
      //ask with different data should fail
      rhetorical.ask('not null');
    })

    //tell to force success for different data
    rhetorical.tell('not null');
    rhetorical.ask('not null');
    
    //old data should now fail
    assert.throws(function () {
      rhetorical.ask(test_data);
    })    
  })

  it('should handle undefined', function () {

    var test_data;

    var existing_assert = rhetorical.peek();

    //no existing asserts for this test
    assert.equal(existing_assert, null);

    //first ask is rhetorical, and sets the asserts
    rhetorical.ask(test_data);
    existing_assert = rhetorical.peek();
    assert.notEqual(existing_assert, null);

    //next ask with same data should succeed
    rhetorical.ask(test_data);

    assert.throws(function () {
      //ask with different data should fail
      rhetorical.ask('not null');
    })

    //tell to force success for different data
    rhetorical.tell('not null');
    rhetorical.ask('not null');
    
    //old data should now fail
    assert.throws(function () {
      rhetorical.ask(test_data);
    })    
  })

  it('should handle type changes', function () {

    var test_data_int = 1.5;
    var test_data_string = 'a string';

    var existing_assert = rhetorical.peek();

    //no existing asserts for this test
    assert.equal(existing_assert, null);

    //first ask is rhetorical, and sets the asserts
    rhetorical.ask(test_data_int);
    existing_assert = rhetorical.peek();
    assert.notEqual(existing_assert, null);

    //next ask with same data should succeed
    rhetorical.ask(test_data_int);

    assert.throws(function () {
      //ask with different data should fail
      rhetorical.ask(test_data_string);
    })

    //tell to force success for different data
    rhetorical.tell(test_data_string);
    rhetorical.ask(test_data_string);
    
    //old data should now fail
    assert.throws(function () {
      rhetorical.ask(test_data_int);
    })    
  })

  it('should handle type arrays', function () {

    var test_data = [1, 2, 3];
    var test_data_2 = [1, 3, 2, 4];

    var existing_assert = rhetorical.peek();

    //no existing asserts for this test
    assert.equal(existing_assert, null);

    //first ask is rhetorical, and sets the asserts
    rhetorical.ask(test_data);
    existing_assert = rhetorical.peek();
    assert.notEqual(existing_assert, null);

    //next ask with same data should succeed
    rhetorical.ask(test_data);

    assert.throws(function () {
      //ask with different data should fail
      rhetorical.ask(test_data_2);
    })

    //tell to force success for different data
    rhetorical.tell(test_data_2);
    rhetorical.ask(test_data_2);
    
    //old data should now fail
    assert.throws(function () {
      rhetorical.ask(test_data);
    })
  })

  it('should handle type objects', function () {

    var test_data = {test : 'test'}
    var test_data_2 = {test : 'test', test2 : 'test2'}

    var existing_assert = rhetorical.peek();

    //no existing asserts for this test
    assert.equal(existing_assert, null);

    //first ask is rhetorical, and sets the asserts
    rhetorical.ask(test_data);
    existing_assert = rhetorical.peek();
    assert.notEqual(existing_assert, null);

    //next ask with same data should succeed
    rhetorical.ask(test_data);

    assert.throws(function () {
      //ask with different data should fail
      rhetorical.ask(test_data_2);
    })

    //tell to force success for different data
    rhetorical.tell(test_data_2);
    rhetorical.ask(test_data_2);
    
    //old data should now fail
    assert.throws(function () {
      rhetorical.ask(test_data);
    })
  })
})

describe('rhetorical questions', function () {
  var rhetorical = new Rhetorical({
    assert_file : false
  });

  it('should allow multiple questions in one test', function () {
    var test_data_1 = 1;
    var test_data_2 = 2;

    rhetorical.ask(test_data_1, 'is test data 1');
    rhetorical.ask(test_data_2, 'is test data 2');

    //should still be the case
    rhetorical.ask(test_data_1, 'is test data 1');
    rhetorical.ask(test_data_2, 'is test data 2');

    //oposite should not be the case
    assert.throws(function () {
      rhetorical.ask(test_data_2, 'is test data 1');  
    })
    assert.throws(function () {
      rhetorical.ask(test_data_1, 'is test data 2');    
    })
  })

  //NOTE: depends on the previous test with the same name
  it('should allow multiple questions in one test', function () {
    var test_data_1 = 1;
    var test_data_2 = 2;

    //should still be the case
    rhetorical.ask(test_data_1, 'is test data 1');
    rhetorical.ask(test_data_2, 'is test data 2');

    //oposite should not be the case
    assert.throws(function () {
      rhetorical.ask(test_data_2, 'is test data 1');  
    })
    assert.throws(function () {
      rhetorical.ask(test_data_1, 'is test data 2');    
    })
  })

  it('should allow same questions in one test with new name', function () {
    var test_data_1 = 10;
    var test_data_2 = 20;

    rhetorical.ask(test_data_1, 'is test data 1');
    rhetorical.ask(test_data_2, 'is test data 2');

    //should still be the case
    rhetorical.ask(test_data_1, 'is test data 1');
    rhetorical.ask(test_data_2, 'is test data 2');

    //oposite should not be the case
    assert.throws(function () {
      rhetorical.ask(test_data_2, 'is test data 1');  
    })
    assert.throws(function () {
      rhetorical.ask(test_data_1, 'is test data 2');    
    })
  })

})

describe('rhetorical objects', function (){

  var rhetorical = new Rhetorical({
    assert_file : false
  });

  it('should handle deep changes in object', function () {
    var test_object = {
      integer : 1,
      nested : {
        test : 'test'
      },
      array : [
        {
          test : 'test'
        },
        {
          test : 'test 2'
        }
      ]
    }

    rhetorical.ask(test_object)

    rhetorical.ask(test_object)

    assert.throws(function () {
      test_object.integer = 2;
      rhetorical.ask(test_object)  
    })
    rhetorical.tell(test_object);

    assert.throws(function () {
      test_object.nested.test = 'new test';
      rhetorical.ask(test_object);
    })
    rhetorical.tell(test_object);

    assert.throws(function () {
      test_object.array[0].test = 'new test';
      rhetorical.ask(test_object);
    })

  })
})

describe('rhetorical validators', function () {

  var rhetorical = new Rhetorical({
    assert_file : false
  });

  it('should handle single value validator', function () {

    var validator = function sameLength (test_value, assert_value) {
      return test_value.length == assert_value.length;
    }

    rhetorical.ask('test', validator)
    rhetorical.ask('1234', validator)

    assert.throws(function () {
      rhetorical.ask('12345', validator)  
    })
    
  })

  it('should handle nested validator', function () {

    var validator = function sameLength (test_value, assert_value) {
      return test_value.length == assert_value.length;
    }

    var validators = {
      test : validator,
    }

    var test_object = {
      test : 'test',
      must_match : 10,
    }

    rhetorical.ask(test_object, validators)

    test_object.test = '1234';
    rhetorical.ask(test_object, validators)

    test_object.test = '12345';
    assert.throws(function () {
      rhetorical.ask(test_object, validators)  
    })

    rhetorical.tell(test_object, validators)
    rhetorical.ask(test_object, validators)

    assert.throws(function () {
      test_object.must_match = 20;
      rhetorical.ask(test_object, validators)  
    })
  })

  it('should handle nested object validator', function () {

    var validator = function hasIdKey (test_value) {
      return test_value['id'] != null;
    }

    var validators = {
      test : validator,
    }

    var test_object = {
      test : {
        not_id : 1
      }
    }

    assert.throws(function () {
      rhetorical.ask(test_object, validators)  
    })
    

    test_object.test.id = 1;
    rhetorical.ask(test_object, validators)


    //the validator fails, but not the test
    assert.throws(function () {
      test_object.test = null;
      rhetorical.ask(test_object, validators)  
    })
    

  })

})


//TODO: better validators, better naming, error reporting, chaining

//TODO: retry tests to test file

//TODO: gather stats and report unused and new assets etc.

//look into two validator types, with and without original assert. filter out the ones without first, allowing to handle non-json properties etc.
