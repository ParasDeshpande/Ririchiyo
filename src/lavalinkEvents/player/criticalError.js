const BaseEvent = require('../../utils/structures/BaseEvent');

module.exports = class CriticalPlayerErrorEvent extends BaseEvent {
    constructor() {
        super('criticalPlayerError', 'player');
    }

    async run() {
        console.log("CriticalError")
    }
}