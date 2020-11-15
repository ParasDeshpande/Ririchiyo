`use strict`

const credentials = require('../../config/credentials.json');
const loader = require('../utils/loader');

const DiscordClient = require("discord.js").Client;
const client = new DiscordClient();
client.notToken = "WhatAreYouTryingToDoYouIdiotHumanBeingThisIsNotATokenIfYouHaveNotRealisedYetUmmmYesThisIsVeryMuchProtected!!!";
async function run() {
    await loader.loadCommands(client, "src/commands");
    await loader.loadEvents(client, "src/events");
    await loader.loadLavalink(client);
    await loader.loadEvents(client.lavalinkClient, "src/lavalinkEvents");
    await client.login(credentials.discord.token);
}
run();