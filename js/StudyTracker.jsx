/* StudyTracker.jsx — timer, formulário, dashboard integrados */

function getPeriod(date) {
  const h = date.getHours();
  if (h >= 5  && h < 12) return 'Manhã';
  if (h >= 12 && h < 18) return 'Tarde';
  if (h >= 18 && h < 24) return 'Noite';
  return 'Madrugada';
}

function formatTime(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
}

function PillGroup({ label, options, value, onChange }) {
  return (
    <div className="trk-pill-group">
      <span className="trk-pill-label">{label}</span>
      <div className="trk-pill-options">
        {options.map(opt => (
          <button key={opt} type="button" data-cursor="hover"
            className={'trk-pill' + (value === opt ? ' active' : '')}
            onClick={() => onChange(opt)}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Badge toast ── */
function BadgeToast({ badge, onDone }) {
  React.useEffect(() => {
    const t = setTimeout(onDone, 4000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="trk-badge-toast">
      <span className="trk-badge-toast-icon">{badge.icon}</span>
      <div>
        <p className="trk-badge-toast-title">Badge desbloqueada!</p>
        <p className="trk-badge-toast-name">{badge.name}</p>
      </div>
    </div>
  );
}

/* ── AI Analysis ── */
const AI_LAST_KEY    = type => `d30_ai_last_${type}`;
const MIN_DAILY_SECS = 30 * 60;

/* helpers */
function perfScore(s)   { return ({ 'Rendeu muito': 100, 'Médio': 50, 'Não rendeu': 0 })[s.performance] ?? 50; }
function energyScore(s) { return ({ 'Disposto': 100, 'Neutro': 50, 'Cansado': 0 })[s.energy] ?? 50; }
function avg(arr)       { return arr.length ? +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : 0; }
function pct(n, t)      { return t ? Math.round(n / t * 100) : 0; }

function computeMetrics(sessions) {
  if (!sessions.length) return {};
  const totalMins   = Math.round(sessions.reduce((a, s) => a + (s.duration || 0), 0) / 60);
  const avgPerf     = avg(sessions.map(perfScore));
  const avgEnergy   = avg(sessions.map(energyScore));
  const highPerf    = pct(sessions.filter(s => s.performance === 'Rendeu muito').length, sessions.length);
  const byPeriod    = ['Manhã','Tarde','Noite','Madrugada'].map(p => {
    const g = sessions.filter(s => s.period === p);
    return { period: p, sessoes: g.length, rendimento: avg(g.map(perfScore)), horas: +(g.reduce((a,s)=>a+(s.duration||0),0)/3600).toFixed(1) };
  }).filter(p => p.sessoes > 0);
  const byType      = ['Vídeo','Leitura','Prática/Código','Exercícios'].map(t => {
    const g = sessions.filter(s => s.studyType === t);
    return { tipo: t, sessoes: g.length, rendimento: avg(g.map(perfScore)) };
  }).filter(t => t.sessoes > 0);
  const sleepImpact = ['Dormi muito bem','Dormi ok','Dormi pouco','Não dormi direito'].map(sl => {
    const g = sessions.filter(s => s.sleep === sl);
    return { sono: sl, rendimento: avg(g.map(perfScore)), sessoes: g.length };
  }).filter(s => s.sessoes > 0);
  const streak      = window.Data.getCurrentStreak();
  const bestStreak  = window.Data.getBestStreak();
  const days        = [...new Set(sessions.map(s => s.date))].length;
  return { totalMins, avgPerf, avgEnergy, highPerf, byPeriod, byType, sleepImpact, streak, bestStreak, days, total: sessions.length };
}

/* markdown renderer */
function MdRenderer({ text, loading }) {
  const lines = text.split('\n');
  const elements = [];
  let listItems = [];

  const flushList = () => {
    if (listItems.length) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="ai-md-list">
          {listItems.map((li, i) => <li key={i} className="ai-md-li">{renderInline(li)}</li>)}
        </ul>
      );
      listItems = [];
    }
  };

  const renderInline = (str) => {
    const parts = str.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, i) =>
      p.startsWith('**') && p.endsWith('**')
        ? <strong key={i} className="ai-md-bold">{p.slice(2, -2)}</strong>
        : p
    );
  };

  lines.forEach((line, i) => {
    if (line.startsWith('## ')) {
      flushList();
      elements.push(<h3 key={i} className="ai-md-h2">{line.slice(3)}</h3>);
    } else if (line.startsWith('### ')) {
      flushList();
      elements.push(<h4 key={i} className="ai-md-h3">{line.slice(4)}</h4>);
    } else if (line.startsWith('- ') || line.startsWith('• ')) {
      listItems.push(line.slice(2));
    } else if (line.trim() === '') {
      flushList();
      elements.push(<div key={i} className="ai-md-spacer" />);
    } else {
      flushList();
      elements.push(<p key={i} className="ai-md-p">{renderInline(line)}</p>);
    }
  });
  flushList();
  return (
    <div className="ai-md">
      {elements}
      {loading && <span className="trk-ai-cursor">▌</span>}
    </div>
  );
}

function AiAnalysis({ sessions, type, apiKey }) {
  const [text,    setText]    = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error,   setError]   = React.useState('');

  const today = new Date().toISOString().split('T')[0];

  const todayStudiedSecs = React.useMemo(() =>
    sessions.filter(s => s.date === today).reduce((a, s) => a + (s.duration || 0), 0),
  [sessions, today]);

  const alreadyUsedToday = React.useMemo(() => {
    try { return localStorage.getItem(AI_LAST_KEY(type)) === today; } catch { return false; }
  }, [type, today]);

  const hasWeekOfData = React.useMemo(() => {
    if (!sessions.length) return false;
    const oldest = sessions.reduce((min, s) => s.date < min ? s.date : min, sessions[0].date);
    return Math.floor((Date.now() - new Date(oldest)) / 86400000) >= 7;
  }, [sessions]);

  const daysRegistered = React.useMemo(() => {
    if (!sessions.length) return 0;
    const oldest = sessions.reduce((min, s) => s.date < min ? s.date : min, sessions[0].date);
    return Math.floor((Date.now() - new Date(oldest)) / 86400000);
  }, [sessions]);

  const hasEnoughTime = todayStudiedSecs >= MIN_DAILY_SECS;
  const canAnalyze    = hasWeekOfData && hasEnoughTime && !alreadyUsedToday;

  const blockReason = !hasWeekOfData
    ? `${daysRegistered} dia${daysRegistered !== 1 ? 's' : ''} de dados registrados. Mínimo: 7 dias.`
    : !hasEnoughTime
    ? `Estude pelo menos 30 min hoje — ${Math.round(todayStudiedSecs / 60)}min registrados.`
    : alreadyUsedToday ? 'Análise já gerada hoje. Volte amanhã.' : null;

  const buildPrompt = () => {
    const fmt = (d) => new Date(d).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });

    if (type === 'daily') {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const todayS    = sessions.filter(s => s.date === today);
      const yestS     = sessions.filter(s => s.date === yesterday);
      const weekS     = sessions.filter(s => s.date >= new Date(Date.now() - 7*86400000).toISOString().split('T')[0]);
      const mHoje     = computeMetrics(todayS);
      const mOntem    = computeMetrics(yestS);
      const mSemana   = computeMetrics(weekS);
      const deltaMins = mHoje.totalMins - (mOntem.totalMins || 0);
      const deltaPerf = mHoje.avgPerf   - (mOntem.avgPerf   || 0);

      return `Você é um coach de performance para devs em formação. Analise os dados abaixo e gere um relatório diário em português com markdown.

MÉTRICAS DE HOJE (${fmt(today)}):
- Tempo total: ${mHoje.totalMins}min | Sessões: ${mHoje.total}
- Score de rendimento médio: ${mHoje.avgPerf}/100 | Score de energia: ${mHoje.avgEnergy}/100
- % sessões de alto rendimento: ${mHoje.highPerf}%
- Distribuição por turno: ${JSON.stringify(mHoje.byPeriod)}
- Impacto do sono hoje: ${JSON.stringify(todayS.map(s => ({ sono: s.sleep, rend: s.performance })))}
- Estado físico hoje: sono=${todayS[0]?.sleep}, hidratação=${todayS[0]?.hydration}, alimentação=${todayS[0]?.nutrition}, atividade=${todayS[0]?.activity}

MÉTRICAS DE ONTEM (${fmt(yesterday)}):
- Tempo total: ${mOntem.totalMins || 0}min | Score rendimento: ${mOntem.avgPerf || 'sem dados'}/100
- Estado físico: sono=${yestS[0]?.sleep || 'sem dados'}, hidratação=${yestS[0]?.hydration || 'sem dados'}, alimentação=${yestS[0]?.nutrition || 'sem dados'}

DELTAS:
- Tempo: ${deltaMins > 0 ? '+' : ''}${deltaMins}min vs ontem
- Rendimento: ${deltaPerf > 0 ? '+' : ''}${deltaPerf.toFixed(0)} pontos vs ontem

MÉDIA DA SEMANA (referência):
- Tempo médio/dia: ${mSemana.totalMins ? Math.round(mSemana.totalMins / 7) : 0}min | Rendimento médio: ${mSemana.avgPerf}/100

FORMATO OBRIGATÓRIO (use exatamente esses headers):
## 📊 Desempenho de Hoje
[compare hoje com ontem com números exatos, mencione os deltas]

## 🔍 O que influenciou
[correlacione especificamente os dados físicos com o rendimento. Ex: "Você dormiu X hoje vs Y ontem — isso explica a queda/melhora de Z pontos"]

## ⚡ Padrão identificado
[compare com a média da semana, diga se está acima/abaixo]

## 🎯 Ação para amanhã
[1 ação específica e concreta baseada nos dados, não genérica]

Seja cirúrgico. Use **negrito** nos números importantes. Máximo 4 linhas por seção.`;
    }

    if (type === 'weekly') {
      const weekS   = sessions.filter(s => s.date >= new Date(Date.now() - 7*86400000).toISOString().split('T')[0]);
      const prevS   = sessions.filter(s => {
        const d = new Date(s.date); const now = Date.now();
        return d >= new Date(now - 14*86400000) && d < new Date(now - 7*86400000);
      });
      const mW  = computeMetrics(weekS);
      const mP  = computeMetrics(prevS);
      const byDay = [...new Set(weekS.map(s => s.date))].sort().map(d => {
        const g = weekS.filter(s => s.date === d);
        return { dia: fmt(d), mins: Math.round(g.reduce((a,s)=>a+(s.duration||0),0)/60), rend: avg(g.map(perfScore)) };
      });
      const bestDay  = byDay.reduce((best, d) => d.rend > (best?.rend||0) ? d : best, null);
      const worstDay = byDay.reduce((worst, d) => d.rend < (worst?.rend||100) ? d : worst, null);

      return `Você é um coach de performance para devs em formação. Analise a semana e gere um relatório semanal em português com markdown.

SEMANA ATUAL (últimos 7 dias):
- Total: ${mW.totalMins}min em ${mW.days} dias | ${mW.total} sessões
- Rendimento médio: ${mW.avgPerf}/100 | Alto rendimento: ${mW.highPerf}% das sessões
- Streak atual: ${mW.streak} dias | Melhor streak: ${mW.bestStreak} dias
- Melhor dia: ${bestDay?.dia} (${bestDay?.rend}/100 rendimento, ${bestDay?.mins}min)
- Pior dia: ${worstDay?.dia} (${worstDay?.rend}/100 rendimento, ${worstDay?.mins}min)
- Por turno: ${JSON.stringify(mW.byPeriod)}
- Por tipo: ${JSON.stringify(mW.byType)}
- Impacto do sono: ${JSON.stringify(mW.sleepImpact)}
- Evolução diária: ${JSON.stringify(byDay)}

SEMANA ANTERIOR (referência):
- Total: ${mP.totalMins || 0}min | Rendimento médio: ${mP.avgPerf || 0}/100

DELTAS semana atual vs anterior:
- Tempo: ${mW.totalMins - (mP.totalMins||0) > 0 ? '+' : ''}${mW.totalMins - (mP.totalMins||0)}min
- Rendimento: ${(mW.avgPerf - (mP.avgPerf||0)) > 0 ? '+' : ''}${(mW.avgPerf - (mP.avgPerf||0)).toFixed(0)} pontos

FORMATO OBRIGATÓRIO:
## 📊 Resumo da Semana
[números principais: total de horas, rendimento médio, comparação com semana anterior com delta]

## 🏆 Melhor e Pior Momento
[melhor dia com dados, pior dia com dados, por que a diferença]

## 🔍 Correlações da Semana
[relate sono/alimentação/atividade com os dias de melhor e pior rendimento, use dados reais]

## ⚡ Seu Perfil Esta Semana
[melhor turno identificado com dados, melhor tipo de estudo, padrão físico que mais impactou]

## 🎯 Foco para a Próxima Semana
[2 ajustes específicos baseados nos dados, não genéricos]

Use **negrito** nos números importantes. Máximo 4 linhas por seção.`;
    }

    /* monthly */
    const monthS  = sessions.filter(s => s.date >= new Date(Date.now() - 30*86400000).toISOString().split('T')[0]);
    const prevS   = sessions.filter(s => {
      const d = new Date(s.date); const now = Date.now();
      return d >= new Date(now - 60*86400000) && d < new Date(now - 30*86400000);
    });
    const mM  = computeMetrics(monthS);
    const mP  = computeMetrics(prevS);
    const bestPeriod = mM.byPeriod?.reduce((b,p) => p.rendimento > (b?.rendimento||0) ? p : b, null);
    const bestType   = mM.byType?.reduce((b,t) => t.rendimento > (b?.rendimento||0) ? t : b, null);
    const bestSleep  = mM.sleepImpact?.reduce((b,s) => s.rendimento > (b?.rendimento||0) ? s : b, null);

    return `Você é um coach de performance para devs em formação. Analise o mês e gere um relatório mensal completo em português com markdown.

MÉTRICAS DO MÊS (últimos 30 dias):
- Total: ${mM.totalMins}min (${(mM.totalMins/60).toFixed(1)}h) em ${mM.days} dias ativos | ${mM.total} sessões
- Rendimento médio: ${mM.avgPerf}/100 | Alto rendimento: ${mM.highPerf}% das sessões
- Streak atual: ${mM.streak} dias | Melhor streak: ${mM.bestStreak} dias
- Melhor turno: ${bestPeriod?.period} (${bestPeriod?.rendimento}/100, ${bestPeriod?.horas}h)
- Melhor tipo de estudo: ${bestType?.tipo} (${bestType?.rendimento}/100)
- Melhor condição de sono: ${bestSleep?.sono} (${bestSleep?.rendimento}/100)
- Por turno: ${JSON.stringify(mM.byPeriod)}
- Por tipo: ${JSON.stringify(mM.byType)}
- Impacto do sono: ${JSON.stringify(mM.sleepImpact)}

MÊS ANTERIOR (referência):
- Total: ${(mP.totalMins||0)}min | Rendimento: ${mP.avgPerf||0}/100 | Dias ativos: ${mP.days||0}

DELTAS mês atual vs anterior:
- Horas: ${((mM.totalMins-(mP.totalMins||0))/60) > 0 ? '+' : ''}${((mM.totalMins-(mP.totalMins||0))/60).toFixed(1)}h
- Rendimento: ${(mM.avgPerf-(mP.avgPerf||0)) > 0 ? '+' : ''}${(mM.avgPerf-(mP.avgPerf||0)).toFixed(0)} pontos
- Dias ativos: ${(mM.days||0)-(mP.days||0) > 0 ? '+' : ''}${(mM.days||0)-(mP.days||0)} dias

FORMATO OBRIGATÓRIO:
## 📊 Visão Geral do Mês
[números principais com comparação ao mês anterior, tendência geral]

## 🏆 Seu Perfil Ideal Identificado
[condições em que você performa melhor: turno + tipo de estudo + sono + outros fatores físicos, tudo com dados]

## 🔍 Correlações do Mês
[3 correlações causais identificadas nos dados: "quando X, seu rendimento foi Y% maior/menor que a média"]

## 📈 Evolução e Tendência
[está evoluindo ou estagnando? compare com mês anterior, tendência do streak]

## ⚡ O que Sabotar Você Este Mês
[o padrão de comportamento que mais derrubou seu rendimento, com dados]

## 🎯 Meta para o Próximo Mês
[meta específica e mensurável baseada nos dados: "Se você replicar X, você pode atingir Y"]

Use **negrito** nos números importantes. Máximo 5 linhas por seção.`;
  };

  const run = async () => {
    if (!apiKey) { setError('Configure sua API key da Anthropic em Meu Perfil.'); return; }
    setLoading(true); setText(''); setError('');
    try { localStorage.setItem(AI_LAST_KEY(type), today); } catch {}
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1200,
          stream: true,
          messages: [{ role: 'user', content: buildPrompt() }],
        }),
      });
      if (!res.ok) throw new Error('Erro ' + res.status);
      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value).split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6);
          if (raw === '[DONE]') break;
          try {
            const j = JSON.parse(raw);
            if (j.type === 'content_block_delta' && j.delta?.text) setText(t => t + j.delta.text);
          } catch {}
        }
      }
    } catch (e) {
      try { localStorage.removeItem(AI_LAST_KEY(type)); } catch {}
      setError('Não foi possível gerar a análise. Verifique sua API key em Meu Perfil.');
    }
    setLoading(false);
  };

  const LABELS = { daily: 'Análise do Dia', weekly: 'Análise da Semana', monthly: 'Análise do Mês' };
  const ICONS  = { daily: '📅', weekly: '📆', monthly: '🗓️' };

  return (
    <div className="trk-ai-block">
      <div className="trk-ai-head">
        <span className="trk-ai-label">{ICONS[type]} {LABELS[type]}</span>
        <button className="trk-ai-btn" data-cursor="hover" onClick={run} disabled={loading || !canAnalyze}>
          {loading ? 'Gerando...' : alreadyUsedToday ? 'Gerado hoje ✓' : 'Gerar relatório'}
        </button>
      </div>
      {blockReason && !text && <p className="trk-ai-warn">{blockReason}</p>}
      {error && <p className="trk-ai-error">{error}</p>}
      {loading && !text && (
        <div className="trk-ai-skeleton">
          <div className="trk-ai-sk-line w70" />
          <div className="trk-ai-sk-line w100" />
          <div className="trk-ai-sk-line w85" />
          <div className="trk-ai-sk-line w60" />
        </div>
      )}
      {text && <MdRenderer text={text} loading={loading} />}
    </div>
  );
}

/* ── Tela idle ── */
function TrackerIdle({ onStart }) {
  return (
    <div className="trk-idle">
      <div className="trk-idle-icon">⏱</div>
      <h1 className="trk-idle-title">Pronto para estudar?</h1>
      <p className="trk-idle-sub">Inicie a sessão e registre seu progresso.</p>
      <button className="trk-start-btn" data-cursor="hover" onClick={onStart}>Iniciar Sessão</button>
    </div>
  );
}

/* ── Timer ativo ── */
function TrackerActive({ elapsed, paused, onPause, onResume, onEnd }) {
  return (
    <div className="trk-active">
      <span className="trk-status-badge">{paused ? 'Pausado' : 'Sessão em andamento'}</span>
      <div className={'trk-clock' + (paused ? ' paused' : '')}>{formatTime(elapsed)}</div>
      <div className="trk-active-actions">
        {paused
          ? <button className="trk-btn trk-btn--resume" data-cursor="hover" onClick={onResume}>▶ Retomar</button>
          : <button className="trk-btn trk-btn--pause"  data-cursor="hover" onClick={onPause}>⏸ Pausar</button>
        }
        <button className="trk-btn trk-btn--end" data-cursor="hover" onClick={onEnd}>Encerrar Sessão</button>
      </div>
    </div>
  );
}

/* ── Formulário ── */
function TrackerForm({ elapsed, form, setField, isComplete, onSave, saving }) {
  return (
    <div className="trk-form-wrap">
      <div className="trk-form-header">
        <h2 className="trk-form-title">Como foi a sessão?</h2>
        <div className="trk-form-duration">
          <span className="trk-form-duration-val">{formatTime(elapsed)}</span>
          <span className="trk-form-duration-label">duração</span>
        </div>
      </div>
      <div className="trk-form-body">
        <div className="trk-form-section">
          <p className="trk-section-title">Sessão</p>
          <div className="trk-field">
            <label className="trk-field-label">O que você estudou?</label>
            <input className="trk-input" type="text" placeholder="Ex: Spring Boot — injeção de dependência"
              value={form.subject} onChange={e => setField('subject')(e.target.value)} maxLength={120} />
          </div>
          <PillGroup label="Tipo de estudo"    options={['Vídeo','Leitura','Prática/Código','Exercícios']} value={form.studyType}      onChange={setField('studyType')} />
          <PillGroup label="Período"           options={['Manhã','Tarde','Noite','Madrugada']}             value={form.period}          onChange={setField('period')} />
        </div>

        <div className="trk-form-section">
          <p className="trk-section-title">Estado Mental</p>
          <PillGroup label="Nível de energia"       options={['Disposto','Neutro','Cansado']}                         value={form.energy}         onChange={setField('energy')} />
          <PillGroup label="Rendimento percebido"   options={['Rendeu muito','Médio','Não rendeu']}                   value={form.performance}    onChange={setField('performance')} />
          <PillGroup label="Humor"                  options={['Motivado','Neutro','Ansioso']}                         value={form.mood}           onChange={setField('mood')} />
          <PillGroup label="Foco"                   options={['Focado','Distraído']}                                  value={form.focus}          onChange={setField('focus')} />
          <PillGroup label="Gostou do assunto?"     options={['Amei','Ok','Não curti']}                               value={form.subjectFeeling} onChange={setField('subjectFeeling')} />
          <PillGroup label="Meta do dia"            options={['Bateu','Parcialmente','Sem meta','Não bateu']}          value={form.goalStatus}     onChange={setField('goalStatus')} />
        </div>

        <div className="trk-form-section">
          <p className="trk-section-title">Estado Físico</p>
          <PillGroup label="Qualidade do sono"  options={['Dormi muito bem','Dormi ok','Dormi pouco','Não dormi direito']} value={form.sleep}      onChange={setField('sleep')} />
          <PillGroup label="Hidratação"         options={['Bebi bastante','Normal','Bebi pouco']}                          value={form.hydration}  onChange={setField('hydration')} />
          <PillGroup label="Alimentação"        options={['Me alimentei bem','Normal','Me alimentei mal']}                 value={form.nutrition}  onChange={setField('nutrition')} />
          <PillGroup label="Atividade física"   options={['Me exercitei','Caminhei','Fiquei parado']}                      value={form.activity}   onChange={setField('activity')} />
          <PillGroup label="Cafeína"            options={['Sim, café/energético','Não tomei']}                             value={form.caffeine}   onChange={setField('caffeine')} />
        </div>

        <button
          className={'trk-save-btn' + (isComplete ? ' active' : '') + (saving ? ' saving' : '')}
          data-cursor="hover"
          disabled={!isComplete || saving}
          onClick={isComplete && !saving ? onSave : undefined}
        >
          {saving ? 'Salvando...' : isComplete ? 'Salvar Sessão ✓' : 'Preencha todos os campos'}
        </button>
      </div>
    </div>
  );
}

/* ── Sucesso ── */
function TrackerSuccess({ session, newBadges, onNew, onDashboard, apiKey }) {
  const allSessions = window.Data.load();
  const hrs  = Math.floor((session?.duration || 0) / 3600);
  const mins = Math.floor(((session?.duration || 0) % 3600) / 60);
  const label = hrs > 0 ? `${hrs}h ${mins}min` : `${mins}min`;

  return (
    <div className="trk-success">
      <div className="trk-success-icon">✓</div>
      <h2 className="trk-success-title">Sessão registrada!</h2>
      <p className="trk-success-sub">{label} de estudo salvos.</p>

      {newBadges.length > 0 && (
        <div className="trk-new-badges">
          <p className="trk-new-badges-label">Badges desbloqueadas</p>
          {newBadges.map(b => (
            <div key={b.slug} className="trk-new-badge-item">
              <span className="trk-new-badge-icon">{b.icon}</span>
              <span className="trk-new-badge-name">{b.name}</span>
            </div>
          ))}
        </div>
      )}

      <AiAnalysis sessions={allSessions} type="daily" apiKey={apiKey} />

      <div className="trk-success-actions">
        <button className="trk-btn" data-cursor="hover" onClick={onNew}>Nova Sessão</button>
        <button className="trk-btn trk-btn--end" data-cursor="hover" onClick={onDashboard}>Ver Dashboard</button>
      </div>
    </div>
  );
}

/* ── Sessões recentes (no dashboard da semana) ── */
function RecentSessions() {
  const sessions = window.Data.load().slice(-5).reverse();
  if (!sessions.length) return null;
  return (
    <div className="trk-recent">
      <p className="trk-chart-title">Últimas sessões</p>
      {sessions.map(s => (
        <div key={s.id} className="trk-recent-item">
          <span className="trk-recent-subject">{s.subject || '—'}</span>
          <span className="trk-recent-meta">{s.date} · {Math.round((s.duration||0)/60)}min · {s.performance}</span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════
   Container principal
═══════════════════════════ */
const EMPTY_FORM = {
  subject: '', studyType: '', period: '',
  energy: '', performance: '', mood: '', focus: '', subjectFeeling: '', goalStatus: '',
  sleep: '', hydration: '', nutrition: '', activity: '', caffeine: '',
};

function StudyTracker({ user }) {
  const [tab,     setTab]     = React.useState('timer');
  const [view,    setView]    = React.useState('idle');
  const [elapsed, setElapsed] = React.useState(0);
  const [saving,  setSaving]  = React.useState(false);
  const [form,    setForm]    = React.useState(EMPTY_FORM);
  const [lastSession, setLastSession] = React.useState(null);
  const [newBadges,   setNewBadges]   = React.useState([]);
  const [badgeQueue,  setBadgeQueue]  = React.useState([]);
  const [dataTick,    setDataTick]    = React.useState(0);

  const sessions = React.useMemo(() => window.Data.load(), [dataTick]);
  const reloadData = React.useCallback(() => setDataTick(t => t + 1), []);

  const startRef   = React.useRef(null);
  const pausedRef  = React.useRef(0);
  const pauseStart = React.useRef(null);
  const tickRef    = React.useRef(null);

  const apiKey = React.useMemo(() => {
    try { return localStorage.getItem('d30_ai_key') || ''; } catch { return ''; }
  }, []);

  React.useEffect(() => () => clearInterval(tickRef.current), []);

  const tick = React.useCallback(() => {
    setElapsed(Math.floor((Date.now() - startRef.current - pausedRef.current) / 1000));
  }, []);

  const handleStart = () => {
    startRef.current  = Date.now();
    pausedRef.current = 0;
    setElapsed(0);
    setForm(f => ({ ...f, period: getPeriod(new Date()) }));
    tickRef.current = setInterval(tick, 1000);
    setView('running');
  };

  const handlePause = () => {
    clearInterval(tickRef.current);
    pauseStart.current = Date.now();
    setView('paused');
  };

  const handleResume = () => {
    pausedRef.current += Date.now() - pauseStart.current;
    tickRef.current = setInterval(tick, 1000);
    setView('running');
  };

  const handleEnd = () => {
    clearInterval(tickRef.current);
    setView('form');
  };

  const handleSave = async () => {
    setSaving(true);
    const session = {
      ...form,
      duration:  elapsed,
      date:      new Date(startRef.current).toISOString().split('T')[0],
      startedAt: new Date(startRef.current).toISOString(),
    };
    const saved = window.Data.saveSession(session);
    await window.Data.syncToSupabase(saved, user?.id);

    const earned = window.Badges.check();
    setNewBadges(earned);
    if (earned.length) setBadgeQueue(q => [...q, ...earned]);

    setLastSession(saved);
    setSaving(false);
    reloadData();
    setView('success');
  };

  const isComplete = React.useMemo(() => Object.values(form).every(v => v !== ''), [form]);
  const setField   = key => val => setForm(f => ({ ...f, [key]: val }));

  const isTimerActive = ['running', 'paused', 'form'].includes(view);

  return (
    <div className="page active fade-in">
      <div className="trk-wrap">

        {/* Tab nav — hidden while timer is running */}
        {!isTimerActive && (
          <div className="trk-tabs">
            <button className={'trk-tab' + (tab === 'timer'     ? ' active' : '')} data-cursor="hover" onClick={() => setTab('timer')}>⏱ Timer</button>
            <button className={'trk-tab' + (tab === 'dashboard' ? ' active' : '')} data-cursor="hover" onClick={() => setTab('dashboard')}>📊 Dashboard</button>
          </div>
        )}

        {/* Timer tab */}
        {tab === 'timer' && (
          <>
            {view === 'idle'    && <TrackerIdle onStart={handleStart} />}
            {(view === 'running' || view === 'paused') && (
              <TrackerActive elapsed={elapsed} paused={view === 'paused'}
                onPause={handlePause} onResume={handleResume} onEnd={handleEnd} />
            )}
            {view === 'form' && (
              <TrackerForm elapsed={elapsed} form={form} setField={setField}
                isComplete={isComplete} onSave={handleSave} saving={saving} />
            )}
            {view === 'success' && (
              <TrackerSuccess
                session={lastSession}
                newBadges={newBadges}
                apiKey={apiKey}
                onNew={() => { setForm(EMPTY_FORM); setElapsed(0); setView('idle'); }}
                onDashboard={() => { setView('idle'); setTab('dashboard'); }}
              />
            )}
          </>
        )}

        {/* Dashboard tab */}
        {tab === 'dashboard' && (
          <>
            <TrackerDashboard onStartTimer={() => setTab('timer')} onDemoLoad={reloadData} />
            <RecentSessions />
            <div className="trk-ai-section">
              <p className="trk-section-title" style={{ marginBottom: 12 }}>Análise com IA</p>
              <AiAnalysis sessions={sessions} type="daily"   apiKey={apiKey} />
              <AiAnalysis sessions={sessions} type="weekly"  apiKey={apiKey} />
              <AiAnalysis sessions={sessions} type="monthly" apiKey={apiKey} />
            </div>
          </>
        )}

      </div>

      {/* Badge toasts */}
      <div className="trk-badge-queue">
        {badgeQueue.slice(0, 1).map(b => (
          <BadgeToast key={b.slug} badge={b} onDone={() => setBadgeQueue(q => q.slice(1))} />
        ))}
      </div>

      <Footer />
    </div>
  );
}

Object.assign(window, { StudyTracker });
