const BaseCommand = require('../../utils/structures/BaseCommand');
const MusicUtil = require("../../lavalinkClient/musicUtil");
const musicUtil = new MusicUtil;
const QueueMessage = require("../../lavalinkClient/queueMessage");
const queueMessage = new QueueMessage();

module.exports = class QueueCommand extends BaseCommand {
    constructor() {
        super({
            name: "queue",
            aliases: ["q"],
            description: "View the music queue",
            category: "music",
            cooldown: 15
        })
    }

    async run({ message }) {
        if (!message.channel.clientPermissions.has("EMBED_LINKS")) return message.channel.send("I don't have permissions to send message embeds in this channel");

        const result = await musicUtil.canModifyPlayer({ message, requiredPerms: "VIEW_QUEUE", errorEmbed: true });
        if (result.error) return;

        if (!result.player.queue.current) return await message.channel.send(this.embedify(message.guild, "There is nothing playing right now!", true));

        queueMessage.send(message, result.player);
    }
}