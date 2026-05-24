/**
 * Learn Korean - Hangul TTS (Flutter flutter_tts preferred, Web Speech API fallback)
 */
const TTS = {
  /** Flutter initializes TtsService in main; no-op in browser. */
  async init() {},

  _preferSlow() {
    return localStorage.getItem('ttsSpeed') === 'slow';
  },

  speak(text, slow = false) {
    const useSlow = slow || this._preferSlow();
    // Prefer Flutter native TTS channel
    if (window.flutter_inappwebview) {
      const handler = useSlow ? 'speakSlow' : 'speakText';
      window.flutter_inappwebview.callHandler(handler, text);
      return;
    }
    // Browser fallback: Web Speech API
    if ('speechSynthesis' in window) {
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = 'ko-KR';
      utt.rate = useSlow ? 0.4 : 0.8;
      speechSynthesis.cancel();
      speechSynthesis.speak(utt);
    }
  },
  speakSlow(text) {
    this.speak(text, true);
  },
  stop() {
    if (window.flutter_inappwebview) {
      window.flutter_inappwebview.callHandler('stopTts');
    } else {
      speechSynthesis.cancel();
    }
  },
};

if (typeof module !== 'undefined') module.exports = TTS;
