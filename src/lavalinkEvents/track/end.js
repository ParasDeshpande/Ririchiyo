const BaseEvent = require('../../utils/structures/BaseEvent');

module.exports = class TrackEndEvent extends BaseEvent {
    constructor() {
        super('trackEnd', 'track');
    }

    async run(manager, player, track) {
        await player.playingMessageManager.deleteMessage(track.requester.requestID);
    }
}