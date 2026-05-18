/* Preloader.jsx — D30 intro animation.
   A mountain silhouette draws itself; a glowing climber (blue dot)
   walks up the left slope from "zero" at the foot to "dream" at the peak.
   A 0 → 100% counter ticks along the climber's progress. When it hits
   100%, the scene fades out and reveals the site.

   Plays once per session (sessionStorage flag). Click anywhere to skip. */

function Preloader({ onDone }) {
  const [pct, setPct] = React.useState(0);
  const [hiding, setHiding] = React.useState(false);

  React.useEffect(() => {
    const DURATION = 3000;          // ms 0 → 100
    const HOLD     = 350;           // hold at 100% before fade
    const FADE_OUT = 600;           // fade duration
    const start = performance.now();
    let raf = 0;
    let done = false;
    const tick = (now) => {
      const elapsed = now - start;
      const p = Math.min(100, (elapsed / DURATION) * 100);
      setPct(Math.floor(p));
      if (p < 100) {
        raf = requestAnimationFrame(tick);
      } else if (!done) {
        done = true;
        setTimeout(() => setHiding(true), HOLD);
        setTimeout(onDone, HOLD + FADE_OUT);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  const skip = () => {
    setHiding(true);
    setTimeout(onDone, 350);
  };

  return (
    <div
      className={'preloader' + (hiding ? ' is-hiding' : '')}
      onClick={skip}
      role="img"
      aria-label="D30 — do zero ao sonho."
    >
      {/* The peak word — fades in as the climber nears the summit */}
      <div className="preloader-top"><span>dream</span></div>

      <svg className="preloader-svg" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet">
        {/* Faint twinkling stars in the sky */}
        <g className="stars">
          <circle cx="120" cy="120" r="1.5"/>
          <circle cx="280" cy="60"  r="1"/>
          <circle cx="560" cy="40"  r="1.8"/>
          <circle cx="720" cy="100" r="1"/>
          <circle cx="880" cy="150" r="1.4"/>
          <circle cx="180" cy="200" r="0.8"/>
          <circle cx="620" cy="120" r="1"/>
          <circle cx="820" cy="60"  r="1.2"/>
        </g>

        {/* Mountain silhouette — soft fill */}
        <path className="m-fill" d="M0,540 L180,490 L400,80 L560,300 L760,180 L1000,540 Z" />

        {/* Mountain outline — strokes itself in */}
        <path className="m-line" d="M0,540 L180,490 L400,80 L560,300 L760,180 L1000,540" />

        {/* Trail line — the left slope (climber's route) */}
        <path id="climbPath" className="m-trail" d="M100,540 L400,80" />

        {/* The climber — dot + halo + walks the trail */}
        <g className="climber-group">
          <circle className="climber-halo" r="14" />
          <circle className="climber" r="7" />
          <animateMotion dur="2.6s" begin="0.4s" fill="freeze" rotate="auto">
            <mpath href="#climbPath" />
          </animateMotion>
        </g>

        {/* Peak marker — pulses when the climber arrives */}
        <circle className="peak-marker" cx="400" cy="80" r="3" />
      </svg>

      {/* The 0 → 100 % counter — heart of the load */}
      <div className="preloader-meter">
        <div className="preloader-bar">
          <div className="preloader-bar-fill" style={{ width: pct + '%' }}></div>
        </div>
        <div className="preloader-pct">
          {String(pct).padStart(3, '0')}<span className="preloader-pct-unit">%</span>
        </div>
      </div>

      {/* The starting line — "zero" word */}
      <div className="preloader-bottom"><span>zero</span></div>

      <div className="preloader-skip">clique pra pular</div>
    </div>
  );
}

window.Preloader = Preloader;
