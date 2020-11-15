const BaseCommand = require('../../utils/structures/BaseCommand');

module.exports = class HelpCommand extends BaseCommand {
    constructor() {
        super({
            name: "help",
            aliases: "h",
            category: "info",
            description: "Display all available commands",
            cooldown: 3,
            hidden: true
        })
    }
    async run({ message, args }) {
        if (!message.channel.clientPermissions.has("EMBED_LINKS")) return message.channel.send("I don't have permissions to send message embeds in this channel");
        const helpEmbed = new this.discord.MessageEmbed();
        if (message.author.banned) {
            adminWhoBanned = await message.client.users.fetch(message.author.banned.by).catch(err => { if (err.message == "Unknown User") { return; } else { console.error(err.message); } });

            helpEmbed
                .setTitle('You have been banned by the bot staff.')
                .setDescription(`**You can no longer use any bot commands for this bot until your ban gets expired or is revoked.**`)
                .addField('\u200B', `**Reason:** ${message.author.banned.reason}\n**Expires:** ${message.author.banned.expiry ? new Date(parseInt(message.author.banned.expiry)) : 'never'}\n**For more help join our support server:** [ririchiyo.bot/support](${this.settings.client.info.supportServerURL})\n\u200B`)
                .setFooter(`Banned by ${adminWhoBanned.tag}`, adminWhoBanned.avatarURL(['png']))
                .setColor(this.appearance.restricted.colour)
                .setTimestamp(message.author.banned.on)
        }
        else {
            //get commands usable by user
            const commands = message.client.commands.array().filter(cmd => {
                let hasPermissionToView;
                if (cmd.requiredPermissionsToView) hasPermissionToView = !this.hasAll(message.author.permissions.internal.final.toArray(), cmd.requiredPermissionsToView.internal) && !this.hasAll(message.author.permissions.discord.final.toArray(), cmd.requiredPermissionsToView.discord);
                else hasPermissionToView = true;
                return !cmd.hidden && hasPermissionToView
            });

            //get command categories usable by user
            const allCommandCategories = [];
            commands.forEach((cmd) => allCommandCategories.push(cmd.category));
            const commandCategories = [...new Set(allCommandCategories)];

            if (!args) {
                helpEmbed
                    .setAuthor(`${message.client.user.username}`, message.client.user.avatarURL(), this.settings.client.info.websiteURL)
                    //.setDescription(`For more datailed help use \`${message.prefix}${this.name} <category name>\` or \`${message.prefix}${this.name} <command name>\`\n\n**List of all command categories-**`)
                    .setDescription(`A feature rich and easy to use discord music bot.\n\nMy prefix on this server is \`${message.prefix}\`\n\n**List of all commands-**`)
                    .setColor(this.getClientColour(message.guild));

                //Add an embed field for each category
                commandCategories.forEach((category) => {
                    let commandsInCategory = commands.filter((cmd) => cmd.category === category)
                    let commandNames = [];
                    commandsInCategory.forEach((cmd) => {
                        commandNames.push(`\`${cmd.name}${cmd.aliases ? `(${cmd.aliases})` : ""}\``)
                    })
                    let joinedCommands = commandNames.join(', ');
                    helpEmbed.addField(`${this.firstLetterCaps(category)}`, `${joinedCommands}`);
                })

                helpEmbed.addField(`\u200B`, `For help about a specific command or category,\nuse \`${message.prefix}${this.name} <category name>\` or \`${message.prefix}${this.name} <command name>\`\n\nFeel free to join our **[support server](${this.settings.client.info.supportServerURL})** for more help.\nAdd me to another server- **[invite](${await message.client.generateInvite({ permissions: 536346111 })})**`);
            }
            else {
                let processedQuery = [];
                await args.forEach((arg) => processedQuery.push(arg.replace(message.prefix, '').toLowerCase()));
                const query = processedQuery.join(' ');
                const command =
                    message.client.commands.get(query.toLowerCase()) ||
                    message.client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(query.toLowerCase()));

                //if command is not found, check categories
                let category;
                if (!command) category = commandCategories.includes(query) ? query : false;

                //if nothing is found
                if (!command && !category) helpEmbed
                    .setDescription('Could not find the command or category you were looking for.\nPlease check if you have typed it correctly.')
                    .setColor(this.appearance.error.colour);
                else if (command) helpEmbed
                    .setTitle(`${message.prefix}${command.name}${command.aliases ? ` (${command.aliases})` : ""}`)
                    .setDescription(`${command.description}\n\n${command.usage ? "**Usage**\n" + command.usage(message, args) : ''}`)
                    .setColor(this.getClientColour(message.guild));
                else if (category && !command) {
                    const commandsInCategory = commands.filter((cmd) => cmd.category === category)

                    helpEmbed
                        .setDescription(`**${this.firstLetterCaps(category)} commands**`)
                        .setColor(this.getClientColour(message.guild));

                    commandsInCategory.forEach((cmd) => {
                        helpEmbed.addField(`**${message.prefix}${cmd.name} ${cmd.aliases ? `(${cmd.aliases})` : ""}**`, `${cmd.description}`, true)
                    });
                }
            }
        }
        return message.channel.send(helpEmbed).catch(console.error);
    }
}