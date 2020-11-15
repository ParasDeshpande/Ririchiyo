const path = require('path');
const fs = require('fs');
const BaseCommand = require('./structures/BaseCommand');
const BaseEvent = require('./structures/BaseEvent');
const Discord = require('discord.js');
const util = require('./util');
const { loadClient } = require('../lavalinkClient/client');


async function loadCommands(client, dir = "", opts) {
    const defaultOpts = { excl: { comms: [], cats: [] } };
    const options = util.deepMerge(defaultOpts, opts);
    const filePath = path.join(path.resolve(".", dir)); //The path for the command folder
    const directory = fs.readdirSync(filePath, { withFileTypes: true }) //This may be a file or a folder
    for (const index in directory) {
        const file = directory[index];
        if (file.isDirectory()) this.loadCommands(client, path.join(dir, file.name), options); //If it is a folder then load commands inside it
        if (file.name.endsWith('.js')) {
            const Command = require(path.join(filePath, file.name))
            if (Command.prototype instanceof BaseCommand) {
                const cmd = new Command();
                if (options.excl.comms.includes(cmd.name) || options.excl.cats.includes(cmd.category)) continue;
                client.commands ? client.commands.set(cmd.name, cmd) : client.commands = new Discord.Collection([[cmd.name, cmd]]);
                console.log("Loaded Command: " + cmd.name);
            }
        }
    }
}

async function loadEvents(client, dir = "", opts) {
    const defaultOpts = { excl: { events: [], cats: [] } };
    const options = util.deepMerge(defaultOpts, opts);
    const filePath = path.join(path.resolve(".", dir)); //The path for the command folder
    const directory = fs.readdirSync(filePath, { withFileTypes: true }) //This may be a file or a folder
    for (const index in directory) {
        const file = directory[index];
        if (file.isDirectory()) this.loadEvents(client, path.join(dir, file.name), options); //If it is a folder then load commands inside it
        if (file.name.endsWith('.js')) {
            const Event = require(path.join(filePath, file.name))
            if (Event.prototype instanceof BaseEvent) {
                const evt = new Event();
                if (options.excl.events.includes(evt.name) || options.excl.cats.includes(evt.category)) continue;
                client.on(evt.name, evt.run.bind(evt, client));
                console.log("Loaded Event: " + evt.name);
            }
        }
    }
}

module.exports = { loadCommands, loadEvents, loadLavalink: loadClient }