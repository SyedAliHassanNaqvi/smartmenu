import QRCode from 'qrcode';

/**
 * Build the customer-facing URL for a table code.
 * The code is a short, random, opaque identifier stored on the table, so
 * customers cannot order for another table just by editing the URL.
 */
export function buildTableUrl(tableCode: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${appUrl}/customer/${tableCode}`;
}

/**
 * Generate QR code as Data URL for a table
 * @param tableCode - Opaque table code to encode in the QR
 * @returns QR code as Data URL string
 */
export async function generateTableQR(tableCode: string): Promise<string> {
  try {
    const url = buildTableUrl(tableCode);

    const qrCodeUrl = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H', // High error correction
    });

    return qrCodeUrl;
  } catch (error) {
    console.error(`Failed to generate QR for table ${tableCode}:`, error);
    throw new Error(`QR generation failed: ${error}`);
  }
}

/**
 * Generate QR code as Buffer (for server-side operations)
 * @param tableCode - Opaque table code to encode in the QR
 * @returns QR code as PNG buffer
 */
export async function generateTableQRBuffer(tableCode: string): Promise<Buffer> {
  try {
    const url = buildTableUrl(tableCode);

    const qrCodeBuffer = await QRCode.toBuffer(url, {
      width: 300,
      margin: 2,
      type: 'png',
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    });

    return qrCodeBuffer;
  } catch (error) {
    console.error(`Failed to generate QR buffer for table ${tableCode}:`, error);
    throw new Error(`QR buffer generation failed: ${error}`);
  }
}
