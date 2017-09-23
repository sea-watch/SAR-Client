import { DBReplicationChange } from './db-tx';

export interface Listener {
  notify(change: DBReplicationChange): void;
}
