const lavalinkClient = require("./src/index");
const SpotifyPlugin = require("./src/spotify");
const credentials = require('../../config/credentials.json');

module.exports = {
    async loadClient(client) {
        client.lavalinkClient = new lavalinkClient.Manager({
            plugins: [new SpotifyPlugin({ clientID: credentials.spotify.clientID, clientSecret: credentials.spotify.clientSecret })],
            nodes: [
                {
                    host: credentials.lavalink.host,
                    port: credentials.lavalink.port,
                    password: credentials.lavalink.password,
                    secure: false
                }
            ],
            autoPlay: true,
            send(id, payload) {
                const guild = client.guilds.cache.get(id);
                if (guild) guild.shard.send(payload);
            },
        })
    }
}

// /**
        //  * Node events
        //  */
        // .on("nodeCreate", (node) => client.emit("nodeCreate", node))
        // .on("nodeConnect", (node) => client.emit("nodeConnect", node)) //emit node connect in main client
        // .on("nodeReconnect", (node) => client.emit("nodeReconnect", node))
        // .on("nodeDisconnect", (node) => client.emit("nodeDisconnect", node))
        // .on("nodeDestroy", (node) => client.emit("nodeDestroy", node))
        // .on("nodeRaw", (node) => client.emit("nodeRaw", node))
        // .on("nodeError", (node, error) => client.emit("nodeError", node, error)) //emit node error in main client

        // /**
        //  * Player events
        //  */
        // .on("playerCreate", (player) => client.emit("playerCreate", player))
        // .on("playerMove", (player, oldChannel, newChannel) => {
        //     if (!newChannel) client.emit("voiceDisconnect", player)
        //     else client.emit("playerMove", player, oldChannel, newChannel)
        // })
        // .on("playerDestroy", (player) => client.emit("playerDestroy", player))

        // /**
        //  * Track events
        //  */
        // .on("trackStart", (player, track, event) => client.emit("trackStart", player, track, event))
        // .on("trackEnd", (player, track, event) => client.emit("trackEnd", player, track, event))
        // .on("trackStuck", (player, track, event) => client.emit("trackStuck", player, track, event))
        // .on("trackError", (player, track, event) => client.emit("trackError", player, track, event))

        // /**
        //  * Queue events
        //  */
        // .on("queueEnd", (player) => client.emit("queueEnd", player))

        // /**
        //  * Socket events
        //  */
        // .on("socketClosed", (player, event) => client.emit("socketClosed", player, event))