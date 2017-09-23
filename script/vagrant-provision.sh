#!/bin/bash

set -e

v="2.0.0"
download_url="http://apache.mirror.iphh.net/couchdb/source/2.0.0/apache-couchdb-2.0.0.tar.gz"
couchdb_url="http://127.0.0.1:5984"
systemd_service="/etc/systemd/system/couchdb.service"

install_couchdb()
{
	apt-get update
	apt-get --no-install-recommends -y install build-essential \
		pkg-config erlang libicu-dev libmozjs185-dev \
		libcurl4-openssl-dev help2man python-sphinx

	mkdir -p /opt/src
	curl -s $download_url | tar -C /opt/src -xzf -

	(cd /opt/src/apache-couchdb-${v} && ./configure -u root -c)
	(cd /opt/src/apache-couchdb-${v} && make release)
	(cd /opt/src/apache-couchdb-${v} && cp -R rel/couchdb /opt)

	sed -i -e 's,;bind_address = 127.0.0.1,bind_address = 0.0.0.0,g' /opt/couchdb/etc/local.ini

	cat <<-__SYSTEMD > $systemd_service
		[Unit]
		Description=CouchDB Service
		After=network.target

		[Service]
		User=root
		ExecStart=/opt/couchdb/bin/couchdb
		Restart=always

		[Install]
		WantedBy=multi-user.target
	__SYSTEMD

	systemctl daemon-reload
	systemctl enable couchdb.service
	systemctl start couchdb.service
}

if [ -e "$systemd_service" ]; then
	echo "==> CouchDB already installed"
else
	echo "==> Installing CouchDB"
	install_couchdb
fi

# Wait until CouchDB has started before running the seed script
retries=0
while ! curl -s http://localhost:5984 >/dev/null; do
	retries=$(($retries + 1))

	# Do not wait forever, give up after 11 seconds
	if [ $retries -gt 10 ]; then
		echo "==> Unable to connect to CouchDB, abort!"
		exit 1
	fi

	echo "==> Waiting for CouchDB to become available - retry: $retries"
	sleep 1
done

/bin/bash /vagrant/script/db-seed-import.sh

# Enable CORS for CouchDB - inspired by https://github.com/pouchdb/add-cors-to-couchdb
echo "==> Enabling CORS for CouchDB"
node_url="${couchdb_url}/_node/couchdb@localhost"
curl -s -XPUT -d '"true"' ${node_url}/_config/httpd/enable_cors
curl -s -XPUT -d '"*"' ${node_url}/_config/cors/origins
curl -s -XPUT -d '"true"' ${node_url}/_config/cors/credentials
curl -s -XPUT -d '"GET, PUT, POST, HEAD, DELETE"' ${node_url}/_config/cors/methods
curl -s -XPUT -d '"accept, authorization, content-type, origin, referer, x-csrf-token"' ${node_url}/_config/cors/headers

exit 0
