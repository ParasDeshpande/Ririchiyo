const BaseEvent = require('../../utils/structures/BaseEvent');

module.exports = class PlayerMoveEvent extends BaseEvent {
    constructor() {
        super('playerMove', 'player');
    }

    async run(manager, player, oldChannel, newChannel) {
        player.voiceChannel = newChannel;
    }
}