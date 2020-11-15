const BaseCommand = require('../../utils/structures/BaseCommand');
const MusicUtil = require("../../lavalinkClient/musicUtil");
const musicUtil = new MusicUtil;

module.exports = class VolumeCommand extends BaseCommand {
    constructor() {
        super({
            name: "volume",
            aliases: ["vol", "v"],
            description: "Change the player volume",
            category: "music",
        })
    }

    async run({ message, guildData, args }) {
        if (!message.channel.clientPermissions.has("EMBED_LINKS")) return message.channel.send("I don't have permissions to send message embeds in this channel");

        if (!args) {
            return await message.channel.send(this.embedify(message.guild, `The current volume is set to ${message.guild.player ? message.guild.player.volume : guildData.settings.music.volume.value}%`))
        }

        const result = await musicUtil.canModifyPlayer({ message, requiredPerms: "MANAGE_PLAYER", errorEmbed: true, noPlayer: true });
        if (result.error) return;

        const volumeRequested = args[0].replace(/%*/g, "");
        if (isNaN(volumeRequested)) return message.channel.send(this.embedify(message.guild, "Please provide a numeric value to set the volume to!", true));

        const newVolume = parseInt(volumeRequested);

        if (guildData.settings.music.volume.limit == true && newVolume > 100) return await message.channel.send(this.embedify(message.guild, "The volume limit is enabled on this server, the volume cannot be set to a value above 100%", true));
        else if (newVolume > 1000) return message.channel.send(this.embedify(message.guild, "Please provide a valid numeric value between 0 and 1000 to set the volume to!", true));

        if (result.player) result.player.setVolume(newVolume);

        if (message.author.permissions.internal.final.has("MANAGE_PLAYER")) guildData.settings.music.volume.value = newVolume;

        await message.channel.send(this.embedify(message.guild, `${message.author} Set the volume to ${newVolume}%.`));
        if (result.player && message.channel.id != result.player.textChannel.id) await result.player.textChannel.send(this.embedify(message.guild, `${message.author} Set the volume to ${newVolume}%.`));
    }
}