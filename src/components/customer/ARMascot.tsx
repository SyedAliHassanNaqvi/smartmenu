'use client';

import { useEffect, useRef, useState } from 'react';
import { useAudioAnalyzer } from '@/hooks/use-audio-analyzer';
import { useSpeech } from '@/hooks/use-speech';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// A-Frame type definitions for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'a-scene': AFrameSceneProps;
      'a-assets': Record<string, any>;
      'a-asset-item': AFrameAssetProps;
      'a-entity': AFrameEntityProps;
      'a-light': AFrameLightProps;
    }
  }
}

interface AFrameSceneProps {
  embedded?: boolean;
  children?: React.ReactNode;
  [key: string]: any;
}

interface AFrameAssetProps {
  id: string;
  src: string;
  [key: string]: any;
}

interface AFrameEntityProps {
  'gltf-model'?: string;
  position?: string;
  rotation?: string;
  scale?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

interface AFrameLightProps {
  type?: string;
  position?: string;
  intensity?: number;
  [key: string]: any;
}

/**
 * AR Mascot Component with Adaptive Volume
 * Uses A-Frame for 3D scene, Web Audio API for ambient noise detection
 */
export function ARMascot() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [mascotMessage, setMascotMessage] = useState('Welcome to SmartMenu!');
  const [isListening, setIsListening] = useState(false);
  const [ambientNoise, setAmbientNoise] = useState(0);
  const { analyzeAudio, threshold } = useAudioAnalyzer({ threshold: -30 });
  const { startListening, speak, transcript } = useSpeech();

  useEffect(() => {
    // Load A-Frame script
    const script = document.createElement('script');
    script.src = 'https://aframe.io/releases/1.4.2/aframe.min.js';
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleStartAR = async () => {
    try {
      setIsListening(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const { getVolume } = await analyzeAudio(stream);

      // Monitor ambient noise level
      const noiseInterval = setInterval(() => {
        const volume = getVolume();
        setAmbientNoise(volume);

        // Adaptive volume: increase speech volume if noise is high
        const baseVolume = 0.5;
        const adaptiveVolume = Math.min(1.0, baseVolume + Math.abs(volume) / 100);

        // Store adaptive volume for use in speak function
        (window as any).__mascotVolume = adaptiveVolume;
      }, 100);

      await startListening();

      return () => clearInterval(noiseInterval);
    } catch (error) {
      console.error('Failed to start AR:', error);
      alert('Please allow microphone access to use AR Mascot');
      setIsListening(false);
    }
  };

  const handleMascotSpeak = () => {
    const adaptiveVolume = (window as any).__mascotVolume || 0.8;
    const messages = [
      'Would you like to try something new today?',
      'Check out our special recommendations!',
      'Play the ingredient game to earn discounts!',
      'Your order is being prepared with love!',
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    speak(randomMessage, 1.0, adaptiveVolume);
    setMascotMessage(randomMessage);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">🤖 AI Mascot</h2>

        {/* A-Frame Scene */}
        <div ref={sceneRef} className="w-full h-96 rounded-lg overflow-hidden bg-black mb-4">
          <a-scene embedded>
            <a-assets>
              <a-asset-item
                id="mascot-model"
                src="https://models.readyplayer.me/63a3e1fd04d5af6fe8dbe43a.glb"
              />
            </a-assets>

            {/* 3D Model */}
            <a-entity gltf-model="#mascot-model" position="0 0 0" scale="1 1 1" />

            {/* Lighting */}
            <a-light type="ambient" intensity="1" />
            <a-light type="directional" intensity="0.5" position="5 10 7" />

            {/* Camera */}
            <a-camera position="0 0 5" />
          </a-scene>
        </div>

        {/* Mascot Message */}
        <div className="bg-white rounded-lg p-4 mb-4 border-l-4 border-purple-500">
          <p className="text-gray-800 italic">"{mascotMessage}"</p>
        </div>

        {/* Audio Analysis Display */}
        <div className="space-y-2 mb-4 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm font-semibold text-gray-700">
            Ambient Noise: {ambientNoise.toFixed(2)} dB
          </p>
          <div className="w-full h-2 bg-gray-300 rounded overflow-hidden">
            <div
              className={`h-full transition-all ${
                ambientNoise > threshold ? 'bg-red-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(100, (ambientNoise + 50) * 2)}%` }}
            />
          </div>
          <p className="text-xs text-gray-600">
            Volume Adaptive: {Math.round((ambientNoise > threshold ? 100 : 50))}%
          </p>
        </div>

        {/* Controls */}
        <div className="space-y-2">
          <Button
            onClick={handleStartAR}
            disabled={isListening}
            className="w-full"
          >
            {isListening ? 'Listening...' : 'Enable AR Experience'}
          </Button>
          <Button
            onClick={handleMascotSpeak}
            variant="outline"
            className="w-full"
          >
            Make Mascot Speak
          </Button>

          {transcript && (
            <div className="p-3 bg-blue-50 rounded text-sm text-gray-700">
              You said: <span className="font-semibold">{transcript}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Instructions */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-gray-900 mb-2">How it works:</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>✓ The mascot adapts its volume based on ambient noise</li>
          <li>✓ Higher noise = louder mascot voice</li>
          <li>✓ Provides personalized recommendations</li>
          <li>✓ Engages you with friendly conversation</li>
        </ul>
      </Card>
    </div>
  );
}
