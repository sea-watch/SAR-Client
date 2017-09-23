import { LocationType } from './location-type';

export interface Location {
  _id: string;
  longitude: number;
  latitude: number;
  heading: any;
  timestamp: number;
  itemId: string;
  type: LocationType;
  reportedBy?: string;

  /*constructor(longitude: number, latitude: number, heading: any, timestamp: number, itemId: string, type: LocationType, reporter?: string, id?: string) {
    this.longitude = longitude;
    this.latitude = latitude;
    this.heading = heading;
    this.timestamp = timestamp;
    this.itemId = itemId;
    this.type = type;
    this._id = id ? id : new Date().toISOString() + "-reportedBy-" + reporter ? reporter : 'anonymous';
  }*/
}
