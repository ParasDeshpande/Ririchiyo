module.exports = class GuildPremium {
    constructor(db, premiumData, id, dbFunctions) {
        this.renewPermium = async function (duration, type, giftedByID, addedByID) {
            const now = Date.now();
            const renewalData = {
                "renewedOn": now,
                "duration": duration, //The duration of validity
                "expiry": now + duration,
                "type": type, //Type of the renewal [ GIFT | REWARD | PURCHASE ]
                "giftedByID": giftedByID, //When it was gifted else null
                "addedByID": addedByID //The id of the user who added this to the guild
            }
            premiumData.renewals.push(renewalData);
            await db.updateOne({ _id: id }, { $push: { "settings.premium.renewals": renewalData } }, { upsert: true });
        }
        this.checkIfEnabled = function () {
            if (!premiumData.renewals.length) return false;
            return premiumData.renewals[premiumData.renewals.length - 1].expiry > Date.now();
        }
        this.checkIfExpired = function () {
            if (!premiumData.renewals.length) return false;
            return premiumData.renewals[premiumData.renewals.length - 1].expiry <= Date.now();
        }
        this.getLastRenewal = function () {
            return premiumData.renewals[premiumData.renewals.length - 1];
        }
        this.getAllRenewals = function () {
            return premiumData.renewals;
        }
    }
}