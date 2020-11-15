const BaseCommand = require('../../utils/structures/BaseCommand');
const MusicUtil = require("../../lavalinkClient/musicUtil");
const musicUtil = new MusicUtil;

module.exports = class DisconnectCommand extends BaseCommand {
    constructor() {
        super({
            name: "disconnect",
            aliases: ["dc"],
            description: "Make the bot disconnect from your voice channel and clear the queue",
            category: "music",
        })
    }

    async run({ message }) {
        if (!message.channel.clientPermissions.has("EMBED_LINKS")) return message.channel.send("I don't have permissions to send message embeds in this channel");

        const result = await musicUtil.canModifyPlayer({ message, requiredPerms: "MANAGE_PLAYER", errorEmbed: true });
        if (result.error) return;

        if (result.player.playingMessage && !result.player.playingMessage.deleted) await result.player.playingMessage.delete().catch(console.error);
        await result.player.destroy();

        await message.channel.send(this.embedify(message.guild, `${message.author} Successfully disconnected from the voice channel and cleared the queue!`));
        if (message.channel.id != result.player.textChannel.id) await result.player.textChannel.send(this.embedify(message.guild, `${message.author} Successfully disconnected from the voice channel and cleared the queue!`));
    }
}