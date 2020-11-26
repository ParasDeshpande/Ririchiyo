const BaseCommand = require('../../utils/structures/BaseCommand');
const MusicUtil = require("../../lavalinkClient/musicUtil");
const musicUtil = new MusicUtil;

module.exports = class PauseCommand extends BaseCommand {
    constructor() {
        super({
            name: "pause",
            description: "Pause the player",
            category: "music",
        })
    }

    async run({ message }) {
        if (!message.channel.clientPermissions.has("EMBED_LINKS")) return message.channel.send("I don't have permissions to send message embeds in this channel");

        const result = await musicUtil.canModifyPlayer({ message, requiredPerms: "MANAGE_PLAYER", errorEmbed: true });
        if (result.error) return;

        if (result.player.playing && !result.player.paused) {
            await result.player.pause(true);
            await message.channel.send(this.embedify(message.guild, `${message.author} Paused the player!`));
            if (message.channel.id != result.player.options.textChannelOBJ.id) await result.player.options.textChannelOBJ.send(this.embedify(message.guild, `${message.author} Paused the player!`));
        }
        else if (result.player.paused) await message.channel.send(this.embedify(message.guild, "The player is already paused!", true));
        else await message.channel.send(this.embedify(message.guild, "The player is already paused!", true));
    }
}