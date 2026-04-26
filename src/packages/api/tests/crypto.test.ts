import { describe, it, expect } from 'vitest';
import { encrypt, decrypt } from '../src/lib/crypto';

// 32-byte hex key (64 hex chars = 32 bytes)
const KEY = 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2';

describe('AES-256-GCM encryption', () => {
  it('encrypts and decrypts a token roundtrip', async () => {
    const plaintext = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6InRlc3QifQ';

    const encrypted = await encrypt(plaintext, KEY);
    expect(encrypted.ciphertext).toBeTruthy();
    expect(encrypted.iv).toBeTruthy();
    expect(encrypted.tag).toBeTruthy();

    // IV should be 12 bytes = 24 hex chars
    expect(encrypted.iv).toHaveLength(24);

    const decrypted = await decrypt(encrypted, KEY);
    expect(decrypted).toBe(plaintext);
  });

  it('produces different ciphertexts for same plaintext (unique IV)', async () => {
    const plaintext = 'same-token-value';

    const encrypted1 = await encrypt(plaintext, KEY);
    const encrypted2 = await encrypt(plaintext, KEY);

    expect(encrypted1.iv).not.toBe(encrypted2.iv);
    expect(encrypted1.ciphertext).not.toBe(encrypted2.ciphertext);

    // Both should decrypt to the same value
    expect(await decrypt(encrypted1, KEY)).toBe(plaintext);
    expect(await decrypt(encrypted2, KEY)).toBe(plaintext);
  });

  it('fails to decrypt with wrong key', async () => {
    const encrypted = await encrypt('secret', KEY);
    const wrongKey = 'b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2';

    await expect(decrypt(encrypted, wrongKey)).rejects.toThrow();
  });

  it('token never appears in encrypted output', async () => {
    const token = 'my-secret-oauth-token-12345';
    const encrypted = await encrypt(token, KEY);

    // Verify the token string is not present anywhere in the output
    expect(encrypted.ciphertext).not.toContain(token);
    expect(encrypted.iv).not.toContain(token);
    expect(encrypted.tag).not.toContain(token);
  });
});
