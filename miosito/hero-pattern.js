// hero-pattern.js
class HeroPattern {
  static get inputProperties() {
    return ['--hero-primary', '--hero-secondary', '--hero-accent'];
  }

  paint(ctx, geom, props) {
    const w = geom.width;
    const h = geom.height;

    const primary = (props.get('--hero-primary') || '#7c2d12').toString().trim() || '#7c2d12';
    const secondary = (props.get('--hero-secondary') || '#ea580c').toString().trim() || '#ea580c';
    const accent = (props.get('--hero-accent') || '#fbbf24').toString().trim() || '#fbbf24';

    // background gradient
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, primary);
    gradient.addColorStop(0.6, secondary);
    gradient.addColorStop(1, '#020617');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // diagonal lines
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';

    const step = 40;
    for (let x = -w; x < w * 2; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + h, h);
      ctx.stroke();
    }

    // soft circles
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.5)';
    for (let i = 0; i < 10; i++) {
      const radius = Math.random() * 80 + 20;
      const cx = Math.random() * w;
      const cy = Math.random() * h;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // accent curve
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.85);
    ctx.bezierCurveTo(
      w * 0.25, h * 0.6,
      w * 0.55, h,
      w,       h * 0.75
    );
    ctx.stroke();
  }
}

registerPaint('heroPattern', HeroPattern);
