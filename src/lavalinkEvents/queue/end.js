const BaseEvent = require('../../utils/structures/BaseEvent');

module.exports = class QueueEndEvent extends BaseEvent {
    constructor() {
        super('queueEnd', 'queue');
    }

    async run(manager, player, track, event) {
        await player.options.textChannelOBJ.send(this.embedify(player.options.guildOBJ, "The music queue has ended."));
        player.stop();
    }
}