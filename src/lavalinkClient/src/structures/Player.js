"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const Utils_1 = require("./Utils");
class Player {
    /**
     * Creates a new player, returns one if it already exists.
     * @param options
     */
    constructor(options) {
        var _a;
        this.options = options;
        /** The Queue for the Player. */
        this.queue = new (Utils_1.Structure.get("Queue"))();
        /** The Previous Tracks for the Player. */
        this.previousTracks = [];
        /** Whether the queue repeats the track. */
        this.trackRepeat = false;
        /** Whether the queue repeats the queue. */
        this.queueRepeat = false;
        /** The time the player is in the track. */
        this.position = 0;
        /** Whether the player is playing. */
        this.playing = false;
        /** Whether the player is paused. */
        this.paused = false;
        /** The voice channel for the player. */
        this.voiceChannel = null;
        /** The text channel for the player. */
        this.textChannel = null;
        /** The current state of the player. */
        this.state = "DISCONNECTED";
        /** The equalizer bands array. */
        this.bands = new Array(15).fill(0.0);
        /** The voice state object from Discord. */
        this.voiceState = Object.assign({});
        this.data = {};
        if (!this.manager)
            this.manager = Utils_1.Structure.get("Player")._manager;
        if (!this.manager)
            throw new RangeError("Manager has not been initiated.");
        if (this.manager.players.has(options.guild.id)) {
            return this.manager.players.get(options.guild.id);
        }
        this.client = this.manager.options.client;
        this.guild = options.guild;
        this.guildData = options.guildData;
        this.inactivityTimeout = options.inactivityTimeout;
        this.loopType = "d";
        if (options.voiceChannel)
            this.voiceChannel = options.voiceChannel;
        if (options.textChannel)
            this.textChannel = options.textChannel;
        const node = this.manager.nodes.get(options.node);
        this.node = node || this.manager.leastLoadNodes.first();
        if (!this.node)
            throw new RangeError("No available nodes.");
        this.manager.players.set(options.guild.id, this);
        this.manager.emit("playerCreate", this);
        this.setVolume((_a = options.volume) !== null && _a !== void 0 ? _a : 100);
    }
    /**
     * Set custom data.
     * @param key
     * @param value
     */
    set(key, value) {
        this.data[key] = value;
    }
    /**
     * Get custom data.
     * @param key
     */
    get(key) {
        return this.data[key];
    }
    /** @hidden */
    static init(manager) {
        this._manager = manager;
    }
    /**
     * Same as Manager#search() but a shortcut on the player itself.
     * @param query
     * @param requester
     */
    search(query, requester) {
        return this.manager.search(query, requester);
    }
    /**
     * Sets the players equalizer band on-top of the existing ones.
     * @param bands
     */
    setEQ(bands) {
        if (bands.length &&
            !bands.every((band) => JSON.stringify(Object.keys(band).sort()) === '["band","gain"]'))
            throw new TypeError("Channel must be a non-empty string.");
        for (const { band, gain } of bands)
            this.bands[band] = gain;
        this.node.send({
            op: "equalizer",
            guildId: this.guild.id,
            bands: this.bands.map((gain, band) => ({ band, gain })),
        });
        return this;
    }
    /** Clears the equalizer bands. */
    clearEQ() {
        this.bands = new Array(15).fill(0.0);
        return this.setEQ();
    }
    /** Connect to the voice channel. */
    connect() {
        if (!this.voiceChannel)
            throw new RangeError("No voice channel has been set.");
        this.state = "CONNECTING";
        this.manager.options.send(this.guild.id, {
            op: 4,
            d: {
                guild_id: this.guild.id,
                channel_id: this.voiceChannel.id,
                self_mute: this.options.selfMute || false,
                self_deaf: this.options.selfDeafen || false,
            },
        });
        this.state = "CONNECTED";

        this.inactivityChecker = {
            stop: false,
            times: 0,
            player: this,
            run: async function () {
                if (!(this.player.guildData.settings.music["24/7"] && this.player.guildData.settings.premium.enabled))
                    if (!this.player.playing || this.player.voiceChannel.members.filter(member => !member.user.bot).size < 1)
                        if (this.times > 1) this.player.manager.emit("playerInactivity", this.player);
                        else ++this.times;
                if (!this.stop) setTimeout(() => this.run(), this.player.inactivityTimeout);
            }
        }
        this.inactivityChecker.run();

        return this;
    }
    /** Disconnect from the voice channel. */
    disconnect() {
        if (this.voiceChannel === null)
            return this;
        this.state = "DISCONNECTING";
        this.pause(true);
        this.manager.options.send(this.guild.id, {
            op: 4,
            d: {
                guild_id: this.guild.id,
                channel_id: null,
                self_mute: false,
                self_deaf: false,
            },
        });
        this.voiceChannel = null;
        this.state = "DISCONNECTED";
        return this;
    }
    /** Destroys the player. */
    destroy() {
        this.state = "DESTROYING";
        this.disconnect();
        this.node.send({
            op: "destroy",
            guildId: this.guild.id,
        });
        this.manager.emit("playerDestroy", this);
        this.manager.players.delete(this.guild.id);
        this.inactivityChecker.stop = true;
        if (this.guild) delete this.guild.player;
    }
    /**
     * Sets the player voice channel.
     * @param channel
     */
    setVoiceChannel(channel) {
        this.voiceChannel = channel;
        this.connect();
        return this;
    }
    /**
     * Sets the player text channel.
     * @param channel
     */
    setTextChannel(channel) {
        this.textChannel = channel;
        return this;
    }
    play(optionsOrTrack, playOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof optionsOrTrack !== "undefined" &&
                Utils_1.TrackUtils.validate(optionsOrTrack)) {
                this.queue.current = optionsOrTrack;
            }
            if (!this.queue.current)
                throw new RangeError("No current track.");
            const finalOptions = playOptions
                ? playOptions
                : ["startTime", "endTime", "noReplace"].every((v) => Object.keys(optionsOrTrack || {}).includes(v))
                    ? optionsOrTrack
                    : {};
            if (Utils_1.TrackUtils.isUnresolvedTrack(this.queue.current)) {
                try {
                    this.queue.current = yield Utils_1.TrackUtils.getClosestTrack(this.manager, this.queue.current);
                }
                catch (error) {
                    this.manager.emit("trackError", this, this.queue.current, error);
                    if (this.queue[0])
                        return this.play(this.queue[0]);
                    return;
                }
            }
            const options = Object.assign({ op: "play", guildId: this.guild.id, track: this.queue.current.track }, finalOptions);
            if (typeof options.track !== "string") {
                options.track = options.track.track;
            }
            yield this.node.send(options);
        });
    }
    /**
     * Sets the player volume.
     * @param volume
     */
    setVolume(volume) {
        volume = Number(volume);
        if (isNaN(volume))
            throw new TypeError("Volume must be a number.");
        this.volume = Math.max(Math.min(volume, 1000), 0);
        this.node.send({
            op: "volume",
            guildId: this.guild.id,
            volume: this.volume,
        });
        return this;
    }
    /**
     * Sets the track repeat.
     * @param repeat
     */
    setTrackRepeat(repeat) {
        if (typeof repeat !== "boolean")
            throw new TypeError('Repeat can only be "true" or "false".');
        if (repeat) {
            this.loopType = "t";
            this.trackRepeat = true;
            this.queueRepeat = false;
        }
        else {
            this.loopType = "d";
            this.trackRepeat = false;
            this.queueRepeat = false;
        }
        return this;
    }
    /**
     * Sets the queue repeat.
     * @param repeat
     */
    setQueueRepeat(repeat) {
        if (typeof repeat !== "boolean")
            throw new TypeError('Repeat can only be "true" or "false".');
        if (repeat) {
            this.loopType = "q";
            this.trackRepeat = false;
            this.queueRepeat = true;
        }
        else {
            this.loopType = "d";
            this.trackRepeat = false;
            this.queueRepeat = false;
        }
        return this;
    }
    /** Stops the current track. */
    stop() {
        this.node.send({
            op: "stop",
            guildId: this.guild.id,
        });
        return this;
    }
    /**
     * Pauses the current track.
     * @param pause
     */
    pause(pause) {
        if (typeof pause !== "boolean")
            throw new RangeError('Pause can only be "true" or "false".');
        this.playing = !pause;
        this.paused = pause;
        this.node.send({
            op: "pause",
            guildId: this.guild.id,
            pause,
        });
        return this;
    }
    /**
     * Seeks to the position in the current track.
     * @param position
     */
    seek(position) {
        if (!this.queue.current)
            return undefined;
        position = Number(position);
        if (isNaN(position)) {
            throw new RangeError("Position must be a number.");
        }
        if (position < 0 || position > this.queue.current.duration)
            position = Math.max(Math.min(position, this.queue.current.duration), 0);
        this.position = position;
        this.node.send({
            op: "seek",
            guildId: this.guild.id,
            position,
        });
        return this;
    }
}
exports.Player = Player;
