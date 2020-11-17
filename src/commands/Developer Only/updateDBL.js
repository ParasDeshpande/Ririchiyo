const BaseCommand = require('../../utils/structures/BaseCommand');
const { updateDiscordBotsListStats } = require('../../utils/util');

module.exports = class UpdateDBLCommand extends BaseCommand {
    constructor() {
        super({
            name: "updatedbl",
            category: "developer",
            description: "Update the bot statistics on discordbotslist",
            requiredPermissionsToView: { internal: ["BOT_OWNER"] }
        })
    }
    async run({ args, message, clientData }) {
        if (!message.channel.clientPermissions.has("EMBED_LINKS")) return message.channel.send("I don't have permissions to send message embeds in this channel");
        if (!message.author.permissions.internal.final.has("BOT_OWNER")) return message.channel.send(this.embedify(message.guild, "You don't have permission to use that command!", true));

        let guilds;
        let users;
        let voiceConnections;
        if (!args || !args[0] || args[0] == "0" || isNaN(args[0])) guilds = await message.client.shard.fetchClientValues('guilds.cache.size').then(async ga => await ga.reduce((prev, val) => prev + val, 0));
        else guilds = parseInt(args[0]);

        if (!args || !args[1] || args[1] == "0" || isNaN(args[1])) users = await message.client.shard.fetchClientValues('users.cache.size').then(async ua => await ua.reduce((prev, val) => prev + val, 0));
        else users = parseInt(args[1]);

        if (!args || !args[2] || args[2] == "0" || isNaN(args[2])) voiceConnections = message.client.lavalinkClient.players.size;
        else voiceConnections = parseInt(args[2]);

        const success = await updateDiscordBotsListStats(message.client, guilds, users, voiceConnections);

        await message.channel.send(this.embedify(message.guild, success ? `Successfully updated bot stats on DBL\n• Guilds: ${guilds}\n• Users: ${users}\n• Voice Connections: ${voiceConnections}` : `An error occurred while updating the bot stats on DBL!`, !success));
    }
}