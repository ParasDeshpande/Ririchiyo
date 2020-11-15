const BaseCommand = require('../../utils/structures/BaseCommand');
const MusicUtil = require("../../lavalinkClient/musicUtil");
const musicUtil = new MusicUtil;

module.exports = class PlayCommand extends BaseCommand {
    constructor() {
        super({
            name: "play",
            aliases: ["p"],
            description: "Play a song using link or query",
            category: "music",
        })
    }

    async run({ message, arg, internalCall, guildData, skipConditions }) {
        if (!message.channel.clientPermissions.has("EMBED_LINKS")) return await message.channel.send("I don't have permissions to send message embeds in this channel");

        const result = await musicUtil.canModifyPlayer({ message, requiredPerms: "ADD_TO_QUEUE", noPlayer: true, errorEmbed: true });
        if (result.error) return { error: result.error };

        if (!arg) {
            if (message.guild.player && !message.guild.player.playing && message.guild.player.queue && message.guild.player.queue.current) {
                const result = await musicUtil.canModifyPlayer({ message, requiredPerms: "MANAGE_PLAYER", errorEmbed: true });
                if (result.error) return;
                await message.guild.player.pause(false);
                const embedified = this.embedify(message.guild, `${message.author} Resumed the player!`);
                await message.channel.send(embedified);
                if (message.channel.id != message.guild.player.textChannel.id) await message.guild.player.textChannel.send(embedified);
                return;
            }
            else if (message.guild.player && message.guild.player.playing && !message.guild.player.paused) {
                const result = await musicUtil.canModifyPlayer({ message, requiredPerms: "MANAGE_PLAYER", errorEmbed: true });
                if (result.error) return;
                await message.guild.player.pause(true);
                const embedified = this.embedify(message.guild, `${message.author} Paused the player!`);
                await message.channel.send(embedified);
                if (message.channel.id != message.guild.player.textChannel.id) await message.guild.player.textChannel.send(embedified);
                return;
            }
            else return await message.channel.send(this.embedify(message.guild, `${message.author} Please provide a song title or link to search for!`, true));
        }

        //if there is no player then summon one
        if (!message.guild.player || !message.guild.me.voice || !message.guild.me.voice.channel) {
            const summon = await message.client.commands.get("summon").run({ message, internalCall: true, guildData });
            if (summon.error) return;
        }

        const player = await message.guild.player;

        const searchingEmbed = new this.discord.MessageEmbed()
            .setTitle(`Searching!`)
            .setColor(this.appearance.processing.colour)

        const searchingMessage = await message.channel.send(searchingEmbed);

        const res = await player.search(arg, message.author);

        const addedTrack = res.loadType == "SEARCH_RESULT" ? res.tracks[0] : res.tracks;

        if (!addedTrack) return searchingMessage.edit(this.embedify(message.guild, `Could not find any results for query "\`${arg}\`"`, true));

        await player.queue.add(addedTrack);

        const queuedEmbed = new this.discord.MessageEmbed()
            .setColor(this.getClientColour(message.guild));

        if (player.queue.length > 0) {
            switch (res.loadType) {
                case "PLAYLIST_LOADED":
                    queuedEmbed.setDescription(`**[${this.discord.escapeMarkdown(res.playlist.name)}](${res.playlist.uri}) \n(${addedTrack.length} Tracks)**\nAdded playlist to the queue by - ${addedTrack[0].requester}`);
                    await searchingMessage.edit(queuedEmbed);
                    if (searchingMessage.channel.id != player.textChannel.id) player.textChannel.send(queuedEmbed);
                    break;
                default:
                    queuedEmbed.setDescription(`**[${this.discord.escapeMarkdown(addedTrack.title)}](${addedTrack.uri})**\nAdded track to the queue by - ${addedTrack.requester}`);
                    await searchingMessage.edit(queuedEmbed);
                    if (searchingMessage.channel.id != player.textChannel.id) player.textChannel.send(queuedEmbed);
                    break;
            }
        }
        else {
            player.playingMessage = searchingMessage;
        }

        if (!player.playing && !player.paused) await player.play();
    }
}