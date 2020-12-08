const credentials = require('../../config/credentials.json');
const settings = require("../../config/settings.json");
const loader = require("../utils/loader");

const Discord = require('discord.js');
const ShardingManager = new Discord.ShardingManager('src/main/index.js', {
    token: credentials.discord.token,
    autoSpawn: true,
    totalShards: settings.client.shards.totalShards,
});

ShardingManager.on("shardCreate", async (shard) => {
    await loader.loadEvents(shard, "src/shardEvents")
});
ShardingManager.spawn();