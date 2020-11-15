const { BitField } = require('discord.js');

/**
 * Data structure that makes it easy to interact with a modlogType bitfield. All {@link GuildMember}s have a set of
 * modlog types in their guild, and each channel in the guild may also have {@link ModlogTypeOverwrites} for the member
 * that override their default modlog types.
 * @extends {BitField}
 */
class ModlogTypes extends BitField {
    /**
     * @name ModlogTypes
     * @kind constructor
     * @memberof ModlogTypes
     * @param {ModlogTypeResolvable} [bits=0] Bit(s) to read from
     */

    /**
     * Data that can be resolved to give a modlogType number. This can be:
     * * A string (see {@link ModlogTypes.FLAGS})
     * * A modlogType number
     * * An instance of ModlogTypes
     * * An Array of ModlogTypeResolvable
     * @typedef {string|number|ModlogTypes|ModlogTypeResolvable[]} ModlogTypeResolvable
     */

    /**
     * Checks whether the bitfield has a modlogType, or any of multiple modlog types.
     * @param {ModlogTypeResolvable} modlogType ModlogType(s) to check for
     * @returns {boolean}
     */
    any(modlogType) {
        return super.any(modlogType);
    }

    /**
     * Checks whether the bitfield has a modlogType, or multiple modlog types.
     * @param {ModlogTypeResolvable} modlogType ModlogType(s) to check for
     * @returns {boolean}
     */
    has(modlogType) {
        return super.has(modlogType);
    }
}

/**
 * Numeric modlogType flags. All available properties:
 * * `MEMBER_KICK` (sends a message whenever a member is kicked [excl bots])
 * * `MEMBER_BAN` (sends a message whenever a member is banned [excl bots])
 * * `MEMBER_ROLE_ADD` (sends a message whenever a role is added to a member [excl bots])
 * * `MEMBER_ROLE_REMOVE` (sends a message whenever a role is added to a member [excl bots])
 * * `MEMBER_SERVER_MUTE` (sends a message whenever a member is given server mute [excl bots])
 * * `MEMBER_SERVER_UNMUTE` (sends a message whenever a member server mute is removed [excl bots])
 * * `MEMBER_SERVER_DEAFEN` (sends a message whenever a member is given server deafen [excl bots])
 * * `MEMBER_SERVER_UNDEAFEN` (sends a message whenever a member server mute is removed [excl bots])
 * * `MEMBER_SELF_MUTE` (sends a message whenever a member mutes himself [excl bots])
 * * `MEMBER_SELF_UNMUTE` (sends a message whenever a member unmutes himself [excl bots])
 * * `MEMBER_SELF_DEAFEN` (sends a message whenever a member deafens himself [excl bots])
 * * `MEMBER_SELF_UNDEAFEN` (sends a message whenever a member undeafens himself [excl bots])
 * * `MEMBER_INTERNAL_MUTE` (sends a message whenever a member is muted using the mute command [excl bots])
 * * `MEMBER_INTERNAL_UNMUTE` (sends a message whenever a member is unmuted using the mute command [excl bots])
 * * `MEMBER_WARN` (sends a message whenever a member is warned using the warn command [excl bots])
 * * `MEMBER_CHANGE_NICKNAME` (sends a message whenever a member nickname is changed by someone else [excl bots])
 * * `MEMBER_SELF_CHANGE_NICKNAME` (sends a message whenever a member changes his nickname [excl bots])
 * * `MEMBER_CHANGE_USERNAME` (sends a message whenever a member changes his username [excl bots])
 * * `CHANNEL_CREATE` (sends a message whenever a channel is created [excl bots])
 * * `CHANNEL_DELETE` (sends a message whenever a channel is deleted [excl bots])
 * * `CHANNEL_UPDATE` (sends a message whenever a channel is updated [excl bots])
 * * `CHANNEL_PINS_ADD` (sends a message whenever a message is pinned [excl bots])
 * * `CHANNEL_PINS_REMOVE` (sends a message whenever a message is unpinned [excl bots])
 * * `BOT_ADD` (sends a message whenever a bot is added to the server)
 * * `BOT_REMOVE` (sends a message whenever a bot is removed from the server)
 * * `ROLE_CREATE` (sends a message whenever a role is created [excl bot roles])
 * * `ROLE_DELETE` (sends a message whenever a role is deleted [excl bot roles])
 * * `ROLE_UPDATE` (sends a message whenever a role is updated [excl bot roles])
 * * `ANNOUNCE_BOTS` (**ignores** the [excl bots] setting)
 * * `CLIENT_SETTINGS_UPDATE` (sends a message whenever a client setting is changed [excl bot roles])
 * * `CLIENT_FEATURE_ANNOUNCEMENTS` (sends a message whenever a announcement is made on the support server [excl bot roles])
 * @type {Object}
 */
ModlogTypes.FLAGS = {
    MEMBER_KICK: 1 << 0,
    MEMBER_BAN: 1 << 1,
    MEMBER_ROLE_ADD: 1 << 2,
    MEMBER_ROLE_REMOVE: 1 << 3,
    MEMBER_SERVER_MUTE: 1 << 4,
    MEMBER_SERVER_UNMUTE: 1 << 5,
    MEMBER_SERVER_DEAFEN: 1 << 6,
    MEMBER_SERVER_UNDEAFEN: 1 << 7,
    MEMBER_SELF_MUTE: 1 << 8,
    MEMBER_SELF_UNMUTE: 1 << 9,
    MEMBER_SELF_DEAFEN: 1 << 10,
    MEMBER_SELF_UNDEAFEN: 1 << 11,
    MEMBER_INTERNAL_MUTE: 1 << 12,
    MEMBER_INTERNAL_UNMUTE: 1 << 13,
    MEMBER_WARN: 1 << 14,
    MEMBER_CHANGE_NICKNAME: 1 << 15,
    MEMBER_SELF_CHANGE_NICKNAME: 1 << 16,
    MEMBER_CHANGE_USERNAME: 1 << 17,
    CHANNEL_CREATE: 1 << 18,
    CHANNEL_DELETE: 1 << 19,
    CHANNEL_UPDATE: 1 << 20,
    CHANNEL_PINS_ADD: 1 << 21,
    CHANNEL_PINS_REMOVE: 1 << 22,
    BOT_ADD: 1 << 23,
    BOT_REMOVE: 1 << 24,
    ROLE_CREATE: 1 << 25,
    ROLE_DELETE: 1 << 26,
    ROLE_UPDATE: 1 << 27,
    ANNOUNCE_BOTS: 1 << 28,
    CLIENT_SETTINGS_UPDATE: 1 << 29,
    CLIENT_FEATURE_ANNOUNCEMENTS: 1 << 30,
};

/**
 * Bitfield representing every modlogType combined
 * @type {number}
 */
ModlogTypes.ALL = Object.values(ModlogTypes.FLAGS).reduce((all, p) => all | p, 0);

/**
 * Bitfield representing the default modlog types for users
 * @type {number}
 */
ModlogTypes.DEFAULT = 104324673;

module.exports = ModlogTypes;
