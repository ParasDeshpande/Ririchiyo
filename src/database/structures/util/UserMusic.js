const { findIndexWithPropInArray } = require('../../../utils/util');

module.exports = class UserMusic {
    constructor(db, userMusicData, id, dbFunctions) {
        this.playlists = new UserPlaylists(db, userMusicData.playlists, id, dbFunctions)
    }
}

class UserPlaylists extends Array {
    constructor(db, playlists, userID, dbFunctions) {
        super();
        this.fetchAll = async function () {
            for (const name of playlists) this.push(await dbFunctions.getPlaylist(userID, name));
            this.fetched = true;
            return this;
        }
        this.findWithName = async function (name) {
            if (!this.fetched) await this.fetchAll();
            const indexOfFound = findIndexWithPropInArray(this, "name", name);
            if (indexOfFound < 0) return;
            else return this[indexOfFound];
        }
        this.addNew = async function (name) {
            const alreadyExists = await this.findWithName(name);
            if (!alreadyExists) {
                const createdPlaylist = await dbFunctions.getPlaylist(userID, name);
                this.push(createdPlaylist);
                await db.updateOne({ _id: userID }, { $push: { "music.playlists": name } }, { upsert: true });
                return createdPlaylist;
            }
            else return alreadyExists;
        }
        this.remove = async function (name) {
            if (!this.fetched) await this.fetchAll();
            const indexOfFound = findIndexWithPropInArray(this, "name", name);
            if (indexOfFound < 0) return;
            else {
                await db.updateOne({ _id: userID }, { $pull: { "music.playlists": name } }, { upsert: true });
                return this.splice(indexOfFound, 1);;
            }
        }
    }
}