/*
This script calls the marinetraffic api and checks if any of the returned ships is inside the database.
the marinetraffic_api_key needs to be set inside the config.js!
*/


var PouchDB = require('pouchdb');
var http = require('http');
var config = require('./config.js');


var service = new function(){

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

  this.getVehicles = function(callback){
    this.vehiclesDB.allDocs({
      include_docs: true,
      attachments: true
    }).then(function (result) {
      // handle result
      callback(false,result.rows);
    }).catch(function (err) {
      callback(err);
    });

  }

  this.run = function(){

    this.initDBs();
    var self = this;

    this.getVehicles(function(err,res){

      var positionsDB = new PouchDB(config.db_remote_url+'/locations', self.dbConfig);
      if(err){
        console.log(err);
      }else{

          var options = {
            host: 'services.marinetraffic.com',
            path: '/api/exportvessels/v:8/'+config.marinetraffic_api_key+'/timespan:10/protocol:json',
            method: 'GET'
          };

          console.log('services.marinetraffic.com/api/exportvessels/v:8/'+config.marinetraffic_api_key+'/timespan:180/protocol:json')

          callback = function(response) {
            var str = ''
            response.on('data', function (chunk) {
              str += chunk;
            });

            response.on('end', function () {

              try {

                var positions = JSON.parse(str);
                //loop through all vehicles in db
                for(var n in res){
                  var ship = res[n].doc;

                  if(ship.tracking_type === 'AIS'){
                    for(var i in positions){

                      var Position = {
                        mmsi:positions[i][0],
                        imo : positions[i][1],
                        ship_id : positions[i][2],
                        lat : positions[i][3],
                        lon : positions[i][4],
                        speed : positions[i][5],
                        heading : positions[i][6],
                        course : positions[i][7],
                        status : positions[i][8],
                        timestamp : positions[i][9],
                        dsrc : positions[i][10],
                        utc_secons : positions[i][11]
                      }
                      console.log(Position);
                      console.log(ship);
                      if(ship.MMSI == Position.mmsi){
                                  //add position
                                  positionsDB.put({
                                    "_id": new Date(Position.timestamp).toISOString()+"-locationOf-"+ship._id,
                                    "latitude": Position.lat,
                                    "longitude": Position.lon,
                                    "heading": Position.heading,
                                    "origin": Position.dsrc,
                                    "type": "vehicle_location",
                                    "itemId": ship._id,
                                  }).then(function (response) {
                                    console.log('location created');
                                  }).catch(function (err) {
                                    console.log(err);
                                  });
                      }
                      i++;
                    }
                  }
                }
              }
              catch(err) {
                  console.log(err)
              }

              var positions = JSON.parse(str);
              //console.log(positions);


            });
          }

          var req = http.request(options, callback);
          //This is the data we are posting, it needs to be a string or a buffer
          req.end();
        }

    });

    };
}

service.run();
