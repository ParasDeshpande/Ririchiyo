const BaseEvent = require('../../utils/structures/BaseEvent');
const CommandHandlerUtil = require("../../utils/commandHandler/CommandHandlerUtil");
const commandHandlerUtil = new CommandHandlerUtil();

module.exports = class MessageEvent extends BaseEvent {
    constructor() {
        super('vote', 'custom');
    }

    async run(client, site, data) {
        switch (site) {
            case 'top.gg':
                const userData = await client.db.getUser(data.userID);
                if (await userData.premium.checkIfEnabled()) {
                    await commandHandlerUtil.sendDirectMessageHandler(client, null, this.embedify(null, `Thank you for voting me on **[top.gg](${this.settings.client.info.externalSites["top.gg"]})**.\nYou already have an active premium subscription.\nVoting rewards are only for free users and do not include some of the paid perks.`, false, this.appearance.general.colour), data.userID);
                }
                else {
                    await userData.premium.renewPermium(43200000, "REWARD", null, 1);
                    await commandHandlerUtil.sendDirectMessageHandler(client, null, this.embedify(null, `Thank you for voting me on **[top.gg](${this.settings.client.info.externalSites["top.gg"]})**.\nYou got 12hr premium as a voting reward.`, false, this.appearance.general.colour), data.userID);
                }
                break;
        }
    }
}