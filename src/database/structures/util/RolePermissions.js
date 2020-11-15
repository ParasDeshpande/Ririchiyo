const { Collection } = require('discord.js');
const { Permissions } = require('discord.js');
const InternalPermissions = require('./InternalPermissions');
const defaultPermissionData = require('../../schemas/PermissionData');
const { deepMerge } = require('../util/functions');
const dotProp = require('dot-prop');

module.exports = class RolePermissions {
    constructor(db, data, guildID) {
        this._cache = new Collection();
        this.getForAllRoles = function () {
            const rolePermissions = new Collection();
            for (const roleID in data.permissions.roles) rolePermissions.set(roleID, this.getForRole(roleID));
            return rolePermissions;
        };
        this.getForRole = function (roleID) {
            const cacheCheck = this._cache.get(roleID);
            if (cacheCheck) return cacheCheck;
            const merged = deepMerge(defaultPermissionData, data.permissions.roles[roleID]);
            const rolePermissionInst = new RolePermission(db, data, merged, guildID, roleID);
            this._cache.set(roleID, rolePermissionInst);
            return rolePermissionInst;
        };
        this.resetAll = async function () {
            data.permissions.roles = {};
            await db.updateOne({ _id: guildID }, { $unset: { "settings.permissions.roles": null } }, { upsert: true });
        };
    }
}

class RolePermission {
    constructor(db, data, rolePermissionData, guildID, roleID) {
        this.discord = {
            allowed: new Permissions(rolePermissionData.discord.allowed),
            denied: new Permissions(rolePermissionData.discord.denied),
            allow: async function (permsArray) {
                this.allowed.add(permsArray);
                this.denied.remove(permsArray);
                await dotProp.set(data, `permissions.roles.${roleID}.discord.allowed`, this.allowed);
                await dotProp.set(data, `permissions.roles.${roleID}.discord.denied`, this.denied);
                await db.updateOne({ _id: guildID }, {
                    $set: {
                        [`settings.permissions.roles.${roleID}.discord.allowed`]: this.allowed.bitfield,
                        [`settings.permissions.roles.${roleID}.discord.denied`]: this.denied.bitfield
                    }
                }, { upsert: true })
            },
            deny: async function (permsArray) {
                this.allowed.remove(permsArray);
                this.denied.add(permsArray);
                await dotProp.set(data, `permissions.roles.${roleID}.discord.allowed`, this.allowed);
                await dotProp.set(data, `permissions.roles.${roleID}.discord.denied`, this.denied);
                await db.updateOne({ _id: guildID }, {
                    $set: {
                        [`settings.permissions.roles.${roleID}.discord.allowed`]: this.allowed.bitfield,
                        [`settings.permissions.roles.${roleID}.discord.denied`]: this.denied.bitfield
                    }
                }, { upsert: true })
            },
            reset: async function (permsArray) {
                if (!permsArray) permsArray = Permissions.ALL;
                this.allowed.remove(permsArray);
                this.denied.remove(permsArray);
                const empty = this.allowed == 0 && this.denied == 0;
                if (empty) {
                    await dotProp.delete(data, `permissions.roles.${roleID}.discord`);
                    if (!data.permissions.roles[roleID] || Object.keys(data.permissions.roles[roleID]).length === 0) {
                        await dotProp.delete(data, `permissions.roles.${roleID}`);
                        await db.updateOne({ _id: guildID }, { $unset: { [`settings.permissions.roles.${roleID}`]: null } });
                    }
                    else {
                        await db.updateOne({ _id: guildID }, { $unset: { [`settings.permissions.roles.${roleID}.discord`]: null } });
                    }
                }
                else {
                    await dotProp.set(data, `permissions.roles.${roleID}.discord.allowed`, this.allowed);
                    await dotProp.set(data, `permissions.roles.${roleID}.discord.denied`, this.denied);
                    await db.updateOne({ _id: guildID }, {
                        $set: {
                            [`settings.permissions.roles.${roleID}.discord.allowed`]: this.allowed.bitfield,
                            [`settings.permissions.roles.${roleID}.discord.denied`]: this.denied.bitfield
                        }
                    }, { upsert: true })
                }

            }
        }
        this.internal = {
            allowed: new InternalPermissions(rolePermissionData.internal.allowed),
            denied: new InternalPermissions(rolePermissionData.internal.denied),
            allow: async function (permsArray) {
                this.allowed.add(permsArray);
                this.denied.remove(permsArray);
                await dotProp.set(data, `permissions.roles.${roleID}.internal.allowed`, this.allowed);
                await dotProp.set(data, `permissions.roles.${roleID}.internal.denied`, this.denied);
                await db.updateOne({ _id: guildID }, {
                    $set: {
                        [`settings.permissions.roles.${roleID}.internal.allowed`]: this.allowed.bitfield,
                        [`settings.permissions.roles.${roleID}.internal.denied`]: this.denied.bitfield
                    }
                }, { upsert: true })
            },
            deny: async function (permsArray) {
                this.allowed.remove(permsArray);
                this.denied.add(permsArray);
                await dotProp.set(data, `permissions.roles.${roleID}.internal.allowed`, this.allowed);
                await dotProp.set(data, `permissions.roles.${roleID}.internal.denied`, this.denied);
                await db.updateOne({ _id: guildID }, {
                    $set: {
                        [`settings.permissions.roles.${roleID}.internal.allowed`]: this.allowed.bitfield,
                        [`settings.permissions.roles.${roleID}.internal.denied`]: this.denied.bitfield
                    }
                }, { upsert: true })
            },
            reset: async function (permsArray) {
                if (!permsArray) permsArray = InternalPermissions.ALL;
                this.allowed.remove(permsArray);
                this.denied.remove(permsArray);
                const empty = this.allowed == 0 && this.denied == 0;
                if (empty) {
                    await dotProp.delete(data, `permissions.roles.${roleID}.internal`);
                    if (!data.permissions.roles[roleID] || Object.keys(data.permissions.roles[roleID]).length === 0) {
                        await dotProp.delete(data, `permissions.roles.${roleID}`);
                        await db.updateOne({ _id: guildID }, { $unset: { [`settings.permissions.roles.${roleID}`]: null } });
                    }
                    else {
                        await db.updateOne({ _id: guildID }, { $unset: { [`settings.permissions.roles.${roleID}.internal`]: null } });
                    }
                }
                else {
                    await dotProp.set(data, `permissions.roles.${roleID}.internal.allowed`, this.allowed);
                    await dotProp.set(data, `permissions.roles.${roleID}.internal.denied`, this.denied);
                    await db.updateOne({ _id: guildID }, {
                        $set: {
                            [`settings.permissions.roles.${roleID}.internal.allowed`]: this.allowed.bitfield,
                            [`settings.permissions.roles.${roleID}.internal.denied`]: this.denied.bitfield
                        }
                    }, { upsert: true })
                }
            },
        }
        this.calculateOverwrites = function (discordRolePermissions) {
            const resolvedDiscordRolePermissions = new Permissions(discordRolePermissions);
            this.discord.actualPermissions = new Permissions(resolvedDiscordRolePermissions).freeze();
            if (!resolvedDiscordRolePermissions.has("ADMINISTRATOR")) {
                const discordUserPermissionsCalculated = new Permissions(resolvedDiscordRolePermissions);
                const internalUserPermissionsCalculated = new InternalPermissions(InternalPermissions.DEFAULT)
                discordUserPermissionsCalculated.add(this.discord.allowed);
                discordUserPermissionsCalculated.remove(this.discord.denied);
                internalUserPermissionsCalculated.add(this.internal.allowed);
                internalUserPermissionsCalculated.remove(this.internal.denied);
                this.discord.final = discordUserPermissionsCalculated;
                this.internal.final = internalUserPermissionsCalculated;
            }
            else {
                this.discord.final = new Permissions(Permissions.ALL);
                this.internal.final = new InternalPermissions(InternalPermissions.ADMINISTRATOR)
            }
            return this;
        }
        this.resetAll = async function () {
            await dotProp.delete(data, `permissions.roles.${roleID}`);
            await db.updateOne({ _id: guildID }, { $unset: { [`settings.permissions.roles.${roleID}`]: null } });
        };
    }
}