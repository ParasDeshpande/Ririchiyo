const ModlogTypes = require('./ModlogTypeFlags');

module.exports = class ModlogSettings {
    constructor(db, modlogData, id) {
        Object.defineProperty(this, "channel", {
            get: function () { return modlogData.channel },
            set: function (value) {
                if (!value) delete modlogData.channel;
                else modlogData.channel = value;
                db.updateOne({ _id: id }, { [value ? `$set` : `$unset`]: { "settings.announcements.modlog.channel": value } }, { upsert: true })
            }
        });
        this.enabled = new ModlogTypes(modlogData.enabledTypes);
        this.enable = function (types) {
            this.enabled.add(types);
            db.updateOne({ _id: id }, { $set: { "settings.announcements.modlog.enabledTypes": this.enabled.bitfield } }, { upsert: true })
        };
        this.disable = function (types) {
            this.enabled.remove(types);
            db.updateOne({ _id: id }, { $set: { "settings.announcements.modlog.enabledTypes": this.enabled.bitfield } }, { upsert: true })
        };
    }
}