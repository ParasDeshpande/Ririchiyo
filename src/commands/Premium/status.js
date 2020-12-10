const BaseCommand = require('../../utils/structures/BaseCommand');

module.exports = class BoostCommand extends BaseCommand {
    constructor() {
        super({
            name: "status",
            description: "Check your premium status",
            category: "premium",
        })
    }

    async run({ message, guildData, userData }) {
        if (!message.channel.clientPermissions.has("EMBED_LINKS")) return message.channel.send("I don't have permissions to send message embeds in this channel");

        let premiumEmbed = new this.discord.MessageEmbed();

        const lastGuildRenewal = guildData.settings.premium.getLastRenewal();
        const lastUserRenewal = userData.premium.getLastRenewal();

        if (await guildData.settings.premium.checkIfEnabled()) {
            premiumEmbed.addField("Guild Premium", `Status- \`Active\`\nExpires on- \`${new Date(lastGuildRenewal.renewedOn)}\`\nType- \`${lastGuildRenewal.type}\`\nAdded by- <@${lastGuildRenewal.addedByID}>`)
        } else if (await guildData.settings.premium.checkIfExpired()) {
            premiumEmbed.addField("Guild Premium", `Status- \`Expired\`\nExpired on- \`${new Date(lastGuildRenewal.expiry)}\`\nType- \`${lastGuildRenewal.type}\`\nAdded by- <@${lastGuildRenewal.addedByID}>`)
        } else {
            premiumEmbed.addField("Guild Premium", `Status- \`Not Enabled\``)
        }

        // if (await userData.premium.checkIfEnabled()) {
        //     premiumEmbed.addField("User Premium", `Status- \`Active\`\nExpires on- \`${new Date(lastUserRenewal.renewedOn)}\`\nType- \`${lastUserRenewal.type}\`\nBoosts allowed- \`${lastUserRenewal.allowedBoosts}\`\nBoosts left- \`${lastUserRenewal.allowedBoosts - userData.premium.boostedGuilds.length}\`\nBoosted guilds- \`${userData.premium.boostedGuilds.length}\``)
        // } else if (await userData.premium.checkIfExpired()) {
        //     premiumEmbed.addField("User Premium", `Status- \`Expired\`\nExpired on- \`${new Date(lastUserRenewal.expiry)}\`\nType- \`${lastUserRenewal.type}\`\nBoosts allowed- \`${lastUserRenewal.allowedBoosts}\`\nBoosts left- \`${lastUserRenewal.allowedBoosts - userData.premium.boostedGuilds.length}\`\nBoosted guilds- \`${userData.premium.boostedGuilds.length}\``)
        // } else {
        //     premiumEmbed.addField("User Premium", `Status- \`Not Enabled\``)
        // }

        message.channel.send(premiumEmbed);
    }
}