
var MiniMap = require("mini-map");
var getPrototypeOf = Object.getPrototypeOf;
var objectPrototype = Object.prototype;

/**
 * Creates a deep copy of any value.  Values, being immutable, are returned
 * without alternation.  Forwards to <code>clone</code> on objects and arrays.
 *
 * @function clone
 * @param {Any} value a value to clone
 * @param {Number} depth an optional traversal depth, defaults to infinity.  A
 * value of <code>0</code> means to make no clone and return the value
 * directly.
 * @param {Map} memo an optional memo of already visited objects to preserve
 * reference cycles.  The cloned object will have the exact same shape as the
 * original, but no identical objects.  Te map may be later used to associate
 * all objects in the original object graph with their corresponding member of
 * the cloned graph.
 * @returns a copy of the value
 */
module.exports = clone;
function clone(value, depth, memo) {
    if (value && value.valueOf) {
        value = value.valueOf();
    }
    if (depth == null) { // null or undefined
        depth = Infinity;
    } else if (depth === 0) {
        return value;
    }
    if (value && typeof value === "object") {
        memo = memo || new MiniMap();
        if (!memo.has(value)) {
            if (value && typeof value.clone === "function") {
                memo.set(value, value.clone(depth, memo));
            } else {
                var prototype = getPrototypeOf(value);
                if (prototype === null || prototype === objectPrototype) {
                    var clone = {};
                    memo.set(value, clone);
                    for (var key in value) {
                        clone[key] = module.exports(value[key], depth - 1, memo);
                    }
                } else {
                    throw new Error("Can't clone " + value);
                }
            }
        }
        return memo.get(value);
    }
    return value;
}

