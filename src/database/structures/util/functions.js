let deepMerge = (...arguments) => {
    let target = {};
    let merger = (obj) => {
        for (let prop in obj) if (obj.hasOwnProperty(prop))
            if (Object.prototype.toString.call(obj[prop]) === '[object Object]') target[prop] = deepMerge(target[prop], obj[prop]);
            else target[prop] = obj[prop];
    };
    for (let i = 0; i < arguments.length; i++) merger(arguments[i])
    return target;
};

module.exports = { deepMerge };