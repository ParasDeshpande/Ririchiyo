import owners from "../../config/owners.json";
import settings from "../../config/settings.json";
import appearance from "../../config/appearance.json";
import credentials from "../../config/credentials.json";
import * as discord from "discord.js";
import chalk, { Chalk } from 'chalk';

import { BaseCommand, CommandCTX } from './structures/BaseCommand';
import GlobalCTX from "./GlobalCTX";
import InternalPermissions, { InternalPermissionResolvable } from "../database/utils/InternalPermissions";
import { Player } from "6ec0bd7f/dist";
import GuildData from "../database/structures/Guild";
import GuildSettings from "../database/structures/GuildSettings";

export type Commands = discord.Collection<BaseCommand["name"], BaseCommand>;

export interface MessageParserCTX {
    prefix: string,
    commandsCollection: Commands,
    message: discord.Message,
    guildData: GuildData,
    guildSettings: GuildSettings
}

export class Cooldowns {
    static cooldowns = new discord.Collection<string, discord.Collection<string, number>>();

    static async check(command: BaseCommand, user: discord.User, channel: discord.TextChannel, message: discord.Message | null, add = true): Promise<boolean> {
        if (!this.cooldowns.has(command.name)) this.cooldowns.set(command.name, new discord.Collection<string, number>());

        const now = Date.now();
        const timestamps = this.cooldowns.get(command.name);
        const cooldownAmount = command.cooldown;

        if (timestamps?.has(user.id)) {
            const expirationTime = (timestamps.get(user.id) || 0) + cooldownAmount;
            if (now < expirationTime) {
                if (message && channel.permissionsFor(channel.client.user!)?.has('MANAGE_MESSAGES') && message.delete) await message.delete().catch((err: Error) => GlobalCTX.logger?.error(err.message));

                const timeLeft = (expirationTime - now) / 1000;
                await channel.send(Utils.embedifyString(channel.guild, `${user}, please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`, true))
                    .then(msg => {
                        msg.delete({ timeout: expirationTime - now }).catch((err: Error) => GlobalCTX.logger?.error(err.message))
                    });
                return true;
            }
        }

        if (add) {
            timestamps?.set(user.id, now);
            setTimeout(() => timestamps?.delete(user.id), cooldownAmount);
        }

        return false;
    }
}

export class MessageParser {
    static cooldowns = new discord.Collection<string, discord.Collection<string, number>>();
    static async parseCommand(ctx: MessageParserCTX): Promise<CommandCTX | null> {
        const recievedTimestamp = Date.now();
        const { prefix, commandsCollection, message } = ctx;

        if (typeof prefix !== 'string') throw new TypeError("'prefix' must be a string.");
        if (!(message instanceof discord.Message)) throw new TypeError("'message' must be a discord message.");
        if (!message.client.user) throw new TypeError("value of 'clientUser' is null.");
        if (!commandsCollection) throw new TypeError("value of 'commandsCollection' is null.");
        if (!message.guild) return null;

        const prefixes = [prefix, `<@${message.client.user.id}>`, `<@!${message.client.user.id}>`, message.client.user.id, message.client.user.username];
        const usedPrefix = prefixes.find(prefix => message.content.startsWith(prefix))

        if (!usedPrefix) return null;

        const args = message.content.slice(usedPrefix.length).trim().split(/\s+/);
        const commandName = args.shift();

        if (!commandName) return null;

        const command = commandsCollection.get(commandName) || commandsCollection.find((cmd) => cmd.aliases !== undefined && cmd.aliases.length > 0 && cmd.aliases.includes(commandName));
        if (!command) return null;

        const channel = message.channel as discord.TextChannel;
        const permissions = channel.permissionsFor(message.client.user) || new discord.Permissions(0);

        //Handle cooldown
        if (await Cooldowns.check(command, message.author, message.channel as unknown as discord.TextChannel, message)) return null;

        if (usedPrefix !== prefix) {
            message.mentions.users.delete(message.client.user.id);
            if (message.mentions.members) message.mentions.members.delete(message.client.user.id);
        }


        return { command, args, member: message.member as discord.GuildMember, channel, client: message.client, permissions, recievedTimestamp, guild: message.guild, guildData: ctx.guildData, guildSettings: ctx.guildSettings }
    }
}

export class Utils {
    public static readonly owners = owners;
    public static readonly settings = settings;
    public static readonly appearance = appearance;
    public static readonly credentials = credentials;
    public static readonly discord = discord;
    public static readonly emojisCache = new discord.Collection<string, discord.GuildEmoji>();

    /**
     * Get the displayed colour of the client in a guild.
     * @param guild [Required] A discord "Guild"
     * @param raw [false] Wether to return the raw color in the guild or default to the default colour in 'appearance.general.colour' if none was returned from the guild
     */
    public static getClientColour(guild: discord.Guild, raw: boolean = false): string {
        if (!(guild instanceof discord.Guild)) throw new TypeError("The provided value for 'guild' is not a discord 'Guild'");
        if (typeof raw !== 'boolean') throw new TypeError("The provided value for 'raw' is not a 'Boolean'");

        const clientMember = guild.members.resolve(guild.client.user!);
        if (!clientMember) throw new TypeError("Client is not a member of the guild.");

        const colour = clientMember.displayHexColor;
        return (colour === "#000000" || !colour) && !raw ? this.appearance.colours.general : colour;
    }

    /**
     * Convert any text to a simple embed with the text as it's description.
     * @param guild [Required] A discord "Guild"
     * @param text [Required] Any text to include in the embed description
     * @param isError [false] If the error colour should be used as embed colour from 'appearance.error.colour'
     * @param embedColour [optional] The colour of the embed
     */
    public static embedifyString(guild: discord.Guild, text: string, isError: boolean = false, embedColour?: string): discord.MessageEmbed {
        if (!(guild instanceof discord.Guild)) throw new TypeError("The provided value for 'guild' is not a discord 'Guild'");
        if (typeof text !== 'string') throw new TypeError("The provided value for 'text' is not a 'String'");
        if (typeof isError !== 'boolean') throw new TypeError("The provided value for 'isError' is not a 'Boolean'");
        if (typeof embedColour !== 'undefined' && typeof embedColour !== 'string') throw new TypeError("The provided value for 'embedColour' is not a 'String'");

        if (!embedColour && guild) embedColour = isError ? appearance.colours.error : this.getClientColour(guild);
        return new discord.MessageEmbed({ color: embedColour, description: text });
    }

    /**
     * Compare two arrays and get missing elements.
     * @param array The array in which to check elements.
     * @param needed The needed elements.
     */
    public static getMissingFromArray(array: any, needed: any): any[] | null {
        if (array && !Array.isArray(array)) array = [array];
        if (needed && !Array.isArray(needed)) needed = [needed];
        if (!array) return needed;
        if (!needed) return null;
        const mis = needed.filter((p: any) => !array.includes(p))
        return mis.length > 0 ? mis : null;
    }

    /**
     * Convert the first letter of a string to caps
     * @param string The string to change the first letter
     */
    public static firstLetterCaps(string: string): string {
        if (typeof string !== 'string') throw new TypeError("The provided value for 'string' is not a 'String'");
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    /**
     * Limit the length of a string to a specified value and optionally append it with some characters
     * @param string The string to limit length of
     * @param opts Options
     */
    public static limitLength(text: string, { maxLength = 2000, splitAt = '\n', prepend = '', append = '...' }: limitLengthOpts): string {
        if (typeof text !== 'string') throw new TypeError("The provided value for 'text' is not a 'String'");
        if (typeof maxLength !== 'number') throw new TypeError("The provided value for 'maxLength' is not a 'Number'");
        return discord.Util.splitMessage(text, { maxLength, char: splitAt, prepend, append })[0];
    };

    /**
     * Get the mean of array elements
     * @param array The array containing numbers
     */
    public static getArrayAverage(array: number[]): number {
        return array.reduce((a, b) => a + b) / array.length;
    }

    /**
     * Multiply a string by a number of times (like python "x"*n)
     * @param array The array containing numbers
     */
    public static multiplyString(times: number, string: string): string {
        return Array(times + 1).join(string);
    };


    public static async getEmoji(id: string) {
        const emojiConfig = this.appearance.emojis as unknown as EmojisConfig

        if (!/^\d+$/.test(id)) id = emojiConfig[id];
        if (!id) return null;

        const cache = this.emojisCache.get(id);
        if (cache) return cache;

        const emoji = GlobalCTX.client.emojis.cache.get(id) || await broadcastAndFindEmoji(id);
        if (!emoji) return null;

        this.emojisCache.set(id, emoji);
        return emoji;
    }
}

export class CustomError {
    // Class props //
    code?: number;
    flag?: string;
    missingPerms?: string[]
    isPermsError = false;
    readonly isSuccess = false;
    readonly isError = true;
    // Class props //
    constructor(code: number, flag: string, missingPerms?: string[]) {
        this.code = code;
        this.flag = flag;
        if (missingPerms && missingPerms.length > 0) {
            this.isPermsError = true;
            this.missingPerms = missingPerms;
        }
    }
}

export class Success {
    // Class props //
    code: number;
    flag: string;
    authorVoiceChannel?: discord.VoiceChannel;
    player?: Player;
    readonly isSuccess = true;
    readonly isError = false;
    // Class props //
    constructor(code: number, flag: string, authorVoiceChannel?: discord.VoiceChannel, player?: Player) {
        this.code = code;
        this.flag = flag;
        this.authorVoiceChannel = authorVoiceChannel;
        this.player = player;
    }
}

export class MusicUtil {
    public static canModifyPlayer(options: CanModifyPlayerOptions): Success | CustomError {
        const player = GlobalCTX.lavalinkClient.players.get(options.guild.id);
        const { channel: botVoiceChannel } = options.guild.me?.voice || {};
        const { channel: authorVoiceChannel } = options.member.voice;

        /** If the player is required to run the command and player does not exist */
        if (options.playerRequired && !player) return new CustomError(1, "NO_PLAYER");

        if (player && botVoiceChannel) {
            /** If the author is not in the same voice channel where the player is playing */
            if (!authorVoiceChannel || authorVoiceChannel.id !== player.voiceChannel?.id) {
                /** If the author is not in the same voice channel while requesting to spawn the player */
                if (options.isSpawnAttempt) return new CustomError(2, "PLAYER_ALREADY_EXISTS");
                /** If the author is not in the same voice channel */
                return new CustomError(3, "NO_AUTHOR_CHANNEL_AND_PLAYER_EXISTS");
            }
            /** If the author is in the same voice channel as the player */
            else {
                /** If the author is trying to spawn the player while the player is already in his voice channel and connected */
                if (options.isSpawnAttempt) return new CustomError(4, "PLAYER_ALREADY_EXISTS_SAME_CHANNEL");

                /** If this is a normal command that the player has requested while all conditions are as they should be */
                const missingPerms = options.memberPermissions.missing(options.requiredPermissions); //The permissions required which are missing, if not will be an empty array
                /** If the author has permissions */
                if (missingPerms.length === 0) return new Success(1, "HAS_PERMS", authorVoiceChannel, player);
                /** If the author does not have permissions */
                else {
                    const vcMemberAmt = authorVoiceChannel.members.filter(member => !member.user.bot).size; //Amount of members in the author's voice channel
                    /** If channel members are more than the allowed amount for free permissions */
                    if (vcMemberAmt > options.vcMemberAmtForAllPerms) return new CustomError(5, "NO_PERMS_AND_NOT_ALONE", missingPerms);
                    /** If the author has permissions due to the less amount of members in channel */
                    return new Success(2, "NO_PERMS_AND_ALONE", authorVoiceChannel, player);
                }
            }
        }
        /** If the player does not exist and is not required */
        else {
            const missingPerms = options.memberPermissions.missing(options.requiredPermissions); //The permissions required which are missing, if not will be an empty array
            /** If the author has the permissions */
            if (missingPerms.length === 0) {
                /** If this is a spawn attempt */
                if (options.isSpawnAttempt) {
                    /* If the author is not in a voice channel but is trying to summon the player */
                    if (!authorVoiceChannel) return new CustomError(6, "NO_VOICE_CHANNEL");
                    return new Success(3, "HAS_PERMS_TO_SPAWN_PLAYER", authorVoiceChannel);
                }
                /** If the player is not required and the author has permissions */
                return new Success(3, "HAS_PERMS_AND_NO_PLAYER");
            }
            /** If the author does not have permissions */
            else {
                /** If the author is trying to summon the player and does not have permissions */
                if (options.isSpawnAttempt) {
                    /* If the author is not in a voice channel but is trying to summon the player */
                    if (!authorVoiceChannel) return new CustomError(6, "NO_VOICE_CHANNEL");
                    /* If the author is not in a voice channel and is trying to summon the player */
                    else {
                        const vcMemberAmt = authorVoiceChannel.members.filter(member => !member.user.bot).size; //Amount of members in the author's voice channel
                        if (vcMemberAmt > options.vcMemberAmtForAllPerms) return new CustomError(7, "NO_PERMS_TO_SPAWN_PLAYER");
                        return new Success(4, "NO_PERMS_AND_ALONE", authorVoiceChannel);
                    }
                }
                /** If the author is trying to access a command but the player is not available */
                else return new CustomError(1, "NO_PLAYER");
            }
        }
    }
}
export interface CanModifyPlayerOptions {
    guild: discord.Guild,
    member: discord.GuildMember,
    memberPermissions: InternalPermissions,
    channel: discord.TextChannel,
    playerRequired: boolean,
    requiredPermissions: InternalPermissionResolvable,
    sendError: boolean,
    isSpawnAttempt: boolean,
    vcMemberAmtForAllPerms: number
}

export type CanModifyPlayerResult = {
    success?: {
        message: string,
        code: number
    },
    error?: {
        message: string,
        code: number
    },
    authorVoiceChannel?: discord.VoiceChannel,
    player?: Player
};

export interface EmojisConfig {
    [key: string]: string
}

interface limitLengthOpts {
    maxLength: number;
    splitAt: string;
    prepend: string;
    append: string;
}

export class Logger {
    // Class props //
    initiated: boolean;
    shardID?: number;
    chalk: Chalk;
    // Class props //

    constructor() {
        this.chalk = chalk;
        this.initiated = false;
    }

    init(shardID?: number): this {
        this.shardID = shardID;
        this.initiated = true;
        return this
    }

    get identifier() {
        if (!this.initiated) throw new Error("Logger is not initiated.");

        return `${chalk.blueBright(`[${typeof this.shardID !== 'undefined' ? `SHARD-${this.shardID}` : "MANAGER"}]`)} ${chalk.yellowBright(`=> `)}`
    }

    log(message: string): undefined {
        if (!this.initiated) throw new Error("Logger is not initiated.");
        if (typeof message !== 'string') throw new TypeError("Message to log must be a string.");

        console.log(this.identifier + chalk.green(message));
        return;
    }

    info(message: string): undefined {
        if (!this.initiated) throw new Error("Logger is not initiated.");
        if (typeof message !== 'string') throw new TypeError("Message to log must be a string.");

        console.log(this.identifier + chalk.cyan(message));
        return;
    }

    error(message: string): undefined {
        if (!this.initiated) throw new Error("Logger is not initiated.");
        if (typeof message !== 'string') throw new TypeError("Message to log must be a string.");

        console.trace(Utils.multiplyString(7, "\b") + this.identifier + chalk.redBright(message));
        return;
    }

    warn(message: string): undefined {
        if (!this.initiated) throw new Error("Logger is not initiated.");
        if (typeof message !== 'string') throw new TypeError("Message to log must be a string.");

        console.trace(Utils.multiplyString(7, "\b") + this.identifier + chalk.yellowBright(message));
        return;
    }
}

/**
 * Get an emoji on the client and process it for sending through broadcast eval
 * @param client The client to get the emoji for
 * @param id the string id of the emoji
 */
export const getToSendEmoji = (client: discord.Client, id: string) => {
    const temp: discord.GuildEmoji | undefined = client.emojis.cache.get(id);
    if (!temp) return null;

    const emoji = Object.assign({}, temp);
    // @ts-expect-error
    if (emoji.guild) emoji.guild = emoji.guild.id;
    // @ts-expect-error
    emoji.require_colons = emoji.requiresColons;

    return emoji;
}

/**
 * Use broadcast eval to find emoji on other shards
 * @param client The client to get the emoji for
 * @param id the string id of the emoji
 */
export const broadcastAndFindEmoji = async (id: string) => {
    const res = await GlobalCTX.client.shard?.broadcastEval(`(${getToSendEmoji}).call(this, this, '${id}')`).catch((err: Error) => GlobalCTX.logger?.error(err.message));
    if (!res) return null;

    const emojiData = res.find((emoji: any) => emoji);
    if (!emojiData) return null;

    // @ts-expect-error because api is private
    const guildData = await client.api.guilds(emojiData.guild).get();
    const guild = new discord.Guild(GlobalCTX.client, guildData);

    return new discord.GuildEmoji(GlobalCTX.client, emojiData, guild);
}

export default Utils;