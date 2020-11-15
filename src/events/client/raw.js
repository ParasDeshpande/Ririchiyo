const BaseEvent = require('../../utils/structures/BaseEvent');

module.exports = class RawEvent extends BaseEvent {
    constructor() {
        super('raw', 'music')
    }
    async run(client, data) {
        client.lavalinkClient.updateVoiceState(data);
    };
}