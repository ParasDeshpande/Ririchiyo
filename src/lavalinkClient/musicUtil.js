const CommandUtil = require("../utils/structures/CommandUtil");

module.exports = class MusicUtil extends CommandUtil {
    constructor() {
        super();
    }
    calculateMembersRequiredToVote = function (member, guildData) {
        const { channel: voiceChannel } = member.voice;
        voiceChannelMemberCount = voiceChannel.members.filter(member => !member.user.bot).size
        requiredPercentage = guildData.settings.music.votingPercentage;
        requiredMembers = Math.round((requiredPercentage / 100) * voiceChannelMemberCount)
        return requiredMembers;
    }

    canModifyPlayer = async function ({ message, noPlayer, requiredPerms, errorEmbed, spawningPlayer }) {
        if (errorEmbed) errorEmbed = new this.discord.MessageEmbed().setColor(this.appearance.error.colour);
        const player = message.guild.player;
        const { channel: meVoiceChannel } = message.guild.me.voice || {};
        const { channel: authorVoiceChannel } = message.member.voice;
        if (!noPlayer && !player) {
            if (errorEmbed) message.channel.send(errorEmbed.setDescription("There is nothing playing right now!"));
            return { error: { message: "NO_PLAYER", code: 1 } } //If player is required and player does not exist return err
        }
        if (player && meVoiceChannel) {
            if (!authorVoiceChannel) {
                if (spawningPlayer) {
                    message.channel.send(errorEmbed.setDescription("Already playing in a different channel!"));
                    return { error: { message: "PLAYER_ALREADY_EXISTS", code: 2 } }
                }
                if (errorEmbed) message.channel.send(errorEmbed.setDescription("You need to be in the same voice channel as the bot to use that command!"));
                return { error: { message: "NO_AUTHOR_CHANNEL_AND_PLAYER_EXISTS", code: 3 } };
            }
            else {
                if (authorVoiceChannel.id != player.voiceChannel.id) {
                    if (spawningPlayer) {
                        message.channel.send(errorEmbed.setDescription("Already playing in a different channel!"));
                        return { error: { message: "PLAYER_ALREADY_EXISTS", code: 4 } };
                    }
                    if (errorEmbed) message.channel.send(errorEmbed.setDescription("You need to be in the same voice channel as the bot to use that command!"));
                    return { error: { message: "PLAYER_IN_DIFFERENT_CHANNEL", code: 5 } };
                }
                else {
                    if (spawningPlayer) {
                        message.channel.send(errorEmbed.setDescription("Already playing in your voice channel!"));
                        return { error: { message: "PLAYER_ALREADY_EXISTS_SAME_CHANNEL", code: 6 } };
                    }
                    const authorVoiceChannelMemberCount = authorVoiceChannel.members.filter(member => !member.user.bot).size;
                    const checkPerms = this.hasAll(message.author.permissions.internal.final.toArray(), requiredPerms);
                    if (!checkPerms) return { success: { message: "HAS_PERMS", code: 1 }, player: player }
                    else {
                        if (authorVoiceChannelMemberCount > 1) {
                            if (errorEmbed) message.channel.send(errorEmbed.setDescription(`You dont have \`${checkPerms.join("`, `")}\` permission${checkPerms.length > 1 ? `s` : ``} to do that!\nBeing alone in the channel works too!`));
                            return { error: { message: "NO_PERMS_AND_NOT_ALONE", code: 7 } };
                        }
                        else return { success: { message: "NO_PERMS_AND_ALONE", code: 2 }, player: player }
                    }
                }
            }
        }
        else {
            const checkPerms = this.hasAll(message.author.permissions.internal.final.toArray(), requiredPerms);
            if (!checkPerms) {
                if (spawningPlayer && !authorVoiceChannel) {
                    if (errorEmbed) message.channel.send(errorEmbed.setDescription("You need to be in a voice channel to use that command!"));
                    return { error: { message: "NO_VOICE_CHANNEL", code: 8 } }
                }
                if (spawningPlayer) return { success: { message: "HAS_PERMS_TO_SPAWN_PLAYER", code: 3 }, authorVoiceChannel: authorVoiceChannel }
                return { success: { message: "HAS_PERMS_AND_NO_PLAYER", code: 4 } }
            }
            else {
                if (spawningPlayer) {
                    if (!authorVoiceChannel) {
                        if (errorEmbed) message.channel.send(errorEmbed.setDescription("You need to be in a voice channel to use that command!"));
                        return { error: { message: "NO_VOICE_CHANNEL", code: 8 } }
                    }
                    else {
                        const authorVoiceChannelMemberCount = authorVoiceChannel.members.filter(member => !member.user.bot).size;
                        if (authorVoiceChannelMemberCount > 1) {
                            if (errorEmbed) message.channel.send(errorEmbed.setDescription(`You dont have \`${checkPerms.join("`, `")}\` permission${checkPerms.length > 1 ? `s` : ``} to do that!\nBeing alone in the channel works too!`));
                            return { error: { message: "NO_PERMS_TO_SPAWN_PLAYER", code: 9 } };
                        }
                        return { success: { message: "NO_PERMS_AND_ALONE", code: 5 }, authorVoiceChannel: authorVoiceChannel }
                    }
                }
                else {
                    if (errorEmbed) await message.channel.send(errorEmbed.setDescription(`There is nothing playing right now!`));
                    return { error: { message: "NO_PERMS_AND_NO_PLAYER", code: 10 } };
                }
            }
        }
    }
}