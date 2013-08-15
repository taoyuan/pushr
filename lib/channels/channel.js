var utils = require('../utils');
var EventEmitter = require('eventemitter2').EventEmitter2;

module.exports = exports = Channel;

function Channel(name, pushr) {
    EventEmitter.call(this);
    this.name = name;
    this.pushr = pushr;
    this.client = pushr.client;
    this.subscription = null;
}

var prototype = Channel.prototype;
utils.extend(prototype, EventEmitter.prototype);

prototype.bind = prototype.on;

/** Publish an event */
prototype.publish = function (event, data) {
    return this.pushr._publish(this.name, event, data);
};

/** Send a subscription request. For internal use only. */
prototype.subscribe = function (cb) {
    if (!this.subscription) {
        var self = this;
        function callback (err) {
            if (cb) cb(err, self);
        }
        this.subscription = this.pushr._subscribe(this.name, utils.createCallback(this.handleEvent, this, 2));
        this.subscription.callback(callback);
        this.subscription.errback(callback);
    }
};

prototype.unsubscribe = function () {
    if (this.subscription) this.subscription.cancel();
    this.subscription = null;
};

prototype.handleEvent = function (event, data) {
    this.emit(event, data);
};


