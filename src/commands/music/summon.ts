import { BaseCommand, CommandCTX } from '../../utils/structures/BaseCommand';
import { MusicUtil } from '../../utils/Utils';
import InternalPermissions from '../../database/utils/InternalPermissions';
import { VoiceChannel } from 'discord.js';

export default class SummonCommand extends BaseCommand {
    constructor() {
        super({
            name: "summon",
            aliases: ["join", "j"],
            category: "music",
            description: "Make the bot join your channel."
        })
    }

    async run(ctx: CommandCTX, internalCall: boolean = false, authorVoiceChannel?: VoiceChannel) {
        if (!ctx.permissions.has("EMBED_LINKS")) return await ctx.channel.send("I don't have permissions to send message embeds in this channel");

        if (!authorVoiceChannel) {
            const conditions = await this.testConditions(ctx);
            if (conditions.error) return conditions;
            else authorVoiceChannel = conditions.authorVoiceChannel;
        }

        const { channel: meVoiceChannel } = ctx.guild.me?.voice || {};
        let player = this.globalCTX.lavalinkClient.players.get(ctx.guild.id);

        if (player && !meVoiceChannel) {
            if (!internalCall) {
                const reconnectedEmbed = new this.utils.discord.MessageEmbed()
                    .setDescription(`**Reconnected to your voice channel!**`)
                    .addField("Player Voice Channel", `${await this.utils.getEmoji("voice_channel_icon_normal")} ${authorVoiceChannel?.name || "unknown"}`)
                    .addField("Player Text Channel", `<#${ctx.channel.id}>`)
                    .addField("Volume", `${player.volume}%`, true)
                    .addField("Loop", `${player.loopState}`, true)
                    .addField("Volume limit", `${ctx.guildSettings?.music.volume.limit}`, true)
                    .setColor(this.utils.getClientColour(ctx.guild))
                await ctx.channel.send(reconnectedEmbed).catch((err: Error) => this.globalCTX.logger?.error(err.message));;
            }
            player.connect();
            return { player, guild: ctx.guild };
        }

        player = this.globalCTX.lavalinkClient.create({
            guild: ctx.guild,
            voiceChannel: authorVoiceChannel!,
            textChannel: ctx.channel,
            inactivityTimeout: 120000,
            guildData: ctx.guildData,
            guildSettings: ctx.guildSettings,
            selfDeafen: true,
            serverDeaf: true,
            logger: this.globalCTX.logger,
            volume: ctx.guildSettings.music.volume.percentage > ctx.guildSettings.music.volume.limit ? ctx.guildSettings.music.volume.limit : ctx.guildSettings.music.volume.percentage,
            maxErrorsPer10Seconds: 3
        })

        //apply guild settings to player
        switch (ctx.guildSettings.music.loop) {
            case "QUEUE": player?.setQueueRepeat(true);
                break;
            case "TRACK": player?.setTrackRepeat(true);
                break;
            default:
                break;
        }

        player?.setEQ(...ctx.guildSettings.music.eq.bands.map((gain, band) => ({ band, gain })));

        //connect to the channel
        player?.connect();

        if (!internalCall) {
            const joinedEmbed = new this.utils.discord.MessageEmbed()
                .setDescription(`**Joined your voice channel!**`)
                .addField("Player Voice Channel", `${await this.utils.getEmoji("voice_channel_icon_normal")} ${authorVoiceChannel?.name || "Unknown"}`)
                .addField("Player Text Channel", `<#${ctx.channel.id}>`)
                .addField("Volume", `${player?.volume}`, true)
                .addField("Loop", `${player?.loopState}`, true)
                .addField("Volume limit", `${ctx.guildSettings?.music.volume.limit}`, true)
                .setColor(this.utils.getClientColour(ctx.guild))
            await ctx.channel.send(joinedEmbed).catch((err: Error) => this.globalCTX.logger?.error(err.message));;
        }


        return { player: player, guild: ctx.guild };
    }
    async testConditions(ctx: CommandCTX) {
        const permissionsForMember = ctx.guildSettings.permissions.users.getFor(ctx.member.id);
        if (!permissionsForMember) return { error: { code: 0, message: "Could not get user permissions." } };

        const res = MusicUtil.canModifyPlayer({
            guild: ctx.guild,
            member: ctx.member,
            channel: ctx.channel,
            isSpawnAttempt: true,
            sendError: true,
            playerRequired: false,
            requiredPermissions: ["SUMMON_PLAYER"],
            memberPermissions: permissionsForMember.overwrites || new InternalPermissions(0),
            vcMemberAmtForAllPerms: 2
        });
        if (res.isError) return res;

        const authorVCperms = res.authorVoiceChannel?.permissionsFor(res.authorVoiceChannel!.client.user!);

        if (!authorVCperms || !authorVCperms.has("VIEW_CHANNEL")) {
            await ctx.channel.send(this.utils.embedifyString(ctx.guild, "I don't have permissions to view your channel!", true));
            return { error: { message: "NO_BOT_PERMS_VIEW_CHANNEL", code: 12 } }
        }
        if (!authorVCperms || !authorVCperms.has("CONNECT")) {
            await ctx.channel.send(this.utils.embedifyString(ctx.guild, "I don't have permissions to join your channel!", true));
            return { error: { message: "NO_BOT_PERMS_CONNECT", code: 13 } }
        }
        if (!authorVCperms || !authorVCperms.has("SPEAK")) {
            await ctx.channel.send(this.utils.embedifyString(ctx.guild, "I don't have permissions to speak in your channel!", true));
            return { error: { message: "NO_BOT_PERMS_SPEAK", code: 14 } }
        }

        return { authorVoiceChannel: res.authorVoiceChannel }
    }
}