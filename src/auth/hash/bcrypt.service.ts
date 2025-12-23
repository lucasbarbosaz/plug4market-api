import { HashingServiceProtocol } from "./hashing.service";
import * as bcrypt from "bcryptjs";

export class BcryptService extends HashingServiceProtocol {
  constructor() {
    super();
  }

  async hash(password: string): Promise<string> {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  }
  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compareSync(password, hash);
  }
}