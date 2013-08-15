var Channels = require('./channels/channels');
var parseArgs = require('./parse_args');
var utils = require('./utils');

module.exports = exports = function (Faye) {

    function Pushr() {

        var params = parseArgs(arguments);

        if (params.url) {
            this.client = new Faye.Client(params.url, params);
        } else if (params.client) {
            this.client = params.client;
        } else {
            this.server = new Faye.NodeAdapter(params.mount ? params : { mount: '/', timeout: 45 });
            this.client = this.server.getClient();
        }


//        this.client.addExtension({
//            incoming: function(message, callback) {
//                console.log('incoming', message);
//                callback(message);
//            },
//            outgoing: function(message, callback) {
//                console.log('outgoing', message);
//                callback(message);
//            }
//        });

        this.channels = new Channels();

        this.client.bind('transport:down', function() {
            // IGNORE: Just for providing feedback on the health of the connection.
            // the client is offline
        });

        this.client.bind('transport:up', function() {
            // IGNORE: Just for providing feedback on the health of the connection.
            // the client is online
        });

        // TODO key support
    }

    var prototype = Pushr.prototype;

    prototype.disconnect = function () {
        return this.client.disconnect();
    };

    prototype.channel = function(channel_name) {
        return this.channels.find(channel_name);
    };

    prototype.subscribe = function(channel_name, callback) {
        var channel = this.channels.add(channel_name, this);
        channel.subscribe(callback);
        return channel;
    };

    prototype.unsubscribe = function(channel_name) {
        var channel = this.channels.remove(channel_name);
        channel.unsubscribe();
    };

    prototype.publish = function (channel_name, event, data) {
        return this._publish(channel_name, event, data);
    };

    /** For internal use only. */
    prototype._publish = function (channel_name, event, data) {
        var channels = Array.isArray(channel_name) ? channel_name : [channel_name];
        var message = utils.toMessage(event, data);
        var self = this;
        utils.forEach(channels, function (c) {
            self.client.publish(utils.sureSlash(c), message);
        });
    };

    /** For internal use only. */
    prototype._subscribe = function (channel, callback) {
        return this.client.subscribe(utils.sureSlash(channel), function (message) {
            callback = utils.createCallback(callback);
            if (message.__event__ || message.__data__) {
                callback(message.__event__, message.__data__);
            } else {
                callback('data', message);
            }
        });
    };

    return Pushr;
};
