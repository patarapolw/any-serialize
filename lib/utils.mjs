export function isClassConstructor(k) {
    return !!(k.prototype && k.prototype.constructor);
}
export function isClassObject(k) {
    return !!(k.constructor && typeof k.constructor.name === 'string');
}
export function compareNotFalsy(a, b) {
    return !!a && a === b;
}
export function getFunctionName(R) {
    return R.toString().replace(/^function /, '').split('(')[0];
}
export function functionToString(R) {
    return R.toString().replace(/^.+?\{/s, '').replace(/\}.*?$/s, '').trim().replace(/[\t\n\r ]*/g, ' ');
}
/**
 * https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
 *
 * https://stackoverflow.com/a/52171480/9023855
 *
 * @param str
 * @param seed
 */
export function cyrb53(str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed;
    let h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ h1 >>> 16, 2246822507) ^ Math.imul(h2 ^ h2 >>> 13, 3266489909);
    h2 = Math.imul(h2 ^ h2 >>> 16, 2246822507) ^ Math.imul(h1 ^ h1 >>> 13, 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}
/**
 * https://stackoverflow.com/questions/34699529/convert-javascript-class-instance-to-plain-object-preserving-methods
 */
export function extractObjectFromClass(o, exclude = []) {
    const content = {};
    Object.getOwnPropertyNames(o).map((prop) => {
        const val = o[prop];
        if (['constructor', ...exclude].includes(prop)) {
            return;
        }
        content[prop] = val;
    });
    return o;
}