const defaultData = require('../schemas/Client');
const merge = require('deepmerge');
const ClientActivity = require('./util/ClientActivity');
const ClientRestartData = require('./util/ClientRestartData');

module.exports = class ClientData {
    constructor(clientsCollection, fetchedData) {
        const data = merge(defaultData, fetchedData);
        this.activity = new ClientActivity(clientsCollection, data.activity, data._id);
        this.restartData = new ClientRestartData(clientsCollection, data.restartData, data._id);
    }
}