import { createCipheriv, randomBytes, scrypt, createDecipheriv } from 'crypto';
import { promisify } from 'util';

import { hash, genSalt, compare } from 'bcrypt';

import { CYPHER_ALGORITHM } from '@constants';

export class Hasher {
  public constructor(private readonly round: number) {}

  private async salter(): Promise<string> {
    const salt = await genSalt(this.round);
    return salt;
  }

  public async hash(value: string): Promise<string> {
    const salt = await this.salter();
    const hashed = await hash(value, salt);

    return hashed;
  }

  public static async compare(
    password: string,
    hashed: string,
  ): Promise<boolean> {
    const isValid = await compare(password, hashed);
    return isValid;
  }
}

export class Encoder {
  public constructor(
    private readonly password: string,
    private readonly round: number,
  ) {}

  private getRandomIV(): Buffer {
    return randomBytes(16);
  }

  private async salter(): Promise<string> {
    const salt = await genSalt(this.round);
    return salt;
  }

  private async getKey(): Promise<Buffer> {
    const salt = await this.salter();

    const key = (await promisify(scrypt)(this.password, salt, 32)) as Buffer;

    return key;
  }

  public async encode(text: any): Promise<string> {
    const iv = this.getRandomIV();
    const key = await this.getKey();

    const cipher = createCipheriv(CYPHER_ALGORITHM, key, iv);

    const encryptedText = Buffer.concat([cipher.update(text), cipher.final()]);

    return encryptedText.toString();
  }

  public async decode(encryptedString: string): Promise<string> {
    const iv = this.getRandomIV();
    const key = await this.getKey();

    const decipher = createDecipheriv(CYPHER_ALGORITHM, key, iv);

    const decryptedText = Buffer.concat([
      decipher.update(encryptedString, 'ascii'),
      decipher.final(),
    ]);

    return decryptedText.toString();
  }
}
