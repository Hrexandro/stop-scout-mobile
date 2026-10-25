import type { IAuthRepository } from "../domain/repositories/IAuthRepository";
import type { IPasswordHasher } from "../domain/repositories/IPasswordHasher";

import { SqliteAuthRepository } from "../infrastructure/storage/SqliteAuthRepository";
import { BcryptPasswordHasher } from "../infrastructure/security/BcryptPasswordHasher";
import { RegisterUserUseCase } from "../use-cases/RegisterUserUseCase";
import { LoginUserUseCase } from "../use-cases/LoginUserUseCase";
let authRepositoryInstance: IAuthRepository | null = null;
let passwordHasherInstance: IPasswordHasher | null = null;
let registerUserUseCaseInstance: RegisterUserUseCase | null = null;
let loginUserUseCaseInstance: LoginUserUseCase | null = null;

export const container = {
  get authRepository(): IAuthRepository {
    if (!authRepositoryInstance) {
      authRepositoryInstance = new SqliteAuthRepository();
    }

    return authRepositoryInstance;
  },

  get passwordHasher(): IPasswordHasher {
    if (!passwordHasherInstance) {
      passwordHasherInstance = new BcryptPasswordHasher();
    }

    return passwordHasherInstance;
  },

  get registerUserUseCase(): RegisterUserUseCase {
    if (!registerUserUseCaseInstance) {
      registerUserUseCaseInstance = new RegisterUserUseCase(
        this.authRepository,
        this.passwordHasher,
      );
    }

    return registerUserUseCaseInstance;
  },
  get loginUserUseCase(): LoginUserUseCase {
    if (!loginUserUseCaseInstance) {
      loginUserUseCaseInstance = new LoginUserUseCase(
        this.authRepository,
        this.passwordHasher,
      );
    }

    return loginUserUseCaseInstance;
  },
};
