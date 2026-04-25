'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VisionService } from '@/services/vision-service';

/**
 * Vision Lens Component
 * Captures video frame and sends to Gemini for dish recognition
 */
export function VisionLens() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsActive(true);
      }
    } catch (err) {
      setError('Failed to access camera. Please allow camera permissions.');
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      setIsActive(false);
    }
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current) return;

    try {
      setIsAnalyzing(true);
      setError(null);

      // Capture frame from video
      const canvas = VisionService.captureVideoFrame(videoRef.current);
      const blob = await VisionService.canvasToBlob(canvas);

      // Send to vision API
      const result = await VisionService.analyzeDish(blob);
      setAnalysisResult(result);
    } catch (err) {
      setError('Failed to analyze dish. Please try again.');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addToCart = () => {
    if (analysisResult) {
      console.log('Adding to cart:', analysisResult);
      // Integrate with cart store
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">📸 Vision Lens</h2>
        <p className="text-gray-600 mb-4">
          Point your camera at a dish to instantly identify it and add to cart
        </p>

        {/* Video Preview */}
        {isActive && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg mb-4 bg-black aspect-video"
          />
        )}

        {!isActive && !analysisResult && (
          <div className="w-full aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
            <span className="text-gray-500">Camera will appear here</span>
          </div>
        )}

        {/* Controls */}
        <div className="space-y-2 mb-4">
          {!isActive ? (
            <Button onClick={startCamera} className="w-full">
              📷 Start Camera
            </Button>
          ) : (
            <>
              <Button
                onClick={captureAndAnalyze}
                disabled={isAnalyzing}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isAnalyzing ? 'Analyzing...' : '✨ Recognize Dish'}
              </Button>
              <Button
                onClick={stopCamera}
                variant="outline"
                className="w-full"
              >
                Close Camera
              </Button>
            </>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded mb-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-lg border border-indigo-200">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {analysisResult.dishName}
                  </h3>
                  <p className="text-gray-600">Matched from menu</p>
                </div>
                <Badge className="bg-indigo-500">
                  {Math.round(analysisResult.confidence * 100)}% Match
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="text-lg font-bold text-gray-900">
                    ${analysisResult.price}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Calories</p>
                  <p className="text-lg font-bold text-gray-900">
                    {analysisResult.nutritionInfo.calories}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Key Ingredients:
                </p>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.ingredients.map((ingredient: string) => (
                    <Badge key={ingredient} variant="secondary">
                      {ingredient}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 p-3 bg-gray-50 rounded text-center text-sm">
                <div>
                  <p className="text-gray-600">Protein</p>
                  <p className="font-bold">{analysisResult.nutritionInfo.protein}g</p>
                </div>
                <div>
                  <p className="text-gray-600">Carbs</p>
                  <p className="font-bold">{analysisResult.nutritionInfo.carbs}g</p>
                </div>
                <div>
                  <p className="text-gray-600">Fat</p>
                  <p className="font-bold">{analysisResult.nutritionInfo.fat}g</p>
                </div>
                <div>
                  <p className="text-gray-600">Fiber</p>
                  <p className="font-bold">3g</p>
                </div>
              </div>
            </div>

            {/* Recommended Pairings */}
            {analysisResult.recommendedPairings.length > 0 && (
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="font-semibold text-gray-900 mb-2">
                  🍷 Recommended Pairings:
                </p>
                <div className="space-y-1 text-sm text-gray-700">
                  {analysisResult.recommendedPairings.map((pairing: string) => (
                    <p key={pairing}>✓ {pairing}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2 flex gap-2">
              <Button onClick={addToCart} className="flex-1 bg-green-600 hover:bg-green-700">
                Add to Cart
              </Button>
              <Button
                onClick={() => setAnalysisResult(null)}
                variant="outline"
                className="flex-1"
              >
                Scan Another
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
