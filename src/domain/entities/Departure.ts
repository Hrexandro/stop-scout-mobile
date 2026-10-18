export interface Departure {
  id: string;
  routeId: number;
  routeShortName?: string;
  headsign: string;
  estimatedTime?: string | null;
  theoreticalTime?: string | null;
  delayInSeconds: number | null;
}
