const BaseCommand = require('../../utils/structures/BaseCommand');
const MusicUtil = require("../../lavalinkClient/musicUtil");
const musicUtil = new MusicUtil;
const allVal = ["all", "a"]
const fuse = require('fuse.js');

const searchOptions = {
    isCaseSensitive: false,
    keys: [
        {
            name: 'title',
            weight: 2
        },
        'uri',
    ]
}

module.exports = class RemoveCommand extends BaseCommand {
    constructor() {
        super({
            name: "remove",
            aliases: ["rem"],
            description: "Remove a song from the queue",
            category: "music",
        })
    }

    async run({ message, args, arg }) {
        if (!message.channel.clientPermissions.has("EMBED_LINKS")) return message.channel.send("I don't have permissions to send message embeds in this channel");

        const result = await musicUtil.canModifyPlayer({ message, requiredPerms: "MANAGE_QUEUE", errorEmbed: true });
        if (result.error) return;

        if (result.player.queue.size < 1) return await message.channel.send(this.embedify(message.guild, `The player queue is currently empty!`, true));

        let start = null, end;

        if (!args) return await message.channel.send(this.embedify(message.guild, `Please provide a position or name of the song to remove from the queue!`, true));

        if (args && args[0] && !isNaN(args[0]) && (!args[1] || !isNaN(args[1]))) {
            start = parseInt(args[0]);
            if (args[1] && !isNaN(args[1])) end = parseInt(args[1]);
        }

        if (start == null) {
            const queueTracksArray = result.player.queue;
            const searcher = new fuse(queueTracksArray, searchOptions);
            const searchResult = await searcher.search(arg);
            if (!searchResult[0]) return await message.channel.send(this.embedify(message.guild, `Could not find a song in the queue with the title matching your query!`, true));

            const removedTrack = await result.player.queue.remove(searchResult[0].refIndex);
            const embedified = this.embedify(message.guild, `**[${this.discord.escapeMarkdown(removedTrack[0].title)}](${removedTrack[0].uri})**\nRemoved from the queue by - ${message.author}`);
            await message.channel.send(embedified);
            if (message.channel.id != result.player.options.textChannelOBJ.id) await result.player.options.textChannelOBJ.send(embedified);
            return removedTrack;
        }

        if (start - 1 < 0 || start > result.player.queue.size) return await message.channel.send(this.embedify(message.guild, "The position given does not exist in the queue!", true));
        if (end - 1 < 0 || end > result.player.queue.size) return await message.channel.send(this.embedify(message.guild, "The end position given does not exist in the queue!", true));

        if (!end) {
            const removedTrack = await result.player.queue.remove(start - 1);
            const embedified = this.embedify(message.guild, `**[${this.discord.escapeMarkdown(removedTrack[0].title)}](${removedTrack[0].uri})**\nRemoved from the queue by - ${message.author}`);
            await message.channel.send(embedified);
            if (message.channel.id != result.player.options.textChannelOBJ.id) await result.player.options.textChannelOBJ.send(embedified);
            return removedTrack;
        }
        else {
            const removedTrack = await result.player.queue.remove(start - 1, end - 1);
            const embedified = this.embedify(message.guild, `${message.author} Removed ${end - start} track${end - start > 1 ? 's' : ''} from the player queue.`);
            await message.channel.send(embedified);
            if (message.channel.id != result.player.options.textChannelOBJ.id) await result.player.options.textChannelOBJ.send(embedified);
            return removedTrack;
        }
    }
}