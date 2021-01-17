import { Player } from "6ec0bd7f/dist";
import { Message, ReactionCollector, TextChannel } from "discord.js";
import GuildSettings from "../../database/structures/GuildSettings";
import { Graph } from 'bar-graphify';

const bandsArray = ["25", "40", "63", "100", "160", "250", "400", "630", "1K", "1.6K", "2.5K", "4K", "6.3K", "10K", "16K"];
const gainLevels = ["- 0.25", "- 0.20", "- 0.10", "0.00", "+ 0.10", "+ 0.20", "+ 0.30", "+ 0.40", "+ 0.50", "+ 0.60", "+ 0.70", "+ 0.80", "+ 0.90", "+ 1.00"];

class EQMessage {
    // Class props //
    channel: TextChannel;
    player?: Player;
    guildSettings?: GuildSettings;
    viewOnly: boolean;
    message?: Message;
    reactionCollector?: ReactionCollector;
    cursor = 0;
    graph: Graph;
    // Class props //

    constructor(channel: TextChannel, player?: Player, guildSettings?: GuildSettings, viewOnly: boolean = false) {
        this.channel = channel;
        this.player = player;
        this.guildSettings = guildSettings;
        this.viewOnly = viewOnly;
        this.graph = new Graph({ xLabels: gainLevels, yLabels: bandsArray, fillHeights: player ? player.bands : guildSettings?.music.eq.bands });
    }

    updateGraph() {
    }
}

class EQGraph {
    constructor(bands)
}