const CommandUtil = require('../structures/CommandUtil');

module.exports = class CommandHandlerUtil extends CommandUtil {
    constructor() {
        super();
    }

    async fetchPermissions(client, message, guildID, channelID) {
        let success;
        let userOrOwner;
        let userIdToDM;
        if (message == null) {
            userIdToDM = await client.guilds.fetch(guildID).then(guild => guild.owner.id).catch(error => console.error(`Could not get guild owner ID in actionHandler.js/sendMessage`));
            userOrOwner = 'Server Owner';
        }
        else {
            userIdToDM = message.author.id;
            userOrOwner = 'User';
        }
        guildID = guildID ? guildID : message.guild.id;
        channelID = channelID ? channelID : message.channel.id;
        let botPermissions = await client.guilds.fetch(guildID).then(guild => guild.channels.cache.find(channel => channel.id === channelID).permissionsFor(client.user));
        if (botPermissions.has('SEND_MESSAGES')) {
            success = true;
        }
        else {
            success = false;
            const messageToBeSent = `I dont have permissions to send messages on \`${await client.guilds.fetch(guildID).then(guild => guild.name)}\` in \`#${await client.guilds.fetch(guildID).then(guild => guild.channels.cache.find(channel => channel.id === channelID).name)}\``;
            const DMsuccess = await this.sendDirectMessageHandler(client, message, messageToBeSent, userIdToDM);
            if (DMsuccess == false && userOrOwner == 'User' && userIdToDM !== await client.guilds.fetch(guildID).then(guild => guild.owner.id).catch(error => console.error(`Could not get guild owner ID in actionHandlers/sendMessage.js`))) {
                userIdToDM = await client.guilds.fetch(guildID).then(guild => guild.owner.id).catch(error => console.error(`Could not get guild owner ID in actionHandlers/sendMessage.js`));
                await this.sendDirectMessageHandler(client, message, messageToBeSent, userIdToDM);
            }

        }
        return await success ? botPermissions : undefined;
    }

    async sendDirectMessageHandler(client, message, messageToBeSent, userIdToDM) {
        let success = true;
        if (message !== null && !userIdToDM) userIdToDM = message.author.id;

        const obj = await client.users.fetch(userIdToDM).then(async (user) => {
            await user.send(messageToBeSent).catch(error => {
                success = false;
            });
        });
        return { success: success, obj: obj };
    }
}