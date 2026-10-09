import crypto from "crypto";

export const TABLE_CODE_LENGTH = 12;

const TABLE_CODE_ALPHABET =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"; // no 0/O/1/l/I

/**
 * Generate a short, opaque, URL-safe table code.
 *
 * The QR code embeds this code instead of a plain restaurantId/tableNumber (or a
 * long JWT), so customer URLs stay short (e.g. /customer/aB3xYz9QmNw2) while still
 * being unpredictable — a customer cannot order for another table simply by
 * editing the URL. The code is stored on the Table and resolved server-side.
 */
export function generateTableCode(length = TABLE_CODE_LENGTH): string {
  const bytes = crypto.randomBytes(length);
  let code = "";
  for (let i = 0; i < length; i++) {
    code += TABLE_CODE_ALPHABET[bytes[i] % TABLE_CODE_ALPHABET.length];
  }
  return code;
}
