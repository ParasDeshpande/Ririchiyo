const MusicUtil = require('../lavalinkClient/musicUtil');
const CommandHandler = require('../utils/commandHandler/commandHandler');
const commandHandler = new CommandHandler;


module.exports = class PlayingMessage extends MusicUtil {
    constructor(player, track) {
        super();
        this.player = player;
        this.guild = player.options.guildOBJ;
        this.channel = player.options.textChannelOBJ;
        this.track = track;
        this.message;
        this.messageNoSend;
    }

    async send() {
        const playingMessageEmbed = new this.discord.MessageEmbed({
            title: `${this.appearance.playerEmojis.musical_notes.emoji} Started playing! ${this.appearance.playerEmojis.playing.emoji}`,
            description: `**[${this.discord.escapeMarkdown(this.track.title)}](${this.track.uri})**\n\`Added by - \`${this.track.requester.mention}\` \``,
            image: {
                url: "https://cdn.discordapp.com/attachments/756541902202863740/780739509704327198/1920x1_TP.png"
            },
            color: this.getClientColour(this.guild)
        });

        const permissions = this.channel.permissionsFor(this.channel.client.user);
        if (!permissions.has("SEND_MESSAGES")) return;
        if (!permissions.has("EMBED_LINKS")) return this.channel.send(this.embedify(this.guild, "I don't have permissions to embed links in this channel!", true));
        if (!permissions.has("MANAGE_MESSAGES")) return this.channel.send(this.embedify(this.guild, "I don't have permissions to manage messages in this channel!\nThis permission is required for reaction messages to work correctly", true));
        if (!permissions.has("ADD_REACTIONS")) return this.channel.send(this.embedify(this.guild, "I don't have permissions to add reactions in this channel!\nThis permission is required for reaction messages to work correctly", true));
        if (!permissions.has("USE_EXTERNAL_EMOJIS")) return this.channel.send(this.embedify(this.guild, "I don't have permissions to use external emojis in this channel!\nThis permission is required for reaction messages to work correctly", true));

        /**
        * Send message
        */
        if (this.messageNoSend) return;
        this.message = await this.channel.send(playingMessageEmbed).catch((err) => {
            console.error(err);
            return null;
        });
        if (!this.message) return;

        if (this.messageNoSend) return this.delete();

        /**
        * Reaction options and collector
        */
        const reactionOptions = [this.appearance.playerEmojis.like.id, this.appearance.playerEmojis.shuffle.id, this.appearance.playerEmojis.previous_track.id, this.appearance.playerEmojis.play_or_pause.id, this.appearance.playerEmojis.next_track.id, this.appearance.playerEmojis.loop.id, this.appearance.playerEmojis.stop.id, this.appearance.playerEmojis.disconnect.id];
        const filter = (reaction, user) => user.id !== user.client.user.id;
        this.message.collector = this.message.createReactionCollector(filter, { dispose: true });
        this.message.collector.on("collect", async (reaction, user) => {
            const permissions = this.channel.permissionsFor(this.channel.client.user);
            if (!permissions.has("SEND_MESSAGES")) return;
            if (!permissions.has("EMBED_LINKS")) return this.channel.send(this.embedify(this.guild, "I don't have permissions to embed links in this channel!", true));
            if (!permissions.has("MANAGE_MESSAGES")) return this.channel.send(this.embedify(this.guild, "I don't have permissions to manage messages in this channel!\nThis permission is required for reaction messages to work correctly", true));

            await reaction.users.remove(user).catch(err => {
                if (err.message != 'Unknown Message') console.error(err);
            });

            switch (reaction.emoji.id) {
                case this.appearance.playerEmojis.like.id:
                    await this.fakeMessageCommand(reaction, user, "like");
                    break;
                case this.appearance.playerEmojis.shuffle.id:
                    await this.fakeMessageCommand(reaction, user, "shuffle");
                    break;
                case this.appearance.playerEmojis.previous_track.id:
                    await this.fakeMessageCommand(reaction, user, "previous");
                    break;
                case this.appearance.playerEmojis.play_or_pause.id:
                    await this.fakeMessageCommand(reaction, user, "play");
                    break;
                case this.appearance.playerEmojis.next_track.id:
                    await this.fakeMessageCommand(reaction, user, "next");
                    break;
                case this.appearance.playerEmojis.loop.id:
                    await this.fakeMessageCommand(reaction, user, "loop");
                    break;
                case this.appearance.playerEmojis.stop.id:
                    await this.fakeMessageCommand(reaction, user, "stop");
                    break;
                case this.appearance.playerEmojis.disconnect.id:
                    await this.fakeMessageCommand(reaction, user, "disconnect");
                    break;
            }
        });

        /**
        * Reaction emojis add
        */
        for (const option of reactionOptions) {
            if (this.message && !this.message.deleted) await this.message.react(option).catch((err) => {
                if (err.message === "Unknown Message") return null;
                else return console.error(err);
            });
            else return;
        }

        return this;
    }

    delete() {
        if (!this.message) return this.messageNoSend = true;

        if (this.message.collector) {
            this.message.collector.stop();
        }

        this.message.delete().catch((err) => {
            if (err.message === "Unknown Message") return null;
            else return console.error(err);
        });
        delete this.message;
    }

    async fakeMessageCommand(reaction, user, command) {
        const FakeMessage = {
            author: user,
            content: `<@${reaction.client.user.id}> ${command}`,
            client: reaction.client,
            channel: reaction.message.channel,
            guild: reaction.message.guild,
            member: reaction.message.guild.member(user),
            mentions: {
                users: new this.discord.Collection(),
                members: new this.discord.Collection()
            }
        }
        return await commandHandler.execute(FakeMessage, { testReactionPerms: true });
    }
}

