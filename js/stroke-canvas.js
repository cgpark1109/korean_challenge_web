/**
 * Learn Korean - Hangul stroke canvas writing practice
 */
const StrokeCanvas = (() => {
  const SIZE = 280;

  const STROKE_GUIDES = {
    '\u3131': [[[0.22, 0.38], [0.52, 0.38]], [[0.52, 0.38], [0.52, 0.78]]],
    '\u3134': [[[0.28, 0.28], [0.72, 0.28]], [[0.28, 0.28], [0.28, 0.52]], [[0.28, 0.52], [0.72, 0.75]]],
    '\u3137': [[[0.22, 0.35], [0.5, 0.35]], [[0.35, 0.35], [0.35, 0.72]], [[0.35, 0.72], [0.78, 0.72]]],
    '\u3139': [[[0.3, 0.3], [0.7, 0.3]], [[0.3, 0.3], [0.3, 0.55]], [[0.55, 0.55], [0.78, 0.55]]],
    '\u3141': [[[0.25, 0.32], [0.75, 0.32]], [[0.25, 0.32], [0.25, 0.75]], [[0.75, 0.32], [0.75, 0.75]], [[0.25, 0.75], [0.75, 0.75]]],
    '\u3142': [[[0.3, 0.35], [0.7, 0.35]], [[0.3, 0.35], [0.3, 0.55]], [[0.7, 0.35], [0.7, 0.55]], [[0.3, 0.72], [0.7, 0.72]]],
    '\u3145': [[[0.5, 0.22], [0.28, 0.78]], [[0.5, 0.22], [0.72, 0.78]]],
    '\u3147': [[[0.35, 0.35], [0.65, 0.35], [0.65, 0.65], [0.35, 0.65], [0.35, 0.35]]],
    '\u3148': [[[0.28, 0.32], [0.72, 0.32]], [[0.5, 0.32], [0.5, 0.78]]],
    '\u314A': [[[0.22, 0.25], [0.5, 0.25]], [[0.28, 0.38], [0.72, 0.38]], [[0.5, 0.38], [0.5, 0.78]]],
    '\u314B': [[[0.2, 0.22], [0.45, 0.22]], [[0.28, 0.35], [0.72, 0.35]], [[0.5, 0.35], [0.5, 0.78]]],
    '\u314C': [[[0.2, 0.22], [0.45, 0.22]], [[0.28, 0.35], [0.72, 0.35]], [[0.5, 0.35], [0.5, 0.78]]],
    '\u314D': [[[0.18, 0.2], [0.42, 0.2]], [[0.25, 0.32], [0.75, 0.32]], [[0.5, 0.32], [0.5, 0.78]]],
    '\u314E': [[[0.22, 0.22], [0.48, 0.22]], [[0.28, 0.35], [0.72, 0.35]], [[0.5, 0.35], [0.5, 0.78]]],
    '\u314F': [[[0.42, 0.22], [0.42, 0.78]], [[0.62, 0.35], [0.78, 0.5]]],
    '\u3151': [[[0.38, 0.22], [0.38, 0.78]], [[0.55, 0.32], [0.72, 0.42]], [[0.72, 0.48], [0.55, 0.58]]],
    '\u3143': [[[0.22, 0.35], [0.38, 0.5]], [[0.42, 0.22], [0.42, 0.78]]],
    '\u3155': [[[0.2, 0.35], [0.36, 0.48]], [[0.36, 0.52], [0.2, 0.65]], [[0.42, 0.22], [0.42, 0.78]]],
    '\u3157': [[[0.35, 0.42], [0.65, 0.42]], [[0.5, 0.42], [0.5, 0.78]]],
    '\u315B': [[[0.32, 0.4], [0.45, 0.4]], [[0.55, 0.4], [0.68, 0.4]], [[0.5, 0.4], [0.5, 0.78]]],
    '\u315C': [[[0.35, 0.55], [0.65, 0.55]], [[0.5, 0.22], [0.5, 0.55]]],
    '\u3160': [[[0.32, 0.58], [0.45, 0.58]], [[0.55, 0.58], [0.68, 0.58]], [[0.5, 0.22], [0.5, 0.58]]],
    '\u3161': [[[0.22, 0.5], [0.78, 0.5]]],
    '\u3163': [[[0.5, 0.22], [0.5, 0.78]]],
    '\uAC00': [[[0.2, 0.35], [0.55, 0.35]], [[0.35, 0.2], [0.35, 0.75]], [[0.55, 0.55], [0.8, 0.55]], [[0.7, 0.45], [0.7, 0.8]]],
    '\uB098': [[[0.25, 0.3], [0.75, 0.3]], [[0.35, 0.3], [0.35, 0.8]], [[0.6, 0.5], [0.85, 0.5]]],
    '\uB2E4': [[[0.2, 0.35], [0.5, 0.35]], [[0.35, 0.2], [0.35, 0.75]], [[0.55, 0.55], [0.8, 0.55]], [[0.65, 0.45], [0.65, 0.8]]],
    '\uB9C8': [[[0.2, 0.35], [0.5, 0.35]], [[0.35, 0.2], [0.35, 0.7]], [[0.55, 0.55], [0.8, 0.55]], [[0.7, 0.45], [0.7, 0.8]]],
    '\uBC14': [[[0.2, 0.35], [0.5, 0.35]], [[0.35, 0.2], [0.35, 0.75]], [[0.55, 0.55], [0.8, 0.55]]],
    '\uC0AC': [[[0.2, 0.35], [0.5, 0.35]], [[0.35, 0.2], [0.35, 0.75]], [[0.55, 0.55], [0.8, 0.55]]],
    '\uC544': [[[0.25, 0.3], [0.75, 0.3]], [[0.35, 0.3], [0.35, 0.75]]],
    '\uC790': [[[0.2, 0.35], [0.5, 0.35]], [[0.35, 0.2], [0.35, 0.75]], [[0.55, 0.55], [0.8, 0.55]], [[0.7, 0.45], [0.7, 0.8]]],
    default: [[[0.25, 0.3], [0.75, 0.3]], [[0.35, 0.3], [0.35, 0.75]], [[0.55, 0.55], [0.8, 0.55]]],
  };

  function init(canvas, options = {}) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    let char = options.char || '\u3131';
    let guides = STROKE_GUIDES[char] || STROKE_GUIDES.default;

    let drawing = false;
    let strokes = [];
    let currentStroke = [];
    let visibleStrokeNums = 0;
    let showMeInterval = null;
    let fadeStart = 0;
    let rafId = null;

    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    function normToCanvas(x, y) {
      return { x: x * SIZE, y: y * SIZE };
    }

    function getGuides() {
      return STROKE_GUIDES[char] || STROKE_GUIDES.default;
    }

    function drawBackgroundChar() {
      ctx.save();
      ctx.font = '180px "Segoe UI", sans-serif';
      ctx.fillStyle = 'rgba(155, 139, 122, 0.15)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(char, SIZE / 2, SIZE / 2 + 8);
      ctx.restore();
    }

    function drawUserStrokes() {
      ctx.save();
      ctx.strokeStyle = '#3D2B1A';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const drawPath = (stroke) => {
        if (stroke.length < 2) return;
        ctx.beginPath();
        stroke.forEach((pt, i) => {
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.stroke();
      };

      strokes.forEach(drawPath);
      drawPath(currentStroke);
      ctx.restore();
    }

    function drawStrokeNumbers() {
      const list = getGuides();
      const now = performance.now();

      list.forEach((stroke, i) => {
        if (i >= visibleStrokeNums) return;

        const start = normToCanvas(stroke[0][0], stroke[0][1]);
        let alpha = 1;
        if (i === visibleStrokeNums - 1 && fadeStart > 0) {
          const t = Math.min(1, (now - fadeStart) / 400);
          alpha = 0.2 + t * 0.8;
        }

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#8B2020';
        ctx.font = 'bold 22px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(i + 1), start.x, start.y - 14);
        ctx.restore();
      });
    }

    function cancelRedrawLoop() {
      if (rafId != null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }

    function redraw() {
      ctx.clearRect(0, 0, SIZE, SIZE);
      drawBackgroundChar();
      drawUserStrokes();
      drawStrokeNumbers();
      cancelRedrawLoop();
      if (visibleStrokeNums > 0 && fadeStart > 0 && performance.now() - fadeStart < 450) {
        rafId = requestAnimationFrame(redraw);
      }
    }

    function stopShowMe() {
      if (showMeInterval) {
        clearInterval(showMeInterval);
        showMeInterval = null;
      }
      cancelRedrawLoop();
    }

    function showMe() {
      stopShowMe();
      const list = getGuides();
      if (!list.length) return;

      visibleStrokeNums = 1;
      fadeStart = performance.now();
      redraw();

      let step = 1;
      showMeInterval = setInterval(() => {
        if (step >= list.length) {
          stopShowMe();
          fadeStart = 0;
          redraw();
          return;
        }
        visibleStrokeNums = step + 1;
        fadeStart = performance.now();
        step += 1;
        redraw();
      }, 500);
    }

    function getPoint(e) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = SIZE / rect.width;
      const scaleY = SIZE / rect.height;
      const touch = e.touches?.[0] ?? e.changedTouches?.[0];
      const clientX = touch ? touch.clientX : e.clientX;
      const clientY = touch ? touch.clientY : e.clientY;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    }

    function onStart(e) {
      if (e.cancelable) e.preventDefault();
      stopShowMe();
      visibleStrokeNums = 0;
      fadeStart = 0;
      drawing = true;
      currentStroke = [getPoint(e)];
    }

    function onMove(e) {
      if (!drawing) return;
      if (e.cancelable) e.preventDefault();
      currentStroke.push(getPoint(e));
      redraw();
    }

    function onEnd(e) {
      if (!drawing) return;
      if (e.cancelable && e.type !== 'touchend' && e.type !== 'touchcancel') {
        e.preventDefault();
      }
      drawing = false;
      if (currentStroke.length > 1) strokes.push(currentStroke);
      currentStroke = [];
      cancelRedrawLoop();
      redraw();
    }

    function clear() {
      stopShowMe();
      drawing = false;
      strokes = [];
      currentStroke = [];
      visibleStrokeNums = 0;
      fadeStart = 0;
      ctx.clearRect(0, 0, SIZE, SIZE);
      redraw();
    }

    function setChar(newChar) {
      char = newChar;
      guides = getGuides();
      clear();
    }

    canvas.addEventListener('mousedown', onStart);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseup', onEnd);
    canvas.addEventListener('mouseleave', onEnd);
    canvas.addEventListener('touchstart', onStart, { passive: false });
    canvas.addEventListener('touchmove', onMove, { passive: false });
    canvas.addEventListener('touchend', onEnd, { passive: true });
    canvas.addEventListener('touchcancel', onEnd, { passive: true });

    redraw();

    return { clear, showMe, stopShowMe, setChar, redraw };
  }

  return { init, STROKE_GUIDES, SIZE };
})();

if (typeof module !== 'undefined') module.exports = StrokeCanvas;
