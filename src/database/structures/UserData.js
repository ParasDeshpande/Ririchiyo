const { deepMerge } = require('./util/functions');
const defaultData = require('../schemas/User');
const UserPremium = require('./util/UserPremium');
const UserNQN = require('./util/UserNQN');
const UserMusic = require('./util/UserMusic');

module.exports = class UserData {
    constructor(usersCollection, fetchedData, dbFunctions) {
        const data = deepMerge(defaultData, fetchedData);
        this.premium = new UserPremium(usersCollection, data.premium, data._id);
        this.nqn = new UserNQN(usersCollection, data.nqn, data._id);
        this.music = new UserMusic(usersCollection, data.music, data._id, dbFunctions);
    }
}