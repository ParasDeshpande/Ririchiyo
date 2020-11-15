const BaseEvent = require('../../utils/structures/BaseEvent');

module.exports = class TrackEndEvent extends BaseEvent {
    constructor() {
        super('trackEnd', 'track');
    }

    async run(manager, player, track, event) {
        if (player.playingMessage && !player.playingMessage.deleted) {
            await player.playingMessage.delete().catch(console.error);
            delete player.playingMessage;
        }
        if (event.reason !== "STOPPED") player.previousTracks.unshift(track);
    }
}