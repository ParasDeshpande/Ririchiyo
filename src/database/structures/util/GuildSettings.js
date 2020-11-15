const GuildPremium = require('./GuildPremium');
const GuildPermissions = require('./GuildPermissions');
const AnnouncementSettings = require('./AnnouncementSettings');
const MusicSettings = require("./MusicSettings");
const settings = require('../../../../config/settings.json');

module.exports = class GuildSettings {
    constructor(db, settingsData, id) {
        this.premium = new GuildPremium(db, settingsData.premium, id);
        this.permissions = new GuildPermissions(db, settingsData.permissions, id);
        this.announcements = new AnnouncementSettings(db, settingsData.announcements, id);
        this.music = new MusicSettings(db, settingsData.music, id);

        Object.defineProperty(this, "prefix", {
            get: function () { return settingsData.prefix },
            set: function (value) {
                if (!value) settingsData.prefix = settings.client.commands.defaultPrefix;
                else settingsData.prefix = value;
                db.updateOne({ _id: id }, { [value ? `$set` : `$unset`]: { "settings.prefix": value } }, { upsert: true })
            }
        });
        Object.defineProperty(this, "nqn", {
            get: function () { return settingsData.nqn },
            set: function (value) {
                if (!value) delete settingsData.nqn;
                else settingsData.nqn = value;
                db.updateOne({ _id: id }, { [value ? `$set` : `$unset`]: { "settings.nqn": value } }, { upsert: true })
            }
        });
    }
}