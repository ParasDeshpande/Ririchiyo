const BaseEvent = require('../../utils/structures/BaseEvent');

module.exports = class TrackStuckEvent extends BaseEvent {
    constructor() {
        super('trackStuck', 'track');
    }

    async run(manager, player, track, payload) {
        await player.playingMessageManager.deleteMessage(track.requester.requestID);
        await player.options.textChannelOBJ.send(this.embedify(player.guild, `**[${this.discord.escapeMarkdown(track.title)}](${track.uri})**\n\`Added by - \`The track got stuck while playing\``, true))
    }
}