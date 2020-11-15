const credentials = require('../../config/credentials.json');
const settings = require("../../config/settings.json");

const { ShardingManager } = require('discord.js');
const shard = new ShardingManager('src/main/index.js', {
    token: credentials.discord.token,
    autoSpawn: true,
    totalShards: settings.client.shards.totalShards,
});

shard.on("shardCreate", shard => console.log(`Starting Shard ${shard.id + 1}/${shard.manager.totalShards}`));
shard.spawn();