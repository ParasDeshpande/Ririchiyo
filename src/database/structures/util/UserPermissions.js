const { Collection } = require('discord.js');
const { Permissions } = require('discord.js');
const InternalPermissions = require('./InternalPermissions');
const defaultPermissionData = require('../../schemas/PermissionData');
const { deepMerge } = require('../util/functions');
const owners = require('../../../../config/owners');
const dotProp = require('dot-prop');

module.exports = class UserPermissions {
    constructor(db, data, guildID, rolePermissionsClass) {
        this._cache = new Collection();
        this.getForAllUsers = function () {
            const userPermissions = new Collection();
            for (const userID in data.permissions.users) userPermissions.set(userID, this.getForUser(userID));
            return userPermissions;
        };
        this.getForUser = function (userID) {
            const cacheCheck = this._cache.get(userID);
            if (cacheCheck) return cacheCheck;
            const merged = deepMerge(defaultPermissionData, data.permissions.users[userID]);
            const userPermissionInst = new UserPermission(db, data, merged, guildID, userID, rolePermissionsClass);
            this._cache.set(userID, userPermissionInst);
            return userPermissionInst;
        };
        this.resetAll = async function () {
            data.permissions.users = {};
            await db.updateOne({ _id: guildID }, { $unset: { "settings.permissions.users": null } }, { upsert: true });
        };
    }
}

class UserPermission {
    constructor(db, data, userPermissionData, guildID, userID, rolePermissionsClass) {
        this.discord = {
            allowed: new Permissions(userPermissionData.discord.allowed),
            denied: new Permissions(userPermissionData.discord.denied),
            allow: async function (permsArray) {
                this.allowed.add(permsArray);
                this.denied.remove(permsArray);
                await dotProp.set(data, `permissions.users.${userID}.discord.allowed`, this.allowed);
                await dotProp.set(data, `permissions.users.${userID}.discord.denied`, this.denied);
                await db.updateOne({ _id: guildID }, {
                    $set: {
                        [`settings.permissions.users.${userID}.discord.allowed`]: this.allowed.bitfield,
                        [`settings.permissions.users.${userID}.discord.denied`]: this.denied.bitfield
                    }
                }, { upsert: true })
            },
            deny: async function (permsArray) {
                this.allowed.remove(permsArray);
                this.denied.add(permsArray);
                await dotProp.set(data, `permissions.users.${userID}.discord.allowed`, this.allowed);
                await dotProp.set(data, `permissions.users.${userID}.discord.denied`, this.denied);
                await db.updateOne({ _id: guildID }, {
                    $set: {
                        [`settings.permissions.users.${userID}.discord.allowed`]: this.allowed.bitfield,
                        [`settings.permissions.users.${userID}.discord.denied`]: this.denied.bitfield
                    }
                }, { upsert: true })
            },
            reset: async function (permsArray) {
                if (!permsArray) permsArray = Permissions.ALL;
                this.allowed.remove(permsArray);
                this.denied.remove(permsArray);
                const empty = this.allowed == 0 && this.denied == 0;
                if (empty) {
                    await dotProp.delete(data, `permissions.users.${userID}.discord`);
                    if (!data.permissions.users[userID] || Object.keys(data.permissions.users[userID]).length === 0) {
                        await dotProp.delete(data, `permissions.users.${userID}`);
                        await db.updateOne({ _id: guildID }, { $unset: { [`settings.permissions.users.${userID}`]: null } });
                    }
                    else {
                        await db.updateOne({ _id: guildID }, { $unset: { [`settings.permissions.users.${userID}.discord`]: null } });
                    }
                }
                else {
                    await dotProp.set(data, `permissions.users.${userID}.discord.allowed`, this.allowed);
                    await dotProp.set(data, `permissions.users.${userID}.discord.denied`, this.denied);
                    await db.updateOne({ _id: guildID }, {
                        $set: {
                            [`settings.permissions.users.${userID}.discord.allowed`]: this.allowed.bitfield,
                            [`settings.permissions.users.${userID}.discord.denied`]: this.denied.bitfield
                        }
                    }, { upsert: true })
                }
            }
        }
        this.internal = {
            allowed: new InternalPermissions(userPermissionData.internal.allowed),
            denied: new InternalPermissions(userPermissionData.internal.denied),
            allow: async function (permsArray) {
                this.allowed.add(permsArray);
                this.denied.remove(permsArray);
                await dotProp.set(data, `permissions.users.${userID}.internal.allowed`, this.allowed);
                await dotProp.set(data, `permissions.users.${userID}.internal.denied`, this.denied);
                await db.updateOne({ _id: guildID }, {
                    $set: {
                        [`settings.permissions.users.${userID}.internal.allowed`]: this.allowed.bitfield,
                        [`settings.permissions.users.${userID}.internal.denied`]: this.denied.bitfield
                    }
                }, { upsert: true })
            },
            deny: async function (permsArray) {
                this.allowed.remove(permsArray);
                this.denied.add(permsArray);
                await dotProp.set(data, `permissions.users.${userID}.internal.allowed`, this.allowed);
                await dotProp.set(data, `permissions.users.${userID}.internal.denied`, this.denied);
                await db.updateOne({ _id: guildID }, {
                    $set: {
                        [`settings.permissions.users.${userID}.internal.allowed`]: this.allowed.bitfield,
                        [`settings.permissions.users.${userID}.internal.denied`]: this.denied.bitfield
                    }
                }, { upsert: true })
            },
            reset: async function (permsArray) {
                if (!permsArray) permsArray = InternalPermissions.ALL;
                this.allowed.remove(permsArray);
                this.denied.remove(permsArray);
                const empty = this.allowed == 0 && this.denied == 0;
                if (empty) {
                    await dotProp.delete(data, `permissions.users.${userID}.internal`);
                    if (!data.permissions.users[userID] || Object.keys(data.permissions.users[userID]).length === 0) {
                        await dotProp.delete(data, `permissions.users.${userID}`);
                        await db.updateOne({ _id: guildID }, { $unset: { [`settings.permissions.users.${userID}`]: null } });
                    }
                    else {
                        await db.updateOne({ _id: guildID }, { $unset: { [`settings.permissions.users.${userID}.internal`]: null } });
                    }
                }
                else {
                    await dotProp.set(data, `permissions.users.${userID}.internal.allowed`, this.allowed);
                    await dotProp.set(data, `permissions.users.${userID}.internal.denied`, this.denied);
                    await db.updateOne({ _id: guildID }, {
                        $set: {
                            [`settings.permissions.users.${userID}.internal.allowed`]: this.allowed.bitfield,
                            [`settings.permissions.users.${userID}.internal.denied`]: this.denied.bitfield
                        }
                    }, { upsert: true })
                }
            },
        }
        this.calculateOverwrites = function (roleIDsArray, discordUserPermissions, isPremium = false) {
            const resolvedDiscordUserPermissions = new Permissions(discordUserPermissions);
            this.discord.actualPermissions = new Permissions(resolvedDiscordUserPermissions).freeze();
            if (owners.find(owner => owner.id == userID)) {
                this.discord.final = new Permissions(Permissions.ALL);
                this.internal.final = new InternalPermissions(InternalPermissions.BOT_OWNER)
            }
            else if (!resolvedDiscordUserPermissions.has("ADMINISTRATOR")) {
                const reversedRoleIDsArray = roleIDsArray.reverse();
                const discordUserPermissionsCalculated = new Permissions(resolvedDiscordUserPermissions);
                const internalUserPermissionsCalculated = new InternalPermissions(InternalPermissions.DEFAULT)
                for (const roleID of reversedRoleIDsArray) {
                    const rolePermsOBJ = rolePermissionsClass.getForRole(roleID);
                    discordUserPermissionsCalculated.add(rolePermsOBJ.discord.allowed);
                    discordUserPermissionsCalculated.remove(rolePermsOBJ.discord.denied);
                    internalUserPermissionsCalculated.add(rolePermsOBJ.internal.allowed);
                    internalUserPermissionsCalculated.remove(rolePermsOBJ.internal.denied);
                }
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
            if (isPremium) this.internal.final.add("PREMIUM_USER");
            return this;
        }
        this.resetAll = async function () {
            await dotProp.delete(data, `permissions.users.${userID}`);
            await db.updateOne({ _id: guildID }, { $unset: { [`settings.permissions.users.${userID}`]: null } });
        };
    }
}