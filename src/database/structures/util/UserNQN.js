module.exports = class UserNQN {
    constructor(db, NQNData, id) {
        this.subscribedPacks = NQNData.subscribedPacks || [];
        this.addPack = function (packID) {
            this.subscribedPacks.push(packID);
            db.updateOne({ _id: id }, { $push: { "nqn.subscribedPacks": packID } }, { upsert: true })
        }
        this.removePack = function (packID) {
            const index = this.subscribedPacks.indexOf(packID);
            if (index > -1) this.subscribedPacks.splice(index, 1);
            db.updateOne({ _id: id }, { $pull: { "nqn.subscribedPacks": packID } }, { upsert: true })
        }
    }
}