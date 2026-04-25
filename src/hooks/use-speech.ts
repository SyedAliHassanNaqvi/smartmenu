import { useCallback, useState } from "react";

export interface UseSpeechOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

export function useSpeech(options: UseSpeechOptions = {}) {
  const { language = "en-US", continuous = false, interimResults = true } = options;
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  const startListening = useCallback(async () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("Speech Recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.language = language;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        }
      }

      setTranscript(finalTranscript);
    };

    recognition.start();
  }, [language, continuous, interimResults]);

  const speak = useCallback((text: string, rate = 1.0, volume = 1.0) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.volume = volume;
    window.speechSynthesis.speak(utterance);
  }, []);

  return { startListening, speak, isListening, transcript, setTranscript };
}
