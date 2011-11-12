/**
 * @param {string} name
 * @param {Object} tests
 */
function testCase(name, tests) {
    var successful = 0;
    var testCount = 0;
    var hasSetUp = typeof tests.setUp === 'function';
    var hasTearDown = typeof tests.tearDown === 'function';

    output('<h2>' + name + '</h2>', '#000');

    for (var test in tests) {
        if (!/^test/.test(test)) {
            continue;
        }
        testCount++;

        try {
            if (hasSetUp) {
                tests.setUp();
            }

            tests[test]();
            output(test, '#0c0');

            if (hasTearDown) {
                tests.tearDown();
            }

            successful++;
        } catch (e) {
            output(test + ' failed: ' + e.message, '#c00');
        }
    }

    var color = (successful === testCount) ? '#0c0' : '#c00';

    output('<strong>' + testCount + ' tests, ' + (testCount - successful) + ' failures</strong>', color);
};

/**
 * @param {string} text
 * @param {string} color
 */
function output(text, color) {
    var p = document.createElement('p');
    p.innerHTML = text;
    p.style.color = color;
    document.body.appendChild(p);
}

/**
 * @type {Object}
 */
var assert = {};

/**
 * @param {*} expext
 * @param {*} value
 * @static
 */
assert.equals = function(expect, value) {
    if (expect !== value) {
        var msg = 'Not equal! expect: ' + expect + ', value: ' + value;
        output(msg, '#c00');
        throw Error(msg);
    }
};
