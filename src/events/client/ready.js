const BaseEvent = require('../../utils/structures/BaseEvent');
const { handleRestartData } = require('../../utils/util');
const settings = require('../../../config/settings.json');

module.exports = class ReadyEvent extends BaseEvent {
    constructor() {
        super('ready', 'client');
    }

    async run(client) {
        const clientData = await client.db.getClient(client.user.id);
        await client.lavalinkClient.init(client.user.id);

        await handleRestartData(client, clientData.restartData);

        client.presenceUpdater = {
            clientData,
            client,
            run: async function () {
                try {
                    if (this.clientData.activity.devMode.enabled) await this.client.user.setActivity(this.clientData.activity.devMode.status, { type: this.clientData.activity.devMode.type });
                    else await this.client.user.setActivity(this.clientData.activity.normal.status, { type: this.clientData.activity.normal.type });
                    //const currentActivity = this.client.user.presence.activities[0];
                    //console.log(`Updated the client presence\nType: ${currentActivity ? currentActivity.type : null}\nStatus: ${currentActivity ? currentActivity.name : null}`)
                } catch (err) {
                    console.error(err);
                }
                setTimeout(() => this.run(), settings.client.activity.refreshInterval * 1000);
            }
        };
        client.presenceUpdater.run();
    }
}