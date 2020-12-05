const BaseEvent = require('../../utils/structures/BaseEvent');

module.exports = class TrackErrorEvent extends BaseEvent {
    constructor() {
        super('trackError', 'track');
    }

    async run(manager, player, track, payload) {
        console.log("Removed- " + track.requester.requestID);
        await player.playingMessageManager.deleteMessage(track.requester.requestID);
        await player.options.textChannelOBJ.send(this.embedify(player.guild, `**[${this.discord.escapeMarkdown(track.title)}](${track.uri})**\n\`Added by - \`${track.requester.mention}\` \`\nAn error occured while playing track: \`${payload.error ? (payload.error ? payload.error : "UNKNOWN_ERROR") : "UNKNOWN_ERROR"}\``, true))
    }
}