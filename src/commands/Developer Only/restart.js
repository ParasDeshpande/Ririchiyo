const BaseCommand = require('../../utils/structures/BaseCommand');
const { restart } = require('../../utils/util');

module.exports = class RestartCommand extends BaseCommand {
    constructor() {
        super({
            name: "restart",
            category: "developer",
            description: "Restart the bot",
            requiredPermissionsToView: { internal: ["BOT_OWNER"] }
        })
    }
    async run({ message, clientData }) {
        if (!message.channel.clientPermissions.has("EMBED_LINKS")) return message.channel.send("I don't have permissions to send message embeds in this channel");
        if (!message.author.permissions.internal.final.has("BOT_OWNER")) return message.channel.send(this.embedify(message.guild, "You don't have permission to use that command!", true));

        await restart(message, clientData.restartData);
    }
}