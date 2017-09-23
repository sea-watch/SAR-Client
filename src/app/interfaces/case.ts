import { Location } from './location';
import { Status } from './status';
import { BoatType } from './boat-type';
import { BoatCondition } from './boat-condition';

export interface Case {
  _id: string;
  location: Location;
  state: Status;
  boatType: BoatType;
  boatCondition: BoatCondition;
  engineWorking: boolean;
  peopleCount: number;
  womenCount: number;
  childrenCount: number;
  disabledCount: number;
  createdAt: string;
  lastUpdate: string;
  osc: string;
  addtitionalInformations: string;
  otherBoatsInvolved: string;
  reportedBy?: string;
  boatAfterInterception: string;
  sarAuthority: string;
  dateOfFirstIndication: string;
  positionOfFirstIndication: string;
  dateOfTranshipment: string;
  positionOfTranshipment: string;
  incidentDescription: string;
  reportStatus: string;
}
