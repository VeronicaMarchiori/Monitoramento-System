import { useState } from 'react';
import { QrCode, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface QrScannerProps {
  onScan: (data: string) => void;
}

export function QrScanner({ onScan }: QrScannerProps) {
  const [manualCode, setManualCode] = useState('');
  const [scanned, setScanned] = useState(false);

  const handleManualInput = () => {
    if (manualCode.trim()) {
      setScanned(true);
      setTimeout(() => {
        onScan(manualCode);
      }, 500);
    }
  };

  return (
    <div className="space-y-4">
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        {scanned ? (
          <div className="text-center">
            <CheckCircle className="size-16 text-green-600 mx-auto mb-4" />
            <p className="text-green-600">QR Code Verificado!</p>
          </div>
        ) : (
          <div className="text-center text-gray-400">
            <QrCode className="size-16 mx-auto mb-4" />
            <p>Câmera do QR Code</p>
            <p className="text-sm">(Simulação)</p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-sm text-gray-600">Ou digite o código manualmente:</p>
        <div className="flex gap-2">
          <Input
            placeholder="Digite o código do QR"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            disabled={scanned}
          />
          <Button onClick={handleManualInput} disabled={scanned || !manualCode.trim()}>
            Confirmar
          </Button>
        </div>
      </div>
    </div>
  );
}
