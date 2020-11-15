module.exports = class UserPremium {
    constructor(db, premiumData, id) {
        Object.defineProperty(this, "token", {
            get: function () { return premiumData.token },
            set: function (value) {
                if (!value) delete premiumData.token;
                else premiumData.token = value;
                db.updateOne({ _id: id }, { [value ? `$set` : `$unset`]: { "premium.token": value } }, { upsert: true })
            }
        });
        Object.defineProperty(this, "expires", {
            get: function () { return premiumData.expires },
            set: function (value) {
                if (!value) delete premiumData.expires;
                else premiumData.expires = value;
                db.updateOne({ _id: id }, { [value ? `$set` : `$unset`]: { "premium.expires": value } }, { upsert: true })
            }
        });
        Object.defineProperty(this, "allowedBoosts", {
            get: function () { return premiumData.allowedBoosts },
            set: function (value) {
                if (!value) delete premiumData.allowedBoosts;
                else premiumData.allowedBoosts = value;
                db.updateOne({ _id: id }, { [value ? `$set` : `$unset`]: { "premium.allowedBoosts": value } }, { upsert: true })
            }
        });
        Object.defineProperty(this, "enabled", {
            get: function () { return (premiumData.expires && premiumData.expires > Date.now()) ? true : false }
        });
        Object.defineProperty(this, "expired", {
            get: function () { return (premiumData.expires && premiumData.expires <= Date.now()) ? true : false }
        });
        this.boostedGuilds = premiumData.boostedGuilds || [];
        this.boostGuild = function (guildID) {
            this.boostedGuilds.push(guildID);
            db.updateOne({ _id: id }, { $push: { "premium.boostedGuilds": guildID } }, { upsert: true })
        }
        this.unBoostGuild = function (guildID) {
            const index = this.boostedGuilds.indexOf(guildID);
            if (index > -1) this.boostedGuilds.splice(index, 1);
            db.updateOne({ _id: id }, { $pull: { "premium.boostedGuilds": guildID } }, { upsert: true })
        }
    }
}