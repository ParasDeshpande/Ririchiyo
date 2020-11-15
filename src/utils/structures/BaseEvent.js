const CommandUtil = require('./CommandUtil');

module.exports = class BaseEvent extends CommandUtil {
    constructor(name, category) {
        super();
        this.name = name;
        this.category = category;
    }
}