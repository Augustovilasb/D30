# D30 — Dev aos 30

> Comunidade gratuita em português para quem está em transição de carreira para dev — em qualquer idade.

![D30 Preview](images/preview.png)

---

## O que é

A D30 é uma comunidade real, sem fórmula mágica, feita por quem tá no mesmo caminho. É um projeto para quem quer **mudar de carreira e entrar na TI** — em qualquer idade. Fórum ativo, palestras mensais, **roadmaps específicos** para cada ramificação da área, sala de estudos no Discord e vagas filtradas para jr e transição de carreira.

## Por que existe

Eu demorei muito tempo pra entender cada ramificação da TI — quais caminhos existem, por onde começar, o que estudar primeiro. Foi confuso e solitário.

A D30 nasceu pra encurtar esse caminho pra quem vem depois. Quero ajudar as pessoas a não se perderem como eu me perdi: com **roadmaps específicos** por área, uma comunidade que apoia e gente que tá trilhando a mesma jornada. Se eu puder poupar alguém de meses de confusão, já valeu a pena.

## Stack

- HTML + CSS + JavaScript puro
- React 18 (UMD, sem build step)
- Babel Standalone (JSX no browser)
- Lenis smooth scroll

## Como rodar

Abre `html/website/index.html` direto no browser. Sem instalação, sem npm.

## Estrutura

```
css/
  d30.css       — tokens, componentes base (dark)
  kit.css       — light theme + overrides do site
js/
  App.jsx       — roteamento
  HomePage.jsx  — hero + pastas + seção fundador
  Nav.jsx       — navegação fixa
  motion.js     — fullpage scroll + animações
  ...
html/
  website/
    index.html  — entry point
images/
  augusto.png
```

---

Feito por [@Dev.aos30](https://www.instagram.com/dev.aos30/) · D30 é de todo mundo
