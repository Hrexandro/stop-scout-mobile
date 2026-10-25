export interface IPasswordHasher {
  hash(password: string): Promise<string>;

  verify(password: string, passwordHash: string): Promise<boolean>;
}
