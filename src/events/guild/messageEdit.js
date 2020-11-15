const BaseEvent = require('../../utils/structures/BaseEvent');
const CommandHandler = require('../../utils/commandHandler/commandHandler');
const commandHandler = new CommandHandler;

module.exports = class MessageEditEvent extends BaseEvent {
    constructor() {
        super('messageUpdate', 'client');
    }

    async run(client, oldMessage, newMessage) {
        if (newMessage.author.bot) return;
        if (!newMessage.guild) return;

        commandHandler.execute(newMessage, { editedEvent: true });
    }
}