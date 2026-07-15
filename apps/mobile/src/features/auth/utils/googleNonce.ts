export interface GoogleNonce {
  raw: string;
  sha256: string;
}

interface SecureBrowserCrypto {
  getRandomValues<T extends Uint8Array>(values: T): T;
  subtle: {
    digest(algorithm: "SHA-256", data: Uint8Array): Promise<ArrayBuffer>;
  };
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
}

export async function createGoogleNonce(): Promise<GoogleNonce> {
  const secureCrypto = (globalThis as unknown as { crypto?: SecureBrowserCrypto }).crypto;
  if (!secureCrypto?.getRandomValues || !secureCrypto.subtle)
    throw new Error("Secure Google sign-in is not supported by this browser");

  const randomBytes = secureCrypto.getRandomValues(new Uint8Array(32));
  const raw = bytesToHex(randomBytes);
  const encodedRaw = Uint8Array.from(raw, (character) => character.charCodeAt(0));
  const digest = await secureCrypto.subtle.digest("SHA-256", encodedRaw);
  return { raw, sha256: bytesToHex(new Uint8Array(digest)) };
}
