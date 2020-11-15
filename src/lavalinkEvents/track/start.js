const BaseEvent = require('../../utils/structures/BaseEvent');
const PlayingMessage = require("../../lavalinkClient/playingMessage");
const playingMessage = new PlayingMessage();

module.exports = class TrackStartEvent extends BaseEvent {
    constructor() {
        super('trackStart', 'track');
    }

    async run(manager, player, track) {
        playingMessage.update({ player, track });
    }
}