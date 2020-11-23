const BaseCommand = require('../../utils/structures/BaseCommand');
const MusicUtil = require("../../lavalinkClient/musicUtil");
const musicUtil = new MusicUtil;

module.exports = class ResumeCommand extends BaseCommand {
    constructor() {
        super({
            name: "resume",
            aliases: ["res"],
            description: "Resume the player",
            category: "music",
        })
    }

    async run({ message }) {
        if (!message.channel.clientPermissions.has("EMBED_LINKS")) return message.channel.send("I don't have permissions to send message embeds in this channel");

        const result = await musicUtil.canModifyPlayer({ message, requiredPerms: "MANAGE_PLAYER", errorEmbed: true });
        if (result.error) return;

        if (result.player.paused) {
            await result.player.pause(false);
            await message.channel.send(this.embedify(message.guild, `${message.author} Resumed the player!`));
            if (message.channel.id != result.player.textChannel.id) await result.player.textChannel.send(this.embedify(message.guild, `${message.author} Resumed the player!`));
        }
        else await message.channel.send(this.embedify(message.guild, "The player is already playing!", true));
    }
}