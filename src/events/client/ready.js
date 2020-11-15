const BaseEvent = require('../../utils/structures/BaseEvent');
const Database = require('../../database/Database');
const credentials = require('../../../config/credentials.json');
const database = new Database(credentials.mongodb.uri);

module.exports = class ReadyEvent extends BaseEvent {
    constructor() {
        super('ready', 'client');
    }

    async run(client) {
        await database.connect(credentials.mongodb.database);
        const clientData = await database.getClient(client.user.id);

        client.db = database;

        await client.lavalinkClient.init(client);

        if (clientData.activity.devMode.enabled) {
            client.user.setActivity(clientData.activity.devMode.status, { type: clientData.activity.devMode.type });
        }
        else {
            client.user.setActivity(clientData.activity.normal.status, { type: clientData.activity.normal.type });
        }

        console.info(`Logged in on discord as ${client.user.tag}`);
    }
}