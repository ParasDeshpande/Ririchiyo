const defaultData = require('../schemas/Client');
const { deepMerge } = require('./util/functions');
const ClientActivity = require('./util/ClientActivity');

module.exports = class ClientData {
    constructor(clientsCollection, fetchedData) {
        const data = deepMerge(defaultData, fetchedData);
        this.activity = new ClientActivity(clientsCollection, data.activity, data._id)
    }
}