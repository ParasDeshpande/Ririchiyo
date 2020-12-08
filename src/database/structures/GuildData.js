const GuildSettings = require('./util/GuildSettings');
const merge = require('deepmerge');
const defaultData = require('../schemas/Guild');

module.exports = class GuildData {
    constructor(guildsCollection, fetchedData, dbFunctions) {
        const data = merge(defaultData, fetchedData);
        this.settings = new GuildSettings(guildsCollection, data.settings, data._id, dbFunctions);
    }
}