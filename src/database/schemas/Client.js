const settings = require("../../../config/settings.json");
module.exports = {
    "_id": undefined,
    "activity": {
        "normal": {
            "status": settings.client.activity.normal.status,
            "type": settings.client.activity.normal.type
        },
        "devMode": {
            "status": settings.client.activity.devMode.status,
            "type": settings.client.activity.devMode.type,
            "enabled": settings.client.activity.devMode.enabled
        }
    },
    "restartData": {
        "wasRestarted": undefined,
        "guild": undefined,
        "channel": undefined,
        "author": undefined
    }
}