const BaseCommand = require('../../utils/structures/BaseCommand');
const MusicUtil = require("../../lavalinkClient/musicUtil");
const musicUtil = new MusicUtil;
const uniqid = require('uniqid');

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
                if (message.channel.id != message.guild.player.options.textChannelOBJ.id) await message.guild.player.options.textChannelOBJ.send(embedified);
                return;
            }
            else if (message.guild.player && message.guild.player.playing && !message.guild.player.paused) {
                const result = await musicUtil.canModifyPlayer({ message, requiredPerms: "MANAGE_PLAYER", errorEmbed: true });
                if (result.error) return;
                await message.guild.player.pause(true);
                const embedified = this.embedify(message.guild, `${message.author} Paused the player!`);
                await message.channel.send(embedified);
                if (message.channel.id != message.guild.player.options.textChannelOBJ.id) await message.guild.player.options.textChannelOBJ.send(embedified);
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

        const requester = {
            displayName: message.member.nickname ? message.member.nickname : message.author.username,
            mention: `<@${message.author.id}>`,
            requestID: uniqid()
        }
        const res = await player.search(arg, requester);

        if (!res) {
            return await message.channel.send(this.embedify(player.guild, `An error occured while searching the track: \`404 RESPONSE_TIMED_OUT\``, true))
        }
        if (res.loadType === "NO_MATCHES") {
            return await message.channel.send(this.embedify(player.guild, `Could not find any tracks matching your query!`, true))
        }
        if (res.loadType === "LOAD_FAILED") {
            return await message.channel.send(this.embedify(player.guild, `An error occured while searching the track: \`${res.exception ? (res.exception.message ? res.exception.message : "UNKNOWN_ERROR") : "UNKNOWN_ERROR"}\``, true))
        }

        const addedTracks = res.loadType == "SEARCH_RESULT" ? [res.tracks[0]] : res.tracks;

        await player.queue.add(addedTracks);

        const queuedEmbed = new this.discord.MessageEmbed()
            .setColor(this.getClientColour(message.guild));

        if (player.queue.length > 0) {
            switch (res.loadType) {
                case "PLAYLIST_LOADED":
                    queuedEmbed.setDescription(`**[${this.discord.escapeMarkdown(res.playlist.name)}](${res.playlist.uri}) \n(${addedTracks.length} Tracks)**\n\`Added playlist to the queue by - \`${addedTracks[0].requester.mention}\` \``);
                    await message.channel.send(queuedEmbed);
                    if (message.channel.id != player.options.textChannelOBJ.id) player.options.textChannelOBJ.send(queuedEmbed);
                    break;
                default:
                    queuedEmbed.setDescription(`**[${this.discord.escapeMarkdown(addedTracks[0].title)}](${addedTracks[0].uri})**\n\`Added track to the queue by - \`${addedTracks[0].requester.mention}\` \``);
                    await message.channel.send(queuedEmbed);
                    if (message.channel.id != player.options.textChannelOBJ.id) player.options.textChannelOBJ.send(queuedEmbed);
                    break;
            }
        }

        if (!player.playing && !player.paused) await player.play();
    }
}