import { describe, expect, test } from 'bun:test';
import { decode, encrypt, isEnvelope, WrongKeyError } from './crypto';

describe('crypto', () => {
  test('round trip with the same passphrase', async () => {
    const { text, salt } = await encrypt('{"ciao":"Sushi Ya"}', 'lilla momo pachino');
    expect(text).not.toContain('Sushi');
    expect(isEnvelope(JSON.parse(text))).toBe(true);
    const out = await decode(text, 'lilla momo pachino');
    expect(out.plain).toBe('{"ciao":"Sushi Ya"}');
    expect(out.salt).toBe(salt);
  });

  test('a wrong passphrase is refused', async () => {
    const { text } = await encrypt('{}', 'giusta');
    await expect(decode(text, 'sbagliata')).rejects.toBeInstanceOf(WrongKeyError);
  });

  test('the salt of the file is kept across saves, so every device derives the same key', async () => {
    const first = await encrypt('{"a":1}', 'k');
    const second = await encrypt('{"a":2}', 'k', first.salt);
    expect(second.salt).toBe(first.salt);
    expect((await decode(second.text, 'k')).plain).toBe('{"a":2}');
  });

  test('a file saved before encryption is read as plain JSON', async () => {
    expect((await decode('{"version":1}', 'k')).plain).toBe('{"version":1}');
  });
});
