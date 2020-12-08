const BaseEvent = require('../../utils/structures/BaseEvent');

module.exports = class PlayerInactivityEvent extends BaseEvent {
    constructor() {
        super('playerInactivity', 'player');
    }

    async run(manager, player) {
        if (player.queue.current) await player.playingMessageManager.deleteMessage(player.queue.current.requester.requestID);
        player.options.textChannelOBJ.send(this.embedify(player.options.guildOBJ, `I left the voice channel due to inactivity!\nIf you have **[premium](${this.settings.client.info.premiumURL})**, you can disable this by using \`${player.options.guildData.settings.prefix}24/7\``, false, this.appearance.warn.colour));
        await player.destroy();
    }
}