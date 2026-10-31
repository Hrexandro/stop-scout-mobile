import type { Stop } from "./Stop";

export interface FavoriteStop extends Stop {
  notes: string | null;
}
