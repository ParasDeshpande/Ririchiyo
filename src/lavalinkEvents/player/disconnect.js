const BaseEvent = require('../../utils/structures/BaseEvent');

module.exports = class PlayerDisconnectEvent extends BaseEvent {
    constructor() {
        super('playerDisconnect', 'player');
    }

    async run(manager, player, oldChannel) {
        if (player.queue.current) await player.playingMessageManager.deleteMessage(player.queue.current.requester.requestID);
        await player.options.textChannelOBJ.send(this.embedify(player.options.guildOBJ, "I got disconnected from the voice channel!\nCleared the music queue.", false, this.appearance.warn.colour));
        await player.destroy();
    }
}