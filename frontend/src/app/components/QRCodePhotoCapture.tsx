import { useState, useRef, useEffect } from 'react';
import { Camera, X, Check, RotateCw } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface QRCodePhotoCaptureProps {
  onCapture: (photoData: string) => void;
  onCancel: () => void;
}

export function QRCodePhotoCapture({ onCapture, onCancel }: QRCodePhotoCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const startCamera = async () => {
    try {
      setError(null);
      
      // Parar stream anterior se existir
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }

      setStream(mediaStream);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Não foi possível acessar a câmera. Verifique as permissões.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    if (!context) return;

    context.drawImage(video, 0, 0);
    
    const photoData = canvas.toDataURL('image/jpeg', 0.9);
    setPhoto(photoData);
    stopCamera();
  };

  const retakePhoto = () => {
    setPhoto(null);
    startCamera();
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const confirmPhoto = () => {
    if (photo) {
      onCapture(photo);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        {!photo ? (
          <>
            {error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
                <Camera className="size-12 mx-auto mb-4 text-red-400" />
                <p className="text-red-600 font-medium mb-2">Erro ao acessar câmera</p>
                <p className="text-sm text-red-500">{error}</p>
                <Button
                  onClick={startCamera}
                  className="mt-4"
                  size="sm"
                >
                  Tentar Novamente
                </Button>
              </div>
            ) : (
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-auto rounded-lg"
                  style={{ maxHeight: '60vh' }}
                />
                
                {/* Overlay de guia para QR Code */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative">
                    <div className="w-64 h-64 border-4 border-white rounded-lg shadow-lg opacity-50"></div>
                    <p className="text-white text-center mt-4 font-medium text-sm bg-black bg-opacity-50 px-4 py-2 rounded">
                      Posicione o QR Code dentro do quadro
                    </p>
                  </div>
                </div>

                {/* Botão de trocar câmera */}
                <Button
                  onClick={switchCamera}
                  size="sm"
                  variant="secondary"
                  className="absolute top-4 right-4"
                >
                  <RotateCw className="size-4" />
                </Button>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </>
        ) : (
          <div className="relative">
            <img
              src={photo}
              alt="Foto capturada"
              className="w-full h-auto rounded-lg"
              style={{ maxHeight: '60vh' }}
            />
            <div className="absolute top-4 left-4">
              <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                <Check className="size-4" />
                Foto Capturada
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Botões de Ação */}
      <div className="flex gap-3">
        {!photo ? (
          <>
            <Button
              variant="outline"
              className="flex-1"
              onClick={onCancel}
            >
              <X className="size-4 mr-2" />
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-primary-600 hover:bg-primary-700"
              onClick={capturePhoto}
              disabled={!!error}
            >
              <Camera className="size-4 mr-2" />
              Capturar Foto
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              className="flex-1"
              onClick={retakePhoto}
            >
              <RotateCw className="size-4 mr-2" />
              Tirar Outra
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={confirmPhoto}
            >
              <Check className="size-4 mr-2" />
              Confirmar
            </Button>
          </>
        )}
      </div>

      {/* Instruções */}
      {!photo && !error && (
        <Card className="bg-primary-50 border-primary-200 p-4">
          <p className="text-sm font-medium text-primary-900 mb-2">📸 Dicas para foto do QR Code:</p>
          <ul className="text-sm text-primary-800 space-y-1">
            <li>• Certifique-se de que há boa iluminação</li>
            <li>• Mantenha o celular firme e paralelo ao QR Code</li>
            <li>• O QR Code deve estar completamente visível</li>
            <li>• Evite reflexos ou sombras sobre o código</li>
          </ul>
        </Card>
      )}
    </div>
  );
}
