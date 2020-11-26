const BaseCommand = require('../../utils/structures/BaseCommand');
const MusicUtil = require("../../lavalinkClient/musicUtil");
const musicUtil = new MusicUtil;
const eqMessage = require("../../lavalinkClient/eqMessage");
const resetCommands = ["r", "res", "reset", "disable"];

module.exports = class EQCommand extends BaseCommand {
    constructor() {
        super({
            name: "equalizer",
            aliases: ["eq"],
            description: "Change or view the eq settings",
            category: "music",
            cooldown: 15
        })
    }

    async run({ message, guildData, args }) {
        if (!message.channel.clientPermissions.has("EMBED_LINKS")) return message.channel.send("I don't have permissions to send message embeds in this channel");

        const result = await musicUtil.canModifyPlayer({ message, requiredPerms: "MANAGE_PLAYER", errorEmbed: true, noPlayer: true });
        if (result.error) return;

        if (args) {
            if (!resetCommands.includes(args[0])) return await message.channel.send(this.embedify(message.guild, "Invalid options provided!", true));

            if (result.player) result.player.clearEQ();
            if (message.author.permissions.internal.final.has("MANAGE_PLAYER")) guildData.settings.music.eq.clearEQ();

            await message.channel.send(this.embedify(message.guild, `${message.author} Successfully reset the EQ settings!`));
            if (result.player && message.channel.id != result.player.options.textChannelOBJ.id) await result.player.options.textChannelOBJ.send(this.embedify(message.guild, `${message.author} Successfully reset the EQ settings!`));
            return;
        }

        if (message.author.permissions.internal.final.has("MANAGE_PLAYER")) return eqMessage(message, false, true, guildData);
        else return eqMessage(message, false, false, guildData);
    }
}