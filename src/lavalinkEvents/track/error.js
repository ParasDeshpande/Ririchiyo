const BaseEvent = require('../../utils/structures/BaseEvent');

module.exports = class TrackErrorEvent extends BaseEvent {
    constructor() {
        super('trackError', 'track');
    }

    async run(manager, player, track, error) {
        if (player.playingMessage) player.playingMessage.error = true;
        await player.options.textChannelOBJ.send(this.embedify(player.guild, `**[${this.discord.escapeMarkdown(track.title)}](${track.uri})**\n\`Added by - \`${track.requester.mention}\` \`\nAn error occured while playing track!`, true))
    }
}