const CommandUtil = require("./structures/CommandUtil");
const commandUtil = new CommandUtil;
const axios = require("axios");

let deepMerge = (...arguments) => {
    let target = {};
    let merger = (obj) => {
        for (let prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                if (Object.prototype.toString.call(obj[prop]) === '[object Object]') {
                    target[prop] = deepMerge(target[prop], obj[prop]);
                } else {
                    target[prop] = obj[prop];
                }
            }
        }
    };
    for (let i = 0; i < arguments.length; i++) merger(arguments[i]);
    return target;
}

function findIndexWithPropInArray(array, prop, value) {
    for (var i = 0; i < array.length; i += 1) {
        if (array[i][prop] === value) {
            return i;
        }
    }
    return -1;
}

async function restart(message, restartDataClass) {
    restartDataClass.wasRestarted = true;
    restartDataClass.guildID = message.guild.id;
    restartDataClass.channelID = message.channel.id;
    const sentRestartingMessage = await message.channel.send(commandUtil.embedify(message.guild, `Restarting the bot! ${commandUtil.appearance.processing.emoji}`, false, commandUtil.appearance.processing.colour));
    restartDataClass.restartingMessageID = sentRestartingMessage.id;
    await message.client.user.setActivity("Restarting!");
    message.client.lavalinkClient.destroy();
    message.client.destroy();
    process.exit(1);
}

async function handleRestartData(client, restartDataClass) {
    if (restartDataClass.wasRestarted == true) {
        restartDataClass.wasRestarted = false;
        const guild = await client.guilds.fetch(restartDataClass.guildID);
        restartDataClass.guildID = false;
        if (!guild) return;
        const channel = await guild.channels.resolve(restartDataClass.channelID);
        restartDataClass.channelID = false;
        if (!channel) return;
        const message = (await channel.messages.fetch(restartDataClass.restartingMessageID)).first();
        restartDataClass.restartingMessageID = false;
        if (!message) return;
        return await message.edit(commandUtil.embedify(guild, `Successfully restarted the bot! ${commandUtil.appearance.success.emoji}`));
    }
    else return;
}

async function updateDiscordBotsListStats(client, guilds, users, voiceConnections) {
    const postURI = `https://discordbolist.com/api/v1/bots/${client.user.id}/stats/`;
    const { response } = await axios.post(postURI, { guilds, users, voice_connections: voiceConnections }, { headers: { Authorization: commandUtil.credentials.discordbotslist.token } }).catch(error => { return error });
    if (!response) return false;
    if (!response.data) return false;
    if (!response.data.success) return false;
    return true;
}

module.exports = { deepMerge, findIndexWithPropInArray, restart, handleRestartData, updateDiscordBotsListStats };