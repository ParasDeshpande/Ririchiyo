const { Collection } = require("discord.js");
const PlayingMessage = require('./PlayingMessage');

module.exports = class PlayingMessageManager extends Collection {
    constructor() {
        super();
    }
    createMessage(uniqueID, player, track) {
        const playingMessage = new PlayingMessage(player, track);
        this.set(uniqueID, playingMessage);
        return playingMessage;
    }
    async deleteMessage(uniqueID) {
        const playingMessage = this.get(uniqueID);
        if (!playingMessage) return;

        await playingMessage.delete();
        this.delete(uniqueID);
    }
}