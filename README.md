# js-promise-simple

The simple implementation of CommonJS Promises/A.

## Usage

### For browser side

    <script src="/path/promise-simple.js"></script>
    <script>
    var asyncFunc1 = function() {
        var d = Promise.defer();
        setTimeout(function() {
            d.resolve("first");
        }, 1000);
        return d;
    };
    var asyncFunc2 = function() {
        var d = Promise.defer();
        setTimeout(function() {
            d.resolve("second");
        }, 1000);
        return d;
    }

    Promise.when(asyncFunc1, asyncFunc2)
    .then(function(results) {
        console.log(results[0]); // "first"
        console.log(results[1]); // "second"
    });
    </script>

#### Testing

Open test/promise-simple-test.html by some browser.

### For node.js

    var Promise = require('promise-simple');

    Promise.defer()
    .next(function() {
        return "ok"; // call after 1000ms.
    }, 2000);
    .next(function(res) {
        console.log(res); // call after more 2000ms, and res is "ok"
    }, 2000);

#### Testing

  $ nodeunit test/node-promise-simple-test.js
