const defaultData = require('../schemas/Playlist');
const { deepMerge, findIndexWithPropInArray } = require('../../utils/util');
const { tracks } = require('../schemas/Playlist');

module.exports = class Playlist {
    constructor(playlistsCollection, fetchedData) {
        const data = deepMerge(defaultData, fetchedData);
        Object.defineProperty(this, "id", { get: function () { return data._id }, set: function (value) { data._id = value } });
        this.userID = data.userID;
        this.name = data.name;
        this.tracks = new PlaylistTracks(playlistsCollection, data.tracks, this.userID, this.name, this);
        Object.defineProperty(this, "private", {
            get: function () { return data.private },
            set: async function (value) {
                if (!value) delete data.private;
                else data.private = value;
                const { upsertedId } = await db.updateOne({ userID: data.userID, name: data.name }, { [value ? `$set` : `$unset`]: { "private": value } }, { upsert: true });
                if (!this.id && upsertedId && upsertedId._id) data._id = upsertedId._id;
            }
        });
    }
}

class PlaylistTracks extends Array {
    constructor(db, tracksArray, userID, name, playlistClass) {
        super(...tracksArray);

        this.add = async function (title, uri, duration) {
            const foundSameTrack = findIndexWithPropInArray(this, "uri", uri);
            if (foundSameTrack > -1) return;
            const track = { title, uri, duration };
            this.push(track);
            const { upsertedId } = await db.updateOne({ userID, name }, { $push: { "tracks": track } }, { upsert: true });
            if (!playlistClass.id && upsertedId && upsertedId._id) playlistClass.id = upsertedId._id;
            return track;
        }

        this.remove = async function (index) {
            const track = this.splice(index, 1);
            const { upsertedId } = await db.updateOne({ userID, name }, { $pull: { "tracks": track } }, { upsert: true });
            if (!playlistClass.id && upsertedId && upsertedId._id) playlistClass.id = upsertedId._id;
            return;
        }
    }
}