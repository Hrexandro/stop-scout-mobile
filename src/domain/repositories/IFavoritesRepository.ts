import type { FavoriteStop } from "../entities/FavoriteStop";

export interface IFavoritesRepository {
  getUserFavorites(userId: number): Promise<FavoriteStop[]>;

  addFavorite(userId: number, stopId: number): Promise<void>;

  removeFavorite(userId: number, stopId: number): Promise<void>;

  updateFavoriteNote(
    userId: number,
    stopId: number,
    note: string,
  ): Promise<void>;
}
