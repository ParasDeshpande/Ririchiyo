const BaseEvent = require('../../utils/structures/BaseEvent');

module.exports = class PlayerMoveEvent extends BaseEvent {
    constructor() {
        super('playerMove', 'player');
    }

    async run(manager, player, oldChannel, newChannel) {
        if (!newChannel) return manager.emit("playerDisconnect", player, oldChannel);
        player.voiceChannel = newChannel;
        player.options.voiceChannelOBJ = await player.options.voiceChannelOBJ.client.channels.resolve(newChannel);
    }
}