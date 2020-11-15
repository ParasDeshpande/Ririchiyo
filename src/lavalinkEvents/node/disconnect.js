const BaseEvent = require('../../utils/structures/BaseEvent');

module.exports = class NodeDisconnectEvent extends BaseEvent {
    constructor() {
        super('nodeDisconnect', 'node');
    }

    async run(manager, node) {
        console.log("Node disconnected: " + node.options.identifier);
    }
}