import { BaseCommand, CommandCTX } from '../../utils/structures/BaseCommand';
import { MusicUtil } from '../../utils/Utils';
import { VoiceChannel } from 'discord.js';

export default class PlayCommand extends BaseCommand {
    constructor() {
        super({
            name: "play",
            aliases: ["p"],
            category: "music",
            description: "Play a song using link or query."
        })
    }

    async run(ctx: CommandCTX, internalCall: boolean = false, authorVoiceChannel?: VoiceChannel) {
        if (!ctx.permissions.has("EMBED_LINKS")) return await ctx.channel.send("I don't have permissions to send message embeds in this channel");

        const res = MusicUtil.canModifyPlayer({ guild: ctx.guild, member: ctx.member, playerRequired: false, sendError: true, channel: ctx.channel, isSpawnAttempt: false, requiredPermissions: ["ADD_TO_QUEUE"], memberPermissions: ctx.guildSettings.permissions.users.getFor(ctx.member.id).overwrites });
        if (res.error) return res;

        let player = this.globalCTX.lavalinkClient.players.get(ctx.guild.id);

        if (ctx.args.length === 0) {
            if (player && player.playing && player.queue && player.queue.current) {
                const res = MusicUtil.canModifyPlayer({ guild: ctx.guild, member: ctx.member, channel: ctx.channel, requiredPermissions: ["MANAGE_PLAYER"], memberPermissions: ctx.guildSettings.permissions.users.getFor(ctx.member.id).overwrites, playerRequired: true, sendError: true, isSpawnAttempt: false });
                if (res.error) return res;
                player.pause(false);
                const txt = this.utils.embedifyString(ctx.guild, `${ctx.member} Resumed the player!`);
                await ctx.channel.send(txt);
                if (ctx.channel.id !== player.textChannel.id) await player.textChannel.send(txt);
                return;
            }
            else if (player && player.playing && !player.paused) {
                const res = MusicUtil.canModifyPlayer({ guild: ctx.guild, member: ctx.member, channel: ctx.channel, requiredPermissions: ["MANAGE_PLAYER"], memberPermissions: ctx.guildSettings.permissions.users.getFor(ctx.member.id).overwrites, playerRequired: true, sendError: true, isSpawnAttempt: false });
                if (res.error) return res;
                player.pause(true);
                const txt = this.utils.embedifyString(ctx.guild, `${ctx.member} Paused the player!`);
                await ctx.channel.send(txt);
                if (ctx.channel.id !== player.textChannel.id) await player.textChannel.send(txt);
                return;
            }
            else return await ctx.channel.send(this.utils.embedifyString(ctx.guild, `${ctx.member} Please provide a song title or link to search for!`, true));
        }

        //if there is no player then summon one
        if (!player || !ctx.guild.me?.voice || !ctx.guild.me.voice.channel) {
            const summonCommand = this.globalCTX.commands.get("summon");
            if (!summonCommand) return;
            const res = await summonCommand.run(ctx, true);
            if (res.error) return res;
        }
        if (!player) player = this.globalCTX.lavalinkClient.players.get(ctx.guild.id);
        if (!player) return;

        const searchRes = await player.search(ctx.args.join(" "));

        if (!searchRes) {
            return await ctx.channel.send(this.utils.embedifyString(ctx.guild, `An error occured while searching the track: \`404 RESPONSE_TIMED_OUT\``, true));
        }
        if (searchRes.loadType === "NO_MATCHES") {
            return await ctx.channel.send(this.utils.embedifyString(ctx.guild, `Could not find any tracks matching your query!`, true))
        }
        if (searchRes.loadType === "LOAD_FAILED") {
            return await ctx.channel.send(this.utils.embedifyString(ctx.guild, `An error occured while searching the track: \`${searchRes.exception ? (searchRes.exception.message ? searchRes.exception.message : "UNKNOWN_ERROR") : "UNKNOWN_ERROR"}\``, true))
        }

        const addedTracks = searchRes.loadType == "SEARCH_RESULT" ? [searchRes.tracks[0]] : searchRes.tracks;

        player.queue.add(addedTracks);

        const queuedEmbed = new this.utils.discord.MessageEmbed()
            .setColor(this.utils.getClientColour(ctx.guild));

        if (player.queue.length > 0) {
            switch (searchRes.loadType) {
                case "PLAYLIST_LOADED":
                    queuedEmbed.setDescription(`**[${this.utils.discord.Util.escapeMarkdown(searchRes.playlist?.name || "error")}](${""/*searchRes.playlist.uri*/}) \n(${addedTracks.length} Tracks)**\n\`Added playlist to the queue by - \`${addedTracks[0].requester}\` \``);
                    await ctx.channel.send(queuedEmbed);
                    if (ctx.channel.id != player.textChannel.id) player.options.textChannel.send(queuedEmbed);
                    break;
                default:
                    queuedEmbed.setDescription(`**[${this.utils.discord.Util.escapeMarkdown(addedTracks[0].title)}](${addedTracks[0].uri})**\n\`Added track to the queue by - \`${addedTracks[0].requester}\` \``);
                    await ctx.channel.send(queuedEmbed);
                    if (ctx.channel.id != player.textChannel.id) player.options.textChannel.send(queuedEmbed);
                    break;
            }
        }


        if (!player.playing && !player.paused) await player.play();
    }
}