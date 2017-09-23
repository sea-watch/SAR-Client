MRCC Reports
============

The Application can also send reports to the MRCC.


Client side
-----------
If a client requests, that a case report is generated and sent to the MRCC it updates the case paramenter 'report_status' to "pending". 


Server side
------------
The service script/services/generate_mrcc_report.js which should run in a cron job, checks the database for cases with a "pending" report_status and generates and sends a report for each of them.