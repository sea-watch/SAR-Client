export class DBTxActions {
  static readonly DB_INIT = 'db:init';
  static readonly DB_CLEAR_ALL = 'db:clear:all';

  static readonly LOCATIONS_GET = 'locations:get';
  static readonly LOCATIONS_STORE = 'locations:store';
  static readonly LOCATIONS_FIND_ITEM = 'locations:find-item';

  static readonly CASES_ALL = 'cases:all';
  static readonly CASES_GET = 'cases:get';
  static readonly CASES_FIND = 'cases:find';
  static readonly CASES_STORE = 'cases:store';

  static readonly VEHICLES_ALL = 'vehicles:all';

  static readonly MESSAGES_ALL = 'messages:all';
  static readonly MESSAGES_FIND = 'messages:find';
  static readonly MESSAGES_STORE = 'messages:store';

  static readonly VERSIONS_ALL = 'versions:all';

  static readonly SESSION_LOGIN = 'session:login';
  static readonly SESSION_GET = 'session:get';
}

export interface DBTxRequestMessage {
  txid: string;
  action: string;
  args: DBTxRequestArgs;
}

export interface DBTxReplyMessage {
  type: string;
  txid: string;
  action: string;
  payload: any;
  error: any;
}

export type DBTxCallback = (msg: DBTxReplyMessage) => void;

export interface DBTxRequestArgs {
  [name: string]: any;
}

export interface DBReplicationChange {
  docs: Array<any>;
  errors: Array<any>;
  docs_read: number;
  docs_written: number;
}
