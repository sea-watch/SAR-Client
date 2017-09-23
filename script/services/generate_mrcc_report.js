var pdf = require('html-pdf');
var config = require('./config.js');
var PouchDB = require('pouchdb');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var smtpTransport = require("nodemailer-smtp-transport");
var send_mail = true;

var cur_path = require('path').dirname(require.main.filename);


var mrcc_report_service = new function(){

  this.init = function(){

  	var self = this;
  	this.initDBs();
  	this.getCases(function(err,cases){
  		cases.forEach(function (caseObj) {

  		  if(caseObj.doc.reportStatus && caseObj.doc.reportStatus == 'pending'){

          //create pdf doc
  		  	self.caseToDocument(caseObj.doc,function(res){

            //send mail with report to mrcc
  		  		self.sendMail(config.mrcc_mail,
  		  			'New Case Report',
  		  			'Dear officer in duty,\n we have a new case report attached.\n Kind regards, Sea-Watch IT',
  		  			'Dear officer in duty,<br> we have a new case report attached.<br> Kind regards, Sea-Watch IT',
  		  			cur_path+'/../../data/reports/'+caseObj.id+'.pdf',function(info){

                console.log('update case obj');

                caseObj.doc.reportStatus = 'report_sent';
                caseObj._id = caseObj.id;
                delete caseObj._rev;
  		  				self.casesDB.put(caseObj.doc).then(function (response) {
                  console.log(response);
                  // handle response
                }).catch(function (err) {
                  console.log(err);
                });

  		  			});

  		  	});
  		  }
		});
  	});
  }
  this.initDBs = function(){

      

      this.dbConfig = {
        auth: {
          username: config.db_username,
          password: config.db_password
        }
      };

      this.casesDB = new PouchDB(config.db_remote_url+'/cases', this.dbConfig);

  }

  this.caseToDocument = function(caseObj,cb){

		if(!caseObj.otherBoatsInvolved)
			caseObj.otherBoatsInvolved = '';

		var fields = [
		{'title':'Assert Name','italian':'Nome Assetto', 'value':' '+caseObj.reportedBy},

		{'title':'Date/position of first indication','italian':'Data/posizione intercetto','value':' '+caseObj.dateOfFirstIndication+' '+caseObj.positionOfFirstIndication},
		{'title':'Date/position of transhipment/rescue', 'italian':'Data/posizione trasbordo/salavataggio','value':' '+caseObj.dateOfTranshipment+' '+caseObj.positionOfTranshipment},

		{'title':'SAR Authority/Other Assets Involved','italian':'Autorita SAR/ Altri asseti coinvolti', 'value':' '+caseObj.sarAuthority+' '+caseObj.otherBoatsInvolved},
		{'title':'Weather conditions', 'italian':'Condimeteo','value':''},

		{'title':'Type of Boat Intercepted', 'italian':'Tipo di mezzo intercettato', 'value':'Wooden Boat'},
		{'title':'Boat after interception', 'italian':'Circostanze di rilascio del mezzo', 'value':' '+caseObj.boatAfterInterception},
		//{'title':'Engine Data/ Charasteristics', 'italian':'Dati/Caratteristiche del motore', 'value':'Engine running'},

		{'title':'Migrants on board', 'italian':'Migranti a bordo','value':' '+caseObj.peopleCount+' total - '+(parseInt(caseObj.peopleCount)-parseInt(caseObj.womenCount)-parseInt(caseObj.childrenCount))+' men - '+caseObj.womenCount+' women - '+caseObj.childrenCount+' children'},
		{'title':'Description of the event', 'italian':'Descrizione dell\'evento','value':' '+caseObj.incidentDescription}
		]

		var html = '<table style="border:1px solid black;border-bottom:none" cellspacing="0"><tbody>';
		fields.forEach(function(field){
			html += '<tr>';
				html += '<td style="width:30%;border-bottom:1px solid black;border-right:1px solid black"><b>';

					html += field.title+':<br>';
					html += field.italian+':';

				html += '</b></td>';
				html += '<td style="width:70%;border-bottom:1px solid black">';

					html += field.value;

				html += '</td>';
			html += '</tr>';
		});
		html += '</tbody></table>';

		var html = '<div id="pageHeader">Report for Case '+caseObj._id+'</div>'+html;
		var options = { format: 'Letter' };

		var id = '';
		
		pdf.create(html, options).toFile('../../data/reports/'+caseObj._id+'.pdf', function(err, res) {
		  if (err) return console.log(err);
		  cb(res);
		});

  }

  this.getCases = function(callback){
    this.casesDB.allDocs({
      include_docs: true,
      attachments: true
    }).then(function (result) {
      // handle result
      callback(false,result.rows);
    }).catch(function (err) {
      callback(err);
    });
  }
  this.sendMail = function (address, title, text_plain,text_html, attachment_path, callback){
      address += ','+config.gateway_cc;

      console.log("START SENDING MAIL TO "+address);

      // create reusable transporter object using SMTP transpor
		  var transporter = nodemailer.createTransport(config.sender_mail_config);

      // setup e-mail data with unicode symbols
      var mailOptions = {
          from: 'Sea-Watch App <'+config.mrcc_mail_from+'>', // sender address
          to: address, // list of receivers
          subject: title, // Subject line
          text: text_plain, // plaintext body
          html: text_html // html body
      };

      if(attachment_path){
      	mailOptions.attachments = [{   // filename and content type is derived from path
            path: attachment_path
        }]
      }

      // send mail with defined transport object
      if(send_mail){
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log(error);
            }else{

            	console.log('Message sent: ' + info.response);
            	if(typeof callback === 'function'){
            		callback(info);
            	}
            }

        });
      }else{
        console.log('MAIL IS NOT SENT WITH THIS OPTION');
        console.log(mailOptions);
      }

  }
}
mrcc_report_service.init();