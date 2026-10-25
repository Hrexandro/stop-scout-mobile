import type { User } from "../entities/User";

export interface IAuthRepository {
  createUser(
    username: string,
    passwordHash: string,
  ): Promise<number>;

  findUserByUsername(
    username: string,
  ): Promise<User | null>;
}