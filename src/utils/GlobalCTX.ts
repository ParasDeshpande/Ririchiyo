import { Commands } from './Utils';
import { Logger } from '../utils/Utils';
import DB from '../database/DB';
import { Client, Collection, GuildEmoji } from 'discord.js';

export default new class GlobalCTX {
    client: Client;
    commands: Commands;
    logger?: Logger;
    DB?: DB;
    customEmojiCache: Collection<string, GuildEmoji>;
    heartbeat?: number;

    constructor() {
        this.client = new Client();
        this.commands = new Collection();
        this.customEmojiCache = new Collection();
    }
}