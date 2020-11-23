const BaseCommand = require('../../utils/structures/BaseCommand');
const MusicUtil = require("../../lavalinkClient/musicUtil");
const musicUtil = new MusicUtil;

module.exports = class LoopCommand extends BaseCommand {
    constructor() {
        super({
            name: "loop",
            aliases: ["l"],
            description: "Toggle the loop modes",
            category: "music",
        })
    }

    async run({ message, guildData, args }) {
        if (!message.channel.clientPermissions.has("EMBED_LINKS")) return message.channel.send("I don't have permissions to send message embeds in this channel");

        const result = await musicUtil.canModifyPlayer({ message, requiredPerms: "MANAGE_PLAYER", errorEmbed: true, noPlayer: true });
        if (result.error) return;

        switch (args ? parseOptions(args[0]) : (result.player ? result.player.loopType : guildData.settings.music.loop)) {
            default:
                if (result.player) result.player.setQueueRepeat(true);
                if (message.author.permissions.internal.final.has("MANAGE_PLAYER")) guildData.settings.music.loop = "q";
                break;
            case "q":
                if (result.player) result.player.setTrackRepeat(true);
                if (message.author.permissions.internal.final.has("MANAGE_PLAYER")) guildData.settings.music.loop = "t";
                break;
            case "t":
                if (result.player) {
                    result.player.setTrackRepeat(false);
                    result.player.setQueueRepeat(false);
                }
                if (message.author.permissions.internal.final.has("MANAGE_PLAYER")) guildData.settings.music.loop = "d";
                break;
        }

        await message.channel.send(this.embedify(message.guild, `${message.author} Set the loop to ${(result.player ? result.player.loopType : guildData.settings.music.loop) == "d" ? "disabled" : ((result.player ? result.player.loopType : guildData.settings.music.loop) == "t" ? "track" : "queue")}.`));
        if (result.player && message.channel.id != result.player.textChannel.id) await result.player.textChannel.send(this.embedify(message.guild, `${message.author} Set the loop to ${(result.player ? result.player.loopType : guildData.settings.music.loop) == "d" ? "disabled" : ((result.player ? result.player.loopType : guildData.settings.music.loop) == "t" ? "track" : "queue")}.`));
    }
}

function parseOptions(args) {
    switch (args) {
        case "d":
        case "disable":
        case "stop":
        case "off":
        case "no":
            return "t";
        case "t":
        case "track":
        case "song":
        case "this":
        case "current":
        case "one":
        case "playing":
            return "q";
        case "q":
        case "queue":
        case "entire":
        case "all":
        case "playlist":
        case "everything":
            return "d";
        default: return;
    }
}