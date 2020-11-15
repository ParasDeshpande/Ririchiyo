const BaseEvent = require('../../utils/structures/BaseEvent');

module.exports = class NodeConnectEvent extends BaseEvent {
    constructor() {
        super('nodeConnect', 'node');
    }

    async run(manager, node) {
        console.log("Node connected: " + node.options.identifier);
    }
}