/**
 * Learn Korean - Hangul TTS (Flutter flutter_tts preferred, Web Speech API fallback)
 */
function notifyTtsError() {
  if (typeof window.showTtsError === 'function') {
    window.showTtsError();
    return;
  }

  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(61,43,26,0.9);
    color: #F5F0E8;
    padding: 10px 20px;
    border-radius: 20px;
    font-size: 13px;
    z-index: 9999;
    white-space: nowrap;
  `;
  toast.textContent = '⚠️ Please install Google TTS for Korean audio';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

const TTS = {
  /** Flutter initializes TtsService in main; no-op in browser. */
  async init() {},

  _preferSlow() {
    return localStorage.getItem('ttsSpeed') === 'slow';
  },

  async speak(text, slow = false) {
    const useSlow = slow || this._preferSlow();
    // Prefer Flutter native TTS channel
    if (window.flutter_inappwebview) {
      const handler = useSlow ? 'speakSlow' : 'speakText';
      try {
        const result = await window.flutter_inappwebview.callHandler(handler, text);
        if (result === false) {
          notifyTtsError();
        }
      } catch (e) {
        console.warn('TTS bridge failed:', e);
        notifyTtsError();
      }
      return;
    }
    // Browser fallback: Web Speech API
    if ('speechSynthesis' in window) {
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = 'ko-KR';
      utt.rate = useSlow ? 0.4 : 0.8;
      speechSynthesis.cancel();
      speechSynthesis.speak(utt);
      return;
    }

    notifyTtsError();
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
