import QRCode from 'qrcode';

/**
 * Generate QR code as Data URL for a table
 * @param tablePath - Path for the table (restaurantId/tableNumber)
 * @returns QR code as Data URL string
 */
export async function generateTableQR(tablePath: string): Promise<string> {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const url = `${appUrl}/customer/${tablePath}`;

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
    console.error(`Failed to generate QR for table ${tablePath}:`, error);
    throw new Error(`QR generation failed: ${error}`);
  }
}

/**
 * Generate QR code as Buffer (for server-side operations)
 * @param tablePath - Path for the table (restaurantId/tableNumber)
 * @returns QR code as PNG buffer
 */
export async function generateTableQRBuffer(tablePath: string): Promise<Buffer> {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const url = `${appUrl}/customer/${tablePath}`;

    const qrCodeBuffer = await QRCode.toBuffer(url, {
      width: 300,
      margin: 2,
      type: 'png' as any,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    });

    return qrCodeBuffer;
  } catch (error) {
    console.error(`Failed to generate QR buffer for table ${tablePath}:`, error);
    throw new Error(`QR buffer generation failed: ${error}`);
  }
}

/**
 * Validate QR code can be generated for a table ID
 * @param tableId - Table ID to validate
 * @returns true if valid
 */
export function isValidTableId(tableId: string): boolean {
  // Table ID should be non-empty string
  return typeof tableId === 'string' && tableId.trim().length > 0;
}
