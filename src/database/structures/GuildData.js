const GuildSettings = require('./util/GuildSettings');
const { deepMerge } = require('./util/functions');
const defaultData = require('../schemas/Guild');

module.exports = class GuildData {
    constructor(guildsCollection, fetchedData, dbFunctions) {
        const data = deepMerge(defaultData, fetchedData);
        this.settings = new GuildSettings(guildsCollection, data.settings, data._id, dbFunctions);
    }
}