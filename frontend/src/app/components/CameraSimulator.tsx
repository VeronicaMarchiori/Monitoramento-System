import { useState } from 'react';
import { X, Camera, ZoomIn, ZoomOut, FlipHorizontal } from 'lucide-react';
import { Button } from './ui/button';

interface CameraSimulatorProps {
  onClose: () => void;
  onCapture: () => void;
  pointName: string;
}

export function CameraSimulator({ onClose, onCapture }: CameraSimulatorProps) {
  const [captured, setCaptured] = useState(false);

  const handleCapture = () => {
    setCaptured(true);
    setTimeout(() => {
      onCapture();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Camera View */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Simulated Camera Background */}
        <div className="relative w-full h-full bg-gradient-to-br from-gray-800 via-gray-900 to-black overflow-hidden">
          {/* Grid overlay to simulate camera view */}
          <div className="absolute inset-0 opacity-20">
            <div className="grid grid-cols-3 grid-rows-3 h-full w-full">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="border border-white/20" />
              ))}
            </div>
          </div>

          {/* Center focus area for QR Code */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-64 h-64">
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-red-500 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-red-500 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-red-500 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-red-500 rounded-br-lg" />
              
              {/* Scanning line animation */}
              {!captured && (
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute w-full h-1 bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-[scan_2s_ease-in-out_infinite]" />
                </div>
              )}

              {/* Center guide text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-4 bg-white/10 rounded-lg flex items-center justify-center">
                    <Camera className="w-16 h-16 text-white/50" />
                  </div>
                  {!captured && (
                    <p className="text-white text-sm font-medium">
                      Posicione o QR Code ou<br />
                      tire uma foto do ponto
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Flash effect when captured */}
          {captured && (
            <div className="absolute inset-0 bg-white animate-[flash_0.5s_ease-out]" />
          )}
        </div>

        {/* Top Controls */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="text-white text-sm font-medium bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full">
              Registrar Ponto
            </div>
            <div className="w-10" /> {/* Spacer */}
          </div>
        </div>

        {/* Side Controls */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 space-y-4">
          <button className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors">
            <ZoomIn className="w-5 h-5" />
          </button>
          <button className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors">
            <ZoomOut className="w-5 h-5" />
          </button>
          <button className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors">
            <FlipHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Bottom Controls - Capture Button */}
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/60 to-transparent">
          <div className="flex items-center justify-center">
            <button
              onClick={handleCapture}
              disabled={captured}
              className="relative group"
            >
              {/* Outer ring */}
              <div className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center group-hover:border-red-400 transition-colors">
                {/* Inner circle */}
                <div className={`w-16 h-16 rounded-full transition-all ${
                  captured 
                    ? 'bg-green-500' 
                    : 'bg-white group-hover:bg-red-500'
                }`}>
                  {captured && (
                    <div className="w-full h-full flex items-center justify-center">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </button>
          </div>
          
          {!captured && (
            <p className="text-center text-white text-sm mt-4 font-medium">
              Toque para capturar
            </p>
          )}
        </div>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes scan {
          0% {
            top: 0;
          }
          50% {
            top: 100%;
          }
          100% {
            top: 0;
          }
        }
        
        @keyframes flash {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
