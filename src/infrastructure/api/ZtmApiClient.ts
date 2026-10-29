import type { Stop } from "../../domain/entities/Stop";

const STOPS_URL =
  "https://ckan.multimediagdansk.pl/dataset/c24aa637-3619-4dc2-a171-a23eec8f2172/resource/4c4025f0-01bf-41f7-a39f-d156d201b82b/download/stops.json";

interface ApiStop {
  stopId: number;
  stopName?: string | null;
  stopDesc?: string | null;
  subName?: string | number | null;
  stopLat: number;
  stopLon: number;
}

interface ApiStopsForDate {
  lastUpdate: string;
  stops: ApiStop[];
}

export async function fetchStopsFromApi(): Promise<Stop[]> {
  const response = await fetch(STOPS_URL);

  if (!response.ok) {
    throw new Error(`Błąd API ZTM: ${response.status}`);
  }

  const data: Record<string, ApiStopsForDate> = await response.json();

  // Wybieramy ostatnią dostępną datę.
  const dates = Object.keys(data)
    .filter((key) => /^\d{4}-\d{2}-\d{2}$/.test(key))
    .sort();

  const dateParts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const getPart = (type: string) =>
    dateParts.find((part) => part.type === type)?.value ?? "";

  const today = `${getPart("year")}-${getPart("month")}-${getPart("day")}`;

  const selectedDate =
    [...dates].reverse().find((date) => date <= today) ?? dates[0];

  if (!selectedDate) {
    throw new Error("Brak danych przystanków w API ZTM.");
  }

  const apiStops = data[selectedDate].stops;

  console.log(
    `Wybrano dane ZTM z ${selectedDate}: ${apiStops.length} przystanków`,
  );

  // Zamieniamy dane z API na naszą encję Stop.
  return apiStops.flatMap((stop): Stop[] => {
    const name = (stop.stopName ?? stop.stopDesc ?? "").trim();

    if (
      !Number.isInteger(stop.stopId) ||
      !name ||
      !Number.isFinite(stop.stopLat) ||
      !Number.isFinite(stop.stopLon)
    ) {
      return [];
    }

    return [
      {
        stopId: stop.stopId,
        name,
        subName: stop.subName == null ? undefined : String(stop.subName),
        lat: stop.stopLat,
        lon: stop.stopLon,
      },
    ];
  });
}
