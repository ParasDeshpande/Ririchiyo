const BaseEvent = require('../../utils/structures/BaseEvent');

module.exports = class MessageEditEvent extends BaseEvent {
    constructor() {
        super('voiceStateUpdate', 'client');
    }

    async run(client, oldState, newState) {
        if (newState.member.id === client.user.id) {
            if (newState.guild.player) {
                if (newState.serverDeaf === false) {
                    if (newState.channel.permissionsFor(client.user).has("DEAFEN_MEMBERS")) newState.setDeaf(true).catch(console.error);
                    if (newState.guild.player.undeafenCount >= 2) {
                        if (newState.guild.player.undeafenMessage) return;
                        else {
                            newState.guild.player.undeafenMessage = await newState.guild.player.options.textChannelOBJ.send(this.embedify(newState.guild, `Please do not undeafen ${client.user.username}.\nDeafening ${client.user.username} helps us protect your privacy and save resources on our side.`, true)).catch(console.error);
                            setTimeout(() => {
                                try {
                                    newState.guild.player.undeafenMessage.delete();
                                    delete newState.guild.player.undeafenMessage;
                                    newState.guild.player.undeafenCount = 1;
                                } catch (err) {
                                    console.log(err);
                                }
                            }, 20000);
                        }
                    }
                    else {
                        if (newState.guild.player.undeafenCount) newState.guild.player.undeafenCount = ++newState.guild.player.undeafenCount;
                        else newState.guild.player.undeafenCount = 1;
                    }

                }
            }
        }
    }
}