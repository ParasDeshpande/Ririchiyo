const BaseEvent = require('../../utils/structures/BaseEvent');

module.exports = class NodeReconnectEvent extends BaseEvent {
    constructor() {
        super('nodeReconnect', 'node');
    }

    async run(manager, node) {
        console.log("Node reconnecting: " + node.options.identifier);
    }
}