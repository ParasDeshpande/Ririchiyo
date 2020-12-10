const BaseCommand = require('../../utils/structures/BaseCommand');

module.exports = class BoostCommand extends BaseCommand {
    constructor() {
        super({
            name: "boost",
            description: "Boost a guild with premium",
            category: "premium",
        })
    }

    async run({ message, guildData, userData }) {
        if (!message.channel.clientPermissions.has("EMBED_LINKS")) return message.channel.send("I don't have permissions to send message embeds in this channel");


        if (!message.author.permissions.discord.final.has("MANAGE_GUILD")) return message.channel.send(this.embedify(message.guild, "You need to have the `MANAGE_GUILD` permission on this server in order to use that command!", true));
        if (!await userData.premium.checkIfEnabled()) return message.channel.send(this.embedify(message.guild, `You need to have premium in order to use that command!\nVote on **[top.gg](${this.settings.client.info.externalSites["top.gg"]})** to get free premium for \`12 hours\`.`, true));
        if (await guildData.settings.premium.checkIfEnabled()) return message.channel.send(this.embedify(message.guild, `This guild already has premium enabled!`, true));

        const userLastRenewal = userData.premium.getLastRenewal();
        const userBoostedGuilds = userData.premium.getBoostedGuilds();

        if (userLastRenewal.allowedBoosts <= userBoostedGuilds.length) return message.channel.send(this.embedify(message.guild, `You have already reached the maximum number of boosts allowed on your account!\nUpgrade your premium plan to boost more servers...`, true));

        await userData.premium.boostGuild(message.guild.id);
        await guildData.settings.premium.renewPermium(userLastRenewal.duration, userLastRenewal.type, userLastRenewal.giftedByID, message.author.id);

        message.channel.send(this.embedify(message.guild, `${message.author} Boosted this server!\nYay!!!`));
    }
}