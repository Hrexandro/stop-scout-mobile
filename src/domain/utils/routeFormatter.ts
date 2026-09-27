export function routeFormatter(
  route: number | string | null | undefined,
): string {
  if (route === null || route === undefined) {
    return "";
  }

  const value = String(route).trim();

  if (value === "") {
    return "";
  }

  // Uproszczona normalizacja identyfikatorów TRISTAR:
  // np. 10177 -> "177"
  if (/^10\d{3}$/.test(value)) {
    return String(Number(value.slice(2)));
  }

  return value;
}
