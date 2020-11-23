module.exports = class UserPremium {
    constructor(db, premiumData, id, dbFunctions) {
        this.setPremiumToken = async function (tokenID) {
            const token = premiumData.tokenOBJ || await dbFunctions.getPremiumToken(tokenID);
            if (!premiumData.tokenOBJ) premiumData.tokenOBJ = token;
            token.usedByID = id
            await db.updateOne({ _id: id }, { $set: { "premium.token": token.id } }, { upsert: true });
            premiumData.token = tokenID;
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