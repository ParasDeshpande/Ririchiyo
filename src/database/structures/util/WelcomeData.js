module.exports = class WelcomeData {
    constructor(db, welcomeData, id) {
        Object.defineProperty(this, "channel", {
            get: function () { return welcomeData.channel },
            set: function (value) {
                if (!value) delete welcomeData.channel;
                else welcomeData.channel = value;
                db.updateOne({ _id: id }, { [value ? `$set` : `$unset`]: { "settings.announcements.welcome.channel": value } }, { upsert: true })
            }
        });
        this.settings = new WelcomeSettings(db, welcomeData.settings, id)
    }
}

class WelcomeSettings {
    constructor(db, welcomeSettingsData, id) {
        this.channel = new WelcomeChannel(db, welcomeSettingsData.channel, id);
        this.DM = new WelcomeDM(db, welcomeSettingsData.DM, id);
    }
}

class WelcomeChannel {
    constructor(db, welcomeChannelData, id) {
        Object.defineProperty(this, "text", {
            get: function () { return welcomeChannelData.text },
            set: function (value) {
                if (!value) delete welcomeChannelData.text;
                else welcomeChannelData.text = value;
                db.updateOne({ _id: id }, { [value ? `$set` : `$unset`]: { "settings.announcements.welcome.settings.channel.text": value } }, { upsert: true })
            }
        });
        this.image = new WelcomeImage(db, welcomeChannelData.image, id)
        this.embed = new WelcomeEmbed(db, welcomeChannelData.embed, id)
    }
}

class WelcomeDM {
    constructor(db, welcomeDMData, id) {
        Object.defineProperty(this, "text", {
            get: function () { return welcomeDMData.text },
            set: function (value) {
                if (!value) delete welcomeDMData.text;
                else welcomeDMData.text = value;
                db.updateOne({ _id: id }, { [value ? `$set` : `$unset`]: { "settings.announcements.welcome.settings.channel.text": value } }, { upsert: true })
            }
        });
        this.image = new WelcomeImage(db, welcomeDMData.image, id, true)
        this.embed = new WelcomeEmbed(db, welcomeDMData.embed, id, true)
    }
}

class WelcomeImage {
    constructor(db, welcomeImageData, id, DM) {
        Object.defineProperty(this, "imageURL", {
            get: function () { return welcomeImageData.imageURL },
            set: function (value) {
                if (!value) delete welcomeImageData.imageURL;
                else welcomeImageData.imageURL = value;
                db.updateOne({ _id: id }, { [value ? `$set` : `$unset`]: { [`settings.announcements.welcome.settings.${DM ? "DM" : "channel"}.embed.imageURL`]: value } }, { upsert: true })
            }
        });
        Object.defineProperty(this, "text", {
            get: function () { return welcomeImageData.text },
            set: function (value) {
                if (!value) delete welcomeImageData.text;
                else welcomeImageData.text = value;
                db.updateOne({ _id: id }, { [value ? `$set` : `$unset`]: { [`settings.announcements.welcome.settings.${DM ? "DM" : "channel"}.embed.imageURL`]: value } }, { upsert: true })
            }
        });
    }
}

class WelcomeEmbed {
    constructor(db, welcomeEmbedData, id, DM) {
        Object.defineProperty(this, "imageURL", {
            get: function () { return welcomeEmbedData.imageURL },
            set: function (value) {
                if (!value) delete welcomeEmbedData.imageURL;
                else welcomeEmbedData.imageURL = value;
                db.updateOne({ _id: id }, { [value ? `$set` : `$unset`]: { [`settings.announcements.welcome.settings.${DM ? "DM" : "channel"}.embed.imageURL`]: value } }, { upsert: true })
            }
        });
        Object.defineProperty(this, "text", {
            get: function () { return welcomeEmbedData.text },
            set: function (value) {
                if (!value) delete welcomeEmbedData.text;
                else welcomeEmbedData.text = value;
                db.updateOne({ _id: id }, { [value ? `$set` : `$unset`]: { [`settings.announcements.welcome.settings.${DM ? "DM" : "channel"}.embed.imageURL`]: value } }, { upsert: true })
            }
        });
    }
}