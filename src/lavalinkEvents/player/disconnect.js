const BaseEvent = require('../../utils/structures/BaseEvent');

module.exports = class PlayerDisconnectEvent extends BaseEvent {
    constructor() {
        super('playerDisconnect', 'player');
    }

    async run(manager, player, oldChannel) {
        if (player.playingMessage && !player.playingMessage.deleted) {
            player.playingMessage.delete().catch(console.error);
            delete player.playingMessage;
        }
        player.inactivityChecker.stop = true;
        delete player.guild.player;
        player.textChannel.send(this.embedify(player.guild, "I got disconnected from the voice channel!\nCleared the music queue.", false, this.appearance.warn.colour));
        await player.destroy();
    }
}