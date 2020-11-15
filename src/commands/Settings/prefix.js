const BaseCommand = require('../../utils/structures/BaseCommand');

module.exports = class PrefixCommand extends BaseCommand {
    constructor() {
        super({
            name: "prefix",
            aliases: ["pf"],
            category: "settings",
            description: "Change the bot prefix for the server",
        })
    }
    async run({ message, guildData, args }) {
        if (!message.channel.clientPermissions.has("EMBED_LINKS")) return message.channel.send("I don't have permissions to send message embeds in this channel");

        if (!args) return message.channel.send(this.embedify(message.guild, `The prefix for this server is \`${guildData.settings.prefix}\``));
        else {
            if (!message.author.permissions.discord.final.has("MANAGE_GUILD")) return message.channel.send(this.embedify(message.guild, `You need to have the permission to manage this guild on discord in order to change the server prefix!`, true));

            if (["reset", "remove", "delete", this.settings.client.commands.defaultPrefix].includes(args[0])) {
                guildData.settings.prefix = undefined;
                return message.channel.send(this.embedify(message.guild, `Successfully ${args[0] == this.settings.client.commands.defaultPrefix ? `set` : `reset`} the server prefix to \`${guildData.settings.prefix}\``));
            }

            if (args[0].length > 5) return message.channel.send(this.embedify(message.guild, `The guild prefix cannot be more than 5 characters long!`, true));

            guildData.settings.prefix = args[0];
            return message.channel.send(this.embedify(message.guild, `Successfully set the server prefix to \`${guildData.settings.prefix}\``));

        }
    }
}