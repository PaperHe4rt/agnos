const ID_ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789"; // no l/o/0/1
const ID_LENGTH = 8;

/* Session ids live in the intake URL, so they are short enough to read off one screen and type into another. */
export function newSessionId(): string {
  const bytes = new Uint8Array(ID_LENGTH);
  crypto.getRandomValues(bytes);

  let id = "";
  for (const byte of bytes) {
    id += ID_ALPHABET[byte % ID_ALPHABET.length];
  }
  return id;
}
