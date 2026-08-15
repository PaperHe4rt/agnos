const ID_ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";
const ID_LENGTH = 8;

export function newSessionId(): string {
  const bytes = new Uint8Array(ID_LENGTH);
  crypto.getRandomValues(bytes);

  let id = "";
  for (const byte of bytes) {
    id += ID_ALPHABET[byte % ID_ALPHABET.length];
  }
  return id;
}
