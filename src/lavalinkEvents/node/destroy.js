const BaseEvent = require('../../utils/structures/BaseEvent');

module.exports = class NodeDestroyEvent extends BaseEvent {
    constructor() {
        super('nodeDestroy', 'node');
    }

    async run(manager, node) {
        console.log("Node destroyed: " + node.options.identifier);
    }
}