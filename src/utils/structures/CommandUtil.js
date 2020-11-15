const owners = require('../../../config/owners');
const appearance = require('../../../config/appearance.json');
const credentials = require('../../../config/credentials.json');
const settings = require('../../../config/settings.json');
const discord = require("discord.js");
const { MessageEmbed } = require('discord.js');

module.exports = class CommandUtil {
    constructor() {
        this.owners = owners;
        this.appearance = appearance;
        this.credentials = credentials;
        this.settings = settings;
        this.discord = discord;
    }
    getClientColour(guild, raw) {
        const clientMember = guild.member(guild.client.user);
        let colour = clientMember.displayHexColor;
        return colour == '#000000' && !raw ? this.appearance.general.colour : colour;
    }
    embedify(guild, message, error, colour) {
        if (!colour) colour = error ? appearance.error.colour : this.getClientColour(guild);
        return new MessageEmbed().setColor(colour).setDescription(message);
    }
    hasAll(has, req) {
        if (!has) return [];
        if (!req) return false;
        if (!Array.isArray(req)) req = [req];
        if (!Array.isArray(has)) has = [has];
        const mis = req.filter(p => !has.includes(p))
        return mis.length > 0 ? mis : null;
    }
    firstLetterCaps = (string) => string.charAt(0).toUpperCase() + string.slice(1);
    limitLength(string, limit, useWordBoundary) {
        if (string.length <= limit) { return string; }
        const subString = string.substr(0, limit - 1); // the original check
        return (useWordBoundary
            ? subString.substr(0, subString.lastIndexOf(" "))
            : subString) + "...";
    };
    getArrayAverage = (array) => array.reduce((a, b) => a + b) / array.length;
    multiplyString = (times, string) => Array(times + 1).join(string);
}