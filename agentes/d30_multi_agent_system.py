"""
D30 Design System - Multi-Agent System
5 Agentes usando Claude API direto - SEM CREWAI
"""

import anthropic
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

api_key = os.getenv("ANTHROPIC_API_KEY")
if not api_key:
    raise ValueError("❌ ANTHROPIC_API_KEY não encontrada no arquivo .env")

client = anthropic.Anthropic(api_key=api_key)

agents = {
    "marketing": {
        "role": "📢 Marketing Strategist",
        "system_prompt": """Você é um especialista em marketing digital com experiência em design systems e produtos tech.
        Conhece storytelling, branding, copywriting e estratégia de conteúdo.
        Seu objetivo é posicionar o D30 como referência no mercado.
        Responda em português do Brasil, de forma clara e concisa."""
    },
    "motion_frontend": {
        "role": "✨ Motion Front-End Expert",
        "system_prompt": """Você é um especialista front-end focado em motion design e interatividade.
        Domina Framer Motion, React Spring, Web Animations API, GSAP, CSS animations avançadas e SVG animations.
        Você conhece best practices de performance (60fps, GPU acceleration) e acessibilidade (prefers-reduced-motion).
        Responda em português do Brasil, com exemplos de código quando relevante."""
    },
    "developer": {
        "role": "💻 Full-Stack Motion Developer",
        "system_prompt": """Você é um desenvolvedor full-stack especialista em React, TypeScript, CSS e motion libraries.
        Trabalha em conjunto com o Motion Front-End Expert pra traduzir designs em código.
        Domina arquitetura de componentes, state management e otimização de performance.
        Responda em português do Brasil, com código quando apropriado."""
    },
    "strategic": {
        "role": "🎯 Strategic Planner",
        "system_prompt": """Você é um estrategista de produto com experiência em startups e design systems.
        Pensa em mercado, concorrência, oportunidades e riscos.
        Seu trabalho é guiar o projeto D30 para o sucesso sustentável.
        Responda em português do Brasil, de forma estratégica."""
    },
    "organizational": {
        "role": "📋 Organization Manager",
        "system_prompt": """Você é especialista em organização de projetos, documentação técnica e processos.
        Garante que tudo esteja bem estruturado, documentado e fácil de manter.
        Você cria a base sólida para que outros agentes trabalhem com eficiência.
        Responda em português do Brasil, com templates quando apropriado."""
    }
}

tasks = {
    "marketing": """Crie uma estratégia de marketing completa para o D30 Design System:
    1. Análise de posicionamento
    2. Target audience
    3. Canais de distribuição
    4. Calendário de conteúdo (3 meses)
    5. KPIs principais""",
    
    "motion_frontend": """Crie um guia de motion front-end para o D30:
    1. Libraries recomendadas (Framer Motion vs GSAP)
    2. Padrões de motion (easing, timing, staging)
    3. Performance optimization
    4. Acessibilidade em motion
    5. 2 exemplos de código para micro-interações""",
    
    "developer": """Crie um plano técnico de implementação:
    1. Top 5 componentes com motion
    2. Arquitetura de custom hooks
    3. Integração com design tokens
    4. Roadmap de implementação (3 fases)
    5. Testes de performance""",
    
    "strategic": """Defina estratégia e roadmap do D30:
    1. Visão para 2 anos
    2. Missão
    3. 3-4 Objetivos SMART
    4. Fases (Q1, Q2, Q3, Q4)
    5. Métricas de sucesso""",
    
    "organizational": """Estruture organização e documentação:
    1. Arquitetura de pastas recomendada
    2. Documentação necessária
    3. Padrões de código
    4. Motion Design Tokens
    5. Template para componentes animados"""
}

def run_agent(agent_key, task_description):
    """Executa um agente específico"""
    agent = agents[agent_key]
    
    print(f"\n{'='*70}")
    print(f"🤖 {agent['role']}")
    print(f"{'='*70}\n")
    
    try:
        message = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=2000,
            system=agent["system_prompt"],
            messages=[{"role": "user", "content": task_description}]
        )
        
        response_text = message.content[0].text
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"output_{agent_key}_{timestamp}.txt"
        
        with open(filename, "w", encoding="utf-8") as f:
            f.write(f"AGENTE: {agent['role']}\n")
            f.write(f"{'='*70}\n\n")
            f.write(response_text)
        
        print(response_text)
        print(f"\n✅ Salvo em: {filename}\n")
        
        return response_text
    
    except Exception as e:
        print(f"❌ Erro: {e}")
        return None

if __name__ == "__main__":
    print("="*70)
    print("🤖 D30 MULTI-AGENT SYSTEM")
    print("="*70)
    print("\n5 Agentes trabalhando:\n")
    
    for i, (key, agent) in enumerate(agents.items(), 1):
        print(f"{i}. {agent['role']}")
    
    print("\n" + "="*70 + "\n")
    
    for agent_key, task_description in tasks.items():
        run_agent(agent_key, task_description)
    
    print("="*70)
    print("✅ SISTEMA FINALIZADO!")
    print("="*70)
    print("\n📁 Resultados salvos em output_*.txt\n")
