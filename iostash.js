/*
IOStash IoT PaaS Platform Library for Nodejs
Copyright (c) 2016 Aravind VS
http://iostash.com
*/
var io = require('socket.io-client')

var access_token = null
var socket = null
var isPublic = false

module.exports = {
  init: function (token) {
    if (!token) {
      console.log('[IOStash] accessToken not specified!')
      return
    }
    access_token = token
    socket = io('https://api.iostash.io:83', { query: 'accessToken=' + access_token,'reconnect': true, 'reconnection delay': 500,'max reconnection attempts': 10 })
    socket.on('connect', function () {
      console.log('[IOStash] Server connection succeeded')
    })

    if (socket) {
      socket.on('autherror', function (data) {
        console.log('[IOStash AUTH ERROR] ' + data.message)
      })
    }

    socket.on('disconnect', function () {
      socket.disconnect()
      console.log('Connection terminated')
    })

  },

  initPublic: function (devToken) {
    if (!devToken) {
      alert('deviceToken is required!')
      return
    }

    device_token = devToken
    var host = 'https://api.iostash.io:83'
    socket = io(host, {query: 'deviceToken=' + device_token,'reconnect': true, 'reconnection delay': 500,'max reconnection attempts': 10 })
    socket.on('connect', function () {
      isPublic = true
    })

    if (socket) {
      socket.on('autherror', function (data) {
        alert(data.message)
        console.log('[IOStash Auth Error] ' + data.message)
      })
    }

  },
  onDisconnect: function (callback) {
    socket.on('disconnect', function () {
      callback()
    })

  },

  subscribeDevice: function (deviceId, callback) {
    socket.emit('subscribeDevice', deviceId)
    socket.on('devicesubscriptionFailed' + deviceId, function (data) {
      console.log(data)
    })
    socket.on('deviceUpdate' + deviceId, function (data) {
      callback(data)
    })
  },

  unsubscribeDevice: function (deviceId, callback) {
    socket.emit('unsubscribeDevice', deviceId)
    socket.on('deviceUnsubcribed/#' + socket.id, function (data) {
      callback(data)
    })
  },

  subscribeChannel: function (channelId, callback) {
    if (isPublic) {
      console.log('[IOStash] Only public devices can be subscribed to in Public Mode')
      return
    }
    socket.emit('channelSubscribe', channelId)

    socket.on('channelsubscriptionFailed' + channelId, function (data) {
      console.log(data)
    })

    socket.on('channelUpdate' + channelId, function (data) {
      callback(data)
    })
  },

  unsubscribeChannel: function (channelId, callback) {
    socket.emit('channelUnsubscribe', channelId)
    socket.on('channelunsubcribed/#' + socket.id, function (data) {
      callback(data)
    })
  },

  subscribeDataPoint: function (deviceId, dataPointName, callback) {
    socket.emit('subscribeDataPoint', {'deviceID': deviceId,'dataPoint': dataPointName})

    socket.on('datapointsubscriptionFailed' + deviceId + dataPointName, function (data) {
      console.log(data)
    })

    socket.on('dataPointUpdate' + deviceId + dataPointName, function (data) {
      callback(data)
    })
  },

  unsubscribeDataPoint: function (deviceId, dataPointName, callback) {
    socket.emit('unsubscribeDataPoint', deviceId + dataPointName)

    socket.on('dataPointUpdateUnsubscribed/#' + socket.id, function (data) {
      callback(data)
    })
  },

  subscribeLocation: function (deviceId, callback) {
    socket.on('newlocationUpdate' + deviceId, function (data) {
      callback(data)
    })
  },
  subscribeActions: function (deviceId, callback) {
    socket.on('action' + deviceId, function (data) {
      callback(data)
    })
  },

  subscribeCustomData: function (deviceId, callback) {
    socket.on('publish' + deviceId, function (data) {
      callback(data)
    })
  }

}
