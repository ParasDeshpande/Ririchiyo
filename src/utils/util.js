let deepMerge = (...arguments) => {
    let target = {};
    let merger = (obj) => {
        for (let prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                if (Object.prototype.toString.call(obj[prop]) === '[object Object]') {
                    target[prop] = deepMerge(target[prop], obj[prop]);
                } else {
                    target[prop] = obj[prop];
                }
            }
        }
    };
    for (let i = 0; i < arguments.length; i++) merger(arguments[i]);
    return target;
}

function findIndexWithPropInArray(array, prop, value) {
    for (var i = 0; i < array.length; i += 1) {
        if (array[i][prop] === value) {
            return i;
        }
    }
    return -1;
}


async function checkIfUserVoted(userID) {
}

module.exports = { deepMerge, findIndexWithPropInArray };