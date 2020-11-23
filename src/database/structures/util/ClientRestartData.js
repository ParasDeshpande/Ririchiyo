module.exports = class ClientRestartData {
    constructor(db, restartData, id) {
        Object.defineProperty(this, "wasRestarted", {
            get: function () { return restartData.wasRestarted },
            set: function (value) {
                if (!value) delete restartData.wasRestarted;
                else restartData.wasRestarted = value;
                db.updateOne({ _id: id }, { [value ? `$set` : `$unset`]: { "restartData.wasRestarted": value } }, { upsert: true })
            }
        });
        Object.defineProperty(this, "guildID", {
            get: function () { return restartData.guildID },
            set: function (value) {
                if (!value) delete restartData.guildID;
                else restartData.guildID = value;
                db.updateOne({ _id: id }, { [value ? `$set` : `$unset`]: { "restartData.guildID": value } }, { upsert: true })
            }
        });
        Object.defineProperty(this, "channelID", {
            get: function () { return restartData.channelID },
            set: function (value) {
                if (!value) delete restartData.channelID;
                else restartData.channelID = value;
                db.updateOne({ _id: id }, { [value ? `$set` : `$unset`]: { "restartData.channelID": value } }, { upsert: true })
            }
        });
        Object.defineProperty(this, "restartingMessageID", {
            get: function () { return restartData.restartingMessageID },
            set: function (value) {
                if (!value) delete restartData.restartingMessageID;
                else restartData.restartingMessageID = value;
                db.updateOne({ _id: id }, { [value ? `$set` : `$unset`]: { "restartData.restartingMessageID": value } }, { upsert: true })
            }
        });
    }
}