const BaseCommand = require('../../utils/structures/BaseCommand');
const MusicUtil = require("../../lavalinkClient/musicUtil");
const musicUtil = new MusicUtil;

module.exports = class TwentyFourBySevenCommand extends BaseCommand {
    constructor() {
        super({
            name: "24-7",
            aliases: ["247", "24/7"],
            description: "Toggle the 24/7 mode",
            category: "music",
        })
    }

    async run({ message, guildData }) {
        if (!message.channel.clientPermissions.has("EMBED_LINKS")) return message.channel.send("I don't have permissions to send message embeds in this channel");

        const result = await musicUtil.canModifyPlayer({ message, requiredPerms: "MANAGE_PLAYER", errorEmbed: true, noPlayer: true });
        if (result.error) return;
        if (!message.author.permissions.discord.final.has("MANAGE_GUILD")) return message.channel.send(this.embedify(message.guild, "You need to have the `MANAGE_GUILD` permission on this server in order to use that command!", true));

        if (!await guildData.settings.premium.checkIfEnabled()) return message.channel.send(this.embedify(message.guild, `This guild does not have premium enabled!\nIf you are a premium user you can do this by typing \`${message.prefix}boost\``, true));

        guildData.settings.music["24/7"] = !guildData.settings.music["24/7"];

        message.channel.send(this.embedify(message.guild, `${message.author} Set the 24/7 mode to \`${guildData.settings.music["24/7"] ? "ENABLED" : "DISABLED"}\`!`));
        if (result.player && message.channel.id != result.player.options.textChannelOBJ.id) await result.player.options.textChannelOBJ.send(this.embedify(message.guild, `${message.author} Set the 24/7 mode to \`${guildData.settings.music["24/7"] ? "ENABLED" : "DISABLED"}\`!`));
    }
}