export function isClass(k) {
    return !!(k.prototype && k.prototype.constructor);
}
export function compareNotFalsy(a, b) {
    return !!a && a === b;
}
export function getFunctionName(R) {
    return R.toString().replace(/^function /, '').split('(')[0];
}
export function functionToString(R) {
    return R.toString().replace(/^.+?\{/s, '').replace(/\}.*$/s, '').trim();
}
