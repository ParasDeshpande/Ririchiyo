const { deepMerge } = require('./util/functions');
const defaultData = require('../schemas/Token');

module.exports = class PremiumTokenData {
    constructor(tokensCollection, fetchedData) {
        const data = deepMerge(defaultData, fetchedData);
        this.id = data._id;
        this.renewals = data.renewals;
        this.giftable = data.giftable;

        Object.defineProperty(this, "purchasedByID", {
            get: function () { return this.renewals[0].renewedByID },
            set: function () { }
        });

        Object.defineProperty(this, "usedByID", {
            get: function () { return data.usedByID },
            set: function (value) {
                if (!value) delete data.usedByID;
                else data.usedByID = value;
                tokensCollection.updateOne({ _id: data.id }, { [value ? `$set` : `$unset`]: { "usedByID": value } }, { upsert: true })
            }
        });
        Object.defineProperty(this, "expired", {
            get: function () { return this.renewals[this.renewals.length - 1].expiry <= Date.now() },
            set: function () { }
        });
        this.renew = async function (renewedByID, duration, additionalData, allowedBoosts) {
            const renewalOBJ = {
                renewedByID,
                renewedOn: Date.now(),
                expiry: Date.now() + duration,
                allowedBoosts,
                additionalData: additionalData
            };

            this.renewals.push(renewalOBJ);
            await tokensCollection.updateOne({ _id: this.id }, { $push: { "renewals": renewalOBJ } }, { upsert: true });
            return renewalOBJ;
        }

        this.boostedGuilds = data.boostedGuilds || [];
        this.boostGuild = function (guildID) {
            this.boostedGuilds.push(guildID);
            tokensCollection.updateOne({ _id: data._id }, { $push: { "boostedGuilds": guildID } }, { upsert: true })
        }
        this.unBoostGuild = function (guildID) {
            const index = this.boostedGuilds.indexOf(guildID);
            if (index > -1) this.boostedGuilds.splice(index, 1);
            tokensCollection.updateOne({ _id: data._id }, { $pull: { "boostedGuilds": guildID } }, { upsert: true })
        }
    }
}