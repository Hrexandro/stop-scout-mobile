import type { IAuthRepository } from "../domain/repositories/IAuthRepository";
import type { IPasswordHasher } from "../domain/repositories/IPasswordHasher";

export class RegisterUserUseCase {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(
    username: string,
    password: string,
  ): Promise<{ id: number; username: string }> {
    const normalizedUsername = username.trim();

    if (!normalizedUsername || !password) {
      throw new Error("Nazwa użytkownika i hasło są wymagane.");
    }

    const existingUser =
      await this.authRepository.findUserByUsername(normalizedUsername);

    if (existingUser) {
      throw new Error("Użytkownik o tej nazwie już istnieje.");
    }

    const passwordHash = await this.passwordHasher.hash(password);

    const id = await this.authRepository.createUser(
      normalizedUsername,
      passwordHash,
    );

    return { id, username: normalizedUsername };
  }
}
