const BaseEvent = require('../../utils/structures/BaseEvent');

module.exports = class CriticalPlayerErrorEvent extends BaseEvent {
    constructor() {
        super('criticalPlayerError', 'player');
    }

    async run(manager, player, type, data) {
        await player.options.textChannelOBJ.send(this.embedify(player.guild, `**Too many errors occurred!**\nStopped the player...\nIf this error continues please contact the developers.`, true))
    }
}