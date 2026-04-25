import { useCallback } from "react";

export interface UseAudioAnalyzerOptions {
  threshold?: number;
  smoothing?: number;
  fftSize?: number;
}

/**
 * Audio Analyzer Hook
 * Calculates RMS (Root Mean Square) volume for adaptive speech synthesis
 * Used in AR Mascot for noise-aware volume adjustment
 */
export function useAudioAnalyzer(options: UseAudioAnalyzerOptions = {}) {
  const { threshold = -30, smoothing = 0.8, fftSize = 2048 } = options;

  /**
   * Calculate RMS (Root Mean Square) of audio data
   * RMS represents the perceived loudness level
   */
  const calculateRMS = useCallback((data: Uint8Array): number => {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      const normalized = (data[i] - 128) / 128;
      sum += normalized * normalized;
    }
    const rms = Math.sqrt(sum / data.length);
    // Convert to dB scale (-100 to 0)
    const db = 20 * Math.log10(Math.max(rms, 1e-5));
    return db;
  }, []);

  const analyzeAudio = useCallback(
    async (stream: MediaStream) => {
      const audioContext =
        new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = fftSize;
      analyser.smoothingTimeConstant = smoothing;
      source.connect(analyser);
      analyser.connect(audioContext.destination);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let smoothedVolume = 0;

      /**
       * Get current volume in dB
       * Returns smoothed RMS value for consistent readings
       */
      const getVolume = (): number => {
        analyser.getByteFrequencyData(dataArray);
        const currentRMS = calculateRMS(dataArray);

        // Apply exponential smoothing for stability
        smoothedVolume = smoothedVolume * smoothing + currentRMS * (1 - smoothing);
        return smoothedVolume;
      };

      /**
       * Check if noise level exceeds threshold
       */
      const isNoiseAboveThreshold = (): boolean => {
        return getVolume() > threshold;
      };

      /**
       * Get adaptive volume factor (0.5 to 1.0)
       * Used to scale speech synthesis volume based on ambient noise
       */
      const getAdaptiveVolumeFactor = (): number => {
        const volume = getVolume();
        const baseVolume = 0.5;
        // Scale from 0.5 to 1.0 based on noise level
        const adaptiveVolume = Math.min(
          1.0,
          baseVolume + Math.abs(volume) / 100
        );
        return adaptiveVolume;
      };

      return {
        getVolume,
        isNoiseAboveThreshold,
        getAdaptiveVolumeFactor,
        audioContext,
        analyser,
      };
    },
    [threshold, smoothing, fftSize, calculateRMS]
  );

  return { analyzeAudio, threshold };
}
