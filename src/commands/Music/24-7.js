const BaseCommand = require('../../utils/structures/BaseCommand');
const MusicUtil = require("../../lavalinkClient/musicUtil");
const musicUtil = new MusicUtil;
const eqMessage = require("../../lavalinkClient/eqMessage");
const resetCommands = ["r", "res", "reset", "disable"];

module.exports = class EQCommand extends BaseCommand {
    constructor() {
        super({
            name: "24-7",
            aliases: ["24/7", "247"],
            description: "Enable 24/7 mode",
            category: "music",
        })
    }

    async run({ message, guildData, args }) {
        if (!message.channel.clientPermissions.has("EMBED_LINKS")) return message.channel.send("I don't have permissions to send message embeds in this channel");

        const result = await musicUtil.canModifyPlayer({ message, requiredPerms: "MANAGE_PLAYER", errorEmbed: true, noPlayer: true });
        if (result.error) return;

        if (!message.author.permissions.discord.final.has("MANAGE_GUILD")) return await message.channel.send(this.embedify("You don't have `MANAGE_GUILD` permission on this server!", true));
    }
}