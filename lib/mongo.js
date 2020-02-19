export const MongoDateAdapter = {
    prefix: '',
    key: '$date',
    item: Date,
    fromJSON: (current) => new Date(current)
};
export const MongoRegExpAdapter = {
    prefix: '',
    key: '$regex',
    item: RegExp,
    fromJSON(current, parent) {
        return new RegExp(current, parent.$options);
    },
    toJSON(_this, parent) {
        parent.$options = _this.flags;
        return _this.source;
    }
};
