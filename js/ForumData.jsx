/* ForumData.jsx — fixtures lifted from the original site */

const FORUM_TOPICS = [
  {
    id: 't1',
    title: 'Como vocês equilibram trabalho + estudos sem enlouquecer?',
    author: 'Marcos R.', avatar: 'MR', color: '#7c3aed',
    time: '2h atrás', tag: 'duvida', tagLabel: 'dúvida',
    hot: true, replies: 24,
    messages: [
      { who: 'Marcos R.', avatar: 'MR', color: '#7c3aed', time: '2h', text: 'Galera, tô tentando manter constância mas trabalhando 8h e ainda estudando 2-3h por dia tá me destruindo. Como vocês equilibram isso sem surtar?' },
      { who: 'Carla V.', avatar: 'CV', color: '#059669', time: '1h', text: 'Eu separo blocos de 50min com 10min de pausa. Pomodoro me salvou. E aceitei que <strong>não dá pra estudar todo dia</strong> — sábado eu descanso.' },
      { who: 'João M.', avatar: 'JM', color: '#b45309', time: '50min', text: 'Cara, tenta acordar 1h mais cedo. Sei que parece insano mas a mente fresca rende 3x mais que estudo cansado depois do trabalho.' },
      { who: 'Augusto', avatar: 'A', color: '#6d5ce6', time: '20min', text: 'Manda bem o João. Eu também acordo cedo. O segredo é regularidade, não intensidade. 1h por dia > 5h só no domingo.' },
    ]
  },
  {
    id: 't2',
    title: 'Consegui minha primeira vaga! Compartilhando o que funcionou pra mim',
    author: 'Julia P.', avatar: 'JP', color: '#059669',
    time: '5h atrás', tag: 'conquista', tagLabel: 'conquista',
    hot: false, replies: 41,
    messages: [
      { who: 'Julia P.', avatar: 'JP', color: '#059669', time: '5h', text: 'Pessoal, depois de 14 meses estudando do zero <strong>consegui minha primeira vaga como dev júnior</strong>. Quero compartilhar 3 coisas que fizeram diferença...' },
      { who: 'Julia P.', avatar: 'JP', color: '#059669', time: '5h', text: '1) Projetos no GitHub valem mais que curso. 2) LinkedIn ativo importou demais. 3) Não menti em entrevista nenhuma sobre o que não sabia.' },
      { who: 'Pedro L.', avatar: 'PL', color: '#be185d', time: '4h', text: 'Inspirador demais Julia! Posso perguntar quantas vagas você se candidatou antes de conseguir?' },
      { who: 'Julia P.', avatar: 'JP', color: '#059669', time: '3h', text: '@Pedro perdi a conta. Acho que mandei uns 80-100 currículos. Levei 7 entrevistas técnicas antes dessa que deu certo. <strong>Persistência</strong>.' },
    ]
  },
  {
    id: 't3',
    title: 'Curadoria: melhores recursos gratuitos pra aprender Java do zero',
    author: 'Thiago S.', avatar: 'TS', color: '#b45309',
    time: '1d atrás', tag: 'recurso', tagLabel: 'recurso',
    hot: false, replies: 18,
    messages: [
      { who: 'Thiago S.', avatar: 'TS', color: '#b45309', time: '1d', text: 'Montei uma lista do que realmente funcionou pra mim aprender Java do zero. Tudo gratuito. Salva esse post.' },
      { who: 'Thiago S.', avatar: 'TS', color: '#b45309', time: '1d', text: '<strong>Lógica:</strong> Curso em Vídeo (Gustavo Guanabara) no YouTube.<br/><strong>Java básico:</strong> Loiane Groner.<br/><strong>POO:</strong> Algaworks (canal e blog).<br/><strong>Spring:</strong> Michelli Brito.' },
      { who: 'Renata F.', avatar: 'RF', color: '#7c3aed', time: '20h', text: 'Salvou minha vida! Tô começando agora e tava perdida no que estudar primeiro. Obrigada Thiago!' },
    ]
  },
  {
    id: 't4',
    title: 'Portfolio sem experiência — o que colocar quando você tá começando?',
    author: 'Carol A.', avatar: 'CA', color: '#be185d',
    time: '2d atrás', tag: 'carreira', tagLabel: 'carreira',
    hot: false, replies: 33,
    messages: [
      { who: 'Carol A.', avatar: 'CA', color: '#be185d', time: '2d', text: 'Gente, tô montando meu portfolio mas não tenho experiência profissional ainda. O que vocês colocaram quando estavam começando? Só clones de tutorial conta?' },
      { who: 'Bruno T.', avatar: 'BT', color: '#059669', time: '1d', text: 'Clone de tutorial NÃO conta, sinceramente. <strong>Pega um problema real seu e resolve com código</strong>. Mesmo que seja bobo. Recrutador valoriza ideia própria.' },
      { who: 'Carol A.', avatar: 'CA', color: '#be185d', time: '1d', text: '@Bruno faz sentido. Vou repensar então. Algum exemplo de "problema seu" que eu posso me inspirar?' },
      { who: 'Bruno T.', avatar: 'BT', color: '#059669', time: '23h', text: 'Eu fiz um app pra controlar gastos do meu cachorro (ração, vet, brinquedo). Ridículo? Sim. Mas mostra que eu sei integrar API, banco, frontend.' },
    ]
  },
  {
    id: 't5',
    title: 'Alguém mais se sentiu um impostor mesmo depois de meses estudando?',
    author: 'Lucas F.', avatar: 'LF', color: '#7c3aed',
    time: '3d atrás', tag: 'duvida', tagLabel: 'discussão',
    hot: false, replies: 57,
    messages: [
      { who: 'Lucas F.', avatar: 'LF', color: '#7c3aed', time: '3d', text: 'Tô há 8 meses estudando, já fiz vários projetos, mas toda vez que abro o VSCode sinto que <strong>não sei nada</strong>. É normal isso continuar?' },
      { who: 'Marina O.', avatar: 'MO', color: '#fbbf24', time: '3d', text: 'Síndrome do impostor é praticamente um rito de passagem na área. Eu trabalho há 4 anos e ainda sinto isso. A diferença é que aprendi a conviver.' },
      { who: 'Augusto', avatar: 'A', color: '#6d5ce6', time: '2d', text: 'Lucas, isso aqui é mais comum do que parece. Pelo que você descreveu, você tá no caminho certo. Quem não sente impostor é quem ainda não percebeu o tamanho da área.' },
    ]
  },
];

const TAG_CLASSES = { duvida: 'tag-duvida', conquista: 'tag-conquista', recurso: 'tag-recurso', carreira: 'tag-carreira' };

Object.assign(window, { FORUM_TOPICS, TAG_CLASSES });
