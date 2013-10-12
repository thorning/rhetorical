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
        string2 : '2'
      }
    }

  it ('should work', function () {
    rhetorical('should work', data);
  });

  it ('should not work', function () {
    data.int1 = 2;
    rhetorical('should not work', data);
  });

  it ('should work again', function () {
    data.int1 = 1;
    rhetorical('should work again', data);
  });

})