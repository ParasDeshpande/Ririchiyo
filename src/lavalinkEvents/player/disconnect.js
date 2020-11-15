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
        delete player.guild.player;
        player.guild.channels.resolve(player.textChannel.id).send(this.embedify(player.guild, "I got disconnected from the voice channel!\nCleared the music queue.", false, this.appearance.warn.colour));
        await player.destroy();
    }
}