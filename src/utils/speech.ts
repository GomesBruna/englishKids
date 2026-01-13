let voices: SpeechSynthesisVoice[] = [];

// Pre-load voices for mobile browsers
if ('speechSynthesis' in window) {
  voices = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    voices = window.speechSynthesis.getVoices();
  };
}

export const speak = (text: string) => {
  if (!('speechSynthesis' in window)) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Create utterance
  const utterance = new SpeechSynthesisUtterance(text);

  // Set default properties
  utterance.lang = 'en-US';
  utterance.rate = 0.8;
  utterance.pitch = 1.1;

  // Try to find a good English voice (crucial for some mobile browsers)
  const englishVoice = voices.find(v => v.lang.startsWith('en-US')) ||
    voices.find(v => v.lang.startsWith('en')) ||
    voices[0];

  if (englishVoice) {
    utterance.voice = englishVoice;
  }

  // Workaround for some mobile browsers/TalkBack
  // ensures we don't speak empty text and adds a tiny delay
  // to prevent TalkBack from cutting off our audio
  if (text.trim()) {
    // Some browsers need a resume call if the audio context suspended
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    // A tiny delay (50ms) often helps TalkBack finish its own feedback 
    // before the speech synthesis starts
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 50);
  }
};
