/**
 * Learn Korean - Hangul ??TTS (Flutter flutter_tts ?∞ÏÑ†, Î∏åÎùº?∞Ï? Web Speech API ?¥Î∞±)
 */
const TTS = {
  /** Flutter ?±Ï? main?êÏÑú TtsService Ï¥àÍ∏∞?? Î∏åÎùº?∞Ï???no-op. */
  async init() {},

  _preferSlow() {
    return localStorage.getItem('ttsSpeed') === 'slow';
  },

  speak(text, slow = false) {
    const useSlow = slow || this._preferSlow();
    // Flutter Ï±ÑÎÑê ?∞ÏÑ† ?¨Ïö©
    if (window.flutter_inappwebview) {
      const handler = useSlow ? 'speakSlow' : 'speakText';
      window.flutter_inappwebview.callHandler(handler, text);
      return;
    }
    // Î∏åÎùº?∞Ï? ?åÏä§?∏Ïö© Web Speech API ?¥Î∞±
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
