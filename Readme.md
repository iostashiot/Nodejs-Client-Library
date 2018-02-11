

![IOStash IoT PaaS](http://iostash.io/wp-content/uploads/2016/06/iostashbeta_black.png) 

 Nodejs Client Library
===================


[![NPM](https://nodei.co/npm-dl/iostash.png)](https://nodei.co/npm/iostash/)


Nodejs Client library for IOStash IoT PaaS. Supports realtime data subscription to Devices, Data Points, Location, Channels and Custom Data sent to devices.

 **Installing**

Use NPM 

    npm install iostash

 
 **How To Use**

This library supports all realtime events supported by IOStash. Refer to API Docs on http://docs.iostash.io for more information and guides on using this library.

      //Require library
      var io = require('iostash')
      //Initialize
      var iostash = new io(options);
      //Attach listeners
      iostash.subscribeDevice('DEVICE-ID_HERE', function (err,data) {
      //Handle data here
      });  
 **Supported option parameters**
* accessToken - Your user access token.
* autoReconnect - Reconnect automatically if connection drops. Default is true/
* retryDelay - Delay between retries in ms. Default is 500.
* retryAttempts - Number of retries to perform. Default is 10.
* deubgLogs - Enable library debug logs. Default is false.


**Example**

This example utilises a public device defined in IOStash.

    var io = require('iostash');
    var options = {
        accessToken: 'token goes here',
        debugLogs: true
    };
    var iostash = new io(options);
    iostash.subscribeDevice('5734997f8680bc62de000006', function(err, update) {
        console.log(update);
    });

**Methods**   
   

 - `constructor(options)` - Initialises the object with specified options.
 - `subscribeDevice(deviceId,cb(err,data))` - Subscribes to data changes from the specified device.
 - `unsubscribeDevice(deviceId,cb(err,data))` - Unsubscribes from the specified device.
 - `subscribeDataPoint(deviceId,datapoint,cb(err,data))` - Subscribes to specified datapoint of the specified device.
 - `unsubscribeDataPoint(deviceId,datapoint,cb(err,data))` - Unsubscribes from the specified data point.
 - `subscribeLocation(deviceId,cb(err,data))` - Subscribes to location data from the specified device.
 - `subscribeActions(deviceId,cb(err,data))` - Subscribes to device trigger action of the specified device.
 - `subscribeCustomData(deviceId,cb(err,data))` - Subscribes to custom data sent to the device.
 - `getConnectionStatus(cb(status))` - Gets the connection status 
 - `connectionDropped(cb(err))` - Callback will be executed when the connection is dropped.
 - `connectionFatal(cb(err))` - Callback will be executed when an irrecoverable error occurs.

**Notes**

- `cb()` refers to callbacks and they will be executed during updates. 
- This library does not (yet) support data pushing to IOStash.

For support or assistance, drop an email to support@iostash.io