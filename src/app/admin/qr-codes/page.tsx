'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Table {
  _id: string;
  number: number;
  occupancy?: number;
}

interface QRData {
  tableId: string;
  qrCode: string;
  url: string;
  generatedAt: string;
}

export default function QRCodesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [qrCodes, setQrCodes] = useState<Map<string, QRData>>(new Map());
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedTables, setSelectedTables] = useState<Set<string>>(new Set());

  // Fetch all tables
  useEffect(() => {
    console.log('QR Codes page mounted, starting table fetch...');
    const fetchTables = async () => {
      try {
        console.log('Attempting to fetch tables from /api/tables');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.log('Fetch timeout triggered (5s) - aborting request');
          controller.abort();
        }, 5000); // Reduced to 5 second timeout for faster UX
        
        const response = await fetch('/api/tables', {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        console.log('Fetch response received:', response.status);
        
        if (!response.ok) throw new Error('Failed to fetch tables');
        const data = await response.json();
        console.log('Tables data received:', data);
        setTables(data);
      } catch (error) {
        console.error('Error fetching tables:', error);
        console.log('Using mock data as fallback');
        // Mock data for testing
        setTables([
          { _id: '1', number: 1 },
          { _id: '2', number: 2 },
          { _id: '3', number: 3 },
          { _id: '4', number: 4 },
          { _id: '5', number: 5 },
          { _id: '6', number: 6 },
        ]);
      } finally {
        console.log('Setting loading to false');
        setLoading(false);
      }
    };

    fetchTables();
  }, []);

  // Generate QR for a single table
  const generateQRForTable = async (tableId: string) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log(`QR generation timeout for table ${tableId} - aborting`);
        controller.abort();
      }, 10000); // 10 second timeout for QR generation
      
      const response = await fetch('/api/qr/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error('Failed to generate QR');
      const data = await response.json();
      
      setQrCodes(prev => new Map(prev).set(tableId, data));
    } catch (error) {
      console.error(`Error generating QR for table ${tableId}:`, error);
      alert(`Failed to generate QR for table ${tableId}`);
    }
  };

  // Generate QR codes for all selected tables
  const generateAllQRs = async () => {
    setGenerating(true);
    const tablesToGenerate = tables.map(t => t._id);
    
    for (const tableId of tablesToGenerate) {
      await generateQRForTable(tableId);
    }
    
    setGenerating(false);
  };

  // Download QR code
  const downloadQR = (qrData: QRData) => {
    const link = document.createElement('a');
    link.href = qrData.qrCode;
    link.download = `table-${qrData.tableId}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print QR codes
  const printQRs = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Failed to open print window');
      return;
    }

    const qrArray = Array.from(qrCodes.values());
    let html = `
      <html>
        <head>
          <title>SmartMenu - Table QR Codes</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .page-break { page-break-before: always; }
            .qr-item {
              display: inline-block;
              text-align: center;
              margin: 20px;
              border: 1px solid #ddd;
              padding: 15px;
              border-radius: 8px;
              break-inside: avoid;
              page-break-inside: avoid;
            }
            .qr-item img { max-width: 300px; margin: 10px 0; }
            .qr-item h3 { margin: 10px 0; font-size: 18px; }
            .qr-item p { margin: 5px 0; font-size: 12px; color: #666; }
            .grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
            }
          </style>
        </head>
        <body>
          <h1>SmartMenu - Table QR Codes</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <div class="grid">
    `;

    qrArray.forEach((qr, index) => {
      html += `
        <div class="qr-item">
          <h3>Table ${qr.tableId}</h3>
          <img src="${qr.qrCode}" alt="Table ${qr.tableId} QR Code" />
          <p>Scan to access menu</p>
          <p style="font-size: 10px; color: #999;">${qr.url}</p>
        </div>
      `;
    });

    html += `
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p>Loading tables...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Table QR Codes</h1>
        <p className="text-gray-600">Generate and manage QR codes for all tables</p>
      </div>

      {/* Control Buttons */}
      <div className="mb-6 flex gap-3">
        <Button
          onClick={generateAllQRs}
          disabled={generating || tables.length === 0}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {generating ? 'Generating...' : 'Generate All QRs'}
        </Button>
        <Button
          onClick={printQRs}
          disabled={qrCodes.size === 0}
          variant="outline"
        >
          Print All ({qrCodes.size})
        </Button>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables.map(table => {
          const qrData = qrCodes.get(table._id);

          return (
            <Card key={table._id} className="p-6">
              <h2 className="text-xl font-bold mb-4">Table {table.number}</h2>

              {qrData ? (
                <>
                  <div className="mb-4 flex justify-center bg-gray-50 p-4 rounded">
                    <img
                      src={qrData.qrCode}
                      alt={`Table ${table.number} QR Code`}
                      className="w-48 h-48"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mb-4 break-all">
                    {qrData.url}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => downloadQR(qrData)}
                      size="sm"
                      variant="outline"
                      className="flex-1"
                    >
                      Download
                    </Button>
                    <Button
                      onClick={() => generateQRForTable(table._id)}
                      size="sm"
                      variant="outline"
                      className="flex-1"
                    >
                      Regenerate
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4 flex items-center justify-center bg-gray-100 p-12 rounded h-48">
                    <p className="text-gray-500">QR not generated</p>
                  </div>
                  <Button
                    onClick={() => generateQRForTable(table._id)}
                    disabled={generating}
                    size="sm"
                    className="w-full"
                  >
                    Generate QR
                  </Button>
                </>
              )}
            </Card>
          );
        })}
      </div>

      {tables.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-gray-600">No tables found. Please create tables first.</p>
        </Card>
      )}
    </div>
  );
}
