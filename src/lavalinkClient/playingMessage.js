const MusicUtil = require('./musicUtil');
const CommandHandler = require('../utils/commandHandler/commandHandler');
const commandHandler = new CommandHandler;

module.exports = class PlayingMessage extends MusicUtil {
    constructor() {
        super();
    }
    update = async function ({ player, track }) {
        const playingMessageEmbed = new this.discord.MessageEmbed()
            .setTitle("🎶 Started playing!")
            .setDescription(`**[${this.discord.escapeMarkdown(track.title)}](${track.uri})**`)
            .setColor(this.getClientColour(player.guild))
            .setImage(await track.displayThumbnail("mqdefault"))
            .setFooter(`Added by- ${track.requester.username}`);

        if (player.playingMessage && !player.playingMessage.deleted) {
            await player.playingMessage.delete().catch(err => { if (err.message != 'Unknown Message') console.log(err) });
            player.playingMessage = await player.textChannel.send(playingMessageEmbed).catch(err => { if (err.message != 'Unknown Message') console.log(err) });
        }
        else player.playingMessage = await player.textChannel.send(playingMessageEmbed).catch(err => { if (err.message != 'Unknown Message') console.log(err) });

        const permissions = player.playingMessage.channel.permissionsFor(player.playingMessage.client.user);
        if (!permissions.has("SEND_MESSAGES")) return;
        else if (!permissions.has("MANAGE_MESSAGES")) return player.playingMessage.channel.send(this.embedify(player.playingMessage.guild, "I don't have permissions to manage messages in this channel!\nThis permission is required for reaction messages to work correctly", true));
        else if (!permissions.has("USE_EXTERNAL_EMOJIS")) return player.playingMessage.channel.send(this.embedify(player.playingMessage.guild, "I don't have permissions to use external emojis in this channel!\nThis permission is required for reaction messages to work correctly", true));
        else if (!permissions.has("EMBED_LINKS")) return player.playingMessage.channel.send("I don't have permissions to embed links in this channel!");
        else {
            /**
             * Reaction options
             */
            const reactionOptions = [this.appearance.playerEmojis.like.id, this.appearance.playerEmojis.shuffle.id, this.appearance.playerEmojis.previous_track.id, this.appearance.playerEmojis.play_or_pause.id, this.appearance.playerEmojis.next_track.id, this.appearance.playerEmojis.loop.id, this.appearance.playerEmojis.stop.id, this.appearance.playerEmojis.disconnect.id];

            const filter = (reaction, user) => user.id !== player.client.user.id;
            player.playingMessage.collector = player.playingMessage.createReactionCollector(filter);

            const playingMessageTemp = player.playingMessage;
            for (const option of reactionOptions) {
                if (playingMessageTemp && !playingMessageTemp.deleted) await playingMessageTemp.react(option).catch(err => { if (err.message != 'Unknown Message') console.log(err) });
                else return;
            }

            player.playingMessage.collector.on("collect", async (reaction, user) => {
                const permissions = reaction.message.channel.permissionsFor(reaction.client.user);
                if (!permissions.has("SEND_MESSAGES")) return;
                else if (!permissions.has("MANAGE_MESSAGES")) return player.playingMessage.channel.send(this.embedify(player.playingMessage.guild, "I don't have permissions to manage messages in this channel!\nThis permission is required for reaction messages to work correctly", true));
                else if (!permissions.has("USE_EXTERNAL_EMOJIS")) return player.playingMessage.channel.send(this.embedify(player.playingMessage.guild, "I don't have permissions to use external emojis in this channel!\nThis permission is required for reaction messages to work correctly", true));
                else if (!permissions.has("EMBED_LINKS")) return player.playingMessage.channel.send("I don't have permissions to embed links in this channel!");
                let result;
                switch (reaction.emoji.id) {
                    case this.appearance.playerEmojis.like.id:
                        result = await this.fakeMessageCommand(reaction, user, "like");
                        reaction.users.remove(user).catch(err => { if (err.message != 'Unknown Message') console.log(err) });
                        break;
                    case this.appearance.playerEmojis.shuffle.id:
                        result = await this.fakeMessageCommand(reaction, user, "shuffle");
                        reaction.users.remove(user).catch(err => { if (err.message != 'Unknown Message') console.log(err) });
                        break;
                    case this.appearance.playerEmojis.previous_track.id:
                        result = await this.fakeMessageCommand(reaction, user, "previous");
                        reaction.users.remove(user).catch(err => { if (err.message != 'Unknown Message') console.log(err) });
                        break;
                    case this.appearance.playerEmojis.play_or_pause.id:
                        result = await this.fakeMessageCommand(reaction, user, "play");
                        reaction.users.remove(user).catch(err => { if (err.message != 'Unknown Message') console.log(err) });
                        break;
                    case this.appearance.playerEmojis.next_track.id:
                        result = await this.fakeMessageCommand(reaction, user, "next");
                        reaction.users.remove(user).catch(err => { if (err.message != 'Unknown Message') console.log(err) });
                        break;
                    case this.appearance.playerEmojis.loop.id:
                        result = await this.fakeMessageCommand(reaction, user, "loop");
                        reaction.users.remove(user).catch(err => { if (err.message != 'Unknown Message') console.log(err) });
                        break;
                    case this.appearance.playerEmojis.stop.id:
                        result = await this.fakeMessageCommand(reaction, user, "stop");
                        reaction.users.remove(user).catch(err => { if (err.message != 'Unknown Message') console.log(err) });
                        break;
                    case this.appearance.playerEmojis.disconnect.id:
                        result = await this.fakeMessageCommand(reaction, user, "disconnect");
                        reaction.users.remove(user).catch(err => { if (err.message != 'Unknown Message') console.log(err) });
                        break;
                }
            });
        }
    }

    fakeMessageCommand = async function (reaction, user, command) {
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