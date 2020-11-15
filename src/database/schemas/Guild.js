const settings = require('../../../config/settings.json');

module.exports = {
    "_id": undefined,
    "settings": {
        "prefix": settings.client.commands.defaultPrefix,
        "premium": {
            "boostedBy": undefined,
            "expires": undefined
        },
        "permissions": {
            "users": {},
            "roles": {}
        },
        "nqn": undefined,
        "music": {
            "volume": {
                "value": settings.client.music.defaultVolume,
                "limit": settings.client.music.defaultLimitVolume,
            },
            "eq": {
                "bands": undefined
            },
            "votingPercentage": settings.client.music.defaultVotingPercentage,
            "loop": settings.client.music.defaultLoopValue,
            "24/7": undefined
        },
        "announcements": {
            "welcome": {
                "channel": undefined,
                "settings": {
                    "channel": {
                        "text": undefined,
                        "image": {
                            "imageURL": undefined,
                            "text": undefined
                        },
                        "embed": {
                            "imageURL": undefined,
                            "text": undefined
                        }
                    },
                    "DM": {
                        "text": undefined,
                        "imageURL": undefined,
                        "embed": undefined
                    }
                },
            },
            "modlog": {
                "channel": undefined,
                "enabledTypes": undefined
            }
        }
    }
};