/* CustomCursor.jsx — recreates the dot + lagging ring */
const { useEffect, useRef } = React;

function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const state = useRef({ mx: 0, my: 0, rx: 0, ry: 0, raf: 0 });

  useEffect(() => {
    if (matchMedia('(hover: none)').matches || window.innerWidth < 768) return;
    document.body.setAttribute('data-cursor-mode', 'ghost');
    const dot = dotRef.current, ring = ringRef.current;
    const onMove = (e) => {
      state.current.mx = e.clientX;
      state.current.my = e.clientY;
      if (dot) dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    };
    const tick = () => {
      const s = state.current;
      s.rx += (s.mx - s.rx) * 0.18;
      s.ry += (s.my - s.ry) * 0.18;
      if (ring) ring.style.transform = `translate(${s.rx}px, ${s.ry}px) translate(-50%, -50%)`;
      s.raf = requestAnimationFrame(tick);
    };
    const onDown = () => ring && ring.classList.add('clicking');
    const onUp = () => ring && ring.classList.remove('clicking');
    const onOver = (e) => {
      const t = e.target.closest('[data-cursor="hover"], a, button, input, textarea, select');
      if (!t) return;
      ring && ring.classList.add('hovering');
    };
    const onOut = (e) => {
      const t = e.target.closest('[data-cursor="hover"], a, button, input, textarea, select');
      if (!t) return;
      ring && ring.classList.remove('hovering');
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);
    tick();
    return () => {
      cancelAnimationFrame(state.current.raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
      document.body.removeAttribute('data-cursor-mode');
    };
  }, []);

  return (
    <React.Fragment>
      <div className="cursor-ring" ref={ringRef}></div>
      <div className="cursor-dot" ref={dotRef}></div>
    </React.Fragment>
  );
}

window.CustomCursor = CustomCursor;
