import type { IPasswordHasher } from "../../domain/repositories/IPasswordHasher";

import { hashPassword, verifyPassword } from "./passwordHasher";

export class BcryptPasswordHasher implements IPasswordHasher {
  async hash(password: string): Promise<string> {
    return hashPassword(password);
  }

  async verify(password: string, passwordHash: string): Promise<boolean> {
    return verifyPassword(password, passwordHash);
  }
}
