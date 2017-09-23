class DBBase {
  constructor(dbName, db, remoteDb, onChange) {
    this.dbName = dbName;
    this.db = db;
    this.remoteDb = remoteDb;
    this.replicator = new DBReplicator(dbName, db, remoteDb, onChange);
  }

  createIndex(fields) {
    const log = `${this.dbName}:create-index(${JSON.stringify(fields)})`;
    console.time(log);
    this.db.createIndex({
      index: {
        fields: fields,
      }
    }).then(result => {
      console.timeEnd(log);
    }).catch(err => {
      console.log(`Could not create index on ${this.dbName}=>${JSON.stringify(fields)}`, err);
    });
  }

  all(options, reply, error) {
    const log = `${this.dbName}:all`;
    console.time(log);
    this.db.allDocs(options).then((data) => {
      console.timeEnd(log);
      reply(data);
    }).catch(error);
  }

  get(args, reply, error) {
    const log = `${this.dbName}:get(${args.id})`
    console.time(log)
    this.db.get(args.id).then((data) => {
      console.timeEnd(log);
      reply(data);
    }).catch(error);
  }

  find(args, reply, error) {
    const findOptions = {};

    if (args.selector) {
      findOptions.selector = args.selector;
    }
    if (args.limit) {
      findOptions.limit = args.limit;
    }
    if (args.sort) {
      findOptions.sort = args.sort;
    }

    const log = `${this.dbName}:find(${JSON.stringify(args.selector)})`;
    console.time(log);
    this.db.find(findOptions).then((data) => {
      console.timeEnd(log);
      reply(data);
    }).catch(error);
  }

  store(args, reply, error) {
    const timer = `${this.dbName}:store(${JSON.stringify(args.payload)})`;
    console.time(timer);
    this.db.put(args.payload).then((data) => {
      console.timeEnd(timer);
      reply(data);
    }).catch(error);
  }

  clearLocalDatabase() {
    // Make sure that we do not clear a remote database!
    if (this.db.type().indexOf('http') < 0) {
      return this.db.destroy();
    } else {
      return Promise.reject(new Error(`Not clearing remote database <${this.dbName}>`));
    }
  }
}

class DBMessages extends DBBase {
  constructor(db, remoteDb, onChange) {
    super('messages', db, remoteDb, onChange);
    this.replicator.startSync({
      live: true,
      retry: true,
      continuous: true,
      include_docs: true
    });
  }
}

class DBVersions extends DBBase {
  constructor(db, remoteDb, onChange) {
    super('versions', db, remoteDb, onChange);
    this.replicator.startSync({
      live: true,
      retry: true,
      continuous: true,
      include_docs: true
    });
  }
}

class DBVehicles extends DBBase {
  constructor(db, remoteDb, onChange) {
    super('vehicles', db, remoteDb, onChange);
    this.replicator.startSync({
      live: true,
      retry: true,
      continuous: true,
      include_docs: true
    });
  }
}

class DBCases extends DBBase {
  constructor(db, remoteDb, onChange) {
    super('cases', db, remoteDb, onChange);
    this.createIndex(['state']);
    this.replicator.startSync({
      live: true,
      retry: true,
      continuous: true,
      include_docs: true
    });
  }
}

class DBLocations extends DBBase {
  constructor(db, remoteDb, onChange) {
    super('locations', db, remoteDb, onChange);
    this.createIndex(['itemId']);
    this.replicator.startSync({
      live: true,
      retry: true,
      continuous: true,
      include_docs: true
    });
  }
}
