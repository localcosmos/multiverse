export type SimpleGeolocationCoordinates = {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  heading: number | null;
  speed: number | null;
  altitudeAccuracy: number | null;
};

export type SimpleGeolocationPosition = {
  readonly coords: SimpleGeolocationCoordinates;
  readonly timestamp: EpochTimeStamp;
};

export interface GeonameResult {
  name: string;
  country: string;
  adminName1?: string;
  adminName2?: string;
  lat: string;
  lng: string;
  [key: string]: any; // for any extra fields you might use
}