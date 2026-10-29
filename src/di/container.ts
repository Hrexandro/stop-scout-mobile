import type { IAuthRepository } from "../domain/repositories/IAuthRepository";
import type { IPasswordHasher } from "../domain/repositories/IPasswordHasher";
import { GetStopByIdUseCase } from "../use-cases/GetStopByIdUseCase";
import { SqliteAuthRepository } from "../infrastructure/storage/SqliteAuthRepository";
import { BcryptPasswordHasher } from "../infrastructure/security/BcryptPasswordHasher";
import { RegisterUserUseCase } from "../use-cases/RegisterUserUseCase";
import { LoginUserUseCase } from "../use-cases/LoginUserUseCase";
import { GetStopsInBoundsUseCase } from "../use-cases/GetStopsInBoundsUseCase";
import type { ILocationService } from "../domain/repositories/ILocationService";
import { ExpoLocationService } from "../infrastructure/location/ExpoLocationService";
import { GetCurrentLocationUseCase } from "../use-cases/GetCurrentLocationUseCase";
import type { IStopRepository } from "../domain/repositories/IStopRepository";
import { SqliteStopRepository } from "../infrastructure/storage/SqliteStopRepository";
import type { IDeparturesRepository } from "../domain/repositories/IDeparturesRepository";
import { ZtmDeparturesRepository } from "../infrastructure/api/ZtmDeparturesRepository";
import { GetLiveDeparturesUseCase } from "../use-cases/GetLiveDeparturesUseCase";
import { SearchStopsUseCase } from "../use-cases/SearchStopsUseCase";
let authRepositoryInstance: IAuthRepository | null = null;
let stopRepositoryInstance: IStopRepository | null = null;
let passwordHasherInstance: IPasswordHasher | null = null;
let registerUserUseCaseInstance: RegisterUserUseCase | null = null;
let loginUserUseCaseInstance: LoginUserUseCase | null = null;
let getStopsInBoundsUseCaseInstance: GetStopsInBoundsUseCase | null = null;
let locationServiceInstance: ILocationService | null = null;
let getStopByIdUseCaseInstance: GetStopByIdUseCase | null = null;
let getCurrentLocationUseCaseInstance: GetCurrentLocationUseCase | null = null;
let departuresRepositoryInstance: IDeparturesRepository | null = null;
let getLiveDeparturesUseCaseInstance: GetLiveDeparturesUseCase | null = null;
let searchStopsUseCaseInstance: SearchStopsUseCase | null = null;
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

  get locationService(): ILocationService {
    if (!locationServiceInstance) {
      locationServiceInstance = new ExpoLocationService();
    }

    return locationServiceInstance;
  },

  get getCurrentLocationUseCase(): GetCurrentLocationUseCase {
    if (!getCurrentLocationUseCaseInstance) {
      getCurrentLocationUseCaseInstance = new GetCurrentLocationUseCase(
        this.locationService,
      );
    }

    return getCurrentLocationUseCaseInstance;
  },
  get stopRepository(): IStopRepository {
    if (!stopRepositoryInstance) {
      stopRepositoryInstance = new SqliteStopRepository();
    }

    return stopRepositoryInstance;
  },
  get getStopsInBoundsUseCase(): GetStopsInBoundsUseCase {
    if (!getStopsInBoundsUseCaseInstance) {
      getStopsInBoundsUseCaseInstance = new GetStopsInBoundsUseCase(
        this.stopRepository,
      );
    }

    return getStopsInBoundsUseCaseInstance;
  },
  get getStopByIdUseCase(): GetStopByIdUseCase {
    if (!getStopByIdUseCaseInstance) {
      getStopByIdUseCaseInstance = new GetStopByIdUseCase(this.stopRepository);
    }

    return getStopByIdUseCaseInstance;
  },
  get departuresRepository(): IDeparturesRepository {
    if (!departuresRepositoryInstance) {
      departuresRepositoryInstance = new ZtmDeparturesRepository();
    }

    return departuresRepositoryInstance;
  },

  get getLiveDeparturesUseCase(): GetLiveDeparturesUseCase {
    if (!getLiveDeparturesUseCaseInstance) {
      getLiveDeparturesUseCaseInstance = new GetLiveDeparturesUseCase(
        this.departuresRepository,
      );
    }

    return getLiveDeparturesUseCaseInstance;
  },
  get searchStopsUseCase(): SearchStopsUseCase {
    if (!searchStopsUseCaseInstance) {
      searchStopsUseCaseInstance = new SearchStopsUseCase(this.stopRepository);
    }

    return searchStopsUseCaseInstance;
  },
};
