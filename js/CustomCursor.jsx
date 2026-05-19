/* CustomCursor.jsx — dot + ring, sem lag */
const { useEffect, useRef } = React;

function CustomCursor() {
  const dotRef  = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    if (matchMedia('(hover: none)').matches || window.innerWidth < 768) return;
    document.body.setAttribute('data-cursor-mode', 'ghost');
    const dot = dotRef.current, ring = ringRef.current;
    let cx = 0, cy = 0, raf = 0;

    const move = (e) => { cx = e.clientX; cy = e.clientY; };

    const tick = () => {
      const t = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
      if (dot)  dot.style.transform  = t;
      if (ring) ring.style.transform = t;
      raf = requestAnimationFrame(tick);
    };

    const onDown = () => ring && ring.classList.add('clicking');
    const onUp   = () => ring && ring.classList.remove('clicking');

    const onOver = (e) => {
      if (e.target.closest('[data-cursor="hover"], a, button, input, textarea, select'))
        ring && ring.classList.add('hovering');
    };
    const onOut = (e) => {
      if (e.target.closest('[data-cursor="hover"], a, button, input, textarea, select'))
        ring && ring.classList.remove('hovering');
    };

    window.addEventListener('mousemove', move, { passive: true });
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup',   onUp);
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout',  onOut);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup',   onUp);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout',  onOut);
      document.body.removeAttribute('data-cursor-mode');
    };
  }, []);

  return (
    <React.Fragment>
      <div className="cursor-ring" ref={ringRef}></div>
      <div className="cursor-dot"  ref={dotRef}></div>
    </React.Fragment>
  );
}

window.CustomCursor = CustomCursor;
