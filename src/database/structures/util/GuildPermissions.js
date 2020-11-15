const RolePermissions = require('./RolePermissions');
const UserPermissions = require('./UserPermissions');


module.exports = class GuildPermissions {
    constructor(db, permissionsData, id) {
        const guildPermissionsCache = new GuildPermissionsCache();
        guildPermissionsCache.permissions = permissionsData;
        this.roles = new RolePermissions(db, guildPermissionsCache, id);
        this.users = new UserPermissions(db, guildPermissionsCache, id, this.roles);
    }
}
class GuildPermissionsCache {
    constructor() {
    }
}