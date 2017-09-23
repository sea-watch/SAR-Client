#!/bin/bash

set -e

# Import seeds into the local CouchDB
couch_url="http://localhost:5984"

for dbname in locations; do

	echo "==> Backup of all Databases"
	node $(dirname $0)/services/backup_service.js || true


	echo "==> Delelte all docs which are older then 3 days from $dbname"
	node $(dirname $0)/services/truncate_db.js -u ${couch_url} -d ${dbname} -x 3 . || true


done

exit 0
