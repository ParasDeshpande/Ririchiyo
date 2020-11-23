module.exports = class GuildPremium {
    constructor(db, premiumData, id, dbFunctions) {
        this.setPremiumToken = async function (tokenID) {
            const token = premiumData.tokenOBJ || await dbFunctions.getPremiumToken(tokenID);
            if (!premiumData.tokenOBJ) premiumData.tokenOBJ = token;
            await token.boostGuild(id);
            await db.updateOne({ _id: id }, { $set: { "settings.premium.token": token.id } }, { upsert: true });
            premiumData.token = tokenID;
            return token;
        }
        this.removePremiumToken = async function () {
            if (!premiumData.token) return null;
            delete premiumData.token;
            const token = premiumData.tokenOBJ || await dbFunctions.getPremiumToken(premiumData.token);
            if (!premiumData.tokenOBJ) premiumData.tokenOBJ = token;
            await token.unBoostGuild(id);
            await db.updateOne({ _id: id }, { $unset: { "settings.premium.token": null } }, { upsert: true });
            return token;
        }
        this.checkIfEnabled = async function () {
            if (!premiumData.token) return false;

            const token = premiumData.tokenOBJ || await dbFunctions.getPremiumToken(premiumData.token);
            if (!premiumData.tokenOBJ) premiumData.tokenOBJ = token;

            return !premiumData.tokenOBJ.expired;
        }
        this.checkIfExpired = async function () {
            if (!premiumData.token) return false;

            const token = premiumData.tokenOBJ || await dbFunctions.getPremiumToken(premiumData.token);
            if (!premiumData.tokenOBJ) premiumData.tokenOBJ = token;

            return premiumData.tokenOBJ.expired;
        }
        this.fetchTokenData = async function () {
            if (!premiumData.token) return null;

            const token = premiumData.tokenOBJ || await dbFunctions.getPremiumToken(premiumData.token);
            if (!premiumData.tokenOBJ) premiumData.tokenOBJ = token;

            return premiumData.tokenOBJ;
        }
    }
}