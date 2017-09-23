var shell = require('shelljs');
var PouchDB = require('pouchdb');
var couchbackup = require('couchbackup');
var config = require('./config.js');


//use cloudant backup tool in case that the databse is hosted at cloudant
if(config.db_remote_url.indexOf('cloudant') !== -1 &&
shell.exec('cloudant-backup -u '+config.db_username+' -p '+config.db_password).code === 0) {
  shell.echo('Cloudant Backup worked');
  shell.exit(1);
}else{
//use couchbackup
    var dbConfig = {
      auth: {
        username: config.db_username,
        password: config.db_password
      }
    };
    var _all_dbs = new PouchDB(config.db_remote_url+'/_all_dbs', dbConfig);
    _all_dbs.allDocs({
      include_docs: true,
      attachments: true
    }).then(function (databases) {

      var fs = require('fs');
      var dir = './'+new Date().toISOString().slice(0,10);

      //create dir if doesnt exist
      if (!fs.existsSync(dir)){
          fs.mkdirSync(dir);
      }
      
      var couchbackup = require('couchbackup');

      //split remote url so you can insert credentials (http://xy.mycouchdb.com to http://user:password@mycouchdb.com)
      var remote_url_parts = config.db_remote_url.split('//');
      //rebuild url
      var remote_credential_url = remote_url_parts[0]+'//'+config.db_username+':'+config.db_password+'@'+remote_url_parts[1];
      console.log(remote_credential_url);
          //looop through databases
          databases.forEach(function(database_title){



            var opts = {
              "COUCH_URL": remote_credential_url,
              "COUCH_DATABASE": database_title,
            }
            couchbackup.backupFile(dir+"/"+database_title+'.json', opts, function() {
                        console.log('...backup for '+database_title+' created: '+dir+"/"+database_title);
              // done!
            });

          });
          //callback(false,result.rows);
        }).catch(function (err) {
          console.log(err)
        });
            


}
