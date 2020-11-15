const { Collection } = require('discord.js');
const BaseCommand = require('../../utils/structures/BaseCommand');
const managableMusicPermissions = ['DJ', 'SUMMON_PLAYER', 'VIEW_QUEUE', 'ADD_TO_QUEUE', 'MANAGE_QUEUE', 'MANAGE_PLAYER'];
const managableInternalPermissions = managableMusicPermissions;
const managableDiscordPermissions = ['ALL', 'CREATE_INSTANT_INVITE', 'KICK_MEMBERS', 'BAN_MEMBERS', 'MANAGE_CHANNELS', 'MANAGE_GUILD', 'ADD_REACTIONS', 'VIEW_AUDIT_LOG', 'PRIORITY_SPEAKER', 'STREAM', 'VIEW_CHANNEL', 'SEND_MESSAGES', 'SEND_TTS_MESSAGES', 'MANAGE_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY', 'MENTION_EVERYONE', 'USE_EXTERNAL_EMOJIS', 'VIEW_GUILD_INSIGHTS', 'CONNECT', 'SPEAK', 'MUTE_MEMBERS', 'DEAFEN_MEMBERS', 'MOVE_MEMBERS', 'USE_VAD', 'CHANGE_NICKNAME', 'MANAGE_NICKNAMES', 'MANAGE_ROLES', 'MANAGE_WEBHOOKS', 'MANAGE_EMOJIS']
const allManagablePermissions = managableInternalPermissions.concat(managableDiscordPermissions);
const collectivePermissions = new Collection([
    ["DJ", managableMusicPermissions.filter(v => !([].includes(v)))],
    ["ALL", allManagablePermissions.filter(v => !(["ALL"].includes(v)))]
]);
const managablePermissionsString = `You can modify the following internal permissions for a user!\n\n**Managable permissions**\n•\`${allManagablePermissions.join("`\n•`")}\``

class PermissionCommandUtil extends BaseCommand {
    constructor() {
        super({
            name: "permissions",
            aliases: ["perms"],
            category: "settings",
            description: "Add or remove the internal permissions of a user"
        })
    }

    handleCollectivePerms(requestedPerms) {
        const finalPermissions = new Set();
        for (const value of requestedPerms) {
            const got = collectivePermissions.get(value);
            if (got) for (const eachValue of got) finalPermissions.add(eachValue);
            else finalPermissions.add(value);
        }
        return [...finalPermissions];
    }

    async displayUsersAndRoles(roleOrUserData, role) {
        const IDsArray = [];
        for (const id of await roleOrUserData.keys()) {
            IDsArray.push(id);
        }
        return IDsArray.length > 0 ? `•<@${role ? "&" : ""}${IDsArray.join(`>\n•<@${role ? "&" : ""}`)}>` : null;
    }

    async displayPermissionsSingle(permissionData) {
        const allowed = await permissionData.allowed.toArray();
        const denied = await permissionData.denied.toArray();
        const final = await permissionData.final.toArray();
        let displayString = `${allowed.length > 0 ? `**Allowed**\n•\`${allowed.join("`\n•`")}\`` : ""}${allowed.length > 0 && denied.length > 0 ? "\n\n" : ""}${denied.length > 0 ? `**Denied**\n•\`${denied.join("`\n•`")}\`` : ""}${allowed.length > 0 || denied.length > 0 ? "\n\n" : ""}**Final**\n•\`${final.length > 0 ? final.join("`\n•`") : "NO_PERMISSIONS"}\``
        return displayString;
    }

    async displayPermissions(permissionData, discordPerms, roleIDsArray) {
        const data = roleIDsArray ? await permissionData.calculateOverwrites(roleIDsArray, discordPerms) : await permissionData.calculateOverwrites(discordPerms);
        const discord = await data.discord;
        const internal = await data.internal;
        return `__**Discord**__\n${await this.displayPermissionsSingle(discord)}\n\n__**Internal**__\n${await this.displayPermissionsSingle(internal)}`;

    }

    parseInput(input) {
        const idMatch = /(?:<@&?!?)?(?<id>\d{16,})(?:>?)/.exec(input);
        const optionMatch = /(\badd\b|\bgive\b|\ballow\b|\bremove\b|\brem\b|\btake\b|\bdeny\b|\bdelete\b|\bres\b|\breset\b|\bdefault\b)/.exec(input);
        const forChannelMatch = /(\bc\b|\bchan\b|\bchannel\b|\bthis\b)/.exec(input);
        const forRoleOrUserMatch = /(\br\b|\brole\b|\broles\b|\bu\b|\buser\b|\busers\b)/.exec(input);
        if (idMatch) input = input.replace(idMatch[0], "");
        if (optionMatch) input = input.replace(optionMatch[0], "");
        if (forChannelMatch) input = input.replace(forChannelMatch[0], "");
        if (forRoleOrUserMatch) input = input.replace(forRoleOrUserMatch[0], "");
        return { id: idMatch ? idMatch[1] : null, option: optionMatch ? optionMatch[1] : null, forChannel: forChannelMatch ? forChannelMatch[1] : null, forRoleOrUser: forRoleOrUserMatch ? forRoleOrUserMatch[1].toLowerCase() : "all", requestedPerms: input.trim().replace(/[,]/, "").toUpperCase().split(/\s+/).filter(v => v != "") };
    }
    async findUser(guild, id) {
        if (!id) return;
        const roleOrUser = await guild.member(id) || await guild.roles.fetch(id);
        return { roleOrUser: roleOrUser };
    }
}

module.exports = class PermissionCommand extends PermissionCommandUtil {

    async run({ message, arg, guildData }) {
        if (!message.channel.clientPermissions.has("EMBED_LINKS")) return message.channel.send("I don't have permissions to send message embeds in this channel");

        if (!arg) {
            const RolePermissions = await guildData.settings.permissions.roles.getForAllRoles();
            const UserPermissions = await guildData.settings.permissions.users.getForAllUsers();
            if (!RolePermissions.size && !UserPermissions.size) return message.channel.send(this.embedify(message.guild, `There are no permission overwrites set on this server`));
            else {
                const roleDisplay = await this.displayUsersAndRoles(RolePermissions, true);
                const userDisplay = await this.displayUsersAndRoles(UserPermissions);
                const finalDisplay = `${roleDisplay ? `**Roles**\n${roleDisplay}` : ""}${roleDisplay && userDisplay ? "\n\n" : ""}${userDisplay ? `**Users**\n${userDisplay}` : ""}`
                return message.channel.send(this.embedify(message.guild, `**Permissions have been modified for**\n\n${finalDisplay}\n\nUse \`${message.prefix + this.name} view <role ID|user ID>\` to view the permissions that have been modified for a role or user.`)).catch(console.trace);
            }
        }
        else {
            const { id, option, forChannel, forRoleOrUser, requestedPerms } = this.parseInput(arg);
            const requestedPermissions = requestedPerms ? this.handleCollectivePerms(requestedPerms) : [];

            switch (option) {
                default: {
                    if (!id) return message.channel.send(this.embedify(message.guild, `Please provide a role or user id to view permissions for!`, true));
                    const { roleOrUser } = await this.findUser(message.guild, id);
                    if (id && !roleOrUser) return message.channel.send(this.embedify(message.guild, "Did not find the user you were searching for!", true));

                    const roleOrUserPermissionData = roleOrUser.user ? await guildData.settings.permissions.users.getForUser(roleOrUser.id) : await guildData.settings.permissions.roles.getForRole(roleOrUser.id);
                    const roleDisplayPermissions = await this.displayPermissions(roleOrUserPermissionData, forChannel ? await message.channel.permissionsFor(roleOrUser) : roleOrUser.permissions, roleOrUser.user ? await roleOrUser.roles.cache.keyArray() : null);
                    return message.channel.send(this.embedify(message.guild, `**${(roleOrUserPermissionData.discord.allowed.length > 0 | roleOrUserPermissionData.discord.denied.length > 0 | roleOrUserPermissionData.internal.allowed.length > 0 | roleOrUserPermissionData.internal.denied.length > 0) ? `Modified p` : `P`}ermissions for ${roleOrUser}${forChannel ? " in this channel**" : ` \\*ignoring channel overrides\\***\nFor permissions in channel use \`${message.prefix + this.name} view <role|user> channel\``}\n\n${roleDisplayPermissions}`)).catch(console.trace)
                }
                case 'allow':
                case 'add':
                case 'give': {
                    if (!message.author.permissions.discord.final.has("ADMINISTRATOR")) return message.channel.send(this.embedify(message.guild, "You need to have administrator permission on this server to modify permissions!", true));
                    const { roleOrUser } = id ? await this.findUser(message.guild, id) : {};
                    if (id && !roleOrUser) return message.channel.send(this.embedify(message.guild, "Did not find the user you were searching for!", true));

                    const arrayCheck = await this.hasAll(allManagablePermissions, requestedPermissions);
                    if (requestedPermissions.length < 1 || !id) return message.channel.send(this.embedify(message.guild, `${managablePermissionsString}\n\nUse \`${message.prefix + this.name} <user|role> <add|remove> <permission|permissions>\` to modify permission overrides for a role or user.`));
                    if (arrayCheck) return message.channel.send(this.embedify(message.guild, `${managablePermissionsString}\n\n\`${this.limitLength(arrayCheck.join("`, `"), 1200)}\` ${arrayCheck.length > 1 ? `are not valid permissions!` : `is not a valid permission!`}`, true));

                    const roleOrUserPermissionData = roleOrUser.user ? await guildData.settings.permissions.users.getForUser(roleOrUser.id) : await guildData.settings.permissions.roles.getForRole(roleOrUser.id);

                    const internalPermissionsToModify = [];
                    const discordPermissionsToModify = [];
                    for (const permission of requestedPermissions) {
                        if (managableInternalPermissions.includes(permission)) internalPermissionsToModify.push(permission);
                        if (managableDiscordPermissions.includes(permission)) discordPermissionsToModify.push(permission);
                    }

                    if (internalPermissionsToModify.length > 0) await roleOrUserPermissionData.internal.allow(internalPermissionsToModify);
                    if (discordPermissionsToModify.length > 0) await roleOrUserPermissionData.discord.allow(discordPermissionsToModify);

                    return message.channel.send(this.embedify(message.guild, `Allowed the following permissions to ${roleOrUser}\n•\`${requestedPermissions.join("`\n•`")}\``))
                }
                case 'deny':
                case 'remove':
                case 'rem':
                case 'take': {
                    if (!message.author.permissions.discord.final.has("ADMINISTRATOR")) return message.channel.send(this.embedify(message.guild, "You need to have administrator permission on this server to modify permissions!", true));
                    const { roleOrUser } = id ? await this.findUser(message.guild, id) : {};
                    if (id && !roleOrUser) return message.channel.send(this.embedify(message.guild, "Did not find the user you were searching for!", true));

                    const arrayCheck = await this.hasAll(allManagablePermissions, requestedPermissions);
                    if (requestedPermissions.length < 1 || !roleOrUser) return message.channel.send(this.embedify(message.guild, `${managablePermissionsString}\n\nUse \`${message.prefix + this.name} <user|role> <add|remove> <permission|permissions>\` to modify permission overrides for a role or user.`));
                    if (arrayCheck) return message.channel.send(this.embedify(message.guild, `${managablePermissionsString}\n\n\`${this.limitLength(arrayCheck.join("`, `"), 1200)}\` ${arrayCheck.length > 1 ? `are not valid permissions!` : `is not a valid permission!`}`, true));

                    const roleOrUserPermissionData = roleOrUser.user ? await guildData.settings.permissions.users.getForUser(roleOrUser.id) : await guildData.settings.permissions.roles.getForRole(roleOrUser.id);

                    const internalPermissionsToModify = [];
                    const discordPermissionsToModify = [];
                    for (const permission of requestedPermissions) {
                        if (managableInternalPermissions.includes(permission)) internalPermissionsToModify.push(permission);
                        if (managableDiscordPermissions.includes(permission)) discordPermissionsToModify.push(permission);
                    }

                    if (internalPermissionsToModify.length > 0) await roleOrUserPermissionData.internal.deny(internalPermissionsToModify);
                    if (discordPermissionsToModify.length > 0) await roleOrUserPermissionData.discord.deny(discordPermissionsToModify);

                    return message.channel.send(this.embedify(message.guild, `Denied the following permissions to ${roleOrUser}\n•\`${requestedPermissions.join("`\n•`")}\``))
                }
                case 'reset':
                case 'res': {
                    if (!message.author.permissions.discord.final.has("ADMINISTRATOR")) return message.channel.send(this.embedify(message.guild, "You need to have administrator permission on this server to modify permissions!", true));
                    const { roleOrUser } = id ? await this.findUser(message.guild, id) : {};
                    if (id && !roleOrUser) return message.channel.send(this.embedify(message.guild, "Did not find the user you were searching for!", true));

                    const arrayCheck = await this.hasAll(allManagablePermissions, requestedPermissions);
                    if (requestedPermissions.length < 1 && !roleOrUser && !arrayCheck) {
                        switch (forRoleOrUser) {
                            default:
                                await guildData.settings.permissions.users.resetAll();
                                await guildData.settings.permissions.roles.resetAll();
                                return message.channel.send(this.embedify(message.guild, `Successfully reset all permission overrides on this server!`));
                            case 'r':
                            case 'role':
                            case 'roles':
                                await guildData.settings.permissions.roles.resetAll();
                                return message.channel.send(this.embedify(message.guild, `Successfully reset all permission overrides for all roles on this server!`));
                            case 'u':
                            case 'user':
                            case 'users':
                                await guildData.settings.permissions.users.resetAll();
                                return message.channel.send(this.embedify(message.guild, `Successfully reset all permission overrides for all users on this server!`));
                        }
                    }
                    if (arrayCheck) return message.channel.send(this.embedify(message.guild, `You can only modify the following internal permissions for a user!\n\n**Managable permissions**\n•\`${allManagablePermissions.join("`\n•`")}\`\n\n\`${this.limitLength(arrayCheck.join("`, `"), 1200)}\` ${arrayCheck.length > 1 ? `are not valid permissions!` : `is not a valid permission!`}`, true));

                    if (!roleOrUser) return message.channel.send(this.embedify(message.guild, `Please provide a user or role id to reset \`${requestedPermissions.join("`, `")}\` permission${requestedPermissions.length > 1 ? "s" : ""} for!`, true));

                    const roleOrUserPermissionData = roleOrUser.user ? await guildData.settings.permissions.users.getForUser(roleOrUser.id) : await guildData.settings.permissions.roles.getForRole(roleOrUser.id);

                    const internalPermissionsToModify = [];
                    const discordPermissionsToModify = [];
                    for (const permission of requestedPermissions) {
                        if (managableInternalPermissions.includes(permission)) internalPermissionsToModify.push(permission);
                        if (managableDiscordPermissions.includes(permission)) discordPermissionsToModify.push(permission);
                    }

                    if (internalPermissionsToModify.length < 1 && discordPermissionsToModify.length < 1) {
                        await roleOrUserPermissionData.resetAll();
                        return message.channel.send(this.embedify(message.guild, `Reset all permissions to default for ${roleOrUser}`));
                    }
                    else {
                        if (internalPermissionsToModify.length > 0) await roleOrUserPermissionData.internal.reset(internalPermissionsToModify);
                        if (discordPermissionsToModify.length > 0) await roleOrUserPermissionData.discord.reset(discordPermissionsToModify);
                        return message.channel.send(this.embedify(message.guild, `Reset the following permissions to default for ${roleOrUser}\n•\`${requestedPermissions.join("`\n•`")}\``));
                    }
                }
            }
        }
    }
}