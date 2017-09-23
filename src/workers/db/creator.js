class DBCreator {
  static init(localName, remoteName) {
    return new Promise((resolve, reject) => {
      if (!localName) {
        reject(new Error('Cannot initialize database without localName argument'));
        return;
      }
      if (!remoteName) {
        reject(new Error('Cannot initialize database without remoteName argument'));
        return;
      }

      const db = new PouchDB(localName);
      const remoteDb = new PouchDB(remoteName, { skip_setup: true });

      console.log(`db:initialize(local=${db.type()}:${localName}, remote=${remoteDb.type()}:${remoteName})`);
      resolve({ db: db, remoteDb: remoteDb });
    });
  }
}
