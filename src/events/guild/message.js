const BaseEvent = require('../../utils/structures/BaseEvent');
const CommandHandler = require('../../utils/commandHandler/commandHandler');
const commandHandler = new CommandHandler;

module.exports = class MessageEvent extends BaseEvent {
    constructor() {
        super('message', 'client');
    }

    async run(client, message) {
        if (message.author.bot) return;
        if (!message.guild) return;

        commandHandler.execute(message);
    }
}