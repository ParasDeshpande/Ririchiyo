const BaseEvent = require('../../utils/structures/BaseEvent');

module.exports = class NodeCreateEvent extends BaseEvent {
    constructor() {
        super('nodeCreate', 'node');
    }

    async run(manager, node) {
        console.log("Node created: " + node.options.identifier);
    }
}