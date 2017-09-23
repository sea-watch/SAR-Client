class Session {
  constructor(remoteName) {
    this.db = new PouchDB(remoteName, { skip_setup: true });
  }

  login(args, reply, error) {
    this.db.login(args.username, args.password, (err, response) => {
      if (err) {
        console.log('Error logging into database:', this.db.name || this.db.db_name, err);
        error(err);
      } else {
        console.log('Successfully logged into database:', this.db.name || this.db.db_name);
        reply(response);
      }
    });
  }

  getSession(reply, error) {
    this.db.getSession((err, response) => {
      if (err) {
        console.log('Error getting database session info', err);
        error(err);
      } else {
        reply(response);
      }
    });
  }
}
