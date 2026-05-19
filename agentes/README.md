# 🤖 D30 Design System - Multi-Agent System

Sistema com 4 agentes Claude trabalhando juntos no projeto D30!

## 🎯 Os 4 Agentes

### 1. 📢 Marketing Agent
- Estratégia de marketing e conteúdo
- Positioning, target audience, canais
- Calendário de conteúdo

### 2. 💻 Motion Developer
- Implementação de motion design
- Componentes interativos
- Animações com Framer Motion

### 3. 🎯 Strategic Planner
- Roadmap de 2 anos
- Objetivos SMART
- Visão e missão

### 4. 📋 Organization Manager
- Documentação e processos
- Arquitetura de pastas
- Standards de código

---

## 🚀 Como Usar

### 1. Criar pasta do projeto

```powershell
mkdir "C:\Meus projetos\D30\agents"
cd "C:\Meus projetos\D30\agents"
```

### 2. Colar os 3 arquivos nessa pasta:
- `d30_multi_agent_system.py`
- `requirements.txt`
- `.env` (você vai criar)

### 3. Instalar dependências

```powershell
pip install -r requirements.txt
```

### 4. Configurar API Key

Cria um arquivo `.env` na pasta:

```powershell
@"
ANTHROPIC_API_KEY=sk-ant-sua_chave_aqui
"@ | Out-File -Encoding UTF8 .env
```

**Onde pegar a chave:**
1. Vai em https://console.anthropic.com/
2. Clica em "API Keys"
3. Cria uma nova chave
4. Copia e cola no .env

### 5. Rodar o sistema

```powershell
python d30_multi_agent_system.py
```

---

## 📊 O que acontece

Quando você roda, os 4 agentes trabalham juntos:

1. **Marketing Agent** 📢
   - Analisa positioning
   - Define target audience
   - Cria calendário de conteúdo

2. **Motion Developer** 💻
   - Planeja componentes com animações
   - Define padrões de motion
   - Gera exemplos de código

3. **Strategic Planner** 🎯
   - Define visão e missão
   - Cria roadmap de 2 anos
   - Planeja objetivos SMART

4. **Organization Manager** 📋
   - Estrutura documentação
   - Define padrões de código
   - Cria templates

**Resultado:** Um documento completo com estratégia, roadmap, código e documentação!

---

## 💡 Personalizar

Quer modificar os agentes? Edita o arquivo `.py`:

```python
# Exemplo: Adicionar um novo agente
novo_agente = Agent(
    role="Seu Role",
    goal="Seu objetivo",
    backstory="Sua história",
    verbose=True,
)

# Criar uma tarefa pra ele
nova_tarefa = Task(
    description="O que fazer",
    agent=novo_agente,
    expected_output="Resultado esperado"
)

# Adicionar na Crew
crew = Crew(
    agents=[marketing_agent, dev_agent, strategic_agent, org_agent, novo_agente],
    tasks=[task_marketing, task_development, task_strategy, task_organization, nova_tarefa],
    process=Process.sequential,
    verbose=True,
)
```

---

## 🔍 Troubleshooting

### Erro: "ModuleNotFoundError"
```powershell
pip install -r requirements.txt
```

### Erro: "ANTHROPIC_API_KEY not found"
1. Verifica se o arquivo `.env` existe
2. Verifica se tem `ANTHROPIC_API_KEY=sk-ant-...`
3. Tenta novamente

### Erro: "API request failed"
1. Verifica sua API key em https://console.anthropic.com/
2. Verifica se tem créditos
3. Tenta fazer uma requisição simples primeiro

---

## 📁 Estrutura esperada

```
C:\Meus projetos\D30\agents\
├── d30_multi_agent_system.py
├── requirements.txt
├── .env
└── outputs/  (criado automaticamente)
```

---

## 🎬 Próximos Passos

1. ✅ Rode o sistema
2. ✅ Analise os outputs dos agentes
3. ✅ Use a documentação gerada no seu projeto
4. ✅ Customize conforme necessário
5. ✅ Integrate com seu workflow

---

**Pronto? Bora rodar!** 🚀
