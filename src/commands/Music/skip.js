const BaseCommand = require('../../utils/structures/BaseCommand');
const MusicUtil = require("../../lavalinkClient/musicUtil");
const musicUtil = new MusicUtil;

module.exports = class SkipCommand extends BaseCommand {
    constructor() {
        super({
            name: "skip",
            aliases: ["skip", "s", "next", "n"],
            description: "Skip the current song",
            category: "music",
        })
    }

    async run({ message }) {
        if (!message.channel.clientPermissions.has("EMBED_LINKS")) return message.channel.send("I don't have permissions to send message embeds in this channel");

        const result = await musicUtil.canModifyPlayer({ message, requiredPerms: "MANAGE_PLAYER", errorEmbed: true });
        if (result.error) return;

        await result.player.skipTo();

        message.channel.send(this.embedify(message.guild, `${message.author} Skipped the current song!`));
        if (message.channel.id != result.player.options.textChannelOBJ.id) await result.player.options.textChannelOBJ.send(this.embedify(message.guild, `${message.author} Skipped the current song!`));
    }
}