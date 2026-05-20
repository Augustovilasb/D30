/* TrackerDashboard.jsx — KPI Cards + gráficos interativos estilo Power BI */

const PERF_SCORE   = { 'Rendeu muito': 100, 'Médio': 50, 'Não rendeu': 0 };
const ENERGY_SCORE = { 'Disposto': 100, 'Neutro': 50, 'Cansado': 0 };
const FOCUS_SCORE  = { 'Focado': 100, 'Distraído': 0 };
const MOOD_SCORE   = { 'Motivado': 100, 'Neutro': 50, 'Ansioso': 25 };
const GOAL_SCORE   = { 'Bateu': 100, 'Parcialmente': 50, 'Sem meta': 25, 'Não bateu': 0 };

function scoreAvg(sessions, fn) {
  const vals = sessions.map(fn).filter(v => v !== undefined && !isNaN(v));
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
}

function fmtH(secs) { return (secs / 3600).toFixed(1); }

/* ── Watch dark mode ── */
function useDark() {
  const [dark, setDark] = React.useState(
    () => document.documentElement.getAttribute('data-theme') === 'dark'
  );
  React.useEffect(() => {
    const obs = new MutationObserver(() =>
      setDark(document.documentElement.getAttribute('data-theme') === 'dark')
    );
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

/* ── Chart.js canvas ── */
function ChartCanvas({ cfg, height = 220 }) {
  const ref   = React.useRef(null);
  const chart = React.useRef(null);
  const key   = JSON.stringify(cfg);
  React.useEffect(() => {
    if (!ref.current || !window.Chart) return;
    chart.current?.destroy();
    chart.current = new window.Chart(ref.current, cfg);
    return () => chart.current?.destroy();
  }, [key]);
  return <canvas ref={ref} height={height} style={{ width: '100%' }} />;
}

/* ── Activity Heatmap ── */
function ActivityHeatmap({ sessions }) {
  const sessMap = React.useMemo(() => {
    const m = {};
    sessions.forEach(s => { m[s.date] = (m[s.date] || 0) + (s.duration || 0); });
    return m;
  }, [sessions]);

  const weeks = React.useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const cells = [];
    for (let i = 364; i >= 0; i--) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      cells.push({ date: key, secs: sessMap[key] || 0 });
    }
    const pad = new Date(cells[0].date).getDay();
    const padded = [...Array(pad).fill(null), ...cells];
    const w = [];
    for (let i = 0; i < padded.length; i += 7) w.push(padded.slice(i, i + 7));
    return w;
  }, [sessMap]);

  function color(secs) {
    if (!secs) return 'var(--bg3)';
    const h = secs / 3600;
    if (h < 1) return '#bbf7d0';
    if (h < 2) return '#4ade80';
    if (h < 4) return '#16a34a';
    return '#15803d';
  }

  return (
    <div className="trk-section">
      <p className="trk-chart-title">Atividade — últimos 12 meses</p>
      <div className="trk-heatmap-scroll">
        <div className="trk-heatmap-grid">
          {weeks.map((week, wi) => (
            <div key={wi} className="trk-heatmap-week">
              {Array.from({ length: 7 }, (_, di) => {
                const day = week[di];
                return (
                  <div
                    key={di}
                    className="trk-heatmap-cell"
                    style={{ background: day ? color(day.secs) : 'transparent' }}
                    title={day ? `${day.date}: ${fmtH(day.secs)}h` : ''}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="trk-heatmap-legend">
        <span>Menos</span>
        {[0, 1800, 7200, 14400, 18000].map((s, i) => (
          <div key={i} className="trk-heatmap-cell" style={{ background: color(s) }} />
        ))}
        <span>Mais</span>
      </div>
    </div>
  );
}

/* ── KPI Card ── */
function KpiCard({ label, value, sub, trend }) {
  return (
    <div className="trk-kpi-card">
      <div className="trk-kpi-value">{value}</div>
      <div className="trk-kpi-label">{label}</div>
      <div className="trk-kpi-meta">
        {trend !== null && trend !== undefined && (
          <span className={'trk-kpi-trend ' + (trend > 0 ? 'up' : trend < 0 ? 'down' : 'flat')}>
            {trend > 0 ? '↑' : trend < 0 ? '↓' : '—'} {Math.abs(trend)}%
          </span>
        )}
        {sub && <span className="trk-kpi-sub">{sub}</span>}
      </div>
    </div>
  );
}

/* ── Impact bar chart ── */
function ImpactChart({ sessions, field, labels, title, onFilter, activeVal, dark }) {
  const data = React.useMemo(() => labels.map(l => {
    const group = sessions.filter(s => s[field] === l);
    return group.length
      ? +(scoreAvg(group, s => PERF_SCORE[s.performance])).toFixed(0)
      : 0;
  }), [sessions, field, labels]);

  const accent = dark ? '#ffffff' : '#111111';
  const normal = 'rgba(99,102,241,0.55)';

  const cfg = React.useMemo(() => ({
    type: 'bar',
    data: {
      labels: labels.map(l => l.length > 14 ? l.slice(0, 14) + '…' : l),
      datasets: [{ data, backgroundColor: labels.map(l => activeVal === l ? accent : normal), borderRadius: 6, borderSkipped: false }],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` Score médio: ${ctx.raw}/100` } } },
      scales: {
        x: { ticks: { color: dark ? '#888' : '#666', font: { size: 11 } }, grid: { display: false } },
        y: { min: 0, max: 100, ticks: { color: dark ? '#888' : '#666', font: { size: 11 } }, grid: { color: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' } },
      },
      onClick: (_e, els) => { if (els.length) onFilter(field, labels[els[0].index]); },
    },
  }), [data, labels, dark, activeVal, accent]);

  return (
    <div className="trk-chart-card">
      <div className="trk-chart-head">
        <p className="trk-chart-title">{title}</p>
        {activeVal && <span className="trk-chart-badge">filtrado ✕</span>}
      </div>
      <ChartCanvas cfg={cfg} height={200} />
      <p className="trk-chart-hint">Clique para filtrar</p>
    </div>
  );
}

/* ── Main Dashboard ── */
function TrackerDashboard({ onStartTimer }) {
  const dark = useDark();
  const [timeRange,    setTimeRange]    = React.useState(30);
  const [activeFilter, setActiveFilter] = React.useState(null); // { field, value }

  const allSessions = React.useMemo(() => window.Data.load(), []);

  const ranged = React.useMemo(() => {
    if (!timeRange) return allSessions;
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - timeRange); cutoff.setHours(0, 0, 0, 0);
    return allSessions.filter(s => new Date(s.date) >= cutoff);
  }, [allSessions, timeRange]);

  const sessions = React.useMemo(() => {
    if (!activeFilter) return ranged;
    return ranged.filter(s => s[activeFilter.field] === activeFilter.value);
  }, [ranged, activeFilter]);

  const prev = React.useMemo(() => {
    if (!timeRange) return [];
    const end   = new Date(); end.setDate(end.getDate() - timeRange);
    const start = new Date(); start.setDate(start.getDate() - timeRange * 2);
    return allSessions.filter(s => { const d = new Date(s.date); return d >= start && d < end; });
  }, [allSessions, timeRange]);

  const kpis = React.useMemo(() => {
    const total   = sessions.reduce((a, s) => a + (s.duration || 0), 0);
    const pTotal  = prev.reduce((a, s) => a + (s.duration || 0), 0);
    const trend   = pTotal > 0 ? Math.round((total - pTotal) / pTotal * 100) : null;
    const high    = sessions.filter(s => s.performance === 'Rendeu muito').length;
    const avgSecs = sessions.length ? total / sessions.length : 0;
    return {
      total, trend, high, avgSecs,
      count:  sessions.length,
      streak: window.Data.getCurrentStreak(),
      best:   window.Data.getBestStreak(),
      allH:   window.Data.getTotalSeconds(),
    };
  }, [sessions, prev]);

  const setFilter = (field, value) => {
    setActiveFilter(f => (f?.field === field && f?.value === value) ? null : { field, value });
  };

  const PERIODS = ['Manhã', 'Tarde', 'Noite', 'Madrugada'];
  const TYPES   = ['Vídeo', 'Leitura', 'Prática/Código', 'Exercícios'];
  const accent  = dark ? '#fff' : '#111';
  const grid    = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const tick    = dark ? '#888' : '#666';

  /* hours/day */
  const hoursPerDayCfg = React.useMemo(() => {
    const n = timeRange || 30;
    const map = {};
    sessions.forEach(s => { map[s.date] = (map[s.date] || 0) + (s.duration || 0); });
    const labels = [], data = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const k = d.toISOString().split('T')[0];
      labels.push(i === 0 ? 'Hoje' : d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
      data.push(+((map[k] || 0) / 3600).toFixed(2));
    }
    return {
      type: 'bar',
      data: { labels, datasets: [{ data, backgroundColor: 'rgba(99,102,241,0.65)', borderRadius: 4, borderSkipped: false }] },
      options: {
        responsive: true,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.raw}h` } } },
        scales: {
          x: { ticks: { color: tick, font: { size: 10 }, maxTicksLimit: 12 }, grid: { display: false } },
          y: { ticks: { color: tick, font: { size: 11 } }, grid: { color: grid } },
        },
      },
    };
  }, [sessions, timeRange, dark]);

  /* performance by period */
  const perfPeriodCfg = React.useMemo(() => {
    const data = PERIODS.map(p => {
      const g = sessions.filter(s => s.period === p);
      return g.length ? +((g.filter(s => s.performance === 'Rendeu muito').length / g.length * 100).toFixed(0)) : 0;
    });
    return {
      type: 'bar',
      data: {
        labels: PERIODS,
        datasets: [{ data, backgroundColor: PERIODS.map(p => activeFilter?.value === p ? accent : 'rgba(99,102,241,0.6)'), borderRadius: 6, borderSkipped: false }],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.raw}% alto rendimento` } } },
        scales: {
          x: { ticks: { color: tick, font: { size: 12 } }, grid: { display: false } },
          y: { min: 0, max: 100, ticks: { color: tick, font: { size: 11 } }, grid: { color: grid } },
        },
        onClick: (_e, els) => { if (els.length) setFilter('period', PERIODS[els[0].index]); },
      },
    };
  }, [sessions, dark, activeFilter]);

  /* hours by type */
  const hoursByTypeCfg = React.useMemo(() => {
    const data = TYPES.map(t => +((sessions.filter(s => s.studyType === t).reduce((a, s) => a + (s.duration || 0), 0) / 3600).toFixed(1)));
    return {
      type: 'bar',
      data: {
        labels: TYPES,
        datasets: [{ data, backgroundColor: TYPES.map(t => activeFilter?.value === t ? accent : 'rgba(16,185,129,0.6)'), borderRadius: 6, borderSkipped: false }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.raw}h` } } },
        scales: {
          x: { ticks: { color: tick, font: { size: 11 } }, grid: { color: grid } },
          y: { ticks: { color: tick, font: { size: 12 } }, grid: { display: false } },
        },
        onClick: (_e, els) => { if (els.length) setFilter('studyType', TYPES[els[0].index]); },
      },
    };
  }, [sessions, dark, activeFilter]);

  /* radar */
  const radarCfg = React.useMemo(() => ({
    type: 'radar',
    data: {
      labels: ['Energia', 'Rendimento', 'Foco', 'Motivação', 'Metas'],
      datasets: [{
        data: [
          scoreAvg(sessions, s => ENERGY_SCORE[s.energy]),
          scoreAvg(sessions, s => PERF_SCORE[s.performance]),
          scoreAvg(sessions, s => FOCUS_SCORE[s.focus]),
          scoreAvg(sessions, s => MOOD_SCORE[s.mood]),
          scoreAvg(sessions, s => GOAL_SCORE[s.goalStatus]),
        ].map(v => +v.toFixed(0)),
        backgroundColor: 'rgba(99,102,241,0.15)',
        borderColor: 'rgba(99,102,241,0.9)',
        pointBackgroundColor: 'rgba(99,102,241,1)',
        pointRadius: 4,
      }],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        r: {
          min: 0, max: 100,
          ticks: { display: false },
          grid: { color: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' },
          pointLabels: { color: dark ? '#ccc' : '#444', font: { size: 11 } },
          angleLines: { color: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' },
        },
      },
    },
  }), [sessions, dark]);

  if (!allSessions.length) {
    return (
      <div className="trk-empty">
        <div className="trk-empty-icon">📊</div>
        <p className="trk-empty-title">Nenhuma sessão ainda</p>
        <p className="trk-empty-sub">Registre sua primeira sessão para ver o dashboard.</p>
        <button className="trk-start-btn" data-cursor="hover" onClick={onStartTimer}>Iniciar Sessão</button>
      </div>
    );
  }

  return (
    <div className="trk-dashboard">

      {/* Filter bar */}
      <div className="trk-filter-bar">
        <div className="trk-time-filters">
          {[7, 30, 90, null].map(r => (
            <button key={String(r)} className={'trk-filter-pill' + (timeRange === r ? ' active' : '')} data-cursor="hover" onClick={() => setTimeRange(r)}>
              {r === null ? 'Tudo' : r === 7 ? '7 dias' : r === 30 ? '30 dias' : '3 meses'}
            </button>
          ))}
        </div>
        {activeFilter && (
          <button className="trk-active-filter-chip" data-cursor="hover" onClick={() => setActiveFilter(null)}>
            {activeFilter.value} ✕
          </button>
        )}
      </div>

      {/* KPI */}
      <div className="trk-kpi-row">
        <KpiCard label="Horas no período"    value={fmtH(kpis.total) + 'h'}                        trend={kpis.trend} />
        <KpiCard label="Sessões"             value={kpis.count}                                      sub={`média ${fmtH(kpis.avgSecs)}h`} />
        <KpiCard label="Alto rendimento"     value={kpis.count ? Math.round(kpis.high / kpis.count * 100) + '%' : '—'} sub={`${kpis.high} sessões`} />
        <KpiCard label="Streak atual"        value={kpis.streak + ' 🔥'}                             sub={`melhor: ${kpis.best} dias`} />
        <KpiCard label="Total acumulado"     value={fmtH(kpis.allH) + 'h'}                          sub="histórico completo" />
      </div>

      {/* Heatmap */}
      <ActivityHeatmap sessions={allSessions} />

      {/* Charts */}
      <div className="trk-charts-grid">
        <div className="trk-chart-card">
          <p className="trk-chart-title">Horas por dia</p>
          <ChartCanvas cfg={hoursPerDayCfg} />
        </div>

        <div className="trk-chart-card">
          <div className="trk-chart-head">
            <p className="trk-chart-title">Rendimento por turno</p>
            {activeFilter?.field === 'period' && <span className="trk-chart-badge">filtrado ✕</span>}
          </div>
          <ChartCanvas cfg={perfPeriodCfg} />
          <p className="trk-chart-hint">Clique para filtrar</p>
        </div>

        <div className="trk-chart-card">
          <div className="trk-chart-head">
            <p className="trk-chart-title">Horas por tipo de estudo</p>
            {activeFilter?.field === 'studyType' && <span className="trk-chart-badge">filtrado ✕</span>}
          </div>
          <ChartCanvas cfg={hoursByTypeCfg} />
          <p className="trk-chart-hint">Clique para filtrar</p>
        </div>

        <div className="trk-chart-card">
          <p className="trk-chart-title">Perfil geral</p>
          <ChartCanvas cfg={radarCfg} />
        </div>

        <ImpactChart sessions={sessions} field="sleep"     labels={['Dormi muito bem','Dormi ok','Dormi pouco','Não dormi direito']} title="Impacto do sono"         onFilter={setFilter} activeVal={activeFilter?.field==='sleep'     ? activeFilter.value : null} dark={dark} />
        <ImpactChart sessions={sessions} field="nutrition" labels={['Me alimentei bem','Normal','Me alimentei mal']}                 title="Impacto da alimentação"  onFilter={setFilter} activeVal={activeFilter?.field==='nutrition' ? activeFilter.value : null} dark={dark} />
        <ImpactChart sessions={sessions} field="hydration" labels={['Bebi bastante','Normal','Bebi pouco']}                          title="Impacto da hidratação"   onFilter={setFilter} activeVal={activeFilter?.field==='hydration' ? activeFilter.value : null} dark={dark} />
        <ImpactChart sessions={sessions} field="activity"  labels={['Me exercitei','Caminhei','Fiquei parado']}                      title="Impacto da atividade"    onFilter={setFilter} activeVal={activeFilter?.field==='activity'  ? activeFilter.value : null} dark={dark} />
      </div>

      {sessions.length === 0 && (
        <p className="trk-no-results">
          Nenhuma sessão com esse filtro.{' '}
          <button className="trk-link" data-cursor="hover" onClick={() => setActiveFilter(null)}>Limpar filtro</button>
        </p>
      )}
    </div>
  );
}

Object.assign(window, { TrackerDashboard });
