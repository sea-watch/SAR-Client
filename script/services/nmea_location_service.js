var PouchDB = require('pouchdb');
var http = require('http');
//var config = require('./config.js');
var dgram = require('dgram');
var server = dgram.createSocket('udp4');
var AisParser = require('aisparser');
var config = require('./nmea.config.js');

var parser = new AisParser({ checksum : false });

var service = new function() {

  this.initDBs = function(){

      this.dbConfig = {
        auth: {
          username: config.db_username,
          password: config.db_password
        }
      };

      this.vehiclesDB = new PouchDB(config.db_remote_url+'/vehicles', this.dbConfig);
      this.positionsDB = new PouchDB(config.db_remote_url+'/locations', this.dbConfig);

  }

  this .run = function(){

    this.initDBs();
    var self = this;

    var PORT = 1312;
    var HOST = '192.168.1.164';

    var ID = 'SW3';

    var lastUpdateTimestamp = -1;

    var intervall = 5 * 1000;

    server.on('listening', function () {
        var address = server.address();
        console.log('UDP Server listening on ' + address.address + ":" + address.port);
    });

    server.on('message', function (message, remote) {
        var message = '' + message;
        var msgOk = AisParser.checksumValid(message);
        var data = parser.parse(message);

        if(config.DEBUG && data['aisType'] === 3){
          console.log('mmsi:' + data['mmsi']);
          console.log('heading:' + data['heading']);
          console.log('cog:' + data['cog']);
          console.log('sog:' + data['sog']);
          console.log('longitude:' + data['longitude']);
          console.log('latitude:' + data['latitude']);
        }

        if(Date.now() - lastUpdateTimestamp > intervall){

          self.positionsDB.put({
            "_id": new Date().toISOString()+"-locationOf-" + ID,
            "latitude": data['latitude'],
            "longitude": data['longitude'],
            "heading": data['heading'],
            "origin": 'NMEA',
            "type": "vehicle_location",
            "itemId": ID,
          }).then(function (response) {
            console.log('location created');
            lastUpdateTimestamp = Date.now();
          }).catch(function (err) {
            console.log(err);
          });

        }
    });

    server.bind(PORT, HOST);
  }
}

service.run();
