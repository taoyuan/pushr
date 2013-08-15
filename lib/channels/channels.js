"use strict";

var utils = require('../utils');
var Channel = require('./channel');

module.exports = exports = Channels;

/** Handles a channel map. */
function Channels() {
    this.channels = {};
}
var prototype = Channels.prototype;

/** Creates or retrieves an existing channel by its name.
 *
 * @param {String} name
 * @param {Pushr} pushr
 * @return {Channel}
 */
prototype.add = function (name, pushr) {
    if (!this.channels[name]) {
        this.channels[name] = createChannel(name, pushr);
    }
    return this.channels[name];
};

/** Finds a channel by its name.
 *
 * @param {String} name
 * @return {Channel} channel or null if it doesn't exist
 */
prototype.find = function (name) {
    return this.channels[name];
};

/** Removes a channel from the map.
 *
 * @param {String} name
 */
prototype.remove = function (name) {
    var channel = this.channels[name];
    delete this.channels[name];
    return channel;
};

/** Proxies disconnection signal to all channels. */
prototype.disconnect = function () {
    utils.forEach(this.channels, function (channel) {
        channel.disconnect();
    });
};

function createChannel(name, pushr) {
//    if (name.indexOf('private-') === 0) {
//        return new Pushr.PrivateChannel(name, pushr);
//    } else if (name.indexOf('presence-') === 0) {
//        return new Pushr.PresenceChannel(name, pushr);
//    } else {
        return new Channel(name, pushr);
//    }
}