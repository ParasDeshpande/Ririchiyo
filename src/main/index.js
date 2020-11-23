`use strict`

const credentials = require('../../config/credentials.json');
const loader = require('../utils/loader');
const DiscordClient = require("discord.js").Client;
const client = new DiscordClient();
client.notToken = "WhatAreYouTryingToDoYouIdiotHumanBeingThisIsNotATokenIfYouHaveNotRealisedYetUmmmYesThisIsVeryMuchProtected!!!";

const Database = require("../database/Database");
client.db = new Database(credentials.mongodb.uri);

async function run() {
    await loader.loadCommands(client, "src/commands");
    await loader.loadEvents(client, "src/events");
    await loader.loadLavalink(client);
    await loader.loadEvents(client.lavalinkClient, "src/lavalinkEvents");
    await client.db.connect(credentials.mongodb.database);
    await client.login(credentials.discord.token);
}
run();