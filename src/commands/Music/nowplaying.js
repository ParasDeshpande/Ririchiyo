const BaseCommand = require('../../utils/structures/BaseCommand');
const MusicUtil = require("../../lavalinkClient/musicUtil");
const musicUtil = new MusicUtil;

module.exports = class NowPlayingCommand extends BaseCommand {
    constructor() {
        super({
            name: "nowplaying",
            aliases: ["np"],
            description: "View the current playing song",
            category: "music",
        })
    }

    async run({ message }) {
        if (!message.channel.clientPermissions.has("EMBED_LINKS")) return message.channel.send("I don't have permissions to send message embeds in this channel");

        const result = await musicUtil.canModifyPlayer({ message, requiredPerms: "VIEW_QUEUE", errorEmbed: true });
        if (result.error) return;

        const nowPlayingEmbed = new this.discord.MessageEmbed()
            .setTitle(`${this.appearance.playerEmojis.musical_notes.emoji} Now playing! ${this.appearance.playerEmojis.playing.emoji}`)
            .setDescription(`**[${this.discord.escapeMarkdown(result.player.queue.current.title)}](${result.player.queue.current.uri})**\n\`Added by- \`${result.player.queue.current.requester.mention}\` \``)
            .setColor(this.getClientColour(message.guild))
            .setFooter(`Volume- ${result.player.volume}% • Loop- ${(result.player ? result.player.loopType : guildData.settings.music.loop) == "d" ? "disabled" : ((result.player ? result.player.loopType : guildData.settings.music.loop) == "t" ? "track" : "queue")}`);

        return await message.channel.send(nowPlayingEmbed).catch(console.error);
    }
}