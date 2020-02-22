import { isClassConstructor, getFunctionName, compareNotFalsy, functionToString, cyrb53 } from './utils.mjs';
export class Serialize {
    constructor(
    /**
     * For how to write a replacer and reviver, see
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON
     */
    options = {}) {
        this.registrar = [];
        this.prefix = '__';
        this.stringifyFunction = JSON.stringify;
        this.parseFunction = JSON.parse;
        this.prefix = typeof options.prefix === 'string' ? options.prefix : this.prefix;
        this.stringifyFunction = options.stringify || this.stringifyFunction;
        this.parseFunction = options.parse || this.parseFunction;
        this.register({ item: Date }, {
            item: RegExp,
            toJSON(_this) {
                const { source, flags } = _this;
                return { source, flags };
            },
            fromJSON(current) {
                const { source, flags } = current;
                return new RegExp(source, flags);
            }
        }, WriteOnlyFunctionAdapter, {
            item: Set,
            toJSON(_this) {
                return Array.from(_this);
            }
        });
    }
    /**
     *
     * @param rs Accepts Class constructors or IRegistration
     */
    register(...rs) {
        this.registrar.unshift(...rs.map((r) => {
            if (typeof r === 'function') {
                const { __prefix__: prefix, __key__: key, fromJSON, toJSON } = r;
                return {
                    item: r,
                    prefix,
                    key,
                    fromJSON,
                    toJSON
                };
            }
            return r;
        }).map(({ item: R, prefix, key, toJSON, fromJSON }) => {
            // @ts-ignore
            fromJSON = typeof fromJSON === 'undefined'
                ? (arg) => isClassConstructor(R) ? new R(arg) : arg
                : (fromJSON || undefined);
            key = this.getKey(prefix, key || (isClassConstructor(R)
                ? R.prototype.constructor.name
                : getFunctionName(R)));
            return {
                R,
                key,
                toJSON,
                fromJSON
            };
        }));
    }
    unregister(...rs) {
        this.registrar = this.registrar.filter(({ R, key }) => {
            return !rs.some((r) => {
                if (typeof r === 'function') {
                    return r.constructor === R.constructor;
                }
                else {
                    return compareNotFalsy(r.key, key) || compareNotFalsy(r.item.constructor, R.constructor);
                }
            });
        });
    }
    /**
     *
     * @param obj Uses `JSON.stringify` with sorter Array by default
     */
    stringify(obj) {
        const clonedObj = this.deepCloneAndFindAndReplace(obj);
        const keys = new Set();
        const getAndSortKeys = (a) => {
            if (a) {
                if (typeof a === 'object' && a.constructor.name === 'Object') {
                    for (const k of Object.keys(a)) {
                        keys.add(k);
                        getAndSortKeys(a[k]);
                    }
                }
            }
        };
        getAndSortKeys(clonedObj);
        return this.stringifyFunction(clonedObj, Array.from(keys).sort());
    }
    hash(obj) {
        return cyrb53(this.stringify(obj));
    }
    /**
     *
     * @param repr Uses `JSON.parse` by default
     */
    parse(repr) {
        return this.parseFunction(repr, (_, v) => {
            if (v && typeof v === 'object') {
                for (const { key, fromJSON } of this.registrar) {
                    if (v[key]) {
                        return typeof fromJSON === 'function' ? fromJSON(v[key], v) : v;
                    }
                }
            }
            return v;
        });
    }
    getKey(prefix, name) {
        return (typeof prefix === 'string' ? prefix : this.prefix) + (name || '');
    }
    deepCloneAndFindAndReplace(o) {
        if (o && typeof o === 'object') {
            if (Array.isArray(o)) {
                const obj = [];
                for (const k of o) {
                    obj[k] = this.deepCloneAndFindAndReplace(o[k]);
                }
                return obj;
            }
            else {
                if (o.constructor.name === 'Object') {
                    const obj = {};
                    for (const k of Object.keys(o)) {
                        for (const { R, key, toJSON } of this.registrar) {
                            if (k === key) {
                                const p = {};
                                p[key] = ((toJSON || (R.prototype || {}).toJSON || o.toJSON || o.toString).bind(o))(o, p);
                                obj[k] = p;
                                break;
                            }
                        }
                        if (obj[k] === undefined) {
                            obj[k] = this.deepCloneAndFindAndReplace(o[k]);
                        }
                    }
                    return obj;
                }
                else {
                    for (const { R, key, toJSON } of this.registrar) {
                        if (compareNotFalsy(o.constructor, (R.prototype || {}).constructor) ||
                            compareNotFalsy(this.getKey(o.__prefix__, o.__name__), key)) {
                            const p = {};
                            p[key] = ((toJSON || (R.prototype || {}).toJSON || o.toJSON || o.toString).bind(o))(o, p);
                            return p;
                        }
                    }
                    const content = {};
                    /**
                     * https://stackoverflow.com/questions/34699529/convert-javascript-class-instance-to-plain-object-preserving-methods
                     */
                    Object.getOwnPropertyNames(o).map((prop) => {
                        const val = o[prop];
                        if (['constructor', 'toJSON', 'fromJSON'].includes(prop)) {
                            return;
                        }
                        content[prop] = val;
                    });
                    return {
                        [this.getKey(undefined, o.constructor.name)]: content
                    };
                }
            }
        }
        if (typeof o === 'function') {
            const k = this.getKey(undefined, 'Function');
            const { R, key, toJSON } = this.registrar.filter(({ key }) => key === k)[0] || {};
            const p = {};
            p[key] = ((toJSON || (R.prototype || {}).toJSON || o.toJSON || o.toString).bind(o))(o, p);
            return p;
        }
        return o;
    }
}
export const FullFunctionAdapter = {
    item: Function,
    toJSON: (_this) => functionToString(_this.toString()),
    fromJSON: (content) => {
        // eslint-disable-next-line no-new-func
        return new Function(`return ${content}`)();
    }
};
export const WriteOnlyFunctionAdapter = (() => {
    return Object.assign(Object.assign({}, FullFunctionAdapter), { fromJSON: null });
})();
export * from './mongo.mjs';
export * from './utils.mjs';
