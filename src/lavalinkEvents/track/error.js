const BaseEvent = require('../../utils/structures/BaseEvent');

module.exports = class TrackErrorEvent extends BaseEvent {
    constructor() {
        super('trackError', 'track');
    }

    async run(manager, player, track, error) {
        manager
    }
}