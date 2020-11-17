const MusicUtil = require('./musicUtil');
const musicUtil = new MusicUtil;

module.exports = class PlayingMessage {

    send = async function (message, player) {
        const description = [`=> ${musicUtil.discord.escapeMarkdown(player.queue.current.title)}`].concat(await player.queue.map((track, index) => `${index + 1}. ${musicUtil.discord.escapeMarkdown(track.title)}`));

        const splitDescription = musicUtil.discord.splitMessage(description, {
            maxLength: 2048,
            char: "\n",
            prepend: "",
            append: ""
        });

        const pagesArray = [];
        let pageNumber = 0;

        for (const m of splitDescription) {
            const embed = new musicUtil.discord.MessageEmbed()
                .setTitle(`🎶 Player queue! ${splitDescription.length < 2 ? `` : `Page(${++pageNumber} of ${splitDescription.length})`}`)
                .setColor(musicUtil.getClientColour(message.guild))
                .setDescription(m);
            pagesArray.push(embed);
        }

        let selectedPage = 0;

        const queueMessage = await message.channel.send(pagesArray[selectedPage]);

        if (pagesArray.length > 2) {
            const filter = (reaction, user) => user.id !== player.client.user.id;
            queueMessage.collector = queueMessage.createReactionCollector(filter, { time: 45000 });

            const reactionOptions = [musicUtil.appearance.playerEmojis.arrow_left.id, musicUtil.appearance.playerEmojis.arrow_right.id]

            for (const option of reactionOptions) {
                const queueMessageTemp = queueMessage;
                if (queueMessageTemp && !queueMessageTemp.deleted) await queueMessageTemp.react(option).catch(err => { if (err.message != 'Unknown Message') console.log(err) });
                else return;
            }

            queueMessage.collector.on("collect", async (reaction, user) => {
                const permissions = reaction.message.channel.permissionsFor(reaction.client.user).toArray();
                if (!permissions.includes("SEND_MESSAGES")) return;
                if (!permissions.includes("MANAGE_MESSAGES")) return reaction.message.channel.send(musicUtil.embedify(reaction.message.guild, "I don't have permissions to manage messages in musicUtil channel!\nmusicUtil permission is required for reaction messages to work correctly", true));
                if (!permissions.includes("USE_EXTERNAL_EMOJIS")) return reaction.message.channel.send(musicUtil.embedify(reaction.message.guild, "I don't have permissions to use external emojis in musicUtil channel!\nmusicUtil permission is required for reaction messages to work correctly", true));
                if (!permissions.includes("EMBED_LINKS")) return reaction.message.channel.send("I don't have permissions to embed links in musicUtil channel!");

                await reaction.users.remove(user).catch(err => { if (err.message != 'Unknown Message') console.log(err) });
                await queueMessage.collector.resetTimer();

                switch (reaction.emoji.id) {
                    case musicUtil.appearance.playerEmojis.arrow_left.id:
                        if (queueMessage && !queueMessage.deleted)
                            if (selectedPage - 1 < 0) return;
                            else {
                                --selectedPage;
                                await queueMessage.edit(pagesArray[selectedPage]).catch(err => { if (err.message != 'Unknown Message') console.log(err) });;
                            }
                        break;
                    case musicUtil.appearance.playerEmojis.arrow_right.id:
                        if (queueMessage && !queueMessage.deleted)
                            if (selectedPage + 1 > pagesArray.length - 1) return;
                            else {
                                ++selectedPage;
                                await queueMessage.edit(pagesArray[selectedPage]).catch(err => { if (err.message != 'Unknown Message') console.log(err) });;
                            }
                        break;
                }
            }).on("end", () => {
                queueMessage.delete().catch(console.error);
            });
        }
    }
}