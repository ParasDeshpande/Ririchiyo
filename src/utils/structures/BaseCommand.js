const CommandUtil = require('./CommandUtil');

module.exports = class BaseCommand extends CommandUtil {
    constructor({ name, aliases, category, description, cooldown, usage, hidden, editedEvent, requiredPermissionsToView }) {
        super();
        this.name = name;
        this.aliases = aliases;
        this.category = category;
        this.description = description;
        this.cooldown = cooldown;
        this.usage = usage;
        this.hidden = hidden;
        this.editedEvent = editedEvent;
        this.requiredPermissionsToView = requiredPermissionsToView;
    }
}