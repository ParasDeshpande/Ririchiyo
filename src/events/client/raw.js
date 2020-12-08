const BaseEvent = require('../../utils/structures/BaseEvent');

module.exports = class RawEvent extends BaseEvent {
    constructor() {
        super('raw', 'client')
    }
    async run(client, data) {
        client.lavalinkClient.updateVoiceState(data);
    };
}