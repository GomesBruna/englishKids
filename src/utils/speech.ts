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

  try {
    let audioUrl = '';

    // If it's already a URL (pre-recorded or from DB), use it directly
    if (text.startsWith('http')) {
      audioUrl = text;
    } else {
      const word = text.trim().toLowerCase();
      if (audioCache[word]) {
        audioUrl = audioCache[word];
      } else {
        // Fetch from Dictionary API
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        if (response.ok) {
          const data = await response.json();
          // Find the first available audio URL
          for (const entry of data) {
            if (entry.phonetics) {
              const phoneticWithAudio = entry.phonetics.find((p: any) => p.audio && p.audio !== '');
              if (phoneticWithAudio) {
                audioUrl = phoneticWithAudio.audio;
                break;
              }
            }
          }
          if (audioUrl) audioCache[word] = audioUrl;
        }
      }
    }

    if (audioUrl) {
      const audio = new Audio(audioUrl);
      currentAudio = audio;
      await audio.play();
    } else {
      console.warn('No audio found for:', text);
    }
  } catch (err) {
    console.error('Failed to play audio:', err);
  }
};
