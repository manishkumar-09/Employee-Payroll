import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordService {
  private readonly saltRounds = 10;
  async hashPassword(passoword: string): Promise<string> {
    return await bcrypt.hash(passoword, this.saltRounds);
  }

  async validatePassword(passoword: string, inputPassword: string) {
    return await bcrypt.compare(passoword, inputPassword);
  }
}
