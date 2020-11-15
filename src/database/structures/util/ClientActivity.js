module.exports = class ClientActivity {
    constructor(db, activityData, id) {
        this.normal = new NormalActivity(db, activityData.normal, id);
        this.devMode = new DevModeActivity(db, activityData.devMode, id);
    }
}

class NormalActivity {
    constructor(db, normalActivityData, id) {
        Object.defineProperty(this, "status", {
            get: function () { return normalActivityData.status },
            set: function (value) {
                if (!value) delete normalActivityData.status;
                else normalActivityData.status = value;
                db.updateOne({ _id: id }, { [value ? `$set` : `$unset`]: { "activity.normal.status": value } }, { upsert: true })
            }
        });
        Object.defineProperty(this, "type", {
            get: function () { return normalActivityData.type },
            set: function (value) {
                if (!value) delete normalActivityData.type;
                else normalActivityData.type = value;
                db.updateOne({ _id: id }, { [value ? `$set` : `$unset`]: { "activity.normal.type": value } }, { upsert: true })
            }
        });
    }
}

class DevModeActivity {
    constructor(db, devModeActivityData, id) {
        Object.defineProperty(this, "status", {
            get: function () { return devModeActivityData.status },
            set: function (value) {
                if (!value) delete devModeActivityData.status;
                else devModeActivityData.status = value;
                db.updateOne({ _id: id }, { [value ? `$set` : `$unset`]: { "activity.devMode.status": value } }, { upsert: true })
            }
        });
        Object.defineProperty(this, "type", {
            get: function () { return devModeActivityData.type },
            set: function (value) {
                if (!value) delete devModeActivityData.type;
                else devModeActivityData.type = value;
                db.updateOne({ _id: id }, { [value ? `$set` : `$unset`]: { "activity.devMode.type": value } }, { upsert: true })
            }
        });
        Object.defineProperty(this, "enabled", {
            get: function () { return devModeActivityData.enabled },
            set: function (value) {
                if (!value) delete devModeActivityData.enabled;
                else devModeActivityData.enabled = value;
                db.updateOne({ _id: id }, { [value ? `$set` : `$unset`]: { "activity.devMode.enabled": value } }, { upsert: true })
            }
        });
    }
}