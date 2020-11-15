const { BitField } = require('discord.js');

class InternalPermissionsUtil extends BitField {
}
InternalPermissionsUtil.FLAGS = {
    SUMMON_PLAYER: 1 << 0,
    VIEW_QUEUE: 1 << 1,
    ADD_TO_QUEUE: 1 << 2,
    MANAGE_QUEUE: 1 << 3,
    MANAGE_PLAYER: 1 << 4,
    DJ: 32,
    ADMINISTRATOR: 1 << 6,
    PREMIUM_USER: 1 << 7,
    BOT_OWNER: 1 << 8,
};

/**
 * Data structure that makes it easy to interact with a permission bitfield. All {@link GuildMember}s have a set of
 * permissions in their guild, and each channel in the guild may also have {@link PermissionOverwrites} for the member
 * that override their default permissions.
 * @extends {BitField}
 */
class InternalPermissions extends BitField {
    /**
     * @name InternalPermissions
     * @kind constructor
     * @memberof InternalPermissions
     * @param {PermissionResolvable} [bits=0] Bit(s) to read from
     */

    /**
     * Data that can be resolved to give a permission number. This can be:
     * * A string (see {@link InternalPermissions.FLAGS})
     * * A permission number
     * * An instance of InternalPermissions
     * * An Array of PermissionResolvable
     * @typedef {string|number|InternalPermissions|PermissionResolvable[]} PermissionResolvable
     */

    /**
     * Checks whether the bitfield has a permission, or any of multiple permissions.
     * @param {PermissionResolvable} permission Permission(s) to check for
     * @param {boolean} [checkOwner=true] Whether to allow the administrator permission to override
     * @param {boolean} [checkDJ=true] Whether to allow the DJ permission to override
     * @returns {boolean}
     */
    any(permission, checkOwner = true, checkDJ = true, checkAdmin = true) {
        if (checkOwner && super.has(this.constructor.FLAGS.BOT_OWNER)) return true;
        else if (checkDJ && super.has(this.constructor.FLAGS.DJ) && new InternalPermissionsUtil(permission).bitfield <= this.constructor.FLAGS.DJ) return true;
        else if (checkAdmin && super.has(this.constructor.FLAGS.ADMINISTRATOR) && new InternalPermissionsUtil(permission).bitfield <= this.constructor.FLAGS.ADMINISTRATOR) return true;
        else return super.any(permission);
    }

    /**
     * Checks whether the bitfield has a permission, or multiple permissions.
     * @param {PermissionResolvable} permission Permission(s) to check for
     * @param {boolean} [checkOwner=true] Whether to allow the administrator permission to override
     * @param {boolean} [checkDJ=true] Whether to allow the DJ permission to override
     * @returns {boolean}
     */
    has(permission, checkOwner = true, checkDJ = true, checkAdmin = true) {
        if (checkOwner && super.has(this.constructor.FLAGS.BOT_OWNER)) return true;
        else if (checkDJ && super.has(this.constructor.FLAGS.DJ) && new InternalPermissionsUtil(permission).bitfield <= this.constructor.FLAGS.DJ) return true;
        else if (checkAdmin && super.has(this.constructor.FLAGS.ADMINISTRATOR) && new InternalPermissionsUtil(permission).bitfield <= this.constructor.FLAGS.ADMINISTRATOR) return true;
        else return super.has(permission);
    }
}

/**
 * Numeric permission flags. All available properties:
 * * `BOT_OWNER` (implicitly has *all* permissions, and bypasses all channel overwrites)
 * * `SUMMON_PLAYER` (summon the player in a voice channel)
 * * `VIEW_QUEUE` (view the player queue)
 * * `ADD_TO_QUEUE` (add to the player queue but not remove)
 * * `MANAGE_QUEUE` (do anything to the player queue)
 * * `MANAGE_PLAYER` (do anything to the player)
 * * `DJ` (implicitly has *all* PLAYER permissions unless overridden by disabling for role)
 * * `PREMIUM_USER` (use premium commands)
 * @type {Object}
 * @see {@link https://discord.com/developers/docs/topics/permissions}
 */
InternalPermissions.FLAGS = {
    SUMMON_PLAYER: 1 << 0,
    VIEW_QUEUE: 1 << 1,
    ADD_TO_QUEUE: 1 << 2,
    MANAGE_QUEUE: 1 << 3,
    MANAGE_PLAYER: 1 << 4,
    DJ: 1 << 5,
    ADMINISTRATOR: 1 << 6,
    PREMIUM_USER: 1 << 7,
    BOT_OWNER: 1 << 8,
};

/**
 * Bitfield representing every permission combined
 * @type {number}
 */
InternalPermissions.ALL = Object.values(InternalPermissions.FLAGS).reduce((all, p) => all | p, 0);

/**
 * Bitfield representing every player permission combined
 * @type {number}
 */
InternalPermissions.DJ = 63;

/**
 * Bitfield representing every guild permission combined
 * @type {number}
 */
InternalPermissions.ADMINISTRATOR = 127;

/**
 * Bitfield representing BOT_OWNER permissions
 * @type {number}
 */
InternalPermissions.BOT_OWNER = 511;

/**
 * Bitfield representing the default permissions for users
 * @type {number}
 */
InternalPermissions.DEFAULT = 7;

module.exports = InternalPermissions;
