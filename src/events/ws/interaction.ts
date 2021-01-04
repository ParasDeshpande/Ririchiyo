import BaseEvent from '../../utils/structures/BaseEvent';
import { WebSocketManager, GuildMember, TextChannel } from 'discord.js';
import { Utils, Cooldowns } from '../../utils/Utils';
import { CommandCTX } from '../../utils/structures/BaseCommand';
import GlobalCTX from '../../utils/GlobalCTX';

export interface InteractionData {
    version: number,
    type: number,
    token: string,
    member: {
        user: {
            username: string,
            public_flags: number,
            id: string,
            discriminator: string,
            avatar: string
        },
        roles: string[],
        premium_since: number | null,
        permissions: string,
        pending: boolean,
        nick: string | null,
        mute: boolean,
        is_pending: boolean,
        deaf: boolean
    },
    id: string,
    guild_id: string,
    data: { options: InteractionOptions[], name: string, id: string },
    channel_id: string
}

export interface InteractionOptions {
    value: string,
    name: string
}

export default class SlashCommandEvent extends BaseEvent {
    constructor() {
        super({
            name: "INTERACTION_CREATE",
            category: "ws",
        })
    }

    async run(ws: WebSocketManager, interaction: InteractionData) {
        if (!GlobalCTX.DB) throw new Error("Database is not present in global CTX.");
        if (!GlobalCTX.commands) throw new Error("Commands are not loaded in global CTX.");

        const command = GlobalCTX.commands.get(interaction.data.name);
        if (!command) return;

        const recievedTimestamp = Date.now();
        const channel = GlobalCTX.client.channels.resolve(interaction.channel_id) as TextChannel;
        const guild = GlobalCTX.client.guilds.resolve(interaction.guild_id);
        if (!guild) return;

        const member = new GuildMember(GlobalCTX.client!, interaction.member, guild);

        if (await Cooldowns.check(command, member.user, channel, null)) return;

        const permissions = channel.permissionsFor(GlobalCTX.client.user!);
        if (!permissions) return;


        const args = interaction.data.options.map(o => o.value);

        const ctx: CommandCTX = {
            command,
            args,
            member,
            channel,
            guild,
            client: GlobalCTX.client,
            permissions,
            recievedTimestamp
        }

        try {
            command.run(ctx);
        } catch (err) {
            GlobalCTX.logger?.error(err);
            channel.send(Utils.embedifyString(guild, `There was an error executing that command, please try again.\nIf this error persists, please report this issue on our support server- [ririchiyo.xyz/support](${Utils.settings.info.supportServerURL})`, true));
        }
    }
}