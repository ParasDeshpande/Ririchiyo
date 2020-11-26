const BaseEvent = require('../../utils/structures/BaseEvent');

module.exports = class QueueEndEvent extends BaseEvent {
    constructor() {
        super('queueEnd', 'queue');
    }

    async run(manager, player, event) {
        if (player.playingMessage && !player.playingMessage.deleted) {
            await player.playingMessage.delete().catch(err => { if (err.message != 'Unknown Message') console.log(err) });
            delete player.playingMessage;
        }
        await player.options.textChannelOBJ.send(this.embedify(player.options.guildOBJ, "The music queue has ended."));
        player.stop();
    }
}