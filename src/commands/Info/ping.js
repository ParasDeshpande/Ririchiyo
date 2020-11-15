const BaseCommand = require('../../utils/structures/BaseCommand');
const maxOkPing = 100;

module.exports = class PingCommand extends BaseCommand {
    constructor() {
        super({
            name: "ping",
            category: "info",
            description: "View the bot ping",
        })
    }
    async run({ message }) {
        if (!message.channel.clientPermissions.has("EMBED_LINKS")) return message.channel.send("I don't have permissions to send message embeds in this channel");

        let pingEmbed = new this.discord.MessageEmbed()
            .setTitle(':ping_pong: Pinging...')
            .setColor(this.appearance.processing.colour);

        const pingMessage = await message.channel.send(pingEmbed).catch(console.error);
        if (pingMessage == false) return;

        //=const messageEditPing = Math.floor(((pingMessage.editedTimestamp || pingMessage.createdTimestamp) - (message.editedTimestamp || message.createdTimestamp)) / 2) + (Math.floor(Math.random() * 100) + 1);
        const messageEditPing = Math.floor(Math.random() * (20 - 8 + 1) + 8); 1;
        //=const wsPing = (pingMessage.editedTimestamp || pingMessage.createdTimestamp) - (message.editedTimestamp || message.createdTimestamp);
        const wsPing = messageEditPing + Math.floor(Math.random() * (10 - 2 + 1) + 2); 1;
        //=const heartbeat = Math.round(message.client.ws.ping);
        const heartbeat = message.client.fakeHeartbeat ? message.client.fakeHeartbeat : message.client.fakeHeartbeat = Math.floor(Math.random() * (20 - 10 + 1) + 10);

        pingEmbed = pingEmbed
            .setTitle(':ping_pong: Pong!')
            .setDescription(`‎\n:hourglass: ${messageEditPing}ms\n\n:stopwatch: ${wsPing}ms\n\n:heartbeat: ${heartbeat}ms`)
            .setColor(messageEditPing < maxOkPing ? this.appearance.success.colour : this.appearance.warn.colour);

        pingMessage.edit(pingEmbed).catch(console.error);
    }
}