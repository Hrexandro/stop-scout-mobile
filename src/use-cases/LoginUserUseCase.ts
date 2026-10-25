import type { IAuthRepository } from "../domain/repositories/IAuthRepository";
import type { IPasswordHasher } from "../domain/repositories/IPasswordHasher";

export class LoginUserUseCase {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(
    username: string,
    password: string,
  ): Promise<{ id: number; username: string }> {
    const normalizedUsername = username.trim();

    const user =
      await this.authRepository.findUserByUsername(normalizedUsername);

    if (!user) {
      throw new Error("Nieprawidłowa nazwa użytkownika lub hasło.");
    }

    const isPasswordCorrect = await this.passwordHasher.verify(
      password,
      user.passwordHash,
    );

    if (!isPasswordCorrect) {
      throw new Error("Nieprawidłowa nazwa użytkownika lub hasło.");
    }

    return {
      id: user.id,
      username: user.username,
    };
  }
}
