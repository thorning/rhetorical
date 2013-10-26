var rhetorical = require('../../rhetorical');

rhetorical.init({
  file : __dirname + '/.asserts'
});

describe('rhetorical', function () {

  var data = {
      string1 : '1',
      int1    : 1,
      bool1   : true,
      bool2   : false,
      object1 : {
        int2    : 2,
        string2 : '3'
      }
    }

  it ('should work', function () {
    var meta_data = {
      int1 : {
        $exists : true  
      },
      object1 : {
        string2 : {
          $exists : true
        }
      }
    };
    rhetorical('should work', data, meta_data);
  });

  // it ('should also work', function () {
  //   data.int1 = 2;
  //   rhetorical('should also work', data);
  // });

  // it ('should not work', function () {
  //   data.int1 = 2;
  //   rhetorical('should work', data);
  // });

})