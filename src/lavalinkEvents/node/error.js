const BaseEvent = require('../../utils/structures/BaseEvent');

module.exports = class NodeErrorEvent extends BaseEvent {
    constructor() {
        super('nodeError', 'node');
    }

    async run(manager, node, error) {
        console.log("Error occurred while connecting to node: " + node.options.identifier + "\nError: " + error.message);//manager.nodes.keyArray()
    }
}