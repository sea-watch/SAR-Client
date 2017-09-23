class DBReplicator {
  constructor(dbName, db, remoteDb, onChange) {
    this.dbName = dbName;
    this.db = db;
    this.remoteDb = remoteDb;
    this.onChange = onChange;
    this.replicator = null;
  }

  stop() {
    if (this.replicator) {
      this.replicator.cancel();
    }
  }

  // Available options: {live: true, retry: true, continuous: true, include_docs: true}
  startSync(options) {
    if (this.replicator) {
      return;
    }
    console.log('db:sync:start', this.dbName, options);
    this.replicator = this.db.sync(this.remoteDb, options)
      .on('change', (info) => {
        console.log('replicate:change', this.dbName, info);

        // Notify all listeners for remote changes
        if (info.direction === 'pull') {
          this.onChange(this.dbName, {
            docs: info.change.docs,
            errors: info.change.errors,
            docs_read: info.change.docs_read,
            docs_written: info.change.docs_written,
          });
        }
      })
      .on('paused', err => console.log('replicate:paused', this.dbName, err))
      .on('active', () => console.log('replicate:active', this.dbName))
      .on('denied', err => console.log('replicate:denied', this.dbName, err))
      .on('complete', info => console.log('replicate:complete', this.dbName, info))
      .on('error', err => console.log('replicate:error', this.dbName, err));
  }

  // Available options: {live: true, retry: true, continuous: true, include_docs: true}
  startFromRemote(options) {
    if (this.replicator) {
      return;
    }
    console.log('db:replicate-from-remote:start', this.dbName, options);
    this.replicator = this.db.replicate.from(this.remoteDb, options)
      .on('change', (info) => {
        console.log('replicate:change', this.dbName, info);

        // Notify all listeners for remote changes
        this.onChange(this.dbName, {
          docs: info.docs,
          errors: info.errors,
          docs_read: info.docs_read,
          docs_written: info.docs_written,
        });
      })
      .on('paused', err => console.log('replicate:paused', this.dbName, err))
      .on('active', () => console.log('replicate:active', this.dbName))
      .on('denied', err => console.log('replicate:denied', this.dbName, err))
      .on('complete', info => console.log('replicate:complete', this.dbName, info))
      .on('error', err => console.log('replicate:error', this.dbName, err));
  }
}
