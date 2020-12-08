module.exports = class UserPremium {
    constructor(db, premiumData, id, dbFunctions) {
        this.boostGuild = async function (guildID) {
            const index = premiumData.boostedGuilds.indexOf(guildID);
            if (index > -1) return premiumData.boostedGuilds;
            premiumData.boostedGuilds.push(guildID);
            await db.updateOne({ _id: id }, { $push: { "premium.boostedGuilds": guildID } }, { upsert: true });
            return premiumData.boostedGuilds;
        }
        this.unboostGuild = async function (guildID) {
            const index = premiumData.boostedGuilds.indexOf(guildID);
            if (index > -1) premiumData.boostedGuilds.splice(index, 1);
            await db.updateOne({ _id: id }, { $pull: { "premium.boostedGuilds": guildID } }, { upsert: true });
            return premiumData.boostedGuilds;
        }

        this.renewPermium = async function (duration, type, giftedByID, allowedBoosts) {
            const now = Date.now();
            const renewalData = {
                "renewedOn": now,
                "duration": duration, //The duration of validity
                "expiry": now + duration,
                "allowedBoosts": allowedBoosts,
                "type": type, //Type of the renewal [ GIFT | REWARD | PURCHASE ]
                "giftedByID": giftedByID //When it was gifted else null
            }
            premiumData.renewals.push(renewalData);
            await db.updateOne({ _id: id }, { $push: { "premium.renewals": renewalData } }, { upsert: true });

            //Renew all previously boosted guilds automatically
            let i = 0;
            for (const guildID of premiumData.boostedGuilds) {
                if (++i > allowedBoosts) break; //If the max boost limit is reaches don't renew any more guilds
                const guildData = await dbFunctions.getGuild(guildID);
                await guildData.settings.premium.renew(duration, type, giftedByID, id)
            }
            return renewalData;
        }
        this.checkIfEnabled = async function () {
            if (!premiumData.renewals.length) return false;
            return premiumData.renewals[premiumData.renewals.length - 1].expiry > Date.now();
        }
        this.checkIfExpired = async function () {
            if (!premiumData.renewals.length) return false;
            return premiumData.renewals[premiumData.renewals.length - 1].expiry <= Date.now();
        }
        this.getLastRenewal = function () {
            return premiumData.renewals[premiumData.renewals.length - 1];
        }
        this.getAllRenewals = function () {
            return premiumData.renewals;
        }
        this.getBoostedGuilds = function () {
            return premiumData.boostedGuilds;
        }
    }
}