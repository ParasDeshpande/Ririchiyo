const WelcomeData = require('./WelcomeData');
const ModlogSettings = require('./ModlogSettings');

module.exports = class AnnouncementSettings {
    constructor(db, announcementsData, id) {
        this.welcome = new WelcomeData(db, announcementsData.welcome, id);
        this.modlog = new ModlogSettings(db, announcementsData.modlog, id)
    }
}