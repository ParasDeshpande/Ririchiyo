import GlobalCTX from '../../utils/GlobalCTX';
import { BaseCommand, CommandCTX } from '../../utils/structures/BaseCommand';

export default class InviteCommand extends BaseCommand {
    constructor() {
        super({
            name: "invite",
            aliases: ["iv"],
            category: "utils",
            description: "Get the invite link for the bot."
        })
    }

    async run(ctx: CommandCTX) {
        if (!ctx.permissions.has("EMBED_LINKS")) return await ctx.channel.send("I don't have permissions to send message embeds in this channel");

        //@ts-expect-error
        const invite = await ctx.client.generateInvite({ options: BaseCommand.settings.default_invite_permissions });

        const inviteEmbed = new BaseCommand.discord.MessageEmbed({
            description: `**Add me to your server- [Invite](${invite})**\n**Join our support server- [Ririchiyo Community](${BaseCommand.settings.info.supportServerURL})**`,
            color: BaseCommand.getClientColour(ctx.guild)
        })

        await ctx.channel.send(inviteEmbed).catch((err: Error) => GlobalCTX.logger?.error(err.message));
    }
}