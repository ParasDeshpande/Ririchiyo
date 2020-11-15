const BaseCommand = require('../../utils/structures/BaseCommand');
const time = require('ms');

module.exports = class InfoCommand extends BaseCommand {
    constructor() {
        super({
            name: "info",
            aliases: ["i"],
            category: "info",
            description: "Get some info about the bot",
        })
    }
    async run({ message }) {
        if (!message.channel.clientPermissions.has("EMBED_LINKS")) return message.channel.send("I don't have permissions to send message embeds in this channel");

        const uptime = time(message.client.uptime);

        const owner = await message.client.users.fetch(this.owners[0].id).catch(err => { if (err.message == "Unknown User" || err.message.startsWith("Invalid Form Body")) { return; } else { console.error(err.message); } });
        const numberOfGuildsArray = await message.client.shard.fetchClientValues('guilds.cache.size');
        const totalGuilds = await numberOfGuildsArray.reduce((prev, val) => prev + val, 0)
        const numberOfUsersArray = await message.client.shard.fetchClientValues('users.cache.size');
        const totalUsers = await numberOfUsersArray.reduce((prev, val) => prev + val, 0)
        const invite = await message.client.generateInvite({ options: 536346111 });


        let infoEmbed = new this.discord.MessageEmbed()
            .setAuthor(message.client.user.username, message.client.user.avatarURL())
            .addField(`Version`, `${this.settings.client.info.version}`, true)
            .addField(`Library`, `${this.settings.client.info.library}`, true)
            .addField(`Made by`, `${owner.username} [${this.appearance.additionalEmojis.pandaExcitedLove.emoji}](https://dsc.bio/paras)`, true)
            .addField(`Servers`, `${parseInt(totalGuilds)}`, true)
            .addField(`Users`, `${parseInt(totalUsers)}`, true)
            .addField(`Commands`, `${message.client.commands.size}`, true)
            .addField(`Support`, `**[Support](${this.settings.client.info.supportServerURL})**`, true)
            .addField(`Invite`, `**[Invite](${invite})**`, true)
            .addField(`Get premium`, `**[Premium](${this.settings.client.info.premiumURL})**`, true)
            .setFooter(`${this.settings.client.info.hosting} | Shard [${parseInt(message.guild.shard.id) + 1}/${message.client.shard.count}] | Uptime ${uptime}`)
            .setColor(this.getClientColour(message.guild));

        message.channel.send(infoEmbed).catch(console.error);
    }
}