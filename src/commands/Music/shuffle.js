const BaseCommand = require('../../utils/structures/BaseCommand');
const MusicUtil = require("../../lavalinkClient/musicUtil");
const musicUtil = new MusicUtil;

module.exports = class ShuffleCommand extends BaseCommand {
    constructor() {
        super({
            name: "shuffle",
            aliases: ["shuff"],
            description: "Shuffle the queue",
            category: "music",
        })
    }

    async run({ message }) {
        if (!message.channel.clientPermissions.has("EMBED_LINKS")) return message.channel.send("I don't have permissions to send message embeds in this channel");

        const result = await musicUtil.canModifyPlayer({ message, requiredPerms: "MANAGE_QUEUE", errorEmbed: true });
        if (result.error) return;

        await result.player.queue.shuffle();

        message.channel.send(this.embedify(message.guild, `${message.author} Shuffled the queue!`));
        if (message.channel.id != result.player.textChannel.id) await result.player.textChannel.send(this.embedify(message.guild, `${message.author} Shuffled the queue!`));
    }
}