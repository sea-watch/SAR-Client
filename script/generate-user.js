/*
can be used to create users in your couch instance
example:
$ node create_user.js -u SW2 -p abcabc -e sw2@mail.com -a SAR-Ship -v SW2 .
*/

var config = require('./services/config.js');
var program = require('commander');
var CloudantUser = require("cloudant-user");

 program
  .option('-u, --username <username>', 'The user to authenticate as')
  .option('-p, --password <password>', 'The user\'s password')
  .option('-e, --email <email>', 'The user\'s mail')
  .option('-a, --usertype <usertype>', 'type (SAR-Ship/Plane/Backoffice')
  .option('-v, --vehicle <vehicle>', 'vehicle-id')
  .action(function() {



    //https://www.npmjs.com/package/cloudant-user
     
    var server = {
      host: config.db_remote_url,
      port: 443,
      secure: true,
      auth: {
        username: config.db_username,
        password: config.db_password
      }
    };
     

    var newuser = {
      name: program.username,
      password: program.password,
      email:program.email,
      user_type:program.usertype
    };
    if(program.vehicle){
      newuser.vehicle_id = program.vehicle;
    }
     
    console.log(newuser);

    var cloudantUser = new CloudantUser(server);
    cloudantUser.create(newuser.name,
                        newuser.password,
                        function(err, res) {
                          if (err) console.log(err);
                          if (res) return console.log(res);
                        });


    console.log('user: %s pass: %s email: %s usertype: %s vehicle: %s',
        program.username, program.password, program.email, program.usertype, program.vehicle);
  })
  .parse(process.argv);
