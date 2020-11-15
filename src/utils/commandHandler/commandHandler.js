const CommandHandlerUtil = require('./CommandHandlerUtil');

module.exports = class CommandHandler extends CommandHandlerUtil {
    cooldowns = new this.discord.Collection();
    async execute(message, opts = {}) {
        const guildData = await message.client.db.getGuild(message.guild.id);
        const userData = await message.client.db.getUser(message.member.id);
        const clientData = await message.client.db.getClient(message.client.user.id);

        message.prefix = guildData.settings.prefix;
        const regexStructure = `^(?:\\s+)?(?<prefix>(?<tagged><@!?${message.client.user.id}>)|${message.prefix})(?:\\s+)?(?<command>\\S+)(?:\\s+)?(?<arg>[^]+)?`;
        const commandRegex = new RegExp(regexStructure);

        const regexMatchResult = await commandRegex.exec(message.content);
        if (!regexMatchResult) return;

        const commandName = regexMatchResult.groups.command;
        const command = message.client.commands.get(commandName) || message.client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) return;

        if (opts.editedEvent && !command.editedEvent) return;

        message.author.permissions = await guildData.settings.permissions.users.getForUser(message.member.id).calculateOverwrites(await message.member.roles.cache.keyArray(), await message.channel.permissionsFor(message.member), userData.premium.enabled);

        if (clientData.activity.devMode.enabled == true && !message.author.permissions.internal.final.has("BOT_OWNER")) return message.channel.send(this.embedify(message.guild, "The bot is currently in developer only mode, the bot commands are disabled for some time, they will be back soon... :/", true));

        message.channel.clientPermissions = await this.fetchPermissions(message.client, message);
        if (!message.channel.clientPermissions) return;

        if (regexMatchResult.groups.tagged) {
            await message.mentions.users.delete(message.client.id);
            await message.mentions.members.delete(message.client.id);
        }

        if (!this.cooldowns.has(command.name)) this.cooldowns.set(command.name, new this.discord.Collection());

        const now = Date.now();
        const timestamps = this.cooldowns.get(command.name);
        const cooldownAmount = (command.cooldown || this.settings.client.commands.defaultCooldown) * 1000;

        if (timestamps.has(message.author.id) && !message.author.permissions.internal.final.has("BOT_OWNER")) {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
            if (now < expirationTime) {
                if (message.channel.clientPermissions.has('MANAGE_MESSAGES') && message.delete) message.delete().catch(console.error);
                const timeLeft = (expirationTime - now) / 1000;
                return message.channel.send(this.embedify(message.guild, `${message.author}, please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`, true)).then(msg => { msg.delete({ timeout: expirationTime - now }).catch(console.error) });;
            }
        }

        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

        const args = regexMatchResult.groups.arg ? regexMatchResult.groups.arg.split(/\s+/) : undefined;

        try {
            if (message.author.banned && command.name !== 'help') {
                return message.channel.send(embedify(message.guild, `You were banned by a bot moderator from using bot commands, use \`${message.prefix}help\` for more info.`, true));
            }
            const data = {
                message: message,
                arg: regexMatchResult.groups.arg,
                args: args,
                guildData: guildData,
                userData: userData,
                clientData: clientData,
                editedEvent: opts.editedEvent
            }
            return command.run(data);
        }
        catch (error) {
            console.error(error);
            message.channel.send(this.embedify(message.guild, `There was an error executing that command, please try again.\nIf this error persists, please report this issue on our support server- [ririchiyo.bot/support](${this.settings.client.info.supportServerURL})`, true)).catch(console.error);
        }
    }
}