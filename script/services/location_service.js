var PouchDB = require('pouchdb');
var http = require('https');
var config = require('./config.js');

//cheap and insecure way to accept self signed certificates in https request
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";


var location_service  = new function(){
  this.init = function(){
    var self = this;

    this.initDBs();

    this.getVehicles(function(err,res){
      if(err)
        console.log( err );

      //loop through vehicle
      for(var i in res){
        console.log('checking tracking type for '+res[i].doc._id+'...');
        self.getLocation(res[i].doc._id,res[i].doc.tracking_type, res[i].doc.api_key);
      }

    });
      
  }
  this.initDBs = function(){

    var dbConfig = {
      auth: {
        username: config.db_username,
        password: config.db_password
      }
    };

    this.vehiclesDB = new PouchDB(config.db_remote_url+'/vehicles', dbConfig);
    this.positionsDB = new PouchDB(config.db_remote_url+'/locations', dbConfig);
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
  /*
  gets location froḿ different sources and apis
  */
  this.getLocation = function(id, source_type, api_key, callback){

    var self = this;

    switch(source_type){
      case  'EPAK':
        console.log('GETTING LOCATION FROM '+source_type);
        var url = 'https://monitor.epak.de/api.php?apikey='+api_key+'&tid=63&item=position:text';
        http.get(url, (res) => {
            const statusCode = res.statusCode;
            const contentType = res.headers['content-type'];

            let error;
            if (statusCode !== 200) {
              error = new Error(`Request Failed.\n` +
                                `Status Code: ${statusCode}`);
            }
            if (error) {
              console.log(error.message);
              // consume response data to free up memory
              res.resume();
              callback(error,null);
              return;
            }

            console.log('got result from epak server');
            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => rawData += chunk);
            res.on('end', () => {
              try {
                //rawData is string like 034.853667 N 012.671493 E

                //get first delimiter (N/E/S/W)
                var delimiter = rawData.charAt(11);

                //split epak string into lat and lng (DMS)
                var location_array = rawData.split(delimiter);

                //add delimeter which has been removed during split
                location_array[0] += delimiter;

                for(var i in location_array){
                
                  //returns string like '034.982207 N' or '012.638653 E'
                  location_array[i] = location_array[i].trim();
                  
                  //get direction (...or the last char) from string
                  var direction = location_array[i].substr(location_array[i].length - 1);

                  //remove last 2 chars from location string and change type to float
                  location_array[i] = parseFloat(location_array[i].substring(0, location_array[i].length - 2));

                  //not sure about this thing:
                  switch(direction){
                    case 'N':
                    case 'E':
                      //do nothing
                    break;
                    case 'S':
                    case 'W':
                     location_array[i] = location_array[i] * -1;
                    break;
                  }
                }



              self.positionsDB.put({
                "_id": new Date().toISOString()+"-locationOf-"+id,
                "latitude": location_array[0],
                "longitude": location_array[1],
                "heading": "0",
                "origin": "EPAK",
                "type": "vehicle_location",
                "itemId": id
              }).then(function (response) {
                // handle response
                console.log(response);
              }).catch(function (err) {
                console.log(err);
              });
              } catch (e) {
                console.log(e.message);
              }
            });
          }).on('error', (e) => {
            console.log(`Got error: ${e.message}`);

          });

      break;
    } 
  } 
  this.putLocation = function(location, callback){

  }
}

location_service.init();
