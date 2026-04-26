/**
 * AES-256-GCM encryption/decryption for OAuth token storage.
 * Uses Web Crypto API (available in Cloudflare Workers).
 */

import type { EncryptedToken } from '@instack/shared';

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function importKey(keyHex: string): Promise<CryptoKey> {
  const rawKey = hexToBytes(keyHex);
  return crypto.subtle.importKey('raw', rawKey, { name: 'AES-GCM' }, false, [
    'encrypt',
    'decrypt',
  ]);
}

/** Encrypt a plaintext string using AES-256-GCM with a unique IV */
export async function encrypt(plaintext: string, keyHex: string): Promise<EncryptedToken> {
  const key = await importKey(keyHex);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);

  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);

  const ciphertextBytes = new Uint8Array(encrypted);
  // AES-GCM appends a 16-byte tag at the end
  const ciphertext = ciphertextBytes.slice(0, -16);
  const tag = ciphertextBytes.slice(-16);

  return {
    ciphertext: bytesToHex(ciphertext),
    iv: bytesToHex(iv),
    tag: bytesToHex(tag),
  };
}

/** Decrypt an AES-256-GCM encrypted token */
export async function decrypt(token: EncryptedToken, keyHex: string): Promise<string> {
  const key = await importKey(keyHex);
  const iv = hexToBytes(token.iv);
  const ciphertext = hexToBytes(token.ciphertext);
  const tag = hexToBytes(token.tag);

  // Reconstruct the full ciphertext+tag buffer that AES-GCM expects
  const combined = new Uint8Array(ciphertext.length + tag.length);
  combined.set(ciphertext);
  combined.set(tag, ciphertext.length);

  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, combined);

  return new TextDecoder().decode(decrypted);
}
