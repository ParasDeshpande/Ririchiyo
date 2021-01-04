import Utils from "../Utils";
import GlobalCTX from '../GlobalCTX';

export class BaseEvent extends Utils {
    name: string;
    category: string;
    globalCTX: typeof GlobalCTX;

    constructor(options: EventProps) {
        super();
        const { name, category } = check(options);
        this.name = name;
        this.category = category;
        this.globalCTX = GlobalCTX;
    }
    async run(...args: any[]): Promise<void> { };
}

export interface EventProps {
    name: string;
    category: string;
}

function check(options: EventProps): EventProps {
    if (!options) throw new TypeError("No options provided for command.");

    if (!options.name) throw new TypeError("No name provided for command.");
    if (typeof options.name !== 'string') throw new TypeError("Command option 'name' must be of type 'string'.");

    if (!options.category) throw new TypeError("No category provided for command.");
    if (typeof options.category !== 'string') throw new TypeError("Command option 'category' must be of type 'string'.");

    return options;
}

export default BaseEvent;