const DEXIE_DB = new Dexie('sar-client');

DEXIE_DB.version(1).stores({
  locations: '&_id,itemId',
});

class DexieLocations {
  constructor(dbName, remoteDbName, onChange) {
    this.dbName = dbName;
    this.onChange = onChange;

    this.locations = DEXIE_DB.locations;
    this.remoteDb = new PouchDB(remoteDbName, { skip_setup: true });
    this.updateSeq = 'now';
    this.feed = this.startChangeFeed(this.remoteDb, this.updateSeq);
  }

  startChangeFeed(db, seq) {
    const feed = db.changes({
      since: seq,
      live: true,
      include_docs: true,
    });

    feed.on('change', this._onChange.bind(this));
    feed.on('error', this._onError.bind(this));

    return feed;
  }

  _onChange(change) {
    // We need to store the seq so we can restart the changes feed at the
    // correct position after a network cut.
    this.updateSeq = change.seq;

    if (change.doc.type && change.doc.type === 'vehicle_location') {
      this.storeDoc(change.doc);
    }
  }

  _onError(error) {
    console.log('LOCATIONS UPDATE ERROR', error);
    setTimeout(() => {
      this.feed = this.startChangeFeed(this.remoteDb, this.updateSeq);
    }, 10 * 1000);
  }

  get(args, reply, error) {
    const log = `${this.dbName}:get(${args.id})`
    console.time(log)
    this.locations.get(args.id).then(data => {
      console.timeEnd(log);
      reply(data);
    }).catch(error);
  }

  findItem(args, reply, error) {
    const log = `${this.dbName}:find-item(${JSON.stringify(args)})`;
    console.time(log);
    this.locations
      .where('itemId').equals(args.item)
      .limit(1)
      .reverse()
      .sortBy('_id')
      .then(items => {
        console.timeEnd(log);
        reply({ docs: items });
      }).catch(error);
  }

  initialize(vehicles) {
    vehicles.forEach((id) => {
      this.remoteDb.find({
        selector: {
          itemId: id,
        },
        sort: [
          { _id: 'desc' },
        ],
        limit: 1,
      }).then((data) => {
        if (data.docs.length > 0) {
          this.storeDoc(data.docs[0]);
        }
      }).catch(e => console.log('Unable to load vehicle ', id, e));
    });
  }

  storeDoc(doc) {
    const newDoc = {
      _id: doc._id,
      itemId: doc.itemId,
      heading: parseFloat(doc.heading || 0),
      latitude: parseFloat(doc.latitude || 0),
      longitude: parseFloat(doc.longitude || 0),
      origin: doc.origin,
    };

    console.log('STORING VEHICLE LOCATION', newDoc);
    this.locations.put(newDoc).catch(e => console.log('ERROR storing vehicle', newDoc, e));
  }

  clearLocalDatabase() {
    return this.locations.clear();
  }
}
