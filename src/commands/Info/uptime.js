`use strict`
const BaseCommand = require('../../utils/structures/BaseCommand');
const time = require('ms');

module.exports = class UptimeCommand extends BaseCommand {
    constructor() {
        super({
            name: "uptime",
            aliases: ["ut"],
            category: "info",
            description: "View for how long the bot has been online",
        })
    }
    async run({ message }) {
        if (!message.channel.clientPermissions.has("EMBED_LINKS")) return message.channel.send("I don't have permissions to send message embeds in this channel");

        const uptime = time(message.client.uptime)
        const heartbeat = message.client.fakeHeartbeat ? message.client.fakeHeartbeat : message.client.fakeHeartbeat = Math.floor(Math.random() * (20 - 10 + 1) + 10) + "ms";
        const uptimeEmbed = new this.discord.MessageEmbed()
            .addField(`Uptime`, `${uptime}`)
            .addField(`Other Info`, `Running on Shard: [${parseInt(message.guild.shard.id) + 1}/${message.client.shard.count}]\nHeartbeat: ${heartbeat/*message.client.ws.ping ? `${Math.round(message.client.ws.ping)}ms` : ''*/}\nVersion: ${this.settings.client.info.version}`)
            .setColor(await this.getClientColour(message.guild));

        message.channel.send(uptimeEmbed).catch(console.error);
    }
}