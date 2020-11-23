const BaseCommand = require('../../utils/structures/BaseCommand');
const MusicUtil = require("../../lavalinkClient/musicUtil");
const musicUtil = new MusicUtil;

module.exports = class NightcoreCommand extends BaseCommand {
    constructor() {
        super({
            name: "nightcore",
            aliases: ["nc"],
            description: "Toggle the nightcore mode",
            category: "music",
        })
    }

    async run({ message }) {
        if (!message.channel.clientPermissions.has("EMBED_LINKS")) return message.channel.send("I don't have permissions to send message embeds in this channel");

        const result = await musicUtil.canModifyPlayer({ message, requiredPerms: "MANAGE_PLAYER", errorEmbed: true });
        if (result.error) return;

        result.player.nightcore = !result.player.nightcore;

        message.channel.send(this.embedify(message.guild, `${message.author} Set the nightcore mode to ${result.player.nightcore}!`));
        if (message.channel.id != result.player.textChannel.id) await result.player.textChannel.send(this.embedify(message.guild, `${message.author} Set the nightcore mode to ${result.player.nightcore}!`));
    }
}