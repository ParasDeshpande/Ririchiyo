const BaseEvent = require('../../utils/structures/BaseEvent');

module.exports = class TrackStartEvent extends BaseEvent {
    constructor() {
        super('trackStart', 'track');
    }

    async run(manager, player, track) {
        await player.playingMessageManager.createMessage(track.requester.requestID, player, track).send();
    }
}