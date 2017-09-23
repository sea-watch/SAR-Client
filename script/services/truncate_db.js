var program = require('commander');
var cradle = require('cradle');
var nano = require('nano');

console.log('asdasd');

 program
  .option('-u, --url <url>', 'DB URL')
  .option('-d, --database <database>', 'Database')
  .option('-x, --time <time>', 'Do not delete documents of the last t days')
  .action(function() {

  
        var connection = nano(program.url),
        db = connection.use(program.database),
        updated_docs = []
        errors = [];

        db.list({}, function(err, body) {
          if (!err) {

            var sub_timestamp = 0;
            if(program.time){
              //calculate number of seconds for programe.time days
              sub_timestamp = new Date().getTime()-86400000*parseFloat(program.time);
            }
            console.log('start deleting docs from '+program.database);
            var documents = [];
            body.rows.forEach(function(doc) {


              if(program.time){

                //get timestamp from id
                //console.log(doc);
                var timestamp = doc.id.split('-location')[0];
                var compare_date = new Date(timestamp);

              }else{


                compare_date = new Date();
              }
              var difference = new Date(timestamp)-(new Date(sub_timestamp));
              if(difference <= 0){

                documents.push({ _id: doc.id, _rev: doc.value.rev,"_deleted": true});

              }
              
            });
            db.bulk({docs:documents}, function(err, body) {
              console.log(body);
            });
          }else{
            console.log(err);
          }
        });

    console.log('url: %s database: %s',
        program.url, program.database);
  })
  .parse(process.argv);
