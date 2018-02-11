/*
IOStash IoT PaaS Platform Library for Nodejs v2.0
Copyright (c) 2018 Aravind VS
https://iostash.io
*/


var io = require('socket.io-client')
var colors = require('colors');
var async = require('async');
var _ = require('lodash');
var socket = null
var logs = false;
var API_URL = 'https://api.iostash.io:83';

function iostash(options) {
    var opts = options;
    var logs = opts.debugLogs || false;
    this.subscriptionManager = {
        authenticated: false,
        connected: false,
        subscriptions: [],
        addSubscription: function(event, id) {
            this.subscriptions.push({ event: event, id: id });
        },
        removeSubscription: function(event, id) {
            _.remove(this.subscriptions, function(currentObject) {
                return (currentObject.event === event && currentObject.id === id);
            });
        },
        checkSubscription: function(event, id) {
            return _.some(this.subscriptions, function(subscription) {
                return subscription.event == event && subscription.id == id;
            })
        }
    };

    var self = this;

    function _log(message) {
        if (logs)
            console.log('[IOStash]'.green, message)
    }

    function _error(message) {
        console.log('[IOStash]'.red, message)
    }

    if (!opts.accessToken || opts.accessToken.length < 10)
        _error('Invalid token specified')
    else {
        _log('Attempting connection')
        socket = io(API_URL, { reconnection: opts.autoReconnect || true, reconnectionDelayMax: opts.retryDelay || 500, reconnectionAttempts: opts.retryAttempts || 10 });
        socket.on('connect', function() {
            _log('Connected, authenticating')
            self.subscriptionManager.connected = true;
            socket.emit('authenticate', { accessToken: opts.accessToken });
            socket.on('disconnect', function() {
                self.subscriptionManager.connected = false;
                _error('Connection closed')
            });

            socket.on('authenticated', function(data) {
                self.subscriptionManager.authenticated = true;
                _log('Auth successful')
                async.each(self.subscriptionManager.subscriptions, function(subscription) {
                    socket.emit(subscription.event, subscription.id)
                })
            });

            socket.on('unauthorized', function(e) {
                _error('Auth failed - Invalid access token')
                self.subscriptionManager.authenticated = false;
            });
        });

        socket.on('reconnect_failed', function(e) {
            _error('Reconnection attempts failed. Please check your network connection')
            self.subscriptionManager.authenticated = false;
        })

    }
}

iostash.prototype.subscribeDevice = function(deviceId, callback) {
    socket.emit('subscribeDevice', deviceId)
    this.subscriptionManager.addSubscription('subscribeDevice', deviceId);
    socket.on('devicesubscriptionFailed' + deviceId, function(data) {
        _error('Subscription to ' + deviceId.yellow + ' failed: ' + data)
        callback(data)
    })
    socket.on('deviceUpdate' + deviceId, function(data) {
        callback(null, data)
    })
}

iostash.prototype.unsubscribeDevice = function(deviceId, callback) {
    socket.emit('unsubscribeDevice', deviceId)
    socket.on('deviceUnsubcribed/#' + socket.id, function(data) {
        this.subscriptionManager.removeSubscription('subscribeDevice', deviceId);
        callback(data)
    })
}

iostash.prototype.subscribeChannel = function(channelId, callback) {
    socket.emit('channelSubscribe', channelId)
    this.subscriptionManager.addSubscription('channelSubscribe', channelId);
    socket.on('channelsubscriptionFailed' + channelId, function(data) {
        callback(data)
    })
    socket.on('channelUpdate' + channelId, function(data) {
        callback(null, data)
    })
}

iostash.prototype.unsubscribeChannel = function(channelId, callback) {
    socket.emit('channelUnsubscribe', channelId)
    socket.on('channelunsubcribed/#' + socket.id, function(data) {
        this.subscriptionManager.removeSubscription('channelSubscribe', channelId);
        callback(data)
    })
}

iostash.prototype.subscribeDataPoint = function(deviceId, dataPointName, callback) {
    socket.emit('subscribeDevice', deviceId)
    socket.emit('subscribeDataPoint', { 'deviceID': deviceId, 'dataPoint': dataPointName })
    this.subscriptionManager.addSubscription('subscribeDataPoint', { 'deviceID': deviceId, 'dataPoint': dataPointName });
    socket.on('datapointsubscriptionFailed' + deviceId + dataPointName, function(data) {
        callback(data)
    })
    socket.on('dataPointUpdate' + deviceId + dataPointName, function(data) {
        callback(null, data)
    })
}

iostash.prototype.unsubscribeDataPoint = function(deviceId, dataPointName, callback) {
    socket.emit('unsubscribeDataPoint', deviceId + dataPointName)
    socket.on('dataPointUpdateUnsubscribed/#' + socket.id, function(data) {
        this.subscriptionManager.removeSubscription('subscribeDataPoint', { 'deviceID': deviceId, 'dataPoint': dataPointName });
        callback(data)
    })
}

iostash.prototype.subscribeCustomData = function(deviceId, callback) {
    if (!this.subscriptionManager.checkSubscription('subscribeDevice', deviceId)) {
        socket.emit('subscribeDevice', deviceId)
        this.subscriptionManager.addSubscription('subscribeDevice', deviceId);
    }
    socket.on('publish' + deviceId, function(data) {
        callback(null, data)
    })
}

iostash.prototype.subscribeLocation = function(deviceId, callback) {
    if (!this.subscriptionManager.checkSubscription('subscribeDevice', deviceId)) {
        socket.emit('subscribeDevice', deviceId)
        this.subscriptionManager.addSubscription('subscribeDevice', deviceId);
    }
    socket.on('newlocationUpdate' + deviceId, function(data) {
        callback(null, data)
    })
}

iostash.prototype.subscribeActions = function(deviceId, callback) {
    if (!this.subscriptionManager.checkSubscription('subscribeDevice', deviceId)) {
        socket.emit('subscribeDevice', deviceId)
        this.subscriptionManager.addSubscription('subscribeDevice', deviceId);
    }
    socket.on('action' + deviceId, function(data) {
        callback(null, data)
    })
}

iostash.prototype.getConnectionStatus = function() {
    return this.subscriptionManager.connected;
}

iostash.prototype.connectionDropped = function(callback) {
    socket.on('disconnect', function() {
        callback('Connection dropped');
    });
}

iostash.prototype.connectionFatal = function(callback) {
    socket.on('reconnect_failed', function(e) {
        callback('Cannot establish connection, please check your network')
    })
}

module.exports = iostash;