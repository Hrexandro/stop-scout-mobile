export interface ZtmDeparture {
  id: string;
  routeId: number;
  routeShortName?: string;
  headsign: string;
  estimatedTime: string;
  theoreticalTime: string;
  delayInSeconds: number | null;
  status: "REALTIME" | "SCHEDULED";
}

export async function fetchDeparturesFromApi(
  stopId: number,
): Promise<ZtmDeparture[]> {
  if (!Number.isInteger(stopId) || stopId <= 0) {
    throw new Error("Nieprawidłowy identyfikator przystanku.");
  }

  const url = `https://ckan2.multimediagdansk.pl/departures?stopId=${stopId}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Błąd API ZTM: ${response.status}`);
  }

  const data: unknown = await response.json();

  if (
    typeof data !== "object" ||
    data === null ||
    !("departures" in data) ||
    !Array.isArray(data.departures)
  ) {
    throw new Error("Nieprawidłowa struktura odjazdów ZTM.");
  }

  return data.departures as ZtmDeparture[];
}
