const BaseCommand = require('../../utils/structures/BaseCommand');
const MusicUtil = require("../../lavalinkClient/musicUtil");
const musicUtil = new MusicUtil;
const bassboostLowerLimit = -0.25;
const bassboostHigherLimit = 1;
const resetCommands = ["r", "res", "reset", "disable"];
const bassBand = 0;
const bassBands = [0, 1, 2, 3, 4, 5, 6]
const effectivenessOnBand = [100, 95, 75, 68, 50, 40, 30]

module.exports = class BassboostCommand extends BaseCommand {
    constructor() {
        super({
            name: "bassboost",
            aliases: ["bb"],
            description: "Change the bass value",
            category: "music",
        })
    }

    async run({ message, guildData, args }) {
        if (!message.channel.clientPermissions.has("EMBED_LINKS")) return message.channel.send("I don't have permissions to send message embeds in this channel");

        if (!args) {
            return await message.channel.send(this.embedify(message.guild, `The bassboost is set to ${message.guild.player ? message.guild.player.bands[bassBand] : guildData.settings.music.eq.bands[bassBand]}`))
        }

        const result = await musicUtil.canModifyPlayer({ message, requiredPerms: "MANAGE_PLAYER", errorEmbed: true, noPlayer: true });
        if (result.error) return;

        if (isNaN(args[0]) && !resetCommands.includes(args[0])) return message.channel.send(this.embedify(message.guild, "Please provide a numeric value between -0.25 and 1 to set the bassboost to!", true));
        const gainRequested = isNaN(args[0]) ? 0 : parseFloat(parseFloat(args[0]).toFixed(2));

        if (gainRequested > bassboostHigherLimit || gainRequested < bassboostLowerLimit) return message.channel.send(this.embedify(message.guild, "Please provide a numeric value between -0.25 and 1 to set the bassboost to!", true));

        const bandsArray = [];
        for (const index in bassBands) {
            bandsArray.push({ band: bassBands[index], gain: (parseFloat((effectivenessOnBand[index] / 100) * gainRequested)).toFixed(2) });
        }

        if (result.player) result.player.setEQ(bandsArray);

        if (message.author.permissions.internal.final.has("MANAGE_PLAYER")) guildData.settings.music.eq.setEQ(bandsArray);

        await message.channel.send(this.embedify(message.guild, `${message.author} Set the bassboost to ${gainRequested}`));
        if (result.player && message.channel.id != result.player.textChannel.id) await result.player.textChannel.send(this.embedify(message.guild, `${message.author} Set the bassboost to ${gainRequested}`));
    }
}