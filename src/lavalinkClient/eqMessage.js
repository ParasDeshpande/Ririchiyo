const appearance = require("../../config/appearance.json");
const CommandUtil = require("../utils/structures/CommandUtil");
const commandUtil = new CommandUtil;

module.exports = async function sendEqMessage(message, viewOnly, modifyDB, guildData) {

    let cursor = 0;
    const cursorLeftLimit = 1
    const cursorRightLimit = 15
    const eqHighestLimit = 1;
    const eqLowestLimit = -0.3;
    const roundingAccuracy = 1;

    const storedBands = new StoredBands(message, guildData)

    const EQMessage = await message.channel.send(convertBandsToGraph(storedBands.bands) + (viewOnly ? `\n[View Only]` : `\n[It may take up to 10 seconds for your changes to take effect]`), { code: true });
    if (viewOnly) EQMessage.delete({ timeout: 45000 })
    else {
        const permissions = message.channel.permissionsFor(message.client.user).toArray();
        if (!permissions.includes("SEND_MESSAGES")) return;
        if (!permissions.includes("MANAGE_MESSAGES")) return message.channel.send(commandUtil.embedify(message.guild, "I don't have permissions to manage messages in this channel!\nThis permission is required for reaction messages to work correctly", true));
        if (!permissions.includes("USE_EXTERNAL_EMOJIS")) return message.channel.send(commandUtil.embedify(message.guild, "I don't have permissions to use external emojis in this channel!\nThis permission is required for reaction messages to work correctly", true));
        if (!permissions.includes("EMBED_LINKS")) return message.channel.send("I don't have permissions to embed links in this channel!");
        const filter = (reaction, user) => user.id === message.author.id;
        EQMessage.collector = EQMessage.createReactionCollector(filter, { time: 45000 });

        const reactionOptions = [appearance.playerEmojis.arrow_left.id, appearance.playerEmojis.arrow_up.id, appearance.playerEmojis.arrow_down.id, appearance.playerEmojis.arrow_right.id];

        for (const option of reactionOptions) {
            if (!EQMessage.deleted) await EQMessage.react(option).catch(err => { if (err.message != 'Unknown Message') console.log(err) });
            else break;
        }

        EQMessage.collector.on("collect", async (reaction, user) => {
            const permissions = reaction.message.channel.permissionsFor(reaction.client.user).toArray();
            if (!permissions.includes("SEND_MESSAGES")) return;
            if (!permissions.includes("MANAGE_MESSAGES")) return reaction.message.channel.send(commandUtil.embedify(reaction.message.guild, "I don't have permissions to manage messages in this channel!\nThis permission is required for reaction messages to work correctly", true));
            if (!permissions.includes("USE_EXTERNAL_EMOJIS")) return reaction.message.channel.send(commandUtil.embedify(reaction.message.guild, "I don't have permissions to use external emojis in this channel!\nThis permission is required for reaction messages to work correctly", true));
            if (!permissions.includes("EMBED_LINKS")) return reaction.message.channel.send("I don't have permissions to embed links in this channel!");
            await reaction.users.remove(user).catch(err => { if (err.message != 'Unknown Message') console.log(err) });
            await EQMessage.collector.resetTimer();
            switch (reaction.emoji.id) {
                case appearance.playerEmojis.arrow_left.id:
                    if (cursor - 1 >= cursorLeftLimit) cursor -= 1;
                    await EQMessage.edit(convertBandsToGraph(storedBands.bands, cursor), { code: true });
                    break;
                case appearance.playerEmojis.arrow_up.id:
                    if (cursor > 0) {
                        const currentBandGain = parseFloat(parseFloat(storedBands.bands[cursor - 1]).toFixed(roundingAccuracy));
                        const changedBandGain = parseFloat((currentBandGain + 0.1).toFixed(roundingAccuracy));
                        if (changedBandGain <= eqHighestLimit) {
                            if (message.guild.player) await message.guild.player.setEQ([{ band: cursor - 1, gain: changedBandGain }]);
                            if (modifyDB) await await guildData.settings.music.eq.setEQ([{ band: cursor - 1, gain: changedBandGain }]);

                            await EQMessage.edit(convertBandsToGraph(storedBands.bands, cursor), { code: true });
                        }
                    }
                    break;
                case appearance.playerEmojis.arrow_down.id:
                    if (cursor > 0) {
                        const currentBandGain = parseFloat(parseFloat(storedBands.bands[cursor - 1]).toFixed(roundingAccuracy));
                        const changedBandGain = parseFloat((currentBandGain - 0.1).toFixed(roundingAccuracy))
                        if (changedBandGain >= eqLowestLimit) {
                            if (message.guild.player) await message.guild.player.setEQ([{ band: cursor - 1, gain: changedBandGain }])
                            if (modifyDB) await guildData.settings.music.eq.setEQ([{ band: cursor - 1, gain: changedBandGain }]);

                            await EQMessage.edit(convertBandsToGraph(storedBands.bands, cursor), { code: true });
                        }
                    }
                    break;
                case appearance.playerEmojis.arrow_right.id:
                    if (cursor + 1 <= cursorRightLimit) cursor += 1;
                    await EQMessage.edit(convertBandsToGraph(storedBands.bands, cursor), { code: true });
                    break;
            }
        }).on("end", () => {
            EQMessage.delete().catch(console.error);
        });
    }
}

function convertBandsToGraph(bands, cursor = 0) {
    const bandsArray = ["25", "40", "63", "100", "160", "250", "400", "630", "1K", "1.6K", "2.5K", "4K", "6.3K", "10K", "16K"];
    const gainLevels = ["- 0.25", "- 0.20", "- 0.10", "0.00", "+ 0.10", "+ 0.20", "+ 0.30", "+ 0.40", "+ 0.50", "+ 0.60", "+ 0.70", "+ 0.80", "+ 0.90", "+ 1.00"];
    let bars = [];
    bands.forEach((gain, index) => {
        let value;
        if (gain >= 1.00) value = 14;
        else if (gain >= 0.90) value = 13;
        else if (gain >= 0.80) value = 12;
        else if (gain >= 0.70) value = 11;
        else if (gain >= 0.60) value = 10;
        else if (gain >= 0.50) value = 9;
        else if (gain >= 0.40) value = 8;
        else if (gain >= 0.30) value = 7;
        else if (gain >= 0.20) value = 6;
        else if (gain >= 0.10) value = 5;
        else if (gain >= 0.00) value = 4;
        else if (gain >= -0.10) value = 3;
        else if (gain >= -0.20) value = 2;
        else if (gain >= -0.30) value = 1;
        bars.push({ text: bandsArray[index], fill: value })
    })
    return makeGraph(gainLevels, 4, bars, " |", cursor)
}

/**
 * 
 * @param {*} barHeight The height of the bar 
 * @param {*} barWidth The width of the bar DEFAULT = 1
 * @param {*} fillHeight The height up to which to fill DEFAULT = 0
 * @param {*} barText The text displayed below the bar
 * @param {*} barFillCharacter The character for a filled space in the bar DEFAULT = "▄"
 * @param {*} barEmptyCharacter The character for an empty space in the bar DEFAULT = " "
 */
function makeVerticalBar(addCursorLine, addCursor, barHeight = fillHeight, barWidth = 1, fillHeight = 0, barText = "", barFillCharacter = "▄", barEmptyCharacter = " ", cursor = "^") {
    let elements = [];
    for (let i = 1; i <= barHeight; i++) elements.push(i <= barHeight - fillHeight ? multiplyString(barWidth, barEmptyCharacter) : multiplyString(barWidth, barFillCharacter));
    elements.push(barText + multiplyString(barWidth - barText.length, " "));
    if (addCursor != 0 || addCursorLine) elements.push(multiplyString(barText.length, `${addCursor ? cursor : ` `}`) + multiplyString(barWidth - barText.length, " "));// bottom line
    return elements;
}

/**
 * @param {*} labels Array of label texts
 * @param {*} separator Separator between the collumn and graph
 * @param {*} width Width of the label collumn
 */
function makeFirstBarWithLabels(addCursorLine, labels, separator, width) {
    const reversedLabels = labels.reverse();
    const maxLabelLength = Math.max(...reversedLabels.map(item => item.length));
    width = width && maxLabelLength <= width ? width : maxLabelLength;
    let elements = [];
    for (let i = 0; i < reversedLabels.length; i++) elements.push(multiplyString(width - reversedLabels[i].length, " ") + `${reversedLabels[i]}${separator ? separator : ""}`);
    elements.push(multiplyString(width + (separator ? separator.length : 0), " "));
    if (addCursorLine) elements.push(multiplyString(width + (separator ? separator.length : 0), " "));//cursor line
    return elements;
}

/**
 * 
 * @param {*} labels Array of label texts
 * @param {*} barWidth The width of each bar
 * @param {*} bars An array of bar objects [{ text: "a", fill: 2 }, { text: "b", fill: 3 }]
 */
function makeGraph(labels, barWidth, bars, separator, cursor) {
    let multiDimensionalArray = [];
    const labelsArray = makeFirstBarWithLabels(cursor === 0 ? false : true, labels, separator);
    labelsArray.forEach((label, index) => {
        if (!multiDimensionalArray[index]) multiDimensionalArray[index] = [];
        multiDimensionalArray[index].push(label);
    })
    bars.forEach((bar, index) => {
        const renderedBar = makeVerticalBar(cursor === 0 ? false : true, index == cursor - 1 ? cursor : false, labels.length, barWidth, bar.fill, bar.text)
        renderedBar.forEach((value, index) => {
            if (!multiDimensionalArray[index]) multiDimensionalArray[index] = [];
            multiDimensionalArray[index].push(value)
        })
    })
    //return multiDimensionalArray
    let rows = []
    multiDimensionalArray.forEach(array => rows.push(array.join(" ")))
    return rows.join("\n");
}

/**
 * 
 * @param {*} times Number of times the string should be multlipied
 * @param {*} string The string to be multlipied
 */
function multiplyString(times, string) {
    return array = Array(times + 1).join(string);
};

class StoredBands {
    constructor(message, guildData) { this.message = message, this.guildData = guildData }
    set bands(bands) { }
    get bands() {
        return this.message.guild.player ? this.message.guild.player.bands : Object.values(this.guildData.settings.music.eq.bands);
    }
}