// Flutter WebView access check
function checkAppAccess() {
  if (typeof window.flutter_inappwebview === 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.style.background = '#F5F0E8';
      document.body.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          font-family: sans-serif;
          color: #3D2B1A;
          text-align: center;
          padding: 40px;
        ">
          <p style="font-size: 48px; margin-bottom: 16px;">\uD83D\uDD12</p>
          <h2 style="font-size: 20px; margin-bottom: 12px;">
            App Only
          </h2>
          <p style="font-size: 14px; color: #9B8B7A;">
            This content is only available<br>
            in the Learn Korean - Hangul app.
          </p>
        </div>
      `;
    });
  }
}
checkAppAccess();

/**
 * Learn Korean - Hangul data bridge + Flutter / Web shared helpers
 */

// Flutter WebView bridge helpers
const FlutterBridge = {
  // Save stage progress
  saveProgress(stageId, stars, score) {
    if (window.flutter_inappwebview) {
      window.flutter_inappwebview.callHandler('saveProgress', stageId, stars, score);
    }
    // Fallback: localStorage when not in Flutter
    const key = `stage_${stageId}`;
    localStorage.setItem(key, JSON.stringify({ stars, score }));
  },

  // Load stage progress
  async getProgress() {
    if (window.flutter_inappwebview) {
      const result = await window.flutter_inappwebview.callHandler('getProgress');
      if (result != null && result !== '') {
        try {
          return typeof result === 'string' ? JSON.parse(result) : result;
        } catch (e) {
          console.warn('[FlutterBridge] getProgress parse failed:', e);
        }
      }
    }
    // Fallback: read progress from localStorage
    const progress = {};
    for (let i = 1; i <= 8; i++) {
      const data = localStorage.getItem(`stage_${i}`);
      if (data) progress[i] = JSON.parse(data);
    }
    return progress;
  },

  // Open external URL (e.g. Privacy Policy)
  openExternalUrl(url) {
    if (window.flutter_inappwebview) {
      window.flutter_inappwebview.callHandler('openExternalUrl', url);
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  },
};

// In-app page navigation
const navigate = (page, params = {}) => {
  const filtered = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v != null && v !== '')
  );
  const query = new URLSearchParams(filtered).toString();
  location.href = query ? `${page}?${query}` : page;
};

let _lastInstantNav = { url: '', at: 0 };

/** WebView/emulator: immediate navigation with duplicate-guard */
function navigateInstant(url) {
  if (!url) return;
  const now = Date.now();
  if (_lastInstantNav.url === url && now - _lastInstantNav.at < 500) return;
  _lastInstantNav = { url, at: now };
  window.location.assign(url);
}

/** Shared HTML page helpers */
const App = {
  FlutterBridge,
  navigate,

  /** Open settings page */
  navigateToSettings() {
    navigate('settings.html');
  },

  getQuery() {
    return Object.fromEntries(new URLSearchParams(window.location.search));
  },

  getParam(key, fallback = '') {
    return App.getQuery()[key] ?? fallback;
  },

  showToast(message, duration = 2500) {
    let el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      el.className = 'toast';
      el.setAttribute('role', 'status');
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add('is-visible');
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove('is-visible'), duration);
  },

  shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },

  renderStars(count, max = 3) {
    return '\u2605'.repeat(count) + '\u2606'.repeat(Math.max(0, max - count));
  },

  loadProgress() {
    return FlutterBridge.getProgress();
  },

  isStageUnlocked(stageId, progress) {
    if (stageId <= 1) return true;
    const prev = progress[stageId - 1] ?? progress[String(stageId - 1)];
    return prev != null && (prev.stars ?? 0) > 0;
  },

  bindBackButton(selector = '[data-back]') {
    document.querySelectorAll(selector).forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const href = btn.getAttribute('href') || btn.dataset.href || 'index.html';
        navigate(href);
      });
    });
  },

  bindTtsButtons() {
    document.querySelectorAll('[data-tts]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const text = btn.dataset.tts || btn.textContent.trim();
        if (typeof TTS !== 'undefined') TTS.speak(text);
      });
    });
  },

  /**
   * Reliable tap on links/cards inside WebView (pointer + click, move guard).
   * Child elements should use pointer-events: none so the anchor receives hits.
   */
  bindInstantTap(el, url) {
    if (!el || !url) return;
    el.href = url;
    el.dataset.navigateUrl = url;

    let startX = 0;
    let startY = 0;
    let moved = false;

    const go = (e) => {
      if (moved) return;
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      navigateInstant(url);
    };

    el.addEventListener(
      'pointerdown',
      (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        startX = e.clientX;
        startY = e.clientY;
        moved = false;
      },
      { passive: true }
    );

    el.addEventListener(
      'pointermove',
      (e) => {
        if (
          Math.abs(e.clientX - startX) > 12 ||
          Math.abs(e.clientY - startY) > 12
        ) {
          moved = true;
        }
      },
      { passive: true }
    );

    el.addEventListener('pointerup', go);
    el.addEventListener('pointercancel', () => {
      moved = true;
    });
    el.addEventListener('click', go);
  },

  /** Delegated taps for dynamically added .category-card links */
  bindCategoryList(container) {
    if (!container) return;
    const handle = (e) => {
      const card = e.target.closest('a.category-card, a[data-navigate-url]');
      if (!card || !container.contains(card)) return;
      const url = card.dataset.navigateUrl || card.getAttribute('href');
      if (!url) return;
      e.preventDefault();
      e.stopPropagation();
      navigateInstant(url);
    };
    container.addEventListener('pointerup', handle);
    container.addEventListener('click', handle);
  },
};

document.addEventListener('DOMContentLoaded', () => {
  App.bindBackButton();
  App.bindTtsButtons();
});

/** Notice system: load notice.json (popup + banner) */
async function loadNotice() {
  try {
    const res = await fetch('./notice.json?v=' + Date.now());
    const data = await res.json();

    if (data.popup?.active) {
      const seen = localStorage.getItem('notice_seen_' + data.popup.version);
      if (!seen) {
        showNoticePopup(data.popup);
      }
    }

    if (data.banner?.active) {
      showNoticeBanner(data.banner);
    }
  } catch (e) {
    console.log('Notice load failed:', e);
  }
}

function showNoticePopup(notice) {
  if (document.querySelector('.notice-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'notice-overlay';
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0,0,0,0.5);
    display: flex; align-items: center;
    justify-content: center; z-index: 9999;
    padding: 20px; box-sizing: border-box;
  `;

  const card = document.createElement('div');
  card.style.cssText = `
    background: #F5F0E8;
    border: 1px solid #C9B99A;
    border-radius: 16px;
    padding: 28px 24px;
    max-width: 320px;
    width: 100%;
    text-align: center;
  `;

  const title = document.createElement('h3');
  title.style.cssText =
    'font-size: 18px; font-weight: 700; color: #3D2B1A; margin-bottom: 12px;';
  title.textContent = notice.title;

  const message = document.createElement('p');
  message.style.cssText =
    'font-size: 14px; color: #6B4F2A; line-height: 1.6; margin-bottom: 20px; white-space: pre-line;';
  message.textContent = notice.message;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = notice.button;
  btn.style.cssText = `
    background: #8B6914;
    color: #FFF8E7;
    border: none;
    border-radius: 8px;
    padding: 12px 32px;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    width: 100%;
    touch-action: manipulation;
  `;
  btn.addEventListener('click', () => closeNoticePopup(notice.version));

  card.appendChild(title);
  card.appendChild(message);
  card.appendChild(btn);
  overlay.appendChild(card);
  document.body.appendChild(overlay);
}

function closeNoticePopup(version) {
  localStorage.setItem('notice_seen_' + version, 'true');
  document.querySelector('.notice-overlay')?.remove();
}

function showNoticeBanner(banner) {
  if (document.getElementById('notice-banner')) return;

  const bannerEl = document.createElement('div');
  bannerEl.id = 'notice-banner';
  bannerEl.style.cssText = `
    background: #EDE5D5;
    border-bottom: 1px solid #C9B99A;
    padding: 10px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
    color: #3D2B1A;
    touch-action: manipulation;
  `;

  const msg = document.createElement('span');
  msg.textContent = banner.message;

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.textContent = '\u2715';
  closeBtn.style.cssText = `
    background: none;
    border: none;
    color: #9B8B7A;
    font-size: 16px;
    cursor: pointer;
    padding: 0 4px;
    touch-action: manipulation;
  `;
  closeBtn.addEventListener('click', () => bannerEl.remove());

  bannerEl.appendChild(msg);
  bannerEl.appendChild(closeBtn);

  const header =
    document.querySelector('.home__header') ||
    document.querySelector('.home-header');
  if (header) {
    header.insertAdjacentElement('afterend', bannerEl);
    return;
  }

  const home = document.querySelector('.home');
  if (home) {
    home.insertBefore(bannerEl, home.firstChild);
    return;
  }

  document.body.prepend(bannerEl);
}

if (typeof module !== 'undefined') {
  module.exports = { App, FlutterBridge, navigate };
}
