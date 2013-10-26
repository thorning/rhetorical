var assert = require('assert');
var rhetorical = require('../../rhetorical');


var test_data = {
  string1 : '1',
  num1    : 1,
  bool1   : true,
  bool2   : false,
  //date1   : new Date(2000, 0, 1),
  object1 : {
    num2    : 2,
    string2 : '2'
  }
}

describe('rhetorical', function () {

  before(function () {
    rhetorical.init({
      file : __dirname + '/.asserts'
    });
  })

  it ('should be equal to test data', function () {
    rhetorical('my test data is', test_data);
  })

  it ('should work for other test_data', function () {
    test_data.num1 = 2;
    rhetorical('my mutated test data is', test_data);
  });

  it ('should work as long as nums exists', function () {
    test_data.num1 = Math.random();
    test_data.object1.num2 = Math.random();
    var meta_data = {
      num1    : {$exists : true},
      object1 : {
        num2 : {$exists : true}
      } 
    }
    rhetorical('my random test data is', test_data, meta_data);
  });

  it ('should work even though i run it later', function () {
    //test_data.date1 = new Date();

    test_data.num1 = 1;
    test_data.object1.num2 = 2;

    var meta_data = {
      date1 : {$exists : true}
    }
    rhetorical('my testdata today is', test_data, meta_data);
  });

  it ('should NOT work', function () {
    test_data.string1 = 'something new';

    //I ask the same question as in the first test, and expect
    //it to fail, as the data has changed
    assert.throws(function () {
      rhetorical('my test data is', test_data);  
    })
    
   });
})