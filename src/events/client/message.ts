import BaseEvent from '../../utils/structures/BaseEvent';
import { Client, Message } from 'discord.js';
import { MessageParser, Utils } from '../../utils/Utils';
import GlobalCTX from '../../utils/GlobalCTX';

export default class MessageEvent extends BaseEvent {
    constructor() {
        super({
            name: "message",
            category: "client",
        })
    }

    async run(client: Client, message: Message) {
        if (!message.guild) return;
        if (message.author.bot) return;

        if (!GlobalCTX.DB) throw new Error("Database is not present in global CTX.");
        if (!GlobalCTX.commands) throw new Error("Commands are not loaded in global CTX.");

        const guildSettings = await GlobalCTX.DB.getGuildSettings(message.guild.id);

        const parsedCommand = await MessageParser.parseCommand({ prefix: guildSettings.prefix, commandsCollection: GlobalCTX.commands, message });
        if (!parsedCommand) return;

        parsedCommand.guildSettings = guildSettings;
        try {
            parsedCommand.command.run(parsedCommand);
        } catch (err) {
            GlobalCTX.logger?.error(err);
            message.channel.send(Utils.embedifyString(message.guild, `There was an error executing that command, please try again.\nIf this error persists, please report this issue on our support server- [ririchiyo.xyz/support](${Utils.settings.info.supportServerURL})`, true));
        }
    }
}