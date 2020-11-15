module.exports = class MusicSettings {
    constructor(db, musicSettingsData, id) {
        this.volume = new Volume(db, musicSettingsData.volume, id);
        this.eq = new EQSettings(db, musicSettingsData.eq, id)
        Object.defineProperty(this, "votingPercentage", {
            get: function () { return musicSettingsData.votingPercentage },
            set: function (value) {
                if (!value) delete musicSettingsData.votingPercentage;
                else musicSettingsData.votingPercentage = value;
                db.updateOne({ _id: id }, { [value ? `$set` : `$unset`]: { "settings.music.votingPercentage": value } }, { upsert: true })
            }
        });
        Object.defineProperty(this, "loop", {
            get: function () { return musicSettingsData.loop },
            set: function (value) {
                if (!value) delete musicSettingsData.loop;
                else musicSettingsData.loop = value;
                db.updateOne({ _id: id }, { [value ? `$set` : `$unset`]: { "settings.music.loop": value } }, { upsert: true })
            }
        });
        Object.defineProperty(this, "24/7", {
            get: function () { return musicSettingsData.loop },
            set: function (value) {
                if (!value) delete musicSettingsData["24/7"];
                else musicSettingsData["24/7"] = value;
                db.updateOne({ _id: id }, { [value ? `$set` : `$unset`]: { "settings.music.24/7": value } }, { upsert: true })
            }
        });
    }
}

class Volume {
    constructor(db, volumeSettingsData, id) {
        Object.defineProperty(this, "value", {
            get: function () { return volumeSettingsData.value },
            set: function (value) {
                if (!value) delete volumeSettingsData.value;
                else volumeSettingsData.value = value;
                db.updateOne({ _id: id }, { [value ? `$set` : `$unset`]: { "settings.music.volume.value": value } }, { upsert: true })
            }
        });
        Object.defineProperty(this, "limit", {
            get: function () { return volumeSettingsData.limit },
            set: function (value) {
                if (!value) delete volumeSettingsData.limit;
                else volumeSettingsData.limit = value;
                db.updateOne({ _id: id }, { [value ? `$set` : `$unset`]: { "settings.music.volume.limit": value } }, { upsert: true })
            }
        });
    }
}

class EQSettings {
    constructor(db, eqSettingsData, id) {
        this.bands = eqSettingsData.bands || new Array(15).fill(0.0);
        this.setEQ = function (bands) {
            for (const { band, gain } of bands) this.bands[band] = gain;
            db.updateOne({ _id: id }, { $set: { "settings.music.eq.bands": this.bands } }, { upsert: true });
            return this;
        }
        this.clearEQ = function () {
            const bands = new Array(15).fill(0.0).map((value, index) => { return { band: index, gain: value } });
            return this.setEQ(bands);
        }
    }
}