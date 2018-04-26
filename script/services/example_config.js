module.exports = {
	db_remote_url:'http://93.95.228.166:5984/_utils/index.html',
	db_username:'sea-watch',
	db_password:'1337seawatch1337',

	marinetraffic_api_key:'',

	inreach_mail_username:'',
	inreach_mail_password:'',
	inreach_mail_host:'',
	inreach_sender_mail:'',

	iridium_mail_username:'', //username of iridium gateway imap
	iridium_mail_password:'',
	iridium_mail_host:'',
	iridium_sender_mail:'', //from header field for sent mails

	sw_air_gateway_send_warships_to:'', //mail adresses to which spottet warships will be sent
	sw_air_gateway_send_cases_to:'', //mail adresses to which spottet cases will be sent
	gateway_cc:'', //cc for all sent mails


	mrcc_mail:'', //rescue coordination center mail (used in generate_mrcc_report)
	mrcc_mail_from: '', //mail adress which is shown in the sent mail with the mrcc report


	//nodemailer transport config
	sender_mail_config:{
						    host: 'smtp.example.com',
						    port: 465,
						    secure: true, // secure:true for port 465, secure:false for port 587
						    auth: {
						        user: 'username@example.com',
						        pass: 'userpass'
						    }
						},

	send_mails:false
}
