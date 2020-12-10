const Topgg = require('@top-gg/sdk');
const express = require('express');
const app = express();
const uniqid = require("uniqid");

const BaseEvent = require('../utils/structures/BaseEvent');

module.exports = class ShardReadyEvent extends BaseEvent {
    constructor() {
        super('ready', 'shard')
    }
    async run(shard) {
        if (shard.id === 0) this.webhookAccepter(shard);
        console.log(`[DEBUG/SHARD] Shard[${shard.id}] ${shard.id + 1}/${shard.manager.totalShards} is ready!`);
    };

    webhookAccepter(shard) {
        const webhook = new Topgg.Webhook(this.credentials.discordbotslist.webhook.authorization);
        app.post("/vote/top.gg", webhook.middleware(), async (req, res) => {
            if (!req.vote) return;
            shard.manager.broadcastEval(`this.emit("vote", "top.gg", {voteID:"${uniqid()}","userID":"${req.vote.user.toString()}","bonus":${req.vote.isWeekend}})`);
            res.sendStatus(200);
        });
        app.listen(this.credentials.discordbotslist.webhook.port, () => { console.log("Webhook started on port: " + this.credentials.discordbotslist.webhook.port) });
    }

    voteDataHandler(shard) {

    }
}
