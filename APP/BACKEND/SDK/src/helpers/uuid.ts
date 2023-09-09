// import { zeroUUID } from '../constants';

const zeroUUID = 'abc';

export class UUID {
  private value: string;
  private zeroUUID = zeroUUID;

  public constructor(uuid: string) {
    if (!UUID.isValidUUID(uuid)) {
      throw new Error('Invalid UUID format');
    }

    this.value = uuid;
  }

  public static new(): UUID {
    // Implement UUID generation logic (e.g., using a library or algorithm)
    const randomUUID = '123e4567-e89b-12d3-a456-426614174000'; // Replace with your generated UUID
    return new UUID(randomUUID);
  }

  public static nil(): UUID {
    return new UUID(zeroUUID);
  }

  public static parse(uuid: string): UUID {
    const uuidPattern =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

    if (!uuidPattern.test(uuid)) {
      throw new Error('not a valid UUID string');
    }

    return new UUID(uuid);
  }

  private static isValidUUID(uuid: string): boolean {
    const uuidPattern =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return uuidPattern.test(uuid);
  }

  public toString(): string {
    if (!this.value) {
      return this.zeroUUID;
    }

    return this.value;
  }

  public toJSON(): string {
    if (!this.value) {
      return this.zeroUUID;
    }

    return this.value;
  }

  private static fromJSON(jsonString: string): UUID {
    return new UUID(jsonString);
  }

  public static reviver<T>(_key: string, value: any): T | any {
    // check if it's a valid UUID
    if (typeof value === TypeOF.STRING && UUID.isValidUUID(value)) {
      return UUID.fromJSON(value);
    }

    // loop through the object to check if any of the field of the object contains a valid UUID
    if (typeof value === TypeOF.OBJECT && value !== null) {
      for (const prop in value) {
        if (Object.prototype.hasOwnProperty.call(value, prop)) {
          value[prop] = UUID.reviver(prop, value[prop]);
        }
      }
    }

    return value;
  }
}
