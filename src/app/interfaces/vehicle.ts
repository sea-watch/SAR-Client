export interface Vehicle {
  _id: string;
  title: string;
  tracking_type: string;
  sat_number: string;
  public: boolean;
  api_key: string;
  marker_color: string;
  location_alarm_enabled: boolean;
  location_alarm_recipents: string;
  logo_id: string;
  speed_over_ground: number;
  MMSI: number;
}
