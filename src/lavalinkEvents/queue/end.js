const BaseEvent = require('../../utils/structures/BaseEvent');

module.exports = class QueueEndEvent extends BaseEvent {
    constructor() {
        super('queueEnd', 'queue');
    }

    async run(manager, player, event) {
        if (player.playingMessage && !player.playingMessage.deleted) {
            await player.playingMessage.delete().catch(console.error);
            delete player.playingMessage;
        }

        player.textChannel.send(this.embedify(player.guild, "The music queue has ended."));
        player.stop();
    }
}