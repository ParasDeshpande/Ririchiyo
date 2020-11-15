module.exports = class GuildPremium {
    constructor(db, premiumData, id) {
        Object.defineProperty(this, "boostedBy", {
            get: function () { return premiumData.boostedBy },
            set: function (value) {
                if (!value) delete premiumData.boostedBy;
                else premiumData.boostedBy = value;
                db.updateOne({ _id: id }, { [value ? `$set` : `$unset`]: { "settings.premium.boostedBy": value } }, { upsert: true })
            }
        });
        Object.defineProperty(this, "expires", {
            get: function () { return premiumData.expires },
            set: function (value) {
                if (!value) delete premiumData.expires;
                else premiumData.expires = value;
                db.updateOne({ _id: id }, { [value ? `$set` : `$unset`]: { "settings.premium.expires": value } }, { upsert: true })
            }
        });
        Object.defineProperty(this, "enabled", {
            get: function () { return (premiumData.expires && premiumData.expires > Date.now()) ? true : false }
        });
        Object.defineProperty(this, "expired", {
            get: function () { return (premiumData.expires && premiumData.expires <= Date.now()) ? true : false }
        });
    }
}