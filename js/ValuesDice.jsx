/* ValuesDice.jsx — 3D dice with throw physics.
   Moving the mouse over the dice steers it (spring follow).
   Moving the mouse quickly and leaving "throws" it — the dice keeps
   spinning with that velocity and decays slowly, like an object in water. */

const DICE_FACES = [
  {
    face: 'right',
    num: '01',
    title: 'Autenticidade',
    desc: 'Conteúdo de quem tá no meio do processo — não de quem já chegou lá e esqueceu como foi.',
  },
  {
    face: 'back',
    num: '02',
    title: 'Sem julgamento',
    desc: 'Dúvida básica? Sem problema. Pergunta livre, julgamento zero.',
  },
  {
    face: 'left',
    num: '03',
    title: 'Progresso real',
    desc: 'Consistência, não velocidade. Um dia ruim não define a jornada — define o que você faz no dia seguinte.',
  },
  {
    face: 'top',
    num: '04',
    title: 'Acesso livre',
    desc: 'Gratuito. Sempre. Conhecimento não pode ser barreira pra quem já tem tantas outras na vida.',
  },
];

const IDLE = { x: -16, y: -28 };

// While mouse is over: spring chasing the cursor
const SPRING_K    = 0.055;
const SPRING_DAMP = 0.75;

// After mouse leaves: pure inertia — decays like object in water
const SPIN_DAMP = 0.978;  // ~0.978 = spins for ~3-4s naturally

function Dice() {
  const stageRef     = React.useRef(null);
  const rotRef       = React.useRef({ ...IDLE });
  const velRef       = React.useRef({ x: 0, y: 0 });
  const targetRef    = React.useRef({ ...IDLE });
  const trackingRef  = React.useRef(false);   // true while mouse is over dice
  const prevMouseRef = React.useRef(null);    // last normalized mouse position
  const throwVelRef  = React.useRef({ x: 0, y: 0 }); // smoothed mouse velocity
  const [rot, setRot] = React.useState(IDLE);

  React.useEffect(() => {
    let raf;

    const tick = () => {
      if (trackingRef.current) {
        // Spring: pull dice toward the cursor target
        const dx = targetRef.current.x - rotRef.current.x;
        const dy = targetRef.current.y - rotRef.current.y;
        velRef.current.x = velRef.current.x * SPRING_DAMP + dx * SPRING_K;
        velRef.current.y = velRef.current.y * SPRING_DAMP + dy * SPRING_K;
      } else {
        // Free spin: no attractor — just let inertia decay
        velRef.current.x *= SPIN_DAMP;
        velRef.current.y *= SPIN_DAMP;
      }

      const vx = velRef.current.x;
      const vy = velRef.current.y;

      if (Math.abs(vx) > 0.002 || Math.abs(vy) > 0.002) {
        rotRef.current.x += vx;
        rotRef.current.y += vy;
        setRot({ x: rotRef.current.x, y: rotRef.current.y });
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const onMove = (e) => {
    const r = stageRef.current?.getBoundingClientRect();
    if (!r) return;

    const nx = (e.clientX - r.left) / r.width;
    const ny = (e.clientY - r.top)  / r.height;

    // Accumulate mouse velocity (smoothed with EMA) for the throw
    if (prevMouseRef.current) {
      const dcx = nx - prevMouseRef.current.x;
      const dcy = ny - prevMouseRef.current.y;
      // Convert normalized delta → rotation delta, then smooth
      const rawVx = dcy * -55;
      const rawVy = dcx * 140;
      throwVelRef.current.x = throwVelRef.current.x * 0.55 + rawVx * 0.45;
      throwVelRef.current.y = throwVelRef.current.y * 0.55 + rawVy * 0.45;
    }
    prevMouseRef.current = { x: nx, y: ny };

    trackingRef.current = true;
    targetRef.current = {
      x: 36 - ny * 72,
      y: nx * 180 - 90,
    };
  };

  const onLeave = () => {
    trackingRef.current = false;

    // Inject throw velocity — dice continues spinning after mouse leaves
    velRef.current.x += throwVelRef.current.x;
    velRef.current.y += throwVelRef.current.y;

    // Reset accumulators
    throwVelRef.current = { x: 0, y: 0 };
    prevMouseRef.current = null;
  };

  return (
    <div className="dice-stage" ref={stageRef} onMouseMove={onMove} onMouseLeave={onLeave}>
      <div className="dice" style={{ transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)` }}>

        {/* Front face — D30 brand, default visible */}
        <div className="dice-face dice-face--front">
          <div className="dice-brand">D<span>30</span></div>
          <div className="dice-brand-sub">Dev aos 30. E em qualquer idade.</div>
        </div>

        {DICE_FACES.map((f) => (
          <div key={f.face} className={'dice-face dice-face--' + f.face}>
            <div className="dice-face-num">{f.num}<span className="dice-face-total"> / 04</span></div>
            <div>
              <h3 className="dice-face-title">{f.title}</h3>
              <p className="dice-face-desc">{f.desc}</p>
            </div>
          </div>
        ))}

        {/* Bottom face */}
        <div className="dice-face dice-face--bottom">
          <div className="dice-tagline-eyebrow">A regra</div>
          <div className="dice-tagline">D30 é de todo mundo.</div>
          <div className="dice-tagline-foot">@Dev.aos30</div>
        </div>

      </div>
    </div>
  );
}

window.Dice = Dice;
window.DICE_FACES = DICE_FACES;
