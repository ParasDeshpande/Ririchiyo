const BaseCommand = require('../../utils/structures/BaseCommand');
const MusicUtil = require("../../lavalinkClient/musicUtil");
const musicUtil = new MusicUtil;

module.exports = class StopCommand extends BaseCommand {
    constructor() {
        super({
            name: "stop",
            aliases: ["stop", "st"],
            description: "Stop the player",
            category: "music",
        })
    }

    async run({ message }) {
        if (!message.channel.clientPermissions.has("EMBED_LINKS")) return message.channel.send("I don't have permissions to send message embeds in this channel");

        const result = await musicUtil.canModifyPlayer({ message, requiredPerms: "MANAGE_PLAYER", errorEmbed: true });
        if (result.error) return;

        await result.player.queue.clear();
        await result.player.stop();

        message.channel.send(this.embedify(message.guild, `${message.author} Stopped the player and cleared the queue!`));
        if (message.channel.id != result.player.textChannel.id) await result.player.textChannel.send(this.embedify(message.guild, `${message.author} Stopped the player and cleared the queue!`));
    }
}