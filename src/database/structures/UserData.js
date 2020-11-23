const { deepMerge } = require('./util/functions');
const defaultData = require('../schemas/User');
const UserPremium = require('./util/UserPremium');
const UserNQN = require('./util/UserNQN');
const UserMusic = require('./util/UserMusic');

module.exports = class UserData {
    constructor(usersCollection, fetchedData, dbFunctions) {
        const data = deepMerge(defaultData, fetchedData);
        Object.defineProperty(this, "username", {
            get: function () { return data.username },
            set: function (value) {
                if (!value) delete data.username;
                else data.username = value;
                usersCollection.updateOne({ _id: data._id }, { [value ? `$set` : `$unset`]: { "username": value } }, { upsert: true })
            }
        });
        Object.defineProperty(this, "discriminator", {
            get: function () { return data.discriminator },
            set: function (value) {
                if (!value) delete data.discriminator;
                else data.discriminator = value;
                usersCollection.updateOne({ _id: data._id }, { [value ? `$set` : `$unset`]: { "discriminator": value } }, { upsert: true })
            }
        });
        Object.defineProperty(this, "avatar", {
            get: function () { return data.avatar },
            set: function (value) {
                if (!value) delete data.avatar;
                else data.avatar = value;
                usersCollection.updateOne({ _id: data._id }, { [value ? `$set` : `$unset`]: { "avatar": value } }, { upsert: true })
            }
        });
        Object.defineProperty(this, "guilds", {
            get: function () { return data.guilds },
            set: function (value) {
                if (!value) delete data.guilds;
                else data.guilds = value;
                usersCollection.updateOne({ _id: data._id }, { [value ? `$set` : `$unset`]: { "guilds": value } }, { upsert: true })
            }
        });
        this.premium = new UserPremium(usersCollection, data.premium, data._id, dbFunctions);
        this.nqn = new UserNQN(usersCollection, data.nqn, data._id);
        this.music = new UserMusic(usersCollection, data.music, data._id, dbFunctions);
    }
}