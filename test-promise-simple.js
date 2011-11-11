/**
 * @constructor
 */
var TestRunner = function() {
    this.testsCases_ = [];
};

TestRunner.prototype.run = function() {
    this.testsCases_.forEach(function(testCase) {
        for (prop in testCase) {
            if (typeof testCase[prop] !== 'function') {
                continue;
            }
            if (!prop.match(/test(.+)/) ) {
                continue;
            }
            try {
                testCase.setUp && testCase.setUp();
                var result = a;
            } 
        }
    });
};
