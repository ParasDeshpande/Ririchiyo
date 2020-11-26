const BaseCommand = require('../../utils/structures/BaseCommand');
const MusicUtil = require("../../lavalinkClient/musicUtil");
const musicUtil = new MusicUtil;

module.exports = class BackCommand extends BaseCommand {
    constructor() {
        super({
            name: "back",
            aliases: ["back", "b", , "previous", "prev"],
            description: "Start playing the previous song",
            category: "music",
        })
    }

    async run({ message }) {
        if (!message.channel.clientPermissions.has("EMBED_LINKS")) return message.channel.send("I don't have permissions to send message embeds in this channel");

        const result = await musicUtil.canModifyPlayer({ message, requiredPerms: "MANAGE_PLAYER", errorEmbed: true });
        if (result.error) return;

        if (!result.player || result.player.trackHistory.length < 1) return message.channel.send(this.embedify(message.guild, "There are no previous tracks!", true));

        await result.player.backTo();

        message.channel.send(this.embedify(message.guild, `${message.author} Started playing the previous track!`));
        if (message.channel.id != result.player.options.textChannelOBJ.id) await result.player.options.textChannelOBJ.send(this.embedify(message.guild, `${message.author} Started playing the previous track!`));
    }
}