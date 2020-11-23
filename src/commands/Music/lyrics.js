const BaseCommand = require('../../utils/structures/BaseCommand');
const MusicUtil = require("../../lavalinkClient/musicUtil");
const musicUtil = new MusicUtil;
const credentials = require("../../../config/credentials.json");
const { KSoftClient } = require('@ksoft/api');
const ksoft = new KSoftClient(credentials.ksoft.token);

module.exports = class LyricsCommand extends BaseCommand {
    constructor() {
        super({
            name: "lyrics",
            aliases: ["ly"],
            description: "View song lyrics",
            category: "music",
            cooldown: 5
        })
    }

    async run({ message, arg }) {
        if (!message.channel.clientPermissions.has("EMBED_LINKS")) return message.channel.send("I don't have permissions to send message embeds in this channel");

        let permresult;
        if (!arg) {
            permresult = await musicUtil.canModifyPlayer({ message, requiredPerms: "VIEW_QUEUE", errorEmbed: true });
            if (permresult.error) return;
        }

        const result = await ksoft.lyrics.get(arg || permresult.player.queue.current.title).catch(err => { if (err.message == "No results") return; else console.log(err) }) || {};
        const lyrics = result.lyrics;

        if (permresult && !permresult.player.queue.current) return await message.channel.send(this.embedify(message.guild, "There is nothing playing right now!", true));

        const lyricsEmbed = new this.discord.MessageEmbed()
        if (result.lyrics) {
            lyricsEmbed.setTitle(result.name)
                .setColor(this.getClientColour(message.guild))
                .setFooter(`Lyrics provided by KSoft.Si`)
                .setDescription(`${result.artist.name}\n\n` + lyrics);
        }
        else {
            lyricsEmbed.setColor(this.appearance.error.colour)
                .setFooter(`Lyrics provided by KSoft.Si`)
                .setDescription(`No lyrics found for ${arg || permresult.player.queue.current.title}`);
        }

        if (lyricsEmbed.description.length >= 2048) lyricsEmbed.description = `${this.limitLength(lyricsEmbed.description, 2040, true)}`;

        return await message.channel.send(lyricsEmbed).catch(console.error);

    }
}