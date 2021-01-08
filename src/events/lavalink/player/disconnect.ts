import { Player, Manager, Track, UnresolvedTrack } from '6ec0bd7f/dist';
import BaseEvent from '../../../utils/structures/BaseEvent';

export class PlayerDisconnectEvent extends BaseEvent {
    constructor() {
        super({
            name: "playerDisconnect",
            category: "player",
        })
    }
    async run(manager: Manager, player: Player, oldChannel: string) {
        player.destroy();
    };
}
export default PlayerDisconnectEvent;