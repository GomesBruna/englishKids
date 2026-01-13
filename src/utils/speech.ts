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

  // Workaround for some mobile browsers where speak() must be called in a specific way
  // and ensuring we don't speak empty text
  if (text.trim()) {
    window.speechSynthesis.speak(utterance);
  }
};
