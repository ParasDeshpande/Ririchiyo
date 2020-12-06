const BaseEvent = require('../../utils/structures/BaseEvent');

module.exports = class MessageEvent extends BaseEvent {
    constructor() {
        super('vote', 'custom');
    }

    async run(client, site, data) {
        console.log(data);
    }
}