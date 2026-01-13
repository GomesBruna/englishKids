let currentAudio: HTMLAudioElement | null = null;
const audioCache: Record<string, string> = {};

/**
 * Universal speak function that uses the Free Dictionary API for pronunciations.
 * This is CORS-friendly and works reliably across all devices.
 */
export const speak = async (text: string) => {
  if (!text.trim()) return;

  // Stop any currently playing audio
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  const word = text.trim().toLowerCase();

  // 1. Check Cache first
  if (audioCache[word]) {
    playAudio(audioCache[word]);
    return;
  }

  // 2. Try Google Translate TTS (User Priority)
  const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en&client=tw-ob`;

  // We use a custom error handler to try the next source if Google fails/blocks
  playAudio(googleUrl, async () => {
    // 3. Fallback: Dictionary API (High Quality Human Voice)
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      if (response.ok) {
        const data = await response.json();
        for (const entry of data) {
          const phoneticWithAudio = entry.phonetics?.find((p: any) => p.audio);
          if (phoneticWithAudio) {
            audioCache[word] = phoneticWithAudio.audio;
            playAudio(phoneticWithAudio.audio);
            return;
          }
        }
      }
    } catch (e) {
      console.warn('Dictionary API fallback failed...');
    }

    // 4. Final Fallback: StreamElements (Very CORS-friendly)
    const streamElementsUrl = `https://api.streamelements.com/kappa/v2/speech?voice=Brian&text=${encodeURIComponent(text)}`;
    playAudio(streamElementsUrl);
  });
};

const playAudio = (url: string, onError?: () => void) => {
  const audio = new Audio(url);
  currentAudio = audio;

  // Set up error handling before playing
  if (onError) {
    audio.onerror = () => {
      console.warn('Audio source failed:', url);
      onError();
    };
  }

  audio.play().catch(err => {
    console.error('Playback error for:', url, err);
    if (onError) onError();
  });
};
