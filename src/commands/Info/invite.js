const BaseCommand = require('../../utils/structures/BaseCommand');

module.exports = class InviteCommand extends BaseCommand {
    constructor() {
        super({
            name: "invite",
            aliases: ["iv"],
            category: "info",
            description: "Get the invite link for the bot",
        })
    }
    async run({ message }) {
        if (!message.channel.clientPermissions.has("EMBED_LINKS")) return message.channel.send("I don't have permissions to send message embeds in this channel");

        const invite = await message.client.generateInvite({ options: 536346111 });

        const inviteEmbed = new this.discord.MessageEmbed()
            .setDescription(`**Add me to your server- [Invite](${invite})**\n**Join our support server- [ririchiyo.bot/support](${this.settings.client.info.supportServerURL})**`)
            .setColor(this.getClientColour(message.guild));

        message.channel.send(inviteEmbed).catch(console.error);
    }
}