const BaseEvent = require('../../utils/structures/BaseEvent');

module.exports = class CriticalPlayerErrorEvent extends BaseEvent {
    constructor() {
        super('criticalPlayerError', 'player');
    }

    async run(player, type, data) {
        if (player.playingMessage) player.playingMessage.error = true;
        await player.options.textChannelOBJ.send(this.embedify(player.guild, `**[${this.discord.escapeMarkdown(data.track.title)}](${data.track.uri})**\n\`Added by - \`${data.track.requester.mention}\` \`\nA critical error occured while playing the queue: \`${data.payload.error ? (data.payload.error ? data.payload.error : "UNKNOWN_ERROR") : "UNKNOWN_ERROR"}\``, true))
    }
}