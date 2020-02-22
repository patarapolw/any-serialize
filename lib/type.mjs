export function getTypeofDetailed(a) {
    const typeof_ = typeof a;
    const output = {
        typeof_,
        is: [],
        entry: a
    };
    if (typeof_ === 'object') {
        if (!a) {
            output.is = ['Null'];
        }
        else {
            /**
             * constructor will return Class constructor
             * or Object constructor for an Object
             *
             * The actual constructor name can be accessed via
             * `constructor.name`
             *
             * constructor can checked for equality as well, for example
             * Object === Object
             *
             * Not sure what happens when you `extends` Object or Array
             * in which case, it might be better to check `constructor.name`
             */
            output.id = a.constructor;
            if (output.id === Object) {
                output.is = ['object'];
            }
            else if (output.id === Array) {
                output.is = ['Array'];
                /**
                 * Array.isArray() also includes classes that extend Array
                 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray
                 *
                 * Given a TypedArray instance, false is always returned
                 */
                // } else if (Array.isArray(a)) {
                //   output.is = ['NamedArray']
            }
            else {
                output.is = ['Named'];
            }
        }
    }
    else if (typeof_ === 'function') {
        /**
         * Checking for Class constructor is a difficult topic.
         * https://stackoverflow.com/questions/40922531/how-to-check-if-a-javascript-function-is-a-constructor
         *
         * Probably the safest way is by checking prototype.
         *
         * new a() is more failsafe, but is dangerous. (because you ran a function)
         */
        if (!a.prototype) {
            /**
             * Arrow function doesn't have a prototype
             */
            output.is = ['function'];
        }
        else {
            output.id = a.prototype.constructor;
            if (Object.getOwnPropertyNames(a.prototype).some((el) => el !== 'constructor')) {
                output.description = 'Can also be a class constructor in some cases';
                if (/[A-Z]/.test(a.prototype.constructor.name[0])) {
                    output.is = ['Constructor', 'function'];
                }
                else {
                    output.is = ['function', 'Constructor'];
                }
            }
            else {
                output.is = ['Constructor'];
            }
        }
    }
    else if (typeof_ === 'number') {
        if (isNaN(a)) {
            output.is = ['NaN']; // JSON.stringify returns null
        }
        else if (!isFinite(a)) {
            output.is = ['Infinity']; // JSON.stringify returns null
        }
        else if (Math.round(a) === a) {
            output.description = 'Integer'; // JSON.stringify cannot distinguish, nor do JavaScript
        }
    }
    if (output.is.length === 0) {
        output.is = [typeof_];
    }
    return output;
}
export function isArray(a, t) {
    return (t || getTypeofDetailed(a)).is[0] === 'Array';
}
export function isObject(a, t) {
    return (t || getTypeofDetailed(a).is[0]) === 'object';
}
