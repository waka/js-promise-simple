# js-promise-simple

The simple implementation of CommonJS Promises/A.


## Usage

### From node.js

```javascript
var Promise = require('promise-simple');

Promise.defer()
.next(function() {
  return "ok"; // call after 1000ms.
}, 1000)
.next(function(res) {
  console.log(res); // call after 2000ms, and res is "ok"
}, 2000);
```

### From browser side javascript

```html
<script src="/path/to/promise-simple.js"></script>
```

```javascript
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
};

Promise.when(asyncFunc1, asyncFunc2).then(function(results) {
  console.log(results[0]); // "first"
  console.log(results[1]); // "second"
});
```

### Testing

Using mocha from Node.js.

```sh
$npm test
```

or open "test/browser/promise-simple\_test.html" by some browser.
