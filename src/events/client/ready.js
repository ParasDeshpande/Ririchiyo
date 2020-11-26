const BaseEvent = require('../../utils/structures/BaseEvent');
const { handleRestartData } = require('../../utils/util');

module.exports = class ReadyEvent extends BaseEvent {
    constructor() {
        super('ready', 'client');
    }

    async run(client) {
        const clientData = await client.db.getClient(client.user.id);
        await client.lavalinkClient.init(client.user.id);

        await handleRestartData(client, clientData.restartData);

        if (clientData.activity.devMode.enabled) {
            client.user.setActivity(clientData.activity.devMode.status, { type: clientData.activity.devMode.type });
        }
        else {
            client.user.setActivity(clientData.activity.normal.status, { type: clientData.activity.normal.type });
        }

        console.log(`Discord connected: ${client.user.tag}`);
    }
}