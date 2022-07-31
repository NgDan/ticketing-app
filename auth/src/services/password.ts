import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

// this allows us to make scrypt async
const scryptAsync = promisify(scrypt);

export class Password {
  static async toHash(password: string) {
    const salt = randomBytes(8).toString('hex');
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;

    // we concatinate the salt at the end of the hash(pass+salt) just to keep the salt
    // in the same place since we need it to generate the hash again when we
    // compare the password the user has supplied.
    // We could store it separately, as long as it's unique for every user, so
    // it thraws the rainbow tables
    // Some people even use the user id as a salt to save a few bites
    return `${buf.toString('hex')}.${salt}`;
  }

  static async compare(storedPassword: string, suppliedPassword: string) {
    const [hashedPassword, salt] = storedPassword.split('.');

    const buf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;

    return buf.toString('hex') === hashedPassword;
  }
}
