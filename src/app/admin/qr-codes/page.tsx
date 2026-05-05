'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/use-auth-store';

interface QRCodeData {
  tableId: string;
  tableNumber: number;
  capacity: number;
  status: string;
  url: string;
  qrCode: string;
  generatedAt: string;
}

export default function QRCodesPage() {
  const { token } = useAuthStore();
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch all QR codes from database
  const fetchQRCodes = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/qr/codes', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch QR codes');
      const data = await response.json();
      setQrCodes(data);
    } catch (err: any) {
      console.error('Error fetching QR codes:', err);
      setError(err.message || 'Failed to load QR codes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQRCodes();
  }, [token]);

  // Generate QR code for a specific table
  const generateQRForTable = async (tableId: string) => {
    if (!token) return;

    try {
      setGenerating(prev => new Set(prev).add(tableId));
      setError('');
      
      const response = await fetch('/api/qr/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ tableId }),
      });

      if (!response.ok) throw new Error('Failed to generate QR code');
      
      setSuccess('QR code generated successfully');
      await fetchQRCodes();
    } catch (err: any) {
      console.error('Error generating QR:', err);
      setError(err.message || 'Failed to generate QR code');
    } finally {
      setGenerating(prev => {
        const newSet = new Set(prev);
        newSet.delete(tableId);
        return newSet;
      });
    }
  };

  // Generate QR codes for all tables
  const generateAllQRCodes = async () => {
    for (const qrCode of qrCodes) {
      if (!qrCode.qrCode) {
        await generateQRForTable(qrCode.tableId);
      }
    }
    setSuccess('All QR codes generated successfully');
  };

  const downloadQRCode = (qrCode: string, tableNumber: number) => {
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `table-${tableNumber}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printQRCode = (qrCode: string, tableNumber: number) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Table ${tableNumber} QR Code</title>
          <style>
            body { margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; }
            img { max-width: 100%; max-height: 100%; }
          </style>
        </head>
        <body>
          <img src="${qrCode}" alt="Table ${tableNumber} QR Code" />
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-blue-100 text-blue-800';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800';
      case 'maintenance':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">QR Code Management</h1>
          <p className="text-gray-600 mt-2">Generate and manage QR codes for your tables</p>
        </div>
        <Button 
          onClick={generateAllQRCodes}
          disabled={loading || generating.size > 0}
        >
          Generate All QR Codes
        </Button>
      </div>

      {/* Messages */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800">{success}</p>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {qrCodes.length === 0 ? (
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <p className="text-gray-600">No tables found. Please make sure your tables are set up in the restaurant admin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {qrCodes.map((item) => (
            <Card key={item.tableId} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Table {item.tableNumber}</h2>
                  <p className="text-sm text-gray-500">Capacity: {item.capacity}</p>
                </div>
                <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
              </div>

              {item.url ? (
                <>
                  <div className="mb-4 flex justify-center bg-gray-50 p-4 rounded">
                    <img
                      src={item.qrCode}
                      alt={`Table ${item.tableNumber} QR Code`}
                      className="w-48 h-48"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mb-4 break-all">{item.url}</p>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadQRCode(item.qrCode, item.tableNumber)}
                      className="w-full text-white"
                    >
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => printQRCode(item.qrCode, item.tableNumber)}
                      className="w-full text-white"
                    >
                      Print
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => generateQRForTable(item.tableId)}
                      disabled={generating.has(item.tableId)}
                      className="w-full text-white"
                    >
                      {generating.has(item.tableId) ? 'Updating...' : 'Regenerate'}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4 flex items-center justify-center bg-gray-100 p-12 rounded h-48">
                    <p className="text-gray-500">QR not generated yet</p>
                  </div>
                  <Button
                    onClick={() => generateQRForTable(item.tableId)}
                    disabled={generating.has(item.tableId)}
                    size="sm"
                    className="w-full"
                  >
                    {generating.has(item.tableId) ? 'Generating...' : 'Generate QR'}
                  </Button>
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
