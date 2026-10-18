const LANGUAGES = [
  { id: 'logic_prog', name: 'Lógica de Programação', icon: '🧩', color: '#9b59b6', desc: 'Algoritmos, fluxogramas e pseudocódigo' },
  { id: 'zero_to_code', name: 'Do Zero ao Código', icon: '🌱', color: '#2ecc71', desc: 'Para quem nunca programou e quer começar do jeito certo' },
  { id: 'fundamentos_programacao', name: 'Fundamentos de Programação', icon: '🧠', color: '#5dade2', desc: 'Pensamento computacional, testes e boas práticas' },
  { id: 'fundamentos_computacao', name: 'Fundamentos de Computação', icon: '🖥️', color: '#48c9b0', desc: 'Hardware, sistemas, redes e representação de dados' },
  { id: 'historia_computacao', name: 'História da Computação', icon: '📚', color: '#af7ac5', desc: 'Linha do tempo da computação, internet e linguagens' },
  { id: 'math', name: 'Matemática', icon: '🧮', color: '#e74c3c', desc: 'Base numérica e lógica para programar' },
  { id: 'javascript', name: 'JavaScript', icon: '🟨', color: '#f7df1e', desc: 'A linguagem mais usada na web' },
  { id: 'python', name: 'Python', icon: '🐍', color: '#3776ab', desc: 'Ideal para iniciantes e IA' },
  { id: 'java', name: 'Java', icon: '☕', color: '#ed8b00', desc: 'Robusta e orientada a objetos' },
  { id: 'c', name: 'C', icon: '⚙️', color: '#555555', desc: 'Controle total sobre a máquina' },
  { id: 'html_css', name: 'HTML & CSS', icon: '🌐', color: '#e34c26', desc: 'Construa páginas e interfaces' },
  { id: 'sql', name: 'SQL', icon: '🗄️', color: '#336791', desc: 'Consulte e gerencie dados' },
  { id: 'mundo_cultura', name: 'Mundo e Cultura', icon: '🧭', color: '#14b8a6', desc: 'Curiosidades globais, lugares marcantes e tradições' },
  { id: 'historia_sociedade', name: 'História e Sociedade', icon: '🏛️', color: '#f59e0b', desc: 'Eventos históricos, cidadania e vida em comunidade' },
  { id: 'ciencia_criatividade', name: 'Ciência e Criatividade', icon: '🔬', color: '#8b5cf6', desc: 'Universo, descobertas, artes e entretenimento' },
  { id: 'biblia_at', name: 'Antigo Testamento', icon: '📜', color: '#c0872e', desc: 'Gênesis, profetas, reis e a história de Israel' },
  { id: 'biblia_nt', name: 'Novo Testamento', icon: '✝️', color: '#8b5cf6', desc: 'Evangelhos, epístolas e a vida de Jesus' },
  { id: 'doutrinas', name: 'Doutrinas Cristãs', icon: '⛪', color: '#ef4444', desc: 'Fundamentos da fé, credos e teologia sistemática' },
  { id: 'historia_igreja', name: 'História da Igreja', icon: '🏛️', color: '#0ea5e9', desc: 'Da igreja primitiva à Reforma e além' }
];

const TOPICS = {
  zero_to_code: [
    { id: 'first_contact', name: 'Primeiro Contato', emoji: '👋', desc: 'conceitos básicos para começar sem medo' },
    { id: 'sequence_logic', name: 'Sequência Lógica', emoji: '🧱', desc: 'passo a passo e ordem das ações' },
    { id: 'boolean_reasoning', name: 'Raciocínio Booleano', emoji: '✅', desc: 'verdadeiro, falso e decisões simples' },
    { id: 'operators_basics', name: 'Operadores Básicos', emoji: '➗', desc: 'contas e comparações na prática' },
    { id: 'trace_execution', name: 'Rastreando Execução', emoji: '🔎', desc: 'acompanhar valores durante o algoritmo' },
    { id: 'debugging_basics', name: 'Erros e Debug', emoji: '🩹', desc: 'identificar e corrigir erros comuns' }
  ],
  fundamentos_programacao: [
    { id: 'pensamento_computacional', name: 'Pensamento Computacional', emoji: '🧠', desc: 'decomposição, padrões, abstração e algoritmo' },
    { id: 'boas_praticas', name: 'Boas Práticas', emoji: '✨', desc: 'legibilidade, nomes e organização de código' },
    { id: 'testes_validacao', name: 'Testes e Validação', emoji: '🧪', desc: 'casos de teste, erros e qualidade' },
    { id: 'eficiencia_basica', name: 'Eficiência Básica', emoji: '⚙️', desc: 'noções de desempenho e otimização inicial' }
  ],
  fundamentos_computacao: [
    { id: 'hardware_software', name: 'Hardware vs Software', emoji: '🖥️', desc: 'componentes físicos e programas' },
    { id: 'sistemas_operacionais', name: 'Sistemas Operacionais', emoji: '🗂️', desc: 'funções do SO, processos e arquivos' },
    { id: 'redes_internet', name: 'Redes e Internet', emoji: '🌐', desc: 'protocolos, cliente-servidor e web' },
    { id: 'dados_memoria', name: 'Dados e Memória', emoji: '💾', desc: 'bits, bytes, memória e armazenamento' }
  ],
  historia_computacao: [
    { id: 'pioneiros', name: 'Pioneiros da Computação', emoji: '👩‍🏫', desc: 'Ada, Turing e grandes nomes' },
    { id: 'geracoes_computadores', name: 'Gerações de Computadores', emoji: '🕰️', desc: 'válvulas, transistores e microprocessadores' },
    { id: 'historia_internet', name: 'História da Internet', emoji: '📡', desc: 'ARPANET, web e evolução da rede' },
    { id: 'historia_linguagens', name: 'História das Linguagens', emoji: '📜', desc: 'da linguagem de máquina ao alto nível' }
  ],
  logic_prog: [
    { id: 'algorithms', name: 'Algoritmos', emoji: '📝', desc: 'o que são, como pensar em passos' },
    { id: 'flowcharts', name: 'Fluxogramas', emoji: '🔀', desc: 'representação visual de lógica' },
    { id: 'variables_types', name: 'Variáveis & Tipos', emoji: '📦', desc: 'armazenamento e tipos de dado' },
    { id: 'conditions', name: 'Estruturas Condicionais', emoji: '🚦', desc: 'decisões e caminhos' },
    { id: 'repetition', name: 'Estruturas de Repetição', emoji: '🔁', desc: 'loops e iteração' },
    { id: 'data_structures', name: 'Estruturas de Dados', emoji: '🗂️', desc: 'arrays, pilhas, filas' }
  ],
  javascript: [
    { id: 'variables', name: 'Variáveis & Tipos', emoji: '📦', desc: 'var, let, const e tipos de dados' },
    { id: 'conditionals', name: 'Condicionais', emoji: '🔀', desc: 'if, else, switch, ternário' },
    { id: 'loops', name: 'Loops', emoji: '🔁', desc: 'for, while, do-while' },
    { id: 'functions', name: 'Funções', emoji: '⚡', desc: 'declaração, arrow, callbacks' },
    { id: 'arrays', name: 'Arrays', emoji: '📋', desc: 'métodos, manipulação, iteração' },
    { id: 'objects', name: 'Objetos', emoji: '🧱', desc: 'propriedades, métodos, this' }
  ],
  python: [
    { id: 'variables', name: 'Variáveis & Tipos', emoji: '📦', desc: 'int, str, float, bool' },
    { id: 'conditionals', name: 'Condicionais', emoji: '🔀', desc: 'if, elif, else' },
    { id: 'loops', name: 'Loops', emoji: '🔁', desc: 'for, while, range' },
    { id: 'functions', name: 'Funções', emoji: '⚡', desc: 'def, return, parâmetros' },
    { id: 'lists', name: 'Listas', emoji: '📋', desc: 'list, tuple, slicing' },
    { id: 'dicts', name: 'Dicionários', emoji: '🧱', desc: 'dict, keys, values' }
  ],
  java: [
    { id: 'variables', name: 'Variáveis & Tipos', emoji: '📦', desc: 'int, String, double, boolean' },
    { id: 'conditionals', name: 'Condicionais', emoji: '🔀', desc: 'if, else, switch' },
    { id: 'loops', name: 'Loops', emoji: '🔁', desc: 'for, while, for-each' },
    { id: 'functions', name: 'Métodos', emoji: '⚡', desc: 'void, return, parâmetros' },
    { id: 'arrays', name: 'Arrays', emoji: '📋', desc: 'arrays, ArrayList' },
    { id: 'oop', name: 'POO', emoji: '🧱', desc: 'classes, herança, polimorfismo' }
  ],
  c: [
    { id: 'variables', name: 'Variáveis & Tipos', emoji: '📦', desc: 'int, char, float, double' },
    { id: 'conditionals', name: 'Condicionais', emoji: '🔀', desc: 'if, else, switch' },
    { id: 'loops', name: 'Loops', emoji: '🔁', desc: 'for, while, do-while' },
    { id: 'functions', name: 'Funções', emoji: '⚡', desc: 'protótipos, parâmetros' },
    { id: 'pointers', name: 'Ponteiros', emoji: '📋', desc: 'endereços, referências' },
    { id: 'structs', name: 'Structs', emoji: '🧱', desc: 'struct, typedef' }
  ],
  html_css: [
    { id: 'html_basics', name: 'HTML Básico', emoji: '📦', desc: 'tags, atributos, estrutura' },
    { id: 'html_forms', name: 'Formulários', emoji: '🔀', desc: 'input, select, form' },
    { id: 'css_selectors', name: 'Seletores CSS', emoji: '🎯', desc: 'classe, id, pseudo' },
    { id: 'css_box', name: 'Box Model', emoji: '📦', desc: 'margin, padding, border' },
    { id: 'css_flex', name: 'Flexbox', emoji: '📋', desc: 'display, justify, align' },
    { id: 'css_responsive', name: 'Responsivo', emoji: '📱', desc: 'media queries, unidades' }
  ],
  sql: [
    { id: 'select', name: 'SELECT', emoji: '🔍', desc: 'consultas básicas' },
    { id: 'where', name: 'WHERE & Filtros', emoji: '🔀', desc: 'condições, operadores' },
    { id: 'joins', name: 'JOINs', emoji: '🔗', desc: 'inner, left, right' },
    { id: 'aggregate', name: 'Agregação', emoji: '📊', desc: 'COUNT, SUM, AVG, GROUP BY' },
    { id: 'insert_update', name: 'INSERT & UPDATE', emoji: '✏️', desc: 'inserir e atualizar dados' },
    { id: 'create', name: 'CREATE & ALTER', emoji: '🧱', desc: 'tabelas, colunas, tipos' }
  ],
  assuntos_gerais: [
    { id: 'curiosidades_mundo', name: 'Curiosidades do Mundo', emoji: '🌎', desc: 'fatos surpreendentes e trivia inteligente' },
    { id: 'historia_geral', name: 'História Geral', emoji: '🏺', desc: 'personagens, eventos e viradas do mundo' },
    { id: 'geografia_culturas', name: 'Geografia e Culturas', emoji: '🗺️', desc: 'lugares, costumes e identidades marcantes' },
    { id: 'ciencia_espaco', name: 'Ciência e Espaço', emoji: '🔬', desc: 'descobertas, natureza e universo' },
    { id: 'artes_entretenimento', name: 'Artes e Entretenimento', emoji: '🎭', desc: 'música, cinema, literatura e criatividade' },
    { id: 'cotidiano_sociedade', name: 'Cotidiano e Sociedade', emoji: '📱', desc: 'hábitos, cidadania e tecnologia no dia a dia' }
  ],
  mundo_cultura: [
    { id: 'curiosidades_mundo', name: 'Curiosidades do Mundo', emoji: '🌎', desc: 'fatos surpreendentes e trivia inteligente' },
    { id: 'geografia_culturas', name: 'Geografia e Culturas', emoji: '🗺️', desc: 'lugares, costumes e identidades marcantes' }
  ],
  historia_sociedade: [
    { id: 'historia_geral', name: 'História Geral', emoji: '🏺', desc: 'personagens, eventos e viradas do mundo' },
    { id: 'cotidiano_sociedade', name: 'Cotidiano e Sociedade', emoji: '📱', desc: 'hábitos, cidadania e tecnologia no dia a dia' }
  ],
  ciencia_criatividade: [
    { id: 'ciencia_espaco', name: 'Ciência e Espaço', emoji: '🔬', desc: 'descobertas, natureza e universo' },
    { id: 'artes_entretenimento', name: 'Artes e Entretenimento', emoji: '🎭', desc: 'música, cinema, literatura e criatividade' }
  ],
  biblia_at: [
    { id: 'genesis_criacao', name: 'Gênesis e Criação', emoji: '🌍', desc: 'criação, Adão, Eva e os patriarcas' },
    { id: 'exodo_lei', name: 'Êxodo e a Lei', emoji: '📋', desc: 'Moisés, pragas, mandamentos e aliança' },
    { id: 'reis_profetas', name: 'Reis e Profetas', emoji: '👑', desc: 'monarquia de Israel e mensageiros de Deus' },
    { id: 'sabedoria', name: 'Livros de Sabedoria', emoji: '📖', desc: 'Salmos, Provérbios e Eclesiastes' }
  ],
  biblia_nt: [
    { id: 'vida_jesus', name: 'Vida de Jesus', emoji: '⭐', desc: 'nascimento, ministério e ensinamentos' },
    { id: 'parabolas', name: 'Parábolas', emoji: '🌾', desc: 'histórias que Jesus contou' },
    { id: 'paixao_ressurreicao', name: 'Paixão e Ressurreição', emoji: '✝️', desc: 'crucificação, morte e ressurreição' },
    { id: 'atos_epistolas', name: 'Atos e Epístolas', emoji: '✉️', desc: 'igreja primitiva e cartas apostólicas' }
  ],
  doutrinas: [
    { id: 'trindade', name: 'Trindade', emoji: '🔺', desc: 'Pai, Filho e Espírito Santo' },
    { id: 'salvacao', name: 'Salvação e Graça', emoji: '💝', desc: 'redenção, justificação e santificação' },
    { id: 'biblia_doutrina', name: 'Autoridade da Bíblia', emoji: '📕', desc: 'inspiração, inerrância e cânon' },
    { id: 'escatologia', name: 'Escatologia', emoji: '🔮', desc: 'últimos tempos, volta de Cristo e eternidade' }
  ],
  historia_igreja: [
    { id: 'igreja_primitiva', name: 'Igreja Primitiva', emoji: '🕊️', desc: 'primeiros séculos e perseguições' },
    { id: 'conc_credos', name: 'Concílios e Credos', emoji: '📜', desc: 'Niceia, Calcedônia e definições de fé' },
    { id: 'reforma', name: 'Reforma Protestante', emoji: '🔨', desc: 'Lutero, Calvino e os reformadores' },
    { id: 'igreja_moderna', name: 'Igreja Moderna', emoji: '🌎', desc: 'avivamentos, missões e expansão global' }
  ],
  math: [
    { id: 'arithmetic', name: 'Aritmética', emoji: '➕', desc: 'operações fundamentais' },
    { id: 'algebra', name: 'Álgebra', emoji: '🔤', desc: 'equações e expressões' },
    { id: 'logic', name: 'Lógica', emoji: '🧠', desc: 'booleana, proposições' },
    { id: 'numeral', name: 'Sistemas Numéricos', emoji: '🔢', desc: 'binário, octal, hexadecimal' },
    { id: 'sets', name: 'Conjuntos', emoji: '⭕', desc: 'união, interseção, pertinência' },
    { id: 'combinatorics', name: 'Combinatória', emoji: '🎲', desc: 'permutação, combinação, probabilidade' }
  ]
};

// Question format: { q: question, code: optional code, opts: [4 options], answer: index 0-3, explain: explanation }
const QUESTIONS = {
  logic_prog: {
    algorithms: {
      easy: [
        { q: 'O que é um algoritmo?', opts: ['Um programa de computador', 'Uma sequência finita de passos para resolver um problema', 'Uma linguagem de programação', 'Um tipo de dado'], answer: 1, explain: 'Algoritmo é uma sequência finita e ordenada de passos para resolver um problema.' },
        { q: 'Qual é o primeiro passo ao criar um algoritmo?', opts: ['Escrever código', 'Entender o problema', 'Testar o programa', 'Escolher a linguagem'], answer: 1, explain: 'Antes de codificar, é essencial entender claramente o problema a ser resolvido.' },
        { q: 'Em um algoritmo para fazer café, qual é a ordem correta?', opts: ['Servir → Ferver → Coar', 'Ferver água → Coar café → Servir', 'Coar → Servir → Ferver', 'Servir → Coar → Ferver'], answer: 1, explain: 'Algoritmos seguem ordem lógica: ferver, coar, servir.' },
        { q: 'O que significa "entrada" em um algoritmo?', opts: ['O resultado final', 'Os dados fornecidos para processamento', 'O código fonte', 'A tela do computador'], answer: 1, explain: 'Entrada são os dados que o algoritmo recebe para processar.' },
        { q: 'O que significa "saída" em um algoritmo?', opts: ['Fechar o programa', 'O resultado produzido pelo algoritmo', 'Um erro no código', 'O teclado'], answer: 1, explain: 'Saída é o resultado que o algoritmo produz após processar as entradas.' },
        { q: 'Qual característica NÃO é de um bom algoritmo?', opts: ['Finito', 'Definido', 'Ambíguo', 'Eficaz'], answer: 2, explain: 'Um bom algoritmo deve ser claro e sem ambiguidade. Cada passo deve ter um significado único.' }
      ],
      medium: [
        { q: 'O que é pseudocódigo?', opts: ['Código em Python', 'Descrição informal de um algoritmo em linguagem natural estruturada', 'Um tipo de criptografia', 'Código com erros'], answer: 1, explain: 'Pseudocódigo descreve a lógica do algoritmo sem seguir sintaxe de nenhuma linguagem específica.' },
        { q: 'Qual é a complexidade de buscar um item em uma lista não ordenada de N itens?', opts: ['O(1)', 'O(log N)', 'O(N)', 'O(N²)'], answer: 2, explain: 'Busca linear: no pior caso, verifica todos os N itens. Complexidade O(N).' },
        { q: 'O que é a técnica "dividir para conquistar"?', opts: ['Usar vários computadores', 'Dividir o problema em subproblemas menores', 'Dividir o código em arquivos', 'Trabalhar em equipe'], answer: 1, explain: 'Divide o problema em partes menores, resolve cada uma e combina os resultados.' },
        { q: 'Qual algoritmo de ordenação compara pares adjacentes e troca se estiverem fora de ordem?', opts: ['Merge Sort', 'Quick Sort', 'Bubble Sort', 'Binary Search'], answer: 2, explain: 'Bubble Sort "borbulha" o maior elemento para o final comparando pares adjacentes.' },
        { q: 'O que significa dizer que um algoritmo é finito?', opts: ['Que usa poucas variáveis', 'Que termina após um número limitado de passos', 'Que só funciona uma vez', 'Que não tem entrada'], answer: 1, explain: 'Um algoritmo precisa terminar; um processo que nunca para não resolve o problema.' }
      ],
      hard: [
        { q: 'Qual é a complexidade do Bubble Sort no pior caso?', opts: ['O(N)', 'O(N log N)', 'O(N²)', 'O(log N)'], answer: 2, explain: 'Bubble Sort compara todos os pares em cada passada: N × N = O(N²).' },
        { q: 'O que é recursão?', opts: ['Um loop infinito', 'Uma função que chama a si mesma', 'Um tipo de variável', 'Um erro de programação'], answer: 1, explain: 'Recursão é quando uma função se chama com um subproblema menor até atingir um caso base.' },
        { q: 'Todo algoritmo recursivo precisa de...', opts: ['Um loop for', 'Um caso base', 'Variáveis globais', 'Múltiplas funções'], answer: 1, explain: 'Sem caso base, a recursão nunca para (stack overflow). O caso base é a condição de parada.' },
        { q: 'Em notação Big-O, quanto custa ordenar N itens com Merge Sort?', opts: ['O(N)', 'O(N log N)', 'O(N²)', 'O(log N)'], answer: 1, explain: 'Merge Sort divide a lista ao meio (log N níveis) e intercala tudo em cada nível (N): O(N log N), inclusive no pior caso.' },
        { q: 'O que caracteriza um algoritmo guloso (greedy)?', opts: ['Usar muita memória', 'Escolher a melhor opção local a cada passo, esperando chegar ao ótimo global', 'Testar todas as combinações possíveis', 'Nunca terminar'], answer: 1, explain: 'Algoritmos gulosos decidem pelo que parece melhor no momento; funcionam em alguns problemas (como dar troco com moedas comuns), mas nem sempre dão a solução ótima.' }
      ]
    },
    flowcharts: {
      easy: [
        { q: 'Qual forma geométrica representa o INÍCIO/FIM em um fluxograma?', opts: ['Retângulo', 'Losango', 'Oval/Elipse', 'Paralelogramo'], answer: 2, explain: 'Oval (terminal) indica início e fim do fluxograma.' },
        { q: 'Qual forma representa um PROCESSO (ação)?', opts: ['Losango', 'Retângulo', 'Oval', 'Seta'], answer: 1, explain: 'Retângulo representa um processo ou operação a ser executada.' },
        { q: 'Qual forma representa uma DECISÃO?', opts: ['Retângulo', 'Oval', 'Losango', 'Círculo'], answer: 2, explain: 'Losango (diamante) representa uma decisão com condição (sim/não).' },
        { q: 'Qual forma representa ENTRADA/SAÍDA de dados?', opts: ['Retângulo', 'Losango', 'Paralelogramo', 'Oval'], answer: 2, explain: 'Paralelogramo representa operações de entrada (ler) e saída (exibir).' },
        { q: 'Para que servem as SETAS em um fluxograma?', opts: ['Decoração', 'Indicar o fluxo/direção', 'Representar variáveis', 'Indicar erros'], answer: 1, explain: 'Setas conectam os símbolos e mostram a ordem de execução do fluxo.' }
      ],
      medium: [
        { q: 'Em um fluxograma de decisão, quantas saídas o losango normalmente tem?', opts: ['1', '2', '3', '4'], answer: 1, explain: 'O losango tem 2 saídas: uma para condição verdadeira (Sim) e outra para falsa (Não).' },
        { q: 'Como representar um loop (repetição) em fluxograma?', opts: ['Com uma seta que volta para um passo anterior', 'Com duas ovais', 'Com um retângulo duplo', 'Não é possível'], answer: 0, explain: 'Um loop é representado por uma seta que retorna a um ponto anterior no fluxo, criando um ciclo.' },
        { q: 'Qual é a vantagem de criar um fluxograma ANTES de programar?', opts: ['Não tem vantagem', 'Visualizar a lógica e encontrar erros antes de codificar', 'É obrigatório por lei', 'Deixa o código mais rápido'], answer: 1, explain: 'Fluxogramas ajudam a planejar a lógica visualmente, facilitando encontrar falhas antes de escrever código.' },
        { q: 'Qual símbolo de fluxograma representa um subprocesso já definido?', opts: ['Oval', 'Retângulo com barras verticais nas laterais', 'Losango', 'Paralelogramo'], answer: 1, explain: 'O retângulo com linhas duplas nas laterais indica um processo pré-definido (sub-rotina).' },
        { q: 'Em um fluxograma, o que indica o conector (pequeno círculo)?', opts: ['O fim do programa', 'A ligação com outra parte do diagrama', 'Uma decisão', 'Uma entrada de dados'], answer: 1, explain: 'O conector liga trechos do fluxo, evitando setas longas ou cruzadas, inclusive entre páginas.' }
      ],
      hard: [
        { q: 'O que é um fluxograma estruturado?', opts: ['Usa apenas retângulos', 'Segue regras de programação estruturada (sequência, decisão, repetição)', 'Tem mais de 100 passos', 'Usa cores'], answer: 1, explain: 'Fluxograma estruturado usa apenas 3 estruturas: sequência, seleção (if) e repetição (loop).' },
        { q: 'Um losango com a condição "contador < 10" seguido de uma seta voltando ao início representa...', opts: ['Uma função', 'Um loop while', 'Uma entrada de dados', 'Um erro'], answer: 1, explain: 'A condição + seta de retorno forma um loop: repete enquanto contador < 10.' },
        { q: 'O losango vem ANTES do bloco que se repete. Que estrutura de repetição é essa?', opts: ['Repetição com teste no início (while)', 'Repetição com teste no final (do-while)', 'Sequência simples', 'Seleção múltipla (switch)'], answer: 0, explain: 'Quando a decisão vem antes do bloco, a repetição pode executar zero vezes: é o comportamento do while.' },
        { q: 'Vários losangos em cadeia, cada um testando um valor diferente da mesma variável, equivalem a...', opts: ['Um loop for', 'Uma seleção múltipla (switch/escolha-caso)', 'Uma função recursiva', 'Uma entrada de dados'], answer: 1, explain: 'Cada losango testa um caso possível da variável, exatamente como os cases de um switch.' },
        { q: 'Qual é um problema comum de fluxogramas muito grandes?', opts: ['Não podem ter decisões', 'Ficam difíceis de ler e manter; o ideal é dividi-los em subprocessos', 'Não podem virar código', 'Só funcionam em papel'], answer: 1, explain: 'Dividir em subprocessos aplica decomposição e deixa cada parte compreensível.' }
      ]
    },
    variables_types: {
      easy: [
        { q: 'O que é uma variável?', opts: ['Um número fixo', 'Um espaço na memória para armazenar dados', 'Um tipo de loop', 'Uma função'], answer: 1, explain: 'Variável é um espaço nomeado na memória que armazena um valor que pode mudar.' },
        { q: 'Qual tipo de dado armazena texto?', opts: ['Inteiro', 'Float', 'String', 'Boolean'], answer: 2, explain: 'String é o tipo para textos/caracteres, como "Olá mundo".' },
        { q: 'Qual tipo de dado armazena verdadeiro/falso?', opts: ['Integer', 'String', 'Float', 'Boolean'], answer: 3, explain: 'Boolean armazena apenas dois valores: verdadeiro (true) ou falso (false).' },
        { q: 'Qual é a diferença entre inteiro e float?', opts: ['Nenhuma', 'Inteiro: sem decimal. Float: com decimal', 'Float é maior', 'Inteiro aceita texto'], answer: 1, explain: 'Inteiro: números sem casa decimal (1, 42). Float: com decimal (3.14, 2.0).' },
        { q: 'O que é uma constante?', opts: ['Uma variável que pode mudar', 'Um valor que nunca muda', 'Um tipo de loop', 'Uma função'], answer: 1, explain: 'Constante é um valor definido uma vez e que não pode ser alterado durante a execução.' }
      ],
      medium: [
        { q: 'O que é tipagem forte?', opts: ['Variáveis sem tipo', 'O tipo não pode mudar implicitamente', 'Só usa números', 'Não existe tipagem forte'], answer: 1, explain: 'Em tipagem forte, o sistema não converte tipos automaticamente — exige conversão explícita.' },
        { q: 'Qual a diferença entre tipagem estática e dinâmica?', opts: ['Nenhuma', 'Estática: tipo definido na declaração. Dinâmica: tipo muda em tempo de execução', 'Dinâmica é mais lenta', 'Estática não tem tipos'], answer: 1, explain: 'Estática (Java, C): tipo fixo. Dinâmica (Python, JS): tipo pode variar.' },
        { q: 'O que é casting (conversão de tipo)?', opts: ['Criar variável', 'Transformar um tipo de dado em outro', 'Deletar variável', 'Copiar valor'], answer: 1, explain: 'Casting converte dados: int → float, string → int, etc.' },
        { q: 'O que acontece ao somar um inteiro com um float?', opts: ['Erro', 'O resultado é inteiro', 'O resultado é float', 'O resultado é string'], answer: 2, explain: 'Na maioria das linguagens, o inteiro é promovido a float e o resultado é float.' },
        { q: 'Qual tipo de dado é mais adequado para guardar um CEP como "01310-100"?', opts: ['Inteiro', 'Float', 'String (texto)', 'Boolean'], answer: 2, explain: 'CEP tem hífen e pode começar com zero; não se faz conta com ele, então é texto.' }
      ],
      hard: [
        { q: 'O que é escopo de variável?', opts: ['O tamanho da variável', 'A região do código onde a variável é acessível', 'O tipo da variável', 'A velocidade de acesso'], answer: 1, explain: 'Escopo define onde a variável pode ser lida/modificada: local (dentro da função) ou global (todo o programa).' },
        { q: 'O que é passagem por valor vs passagem por referência?', opts: ['São a mesma coisa', 'Valor: copia o dado. Referência: compartilha o endereço', 'Referência é mais segura', 'Valor é mais rápido sempre'], answer: 1, explain: 'Por valor: a função recebe uma cópia. Por referência: recebe o endereço original e pode modificá-lo.' },
        { q: 'Por que o uso excessivo de variáveis globais é desaconselhado?', opts: ['Porque ocupam mais memória que as locais', 'Porque qualquer parte do programa pode alterá-las, dificultando achar erros', 'Porque não podem guardar números', 'Porque deixam o programa mais rápido'], answer: 1, explain: 'Quando muitos trechos podem mudar a mesma variável, fica difícil saber quem causou um valor errado.' },
        { q: 'O que é inferência de tipo?', opts: ['O programador declara todos os tipos manualmente', 'A linguagem deduz o tipo a partir do valor atribuído', 'O tipo muda a cada linha', 'Converter texto em número'], answer: 1, explain: 'Com inferência, em "x = 10" a linguagem deduz que x é inteiro, sem declaração explícita.' },
        { q: 'Uma variável inteira recebe 7.9 em uma linguagem que trunca a conversão. Que valor fica guardado?', opts: ['8', '7', '7.9', '0'], answer: 1, explain: 'Truncar descarta a parte decimal sem arredondar: 7.9 vira 7.' }
      ]
    },
    conditions: {
      easy: [
        { q: 'O que é uma estrutura condicional?', opts: ['Um loop', 'Um bloco que executa código baseado em uma condição', 'Uma variável', 'Um tipo de dado'], answer: 1, explain: 'Condicional executa um bloco de código somente se uma condição for verdadeira.' },
        { q: 'Qual estrutura executa um bloco se a condição for verdadeira e outro se for falsa?', opts: ['for', 'while', 'if-else', 'switch'], answer: 2, explain: 'if-else: se condição verdadeira → bloco A, senão → bloco B.' },
        { q: 'Qual operador verifica se dois valores são IGUAIS?', opts: ['=', '==', '!=', '>='], answer: 1, explain: '== compara igualdade. = é atribuição (dá valor à variável).' },
        { q: 'Qual operador significa "diferente de"?', opts: ['==', '!=', '>=', '&&'], answer: 1, explain: '!= retorna verdadeiro quando os valores são diferentes.' },
        { q: 'Se idade = 15, o que acontece em: se (idade >= 18) então "maior" senão "menor"?', opts: ['"maior"', '"menor"', 'Erro', 'Nada'], answer: 1, explain: '15 >= 18 é FALSO, então executa o bloco "senão" → "menor".' }
      ],
      medium: [
        { q: 'O que é uma condição composta com E (AND)?', opts: ['Basta uma ser verdadeira', 'AMBAS as condições devem ser verdadeiras', 'Nenhuma precisa ser verdadeira', 'Inverte o resultado'], answer: 1, explain: 'AND exige que todas as condições sejam verdadeiras para o resultado ser verdadeiro.' },
        { q: 'O que é uma condição composta com OU (OR)?', opts: ['Ambas devem ser verdadeiras', 'Pelo menos uma deve ser verdadeira', 'Nenhuma precisa ser verdadeira', 'Inverte o resultado'], answer: 1, explain: 'OR é verdadeiro se ao menos uma das condições for verdadeira.' },
        { q: 'Para que serve o "switch" (escolha-caso)?', opts: ['Substituir loops', 'Testar uma variável contra múltiplos valores', 'Declarar variáveis', 'Criar funções'], answer: 1, explain: 'Switch compara uma variável com vários valores possíveis, executando o bloco correspondente.' },
        { q: 'O que são condicionais aninhados?', opts: ['Condicionais lado a lado', 'Um if dentro de outro if', 'Condicionais sem else', 'Loops com condição'], answer: 1, explain: 'Aninhamento: um bloco condicional dentro de outro, criando múltiplos níveis de decisão.' },
        { q: 'Se nota = 6, o que é exibido?\nse nota >= 7: "aprovado"\nsenão se nota >= 5: "recuperação"\nsenão: "reprovado"', opts: ['"aprovado"', '"recuperação"', '"reprovado"', 'Nada'], answer: 1, explain: '6 não é >= 7, mas é >= 5, então cai no segundo caso.' },
        { q: 'Qual estrutura é mais adequada para mostrar uma mensagem diferente para cada um dos 7 dias da semana?', opts: ['Vários if independentes sem else', 'switch (escolha-caso)', 'Um loop infinito', 'Uma única condição booleana'], answer: 1, explain: 'Quando uma variável é comparada com muitos valores fixos, o switch deixa cada caso explícito.' }
      ],
      hard: [
        { q: 'O que é curto-circuito em avaliação lógica?', opts: ['Um erro elétrico', 'Parar de avaliar quando o resultado já é certo', 'Um tipo de loop', 'Uma variável booleana'], answer: 1, explain: 'Em "falso AND X", X não é avaliado (resultado já é falso). Em "verdadeiro OR X", X não é avaliado (já é verdadeiro).' },
        { q: 'Qual a vantagem de usar switch em vez de múltiplos if-else?', opts: ['É mais rápido sempre', 'Mais legível quando há muitos valores fixos para comparar', 'Não tem vantagem', 'Aceita condições complexas'], answer: 1, explain: 'Switch é mais claro quando testamos uma variável contra muitos valores específicos.' },
        { q: 'Para classificar notas (A se >= 90, B se >= 80), em que ordem os testes devem vir?', opts: ['nota >= 80 antes de nota >= 90', 'nota >= 90 antes de nota >= 80', 'A ordem não importa', 'Basta testar nota >= 80'], answer: 1, explain: 'Se nota >= 80 vier primeiro, uma nota 95 cairia em B. Testes mais restritivos devem vir antes.' },
        { q: 'O que é uma cláusula de guarda (guard clause)?', opts: ['Um if que trata um caso especial logo no início e sai da função', 'Um loop infinito protegido', 'Um tipo de variável constante', 'Um comentário obrigatório'], answer: 0, explain: 'Tratar casos inválidos cedo, com retorno imediato, evita ifs aninhados profundos.' },
        { q: 'Qual expressão equivale a NÃO(idade >= 18)?', opts: ['idade <= 18', 'idade < 18', 'idade > 18', 'idade != 18'], answer: 1, explain: 'A negação de "maior ou igual a 18" é "menor que 18".' }
      ]
    },
    repetition: {
      easy: [
        { q: 'O que é um loop (laço de repetição)?', opts: ['Uma condição', 'Um bloco que repete enquanto uma condição for verdadeira', 'Uma variável', 'Uma função'], answer: 1, explain: 'Loop repete um bloco de código enquanto a condição de continuação for verdadeira.' },
        { q: 'Qual a diferença entre "enquanto" (while) e "para" (for)?', opts: ['Nenhuma', '"Para" sabe quantas vezes repetir, "enquanto" não necessariamente', '"Enquanto" é mais rápido', '"Para" não usa condição'], answer: 1, explain: '"For" é ideal quando sabemos o número de repetições. "While" quando dependemos de uma condição.' },
        { q: 'O que é um loop infinito?', opts: ['Um loop muito rápido', 'Um loop cuja condição nunca se torna falsa', 'Um loop com 1000 iterações', 'Não existe'], answer: 1, explain: 'Loop infinito ocorre quando a condição de parada nunca é alcançada — o programa trava.' },
        { q: 'O que é o "contador" de um loop for?', opts: ['O resultado do loop', 'A variável que controla quantas vezes o loop executa', 'Um tipo de dado', 'O nome do loop'], answer: 1, explain: 'O contador (ex: i) é inicializado, testado a cada iteração e incrementado.' },
        { q: 'Quantas vezes executa: para i de 1 até 5 faça?', opts: ['4', '5', '6', '0'], answer: 1, explain: 'De 1 até 5 (inclusive): 1, 2, 3, 4, 5 = 5 vezes.' }
      ],
      medium: [
        { q: 'O que é um loop "faça-enquanto" (do-while)?', opts: ['Igual ao while', 'Executa pelo menos 1 vez, depois verifica a condição', 'Não repete', 'Um loop infinito'], answer: 1, explain: 'Do-while executa o corpo primeiro, depois verifica. Garante ao menos 1 execução.' },
        { q: 'O que faz o comando "break" dentro de um loop?', opts: ['Pula uma iteração', 'Encerra o loop imediatamente', 'Reinicia o loop', 'Pausa o loop'], answer: 1, explain: 'Break interrompe o loop e passa para o código após ele.' },
        { q: 'O que faz o comando "continue"?', opts: ['Sai do loop', 'Pula para a próxima iteração', 'Para o programa', 'Reinicia do zero'], answer: 1, explain: 'Continue pula o resto da iteração atual e vai direto para a próxima.' },
        { q: 'Qual o resultado: soma=0; para i de 1 até 4: soma = soma + i', opts: ['4', '10', '6', '0'], answer: 1, explain: 'soma = 0+1+2+3+4 = 10.' },
        { q: 'Quantas vezes executa: para i de 0 até 10 com passo 2?', opts: ['5', '6', '10', '11'], answer: 1, explain: 'i assume 0, 2, 4, 6, 8 e 10: são 6 execuções.' }
      ],
      hard: [
        { q: 'O que são loops aninhados?', opts: ['Dois loops em sequência', 'Um loop dentro de outro', 'Loop com break', 'Loop sem condição'], answer: 1, explain: 'Loop aninhado: para cada iteração do loop externo, o loop interno executa completamente.' },
        { q: 'Se temos um loop de 1 a N dentro de outro loop de 1 a N, quantas vezes o bloco interno executa?', opts: ['N', '2N', 'N²', 'N + N'], answer: 2, explain: 'N iterações externas × N internas = N² execuções totais.' },
        { q: 'Qual técnica transforma um loop em uma chamada de função que se repete?', opts: ['Iteração', 'Recursão', 'Casting', 'Herança'], answer: 1, explain: 'Recursão substitui loops: a função chama a si mesma com um caso base para parar.' },
        { q: 'O que é um acumulador em um laço?', opts: ['Uma variável que agrega valores a cada iteração', 'A condição de parada', 'Um laço dentro de outro', 'Um erro de execução'], answer: 0, explain: 'Ex.: soma = soma + valor. Ele acumula o resultado ao longo das repetições.' },
        { q: 'Em um laço de leitura, o que é uma sentinela?', opts: ['Um valor especial que indica o fim da entrada de dados', 'Um contador de iterações', 'Um tipo de loop infinito', 'A primeira variável declarada'], answer: 0, explain: 'Ex.: "leia números até digitar 0" — o 0 é a sentinela que encerra o laço.' }
      ]
    },
    data_structures: {
      easy: [
        { q: 'O que é um array (vetor)?', opts: ['Uma variável simples', 'Uma coleção ordenada de elementos do mesmo tipo', 'Uma função', 'Um loop'], answer: 1, explain: 'Array armazena múltiplos valores em posições numeradas (índices).' },
        { q: 'Qual é o índice do primeiro elemento de um array?', opts: ['1', '0', '-1', 'Depende'], answer: 1, explain: 'Na maioria das linguagens, arrays começam no índice 0.' },
        { q: 'O que é uma pilha (stack)?', opts: ['Array ordenado', 'Estrutura LIFO: último a entrar, primeiro a sair', 'Estrutura FIFO', 'Um tipo de loop'], answer: 1, explain: 'Pilha (stack): empilha em cima e desempilha de cima. Como uma pilha de pratos.' },
        { q: 'O que é uma fila (queue)?', opts: ['Estrutura LIFO', 'Estrutura FIFO: primeiro a entrar, primeiro a sair', 'Um array reverso', 'Uma pilha dupla'], answer: 1, explain: 'Fila (queue): o primeiro a entrar é o primeiro a sair. Como uma fila de banco.' },
        { q: 'Se um array tem 5 elementos, qual é o índice do último?', opts: ['5', '4', '6', '0'], answer: 1, explain: 'Índices de 0 a 4. O último é length - 1 = 4.' }
      ],
      medium: [
        { q: 'Qual operação de pilha adiciona um elemento?', opts: ['enqueue', 'push', 'insert', 'add'], answer: 1, explain: 'Push adiciona ao topo da pilha. Pop remove do topo.' },
        { q: 'O que é busca binária?', opts: ['Buscar 2 elementos', 'Dividir o array ao meio repetidamente para encontrar um valor', 'Buscar em binário', 'Buscar do fim'], answer: 1, explain: 'Busca binária: em um array ORDENADO, divide pela metade a cada passo. O(log N).' },
        { q: 'Qual é o pré-requisito para usar busca binária?', opts: ['Array grande', 'Array ordenado', 'Array de strings', 'Array sem duplicatas'], answer: 1, explain: 'Busca binária só funciona em arrays ORDENADOS, pois compara com o elemento do meio.' },
        { q: 'O que é uma lista ligada (linked list)?', opts: ['Um array dinâmico', 'Elementos conectados por ponteiros/referências', 'Uma lista ordenada', 'Um tipo de pilha'], answer: 1, explain: 'Cada elemento (nó) aponta para o próximo, formando uma cadeia dinâmica.' },
        { q: 'Na fila [A, B, C] (A entrou primeiro), qual elemento sai no próximo dequeue?', opts: ['A', 'B', 'C', 'Nenhum'], answer: 0, explain: 'Fila é FIFO: o primeiro a entrar (A) é o primeiro a sair.' }
      ],
      hard: [
        { q: 'Qual estrutura de dados usa chave-valor?', opts: ['Array', 'Pilha', 'Dicionário/HashMap', 'Fila'], answer: 2, explain: 'Dicionário/HashMap armazena pares (chave → valor) com busca rápida pela chave.' },
        { q: 'Qual é a complexidade de busca em um HashMap?', opts: ['O(N)', 'O(log N)', 'O(1) em média', 'O(N²)'], answer: 2, explain: 'HashMap usa hashing para acesso direto: O(1) na média, O(N) no pior caso.' },
        { q: 'O que é uma árvore binária?', opts: ['Estrutura com 2 elementos', 'Cada nó tem no máximo 2 filhos', 'Array de 2 dimensões', 'Pilha dupla'], answer: 1, explain: 'Árvore binária: cada nó tem até 2 filhos (esquerdo e direito). Usada em busca, ordenação, etc.' },
        { q: 'Empilhando 1, 2 e 3 e fazendo dois pops, qual elemento fica no topo?', opts: ['1', '2', '3', 'A pilha fica vazia'], answer: 0, explain: 'Pilha é LIFO: os pops removem 3 e depois 2, restando o 1.' },
        { q: 'O que é um grafo?', opts: ['Uma lista ordenada', 'Um conjunto de vértices ligados por arestas', 'Uma pilha de duas pontas', 'Uma tabela de chave e valor'], answer: 1, explain: 'Grafos modelam relações, como rotas entre cidades ou amizades em redes sociais.' }
      ]
    }
  },
  zero_to_code: {
    first_contact: {
      easy: [
        { q: 'O que é programar?', opts: ['Montar um computador', 'Dar instruções para o computador executar tarefas', 'Apenas criar sites', 'Somente corrigir erros'], answer: 1, explain: 'Programar é escrever instruções (lógica) para o computador resolver um problema.' },
        { q: 'Qual opção representa software?', opts: ['Teclado', 'Mouse', 'Editor de código', 'Memória RAM'], answer: 2, explain: 'Software é a parte lógica (programas). Teclado, mouse e RAM são hardware.' },
        { q: 'Em programação, o que é entrada (input)?', opts: ['Resultado final', 'Dados recebidos pelo programa', 'Tela do monitor', 'Erro de sintaxe'], answer: 1, explain: 'Entrada são os dados que o programa recebe para processar.' },
        { q: 'Em programação, o que é saída (output)?', opts: ['Dados apagados', 'Resultado produzido pelo programa', 'Som do computador', 'Código-fonte'], answer: 1, explain: 'Saída é a resposta que o programa entrega após o processamento.' },
        { q: 'O que é um bug?', opts: ['Um recurso novo', 'Um erro no comportamento esperado do programa', 'Uma linguagem de programação', 'Um tipo de variável'], answer: 1, explain: 'Bug é um erro no código ou na lógica que gera comportamento incorreto.' }
      ],
      medium: [
        { q: 'Qual é a diferença principal entre compilador e interpretador?', opts: ['Não existe diferença', 'Compilador traduz tudo antes; interpretador executa aos poucos', 'Interpretador é sempre mais rápido', 'Compilador só funciona na web'], answer: 1, explain: 'Compilador gera um programa traduzido antes da execução; interpretador executa instrução por instrução.' },
        { q: 'Para que serve pseudocódigo?', opts: ['Substituir todas as linguagens', 'Planejar a lógica sem se prender à sintaxe', 'Executar direto no navegador', 'Guardar senhas'], answer: 1, explain: 'Pseudocódigo ajuda a pensar na solução antes de escolher detalhes da linguagem.' },
        { q: 'Qual prática ajuda mais quem está começando do zero?', opts: ['Copiar código sem entender', 'Quebrar o problema em partes pequenas', 'Memorizar comandos sem prática', 'Evitar testar'], answer: 1, explain: 'Dividir problemas em partes simples facilita aprender e depurar.' },
        { q: 'O que significa requisito em um problema de programação?', opts: ['A cor da tela', 'Uma condição/regra que a solução deve atender', 'Somente o nome da variável', 'Um erro de compilação'], answer: 1, explain: 'Requisitos descrevem o que a solução precisa fazer corretamente.' },
        { q: 'Para que serve um editor de código ou IDE?', opts: ['Escrever, organizar e executar código com ajuda de ferramentas', 'Montar as peças do computador', 'Aumentar a velocidade da internet', 'Substituir o sistema operacional'], answer: 0, explain: 'IDEs e editores destacam a sintaxe, sugerem código e ajudam a executar e depurar em um só lugar.' }
      ],
      hard: [
        { q: 'Um algoritmo é determinístico quando...', opts: ['Sempre usa inteligência artificial', 'Com a mesma entrada, produz a mesma saída', 'Roda apenas em um sistema operacional', 'Tem no máximo 10 passos'], answer: 1, explain: 'Determinístico significa previsível: mesma entrada, mesmo resultado.' },
        { q: 'Abstração em programação é...', opts: ['Ignorar o problema', 'Esconder detalhes desnecessários e focar no essencial', 'Escrever sem testar', 'Usar apenas gráficos'], answer: 1, explain: 'Abstração reduz complexidade ao focar no que importa para resolver o problema.' },
        { q: 'Caso de borda (edge case) é...', opts: ['O caso mais comum', 'Um cenário extremo que pode quebrar a solução', 'Uma regra de estilo', 'Uma variável global'], answer: 1, explain: 'Casos de borda testam limites, como lista vazia, zero, valores mínimos e máximos.' },
        { q: 'Por que se diz que o computador "faz exatamente o que foi mandado"?', opts: ['Porque ele adivinha a intenção do programador', 'Porque segue as instruções literalmente, mesmo que estejam erradas', 'Porque corrige erros sozinho', 'Porque só executa programas famosos'], answer: 1, explain: 'O computador não interpreta intenções: instruções ambíguas ou erradas geram resultados errados.' },
        { q: 'O que é uma biblioteca (library) em programação?', opts: ['Um lugar para guardar livros de programação', 'Um conjunto de código pronto que pode ser reutilizado', 'Um tipo de erro de compilação', 'Um computador servidor'], answer: 1, explain: 'Bibliotecas oferecem funções prontas (datas, gráficos, rede...) para não reinventar a roda.' }
      ]
    },
    sequence_logic: {
      easy: [
        { q: 'Sequência lógica significa...', opts: ['Fazer passos sem ordem', 'Executar ações em uma ordem correta', 'Repetir um passo para sempre', 'Usar apenas números'], answer: 1, explain: 'Sem ordem correta, a solução pode falhar mesmo com passos certos.' },
        { q: 'Qual sequência é mais lógica para enviar uma mensagem?', opts: ['Enviar -> Digitar -> Abrir app', 'Abrir app -> Digitar -> Enviar', 'Digitar -> Fechar app -> Enviar', 'Enviar -> Fechar app -> Digitar'], answer: 1, explain: 'Primeiro abre, depois escreve e por fim envia.' },
        { q: 'Ao resolver um problema, o primeiro passo ideal é...', opts: ['Escolher a cor do tema', 'Entender o objetivo e as entradas', 'Publicar o projeto', 'Ignorar exemplos'], answer: 1, explain: 'Entender objetivo, entrada e saída evita retrabalho.' },
        { q: 'Se uma receita pede "assar" antes de "misturar", isso está...', opts: ['Correto', 'Sem importância', 'Fora de ordem lógica', 'Mais eficiente'], answer: 2, explain: 'Misturar vem antes de assar. Ordem incorreta quebra o processo.' },
        { q: 'Um passo depende de outro quando...', opts: ['Pode ser feito em qualquer momento', 'Precisa do resultado anterior para continuar', 'É opcional', 'Só acontece em jogos'], answer: 1, explain: 'Dependência de passos é comum em algoritmos e processos reais.' }
      ],
      medium: [
        { q: 'Para calcular média de 2 notas, qual ordem é correta?', opts: ['Dividir por 2 -> Somar notas -> Exibir', 'Ler notas -> Somar -> Dividir por 2 -> Exibir', 'Exibir -> Ler notas -> Somar', 'Somar -> Exibir -> Dividir'], answer: 1, explain: 'A sequência correta é entrada, processamento e saída.' },
        { q: 'O que melhor descreve decomposição de problema?', opts: ['Apagar parte do código', 'Separar um problema grande em subtarefas', 'Rodar o programa em partes diferentes do dia', 'Escrever tudo em uma linha'], answer: 1, explain: 'Decompor problemas facilita implementar e testar.' },
        { q: 'Se passo B usa o resultado de A, então...', opts: ['B pode ocorrer antes de A', 'A deve ocorrer antes de B', 'A e B são independentes', 'Nenhum dos dois é necessário'], answer: 1, explain: 'Quando há dependência, a ordem deve ser respeitada.' },
        { q: 'Em algoritmos, uma ordem mal definida gera principalmente...', opts: ['Código mais curto', 'Ambiguidade e resultados imprevisíveis', 'Mais segurança', 'Mais memória disponível'], answer: 1, explain: 'Ambiguidade permite interpretações diferentes e erros de execução.' },
        { q: 'Em um algoritmo para trocar uma lâmpada, qual passo deve vir primeiro?', opts: ['Colocar a lâmpada nova', 'Desligar a energia', 'Testar a lâmpada nova', 'Jogar fora a lâmpada antiga'], answer: 1, explain: 'Por segurança e por lógica, desliga-se a energia antes de remover a lâmpada antiga.' }
      ],
      hard: [
        { q: 'Escolher uma ordem que minimiza retrabalho é exemplo de...', opts: ['Otimização de fluxo', 'Erro sintático', 'Tipagem dinâmica', 'Recursão infinita'], answer: 0, explain: 'Boa ordem de execução reduz dependências quebradas e retrabalho.' },
        { q: 'Ao detectar dependências entre tarefas, você está modelando...', opts: ['Entrada e saída de áudio', 'Relações de precedência', 'Estilo visual', 'Conexão de internet'], answer: 1, explain: 'Precedência indica quais tarefas precisam vir antes de outras.' },
        { q: 'Uma sequência robusta deve considerar...', opts: ['Somente o caso ideal', 'Casos normais e de erro', 'Apenas interface gráfica', 'Apenas velocidade'], answer: 1, explain: 'Fluxos robustos contemplam sucesso e falhas esperadas.' },
        { q: 'Duas tarefas podem ser executadas em paralelo quando...', opts: ['Uma depende do resultado da outra', 'Nenhuma depende do resultado da outra', 'Ambas têm o mesmo nome', 'Ambas são muito longas'], answer: 1, explain: 'Sem dependência entre elas, a ordem não importa e as duas podem rodar ao mesmo tempo.' },
        { q: 'Num login, qual ordem de passos é a mais adequada?', opts: ['Liberar acesso -> Ler senha -> Validar', 'Ler usuário e senha -> Validar -> Liberar ou negar acesso', 'Validar -> Ler usuário -> Liberar acesso', 'Negar acesso -> Ler senha -> Validar'], answer: 1, explain: 'Primeiro coleta-se a entrada, depois valida-se e só então decide-se o acesso.' }
      ]
    },
    boolean_reasoning: {
      easy: [
        { q: 'Booleano representa quais valores?', opts: ['Texto e número', 'Verdadeiro e falso', 'Somente números positivos', 'Letras maiúsculas e minúsculas'], answer: 1, explain: 'Tipo booleano possui apenas dois estados: true ou false.' },
        { q: 'Se idade = 20, a condição idade >= 18 é...', opts: ['Falsa', 'Verdadeira', 'Indefinida', 'Erro'], answer: 1, explain: '20 é maior ou igual a 18, então a condição é verdadeira.' },
        { q: 'No operador E (AND), o resultado é verdadeiro quando...', opts: ['Pelo menos uma condição é verdadeira', 'As duas condições são verdadeiras', 'As duas são falsas', 'Sempre'], answer: 1, explain: 'AND exige que todas as partes sejam verdadeiras.' },
        { q: 'No operador OU (OR), o resultado é verdadeiro quando...', opts: ['As duas são falsas', 'Pelo menos uma é verdadeira', 'A primeira é falsa', 'Sempre'], answer: 1, explain: 'OR retorna verdadeiro se qualquer condição for verdadeira.' },
        { q: 'O operador NÃO (NOT) faz o quê?', opts: ['Soma valores', 'Inverte verdadeiro/falso', 'Compara números', 'Repete condição'], answer: 1, explain: 'NOT transforma true em false e false em true.' },
        { q: 'Qual pergunta tem resposta booleana (sim ou não)?', opts: ['Quantos anos você tem?', 'A porta está aberta?', 'Qual é o seu nome?', 'Que horas são?'], answer: 1, explain: 'Uma pergunta booleana só admite dois resultados: verdadeiro ou falso.' }
      ],
      medium: [
        { q: 'Qual resultado de: verdadeiro AND falso?', opts: ['Verdadeiro', 'Falso', 'Erro', 'Nulo'], answer: 1, explain: 'No AND, basta uma condição falsa para o resultado final ser falso.' },
        { q: 'Qual resultado de: falso OR verdadeiro?', opts: ['Verdadeiro', 'Falso', 'Erro', 'Depende da linguagem'], answer: 0, explain: 'No OR, uma condição verdadeira já torna o resultado verdadeiro.' },
        { q: 'Qual expressão representa: "idade entre 18 e 60"?', opts: ['idade > 18 OR idade < 60', 'idade >= 18 AND idade <= 60', 'idade == 18 AND idade == 60', 'idade < 18 AND idade > 60'], answer: 1, explain: 'Para estar entre dois limites, as duas comparações devem ser verdadeiras.' },
        { q: 'Qual é a saída lógica de NOT(verdadeiro OR falso)?', opts: ['Verdadeiro', 'Falso', 'Erro', 'Depende da linguagem'], answer: 1, explain: 'verdadeiro OR falso = verdadeiro; NOT(verdadeiro) = falso.' },
        { q: 'Se temChave = falso, qual o valor de NÃO temChave?', opts: ['Falso', 'Verdadeiro', 'Erro', 'Nulo'], answer: 1, explain: 'NÃO inverte o valor lógico: NÃO falso = verdadeiro.' },
        { q: 'Maria entra no show se tiver ingresso E o show não estiver lotado. Ela tem ingresso e o show não lotou. Ela entra?', opts: ['Sim', 'Não', 'Só se pagar de novo', 'Impossível saber'], answer: 0, explain: 'As duas condições do E são verdadeiras, então o resultado é verdadeiro.' },
        { q: 'O botão "Enviar" fica ativo se o nome OU o e-mail estiver preenchido. Nenhum dos dois foi preenchido. O botão fica ativo?', opts: ['Sim', 'Não', 'Depende do navegador', 'Fica ativo pela metade'], answer: 1, explain: 'O OU só é falso quando as duas condições são falsas, que é o caso aqui.' }
      ],
      hard: [
        { q: 'NOT(A AND B) é equivalente a...', opts: ['NOT A AND NOT B', 'NOT A OR NOT B', 'A OR B', 'A AND B'], answer: 1, explain: 'Lei de De Morgan: NOT(A AND B) = (NOT A) OR (NOT B).' },
        { q: 'NOT(A OR B) é equivalente a...', opts: ['NOT A OR NOT B', 'NOT A AND NOT B', 'A AND B', 'A OR B'], answer: 1, explain: 'Lei de De Morgan: NOT(A OR B) = (NOT A) AND (NOT B).' },
        { q: 'Uma condição bem escrita deve priorizar...', opts: ['Frases vagas', 'Clareza e ausência de ambiguidade', 'Quantidade de operadores', 'Uso de termos técnicos difíceis'], answer: 1, explain: 'Condições claras reduzem erros de lógica e manutenção.' },
        { q: 'Qual expressão é sempre verdadeira, qualquer que seja o valor de A?', opts: ['A AND NOT A', 'A OR NOT A', 'A AND A', 'NOT A'], answer: 1, explain: 'Uma das duas partes sempre é verdadeira, então o resultado nunca é falso: é uma tautologia.' },
        { q: 'A expressão (x > 5 AND x < 3) é verdadeira para quais valores de x?', opts: ['Para x = 4', 'Para nenhum valor de x', 'Para todos os valores', 'Para x maior que 5'], answer: 1, explain: 'Nenhum número é ao mesmo tempo maior que 5 e menor que 3: a expressão é uma contradição.' },
        { q: 'Se dia pode ser "sab" ou "dom", qual condição representa "não é fim de semana"?', opts: ['dia != "sab" OR dia != "dom"', 'dia != "sab" AND dia != "dom"', 'dia == "sab" AND dia == "dom"', 'NOT(dia == "sab") OR dia == "dom"'], answer: 1, explain: 'Por De Morgan, NOT(dia == "sab" OR dia == "dom") vira dia != "sab" AND dia != "dom". Com OR, a condição seria sempre verdadeira.' }
      ]
    },
    operators_basics: {
      easy: [
        { q: 'Qual operador é usado para soma?', opts: ['-', '*', '+', '/'], answer: 2, explain: 'O operador + representa adição.' },
        { q: 'Qual operador é usado para resto da divisão?', opts: ['%', '^', '!', '//'], answer: 0, explain: '% retorna o resto da divisão inteira.' },
        { q: 'Em muitas linguagens, "=" representa...', opts: ['Comparação', 'Atribuição', 'Diferença', 'Concatenação'], answer: 1, explain: 'Sinal = normalmente atribui um valor para uma variável.' },
        { q: 'Qual comparação verifica "maior que"?', opts: ['<', '>', '<=', '=='], answer: 1, explain: '> significa maior que.' },
        { q: 'Se x = 7 e y = 3, quanto vale x - y?', opts: ['10', '4', '3', '21'], answer: 1, explain: '7 - 3 = 4.' }
      ],
      medium: [
        { q: 'Qual resultado de 2 + 3 * 4?', opts: ['20', '14', '24', '11'], answer: 1, explain: 'Multiplicação vem antes da soma: 3*4 = 12; 2+12 = 14.' },
        { q: 'Com parênteses, qual resultado de (2 + 3) * 4?', opts: ['14', '10', '20', '24'], answer: 2, explain: 'Parênteses têm prioridade: (2+3)=5; 5*4 = 20.' },
        { q: 'Se x começa em 10 e fazemos x = x + 5, novo x é...', opts: ['5', '10', '15', '20'], answer: 2, explain: 'A expressão soma 5 ao valor atual de x.' },
        { q: 'Qual expressão verifica se n é par?', opts: ['n % 2 == 0', 'n / 2 == 1', 'n % 2 == 1', 'n > 2'], answer: 0, explain: 'Números pares têm resto 0 ao dividir por 2.' },
        { q: 'Qual é o resultado de 10 / 4 em uma divisão comum (não inteira)?', opts: ['2', '2.5', '2.4', '4'], answer: 1, explain: '10 dividido por 4 é 2,5. Na divisão inteira o resultado seria 2.' },
        { q: 'Qual expressão verifica se idade é menor ou igual a 12?', opts: ['idade < 12', 'idade <= 12', 'idade =< 12', 'idade >= 12'], answer: 1, explain: '<= significa "menor ou igual"; "=<" não é um operador válido na maioria das linguagens.' }
      ],
      hard: [
        { q: 'Qual resultado de 17 % 5?', opts: ['2', '3', '4', '5'], answer: 0, explain: '17 = 5*3 + 2, então o resto é 2.' },
        { q: 'Em muitas linguagens, x += 3 equivale a...', opts: ['x = 3', 'x = x + 3', 'x = x - 3', 'x == 3'], answer: 1, explain: 'Operador composto += soma e reatribui na mesma variável.' },
        { q: 'Qual expressão é mais segura para média de a e b?', opts: ['a + b / 2', '(a + b) / 2', 'a / b + 2', 'a + (b / 0)'], answer: 1, explain: 'Parênteses evitam erro de precedência e deixam a intenção clara.' },
        { q: 'Em linguagens que usam ** para potência, quanto vale 2 ** 3?', opts: ['6', '8', '9', '5'], answer: 1, explain: '2 ** 3 = 2 × 2 × 2 = 8.' },
        { q: 'Na divisão inteira, qual é o quociente de 17 por 5?', opts: ['3', '2', '3.4', '4'], answer: 0, explain: '17 = 5 × 3 + 2. O quociente inteiro é 3 e o resto é 2.' }
      ]
    },
    trace_execution: {
      easy: [
        { q: 'Se x = 2 e depois x = x + 3, qual o valor final de x?', opts: ['2', '3', '5', '6'], answer: 2, explain: 'x começa em 2 e recebe 2 + 3, ficando 5.' },
        { q: 'Se total = 10 e fazemos total = total - 4, total vira...', opts: ['14', '6', '4', '10'], answer: 1, explain: '10 - 4 = 6.' },
        { q: 'Qual valor de y após: y = 1; y = y * 4?', opts: ['1', '4', '5', '0'], answer: 1, explain: 'y é atualizado para 1*4, então y=4.' },
        { q: 'Após: a = 5; b = a; a = 9, o que b guarda?', opts: ['9', '5', '14', '0'], answer: 1, explain: 'b recebeu cópia de a quando a valia 5.' },
        { q: 'Qual técnica ajuda a acompanhar variáveis passo a passo?', opts: ['Tabela de rastreio', 'Ignorar testes', 'Somente decorar sintaxe', 'Remover comentários'], answer: 0, explain: 'Tabela de rastreio mostra como cada variável muda por linha.' },
        { q: 'Após: texto = "ab"; texto = texto + "c", qual o conteúdo de texto?', opts: ['"abc"', '"ab"', '"c"', '"cab"'], answer: 0, explain: 'O + junta (concatena) textos: "ab" + "c" = "abc".' }
      ],
      medium: [
        { q: 'Qual valor final de soma?\nsoma = 0\npara i de 1 até 3:\n  soma = soma + i', opts: ['3', '6', '9', '1'], answer: 1, explain: 'soma = 0+1+2+3 = 6.' },
        { q: 'Qual valor de contador após 4 repetições iniciando em 0 e incrementando de 1 em 1?', opts: ['3', '4', '5', '0'], answer: 1, explain: 'Após 4 incrementos: 0 -> 1 -> 2 -> 3 -> 4.' },
        { q: 'Se x = 8, y = 3 e trocamos os valores usando auxiliar t, qual é o resultado?', opts: ['x=8, y=3', 'x=3, y=8', 'x=11, y=0', 'x=0, y=11'], answer: 1, explain: 'Troca correta com variável temporária inverte os valores.' },
        { q: 'Em rastreio, qual erro é comum?', opts: ['Atualizar uma variável sem registrar', 'Usar linha numerada', 'Anotar estado inicial', 'Conferir condição'], answer: 0, explain: 'Esquecer atualização leva a conclusões erradas sobre o algoritmo.' },
        { q: 'Qual valor final de x?\nx = 1\nrepita 3 vezes:\n  x = x * 2', opts: ['6', '8', '4', '3'], answer: 1, explain: 'x dobra a cada repetição: 1 -> 2 -> 4 -> 8.' }
      ],
      hard: [
        { q: 'Se n=3 e loop "enquanto n > 0: n = n - 1", quantas iterações ocorrem?', opts: ['1', '2', '3', '4'], answer: 2, explain: 'n passa por 3,2,1 e para quando vira 0. Total de 3 iterações.' },
        { q: 'Por que rastrear condição de parada é crítico?', opts: ['Para usar menos memória sempre', 'Para evitar loop infinito e travamentos', 'Para aumentar tamanho do código', 'Para reduzir variáveis'], answer: 1, explain: 'Sem condição de parada correta, o fluxo pode nunca terminar.' },
        { q: 'Rastrear execução ajuda principalmente a...', opts: ['Substituir testes automatizados totalmente', 'Entender causa de erro lógico', 'Evitar escrever código', 'Aumentar o número de arquivos'], answer: 1, explain: 'Rastreio revela onde a lógica diverge do esperado.' },
        { q: 'Qual valor final de maior?\nmaior = 0\npara cada n em [4, 9, 2]:\n  se n > maior: maior = n', opts: ['2', '4', '9', '15'], answer: 2, explain: 'maior passa de 0 para 4 e depois para 9; o 2 não é maior que 9.' },
        { q: 'Qual valor final de i?\ni = 0\nenquanto i < 10:\n  i = i + 3', opts: ['9', '10', '12', '3'], answer: 2, explain: 'i passa por 0, 3, 6, 9 e 12. Com 12 a condição i < 10 fica falsa e o laço para.' }
      ]
    },
    debugging_basics: {
      easy: [
        { q: 'Erro de sintaxe acontece quando...', opts: ['A lógica está ruim', 'O código viola regras da linguagem', 'A internet cai', 'O programa está lento'], answer: 1, explain: 'Sintaxe é a forma de escrever instruções válidas na linguagem.' },
        { q: 'Erro de lógica acontece quando...', opts: ['O programa nem executa', 'Executa, mas entrega resultado errado', 'O computador desliga', 'Não existe variável'], answer: 1, explain: 'No erro lógico o código roda, porém a solução está incorreta.' },
        { q: 'Erro de execução (runtime) aparece...', opts: ['Antes de rodar', 'Durante a execução do programa', 'Somente no navegador', 'Apenas em sistemas antigos'], answer: 1, explain: 'Runtime é erro que surge enquanto o programa está em funcionamento.' },
        { q: 'Qual prática ajuda a encontrar bugs rapidamente?', opts: ['Testar em pequenos passos', 'Alterar tudo de uma vez', 'Ignorar mensagens de erro', 'Evitar logs'], answer: 0, explain: 'Mudanças pequenas + testes frequentes facilitam localizar a origem do problema.' },
        { q: 'Para que serve imprimir valores no console?', opts: ['Deixar o programa mais bonito', 'Inspecionar estado interno e fluxo', 'Aumentar memória', 'Compilar automaticamente'], answer: 1, explain: 'Logs ajudam a verificar valores de variáveis em pontos-chave.' }
      ],
      medium: [
        { q: 'O que significa reproduzir um bug?', opts: ['Apagar o bug', 'Conseguir provocar o erro novamente de forma consistente', 'Desinstalar o app', 'Criar outro erro parecido'], answer: 1, explain: 'Reproduzir bug é essencial para confirmar causa e validar correção.' },
        { q: 'Qual estratégia é mais eficaz para depuração?', opts: ['Chutar a solução', 'Isolar a parte mínima que falha', 'Reescrever tudo', 'Ignorar casos de borda'], answer: 1, explain: 'Isolamento reduz o espaço de busca e acelera o diagnóstico.' },
        { q: 'Depois de corrigir um bug, o ideal é...', opts: ['Nunca mais testar', 'Criar teste para evitar regressão', 'Remover mensagens de erro', 'Trocar nome das variáveis'], answer: 1, explain: 'Teste de regressão evita que o mesmo erro volte no futuro.' },
        { q: 'Qual atitude melhora depuração em equipe?', opts: ['Esconder contexto do erro', 'Descrever passos, entrada e saída esperada', 'Enviar só print sem detalhes', 'Mudar o problema'], answer: 1, explain: 'Contexto claro ajuda outros a reproduzir e resolver rapidamente.' },
        { q: 'Um erro de "divisão por zero" é classificado como...', opts: ['Erro de sintaxe', 'Erro de execução (runtime)', 'Erro no nome do arquivo', 'Aviso de estilo'], answer: 1, explain: 'O código é válido, mas falha durante a execução quando o divisor vale zero.' }
      ],
      hard: [
        { q: 'Um bom relatório de bug deve conter...', opts: ['Apenas "não funciona"', 'Passos para reproduzir, esperado, obtido e ambiente', 'Somente o nome do arquivo', 'Somente horário'], answer: 1, explain: 'Esses dados permitem reproduzir e tratar o problema com precisão.' },
        { q: 'Por que corrigir sem entender causa raiz é arriscado?', opts: ['Porque sempre piora performance', 'Pode mascarar o sintoma e o bug voltar', 'Porque impede deploy', 'Porque aumenta o número de telas'], answer: 1, explain: 'Sem causa raiz, a correção pode ser parcial e instável.' },
        { q: 'Qual prática reduz erros ao longo do tempo?', opts: ['Evitar revisão de código', 'Refatorar trechos confusos e manter testes', 'Remover validações', 'Aumentar complexidade'], answer: 1, explain: 'Código claro + testes constantes reduz chance de novos bugs.' },
        { q: 'O que é um breakpoint em um depurador?', opts: ['Um ponto onde o programa quebra para sempre', 'Um ponto marcado onde a execução pausa para inspecionar o estado', 'Uma linha de código apagada', 'Um tipo de comentário'], answer: 1, explain: 'Breakpoints pausam a execução numa linha para examinar variáveis e seguir passo a passo.' },
        { q: 'Um erro "off-by-one" acontece quando...', opts: ['O programa usa memória demais', 'Um laço ou índice erra por uma unidade a mais ou a menos', 'A internet cai durante a execução', 'O nome da variável tem um caractere a mais'], answer: 1, explain: 'É comum em laços: usar <= em vez de < (ou o contrário) processa um item a mais ou a menos.' }
      ]
    }
  },
  javascript: {
    variables: {
      easy: [
        { q: 'Qual palavra-chave declara uma variável que NÃO pode ser reatribuída?', opts: ['var', 'let', 'const', 'static'], answer: 2, explain: '"const" declara uma constante que não pode ser reatribuída após a inicialização.' },
        { q: 'Qual é o tipo de dado de "42" (com aspas)?', opts: ['number', 'string', 'boolean', 'undefined'], answer: 1, explain: 'Qualquer valor entre aspas é uma string em JavaScript, mesmo que pareça um número.' },
        { q: 'Qual o resultado de typeof null?', opts: ['"null"', '"undefined"', '"object"', '"boolean"'], answer: 2, explain: 'typeof null retorna "object" — é um bug histórico do JavaScript que nunca foi corrigido.' },
        { q: 'Qual valor é "falsy" em JavaScript?', opts: ['1', '"hello"', '0', '[]'], answer: 2, explain: '0 é falsy. Em JS, valores falsy são: 0, "", null, undefined, NaN e false.' },
        { q: 'Como declarar uma variável com escopo de bloco?', opts: ['var x = 1', 'let x = 1', 'global x = 1', 'define x = 1'], answer: 1, explain: '"let" e "const" têm escopo de bloco. "var" tem escopo de função.' },
        { q: 'Qual o valor de uma variável declarada mas não inicializada?', opts: ['null', '0', 'undefined', '""'], answer: 2, explain: 'Variáveis declaradas sem valor recebem undefined automaticamente.' },
        { q: 'O que NaN significa?', opts: ['Not a Null', 'Not a Number', 'No assignment Needed', 'Null and None'], answer: 1, explain: 'NaN = Not a Number. Aparece quando uma operação matemática falha.' },
        { q: 'Qual desses é um tipo primitivo em JS?', opts: ['array', 'object', 'symbol', 'function'], answer: 2, explain: 'Os tipos primitivos são: string, number, boolean, undefined, null, symbol e bigint.' }
      ],
      medium: [
        { q: 'Qual é o resultado?', code: 'let a = "5";\nlet b = 2;\nconsole.log(a + b);', opts: ['7', '"52"', 'NaN', 'Error'], answer: 1, explain: 'O operador + com uma string concatena. "5" + 2 = "52".' },
        { q: 'Qual é o resultado?', code: 'console.log(typeof typeof 42);', opts: ['"number"', '"string"', '"object"', '"undefined"'], answer: 1, explain: 'typeof 42 = "number" (string), typeof "number" = "string".' },
        { q: 'Qual a diferença entre == e ===?', opts: ['Não há diferença', '== compara tipo, === compara valor', '=== compara tipo e valor', '== é mais rápido'], answer: 2, explain: '=== (strict equality) compara valor E tipo. == faz coerção de tipo.' },
        { q: 'Qual é o resultado?', code: 'let x;\nif (x) {\n  console.log("A");\n} else {\n  console.log("B");\n}', opts: ['"A"', '"B"', 'undefined', 'Error'], answer: 1, explain: 'x é undefined, que é falsy, então entra no else.' },
        { q: 'Qual é o resultado?', code: 'const arr = [1, 2, 3];\narr.push(4);\nconsole.log(arr.length);', opts: ['3', '4', 'Error', 'undefined'], answer: 1, explain: 'const impede reatribuição, mas não impede mutação de objetos/arrays.' },
        { q: 'O que acontece aqui?', code: 'var a = 1;\nvar a = 2;\nconsole.log(a);', opts: ['1', '2', 'Error', 'undefined'], answer: 1, explain: 'var permite redeclaração da mesma variável. O valor final é 2.' }
      ],
      hard: [
        { q: 'Qual é o resultado?', code: 'console.log(0.1 + 0.2 === 0.3);', opts: ['true', 'false', 'Error', 'undefined'], answer: 1, explain: '0.1 + 0.2 = 0.30000000000000004 devido à aritmética de ponto flutuante.' },
        { q: 'Qual é o resultado?', code: 'let a = [1, 2];\nlet b = [1, 2];\nconsole.log(a === b);', opts: ['true', 'false', 'undefined', 'Error'], answer: 1, explain: 'Arrays são objetos. === compara referências, não conteúdo.' },
        { q: 'Qual é o resultado?', code: 'console.log(+"");', opts: ['NaN', '0', 'undefined', 'Error'], answer: 1, explain: 'O operador unário + converte string vazia para número, que é 0.' },
        { q: 'Qual é o resultado?', code: 'const {a: b} = {a: 5};\nconsole.log(b);', opts: ['undefined', '5', 'Error', '{a: 5}'], answer: 1, explain: 'Destructuring com renomeação: a propriedade "a" é atribuída à variável "b".' },
        { q: 'Qual é o resultado?', code: 'let x = 1;\n{\n  let x = 2;\n}\nconsole.log(x);', opts: ['1', '2', 'undefined', 'Error'], answer: 0, explain: 'O let dentro do bloco cria uma variável separada. O x externo permanece 1.' }
      ]
    },
    conditionals: {
      easy: [
        { q: 'Qual operador verifica se dois valores são iguais em tipo e valor?', opts: ['==', '===', '!=', '>='], answer: 1, explain: '=== é o operador de igualdade estrita — compara tipo e valor.' },
        { q: 'Qual é a sintaxe correta de um if em JavaScript?', opts: ['if x > 5 then', 'if (x > 5) {}', 'if x > 5:', 'if [x > 5]'], answer: 1, explain: 'Em JS, a condição vai entre parênteses e o bloco entre chaves.' },
        { q: 'O que o operador && (AND) retorna?', opts: ['true se ambos forem true', 'true se um for true', 'sempre true', 'sempre false'], answer: 0, explain: '&& retorna true somente quando AMBOS os operandos são true.' },
        { q: 'O que o operador || (OR) retorna?', opts: ['true se ambos forem true', 'true se pelo menos um for true', 'sempre false', 'inverte o valor'], answer: 1, explain: '|| retorna true se pelo menos um dos operandos for true.' },
        { q: 'Qual é o resultado?', code: 'let x = 10;\nif (x > 5) {\n  console.log("A");\n} else {\n  console.log("B");\n}', opts: ['"A"', '"B"', '"AB"', 'Error'], answer: 0, explain: '10 > 5 é true, então executa o bloco do if.' },
        { q: 'O que o operador ! (NOT) faz?', opts: ['Soma valores', 'Inverte boolean', 'Compara igualdade', 'Atribui valor'], answer: 1, explain: '! inverte: !true = false, !false = true.' }
      ],
      medium: [
        { q: 'Qual é o resultado?', code: 'let x = 5;\nlet r = x > 3 ? "sim" : "nao";\nconsole.log(r);', opts: ['"sim"', '"nao"', 'true', '5'], answer: 0, explain: 'Operador ternário: condição ? valor_se_true : valor_se_false.' },
        { q: 'Qual é o resultado?', code: 'switch(2) {\n  case 1: console.log("A");\n  case 2: console.log("B");\n  case 3: console.log("C");\n}', opts: ['"B"', '"B" e "C"', '"A", "B" e "C"', 'Error'], answer: 1, explain: 'Sem break, o switch faz "fall-through" — executa todos os cases após o match.' },
        { q: 'Qual é o resultado?', code: 'console.log(null == undefined);', opts: ['true', 'false', 'Error', 'null'], answer: 0, explain: 'null == undefined é true (coerção especial), mas null === undefined é false.' },
        { q: 'Qual é o resultado?', code: 'let a = 0;\nlet b = "";\nconsole.log(a == b);', opts: ['true', 'false', 'Error', 'undefined'], answer: 0, explain: 'Com ==, 0 e "" são ambos convertidos e considerados iguais (ambos falsy).' },
        { q: 'O que o operador ?? (nullish coalescing) faz?', opts: ['Mesmo que ||', 'Retorna direita se esquerda for null/undefined', 'Compara tipos', 'Nega valor'], answer: 1, explain: '?? retorna o lado direito apenas se o esquerdo for null ou undefined, diferente de || que trata todos os falsy.' }
      ],
      hard: [
        { q: 'Qual é o resultado?', code: 'console.log([] == false);', opts: ['true', 'false', 'Error', 'undefined'], answer: 0, explain: '[] é convertido para "" e depois para 0. false vira 0. 0 == 0 é true.' },
        { q: 'Qual é o resultado?', code: 'let a = 1 && 2 && 3;\nconsole.log(a);', opts: ['true', '1', '3', 'false'], answer: 2, explain: '&& retorna o último valor truthy ou o primeiro falsy. Todos são truthy, então retorna 3.' },
        { q: 'Qual é o resultado?', code: 'let a = 0 || "" || null || "oi" || undefined;\nconsole.log(a);', opts: ['0', '""', '"oi"', 'undefined'], answer: 2, explain: '|| retorna o primeiro valor truthy. "oi" é o primeiro truthy da cadeia.' },
        { q: 'Qual é o resultado?', code: 'console.log(!!"" === !!0);', opts: ['true', 'false', 'Error', 'undefined'], answer: 0, explain: '!!"" = false, !!0 = false. false === false = true.' },
        { q: 'NaN é igual a si mesmo? O que é impresso?', code: 'console.log(NaN === NaN);', opts: ['true', 'false', 'NaN', 'Error'], answer: 1, explain: 'NaN é o único valor que não é igual a si mesmo; para testá-lo, use Number.isNaN().' }
      ]
    },
    loops: {
      easy: [
        { q: 'Quantas vezes este loop executa?', code: 'for (let i = 0; i < 3; i++) {\n  console.log(i);\n}', opts: ['2', '3', '4', 'infinito'], answer: 1, explain: 'i começa em 0, incrementa até 2. Valores: 0, 1, 2 = 3 vezes.' },
        { q: 'Qual loop verifica a condição DEPOIS de executar?', opts: ['for', 'while', 'do-while', 'for-in'], answer: 2, explain: 'do-while executa o bloco primeiro, depois verifica a condição.' },
        { q: 'O que "break" faz dentro de um loop?', opts: ['Pula para próxima iteração', 'Sai do loop', 'Reinicia o loop', 'Pausa o loop'], answer: 1, explain: 'break interrompe e sai completamente do loop.' },
        { q: 'O que "continue" faz dentro de um loop?', opts: ['Sai do loop', 'Pula para próxima iteração', 'Reinicia do zero', 'Para a execução'], answer: 1, explain: 'continue pula o restante da iteração atual e vai para a próxima.' },
        { q: 'Qual é a estrutura de um for?', opts: ['for (inicio; condição; incremento)', 'for (condição) do', 'for each x in arr', 'for (x to y)'], answer: 0, explain: 'O for em JS tem 3 partes: inicialização, condição e incremento.' },
        { q: 'Qual é o resultado?', code: 'let s = 0;\nfor (let i = 1; i <= 3; i++) {\n  s += i;\n}\nconsole.log(s);', opts: ['3', '6', '10', '0'], answer: 1, explain: 's = 1 + 2 + 3 = 6.' }
      ],
      medium: [
        { q: 'Qual é o resultado?', code: 'for (let i = 0; i < 5; i++) {\n  if (i === 3) break;\n}\nconsole.log(i);', opts: ['3', '5', 'undefined', 'Error'], answer: 3, explain: 'let i tem escopo de bloco do for. Fora do for, i não existe.' },
        { q: 'Qual é o resultado?', code: 'let r = "";\nfor (let i = 0; i < 4; i++) {\n  if (i === 2) continue;\n  r += i;\n}\nconsole.log(r);', opts: ['"013"', '"0123"', '"012"', '"01"'], answer: 0, explain: 'continue pula i=2, então concatena 0, 1, 3.' },
        { q: 'Qual loop é mais adequado para iterar propriedades de um objeto?', opts: ['for', 'while', 'for...in', 'for...of'], answer: 2, explain: 'for...in itera sobre as chaves (propriedades) de um objeto.' },
        { q: 'Qual é o resultado?', code: 'let i = 5;\nwhile (i > 0) {\n  i -= 2;\n}\nconsole.log(i);', opts: ['0', '-1', '1', '2'], answer: 1, explain: 'i: 5→3→1→-1. Quando i=-1, a condição i>0 é false.' },
        { q: 'O que o for...of imprime para cada nome?', code: 'const nomes = ["Ana", "Bia"];\nfor (const n of nomes) {\n  console.log(n.length);\n}', opts: ['3 e 3', '0 e 1', '"Ana" e "Bia"', '6'], answer: 0, explain: 'for...of percorre os valores; "Ana" e "Bia" têm 3 caracteres cada.' }
      ],
      hard: [
        { q: 'Qual é o resultado?', code: 'for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}', opts: ['0, 1, 2', '3, 3, 3', '0, 0, 0', 'Error'], answer: 1, explain: 'var não tem escopo de bloco. Quando os callbacks executam, i já é 3.' },
        { q: 'Qual é o resultado?', code: 'const a = [10, 20, 30];\nfor (const [i, v] of a.entries()) {\n  if (i === 1) break;\n}\nconsole.log("done");', opts: ['"done"', 'Error', '10', 'undefined'], answer: 0, explain: 'O break sai do loop. "done" é impresso normalmente após o for.' },
        { q: 'Quantas iterações?', code: 'let n = 64;\nlet c = 0;\nwhile (n > 1) {\n  n = Math.floor(n / 2);\n  c++;\n}\nconsole.log(c);', opts: ['6', '32', '64', '8'], answer: 0, explain: '64→32→16→8→4→2→1 = 6 divisões (log2 de 64).' },
        { q: 'Qual valor de i o do-while imprime?', code: 'let i = 0;\ndo {\n  i++;\n} while (i > 5);\nconsole.log(i);', opts: ['0', '1', '5', '6'], answer: 1, explain: 'O do-while executa o corpo uma vez antes de testar; i vira 1 e a condição 1 > 5 é falsa.' },
        { q: 'Que tipo tem a variável de um for...in sobre um array?', code: 'const arr = [10, 20, 30];\nfor (const i in arr) {\n  console.log(typeof i);\n  break;\n}', opts: ['"number"', '"string"', '"object"', '"undefined"'], answer: 1, explain: 'for...in percorre as chaves como strings, mesmo em arrays: "0", "1", "2". Para valores, use for...of.' }
      ]
    },
    functions: {
      easy: [
        { q: 'Qual é a forma correta de declarar uma função?', opts: ['function minhaFunc() {}', 'def minhaFunc():', 'func minhaFunc() {}', 'void minhaFunc() {}'], answer: 0, explain: 'Em JS, funções são declaradas com a palavra-chave "function".' },
        { q: 'O que "return" faz em uma função?', opts: ['Imprime um valor', 'Retorna um valor e encerra a função', 'Declara uma variável', 'Chama outra função'], answer: 1, explain: 'return retorna um valor ao chamador e encerra a execução da função.' },
        { q: 'O que é uma arrow function?', opts: ['Função com nome', 'Sintaxe curta: () => {}', 'Função que retorna array', 'Função recursiva'], answer: 1, explain: 'Arrow functions são uma sintaxe curta para funções: (params) => expressão.' },
        { q: 'Qual é o resultado?', code: 'function soma(a, b) {\n  return a + b;\n}\nconsole.log(soma(3, 4));', opts: ['7', '"34"', 'undefined', 'Error'], answer: 0, explain: 'soma(3,4) retorna 3 + 4 = 7.' },
        { q: 'Uma função sem return retorna o quê?', opts: ['0', 'null', 'undefined', 'false'], answer: 2, explain: 'Funções sem return explícito retornam undefined.' }
      ],
      medium: [
        { q: 'Qual é o resultado?', code: 'const dobro = x => x * 2;\nconsole.log(dobro(5));', opts: ['10', '25', 'NaN', 'Error'], answer: 0, explain: 'Arrow function com um parâmetro e retorno implícito: 5 * 2 = 10.' },
        { q: 'O que é um callback?', opts: ['Função que chama a si mesma', 'Função passada como argumento', 'Função anônima', 'Função assíncrona'], answer: 1, explain: 'Callback é uma função passada como argumento para outra função.' },
        { q: 'Qual é o resultado?', code: 'function test(a, b = 10) {\n  return a + b;\n}\nconsole.log(test(5));', opts: ['5', '15', 'NaN', 'Error'], answer: 1, explain: 'b tem valor padrão 10. test(5) = 5 + 10 = 15.' },
        { q: 'Qual é o resultado?', code: 'const fn = function() {\n  return 42;\n};\nconsole.log(typeof fn);', opts: ['"number"', '"function"', '"object"', '"undefined"'], answer: 1, explain: 'fn é uma expressão de função. typeof retorna "function".' },
        { q: 'O que saudacao() retorna quando é chamada sem argumento?', code: 'function saudacao(nome) {\n  return `Olá, ${nome}!`;\n}\nconsole.log(saudacao());', opts: ['"Olá, !"', '"Olá, undefined!"', 'Error', '"Olá, null!"'], answer: 1, explain: 'Um argumento não passado vale undefined, e o template string o converte em "undefined".' }
      ],
      hard: [
        { q: 'Qual é o resultado?', code: 'function counter() {\n  let n = 0;\n  return () => ++n;\n}\nconst c = counter();\nc(); c();\nconsole.log(c());', opts: ['1', '2', '3', '0'], answer: 2, explain: 'Closure: a função interna mantém acesso a n. Cada chamada incrementa.' },
        { q: 'Qual é o resultado?', code: 'const add = a => b => a + b;\nconsole.log(add(2)(3));', opts: ['5', '23', 'Error', 'undefined'], answer: 0, explain: 'Currying: add(2) retorna b => 2 + b. Depois (3) = 2 + 3 = 5.' },
        { q: 'Qual é o resultado?', code: 'function foo() {\n  console.log(this);\n}\nconst obj = { foo };\nconst bar = obj.foo;\nbar();', opts: ['obj', 'window/global', 'undefined', 'Error'], answer: 1, explain: 'bar é chamado sem contexto. Em não-strict mode, this = window/global.' },
        { q: 'Chamar soma() antes da declaração funciona? O que é impresso?', code: 'console.log(soma(2, 3));\nfunction soma(a, b) {\n  return a + b;\n}', opts: ['5', 'undefined', 'ReferenceError', 'NaN'], answer: 0, explain: 'Declarações de função sofrem hoisting: ficam disponíveis antes da linha em que aparecem.' },
        { q: 'Quantos itens o parâmetro rest ...nums recebe?', code: 'function f(...nums) {\n  return nums.length;\n}\nconsole.log(f(1, 2, 3));', opts: ['1', '3', '6', '[1, 2, 3]'], answer: 1, explain: 'O parâmetro rest junta todos os argumentos em um array, aqui com 3 itens.' }
      ]
    },
    arrays: {
      easy: [
        { q: 'Como acessar o primeiro elemento de um array?', opts: ['arr[0]', 'arr[1]', 'arr.first()', 'arr.get(0)'], answer: 0, explain: 'Arrays em JS são indexados a partir de 0.' },
        { q: 'Qual método adiciona um elemento ao FINAL do array?', opts: ['push()', 'pop()', 'shift()', 'unshift()'], answer: 0, explain: 'push() adiciona ao final. pop() remove do final.' },
        { q: 'Qual propriedade retorna o tamanho do array?', opts: ['size', 'count', 'length', 'len'], answer: 2, explain: 'arr.length retorna o número de elementos do array.' },
        { q: 'Qual é o resultado?', code: 'const arr = [1, 2, 3];\nconsole.log(arr[arr.length - 1]);', opts: ['1', '2', '3', 'undefined'], answer: 2, explain: 'arr.length - 1 = 2. arr[2] = 3 (último elemento).' },
        { q: 'Qual método remove o ÚLTIMO elemento?', opts: ['push()', 'pop()', 'shift()', 'splice()'], answer: 1, explain: 'pop() remove e retorna o último elemento do array.' }
      ],
      medium: [
        { q: 'Qual é o resultado?', code: 'const a = [1,2,3,4,5];\nconst b = a.filter(x => x > 3);\nconsole.log(b);', opts: ['[4, 5]', '[1, 2, 3]', '[3, 4, 5]', '[true, true]'], answer: 0, explain: 'filter() retorna um novo array com elementos que passam no teste.' },
        { q: 'Qual é o resultado?', code: 'const a = [1, 2, 3];\nconst b = a.map(x => x * 2);\nconsole.log(b);', opts: ['[2, 4, 6]', '[1, 2, 3]', '6', '[1, 4, 9]'], answer: 0, explain: 'map() cria novo array aplicando a função a cada elemento.' },
        { q: 'Qual método junta todos elementos em uma string?', opts: ['concat()', 'join()', 'merge()', 'toString()'], answer: 1, explain: 'join() une elementos com um separador. Ex: [1,2,3].join("-") = "1-2-3".' },
        { q: 'Qual é o resultado?', code: 'const a = [1, 2, 3];\nconst s = a.reduce((acc, x) => acc + x, 0);\nconsole.log(s);', opts: ['6', '[1, 2, 3]', '0', '3'], answer: 0, explain: 'reduce() acumula: 0+1=1, 1+2=3, 3+3=6.' },
        { q: 'O que find() retorna neste array?', code: 'const a = [5, 12, 8, 130];\nconsole.log(a.find(x => x > 10));', opts: ['12', '[12, 130]', 'true', '1'], answer: 0, explain: 'find() retorna o primeiro elemento que satisfaz a condição; filter() retornaria todos.' }
      ],
      hard: [
        { q: 'Qual é o resultado?', code: 'const a = [3, 1, 4, 1, 5];\na.sort();\nconsole.log(a[0]);', opts: ['1', '3', '5', '0'], answer: 0, explain: 'sort() sem argumento ordena como strings. Resultado: [1,1,3,4,5].' },
        { q: 'Qual é o resultado?', code: 'const a = [[1,2],[3,4],[5]];\nconsole.log(a.flat().length);', opts: ['3', '5', '6', 'Error'], answer: 1, explain: 'flat() achata um nível: [1,2,3,4,5]. Length = 5.' },
        { q: 'Qual é o resultado?', code: 'const a = [1,2,3];\nconst b = [...a];\nb.push(4);\nconsole.log(a.length);', opts: ['3', '4', 'Error', 'undefined'], answer: 0, explain: 'Spread cria cópia rasa. Alterar b não afeta a.' },
        { q: 'Como fica o array original depois de splice(1, 2)?', code: 'const a = [1, 2, 3, 4];\nconst r = a.splice(1, 2);\nconsole.log(a);', opts: ['[1, 4]', '[2, 3]', '[1, 2, 3, 4]', '[3, 4]'], answer: 0, explain: 'splice(1, 2) remove 2 itens a partir do índice 1 e altera o próprio array, que fica [1, 4].' },
        { q: 'Como fica o array após sort com o comparador (x, y) => x - y?', code: 'const a = [10, 1, 5];\na.sort((x, y) => x - y);\nconsole.log(a);', opts: ['[1, 5, 10]', '[10, 5, 1]', '[1, 10, 5]', '[10, 1, 5]'], answer: 0, explain: 'O comparador ordena numericamente em ordem crescente; sem ele, a ordenação seria como texto ([1, 10, 5]).' }
      ]
    },
    objects: {
      easy: [
        { q: 'Como acessar a propriedade "nome" de um objeto?', opts: ['obj.nome', 'obj[nome]', 'obj->nome', 'obj::nome'], answer: 0, explain: 'Notação de ponto: obj.nome. Também funciona obj["nome"].' },
        { q: 'Qual é o resultado?', code: 'const obj = { a: 1, b: 2 };\nconsole.log(Object.keys(obj));', opts: ['[1, 2]', '["a", "b"]', '{a: 1}', '2'], answer: 1, explain: 'Object.keys() retorna um array com as chaves do objeto.' },
        { q: 'Como adicionar uma propriedade a um objeto?', opts: ['obj.add("x", 1)', 'obj.x = 1', 'obj.push(x)', 'obj.insert("x")'], answer: 1, explain: 'Basta atribuir: obj.x = 1 ou obj["x"] = 1.' },
        { q: 'Qual é o resultado?', code: 'const obj = {x: 10};\nconsole.log("x" in obj);', opts: ['true', 'false', '10', 'Error'], answer: 0, explain: 'O operador "in" verifica se uma propriedade existe no objeto.' },
        { q: 'Qual é a forma correta de criar um objeto literal?', opts: ['const p = { nome: "Ana", idade: 20 };', 'const p = [ nome: "Ana" ];', 'const p = ( nome = "Ana" );', 'const p = < nome: "Ana" >;'], answer: 0, explain: 'Objetos literais usam chaves, com pares chave: valor separados por vírgula.' }
      ],
      medium: [
        { q: 'Qual é o resultado?', code: 'const a = {x: 1};\nconst b = a;\nb.x = 2;\nconsole.log(a.x);', opts: ['1', '2', 'undefined', 'Error'], answer: 1, explain: 'Objetos são passados por referência. a e b apontam para o mesmo objeto.' },
        { q: 'O que Object.freeze() faz?', opts: ['Deleta o objeto', 'Impede modificações', 'Copia o objeto', 'Converte para string'], answer: 1, explain: 'Object.freeze() torna o objeto imutável (propriedades não podem ser alteradas).' },
        { q: 'Qual é o resultado?', code: 'const {a, ...rest} = {a:1, b:2, c:3};\nconsole.log(rest);', opts: ['{b:2, c:3}', '{a:1}', '[2, 3]', 'Error'], answer: 0, explain: 'Rest operator coleta as propriedades restantes em um novo objeto.' },
        { q: 'O que retorna acessar uma propriedade que não existe?', code: 'const p = { nome: "Ana" };\nconsole.log(p.idade);', opts: ['null', 'undefined', 'Error', '0'], answer: 1, explain: 'Acessar uma propriedade inexistente retorna undefined, sem lançar erro.' },
        { q: 'Quantas chaves tem o objeto criado com spread?', code: 'const a = { x: 1 };\nconst b = { ...a, y: 2 };\nconsole.log(Object.keys(b).length);', opts: ['1', '2', '3', 'Error'], answer: 1, explain: 'O spread copia x para o novo objeto, que também recebe y: 2 propriedades.' }
      ],
      hard: [
        { q: 'Qual é o resultado?', code: 'const obj = {};\nobj[{}] = "a";\nobj[{}] = "b";\nconsole.log(Object.keys(obj).length);', opts: ['0', '1', '2', 'Error'], answer: 1, explain: 'Qualquer objeto como chave é convertido para "[object Object]". Mesma chave, sobrescreve.' },
        { q: 'Qual é o resultado?', code: 'const p = {get x() { return 42; }};\nconsole.log(p.x);', opts: ['42', 'undefined', 'function', 'Error'], answer: 0, explain: 'Getter: acessar p.x chama a função get que retorna 42.' },
        { q: 'O que o encadeamento opcional ?. retorna aqui?', code: 'const user = { perfil: null };\nconsole.log(user.perfil?.nome);', opts: ['null', 'undefined', 'TypeError', '""'], answer: 1, explain: 'O ?. interrompe a leitura ao encontrar null ou undefined e retorna undefined, sem erro.' },
        { q: 'O que o método ola() retorna ao usar this?', code: 'const obj = {\n  nome: "Ana",\n  ola() { return "Oi, " + this.nome; }\n};\nconsole.log(obj.ola());', opts: ['"Oi, Ana"', '"Oi, undefined"', 'TypeError', '"Oi, "'], answer: 0, explain: 'Chamado como obj.ola(), o this aponta para obj.' },
        { q: 'O que Object.entries() combinado com map() produz?', code: 'const o = { a: 1, b: 2 };\nconst r = Object.entries(o).map(([k, v]) => k + v);\nconsole.log(r);', opts: ['["a1", "b2"]', '[1, 2]', '["a", "b"]', '[["a", 1], ["b", 2]]'], answer: 0, explain: 'Object.entries gera pares [chave, valor]; o map concatena cada chave com seu valor.' }
      ]
    }
  },
  python: {
    variables: {
      easy: [
        { q: 'Qual é o tipo de "hello" em Python?', opts: ['str', 'string', 'text', 'char'], answer: 0, explain: 'Strings em Python são do tipo str.' },
        { q: 'Como verificar o tipo de uma variável?', opts: ['typeof(x)', 'type(x)', 'x.type', 'check(x)'], answer: 1, explain: 'type(x) retorna o tipo da variável em Python.' },
        { q: 'Qual é o resultado?', code: 'x = 10\nprint(type(x).__name__)', opts: ['int', 'number', 'integer', 'float'], answer: 0, explain: '10 é um inteiro (int) em Python.' },
        { q: 'Python precisa declarar tipo de variável?', opts: ['Sim, sempre', 'Não, é tipagem dinâmica', 'Só para números', 'Só para strings'], answer: 1, explain: 'Python tem tipagem dinâmica — o tipo é inferido automaticamente.' },
        { q: 'Qual valor representa "verdadeiro" em Python?', opts: ['true', 'True', 'TRUE', '1 (apenas)'], answer: 1, explain: 'Em Python, booleanos começam com maiúscula: True e False.' },
        { q: 'Qual é o resultado?', code: 'x = "5"\ny = 3\nprint(x * y)', opts: ['"555"', '15', 'Error', '"53"'], answer: 0, explain: 'Em Python, str * int repete a string. "5" * 3 = "555".' }
      ],
      medium: [
        { q: 'Qual é o resultado?', code: 'x = [1, 2, 3]\ny = x\ny.append(4)\nprint(len(x))', opts: ['3', '4', 'Error', '1'], answer: 1, explain: 'Listas são mutáveis e passadas por referência. x e y apontam para a mesma lista.' },
        { q: 'Qual é o resultado?', code: 'a, b, c = 1, 2, 3\nprint(b)', opts: ['1', '2', '3', 'Error'], answer: 1, explain: 'Python permite atribuição múltipla. b recebe o segundo valor.' },
        { q: 'Qual é o resultado?', code: 'x = "Python"\nprint(x[1:4])', opts: ['"Pyt"', '"yth"', '"ytho"', '"Python"'], answer: 1, explain: 'Slicing: x[1:4] = caracteres nos índices 1, 2, 3 = "yth".' },
        { q: 'O que é None em Python?', opts: ['0', 'False', 'Ausência de valor', 'String vazia'], answer: 2, explain: 'None representa ausência de valor (equivalente a null em outras linguagens).' },
        { q: 'O que // e / produzem ao dividir 7 por 2?', code: 'x = 7 // 2\ny = 7 / 2\nprint(x, y)', opts: ['3 3.5', '3.5 3.5', '3 3', '4 3.5'], answer: 0, explain: '// é a divisão inteira (arredonda para baixo); / sempre retorna float.' }
      ],
      hard: [
        { q: 'Qual é o resultado?', code: 'a = [1, [2, 3]]\nb = a.copy()\nb[1].append(4)\nprint(a[1])', opts: ['[2, 3]', '[2, 3, 4]', 'Error', '[1, [2, 3]]'], answer: 1, explain: 'copy() é cópia rasa. A lista interna é compartilhada.' },
        { q: 'Qual é o resultado?', code: 'x = (1,)\ny = (1)\nprint(type(x).__name__, type(y).__name__)', opts: ['tuple tuple', 'tuple int', 'int int', 'Error'], answer: 1, explain: '(1,) é tupla (note a vírgula). (1) é apenas o inteiro 1 entre parênteses.' },
        { q: 'Qual é o resultado?', code: 'print(bool(""), bool(" "))', opts: ['False False', 'True True', 'False True', 'True False'], answer: 2, explain: 'String vazia é falsy, mas string com espaço é truthy.' },
        { q: 'Qual o resultado de somar int("3") com float("1.5")?', code: 'print(int("3") + float("1.5"))', opts: ['4.5', '"31.5"', '4', 'Error'], answer: 0, explain: 'int("3") vira 3 e float("1.5") vira 1.5; int + float resulta em float: 4.5.' },
        { q: 'Depois de a += 5, quanto vale b?', code: 'a = 10\nb = a\na += 5\nprint(b)', opts: ['10', '15', '5', 'Error'], answer: 0, explain: 'Inteiros são imutáveis: a += 5 faz a apontar para um novo objeto, e b continua 10.' }
      ]
    },
    conditionals: {
      easy: [
        { q: 'Qual é a sintaxe correta de if em Python?', opts: ['if (x > 5) {}', 'if x > 5:', 'if x > 5 then', 'if [x > 5]'], answer: 1, explain: 'Em Python, if usa dois-pontos e indentação, sem parênteses obrigatórios.' },
        { q: 'Qual palavra-chave substitui "else if" em Python?', opts: ['elseif', 'else if', 'elif', 'elsif'], answer: 2, explain: 'Python usa "elif" como abreviação de "else if".' },
        { q: 'Qual operador lógico nega uma condição em Python?', opts: ['!', 'not', '~', 'no'], answer: 1, explain: 'Python usa "not" em vez de "!" para negação lógica.' },
        { q: 'Qual é o resultado?', code: 'x = 10\nif x > 5:\n    print("A")\nelse:\n    print("B")', opts: ['"A"', '"B"', 'Error', '"AB"'], answer: 0, explain: '10 > 5 é True, então imprime "A".' },
        { q: 'Em Python, o que define quais linhas pertencem ao bloco de um if?', opts: ['Chaves { }', 'A indentação', 'Parênteses', 'A palavra end'], answer: 1, explain: 'Python usa a indentação (normalmente 4 espaços) para delimitar blocos.' }
      ],
      medium: [
        { q: 'Qual é o resultado?', code: 'x = 0\nif x:\n    print("A")\nelse:\n    print("B")', opts: ['"A"', '"B"', 'Error', '0'], answer: 1, explain: '0 é falsy em Python, então entra no else.' },
        { q: 'Qual é o resultado?', code: 'a = [1, 2, 3]\nif 2 in a:\n    print("sim")\nelse:\n    print("nao")', opts: ['"sim"', '"nao"', 'Error', 'True'], answer: 0, explain: '"in" verifica se um elemento existe na lista.' },
        { q: 'Qual é o resultado?', code: 'x = 15\nr = "par" if x % 2 == 0 else "impar"\nprint(r)', opts: ['"par"', '"impar"', 'Error', '15'], answer: 1, explain: 'Expressão ternária em Python: valor_if_true if condição else valor_if_false.' },
        { q: 'O que a comparação encadeada 18 <= idade < 60 imprime aqui?', code: 'idade = 20\nif 18 <= idade < 60:\n    print("adulto")\nelse:\n    print("outro")', opts: ['"adulto"', '"outro"', 'SyntaxError', 'True'], answer: 0, explain: 'Python permite comparações encadeadas: equivale a 18 <= idade and idade < 60.' },
        { q: 'O que nome or "anônimo" imprime quando nome é vazio?', code: 'nome = ""\nprint(nome or "anônimo")', opts: ['""', '"anônimo"', 'False', 'None'], answer: 1, explain: 'or retorna o primeiro valor truthy; a string vazia é falsy.' }
      ],
      hard: [
        { q: 'Qual é o resultado?', code: 'x = []\ny = []\nprint(x == y, x is y)', opts: ['True True', 'True False', 'False False', 'False True'], answer: 1, explain: '== compara valores (iguais). "is" compara identidade (objetos diferentes).' },
        { q: 'Qual é o resultado?', code: 'print(all([True, 1, "a", [0]]))', opts: ['True', 'False', 'Error', 'None'], answer: 0, explain: 'all() retorna True se todos os itens forem truthy. [0] é truthy (lista não vazia).' },
        { q: 'Qual case do match/case é executado?', code: 'cmd = "sair"\nmatch cmd:\n    case "entrar":\n        print(1)\n    case "sair":\n        print(2)\n    case _:\n        print(3)', opts: ['1', '2', '3', 'SyntaxError'], answer: 1, explain: 'match/case (Python 3.10+) compara o valor com cada padrão; _ é o caso padrão.' },
        { q: 'O que any() retorna para esta lista?', code: 'print(any([0, "", None, 3]))', opts: ['True', 'False', '3', 'None'], answer: 0, explain: 'any() retorna True se pelo menos um item for truthy (o 3).' },
        { q: 'O que imprimem as comparações encadeadas 1 < 2 < 3 e 3 > 2 > 2?', code: 'print(1 < 2 < 3, 3 > 2 > 2)', opts: ['True False', 'True True', 'False False', 'Error'], answer: 0, explain: '3 > 2 > 2 equivale a 3 > 2 and 2 > 2, que é False.' }
      ]
    },
    loops: {
      easy: [
        { q: 'Qual é a sintaxe correta de um for em Python?', opts: ['for (i=0; i<5; i++)', 'for i in range(5):', 'for i from 0 to 5', 'for each i in 5'], answer: 1, explain: 'Python usa "for x in iterável:" com indentação.' },
        { q: 'O que range(3) gera?', opts: ['[1, 2, 3]', '[0, 1, 2]', '[0, 1, 2, 3]', '[3]'], answer: 1, explain: 'range(3) gera 0, 1, 2 (começa em 0, para antes de 3).' },
        { q: 'Qual é o resultado?', code: 'for i in range(1, 4):\n    print(i, end=" ")', opts: ['"1 2 3"', '"1 2 3 4"', '"0 1 2 3"', '"0 1 2"'], answer: 0, explain: 'range(1, 4) gera 1, 2, 3.' },
        { q: 'Como sair de um loop em Python?', opts: ['exit', 'break', 'stop', 'return'], answer: 1, explain: 'break encerra o loop imediatamente.' },
        { q: 'Quanto vale i depois deste while?', code: 'i = 0\nwhile i < 3:\n    i += 1\nprint(i)', opts: ['2', '3', '4', '0'], answer: 1, explain: 'O laço para quando i chega a 3, pois 3 < 3 é falso.' }
      ],
      medium: [
        { q: 'Qual é o resultado?', code: 'nums = [1, 2, 3]\nr = [x**2 for x in nums]\nprint(r)', opts: ['[1, 4, 9]', '[2, 4, 6]', '[1, 2, 3]', 'Error'], answer: 0, explain: 'List comprehension: cria nova lista com cada elemento ao quadrado.' },
        { q: 'Qual é o resultado?', code: 'for i in range(5):\n    if i == 3:\n        continue\n    print(i, end=" ")', opts: ['"0 1 2 4"', '"0 1 2 3"', '"0 1 2"', '"3"'], answer: 0, explain: 'continue pula i=3, imprimindo 0 1 2 4.' },
        { q: 'O que faz enumerate()?', opts: ['Conta elementos', 'Retorna índice e valor', 'Ordena a lista', 'Filtra elementos'], answer: 1, explain: 'enumerate() retorna tuplas (índice, valor) para iteração.' },
        { q: 'Quais valores range(10, 0, -3) gera?', code: 'for i in range(10, 0, -3):\n    print(i, end=" ")', opts: ['"10 7 4 1"', '"10 7 4"', '"9 6 3"', '"10 7 4 1 -2"'], answer: 0, explain: 'Começa em 10 e desce de 3 em 3 enquanto o valor for maior que 0 (o fim não é incluído).' },
        { q: 'O que zip() produz ao percorrer as duas listas?', code: 'nomes = ["Ana", "Bia"]\nidades = [20, 30]\nfor n, i in zip(nomes, idades):\n    print(n, i)', opts: ['Ana 20 e Bia 30', 'Ana Bia e 20 30', 'Error', 'Ana 30 e Bia 20'], answer: 0, explain: 'zip() emparelha os itens das listas pela posição.' }
      ],
      hard: [
        { q: 'Qual é o resultado?', code: 'r = {x: x**2 for x in range(4)}\nprint(r[3])', opts: ['3', '9', '6', 'Error'], answer: 1, explain: 'Dict comprehension cria {0:0, 1:1, 2:4, 3:9}. r[3] = 9.' },
        { q: 'Qual é o resultado?', code: 'g = (x for x in range(3))\nprint(type(g).__name__)', opts: ['list', 'generator', 'tuple', 'range'], answer: 1, explain: 'Parênteses criam generator expression, não tupla nem lista.' },
        { q: 'Quando o else de um for é executado? O que aparece aqui?', code: 'for i in range(3):\n    if i == 5:\n        break\nelse:\n    print("fim")', opts: ['"fim"', 'Nada', 'Error', '0 1 2'], answer: 0, explain: 'O else de um for executa quando o laço termina sem break.' },
        { q: 'Qual lista a compreensão com o filtro x % 3 == 0 gera?', code: 'r = [x for x in range(10) if x % 3 == 0]\nprint(r)', opts: ['[0, 3, 6, 9]', '[3, 6, 9]', '[0, 3, 6]', '[1, 4, 7]'], answer: 0, explain: 'O filtro mantém os múltiplos de 3 entre 0 e 9, incluindo o 0.' },
        { q: 'Quanto vale a soma dos quadrados feita com sum() e um gerador?', code: 'total = sum(i * i for i in range(4))\nprint(total)', opts: ['14', '16', '6', '30'], answer: 0, explain: '0 + 1 + 4 + 9 = 14.' }
      ]
    },
    functions: {
      easy: [
        { q: 'Como declarar uma função em Python?', opts: ['function nome():', 'def nome():', 'func nome():', 'fn nome():'], answer: 1, explain: 'Python usa "def" para declarar funções.' },
        { q: 'Qual é o resultado?', code: 'def soma(a, b):\n    return a + b\nprint(soma(3, 4))', opts: ['7', '"34"', 'Error', 'None'], answer: 0, explain: 'soma(3, 4) retorna 3 + 4 = 7.' },
        { q: 'O que acontece se uma função não tem return?', opts: ['Retorna 0', 'Retorna None', 'Dá erro', 'Retorna False'], answer: 1, explain: 'Funções sem return explícito retornam None.' },
        { q: 'O que é um parâmetro padrão?', opts: ['Parâmetro obrigatório', 'Valor se não for passado', 'Primeiro parâmetro', 'Parâmetro global'], answer: 1, explain: 'Ex: def f(x=10) — se x não for passado, usa 10.' },
        { q: 'Qual palavra-chave devolve um valor de uma função Python?', opts: ['return', 'print', 'give', 'back'], answer: 0, explain: 'print só mostra na tela; return entrega o valor para quem chamou a função.' }
      ],
      medium: [
        { q: 'Qual é o resultado?', code: 'def f(a, b=5, c=10):\n    return a + b + c\nprint(f(1, c=20))', opts: ['26', '16', '31', 'Error'], answer: 0, explain: 'a=1, b=5 (padrão), c=20 (nomeado). 1+5+20=26.' },
        { q: 'O que *args faz?', opts: ['Recebe argumentos nomeados', 'Recebe número variável de argumentos', 'Desempacota lista', 'Multiplica argumentos'], answer: 1, explain: '*args coleta argumentos posicionais extras como tupla.' },
        { q: 'Qual é o resultado?', code: 'dobro = lambda x: x * 2\nprint(dobro(7))', opts: ['14', '7', 'Error', 'None'], answer: 0, explain: 'Lambda é uma função anônima de uma expressão. 7 * 2 = 14.' },
        { q: 'O que **kwargs recebe e o que sorted() devolve aqui?', code: 'def f(**kwargs):\n    return sorted(kwargs)\nprint(f(b=2, a=1))', opts: ["['a', 'b']", '[1, 2]', "{'a': 1, 'b': 2}", 'Error'], answer: 0, explain: '**kwargs recebe os argumentos nomeados como dicionário; sorted() de um dicionário ordena as chaves.' },
        { q: 'O que area() retorna com argumentos nomeados fora de ordem?', code: 'def area(base, altura):\n    return base * altura / 2\nprint(area(altura=4, base=3))', opts: ['6.0', '6', '12', 'Error'], answer: 0, explain: 'Argumentos nomeados podem vir em qualquer ordem; / retorna float: 3 * 4 / 2 = 6.0.' }
      ],
      hard: [
        { q: 'Qual é o resultado?', code: 'def make_adder(n):\n    def add(x):\n        return x + n\n    return add\nf = make_adder(5)\nprint(f(3))', opts: ['8', '5', '3', 'Error'], answer: 0, explain: 'Closure: add captura n=5. f(3) = 3 + 5 = 8.' },
        { q: 'Qual é o resultado?', code: 'def f(a, b=[]):\n    b.append(a)\n    return b\nprint(f(1))\nprint(f(2))', opts: ['[1] [2]', '[1] [1, 2]', 'Error', '[1, 2] [1, 2]'], answer: 1, explain: 'Armadilha: parâmetros mutáveis padrão são compartilhados entre chamadas.' },
        { q: 'Atribuir x dentro da função muda o x global?', code: 'x = 10\ndef f():\n    x = 5\nf()\nprint(x)', opts: ['10', '5', 'None', 'Error'], answer: 0, explain: 'O x de dentro da função é local; o global só mudaria com a declaração "global x".' },
        { q: 'O que list() devolve ao consumir o gerador com yield?', code: 'def gen():\n    yield 1\n    yield 2\nprint(list(gen()))', opts: ['[1, 2]', '[1]', '2', 'Error'], answer: 0, explain: 'yield transforma a função em gerador; list() consome todos os valores produzidos.' },
        { q: 'Como sorted() com key=lambda x: -x ordena a lista?', code: 'nums = [3, 1, 2]\nprint(sorted(nums, key=lambda x: -x))', opts: ['[3, 2, 1]', '[1, 2, 3]', '[-3, -2, -1]', 'Error'], answer: 0, explain: 'A chave -x inverte a ordem, mas sorted() devolve os valores originais.' }
      ]
    },
    lists: {
      easy: [
        { q: 'Como acessar o último elemento de uma lista?', opts: ['lista[-1]', 'lista[last]', 'lista.last()', 'lista[len]'], answer: 0, explain: 'Índice negativo: -1 é o último, -2 o penúltimo, etc.' },
        { q: 'Qual método adiciona um elemento ao final da lista?', opts: ['add()', 'append()', 'push()', 'insert()'], answer: 1, explain: 'append() adiciona ao final da lista.' },
        { q: 'Qual é o resultado?', code: 'a = [1, 2, 3]\nprint(len(a))', opts: ['2', '3', '4', 'Error'], answer: 1, explain: 'len() retorna o número de elementos: 3.' },
        { q: 'Qual é a diferença entre lista e tupla?', opts: ['Nenhuma', 'Lista é mutável, tupla não', 'Tupla é mutável, lista não', 'Lista só aceita números'], answer: 1, explain: 'Listas são mutáveis (podem mudar). Tuplas são imutáveis.' },
        { q: 'Qual elemento está no índice 1 desta lista?', code: 'a = [10, 20, 30]\nprint(a[1])', opts: ['10', '20', '30', 'Error'], answer: 1, explain: 'Os índices começam em 0, então a[1] é o segundo elemento.' }
      ],
      medium: [
        { q: 'Qual é o resultado?', code: 'a = [1, 2, 3, 4, 5]\nprint(a[1:4])', opts: ['[1, 2, 3]', '[2, 3, 4]', '[2, 3, 4, 5]', '[1, 2, 3, 4]'], answer: 1, explain: 'Slicing a[1:4] retorna elementos nos índices 1, 2, 3.' },
        { q: 'Qual é o resultado?', code: 'a = [3, 1, 4, 1, 5]\na.sort()\nprint(a[0])', opts: ['3', '1', '5', '0'], answer: 1, explain: 'sort() ordena a lista. O menor elemento (1) fica na posição 0.' },
        { q: 'Qual é o resultado?', code: 'a = [1, 2, 3]\nb = a + [4, 5]\nprint(b)', opts: ['[1,2,3,4,5]', '[1,2,3,[4,5]]', 'Error', '15'], answer: 0, explain: 'O operador + concatena listas.' },
        { q: 'Como fica a lista após insert(0, 9)?', code: 'a = [1, 2, 3]\na.insert(0, 9)\nprint(a)', opts: ['[9, 1, 2, 3]', '[1, 2, 3, 9]', '[9, 2, 3]', '[1, 9, 2, 3]'], answer: 0, explain: 'insert(índice, valor) coloca o valor na posição indicada e empurra o resto.' },
        { q: 'O que pop() sem argumento retorna e como fica a lista?', code: 'a = [5, 6, 7]\nx = a.pop()\nprint(x, a)', opts: ['7 [5, 6]', '5 [6, 7]', '7 [5, 6, 7]', 'Error'], answer: 0, explain: 'Sem argumento, pop() remove e devolve o último elemento.' }
      ],
      hard: [
        { q: 'Qual é o resultado?', code: 'a = [1, 2, 3]\nb = a[::-1]\nprint(b)', opts: ['[1, 2, 3]', '[3, 2, 1]', '[3]', 'Error'], answer: 1, explain: '[::-1] cria uma cópia invertida da lista.' },
        { q: 'Qual é o resultado?', code: 'a = [[0]*3 for _ in range(2)]\na[0][1] = 5\nprint(a)', opts: ['[[0,5,0],[0,0,0]]', '[[0,5,0],[0,5,0]]', 'Error', '[[5,5,5],[5,5,5]]'], answer: 0, explain: 'List comprehension cria listas independentes. Alterar uma não afeta a outra.' },
        { q: 'O que multiplicar uma lista por 2 produz?', code: 'a = [1, 2]\nb = a * 2\nprint(b)', opts: ['[1, 2, 1, 2]', '[2, 4]', '[[1, 2], [1, 2]]', 'Error'], answer: 0, explain: 'lista * n repete os elementos n vezes; não multiplica cada valor.' },
        { q: 'Como fica a matriz criada com [[0] * 2] * 2 após a[0][0] = 1?', code: 'a = [[0] * 2] * 2\na[0][0] = 1\nprint(a)', opts: ['[[1, 0], [1, 0]]', '[[1, 0], [0, 0]]', '[[1, 1], [0, 0]]', 'Error'], answer: 0, explain: 'Multiplicar a lista externa repete a MESMA lista interna: as duas linhas são o mesmo objeto.' },
        { q: 'O que b recebe de a.sort()?', code: 'a = [3, 1, 2]\nb = a.sort()\nprint(b)', opts: ['None', '[1, 2, 3]', '[3, 1, 2]', 'Error'], answer: 0, explain: 'list.sort() ordena no próprio lugar e retorna None; sorted(a) devolveria uma nova lista.' }
      ]
    },
    dicts: {
      easy: [
        { q: 'Como criar um dicionário vazio?', opts: ['d = {}', 'd = []', 'd = ()', 'd = set()'], answer: 0, explain: '{} cria um dicionário vazio em Python.' },
        { q: 'Como acessar um valor no dicionário?', opts: ['d.get[key]', 'd[key]', 'd(key)', 'd.value(key)'], answer: 1, explain: 'd[key] acessa o valor associado à chave.' },
        { q: 'Qual é o resultado?', code: 'd = {"a": 1, "b": 2}\nprint(d["b"])', opts: ['1', '2', '"b"', 'Error'], answer: 1, explain: 'd["b"] retorna o valor 2 associado à chave "b".' },
        { q: 'Qual método retorna todas as chaves?', opts: ['d.keys()', 'd.items()', 'd.values()', 'd.all()'], answer: 0, explain: 'd.keys() retorna todas as chaves do dicionário.' },
        { q: 'Como remover a chave "x" de um dicionário d?', opts: ['del d["x"]', 'd.remove("x")', 'd.delete("x")', 'd - "x"'], answer: 0, explain: 'del remove a chave; d.pop("x") também remove e ainda devolve o valor.' }
      ],
      medium: [
        { q: 'Qual é o resultado?', code: 'd = {"x": 1}\nd["y"] = 2\nprint(len(d))', opts: ['1', '2', '3', 'Error'], answer: 1, explain: 'Adicionou chave "y". O dict agora tem 2 itens.' },
        { q: 'Qual é a diferença entre d[key] e d.get(key)?', opts: ['Nenhuma', 'd.get() retorna None se não existir', 'd[key] é mais lento', 'd.get() modifica o dict'], answer: 1, explain: 'd[key] lança KeyError se não existir. d.get(key) retorna None.' },
        { q: 'Qual é o resultado?', code: 'd = {"a":1, "b":2, "c":3}\nfor k, v in d.items():\n    if v > 1:\n        print(k, end=" ")', opts: ['"b c"', '"a b c"', '"2 3"', '"a"'], answer: 0, explain: 'items() retorna pares (chave, valor). Filtra v > 1: b e c.' },
        { q: 'O que get() retorna com valor padrão para uma chave ausente?', code: 'd = {"a": 1}\nprint(d.get("b", 0))', opts: ['0', 'None', 'KeyError', '1'], answer: 0, explain: 'get() aceita um segundo argumento, devolvido quando a chave não existe.' },
        { q: 'O operador in verifica chaves ou valores? O que é impresso?', code: 'd = {"a": 1, "b": 2}\nprint("a" in d, 1 in d)', opts: ['True False', 'True True', 'False True', 'False False'], answer: 0, explain: 'Em dicionários, in verifica as chaves; para valores, use 1 in d.values().' }
      ],
      hard: [
        { q: 'Qual é o resultado?', code: 'from collections import Counter\nc = Counter("abracadabra")\nprint(c.most_common(1))', opts: ["[('a', 5)]", "{'a': 5}", "[('b', 2)]", "Error"], answer: 0, explain: 'Counter conta ocorrências. "a" aparece 5 vezes (mais comum).' },
        { q: 'Qual é o resultado?', code: 'd = {}\nd.setdefault("x", []).append(1)\nd.setdefault("x", []).append(2)\nprint(d["x"])', opts: ['[1, 2]', '[2]', '[1]', 'Error'], answer: 0, explain: 'setdefault cria a chave se não existir. Na 2ª vez, a lista já existe.' },
        { q: 'Como fica o dicionário após update()?', code: 'd = {"a": 1}\nd.update({"a": 5, "b": 2})\nprint(d)', opts: ["{'a': 5, 'b': 2}", "{'a': 1, 'b': 2}", "{'a': 6, 'b': 2}", 'Error'], answer: 0, explain: 'update() sobrescreve chaves existentes e acrescenta as novas.' },
        { q: 'O que o dicionário invertido devolve para a chave 2?', code: 'd = {"x": 1, "y": 2}\ninv = {v: k for k, v in d.items()}\nprint(inv[2])', opts: ['y', 'x', '2', 'KeyError'], answer: 0, explain: 'A compreensão troca chaves por valores: inv = {1: "x", 2: "y"}.' },
        { q: 'O que acontece ao usar uma lista como chave de dicionário?', code: 'd = {}\nd[[1, 2]] = "a"', opts: ['TypeError: listas não podem ser chaves', 'Cria a chave [1, 2]', 'Cria as chaves 1 e 2', 'Nada'], answer: 0, explain: 'Chaves precisam ser hasháveis (imutáveis); use uma tupla, como (1, 2).' }
      ]
    }
  },
  java: {
    variables: {
      easy: [
        { q: 'Qual tipo armazena números inteiros em Java?', opts: ['int', 'float', 'String', 'bool'], answer: 0, explain: 'int armazena números inteiros (32 bits) em Java.' },
        { q: 'Qual é o tipo para texto em Java?', opts: ['str', 'Text', 'String', 'string'], answer: 2, explain: 'String (com S maiúsculo) é o tipo para texto em Java.' },
        { q: 'Java é uma linguagem de tipagem...', opts: ['Dinâmica', 'Estática', 'Fraca', 'Sem tipagem'], answer: 1, explain: 'Java tem tipagem estática — tipos devem ser declarados.' },
        { q: 'Qual é o resultado?', code: 'int x = 10;\ndouble y = x;\nSystem.out.println(y);', opts: ['10', '10.0', 'Error', '0'], answer: 1, explain: 'Conversão implícita de int para double: 10 vira 10.0.' },
        { q: 'Qual tipo primitivo guarda verdadeiro ou falso em Java?', opts: ['boolean', 'bool', 'bit', 'truth'], answer: 0, explain: 'boolean aceita apenas true ou false.' }
      ],
      medium: [
        { q: 'Qual é a diferença entre int e Integer?', opts: ['Nenhuma', 'int é primitivo, Integer é objeto', 'Integer é mais rápido', 'int aceita null'], answer: 1, explain: 'int é tipo primitivo. Integer é a classe wrapper (objeto).' },
        { q: 'Qual é o resultado?', code: 'String a = "hello";\nString b = "hello";\nSystem.out.println(a == b);', opts: ['true', 'false', 'Error', 'null'], answer: 0, explain: 'String literals são internalizadas. Mesma referência no pool.' },
        { q: 'Qual modificador torna uma variável imutável?', opts: ['static', 'const', 'final', 'immutable'], answer: 2, explain: 'final impede reatribuição da variável após inicialização.' },
        { q: 'Quanto dá 7 / 2 entre dois int em Java?', code: 'int a = 7;\nint b = 2;\nSystem.out.println(a / b);', opts: ['3', '3.5', '4', 'Error'], answer: 0, explain: 'Divisão entre inteiros descarta a parte decimal.' },
        { q: 'O que o cast (int) faz com 9.99?', code: 'double d = 9.99;\nint n = (int) d;\nSystem.out.println(n);', opts: ['9', '10', '9.99', 'Error'], answer: 0, explain: 'O cast para int trunca a parte decimal, sem arredondar.' }
      ],
      hard: [
        { q: 'Qual é o resultado?', code: 'String a = new String("hi");\nString b = new String("hi");\nSystem.out.println(a == b);\nSystem.out.println(a.equals(b));', opts: ['true true', 'false false', 'false true', 'true false'], answer: 2, explain: '== compara referências (diferentes). equals() compara conteúdo (iguais).' },
        { q: 'Qual é o resultado?', code: 'int x = 127;\nint y = 127;\nInteger a = x;\nInteger b = y;\nSystem.out.println(a == b);', opts: ['true', 'false', 'Error', 'null'], answer: 0, explain: 'Integer cache: valores -128 a 127 são cacheados, mesma referência.' },
        { q: 'Qual é o valor de y com x++ e ++x na mesma expressão?', code: 'int x = 5;\nint y = x++ + ++x;\nSystem.out.println(y);', opts: ['12', '11', '10', '13'], answer: 0, explain: 'x++ usa 5 (x vira 6); ++x incrementa para 7 e usa 7: 5 + 7 = 12.' },
        { q: 'O que acontece ao somar 1 a Integer.MAX_VALUE?', code: 'int max = Integer.MAX_VALUE;\nSystem.out.println(max + 1 == Integer.MIN_VALUE);', opts: ['true', 'false', 'Lança exceção de overflow', 'Erro de compilação'], answer: 0, explain: 'int estoura silenciosamente: MAX_VALUE + 1 volta para MIN_VALUE.' },
        { q: 'O que var faz neste código (Java 10+)?', code: 'var lista = new ArrayList<String>();\nlista.add("a");\nSystem.out.println(lista.size());', opts: ['Infere o tipo ArrayList<String> em tempo de compilação', 'Torna a variável de tipo dinâmico', 'Cria uma variável global', 'Erro: var não existe em Java'], answer: 0, explain: 'var só dispensa escrever o tipo; a variável continua com tipo fixo, deduzido pelo compilador.' }
      ]
    },
    conditionals: {
      easy: [
        { q: 'Qual é a sintaxe correta de if em Java?', opts: ['if x > 5:', 'if (x > 5) {}', 'if x > 5 then', 'if [x > 5]'], answer: 1, explain: 'Java usa parênteses para condição e chaves para bloco.' },
        { q: 'Qual operador lógico significa "E"?', opts: ['||', '&&', '!', '&'], answer: 1, explain: '&& é o operador AND lógico (curto-circuito).' },
        { q: 'Qual é o resultado?', code: 'int x = 5;\nif (x > 3 && x < 10) {\n    System.out.println("A");\n}', opts: ['"A"', 'Nada', 'Error', '"true"'], answer: 0, explain: '5 > 3 E 5 < 10 são ambos true. Imprime "A".' },
        { q: 'O que o teste n % 2 == 0 imprime para n = 4?', code: 'int n = 4;\nif (n % 2 == 0) {\n    System.out.println("par");\n} else {\n    System.out.println("impar");\n}', opts: ['"par"', '"impar"', 'Error', 'Nada'], answer: 0, explain: '4 dividido por 2 deixa resto 0, então o número é par.' },
        { q: 'Qual é o tipo do resultado de uma comparação como (x > 3) em Java?', opts: ['boolean', 'int', 'String', 'void'], answer: 0, explain: 'Diferente de C, em Java as comparações resultam em boolean, não em 0 ou 1.' }
      ],
      medium: [
        { q: 'Qual é o resultado?', code: 'int x = 2;\nswitch(x) {\n  case 1: System.out.print("A");\n  case 2: System.out.print("B");\n  case 3: System.out.print("C");\n}', opts: ['"B"', '"BC"', '"ABC"', '"C"'], answer: 1, explain: 'Sem break, ocorre fall-through. Imprime "B" e "C".' },
        { q: 'Como comparar Strings em Java?', opts: ['a == b', 'a.equals(b)', 'a.compare(b)', 'a is b'], answer: 1, explain: 'equals() compara conteúdo de Strings. == compara referências.' },
        { q: 'O que o operador ternário atribui a r?', code: 'int x = 10;\nString r = (x > 5) ? "alto" : "baixo";\nSystem.out.println(r);', opts: ['"alto"', '"baixo"', 'true', 'Error'], answer: 0, explain: 'condição ? valorSeVerdadeiro : valorSeFalso. Como 10 > 5, r recebe "alto".' },
        { q: 'O que o switch com String e break imprime?', code: 'String s = "B";\nswitch (s) {\n  case "A": System.out.print(1); break;\n  case "B": System.out.print(2); break;\n  default: System.out.print(3);\n}', opts: ['2', '23', '3', 'Error'], answer: 0, explain: 'Desde o Java 7 o switch aceita String; o break impede o fall-through.' },
        { q: 'Qual é a diferença entre & e && com booleanos em Java?', opts: ['&& faz curto-circuito; & sempre avalia os dois lados', 'São idênticos', '& faz curto-circuito; && não', '& só funciona com Strings'], answer: 0, explain: 'Com &&, se o lado esquerdo for false o direito nem é avaliado.' }
      ],
      hard: [
        { q: 'Qual é o resultado?', code: 'Integer a = null;\nif (a != null && a > 0) {\n    System.out.println("pos");\n} else {\n    System.out.println("nao");\n}', opts: ['"pos"', '"nao"', 'NullPointerException', 'Error'], answer: 1, explain: '&& faz curto-circuito: a != null é false, não avalia a > 0.' },
        { q: 'O que a expressão switch com setas (Java 14+) retorna para dia 3?', code: 'int dia = 3;\nString nome = switch (dia) {\n  case 1, 7 -> "fim de semana";\n  default -> "dia útil";\n};\nSystem.out.println(nome);', opts: ['"dia útil"', '"fim de semana"', 'Error', 'null'], answer: 0, explain: 'O switch como expressão, com setas, não tem fall-through e devolve um valor.' },
        { q: 'Por que "ok".equals(a) é seguro com a nulo? O que é impresso?', code: 'String a = null;\nif ("ok".equals(a)) {\n    System.out.println("igual");\n} else {\n    System.out.println("diferente");\n}', opts: ['"diferente"', '"igual"', 'NullPointerException', 'Erro de compilação'], answer: 0, explain: 'Chamar equals no literal evita NullPointerException quando a variável é null.' },
        { q: 'O que o pattern matching do instanceof imprime?', code: 'Object o = "texto";\nif (o instanceof String s) {\n    System.out.println(s.length());\n}', opts: ['5', '"texto"', 'Erro de compilação', '0'], answer: 0, explain: 'O instanceof com padrão (Java 16+) já declara s como String quando o teste passa.' },
        { q: 'O que acontece com & (sem curto-circuito) quando x é 0?', code: 'int x = 0;\nif (x != 0 & 10 / x > 1) {\n    System.out.println("A");\n}', opts: ['ArithmeticException (divisão por zero)', 'Nada é impresso', '"A"', 'Erro de compilação'], answer: 0, explain: 'O & avalia os dois lados, então 10 / x é calculado mesmo com x igual a 0.' }
      ]
    },
    loops: {
      easy: [
        { q: 'Qual é a sintaxe do for em Java?', opts: ['for i in range(5)', 'for (int i=0; i<5; i++)', 'for (i to 5)', 'for each (0..5)'], answer: 1, explain: 'Java usa for (inicialização; condição; incremento).' },
        { q: 'Quantas vezes o loop executa?', code: 'for (int i = 0; i < 4; i++) {\n    System.out.print(i);\n}', opts: ['3', '4', '5', '0'], answer: 1, explain: 'i vai de 0 a 3: 4 iterações.' },
        { q: 'O que break faz em Java?', opts: ['Pula iteração', 'Sai do loop', 'Reinicia', 'Pausa'], answer: 1, explain: 'break encerra o loop imediatamente.' },
        { q: 'Quanto vale i ao final deste while?', code: 'int i = 0;\nwhile (i < 3) {\n    i++;\n}\nSystem.out.println(i);', opts: ['3', '2', '4', '0'], answer: 0, explain: 'O laço para quando i chega a 3, pois 3 < 3 é falso.' },
        { q: 'O que continue faz dentro de um loop em Java?', opts: ['Pula para a próxima iteração', 'Sai do loop', 'Encerra o programa', 'Reinicia o loop do zero'], answer: 0, explain: 'O restante do corpo é ignorado e o laço segue para a próxima volta.' }
      ],
      medium: [
        { q: 'Qual é a sintaxe do for-each?', opts: ['for x in arr', 'for (int x : arr)', 'foreach (x in arr)', 'for each x arr'], answer: 1, explain: 'Enhanced for loop: for (tipo variável : coleção).' },
        { q: 'Qual é o resultado?', code: 'int s = 0;\nfor (int i=1; i<=5; i++) s += i;\nSystem.out.println(s);', opts: ['10', '15', '5', '20'], answer: 1, explain: '1+2+3+4+5 = 15.' },
        { q: 'Quanto soma o for-each sobre o array?', code: 'int[] nums = {2, 4, 6};\nint soma = 0;\nfor (int n : nums) soma += n;\nSystem.out.println(soma);', opts: ['12', '6', '246', '3'], answer: 0, explain: 'O for-each visita 2, 4 e 6: 2 + 4 + 6 = 12.' },
        { q: 'Quanto vale i depois deste do-while?', code: 'int i = 10;\ndo {\n    i++;\n} while (i < 5);\nSystem.out.println(i);', opts: ['11', '10', '5', 'Loop infinito'], answer: 0, explain: 'O do-while executa o corpo uma vez antes de testar; depois, 11 < 5 é falso.' },
        { q: 'O que o for com i -= 2 imprime?', code: 'for (int i = 5; i > 0; i -= 2) {\n    System.out.print(i + " ");\n}', opts: ['"5 3 1 "', '"5 4 3 2 1 "', '"5 3 "', '"4 2 0 "'], answer: 0, explain: 'i assume 5, 3 e 1; em seguida vira -1 e a condição i > 0 falha.' }
      ],
      hard: [
        { q: 'Qual é o resultado?', code: 'outer:\nfor (int i=0; i<3; i++) {\n  for (int j=0; j<3; j++) {\n    if (j==1) continue outer;\n    System.out.print(i+""+j+" ");\n  }\n}', opts: ['"00 10 20 "', '"00 01 10 11 20 21 "', '"00 01 02 "', 'Error'], answer: 0, explain: 'Label "outer" faz continue pular para o próximo i. Só j=0 é impresso.' },
        { q: 'Quantas vezes c++ executa nos dois for aninhados?', code: 'int c = 0;\nfor (int i = 0; i < 3; i++)\n    for (int j = 0; j < 4; j++)\n        c++;\nSystem.out.println(c);', opts: ['12', '7', '16', '9'], answer: 0, explain: 'O laço interno roda 4 vezes para cada uma das 3 voltas do externo: 3 × 4 = 12.' },
        { q: 'O que acontece ao remover da lista dentro do for-each?', code: 'List<Integer> lista = new ArrayList<>(List.of(1, 2, 3));\nfor (Integer n : lista) {\n    if (n == 1) lista.remove(n);\n}', opts: ['ConcurrentModificationException', 'Remove o 1 normalmente', 'Erro de compilação', 'Loop infinito'], answer: 0, explain: 'Alterar a lista durante o for-each invalida o iterador; use Iterator.remove() ou removeIf().' },
        { q: 'Em que valor de i o while (true) para?', code: 'int i = 0;\nwhile (true) {\n    if (++i == 4) break;\n}\nSystem.out.println(i);', opts: ['4', '3', '5', 'Loop infinito'], answer: 0, explain: '++i incrementa antes de comparar; quando i chega a 4, o break encerra o laço.' },
        { q: 'O que o for com uma variável char imprime?', code: "StringBuilder sb = new StringBuilder();\nfor (char c = 'a'; c <= 'c'; c++) sb.append(c);\nSystem.out.println(sb);", opts: ['abc', 'a b c', '979899', 'Error'], answer: 0, explain: 'char é um tipo numérico, então c++ avança para a próxima letra: a, b, c.' }
      ]
    },
    functions: {
      easy: [
        { q: 'O que "void" significa no retorno de um método?', opts: ['Retorna 0', 'Retorna null', 'Não retorna nada', 'Retorna vazio'], answer: 2, explain: 'void indica que o método não retorna nenhum valor.' },
        { q: 'Qual é a sintaxe para declarar um método?', opts: ['def metodo():', 'function metodo()', 'tipo nomeMetodo(params)', 'method nomeMetodo'], answer: 2, explain: 'Em Java: tipoRetorno nomeDoMetodo(parametros) { corpo }.' },
        { q: 'O que é sobrecarga (overload)?', opts: ['Métodos com mesmo nome e parâmetros diferentes', 'Herdar um método', 'Método privado', 'Método estático'], answer: 0, explain: 'Overload: mesmo nome, parâmetros diferentes (tipo ou quantidade).' },
        { q: 'Em "public static int dobro(int x)", qual é o tipo de retorno?', opts: ['int', 'public', 'static', 'x'], answer: 0, explain: 'O tipo de retorno vem logo antes do nome do método.' },
        { q: 'Como se chama o método por onde um programa Java começa a executar?', opts: ['main', 'start', 'run', 'init'], answer: 0, explain: 'A JVM procura public static void main(String[] args).' }
      ],
      medium: [
        { q: 'Qual é o resultado?', code: 'static int soma(int a, int b) {\n    return a + b;\n}\n// chamada:\nSystem.out.println(soma(3, 4));', opts: ['7', '34', 'Error', 'void'], answer: 0, explain: 'Método soma retorna 3 + 4 = 7.' },
        { q: 'Java passa objetos por...', opts: ['Valor', 'Referência', 'Cópia da referência', 'Ponteiro'], answer: 2, explain: 'Java passa a cópia da referência. Pode mutar o objeto, mas não reatribuir.' },
        { q: 'O método muda() altera a variável a de quem chamou?', code: 'static void muda(int x) {\n    x = 99;\n}\n// chamada:\nint a = 1;\nmuda(a);\nSystem.out.println(a);', opts: ['1', '99', '0', 'Error'], answer: 0, explain: 'Primitivos são passados por valor: o método altera apenas a cópia.' },
        { q: 'O que é um método static?', opts: ['Pertence à classe e pode ser chamado sem criar um objeto', 'Não pode receber parâmetros', 'Não pode retornar valores', 'É executado só uma vez'], answer: 0, explain: 'Ex.: Math.max(1, 2) é chamado direto na classe Math.' },
        { q: 'Qual é o resultado da recursão f(4)?', code: 'static int f(int n) {\n    if (n == 0) return 0;\n    return n + f(n - 1);\n}\n// chamada:\nSystem.out.println(f(4));', opts: ['10', '4', '24', '0'], answer: 0, explain: 'f(4) = 4 + 3 + 2 + 1 + 0 = 10.' }
      ],
      hard: [
        { q: 'O que é um método varargs?', code: 'static int soma(int... nums) {\n    int s = 0;\n    for (int n : nums) s += n;\n    return s;\n}', opts: ['Método com array fixo', 'Aceita número variável de args', 'Método genérico', 'Método sobrecarregado'], answer: 1, explain: 'Varargs (int...) aceita 0 ou mais argumentos como array.' },
        { q: 'O que a lista contém depois de chamar add()?', code: 'static void add(List<Integer> l) {\n    l.add(1);\n    l = new ArrayList<>();\n    l.add(2);\n}\n// chamada:\nList<Integer> lista = new ArrayList<>();\nadd(lista);\nSystem.out.println(lista);', opts: ['[1]', '[1, 2]', '[2]', '[]'], answer: 0, explain: 'O método recebe uma cópia da referência: altera o objeto original (add 1), mas reatribuir l não afeta a variável de quem chamou.' },
        { q: 'Qual destas NÃO é uma sobrecarga válida de "int soma(int a, int b)"?', opts: ['double soma(int a, int b)', 'int soma(int a, int b, int c)', 'double soma(double a, double b)', 'int soma(long a, int b)'], answer: 0, explain: 'Mudar só o tipo de retorno não diferencia métodos; a lista de parâmetros precisa mudar.' },
        { q: 'O que acontece com uma recursão sem caso base em Java?', opts: ['StackOverflowError', 'Retorna null', 'Erro de compilação', 'O método é ignorado'], answer: 0, explain: 'Cada chamada ocupa espaço na pilha, que acaba se esgotando.' },
        { q: 'O que a lambda dobro.apply(21) retorna?', code: 'Function<Integer, Integer> dobro = x -> x * 2;\nSystem.out.println(dobro.apply(21));', opts: ['42', '21', 'x * 2', 'Error'], answer: 0, explain: 'Lambdas (Java 8+) implementam interfaces funcionais como Function.' }
      ]
    },
    arrays: {
      easy: [
        { q: 'Como declarar um array de inteiros em Java?', opts: ['int arr[]', 'int[] arr', 'Ambas estão corretas', 'array<int> arr'], answer: 2, explain: 'Tanto int[] arr quanto int arr[] são válidos em Java.' },
        { q: 'Qual é o índice do primeiro elemento?', opts: ['0', '1', '-1', 'Depende'], answer: 0, explain: 'Arrays em Java são indexados a partir de 0.' },
        { q: 'Como obter o tamanho de um array?', opts: ['arr.size()', 'arr.length', 'arr.count()', 'len(arr)'], answer: 1, explain: 'Arrays usam .length (sem parênteses). ArrayList usa .size().' },
        { q: 'Qual valor está em a[2]?', code: 'int[] a = {4, 8, 15};\nSystem.out.println(a[2]);', opts: ['15', '8', '4', 'Error'], answer: 0, explain: 'Os índices começam em 0: a[2] é o terceiro elemento.' },
        { q: 'Qual método adiciona um elemento a um ArrayList?', opts: ['add()', 'push()', 'append()', 'insert()'], answer: 0, explain: 'lista.add(valor) coloca o valor no final da lista.' }
      ],
      medium: [
        { q: 'Qual é o resultado?', code: 'int[] a = {5, 3, 1};\nArrays.sort(a);\nSystem.out.println(a[0]);', opts: ['5', '3', '1', 'Error'], answer: 2, explain: 'Arrays.sort() ordena em ordem crescente. a[0] = 1.' },
        { q: 'ArrayList vs Array: qual vantagem?', opts: ['ArrayList é mais rápido', 'ArrayList tem tamanho dinâmico', 'Array aceita generics', 'Nenhuma diferença'], answer: 1, explain: 'ArrayList cresce dinamicamente. Arrays têm tamanho fixo.' },
        { q: 'Qual é o valor padrão de um elemento de new int[3]?', code: 'int[] a = new int[3];\nSystem.out.println(a[1]);', opts: ['0', 'null', 'Lixo de memória', 'Error'], answer: 0, explain: 'Arrays de int são inicializados com 0 automaticamente.' },
        { q: 'O que acontece ao acessar a[3] em um array de 3 elementos?', code: 'int[] a = {1, 2, 3};\nSystem.out.println(a[3]);', opts: ['ArrayIndexOutOfBoundsException', 'Imprime 0', 'Imprime 3', 'Erro de compilação'], answer: 0, explain: 'Os índices válidos vão de 0 a 2; Java verifica os limites em tempo de execução.' },
        { q: 'Como fica o ArrayList após remove(0)?', code: 'ArrayList<String> l = new ArrayList<>();\nl.add("a");\nl.add("b");\nl.remove(0);\nSystem.out.println(l);', opts: ['[b]', '[a]', '[a, b]', '[]'], answer: 0, explain: 'remove(0) tira o elemento do índice 0 e os demais andam uma posição.' }
      ],
      hard: [
        { q: 'Qual é o resultado?', code: 'int[] a = {1, 2, 3};\nint[] b = a;\nb[0] = 99;\nSystem.out.println(a[0]);', opts: ['1', '99', 'Error', '0'], answer: 1, explain: 'Arrays são objetos. b = a copia a referência, não o conteúdo.' },
        { q: 'Qual é o tamanho da segunda linha desta matriz irregular?', code: 'int[][] m = {{1, 2}, {3, 4, 5}};\nSystem.out.println(m[1].length);', opts: ['3', '2', '5', 'Error'], answer: 0, explain: 'Arrays multidimensionais em Java podem ter linhas de tamanhos diferentes.' },
        { q: 'O que comparam a.equals(b) e Arrays.equals(a, b)?', code: 'int[] a = {1, 2};\nint[] b = {1, 2};\nSystem.out.println(a.equals(b) + " " + Arrays.equals(a, b));', opts: ['"false true"', '"true true"', '"false false"', '"true false"'], answer: 0, explain: 'Em arrays, equals compara referências; Arrays.equals compara o conteúdo.' },
        { q: 'Em List<Integer>, o que remove(1) remove?', code: 'List<Integer> l = new ArrayList<>(List.of(10, 20, 30));\nl.remove(1);\nSystem.out.println(l);', opts: ['[10, 30]', '[20, 30]', '[10, 20, 30]', 'Error'], answer: 0, explain: 'remove(int) remove pelo índice; para remover o valor 1 seria remove(Integer.valueOf(1)).' },
        { q: 'O que acontece ao chamar add() em uma lista criada com List.of?', code: 'List<Integer> l = List.of(1, 2, 3);\nl.add(4);', opts: ['UnsupportedOperationException', 'A lista vira [1, 2, 3, 4]', 'Erro de compilação', 'Nada'], answer: 0, explain: 'List.of cria uma lista imutável.' }
      ]
    },
    oop: {
      easy: [
        { q: 'O que é uma classe em Java?', opts: ['Uma variável', 'Um molde para objetos', 'Um método', 'Um pacote'], answer: 1, explain: 'Classe é um molde/template que define atributos e métodos de objetos.' },
        { q: 'Qual palavra-chave cria um objeto?', opts: ['create', 'new', 'make', 'init'], answer: 1, explain: 'new instancia (cria) um objeto a partir de uma classe.' },
        { q: 'O que é encapsulamento?', opts: ['Herdar métodos', 'Esconder dados internos', 'Criar objetos', 'Sobrescrever métodos'], answer: 1, explain: 'Encapsulamento protege dados internos usando modificadores de acesso.' },
        { q: 'O que é um objeto em Java?', opts: ['Uma instância criada a partir de uma classe', 'Um tipo primitivo', 'Um pacote', 'Um comentário'], answer: 0, explain: 'A classe é o molde; cada objeto criado com new é uma instância dela.' },
        { q: 'Como se chama o método especial executado ao criar um objeto com new?', opts: ['Construtor', 'Destrutor', 'main', 'Getter'], answer: 0, explain: 'O construtor tem o mesmo nome da classe e inicializa os atributos.' }
      ],
      medium: [
        { q: 'Qual palavra-chave indica herança?', opts: ['implements', 'extends', 'inherits', 'super'], answer: 1, explain: '"extends" faz uma classe herdar de outra.' },
        { q: 'O que é polimorfismo?', opts: ['Uma classe ter vários atributos', 'Mesmo método com comportamentos diferentes', 'Criar múltiplos objetos', 'Ter várias interfaces'], answer: 1, explain: 'Polimorfismo: mesma chamada de método, comportamento diferente por tipo.' },
        { q: 'Interface vs Classe abstrata?', opts: ['São iguais', 'Interface só tem assinaturas, abstrata pode ter implementação', 'Classe abstrata não pode ter métodos', 'Interface pode ser instanciada'], answer: 1, explain: 'Interfaces definem contratos. Classes abstratas podem ter métodos implementados.' },
        { q: 'O modificador private em um atributo significa que ele...', opts: ['Só pode ser acessado dentro da própria classe', 'Pode ser acessado por qualquer classe', 'Só pode ser acessado por subclasses', 'É constante'], answer: 0, explain: 'Para expor o valor de forma controlada, usam-se métodos como getters e setters.' },
        { q: 'O que a anotação @Override indica?', opts: ['Que o método sobrescreve um método da superclasse ou interface', 'Que o método é estático', 'Que o método é privado', 'Que o método é obsoleto'], answer: 0, explain: 'Se a assinatura não corresponder a um método herdado, o compilador acusa erro.' }
      ],
      hard: [
        { q: 'Java suporta herança múltipla de classes?', opts: ['Sim', 'Não, mas suporta múltiplas interfaces', 'Sim, com diamond pattern', 'Depende da versão'], answer: 1, explain: 'Java não permite herdar de 2+ classes, mas pode implementar múltiplas interfaces.' },
        { q: 'Qual versão de f() é chamada quando A obj = new B()?', code: 'class A { String f() { return "A"; } }\nclass B extends A { String f() { return "B"; } }\n// uso:\nA obj = new B();\nSystem.out.println(obj.f());', opts: ['"B"', '"A"', '"AB"', 'Error'], answer: 0, explain: 'Polimorfismo: o método executado depende do tipo real do objeto (B), não do tipo da variável.' },
        { q: 'Para que serve super(...) no construtor de uma subclasse?', opts: ['Chamar o construtor da superclasse', 'Criar um objeto da subclasse', 'Acessar métodos estáticos', 'Encerrar o construtor'], answer: 0, explain: 'Deve ser a primeira instrução do construtor.' },
        { q: 'Uma classe declarada como final...', opts: ['Não pode ser herdada', 'Não pode ter métodos', 'Não pode ser instanciada', 'Só tem atributos constantes'], answer: 0, explain: 'String é um exemplo de classe final do Java.' },
        { q: 'Ao sobrescrever equals() em Java, o que também deve ser feito?', opts: ['Sobrescrever hashCode() de forma consistente', 'Tornar a classe abstrata', 'Declarar equals como static', 'Nunca usar instanceof'], answer: 0, explain: 'Objetos iguais por equals devem ter o mesmo hashCode; senão, HashMap e HashSet falham.' }
      ]
    }
  },
  c: {
    variables: {
      easy: [
        { q: 'Qual tipo armazena um caractere em C?', opts: ['char', 'string', 'character', 'chr'], answer: 0, explain: 'char armazena um único caractere (1 byte) em C.' },
        { q: 'Qual é o tamanho de int na maioria dos sistemas?', opts: ['1 byte', '2 bytes', '4 bytes', '8 bytes'], answer: 2, explain: 'int geralmente ocupa 4 bytes (32 bits) em sistemas modernos.' },
        { q: 'Como imprimir um inteiro com printf?', opts: ['%s', '%d', '%f', '%c'], answer: 1, explain: '%d é o especificador de formato para inteiros em printf.' },
        { q: 'Qual é o resultado?', code: 'int x = 7 / 2;\nprintf("%d", x);', opts: ['3.5', '3', '4', 'Error'], answer: 1, explain: 'Divisão inteira: 7 / 2 = 3 (trunca a parte decimal).' },
        { q: 'Qual especificador do printf imprime um número float?', opts: ['%f', '%d', '%c', '%s'], answer: 0, explain: '%f é para números de ponto flutuante; %.2f limita a 2 casas decimais.' }
      ],
      medium: [
        { q: 'Qual é o resultado?', code: 'int a = 5;\nfloat b = a / 2;\nprintf("%.1f", b);', opts: ['2.5', '2.0', '2', 'Error'], answer: 1, explain: '5 / 2 é divisão inteira = 2. Depois é convertido para float 2.0.' },
        { q: 'O que sizeof retorna?', opts: ['Valor da variável', 'Tamanho em bytes', 'Endereço de memória', 'Tipo da variável'], answer: 1, explain: 'sizeof retorna o tamanho em bytes de um tipo ou variável.' },
        { q: 'Qual a diferença entre float e double?', opts: ['Nenhuma', 'double tem mais precisão', 'float é mais preciso', 'double é para inteiros'], answer: 1, explain: 'float: 4 bytes (~7 dígitos). double: 8 bytes (~15 dígitos).' },
        { q: 'Quanto vale a % b com a = 10 e b = 3?', code: 'int a = 10, b = 3;\nprintf("%d", a % b);', opts: ['1', '3', '0', '3.33'], answer: 0, explain: '10 = 3 × 3 + 1, então o resto é 1.' },
        { q: 'O que 5 / 2.0 guarda em x?', code: 'float x = 5 / 2.0;\nprintf("%.1f", x);', opts: ['2.5', '2.0', '2', 'Error'], answer: 0, explain: 'Como 2.0 é double, a divisão não é inteira.' }
      ],
      hard: [
        { q: 'Qual é o resultado?', code: 'unsigned int x = -1;\nprintf("%u", x);', opts: ['−1', '0', '4294967295', 'Error'], answer: 2, explain: 'unsigned int interpreta -1 como o maior valor possível (2^32 - 1).' },
        { q: 'Qual é o resultado?', code: 'char c = 65;\nprintf("%c", c);', opts: ['"65"', '"A"', 'Error', '"a"'], answer: 1, explain: '65 é o código ASCII de "A".' },
        { q: "Qual caractere resulta de 'A' + 2?", code: 'char c = \'A\' + 2;\nprintf("%c", c);', opts: ['C', 'B', '67', 'Error'], answer: 0, explain: 'char é um número: 65 + 2 = 67, o código ASCII de C.' },
        { q: 'O sizeof avalia o x++? O que é impresso?', code: 'int x = 5;\nprintf("%zu", sizeof(x++));\nprintf(" %d", x);', opts: ['"4 5"', '"4 6"', '"5 6"', '"1 5"'], answer: 0, explain: 'sizeof não avalia a expressão, então x++ não acontece; int tem 4 bytes na maioria das plataformas.' },
        { q: 'Quais valores ficam em i e j após j = i++ * 2?', code: 'int i = 3;\nint j = i++ * 2;\nprintf("%d %d", i, j);', opts: ['"4 6"', '"4 8"', '"3 6"', '"3 8"'], answer: 0, explain: 'i++ usa o valor 3 na conta e só depois incrementa i para 4.' }
      ]
    },
    conditionals: {
      easy: [
        { q: 'Qual é a sintaxe do if em C?', opts: ['if x > 5:', 'if (x > 5) {}', 'if x > 5 then', 'if [x > 5]'], answer: 1, explain: 'C usa parênteses para condição e chaves para bloco.' },
        { q: 'Em C, qual operador testa se dois valores são diferentes?', opts: ['<>', '!=', '=/=', 'not'], answer: 1, explain: '!= é o operador "diferente de" em C; <> não existe na linguagem.' },
        { q: 'Em C, qual valor é considerado "false"?', opts: ['0', '-1', 'null', '"false"'], answer: 0, explain: 'Em C, 0 é false. Qualquer valor diferente de 0 é true.' },
        { q: 'O que este if-else imprime para x = 3?', code: 'int x = 3;\nif (x > 5) {\n    printf("A");\n} else {\n    printf("B");\n}', opts: ['"B"', '"A"', '"AB"', 'Nada'], answer: 0, explain: '3 > 5 é falso, então executa o else.' },
        { q: 'Em C, quanto vale a expressão (5 > 3)?', opts: ['1', '0', 'true', '"verdadeiro"'], answer: 0, explain: 'Em C, comparações resultam em int: 1 para verdadeiro e 0 para falso.' }
      ],
      medium: [
        { q: 'Qual é o resultado?', code: 'int x = 5;\nint r = (x > 3) ? 10 : 20;\nprintf("%d", r);', opts: ['10', '20', '5', 'Error'], answer: 0, explain: '5 > 3 é verdadeiro, então r = 10.' },
        { q: 'Qual é o resultado?', code: 'int x = 0;\nif (x = 5) {\n    printf("A");\n} else {\n    printf("B");\n}', opts: ['"A"', '"B"', 'Error', '"0"'], answer: 0, explain: 'x = 5 é atribuição (não comparação). O valor 5 é truthy.' },
        { q: 'O que o switch com break imprime para n = 2?', code: 'int n = 2;\nswitch (n) {\n  case 1: printf("um"); break;\n  case 2: printf("dois"); break;\n  default: printf("outro");\n}', opts: ['"dois"', '"doisoutro"', '"um"', '"outro"'], answer: 0, explain: 'O break encerra o switch logo após o case 2.' },
        { q: 'O que a condição a > 3 && b < 5 imprime?', code: 'int a = 5, b = 10;\nif (a > 3 && b < 5)\n    printf("X");\nelse\n    printf("Y");', opts: ['"Y"', '"X"', '"XY"', 'Nada'], answer: 0, explain: 'b < 5 é falso, então a conjunção inteira é falsa.' },
        { q: 'O que if (!x) faz quando x é 0?', code: 'int x = 0;\nif (!x)\n    printf("zero");', opts: ['"zero"', 'Nada', '"0"', 'Error'], answer: 0, explain: '!0 vale 1 (verdadeiro), então o printf executa.' }
      ],
      hard: [
        { q: 'Qual é o resultado?', code: 'int a = 1, b = 0;\nint c = a || (b = 5);\nprintf("%d %d", c, b);', opts: ['1 5', '1 0', '0 5', '5 0'], answer: 1, explain: '|| faz curto-circuito: a é truthy, então b = 5 NÃO é avaliado.' },
        { q: 'A qual if pertence o else (dangling else)? O que é impresso?', code: 'int a = 0, b = 1;\nif (a)\n    if (b) printf("1");\nelse\n    printf("2");', opts: ['Nada', '"2"', '"1"', '"12"'], answer: 0, explain: 'O else pertence ao if mais próximo, o if (b). Como a é 0, nada executa; a indentação engana.' },
        { q: 'Qual valor o ternário aninhado atribui a r?', code: 'int a = 5;\nint r = a > 3 ? a < 10 ? 1 : 2 : 3;\nprintf("%d", r);', opts: ['1', '2', '3', 'Error'], answer: 0, explain: 'Equivale a a > 3 ? (a < 10 ? 1 : 2) : 3; como 5 está entre 3 e 10, r = 1.' },
        { q: 'Comparar o float 0.1f com 0.1 dá igual?', code: 'float f = 0.1f;\nif (f == 0.1)\n    printf("igual");\nelse\n    printf("diferente");', opts: ['"diferente"', '"igual"', 'Error', 'Nada'], answer: 0, explain: '0.1f (float) e 0.1 (double) têm aproximações binárias diferentes, então a comparação é falsa.' },
        { q: 'O que o teste x & 1 imprime para x = 5?', code: 'int x = 5;\nif (x & 1)\n    printf("ímpar");\nelse\n    printf("par");', opts: ['"ímpar"', '"par"', 'Error', 'Nada'], answer: 0, explain: 'x & 1 testa o bit menos significativo; 5 (101 em binário) tem esse bit ligado.' }
      ]
    },
    loops: {
      easy: [
        { q: 'Quantas vezes o loop executa?', code: 'for (int i = 0; i < 5; i++) {\n    printf("%d ", i);\n}', opts: ['4', '5', '6', 'infinito'], answer: 1, explain: 'i vai de 0 a 4: 5 iterações.' },
        { q: 'Qual loop verifica a condição após executar?', opts: ['for', 'while', 'do-while', 'switch'], answer: 2, explain: 'do-while executa o corpo e depois verifica a condição.' },
        { q: 'O que break faz?', opts: ['Pula iteração', 'Sai do loop', 'Volta ao início', 'Encerra programa'], answer: 1, explain: 'break sai do loop mais interno.' },
        { q: 'O que este while imprime enquanto i < 3?', code: 'int i = 0;\nwhile (i < 3) {\n    printf("%d", i);\n    i++;\n}', opts: ['"012"', '"123"', '"0123"', '"01"'], answer: 0, explain: 'Imprime 0, 1 e 2; com i = 3 a condição falha.' },
        { q: 'Qual soma o for de 1 a 4 imprime?', code: 'int s = 0;\nfor (int i = 1; i <= 4; i++)\n    s += i;\nprintf("%d", s);', opts: ['10', '4', '6', '15'], answer: 0, explain: '1 + 2 + 3 + 4 = 10.' }
      ],
      medium: [
        { q: 'Qual é o resultado?', code: 'int i = 10;\nwhile (i > 0) {\n    i /= 3;\n}\nprintf("%d", i);', opts: ['0', '1', '3', 'Loop infinito'], answer: 0, explain: 'i: 10→3→1→0. Quando i=0, i > 0 é false.' },
        { q: 'O que acontece com for(;;)?', opts: ['Erro de sintaxe', 'Não executa', 'Loop infinito', 'Executa uma vez'], answer: 2, explain: 'for(;;) é um loop infinito válido em C (todos campos vazios).' },
        { q: 'Quantas vezes o do-while executa quando a condição já começa falsa?', code: 'int i = 5;\ndo {\n    printf("%d", i);\n} while (i < 3);', opts: ['"5"', 'Nada', '"345"', 'Loop infinito'], answer: 0, explain: 'O do-while sempre executa o corpo pelo menos uma vez.' },
        { q: 'O que continue e break imprimem juntos neste for?', code: 'for (int i = 0; i < 5; i++) {\n    if (i == 2) continue;\n    if (i == 4) break;\n    printf("%d", i);\n}', opts: ['"013"', '"0134"', '"01"', '"0123"'], answer: 0, explain: 'O 2 é pulado pelo continue e o laço termina no 4 pelo break.' },
        { q: 'Quantos dígitos o laço conta em 12345?', code: 'int n = 12345, d = 0;\nwhile (n > 0) {\n    n /= 10;\n    d++;\n}\nprintf("%d", d);', opts: ['5', '4', '15', '12345'], answer: 0, explain: 'Cada divisão por 10 remove um dígito, até n chegar a 0.' }
      ],
      hard: [
        { q: 'Qual é o resultado?', code: 'int s = 0;\nfor (int i=1; i<=100; i++) {\n    if (i % 2 != 0) continue;\n    s += i;\n}\nprintf("%d", s);', opts: ['5050', '2550', '2500', '50'], answer: 1, explain: 'Soma apenas os pares de 1 a 100: 2+4+6+...+100 = 2550.' },
        { q: 'O que o ponto e vírgula logo após o for causa?', code: 'int i;\nfor (i = 0; i < 3; i++);\nprintf("%d", i);', opts: ['3', '"012"', '0', '2'], answer: 0, explain: 'O ; cria um laço de corpo vazio; o printf roda uma única vez, com i = 3.' },
        { q: 'O que acontece com um contador unsigned e a condição i >= 0?', code: 'unsigned int i;\nfor (i = 3; i >= 0; i--)\n    printf("%u ", i);', opts: ['Loop infinito', 'Imprime 3 2 1 0', 'Imprime 3 2 1', 'Erro de compilação'], answer: 0, explain: 'unsigned nunca é negativo: depois de 0, i-- vira 4294967295 e i >= 0 continua verdadeiro.' },
        { q: 'Quantas vezes c++ executa com j começando em i?', code: 'int c = 0;\nfor (int i = 0; i < 4; i++)\n    for (int j = i; j < 4; j++)\n        c++;\nprintf("%d", c);', opts: ['10', '16', '4', '6'], answer: 0, explain: 'O laço interno roda 4, 3, 2 e 1 vezes: 4 + 3 + 2 + 1 = 10.' },
        { q: 'Quanto vale x depois de while (x --> 0)?', code: 'int x = 10;\nwhile (x --> 0)\n    ;\nprintf("%d", x);', opts: ['-1', '0', '1', '10'], answer: 0, explain: '"x --> 0" é x-- > 0. Na última comparação (0 > 0, falsa) o pós-decremento ainda acontece, deixando x = -1.' }
      ]
    },
    functions: {
      easy: [
        { q: 'O que "void" significa como tipo de retorno?', opts: ['Retorna 0', 'Não retorna valor', 'Retorna null', 'Retorna vazio'], answer: 1, explain: 'void indica que a função não retorna nenhum valor.' },
        { q: 'O que é um protótipo de função?', opts: ['O corpo da função', 'Declaração antes do main', 'Uma variável', 'Uma macro'], answer: 1, explain: 'Protótipo declara a assinatura da função antes de seu uso.' },
        { q: 'C passa parâmetros por...', opts: ['Referência', 'Valor', 'Nome', 'Tipo'], answer: 1, explain: 'C passa tudo por valor. Para simular referência, usa-se ponteiros.' },
        { q: 'Em "int soma(int a, int b)", o que são a e b?', opts: ['Parâmetros', 'Valores de retorno', 'Variáveis globais', 'Macros'], answer: 0, explain: 'Parâmetros recebem os valores passados na chamada, como soma(2, 3).' },
        { q: 'Qual cabeçalho precisa ser incluído para usar printf?', opts: ['<stdio.h>', '<stdlib.h>', '<string.h>', '<math.h>'], answer: 0, explain: 'stdio.h declara as funções de entrada e saída padrão, como printf e scanf.' }
      ],
      medium: [
        { q: 'Como simular passagem por referência em C?', opts: ['Usar &', 'Passar ponteiro', 'Usar global', 'Não é possível'], answer: 1, explain: 'Passa-se um ponteiro para a variável, permitindo modificá-la.' },
        { q: 'Qual é o resultado?', code: 'int fatorial(int n) {\n    if (n <= 1) return 1;\n    return n * fatorial(n - 1);\n}\nprintf("%d", fatorial(5));', opts: ['120', '24', '5', 'Error'], answer: 0, explain: '5! = 5 * 4 * 3 * 2 * 1 = 120.' },
        { q: 'A função dobra(int x) altera n?', code: 'void dobra(int x) {\n    x = x * 2;\n}\n// uso:\nint n = 5;\ndobra(n);\nprintf("%d", n);', opts: ['5', '10', '0', 'Error'], answer: 0, explain: 'A função recebe uma cópia de n; alterar x não muda n.' },
        { q: 'Com dobra(&n) recebendo um ponteiro, quanto vale n depois?', code: 'void dobra(int *x) {\n    *x = *x * 2;\n}\n// uso:\nint n = 5;\ndobra(&n);\nprintf("%d", n);', opts: ['10', '5', 'O endereço de n', 'Error'], answer: 0, explain: 'Com o endereço de n, a função altera o valor original por meio do ponteiro.' },
        { q: 'Quanto vale quadrado(quadrado(2))?', code: 'int quadrado(int x) { return x * x; }\n// uso:\nprintf("%d", quadrado(quadrado(2)));', opts: ['16', '4', '8', '256'], answer: 0, explain: 'quadrado(2) = 4 e quadrado(4) = 16.' }
      ],
      hard: [
        { q: 'O que é um ponteiro para função?', code: 'int (*op)(int, int);', opts: ['Array de funções', 'Variável que armazena endereço de função', 'Macro', 'Template'], answer: 1, explain: 'Ponteiro para função armazena o endereço de uma função para chamá-la indiretamente.' },
        { q: 'O que a variável local static guarda após três chamadas?', code: 'int conta(void) {\n    static int c = 0;\n    return ++c;\n}\n// uso:\nconta(); conta();\nprintf("%d", conta());', opts: ['3', '1', '0', '2'], answer: 0, explain: 'Uma variável local static é inicializada uma vez e mantém o valor entre as chamadas.' },
        { q: 'Por que retornar o endereço de uma variável local é um erro?', code: 'int *f(void) {\n    int x = 10;\n    return &x;\n}', opts: ['x deixa de existir quando a função termina, e o ponteiro fica pendente', 'Funções não podem retornar ponteiros', 'x é global', 'Não é erro'], answer: 0, explain: 'A memória de x pertence à pilha da função e pode ser sobrescrita depois que ela retorna.' },
        { q: 'Quanto vale fib(6) nesta recursão?', code: 'int fib(int n) {\n    if (n < 2) return n;\n    return fib(n - 1) + fib(n - 2);\n}\n// uso:\nprintf("%d", fib(6));', opts: ['8', '6', '13', '5'], answer: 0, explain: 'A sequência é 0, 1, 1, 2, 3, 5, 8: fib(6) = 8.' },
        { q: 'O que a função recursiva f(1234) calcula?', code: 'int f(int n) {\n    return n <= 0 ? 0 : n % 10 + f(n / 10);\n}\n// uso:\nprintf("%d", f(1234));', opts: ['10', '1234', '4', '24'], answer: 0, explain: 'A função soma os dígitos: 4 + 3 + 2 + 1 = 10.' }
      ]
    },
    pointers: {
      easy: [
        { q: 'O que é um ponteiro?', opts: ['Um número', 'Uma variável que armazena endereço', 'Uma função', 'Um array'], answer: 1, explain: 'Ponteiro é uma variável que armazena o endereço de memória de outra variável.' },
        { q: 'Qual operador obtém o endereço de uma variável?', opts: ['*', '&', '->', '#'], answer: 1, explain: '& (address-of) retorna o endereço de memória da variável.' },
        { q: 'Qual operador acessa o valor apontado?', opts: ['&', '*', '->', '.'], answer: 1, explain: '* (dereference) acessa o valor no endereço que o ponteiro guarda.' },
        { q: 'Como declarar um ponteiro para int?', opts: ['int *p;', 'int &p;', 'pointer int p;', 'int p*;'], answer: 0, explain: 'O * na declaração indica que p guarda o endereço de um int.' },
        { q: 'O que *p imprime quando p aponta para x?', code: 'int x = 7;\nint *p = &x;\nprintf("%d", *p);', opts: ['7', 'O endereço de x', '0', 'Error'], answer: 0, explain: '*p acessa o valor guardado no endereço para onde p aponta.' }
      ],
      medium: [
        { q: 'Qual é o resultado?', code: 'int x = 10;\nint *p = &x;\n*p = 20;\nprintf("%d", x);', opts: ['10', '20', 'Endereço', 'Error'], answer: 1, explain: '*p = 20 modifica o valor no endereço de x. Agora x = 20.' },
        { q: 'O que NULL representa?', opts: ['0', 'Ponteiro para nenhum lugar', 'Erro', 'Fim de string'], answer: 1, explain: 'NULL indica que o ponteiro não aponta para nenhum endereço válido.' },
        { q: 'Qual é a relação entre arrays e ponteiros?', opts: ['Nenhuma', 'O nome do array é um ponteiro para o primeiro elemento', 'São idênticos', 'Arrays são ponteiros duplos'], answer: 1, explain: 'O nome de um array decai para um ponteiro para seu primeiro elemento.' },
        { q: 'Para onde p aponta após p++?', code: 'int a[] = {5, 6, 7};\nint *p = a;\np++;\nprintf("%d", *p);', opts: ['6', '5', '7', 'Error'], answer: 0, explain: 'p++ avança um elemento inteiro (não um byte), passando para a[1].' },
        { q: 'O que malloc faz?', opts: ['Aloca memória dinamicamente no heap', 'Libera memória', 'Copia strings', 'Cria uma variável na pilha'], answer: 0, explain: 'malloc devolve um ponteiro para a área alocada, que depois deve ser liberada com free.' }
      ],
      hard: [
        { q: 'Qual é o resultado?', code: 'int a[] = {10, 20, 30};\nint *p = a;\nprintf("%d", *(p + 2));', opts: ['10', '20', '30', 'Error'], answer: 2, explain: 'p + 2 avança 2 posições. *(p + 2) = a[2] = 30.' },
        { q: 'O que é um ponteiro para ponteiro?', code: 'int x = 5;\nint *p = &x;\nint **pp = &p;', opts: ['Ponteiro que armazena endereço de outro ponteiro', 'Array bidimensional', 'Ponteiro nulo', 'Erro de sintaxe'], answer: 0, explain: '**pp armazena o endereço de p, que por sua vez aponta para x.' },
        { q: 'O que acontece se a memória alocada com malloc nunca for liberada com free?', opts: ['Vazamento de memória (memory leak)', 'O programa não compila', 'A memória é liberada na linha seguinte', 'Ocorre um loop infinito'], answer: 0, explain: 'Em programas longos, os vazamentos acumulam e consomem cada vez mais memória.' },
        { q: 'Qual caractere *(s + 1) acessa?', code: 'char *s = "abc";\nprintf("%c", *(s + 1));', opts: ['b', 'a', 'c', 'Error'], answer: 0, explain: '*(s + 1) equivale a s[1], o segundo caractere.' },
        { q: 'Quanto vale a diferença entre os ponteiros p - q?', code: 'int a[] = {1, 2, 3, 4};\nint *p = &a[3];\nint *q = &a[0];\nprintf("%td", p - q);', opts: ['3', '12', '4', 'Error'], answer: 0, explain: 'Subtrair ponteiros do mesmo array dá a distância em elementos, não em bytes.' }
      ]
    },
    structs: {
      easy: [
        { q: 'O que é uma struct em C?', opts: ['Uma classe', 'Um tipo composto definido pelo usuário', 'Um array especial', 'Uma função'], answer: 1, explain: 'struct agrupa diferentes tipos de dados sob um único nome.' },
        { q: 'Como acessar um membro de struct?', opts: ['struct.membro', 'variavel.membro', 'struct->membro', 'variavel[membro]'], answer: 1, explain: 'Usa-se o operador ponto: variavel.membro.' },
        { q: 'O que typedef faz com struct?', opts: ['Cria ponteiro', 'Cria alias de tipo', 'Aloca memória', 'Libera memória'], answer: 1, explain: 'typedef cria um nome alternativo para o tipo struct.' },
        { q: 'Qual palavra-chave define uma struct em C?', opts: ['struct', 'class', 'record', 'object'], answer: 0, explain: 'Ex.: struct Ponto { int x, y; };' },
        { q: 'O que é impresso ao acessar a.idade?', code: 'struct Aluno { int idade; };\nstruct Aluno a;\na.idade = 20;\nprintf("%d", a.idade);', opts: ['20', '0', 'Error', 'a.idade'], answer: 0, explain: 'O operador ponto lê o membro idade da variável a.' }
      ],
      medium: [
        { q: 'Quando usar -> em vez de . ?', opts: ['Sempre', 'Quando o struct é grande', 'Quando temos ponteiro para struct', 'Nunca'], answer: 2, explain: 'Usa-se -> com ponteiros para struct: ptr->membro equivale a (*ptr).membro.' },
        { q: 'Qual é o resultado?', code: 'struct Ponto { int x, y; };\nstruct Ponto p = {3, 7};\nprintf("%d", p.x + p.y);', opts: ['3', '7', '10', 'Error'], answer: 2, explain: 'p.x = 3, p.y = 7. Soma = 10.' },
        { q: 'O que pp->y acessa?', code: 'typedef struct { int x, y; } Ponto;\nPonto p = {1, 2};\nPonto *pp = &p;\nprintf("%d", pp->y);', opts: ['2', '1', 'O endereço de p', 'Error'], answer: 0, explain: 'pp->y equivale a (*pp).y, o membro y de p.' },
        { q: 'Como criar um array de 10 structs Aluno?', opts: ['struct Aluno turma[10];', 'struct Aluno[10] turma;', 'Aluno turma = new Aluno[10];', 'struct turma Aluno[10];'], answer: 0, explain: 'A declaração segue o padrão tipo nome[tamanho].' },
        { q: 'Mudar b.v altera a.v depois de b = a?', code: 'struct P { int v; };\nstruct P a = {1};\nstruct P b = a;\nb.v = 9;\nprintf("%d", a.v);', opts: ['1', '9', 'Error', '0'], answer: 0, explain: 'Atribuir uma struct copia todos os campos; a e b são independentes.' }
      ],
      hard: [
        { q: 'Structs podem conter ponteiros para si mesmas?', opts: ['Não, causa erro', 'Sim, é usado em listas ligadas', 'Só com typedef', 'Só em C++'], answer: 1, explain: 'Structs auto-referenciadas são a base de listas ligadas e árvores.' },
        { q: 'Em uma plataforma comum, qual é o sizeof mais provável desta struct?', code: 'struct S { char c; int i; };\nprintf("%zu", sizeof(struct S));', opts: ['8', '5', '4', '16'], answer: 0, explain: 'O compilador insere padding para alinhar o int em múltiplo de 4: 1 + 3 (padding) + 4 = 8.' },
        { q: 'Qual é a diferença entre struct e union em C?', opts: ['Na union todos os membros compartilham a mesma memória', 'Union não pode ter int', 'Struct não pode ter ponteiros', 'Não há diferença'], answer: 0, explain: 'O tamanho de uma union é o do seu maior membro, e só um membro é válido por vez.' },
        { q: 'Por que se costuma passar um ponteiro ao enviar uma struct grande para uma função?', opts: ['Para evitar copiar a struct inteira', 'Porque structs não podem ser passadas por valor', 'Para que a struct vire global', 'Porque é obrigatório usar ->'], answer: 0, explain: 'Passar por valor copia todos os bytes; o ponteiro copia só um endereço.' },
        { q: 'O que a.prox->prox->v acessa nesta lista ligada?', code: 'struct No { int v; struct No *prox; };\nstruct No c = {3, NULL};\nstruct No b = {2, &c};\nstruct No a = {1, &b};\nprintf("%d", a.prox->prox->v);', opts: ['3', '2', '1', 'Error'], answer: 0, explain: 'a aponta para b, que aponta para c; o valor de c é 3.' }
      ]
    }
  },
  html_css: {
    html_basics: {
      easy: [
        { q: 'Qual tag define o título da página (aba do navegador)?', opts: ['<head>', '<title>', '<h1>', '<header>'], answer: 1, explain: '<title> define o texto que aparece na aba do navegador.' },
        { q: 'Qual tag cria um parágrafo?', opts: ['<text>', '<p>', '<par>', '<paragraph>'], answer: 1, explain: '<p> é a tag para parágrafos em HTML.' },
        { q: 'Qual atributo define o destino de um link?', opts: ['src', 'href', 'link', 'url'], answer: 1, explain: 'href (Hypertext Reference) define para onde o link aponta.' },
        { q: 'Qual tag cria uma imagem?', opts: ['<image>', '<img>', '<picture>', '<photo>'], answer: 1, explain: '<img> é a tag para imagens. É self-closing (não tem tag de fechamento).' },
        { q: 'Qual tag cria o título de maior nível na página?', opts: ['<h6>', '<h1>', '<title>', '<head>'], answer: 1, explain: 'Os títulos vão de <h1> (mais importante) a <h6>. <title> é o texto da aba.' }
      ],
      medium: [
        { q: 'Qual é a diferença entre <div> e <span>?', opts: ['Nenhuma', 'div é bloco, span é inline', 'span é bloco, div é inline', 'div é obsoleto'], answer: 1, explain: '<div> é block-level (ocupa linha inteira). <span> é inline.' },
        { q: 'Qual atributo torna uma tag única na página?', opts: ['class', 'id', 'name', 'unique'], answer: 1, explain: 'id deve ser único na página. class pode ser repetida.' },
        { q: 'O que são tags semânticas?', opts: ['Tags com CSS', 'Tags que descrevem o conteúdo', 'Tags obsoletas', 'Tags invisíveis'], answer: 1, explain: 'Tags semânticas (<article>, <nav>, <footer>) descrevem o significado do conteúdo.' },
        { q: 'Qual tag cria uma lista não ordenada (com marcadores)?', opts: ['<ol>', '<ul>', '<li>', '<list>'], answer: 1, explain: '<ul> cria a lista com marcadores e cada item usa <li>; <ol> é a lista numerada.' },
        { q: 'Qual atributo faz um link abrir em uma nova aba?', opts: ['target="_blank"', 'href="new"', 'rel="tab"', 'open="new"'], answer: 0, explain: 'target="_blank" abre o destino em uma nova aba ou janela.' }
      ],
      hard: [
        { q: 'Qual atributo melhora acessibilidade em imagens?', opts: ['title', 'alt', 'desc', 'aria-label'], answer: 1, explain: 'alt descreve a imagem para leitores de tela e quando a imagem não carrega.' },
        { q: 'O que é o DOCTYPE?', opts: ['Uma tag HTML', 'Declara o tipo do documento', 'Metadata', 'Comentário'], answer: 1, explain: '<!DOCTYPE html> diz ao navegador que é HTML5.' },
        { q: 'Qual elemento deve envolver o conteúdo principal e único da página?', opts: ['<main>', '<section>', '<div id="main">', '<body>'], answer: 0, explain: '<main> marca o conteúdo principal; deve haver só um visível por página, o que ajuda leitores de tela.' },
        { q: 'Para que serve <meta charset="UTF-8">?', opts: ['Definir a codificação de caracteres da página', 'Definir o idioma do navegador', 'Importar o CSS', 'Definir a fonte do texto'], answer: 0, explain: 'Sem a codificação certa, acentos podem aparecer como símbolos estranhos.' },
        { q: 'Qual atributo da tag <html> informa o idioma da página a buscadores e leitores de tela?', opts: ['lang', 'language', 'locale', 'idioma'], answer: 0, explain: 'Ex.: <html lang="pt-BR">. O leitor de tela usa a pronúncia certa.' }
      ]
    },
    html_forms: {
      easy: [
        { q: 'Qual tag cria um formulário?', opts: ['<form>', '<input>', '<field>', '<submit>'], answer: 0, explain: '<form> é o container para elementos de formulário.' },
        { q: 'Qual tipo de input cria uma caixa de texto?', opts: ['type="text"', 'type="input"', 'type="field"', 'type="string"'], answer: 0, explain: 'type="text" cria um campo de texto simples.' },
        { q: 'Qual tag cria um botão de envio?', opts: ['<submit>', '<button type="submit">', '<send>', '<action>'], answer: 1, explain: '<button type="submit"> ou <input type="submit"> envia o formulário.' },
        { q: 'Qual tipo de input esconde os caracteres digitados?', opts: ['type="hidden"', 'type="password"', 'type="secret"', 'type="text"'], answer: 1, explain: 'type="password" mostra pontos no lugar do texto; type="hidden" nem aparece na tela.' },
        { q: 'Qual tag cria uma caixa de texto com várias linhas?', opts: ['<input type="text">', '<textarea>', '<textbox>', '<multiline>'], answer: 1, explain: '<textarea> aceita textos longos em várias linhas, como comentários.' }
      ],
      medium: [
        { q: 'Qual atributo torna um campo obrigatório?', opts: ['mandatory', 'required', 'needed', 'must'], answer: 1, explain: 'required impede envio do formulário se o campo estiver vazio.' },
        { q: 'Qual tipo de input cria um campo de email?', opts: ['type="text"', 'type="email"', 'type="mail"', 'type="address"'], answer: 1, explain: 'type="email" valida automaticamente o formato de email.' },
        { q: 'O que <label for="x"> faz?', opts: ['Estiliza o input', 'Associa texto ao input com id="x"', 'Cria uma variável', 'Esconde o input'], answer: 1, explain: 'label associa texto ao input — clicar no label foca o input.' },
        { q: 'Qual elemento cria uma lista suspensa (dropdown) de opções?', opts: ['<select> com <option>', '<list> com <item>', '<dropdown>', '<input type="list">'], answer: 0, explain: 'Cada <option> dentro de <select> é uma escolha da lista.' },
        { q: 'Qual atributo mostra um texto de exemplo dentro do campo vazio?', opts: ['value', 'placeholder', 'title', 'hint'], answer: 1, explain: 'placeholder exibe uma dica que some ao digitar; value define um conteúdo real.' }
      ],
      hard: [
        { q: 'Qual é a diferença entre GET e POST?', opts: ['Nenhuma', 'GET envia na URL, POST no corpo', 'POST envia na URL', 'GET é mais seguro'], answer: 1, explain: 'GET: dados na URL (visíveis). POST: dados no corpo da requisição.' },
        { q: 'Em um grupo de botões de rádio, o que faz com que só uma opção possa ser marcada?', opts: ['Todos terem o mesmo atributo name', 'Todos terem o mesmo id', 'Usar type="checkbox"', 'Colocá-los dentro de uma <ul>'], answer: 0, explain: 'Rádios com o mesmo name formam um grupo de escolha única.' },
        { q: 'Qual atributo do <form> define para onde os dados são enviados?', opts: ['action', 'method', 'target', 'href'], answer: 0, explain: 'action define a URL de destino; method define se o envio é GET ou POST.' },
        { q: 'Qual atributo valida um campo com uma expressão regular?', opts: ['pattern', 'regex', 'validate', 'match'], answer: 0, explain: 'Ex.: pattern="[0-9]{5}-[0-9]{3}" exige o formato de CEP antes do envio.' },
        { q: 'Qual é a diferença entre os atributos disabled e readonly em um input?', opts: ['Nenhuma', 'readonly impede a edição, mas o valor é enviado; o campo disabled não é enviado', 'disabled envia o valor; readonly não', 'readonly esconde o campo'], answer: 1, explain: 'Campos disabled ficam fora do envio do formulário e não recebem foco.' }
      ]
    },
    css_selectors: {
      easy: [
        { q: 'Como selecionar um elemento por classe?', opts: ['#nome', '.nome', 'nome', '*nome'], answer: 1, explain: '.nome seleciona elementos com class="nome".' },
        { q: 'Como selecionar um elemento por ID?', opts: ['.id', '#id', 'id', '@id'], answer: 1, explain: '#id seleciona o elemento com id="id".' },
        { q: 'O que * seleciona em CSS?', opts: ['Nada', 'Todos os elementos', 'Apenas divs', 'Elementos ocultos'], answer: 1, explain: '* é o seletor universal — seleciona TODOS os elementos.' },
        { q: 'Como selecionar todos os parágrafos da página?', opts: ['p', '.p', '#p', '<p>'], answer: 0, explain: 'O seletor de tipo usa o nome da tag, sem ponto nem cerquilha.' },
        { q: 'Como aplicar o mesmo estilo a h1 e h2 de uma vez?', opts: ['h1 h2', 'h1, h2', 'h1 + h2', 'h1.h2'], answer: 1, explain: 'A vírgula agrupa seletores; com espaço, seria "h2 dentro de h1".' }
      ],
      medium: [
        { q: 'O que "div p" (com espaço) seleciona?', opts: ['div E p', 'p dentro de div', 'div seguido de p', 'p adjacente a div'], answer: 1, explain: 'Seletor descendente: seleciona todos os p dentro de div (qualquer nível).' },
        { q: 'O que :hover faz?', opts: ['Esconde elemento', 'Aplica estilo ao passar mouse', 'Seleciona primeiro filho', 'Anima elemento'], answer: 1, explain: ':hover aplica estilos quando o cursor está sobre o elemento.' },
        { q: 'Qual tem MAIOR especificidade?', opts: ['tag', '.classe', '#id', 'inline style'], answer: 3, explain: 'Especificidade: inline > #id > .class > tag.' },
        { q: 'O que o seletor input[type="email"] seleciona?', opts: ['Inputs cujo atributo type é "email"', 'Todos os inputs', 'Inputs com a classe email', 'Inputs dentro de um elemento email'], answer: 0, explain: 'Colchetes criam seletores de atributo.' },
        { q: 'O que a pseudo-classe :first-child seleciona?', opts: ['O elemento que é o primeiro filho do seu pai', 'O último filho de cada elemento', 'Todos os filhos diretos', 'Apenas o primeiro elemento da página'], answer: 0, explain: 'li:first-child, por exemplo, pega o primeiro item de cada lista.' }
      ],
      hard: [
        { q: 'O que "div > p" seleciona?', opts: ['Todos p dentro de div', 'Apenas filhos diretos p de div', 'div após p', 'p que contém div'], answer: 1, explain: '> é seletor de filho direto. Não inclui p em níveis mais profundos.' },
        { q: 'O que :nth-child(2n) seleciona?', opts: ['Segundo filho', 'Filhos pares', 'Filhos ímpares', 'Todos os filhos'], answer: 1, explain: '2n = 2, 4, 6... Seleciona elementos em posições pares.' },
        { q: 'O que o seletor "h2 + p" seleciona?', opts: ['O parágrafo imediatamente após um h2 (irmão adjacente)', 'Todos os p dentro de h2', 'Os elementos h2 e p', 'Todos os p que vêm depois de h2 no documento'], answer: 0, explain: '+ é o combinador de irmão adjacente; ~ pegaria todos os irmãos seguintes.' },
        { q: 'Qual é a diferença entre ::before e :hover?', opts: ['::before é pseudo-elemento (cria conteúdo); :hover é pseudo-classe (estado)', 'São iguais', '::before é um estado e :hover cria conteúdo', 'Ambos estão obsoletos'], answer: 0, explain: 'Pseudo-elementos usam :: e geram partes do elemento; pseudo-classes usam : e descrevem estados.' },
        { q: 'Se ".menu a" e "#topo a" definem a cor do mesmo link, qual regra vence?', opts: ['".menu a", por vir antes', '"#topo a", por ter maior especificidade (id)', 'Nenhuma, as cores se misturam', 'A que tiver o seletor mais curto'], answer: 1, explain: 'Seletor com id tem especificidade maior que com classe, independentemente da ordem.' }
      ]
    },
    css_box: {
      easy: [
        { q: 'Qual propriedade define espaço INTERNO?', opts: ['margin', 'padding', 'border', 'gap'], answer: 1, explain: 'padding é o espaço entre o conteúdo e a borda.' },
        { q: 'Qual propriedade define espaço EXTERNO?', opts: ['margin', 'padding', 'border', 'gap'], answer: 0, explain: 'margin é o espaço fora da borda do elemento.' },
        { q: 'Qual é a ordem do box model de fora para dentro?', opts: ['margin, border, padding, content', 'padding, margin, border, content', 'content, padding, border, margin', 'border, margin, padding, content'], answer: 0, explain: 'De fora para dentro: margin → border → padding → content.' },
        { q: 'Qual propriedade desenha uma linha ao redor do elemento, entre padding e margin?', opts: ['border', 'padding', 'margin', 'gap'], answer: 0, explain: 'Ex.: border: 1px solid black.' },
        { q: 'Por padrão, qual é o display de uma <div>?', opts: ['inline', 'block', 'flex', 'none'], answer: 1, explain: 'Elementos block ocupam toda a largura disponível e começam em nova linha.' },
        { q: 'Qual propriedade arredonda os cantos de um elemento?', opts: ['border-radius', 'corner', 'round', 'border-style'], answer: 0, explain: 'Ex.: border-radius: 8px; com 50% em um quadrado, vira um círculo.' }
      ],
      medium: [
        { q: 'O que box-sizing: border-box faz?', opts: ['Remove bordas', 'Inclui padding e border no width', 'Dobra a margem', 'Centraliza o elemento'], answer: 1, explain: 'border-box faz width incluir padding e border, não apenas content.' },
        { q: 'Margens verticais adjacentes podem...', opts: ['Somar', 'Colapsar (merge)', 'Cancelar', 'Multiplicar'], answer: 1, explain: 'Margin collapse: margens verticais adjacentes se fundem (usa a maior).' },
        { q: 'O que margin: 10px 20px; aplica?', opts: ['10px em cima e embaixo e 20px nas laterais', '10px à esquerda e 20px à direita', '10px em todos os lados', '20px em cima e 10px embaixo'], answer: 0, explain: 'Com dois valores, o primeiro vale para vertical e o segundo para horizontal.' },
        { q: 'Qual declaração centraliza horizontalmente um bloco com largura definida?', opts: ['margin: 0 auto', 'padding: auto', 'text-align: middle', 'align: center'], answer: 0, explain: 'Margens laterais automáticas dividem o espaço que sobra igualmente.' },
        { q: 'Com o box-sizing padrão (content-box), quanto de largura ocupa uma caixa com width: 100px, padding: 10px e border: 2px?', opts: ['100px', '124px', '120px', '112px'], answer: 1, explain: '100 + 10 + 10 (padding) + 2 + 2 (borda) = 124px.' }
      ],
      hard: [
        { q: 'Quando padding NÃO funciona como esperado?', opts: ['Em div', 'Em elementos inline', 'Em body', 'Em forms'], answer: 1, explain: 'Elementos inline (span, a) não respeitam padding/margin vertical como block.' },
        { q: 'O que overflow: hidden faz?', opts: ['Esconde o conteúdo que ultrapassa a caixa', 'Esconde o elemento inteiro', 'Mostra sempre barras de rolagem', 'Aumenta a caixa automaticamente'], answer: 0, explain: 'O que passar dos limites é cortado; overflow: auto mostraria rolagem quando necessário.' },
        { q: 'Qual é a diferença entre display: none e visibility: hidden?', opts: ['none remove o elemento do layout; hidden esconde, mas mantém o espaço', 'São iguais', 'hidden remove do layout; none mantém o espaço', 'none só funciona em imagens'], answer: 0, explain: 'Com visibility: hidden fica um "buraco" do tamanho do elemento.' },
        { q: 'O que outline tem de diferente de border?', opts: ['outline não ocupa espaço no box model', 'outline só funciona em links', 'outline aumenta o padding', 'Não há diferença'], answer: 0, explain: 'O outline é desenhado por fora sem alterar o tamanho nem empurrar outros elementos; é muito usado para indicar foco.' },
        { q: 'Qual display mantém o elemento na mesma linha, mas aceita width, height e margens verticais?', opts: ['inline', 'inline-block', 'block', 'contents'], answer: 1, explain: 'inline-block combina o fluxo em linha com as dimensões de um bloco.' }
      ]
    },
    css_flex: {
      easy: [
        { q: 'Qual propriedade ativa o Flexbox?', opts: ['flex: 1', 'display: flex', 'position: flex', 'layout: flex'], answer: 1, explain: 'display: flex no container ativa o layout Flexbox.' },
        { q: 'Qual propriedade alinha itens no eixo principal?', opts: ['align-items', 'justify-content', 'flex-direction', 'flex-wrap'], answer: 1, explain: 'justify-content alinha no eixo principal (horizontal por padrão).' },
        { q: 'Qual propriedade alinha itens no eixo transversal?', opts: ['justify-content', 'align-items', 'flex-direction', 'text-align'], answer: 1, explain: 'align-items alinha no eixo transversal (vertical por padrão).' },
        { q: 'Qual valor de flex-direction coloca os itens lado a lado (o padrão)?', opts: ['row', 'column', 'line', 'inline'], answer: 0, explain: 'row é o padrão: o eixo principal é horizontal.' },
        { q: 'Em qual elemento se aplica display: flex para usar Flexbox?', opts: ['No elemento pai (container)', 'Em cada item filho', 'Sempre no body', 'Em nenhum elemento'], answer: 0, explain: 'O container flex organiza seus filhos diretos.' }
      ],
      medium: [
        { q: 'O que flex-direction: column faz?', opts: ['Cria colunas CSS', 'Muda eixo principal para vertical', 'Remove flexbox', 'Centraliza itens'], answer: 1, explain: 'column muda o eixo principal para vertical (de cima para baixo).' },
        { q: 'O que flex: 1 faz em um item?', opts: ['Fixa largura em 1px', 'Ocupa espaço disponível proporcionalmente', 'Remove do flex', 'Define ordem 1'], answer: 1, explain: 'flex: 1 faz o item crescer para ocupar o espaço disponível.' },
        { q: 'Como centralizar um item vertical e horizontalmente?', opts: ['text-align: center', 'margin: auto', 'justify-content: center + align-items: center', 'position: center'], answer: 2, explain: 'justify-content + align-items: center centraliza em ambos os eixos.' },
        { q: 'Qual valor de justify-content coloca espaço igual entre os itens, sem espaço nas bordas?', opts: ['space-between', 'space-around', 'center', 'flex-start'], answer: 0, explain: 'space-around também colocaria meio espaço antes do primeiro e depois do último item.' },
        { q: 'O que flex-direction: row-reverse faz?', opts: ['Dispõe os itens em linha, na ordem inversa', 'Dispõe os itens em coluna', 'Esconde os itens', 'Inverte as cores'], answer: 0, explain: 'Os itens continuam em linha, mas em ordem invertida e alinhados a partir da direita.' }
      ],
      hard: [
        { q: 'O que flex-wrap: wrap faz?', opts: ['Quebra linha quando não cabe', 'Esconde overflow', 'Fixa largura', 'Desativa flex'], answer: 0, explain: 'flex-wrap: wrap permite que itens quebrem para a próxima linha.' },
        { q: 'Qual propriedade define espaço entre itens flex?', opts: ['margin', 'gap', 'spacing', 'gutter'], answer: 1, explain: 'gap define espaçamento entre itens flex (e grid) sem margin.' },
        { q: 'Qual propriedade muda a ordem visual de um item flex sem alterar o HTML?', opts: ['order', 'z-index', 'position', 'sort'], answer: 0, explain: 'Itens com order menor aparecem antes; o padrão é 0.' },
        { q: 'O que flex-shrink: 0 faz em um item?', opts: ['Impede que o item encolha quando falta espaço', 'Faz o item sumir', 'Faz o item crescer', 'Remove as margens'], answer: 0, explain: 'Útil para ícones e barras laterais que devem manter o tamanho.' },
        { q: 'Qual propriedade alinha UM item específico no eixo transversal, diferente dos demais?', opts: ['align-self', 'align-items', 'justify-self', 'align-content'], answer: 0, explain: 'align-self sobrescreve o align-items do container só para aquele item.' }
      ]
    },
    css_responsive: {
      easy: [
        { q: 'O que é design responsivo?', opts: ['Design bonito', 'Adapta-se a diferentes telas', 'Usa apenas CSS', 'Sem JavaScript'], answer: 1, explain: 'Design responsivo se adapta a diferentes tamanhos de tela.' },
        { q: 'Qual meta tag é essencial para mobile?', opts: ['<meta charset>', '<meta viewport>', '<meta mobile>', '<meta responsive>'], answer: 1, explain: 'viewport meta tag controla como a página é exibida em dispositivos móveis.' },
        { q: 'O que são media queries?', opts: ['Consultas ao banco', 'Regras CSS condicionais por tela', 'Imagens responsivas', 'APIs de mídia'], answer: 1, explain: 'Media queries aplicam CSS baseado em condições como largura de tela.' },
        { q: 'Qual declaração impede uma imagem de ultrapassar a largura do container?', opts: ['max-width: 100%', 'max-width: 0', 'width: auto-fit', 'max-width: none'], answer: 0, explain: 'A imagem encolhe em telas pequenas, mas nunca passa da largura disponível.' },
        { q: 'Por que adaptar um site às telas de celular é importante hoje?', opts: ['Porque muita gente acessa sites pelo celular', 'Porque deixa o site mais pesado', 'Porque elimina o CSS', 'Porque substitui o HTML'], answer: 0, explain: 'A mesma página precisa funcionar em celulares, tablets e computadores.' }
      ],
      medium: [
        { q: 'Qual unidade é relativa ao tamanho da fonte pai?', opts: ['px', 'em', 'vh', '%'], answer: 1, explain: 'em é relativa ao font-size do elemento pai.' },
        { q: 'Qual unidade é relativa à viewport?', opts: ['em', 'rem', 'vw', '%'], answer: 2, explain: 'vw = viewport width. 1vw = 1% da largura da viewport.' },
        { q: 'O que mobile-first significa?', opts: ['Só funciona em mobile', 'Desenha primeiro para mobile', 'Usa apenas min-width', 'Ignora desktop'], answer: 1, explain: 'Mobile-first: CSS base para mobile, media queries para telas maiores.' },
        { q: 'O que @media (max-width: 600px) { ... } faz?', opts: ['Aplica as regras quando a tela tem até 600px de largura', 'Aplica as regras acima de 600px', 'Limita a página a 600px', 'Define a fonte em 600px'], answer: 0, explain: 'max-width é um limite superior: a regra vale de 0 a 600px.' },
        { q: '1vh corresponde a...', opts: ['1% da altura da viewport', '1% da largura da viewport', '1 pixel', 'A altura da fonte'], answer: 0, explain: 'vh = viewport height; 100vh ocupa a altura inteira da janela.' }
      ],
      hard: [
        { q: 'Qual unidade é relativa ao font-size do root?', opts: ['em', 'rem', 'vh', 'ch'], answer: 1, explain: 'rem = root em. Sempre relativa ao font-size do <html>.' },
        { q: 'Qual é o efeito de content="width=device-width, initial-scale=1" na meta viewport?', opts: ['Faz a página usar a largura real do aparelho, sem zoom inicial', 'Fixa a página em 980px', 'Desativa o CSS', 'Bloqueia o zoom do usuário'], answer: 0, explain: 'Sem ela, navegadores móveis simulam uma tela larga (cerca de 980px) e reduzem tudo.' },
        { q: 'Para que serve font-size: clamp(1rem, 2vw, 2rem)?', opts: ['Mantém o tamanho entre 1rem e 2rem, variando com a viewport', 'Fixa a fonte em 2vw', 'Soma os três valores', 'Esconde o texto em telas pequenas'], answer: 0, explain: 'clamp(mínimo, preferido, máximo) cria tipografia fluida com limites.' },
        { q: 'Qual atributo de <img> oferece arquivos de tamanhos diferentes conforme a tela?', opts: ['srcset', 'alt', 'href', 'data-size'], answer: 0, explain: 'O navegador escolhe no srcset a imagem mais adequada à tela e à densidade de pixels.' },
        { q: 'Em uma abordagem mobile-first, as media queries normalmente usam...', opts: ['min-width', 'max-width', 'apenas min-height', 'apenas orientation'], answer: 0, explain: 'O CSS base atende o celular, e min-width acrescenta regras conforme a tela aumenta.' }
      ]
    }
  },
  sql: {
    select: {
      easy: [
        { q: 'Qual comando busca dados de uma tabela?', opts: ['GET', 'FETCH', 'SELECT', 'FIND'], answer: 2, explain: 'SELECT é o comando para consultar dados em SQL.' },
        { q: 'Qual cláusula seleciona TODAS as colunas?', opts: ['ALL', '*', 'EVERY', 'FULL'], answer: 1, explain: 'SELECT * retorna todas as colunas da tabela.' },
        { q: 'Qual cláusula limita o número de resultados?', opts: ['MAX', 'TOP', 'LIMIT', 'FIRST'], answer: 2, explain: 'LIMIT restringe o número de linhas retornadas.' },
        { q: 'O que DISTINCT faz?', opts: ['Ordena resultados', 'Remove duplicatas', 'Conta resultados', 'Filtra nulos'], answer: 1, explain: 'DISTINCT retorna apenas valores únicos, sem repetições.' },
        { q: 'Qual consulta retorna apenas as colunas nome e email da tabela clientes?', opts: ['SELECT nome, email FROM clientes;', 'SELECT * FROM clientes WHERE nome, email;', 'GET nome, email FROM clientes;', 'SELECT clientes FROM nome, email;'], answer: 0, explain: 'As colunas vêm depois do SELECT, separadas por vírgula, e a tabela depois do FROM.' }
      ],
      medium: [
        { q: 'Qual é a ordem correta das cláusulas?', opts: ['SELECT FROM WHERE ORDER', 'FROM SELECT WHERE ORDER', 'SELECT WHERE FROM ORDER', 'FROM WHERE SELECT ORDER'], answer: 0, explain: 'Ordem: SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT.' },
        { q: 'O que ORDER BY nome DESC faz?', opts: ['Ordena A-Z', 'Ordena Z-A', 'Agrupa por nome', 'Filtra por nome'], answer: 1, explain: 'DESC = decrescente (Z-A, maior-menor). ASC = crescente.' },
        { q: 'O que AS faz?', opts: ['Cria tabela', 'Dá um alias (apelido)', 'Filtra', 'Junta tabelas'], answer: 1, explain: 'AS cria um alias: SELECT nome AS n FROM usuarios.' },
        { q: 'Como ordenar por cidade e, em caso de empate, por nome?', opts: ['ORDER BY cidade, nome', 'ORDER BY cidade AND nome', 'ORDER BY (cidade + nome)', 'SORT BY cidade, nome'], answer: 0, explain: 'Colunas separadas por vírgula no ORDER BY funcionam como critérios de desempate.' },
        { q: 'O que SELECT COUNT(DISTINCT cidade) FROM clientes; retorna?', opts: ['O número de cidades diferentes', 'O total de clientes', 'A lista de cidades', 'O número de clientes por cidade'], answer: 0, explain: 'DISTINCT dentro do COUNT conta cada valor apenas uma vez.' }
      ],
      hard: [
        { q: 'O que é uma subquery?', code: 'SELECT * FROM users\nWHERE id IN (\n  SELECT user_id FROM orders\n);', opts: ['Query inválida', 'Query dentro de outra query', 'JOIN especial', 'View temporária'], answer: 1, explain: 'Subquery é uma consulta dentro de outra, usada como filtro ou valor.' },
        { q: 'Para pular os 10 primeiros resultados e trazer os 10 seguintes (página 2), usa-se...', opts: ['LIMIT 10 OFFSET 10', 'LIMIT 20', 'OFFSET 10', 'TOP 10, 10'], answer: 0, explain: 'OFFSET descarta as primeiras linhas e LIMIT define quantas vêm depois.' },
        { q: 'O que a expressão CASE faz neste SELECT?', code: "SELECT nome,\n  CASE WHEN idade >= 18 THEN 'adulto'\n       ELSE 'menor' END AS faixa\nFROM pessoas;", opts: ['Cria uma coluna calculada com valores condicionais', 'Filtra as linhas', 'Ordena o resultado', 'Cria uma nova tabela'], answer: 0, explain: 'CASE funciona como um if dentro da consulta, gerando a coluna faixa.' },
        { q: 'Qual é a diferença entre UNION e UNION ALL?', opts: ['UNION remove linhas duplicadas; UNION ALL mantém todas', 'UNION ALL remove as duplicadas', 'UNION junta colunas lado a lado', 'Não há diferença'], answer: 0, explain: 'UNION ALL é mais rápido por não precisar eliminar duplicatas.' },
        { q: 'O que é a CTE criada com WITH nesta consulta?', code: 'WITH ativos AS (\n  SELECT * FROM users WHERE ativo = true\n)\nSELECT COUNT(*) FROM ativos;', opts: ['Uma consulta nomeada temporária usada pela consulta principal', 'Uma tabela física permanente', 'Um índice', 'Um gatilho (trigger)'], answer: 0, explain: 'CTEs (Common Table Expressions) deixam consultas longas mais legíveis.' }
      ]
    },
    where: {
      easy: [
        { q: 'Qual cláusula filtra resultados?', opts: ['FILTER', 'WHERE', 'HAVING', 'IF'], answer: 1, explain: 'WHERE filtra linhas com base em condições.' },
        { q: 'Qual operador verifica se um valor está numa lista?', opts: ['CONTAINS', 'IN', 'HAS', 'EXISTS'], answer: 1, explain: 'IN verifica se o valor está na lista: WHERE id IN (1, 2, 3).' },
        { q: 'Qual operador busca padrões de texto?', opts: ['MATCH', 'LIKE', 'FIND', 'SEARCH'], answer: 1, explain: 'LIKE usa % e _ para busca por padrão. Ex: LIKE "%ana%".' },
        { q: 'Qual é o resultado?', code: "SELECT * FROM users\nWHERE age >= 18 AND city = 'SP';", opts: ['Todos os users', 'Maiores de 18 em SP', 'Menores de 18 em SP', 'Maiores de 18 OU em SP'], answer: 1, explain: 'AND exige ambas condições: idade >= 18 E cidade = SP.' },
        { q: 'Qual consulta retorna os produtos com preço maior que 100?', opts: ['SELECT * FROM produtos WHERE preco > 100;', 'SELECT * FROM produtos IF preco > 100;', 'SELECT * WHERE preco > 100 FROM produtos;', 'SELECT produtos > 100;'], answer: 0, explain: 'O WHERE vem depois do FROM e recebe a condição.' }
      ],
      medium: [
        { q: 'O que BETWEEN faz?', opts: ['Junta tabelas', 'Filtra intervalo de valores', 'Remove duplicatas', 'Ordena'], answer: 1, explain: 'BETWEEN filtra intervalo: WHERE age BETWEEN 18 AND 30.' },
        { q: 'Como verificar valores NULL?', opts: ['= NULL', 'IS NULL', '== NULL', 'EQUALS NULL'], answer: 1, explain: 'NULL não se compara com =. Use IS NULL ou IS NOT NULL.' },
        { q: 'O que % significa em LIKE?', opts: ['Qualquer caractere único', 'Zero ou mais caracteres', 'Número', 'Exato'], answer: 1, explain: '% = zero ou mais caracteres. _ = exatamente um caractere.' },
        { q: 'O que o NOT IN faz nesta consulta?', code: "SELECT * FROM users\nWHERE cidade NOT IN ('SP', 'RJ');", opts: ['Retorna usuários cuja cidade não é SP nem RJ', 'Retorna apenas SP e RJ', 'Gera erro', 'Remove SP e RJ da tabela'], answer: 0, explain: 'NOT IN é a negação de IN: exclui os valores da lista.' },
        { q: "O padrão LIKE 'A%' encontra nomes que...", opts: ['Começam com A', 'Terminam com A', 'Contêm só a letra A', 'Têm exatamente 2 letras'], answer: 0, explain: '% representa qualquer sequência de caracteres depois do A.' }
      ],
      hard: [
        { q: 'Qual a diferença entre WHERE e HAVING?', opts: ['Nenhuma', 'WHERE filtra linhas, HAVING filtra grupos', 'HAVING é mais rápido', 'WHERE é para JOINs'], answer: 1, explain: 'WHERE filtra antes de agrupar. HAVING filtra após GROUP BY.' },
        { q: 'O que EXISTS faz?', opts: ['Verifica se tabela existe', 'Retorna TRUE se subquery retornar resultados', 'Cria tabela', 'Valida dados'], answer: 1, explain: 'EXISTS retorna TRUE se a subquery retornar ao menos uma linha.' },
        { q: 'Em WHERE a = 1 OR b = 2 AND c = 3, qual parte é avaliada primeiro?', opts: ['b = 2 AND c = 3', 'a = 1 OR b = 2', 'Da esquerda para a direita, sem regra', 'Depende do número de linhas'], answer: 0, explain: 'AND tem precedência sobre OR; use parênteses para deixar a intenção explícita.' },
        { q: "O padrão LIKE '_a%' encontra textos que...", opts: ['Têm "a" como segunda letra', 'Começam com "a"', 'Terminam com "a"', 'Contêm "_a"'], answer: 0, explain: '_ representa exatamente um caractere e % qualquer sequência.' },
        { q: 'O que retorna WHERE nota BETWEEN 5 AND 7?', opts: ['Notas de 5 a 7, incluindo 5 e 7', 'Notas entre 5 e 7, sem os limites', 'Apenas 6', 'Notas menores que 5 ou maiores que 7'], answer: 0, explain: 'BETWEEN inclui os dois limites: equivale a nota >= 5 AND nota <= 7.' }
      ]
    },
    joins: {
      easy: [
        { q: 'O que um JOIN faz?', opts: ['Deleta dados', 'Combina dados de 2+ tabelas', 'Cria tabela', 'Ordena dados'], answer: 1, explain: 'JOIN combina linhas de duas ou mais tabelas baseado em condição.' },
        { q: 'Qual JOIN retorna apenas correspondências?', opts: ['LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'FULL JOIN'], answer: 2, explain: 'INNER JOIN retorna apenas linhas com correspondência em ambas tabelas.' },
        { q: 'Qual JOIN retorna tudo da tabela da esquerda?', opts: ['INNER', 'LEFT', 'RIGHT', 'CROSS'], answer: 1, explain: 'LEFT JOIN retorna todas as linhas da esquerda, com ou sem match.' },
        { q: 'Para relacionar pedidos a clientes, normalmente o JOIN compara...', opts: ['A chave estrangeira do pedido com a chave primária do cliente', 'O nome das tabelas', 'As datas de criação', 'Qualquer coluna de texto'], answer: 0, explain: 'Ex.: ON pedidos.cliente_id = clientes.id.' },
        { q: 'Em "FROM pedidos p", o que é o p?', opts: ['Um apelido (alias) para a tabela pedidos', 'Uma nova tabela', 'Uma coluna', 'Um índice'], answer: 0, explain: 'Com o alias, escreve-se p.id em vez de pedidos.id.' }
      ],
      medium: [
        { q: 'Qual é a sintaxe correta de um JOIN?', opts: ['JOIN users ON id', 'JOIN users ON users.id = orders.user_id', 'JOIN users WHERE id = id', 'JOIN users USING id'], answer: 1, explain: 'JOIN tabela ON condição_de_correspondência.' },
        { q: 'O que CROSS JOIN faz?', opts: ['JOIN sem condição (produto cartesiano)', 'JOIN com condição', 'JOIN de 3 tabelas', 'JOIN com NULL'], answer: 0, explain: 'CROSS JOIN combina cada linha de uma tabela com todas da outra.' },
        { q: 'Colunas sem match em LEFT JOIN ficam como?', opts: ['0', 'Vazio', 'NULL', 'Error'], answer: 2, explain: 'Colunas da tabela direita sem correspondência ficam NULL.' },
        { q: 'Qual condição completa a consulta para achar clientes que nunca fizeram pedidos?', code: 'SELECT c.nome\nFROM clientes c\nLEFT JOIN pedidos p ON p.cliente_id = c.id\nWHERE ...;', opts: ['WHERE p.id IS NULL', 'WHERE p.id = 0', 'WHERE c.id IS NULL', 'WHERE p.id IS NOT NULL'], answer: 0, explain: 'No LEFT JOIN, clientes sem pedido ficam com as colunas de pedidos em NULL.' },
        { q: 'O que o FULL OUTER JOIN retorna?', opts: ['Todas as linhas das duas tabelas, com NULL onde não há correspondência', 'Só as correspondências', 'Só a tabela da esquerda', 'O produto cartesiano'], answer: 0, explain: 'É a união dos resultados de LEFT e RIGHT JOIN.' }
      ],
      hard: [
        { q: 'O que é um self-join?', opts: ['JOIN duplicado', 'Tabela juntando consigo mesma', 'JOIN automático', 'JOIN sem condição'], answer: 1, explain: 'Self-join: mesma tabela aparece dos dois lados, com aliases diferentes.' },
        { q: 'Se a tabela A tem 3 linhas e B tem 4, quantas linhas o CROSS JOIN retorna?', opts: ['7', '12', '4', '3'], answer: 1, explain: 'O CROSS JOIN combina cada linha de A com cada linha de B: 3 × 4 = 12.' },
        { q: 'Para que serve o USING neste JOIN?', code: 'SELECT *\nFROM pedidos\nJOIN clientes USING (cliente_id);', opts: ['Juntar pelas colunas de mesmo nome nas duas tabelas', 'Criar um índice', 'Filtrar por NULL', 'Unir resultados como o UNION'], answer: 0, explain: 'USING (cliente_id) equivale a ON pedidos.cliente_id = clientes.cliente_id.' },
        { q: 'Um JOIN entre pedidos e itens, em que cada pedido tem vários itens, gera...', opts: ['Uma linha por item, repetindo os dados do pedido', 'Uma linha por pedido', 'Erro de duplicidade', 'Só o primeiro item'], answer: 0, explain: 'Por isso, somar valores do pedido depois do JOIN pode contar o mesmo pedido várias vezes.' },
        { q: 'Qual condição liga cada funcionário ao seu gerente nesta consulta?', code: 'SELECT f.nome, g.nome\nFROM funcionarios f\nJOIN funcionarios g ON ...;', opts: ['f.gerente_id = g.id', 'f.id = g.id', 'g.gerente_id = g.id', 'f.nome = g.nome'], answer: 0, explain: 'É um self-join: o funcionário f aponta para o id do seu gerente g.' }
      ]
    },
    aggregate: {
      easy: [
        { q: 'Qual função conta o número de linhas?', opts: ['SUM()', 'COUNT()', 'TOTAL()', 'NUM()'], answer: 1, explain: 'COUNT() conta o número de linhas no resultado.' },
        { q: 'Qual função calcula a soma?', opts: ['ADD()', 'TOTAL()', 'SUM()', 'PLUS()'], answer: 2, explain: 'SUM() soma os valores de uma coluna numérica.' },
        { q: 'Qual função calcula a média?', opts: ['MEAN()', 'AVG()', 'AVERAGE()', 'MID()'], answer: 1, explain: 'AVG() calcula a média aritmética dos valores.' },
        { q: 'Qual função retorna o maior valor de uma coluna?', opts: ['MAX()', 'TOP()', 'HIGH()', 'BIG()'], answer: 0, explain: 'MAX() retorna o maior valor; MIN(), o menor.' },
        { q: 'Numa tabela com 30 alunos, o que SELECT COUNT(*) FROM alunos; retorna?', opts: ['30', '1', '0', 'A lista dos 30 alunos'], answer: 0, explain: 'COUNT(*) devolve uma única linha com a quantidade de registros.' }
      ],
      medium: [
        { q: 'O que GROUP BY faz?', opts: ['Ordena resultados', 'Agrupa linhas com valores iguais', 'Filtra grupos', 'Conta linhas'], answer: 1, explain: 'GROUP BY agrupa linhas com mesmo valor para aplicar funções de agregação.' },
        { q: 'Qual é o resultado?', code: "SELECT city, COUNT(*)\nFROM users\nGROUP BY city\nHAVING COUNT(*) > 5;", opts: ['Todas as cidades', 'Cidades com mais de 5 users', 'Total de users', 'Error'], answer: 1, explain: 'GROUP BY agrupa por cidade. HAVING filtra grupos com mais de 5.' },
        { q: 'Diferença entre COUNT(*) e COUNT(coluna)?', opts: ['Nenhuma', 'COUNT(*) conta NULLs, COUNT(col) não', 'COUNT(col) é mais rápido', 'COUNT(*) é inválido'], answer: 1, explain: 'COUNT(*) conta todas as linhas. COUNT(col) ignora NULLs.' },
        { q: 'Qual consulta conta quantos pedidos cada cliente fez?', opts: ['SELECT cliente_id, COUNT(*) FROM pedidos GROUP BY cliente_id;', 'SELECT COUNT(cliente_id) FROM pedidos;', 'SELECT cliente_id FROM pedidos ORDER BY COUNT;', 'SELECT SUM(cliente_id) FROM pedidos;'], answer: 0, explain: 'O GROUP BY cria um grupo por cliente e o COUNT conta as linhas de cada um.' },
        { q: 'Em uma coluna com os valores 10, 20 e NULL, AVG() retorna...', opts: ['15', '10', 'NULL', '30'], answer: 0, explain: 'Funções de agregação ignoram NULL: (10 + 20) / 2 = 15.' }
      ],
      hard: [
        { q: 'O que é uma window function?', code: 'SELECT nome, salario,\n  RANK() OVER (ORDER BY salario DESC)\nFROM funcionarios;', opts: ['Função de agregação normal', 'Calcula sobre partição sem agrupar', 'Função de filtro', 'Subquery'], answer: 1, explain: 'Window functions calculam sobre um conjunto de linhas relacionadas sem colapsar.' },
        { q: 'Por que esta consulta dá erro em bancos como o PostgreSQL?', code: 'SELECT cidade, nome, COUNT(*)\nFROM clientes\nGROUP BY cidade;', opts: ['nome não está no GROUP BY nem em uma função de agregação', 'COUNT(*) não pode ser usado com GROUP BY', 'Falta ORDER BY', 'cidade deveria estar no WHERE'], answer: 0, explain: 'Cada grupo vira uma linha; o banco não sabe qual nome mostrar para a cidade.' },
        { q: 'Qual é a ordem lógica de execução destas cláusulas?', opts: ['FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY', 'SELECT -> FROM -> WHERE -> ORDER BY -> GROUP BY', 'WHERE -> FROM -> SELECT -> HAVING', 'GROUP BY -> FROM -> SELECT -> WHERE'], answer: 0, explain: 'Por isso um alias criado no SELECT não pode ser usado no WHERE, mas pode no ORDER BY.' },
        { q: 'O que o PARTITION BY faz nesta window function?', code: 'SELECT nome, depto,\n  AVG(salario) OVER (PARTITION BY depto)\nFROM funcionarios;', opts: ['Calcula a média por departamento, mantendo todas as linhas', 'Agrupa e reduz a uma linha por departamento', 'Divide a tabela fisicamente', 'Ordena por departamento'], answer: 0, explain: 'Diferente do GROUP BY, a window function não colapsa as linhas.' },
        { q: 'Qual é o resultado de SUM(valor) quando todas as linhas do grupo têm valor NULL?', opts: ['NULL', '0', 'Erro', '1'], answer: 0, explain: 'Sem valores para somar, SUM retorna NULL; COALESCE(SUM(valor), 0) troca por 0.' }
      ]
    },
    insert_update: {
      easy: [
        { q: 'Qual comando insere dados em uma tabela?', opts: ['ADD', 'INSERT INTO', 'PUT', 'CREATE'], answer: 1, explain: 'INSERT INTO tabela (colunas) VALUES (valores).' },
        { q: 'Qual comando atualiza dados existentes?', opts: ['CHANGE', 'MODIFY', 'UPDATE', 'ALTER'], answer: 2, explain: 'UPDATE tabela SET coluna = valor WHERE condição.' },
        { q: 'Qual comando remove linhas?', opts: ['REMOVE', 'DROP', 'DELETE', 'ERASE'], answer: 2, explain: 'DELETE FROM tabela WHERE condição.' },
        { q: 'Qual comando corrige o e-mail do usuário de id 7?', opts: ["UPDATE users SET email = 'novo@site.com' WHERE id = 7;", "UPDATE users email = 'novo@site.com' id = 7;", 'CHANGE users SET email WHERE 7;', "INSERT INTO users email = 'novo@site.com';"], answer: 0, explain: 'UPDATE tabela SET coluna = valor WHERE condição altera apenas as linhas filtradas.' },
        { q: 'O que DELETE FROM produtos WHERE estoque = 0; faz?', opts: ['Remove os produtos sem estoque', 'Apaga a tabela produtos', 'Zera o estoque de todos', 'Remove a coluna estoque'], answer: 0, explain: 'DELETE remove linhas; a tabela e as demais linhas continuam lá.' }
      ],
      medium: [
        { q: 'O que acontece com UPDATE sem WHERE?', opts: ['Erro', 'Atualiza todas as linhas', 'Não atualiza nada', 'Atualiza a primeira linha'], answer: 1, explain: 'Sem WHERE, UPDATE afeta TODAS as linhas da tabela — muito perigoso!' },
        { q: 'Qual é a sintaxe correta?', opts: ["INSERT users VALUES ('Ana')", "INSERT INTO users (nome) VALUES ('Ana')", "INSERT TO users VALUES ('Ana')", "ADD INTO users ('Ana')"], answer: 1, explain: 'INSERT INTO tabela (colunas) VALUES (valores) é a sintaxe correta.' },
        { q: 'Como inserir várias linhas em um único comando?', opts: ["INSERT INTO cores (nome) VALUES ('azul'), ('verde');", "INSERT INTO cores (nome) VALUES ('azul') AND ('verde');", "INSERT MANY cores ('azul', 'verde');", 'INSERT INTO cores VALUES [azul, verde];'], answer: 0, explain: 'Basta separar os grupos de VALUES por vírgula.' },
        { q: 'Qual comando aumenta em 10% o preço dos produtos da categoria 3?', opts: ['UPDATE produtos SET preco = preco * 1.1 WHERE categoria = 3;', 'UPDATE produtos SET preco + 10% WHERE categoria = 3;', 'UPDATE produtos preco = 1.1 WHERE categoria = 3;', 'ALTER produtos SET preco * 1.1;'], answer: 0, explain: 'O SET pode usar o valor atual da própria coluna no cálculo.' },
        { q: 'Para que serve INSERT INTO ... SELECT?', opts: ['Copiar para uma tabela as linhas retornadas por uma consulta', 'Criar uma tabela nova', 'Atualizar linhas existentes', 'Apagar duplicatas'], answer: 0, explain: 'Ex.: INSERT INTO arquivo SELECT * FROM pedidos WHERE ano < 2020;' }
      ],
      hard: [
        { q: 'O que é UPSERT?', opts: ['Update + Insert', 'Inserir ou atualizar se existir', 'Update duplo', 'Insert paralelo'], answer: 1, explain: 'UPSERT: INSERT se não existe, UPDATE se já existe (ON CONFLICT em PostgreSQL).' },
        { q: 'Para que serve uma transação (BEGIN ... COMMIT)?', opts: ['Agrupar comandos para que todos sejam aplicados ou nenhum seja', 'Acelerar SELECTs', 'Criar tabelas temporárias', 'Fazer backup automático'], answer: 0, explain: 'Numa transferência, debitar e creditar precisam acontecer juntos ou não acontecer.' },
        { q: 'O que ROLLBACK faz?', opts: ['Desfaz as alterações da transação ainda não confirmada', 'Confirma a transação', 'Apaga o banco', 'Repete o último comando'], answer: 0, explain: 'Tudo o que foi feito desde o BEGIN é descartado.' },
        { q: 'No PostgreSQL, o que o RETURNING faz neste INSERT?', code: "INSERT INTO users (nome)\nVALUES ('Ana')\nRETURNING id;", opts: ['Devolve o id gerado para a linha inserida', 'Cancela a inserção', 'Retorna todas as linhas da tabela', 'Repete a inserção'], answer: 0, explain: 'Evita uma segunda consulta só para descobrir o id criado.' },
        { q: 'O que acontece com um UPDATE que viola uma restrição UNIQUE?', opts: ['O comando falha e nenhuma linha daquele comando é alterada', 'Só as linhas válidas são atualizadas', 'A restrição é removida', 'O valor duplicado é apagado'], answer: 0, explain: 'Cada comando é atômico: se uma linha viola a restrição, o comando inteiro é desfeito.' }
      ]
    },
    create: {
      easy: [
        { q: 'Qual comando cria uma tabela?', opts: ['MAKE TABLE', 'NEW TABLE', 'CREATE TABLE', 'BUILD TABLE'], answer: 2, explain: 'CREATE TABLE define uma nova tabela no banco de dados.' },
        { q: 'O que PRIMARY KEY garante?', opts: ['Valor padrão', 'Unicidade e não-nulo', 'Auto incremento', 'Índice'], answer: 1, explain: 'PRIMARY KEY garante que o valor é único e não pode ser NULL.' },
        { q: 'O que NOT NULL faz?', opts: ['Deleta nulos', 'Impede valores nulos', 'Define padrão', 'Cria índice'], answer: 1, explain: 'NOT NULL obriga a coluna a ter um valor (não aceita NULL).' },
        { q: 'Qual tipo de dado é adequado para a data de nascimento?', opts: ['DATE', 'VARCHAR(2)', 'BOOLEAN', 'INT'], answer: 0, explain: 'DATE guarda dia, mês e ano e permite comparar e calcular datas.' },
        { q: 'Qual comando apaga uma tabela inteira, com estrutura e dados?', opts: ['DROP TABLE', 'DELETE TABLE', 'REMOVE TABLE', 'CLEAR TABLE'], answer: 0, explain: 'DROP TABLE remove a tabela do banco; DELETE apenas remove linhas.' }
      ],
      medium: [
        { q: 'O que é uma FOREIGN KEY?', opts: ['Chave primária estrangeira', 'Referência a outra tabela', 'Chave criptografada', 'Índice especial'], answer: 1, explain: 'FOREIGN KEY cria referência entre tabelas, garantindo integridade.' },
        { q: 'Qual comando modifica a estrutura de uma tabela?', opts: ['MODIFY TABLE', 'UPDATE TABLE', 'ALTER TABLE', 'CHANGE TABLE'], answer: 2, explain: 'ALTER TABLE permite adicionar, remover ou modificar colunas.' },
        { q: 'O que a restrição UNIQUE garante?', opts: ['Que não haja valores repetidos na coluna', 'Que a coluna não aceite NULL', 'Que a coluna seja numérica', 'Que a coluna seja a chave primária'], answer: 0, explain: 'É comum em e-mails e CPFs, que não podem se repetir.' },
        { q: 'Qual comando adiciona a coluna telefone à tabela clientes?', opts: ['ALTER TABLE clientes ADD COLUMN telefone VARCHAR(20);', 'UPDATE clientes ADD telefone;', 'INSERT COLUMN telefone INTO clientes;', 'CREATE COLUMN telefone ON clientes;'], answer: 0, explain: 'ALTER TABLE ... ADD COLUMN muda a estrutura sem apagar os dados.' },
        { q: 'Para que serve DEFAULT em uma coluna?', opts: ['Definir o valor usado quando nenhum é informado no INSERT', 'Impedir valores nulos', 'Criar um índice', 'Definir a chave primária'], answer: 0, explain: 'Ex.: criado_em TIMESTAMP DEFAULT now().' }
      ],
      hard: [
        { q: 'Qual a diferença entre DROP e TRUNCATE?', opts: ['Nenhuma', 'DROP remove tabela, TRUNCATE remove dados', 'TRUNCATE é mais lento', 'DROP mantém estrutura'], answer: 1, explain: 'DROP deleta a tabela inteira. TRUNCATE remove só os dados, mantendo a estrutura.' },
        { q: 'O que ON DELETE CASCADE faz em uma chave estrangeira?', opts: ['Ao apagar o registro pai, apaga automaticamente os filhos relacionados', 'Impede apagar o pai', 'Apaga a tabela inteira', 'Coloca NULL no pai'], answer: 0, explain: 'Apagar um cliente, por exemplo, apagaria junto os pedidos dele.' },
        { q: 'Para que serve um índice (CREATE INDEX)?', opts: ['Acelerar buscas na coluna, ao custo de espaço e de escritas mais lentas', 'Garantir que a coluna não tenha NULL', 'Criar um backup', 'Ordenar fisicamente a tabela sempre'], answer: 0, explain: 'Como o índice de um livro, evita ler a tabela inteira para achar um valor.' },
        { q: 'O que a restrição CHECK (preco > 0) faz?', opts: ['Rejeita linhas em que preco não seja maior que zero', 'Verifica o preço a cada SELECT', 'Ordena por preço', 'Cria um índice em preco'], answer: 0, explain: 'INSERTs e UPDATEs que violem a condição são recusados.' },
        { q: 'O que é normalização de banco de dados?', opts: ['Organizar tabelas para reduzir redundância e anomalias de atualização', 'Converter todos os textos para minúsculas', 'Apagar dados antigos', 'Criar backups diários'], answer: 0, explain: 'Ex.: guardar a cidade em uma tabela própria em vez de repeti-la em cada cliente.' }
      ]
    }
  },
  math: {
    arithmetic: {
      easy: [
        { q: 'Qual é o resultado de 15 % 4 (módulo)?', opts: ['3', '4', '1', '0'], answer: 0, explain: '15 ÷ 4 = 3 resto 3. O operador % retorna o resto da divisão.' },
        { q: 'Qual é a ordem correta das operações?', opts: ['Soma, depois multiplicação', 'Multiplicação antes da soma', 'Esquerda para direita sempre', 'Não há regra'], answer: 1, explain: 'PEMDAS: Parênteses, Expoentes, Multiplicação/Divisão, Adição/Subtração.' },
        { q: 'Quanto é 2³ (2 elevado a 3)?', opts: ['6', '8', '9', '5'], answer: 1, explain: '2³ = 2 × 2 × 2 = 8.' },
        { q: 'Qual é o resultado de -3 × -2?', opts: ['-6', '6', '-1', '1'], answer: 1, explain: 'Negativo × Negativo = Positivo. -3 × -2 = 6.' },
        { q: 'Quanto é 0.1 + 0.2 na matemática exata?', opts: ['0.30000000004', '0.3', '0.2', '0.12'], answer: 1, explain: 'Na matemática, 0.1 + 0.2 = 0.3 exato. Computadores podem ter imprecisão de ponto flutuante.' },
        { q: 'Qual é o valor absoluto de -7?', opts: ['-7', '7', '0', '1/7'], answer: 1, explain: 'O valor absoluto remove o sinal. |-7| = 7.' },
        { q: 'Quanto é 100 ÷ 0?', opts: ['0', '100', 'Infinito', 'Indefinido'], answer: 3, explain: 'Divisão por zero é indefinida na matemática.' },
        { q: 'Qual é o resultado de √16?', opts: ['2', '4', '8', '256'], answer: 1, explain: '√16 = 4, porque 4 × 4 = 16.' }
      ],
      medium: [
        { q: 'Quanto é 2⁰ (2 elevado a 0)?', opts: ['0', '1', '2', 'Indefinido'], answer: 1, explain: 'Qualquer número (exceto 0) elevado a 0 é igual a 1.' },
        { q: 'Qual é o resultado de (3 + 5) × 2 - 4?', opts: ['12', '14', '16', '10'], answer: 0, explain: '(3+5) = 8. 8 × 2 = 16. 16 - 4 = 12.' },
        { q: 'Quanto vale uma potência com expoente negativo, como 2⁻²?', opts: ['−4', '4', '0.25', '−0.25'], answer: 2, explain: '2⁻² = 1/2² = 1/4 = 0.25.' },
        { q: 'Qual é o MDC de 12 e 18?', opts: ['2', '3', '6', '36'], answer: 2, explain: 'Máximo Divisor Comum: fatores de 12={1,2,3,4,6,12}, de 18={1,2,3,6,9,18}. MDC=6.' },
        { q: 'Qual é o MMC de 4 e 6?', opts: ['2', '12', '24', '10'], answer: 1, explain: 'Mínimo Múltiplo Comum: múltiplos de 4={4,8,12...}, de 6={6,12...}. MMC=12.' },
        { q: 'Quanto é log₂(8)?', opts: ['2', '3', '4', '8'], answer: 1, explain: 'log₂(8) = 3, porque 2³ = 8.' }
      ],
      hard: [
        { q: 'Qual é o resultado de ⌊3.7⌋ (floor)?', opts: ['3', '4', '3.7', '0'], answer: 0, explain: 'Floor (⌊⌋) arredonda para baixo. ⌊3.7⌋ = 3.' },
        { q: 'Qual é o resultado de ⌈3.2⌉ (ceil)?', opts: ['3', '4', '3.2', '0'], answer: 1, explain: 'Ceil (⌈⌉) arredonda para cima. ⌈3.2⌉ = 4.' },
        { q: 'Quanto é log₁₀(1000)?', opts: ['2', '3', '10', '100'], answer: 1, explain: 'log₁₀(1000) = 3, porque 10³ = 1000.' },
        { q: 'Qual é o resultado de (-1)¹⁰⁰?', opts: ['-1', '1', '100', '-100'], answer: 1, explain: 'Expoente par de -1 sempre dá 1. (-1)¹⁰⁰ = 1.' },
        { q: 'Quanto é 5! (fatorial de 5)?', opts: ['25', '120', '60', '24'], answer: 1, explain: '5! = 5 × 4 × 3 × 2 × 1 = 120.' }
      ]
    },
    algebra: {
      easy: [
        { q: 'Se x + 3 = 7, qual é o valor de x?', opts: ['3', '4', '7', '10'], answer: 1, explain: 'x + 3 = 7 → x = 7 - 3 = 4.' },
        { q: 'Se 2x = 10, qual é o valor de x?', opts: ['2', '5', '10', '20'], answer: 1, explain: '2x = 10 → x = 10 / 2 = 5.' },
        { q: 'Qual é o valor de 3x quando x = 4?', opts: ['7', '12', '34', '1'], answer: 1, explain: '3x = 3 × 4 = 12.' },
        { q: 'O que é uma variável em álgebra?', opts: ['Um número fixo', 'Um símbolo que representa um valor desconhecido', 'Uma operação', 'Um resultado'], answer: 1, explain: 'Variáveis (como x, y) representam valores que queremos descobrir.' },
        { q: 'Se x = 3 e y = 2, qual é a soma x + y?', opts: ['5', '6', '1', '32'], answer: 0, explain: 'x + y = 3 + 2 = 5.' },
        { q: 'Quanto vale 2(x + 3) quando x = 1?', opts: ['5', '7', '8', '10'], answer: 2, explain: '2(1 + 3) = 2 × 4 = 8.' }
      ],
      medium: [
        { q: 'Resolva: 3x - 5 = 10', opts: ['x = 3', 'x = 5', 'x = 15', 'x = -5'], answer: 1, explain: '3x - 5 = 10 → 3x = 15 → x = 5.' },
        { q: 'Qual é o valor de x² - 4 quando x = 3?', opts: ['5', '2', '-1', '13'], answer: 0, explain: '3² - 4 = 9 - 4 = 5.' },
        { q: 'Simplifique: 2x + 3x', opts: ['6x', '5x', '5x²', '23x'], answer: 1, explain: 'Termos semelhantes: 2x + 3x = 5x.' },
        { q: 'Qual é a forma fatorada de x² - 9?', opts: ['(x-3)(x+3)', '(x-9)(x+1)', '(x-3)²', 'x(x-9)'], answer: 0, explain: 'Diferença de quadrados: a² - b² = (a-b)(a+b). x² - 9 = (x-3)(x+3).' },
        { q: 'Resolva o sistema: x + y = 5, x - y = 1', opts: ['x=2, y=3', 'x=3, y=2', 'x=4, y=1', 'x=1, y=4'], answer: 1, explain: 'Somando: 2x = 6 → x = 3. Substituindo: 3 + y = 5 → y = 2.' }
      ],
      hard: [
        { q: 'Quais são as raízes de x² - 5x + 6 = 0?', opts: ['x=1 e x=6', 'x=2 e x=3', 'x=-2 e x=-3', 'x=5 e x=1'], answer: 1, explain: 'Fatorando: (x-2)(x-3) = 0 → x = 2 ou x = 3.' },
        { q: 'Na fórmula quadrática, o discriminante Δ = b² - 4ac. Se Δ < 0, o que acontece?', opts: ['Duas raízes reais', 'Uma raiz real', 'Nenhuma raiz real', 'Infinitas raízes'], answer: 2, explain: 'Δ < 0 significa que não há raízes reais (raízes são complexas).' },
        { q: 'Qual é o vértice da parábola y = x² - 4x + 3?', opts: ['(2, -1)', '(2, 1)', '(-2, -1)', '(4, 3)'], answer: 0, explain: 'Vértice: x = -b/2a = 4/2 = 2. y = 4 - 8 + 3 = -1. Vértice (2, -1).' },
        { q: 'Simplifique: (2x³)²', opts: ['4x⁶', '2x⁶', '4x⁵', '2x⁵'], answer: 0, explain: '(2x³)² = 2² × (x³)² = 4x⁶.' },
        { q: 'Se f(x) = 2x + 1, quanto vale f(f(1))?', opts: ['3', '5', '7', '9'], answer: 2, explain: 'f(1) = 3 e f(3) = 2 × 3 + 1 = 7.' }
      ]
    },
    logic: {
      easy: [
        { q: 'Na lógica booleana, qual é o resultado de TRUE AND FALSE?', opts: ['TRUE', 'FALSE', 'NULL', 'ERRO'], answer: 1, explain: 'AND só retorna TRUE quando ambos são TRUE.' },
        { q: 'Qual é o resultado de TRUE OR FALSE?', opts: ['TRUE', 'FALSE', 'NULL', 'ERRO'], answer: 0, explain: 'OR retorna TRUE se pelo menos um for TRUE.' },
        { q: 'Qual é o resultado de NOT TRUE?', opts: ['TRUE', 'FALSE', '0', '1'], answer: 1, explain: 'NOT inverte: NOT TRUE = FALSE.' },
        { q: 'Quantos valores uma variável booleana pode ter?', opts: ['1', '2', '3', 'infinitos'], answer: 1, explain: 'Booleano tem exatamente 2 valores: verdadeiro e falso.' },
        { q: 'Se chove E eu tenho guarda-chuva, fico seco. Chove mas NÃO tenho guarda-chuva. Fico seco?', opts: ['Sim', 'Não', 'Depende', 'Impossível saber'], answer: 1, explain: 'A condição exige ambas: chover E ter guarda-chuva. Sem guarda-chuva = não fico seco.' },
        { q: 'Na tabela-verdade de AND, quantas combinações resultam TRUE?', opts: ['1', '2', '3', '4'], answer: 0, explain: 'Apenas TRUE AND TRUE = TRUE. As outras 3 combinações dão FALSE.' }
      ],
      medium: [
        { q: 'Qual é o resultado de NOT (TRUE AND FALSE)?', opts: ['TRUE', 'FALSE', 'NULL', 'ERRO'], answer: 0, explain: 'TRUE AND FALSE = FALSE. NOT FALSE = TRUE.' },
        { q: 'Qual é a Lei de De Morgan para NOT (A AND B)?', opts: ['(NOT A) AND (NOT B)', '(NOT A) OR (NOT B)', 'NOT A AND B', 'A OR B'], answer: 1, explain: 'De Morgan: NOT (A AND B) = (NOT A) OR (NOT B).' },
        { q: 'O que é uma tautologia?', opts: ['Expressão sempre falsa', 'Expressão sempre verdadeira', 'Expressão sem valor', 'Expressão com variáveis'], answer: 1, explain: 'Tautologia é uma expressão lógica que é sempre verdadeira, como (A OR NOT A).' },
        { q: 'Qual operação lógica é representada por XOR?', opts: ['Verdadeiro quando ambos iguais', 'Verdadeiro quando exatamente um é verdadeiro', 'Sempre verdadeiro', 'Sempre falso'], answer: 1, explain: 'XOR (OU exclusivo) é TRUE quando os valores são diferentes.' },
        { q: 'Qual é o resultado de TRUE XOR TRUE?', opts: ['TRUE', 'FALSE', 'NULL', 'ERRO'], answer: 1, explain: 'XOR retorna FALSE quando ambos são iguais. TRUE XOR TRUE = FALSE.' },
        { q: 'Se A → B é verdadeira e A é verdadeira, o que se conclui sobre B?', opts: ['B é verdadeira', 'B é falsa', 'Nada se pode concluir', 'A passa a ser falsa'], answer: 0, explain: 'É o modus ponens: da implicação e da premissa verdadeira, conclui-se B.' }
      ],
      hard: [
        { q: 'Simplifique: A AND (A OR B)', opts: ['A', 'B', 'A AND B', 'A OR B'], answer: 0, explain: 'Lei da absorção: A AND (A OR B) = A.' },
        { q: 'Quantas linhas tem a tabela-verdade de 3 variáveis?', opts: ['3', '6', '8', '9'], answer: 2, explain: '2³ = 8 combinações possíveis para 3 variáveis booleanas.' },
        { q: 'Qual porta lógica é equivalente a NOT (A OR B)?', opts: ['NAND', 'NOR', 'XOR', 'XNOR'], answer: 1, explain: 'NOR = NOT OR. Retorna TRUE apenas quando ambos são FALSE.' },
        { q: 'Na implicação lógica (A → B), quando ela é FALSE?', opts: ['A=TRUE, B=TRUE', 'A=TRUE, B=FALSE', 'A=FALSE, B=TRUE', 'A=FALSE, B=FALSE'], answer: 1, explain: 'A implicação só é falsa quando a premissa (A) é verdadeira e a conclusão (B) é falsa.' },
        { q: 'Qual é a contrapositiva de "Se chove, então a rua molha"?', opts: ['Se a rua molha, então chove', 'Se não chove, então a rua não molha', 'Se a rua não molha, então não chove', 'Chove e a rua não molha'], answer: 2, explain: 'A contrapositiva de A → B é ¬B → ¬A, e é logicamente equivalente à original.' }
      ]
    },
    numeral: {
      easy: [
        { q: 'Qual é a base do sistema binário?', opts: ['2', '8', '10', '16'], answer: 0, explain: 'Binário usa base 2: apenas os dígitos 0 e 1.' },
        { q: 'Qual é o valor decimal de 1010 em binário?', opts: ['8', '10', '12', '5'], answer: 1, explain: '1010₂ = 1×8 + 0×4 + 1×2 + 0×1 = 10.' },
        { q: 'Qual sistema numérico usamos no dia a dia?', opts: ['Binário', 'Octal', 'Decimal', 'Hexadecimal'], answer: 2, explain: 'Usamos o sistema decimal (base 10) no cotidiano.' },
        { q: 'Quantos dígitos o sistema hexadecimal usa?', opts: ['2', '8', '10', '16'], answer: 3, explain: 'Hexadecimal usa 16 dígitos: 0-9 e A-F.' },
        { q: 'Qual é o valor decimal de 11 em binário?', opts: ['2', '3', '11', '1'], answer: 1, explain: '11₂ = 1×2 + 1×1 = 3.' },
        { q: 'Em hexadecimal, qual letra representa o valor 10?', opts: ['A', 'B', 'F', 'X'], answer: 0, explain: 'No hexadecimal: A=10, B=11, C=12, D=13, E=14, F=15.' }
      ],
      medium: [
        { q: 'Qual é o binário de 13?', opts: ['1101', '1011', '1110', '1001'], answer: 0, explain: '13 = 8+4+1 = 1101₂.' },
        { q: 'Qual é o hexadecimal de 255?', opts: ['FE', 'FF', '100', 'F0'], answer: 1, explain: '255 = 15×16 + 15 = FF₁₆.' },
        { q: 'Quanto é 0xFF em decimal?', opts: ['15', '16', '255', '256'], answer: 2, explain: '0xFF = 15×16 + 15 = 240 + 15 = 255.' },
        { q: 'Qual é o octal de 8 (decimal)?', opts: ['8', '10', '100', '1000'], answer: 1, explain: '8 em octal = 10₈ (1×8 + 0×1).' },
        { q: 'Quanto é 1 byte em bits?', opts: ['4', '8', '16', '32'], answer: 1, explain: '1 byte = 8 bits. Pode representar valores de 0 a 255.' }
      ],
      hard: [
        { q: 'Qual é o maior número representável com 8 bits sem sinal?', opts: ['128', '255', '256', '127'], answer: 1, explain: '8 bits sem sinal: 0 a 2⁸-1 = 0 a 255.' },
        { q: 'Em complemento de dois com 8 bits, qual é -1?', opts: ['10000001', '11111111', '00000001', '11111110'], answer: 1, explain: 'Complemento de 2: inverte bits de 1 (00000001 → 11111110) e soma 1 = 11111111.' },
        { q: 'Qual operação bit-a-bit resulta em 0 quando aplicada a um número consigo mesmo?', opts: ['AND', 'OR', 'XOR', 'NOT'], answer: 2, explain: 'XOR de bits iguais = 0. Qualquer número XOR ele mesmo = 0.' },
        { q: 'Qual é o resultado de 5 << 1 (shift left)?', opts: ['2', '5', '10', '25'], answer: 2, explain: 'Shift left por 1 multiplica por 2. 5 << 1 = 10.' },
        { q: 'Qual é o resultado de 12 AND 10 (bit a bit)?', opts: ['8', '14', '6', '2'], answer: 0, explain: '1100 AND 1010 = 1000, que vale 8.' }
      ]
    },
    sets: {
      easy: [
        { q: 'O que é a UNIÃO de dois conjuntos (A ∪ B)?', opts: ['Elementos em A e B', 'Elementos em A ou B (ou ambos)', 'Elementos só em A', 'Elementos só em B'], answer: 1, explain: 'União inclui todos os elementos que estão em A, em B, ou em ambos.' },
        { q: 'O que é a INTERSEÇÃO (A ∩ B)?', opts: ['Todos elementos', 'Elementos em ambos A e B', 'Elementos só em A', 'Conjunto vazio'], answer: 1, explain: 'Interseção são os elementos que pertencem a A E a B simultaneamente.' },
        { q: 'Se A = {1,2,3} e B = {2,3,4}, quais elementos estão em A ∩ B?', opts: ['{1,2,3,4}', '{2,3}', '{1,4}', '{1}'], answer: 1, explain: 'Elementos em ambos: 2 e 3. A ∩ B = {2,3}.' },
        { q: 'O que é o conjunto vazio?', opts: ['Um conjunto com zero', 'Um conjunto sem elementos', 'Um conjunto infinito', 'Não existe'], answer: 1, explain: 'Conjunto vazio (∅) não contém nenhum elemento.' },
        { q: 'Se A = {1,2,3} e B = {2,3,4}, qual é a união A ∪ B?', opts: ['{2,3}', '{1,4}', '{1,2,3,4}', '{1,2,3}'], answer: 2, explain: 'União de todos os elementos: {1,2,3,4}.' },
        { q: 'Qual símbolo indica que um elemento pertence a um conjunto?', opts: ['∈', '⊂', '∪', '∅'], answer: 0, explain: '∈ indica pertinência: 2 ∈ {1, 2, 3}. ⊂ relaciona conjuntos (subconjunto).' }
      ],
      medium: [
        { q: 'O que é A - B (diferença de conjuntos)?', opts: ['Elementos em A que NÃO estão em B', 'Elementos em B que não estão em A', 'Interseção', 'União'], answer: 0, explain: 'A - B = elementos exclusivos de A (que não estão em B).' },
        { q: 'Se A = {1,2,3,4} e B = {3,4,5}, qual é A - B?', opts: ['{1,2}', '{5}', '{3,4}', '{1,2,5}'], answer: 0, explain: 'A - B = elementos em A e não em B = {1,2}.' },
        { q: 'A é subconjunto de B (A ⊂ B) significa que...', opts: ['A e B são iguais', 'Todo elemento de A está em B', 'A é maior que B', 'A e B não têm elementos em comum'], answer: 1, explain: 'A ⊂ B significa que todos os elementos de A também estão em B.' },
        { q: 'Qual é o complemento de A se o universo U = {1,2,3,4,5} e A = {1,3}?', opts: ['{2,4,5}', '{1,3}', '{1,2,3,4,5}', '∅'], answer: 0, explain: 'Complemento = U - A = elementos no universo que não estão em A = {2,4,5}.' },
        { q: 'Quantos subconjuntos tem o conjunto {a, b, c}?', opts: ['3', '6', '8', '9'], answer: 2, explain: 'Um conjunto com n elementos tem 2ⁿ subconjuntos: 2³ = 8, contando ∅ e o próprio conjunto.' }
      ],
      hard: [
        { q: 'Se |A| = 10, |B| = 7 e |A ∩ B| = 3, qual é |A ∪ B|?', opts: ['14', '17', '20', '10'], answer: 0, explain: '|A ∪ B| = |A| + |B| - |A ∩ B| = 10 + 7 - 3 = 14.' },
        { q: 'O que é o produto cartesiano A × B?', opts: ['Interseção de A e B', 'Todos os pares ordenados (a,b)', 'Soma dos conjuntos', 'Diferença simétrica'], answer: 1, explain: 'A × B = conjunto de todos os pares (a,b) onde a∈A e b∈B.' },
        { q: 'Se A = {1,2} e B = {a,b}, quantos elementos tem A × B?', opts: ['2', '4', '6', '8'], answer: 1, explain: '|A × B| = |A| × |B| = 2 × 2 = 4 pares: (1,a), (1,b), (2,a), (2,b).' },
        { q: 'O que é a diferença simétrica A Δ B?', opts: ['Elementos que estão em A ou em B, mas não em ambos', 'Elementos que estão em ambos', 'Elementos só de A', 'Todos os pares ordenados'], answer: 0, explain: 'A Δ B = (A ∪ B) − (A ∩ B).' },
        { q: 'Numa turma de 40 alunos, 25 gostam de futebol, 20 de vôlei e 10 de ambos. Quantos não gostam de nenhum dos dois?', opts: ['5', '10', '0', '15'], answer: 0, explain: 'Gostam de pelo menos um: 25 + 20 − 10 = 35. Logo, 40 − 35 = 5 não gostam de nenhum.' }
      ]
    },
    combinatorics: {
      easy: [
        { q: 'De quantas formas 3 pessoas podem se organizar em fila?', opts: ['3', '6', '9', '27'], answer: 1, explain: '3! = 3 × 2 × 1 = 6 formas (permutação).' },
        { q: 'Lançando uma moeda, qual a probabilidade de dar cara?', opts: ['1/4', '1/3', '1/2', '1'], answer: 2, explain: 'Moeda tem 2 lados. P(cara) = 1/2 = 50%.' },
        { q: 'Lançando um dado, quantos resultados possíveis existem?', opts: ['2', '4', '6', '12'], answer: 2, explain: 'Um dado padrão tem 6 faces: 1, 2, 3, 4, 5, 6.' },
        { q: 'O que é fatorial (n!)?', opts: ['n × 2', 'Produto de 1 até n', 'n elevado a n', 'Raiz de n'], answer: 1, explain: 'n! = n × (n-1) × (n-2) × ... × 1. Ex: 4! = 24.' },
        { q: 'Qual a probabilidade de tirar um número par em um dado?', opts: ['1/6', '1/3', '1/2', '2/3'], answer: 2, explain: 'Pares: {2,4,6} = 3 resultados de 6. P = 3/6 = 1/2.' }
      ],
      medium: [
        { q: 'Qual a diferença entre permutação e combinação?', opts: ['Nenhuma', 'Permutação: ordem importa. Combinação: não', 'Combinação: ordem importa', 'São operações matemáticas'], answer: 1, explain: 'Permutação considera a ordem (ABC ≠ BAC). Combinação não (ABC = BAC).' },
        { q: 'Quantas combinações de 2 itens podem ser feitas de {A,B,C}?', opts: ['2', '3', '6', '9'], answer: 1, explain: 'C(3,2) = 3!/(2!×1!) = 3. São: {A,B}, {A,C}, {B,C}.' },
        { q: 'Qual a probabilidade de tirar 2 caras seguidas ao lançar uma moeda?', opts: ['1/2', '1/3', '1/4', '1/8'], answer: 2, explain: 'P = 1/2 × 1/2 = 1/4 (eventos independentes).' },
        { q: 'Quantos anagramas tem a palavra "SOL"?', opts: ['3', '6', '9', '27'], answer: 1, explain: '3 letras distintas: 3! = 6 anagramas.' },
        { q: 'Quantas senhas de 4 dígitos (0-9) existem?', opts: ['1.000', '5.040', '10.000', '40'], answer: 2, explain: '10 opções por dígito, 4 posições: 10⁴ = 10.000.' }
      ],
      hard: [
        { q: 'Quanto é C(10, 3)?', opts: ['30', '120', '720', '1000'], answer: 1, explain: 'C(10,3) = 10! / (3! × 7!) = (10×9×8) / (3×2×1) = 120.' },
        { q: 'Qual é o Princípio da Multiplicação?', opts: ['Somar as possibilidades', 'Multiplicar possibilidades de cada etapa', 'Dividir pelo total', 'Fatorar'], answer: 1, explain: 'Se há m formas na etapa 1 e n na etapa 2, o total é m × n.' },
        { q: 'Qual a probabilidade de NÃO tirar 6 ao lançar um dado?', opts: ['1/6', '5/6', '1/2', '4/6'], answer: 1, explain: 'P(não 6) = 1 - P(6) = 1 - 1/6 = 5/6.' },
        { q: 'Quantos anagramas tem "ARARA"?', opts: ['120', '60', '20', '10'], answer: 3, explain: 'São 5 letras, com o A repetido 3 vezes e o R 2 vezes: 5! / (3! × 2!) = 120 / 12 = 10.' },
        { q: 'De quantas formas é possível escolher presidente e vice entre 5 candidatos?', opts: ['10', '20', '25', '120'], answer: 1, explain: 'A ordem importa (cargos diferentes): 5 × 4 = 20 arranjos.' }
      ]
    }
  },
  fundamentos_programacao: {
    pensamento_computacional: {
      easy: [
        { q: 'O que significa decompor um problema em programação?', opts: ['Ignorar partes difíceis', 'Quebrar em partes menores', 'Usar apenas uma linguagem', 'Executar sem planejar'], answer: 1, explain: 'Decomposição é dividir um problema grande em partes menores e mais simples.' },
        { q: 'Reconhecimento de padrões ajuda porque...', opts: ['Evita testes', 'Permite reaproveitar soluções parecidas', 'Substitui o algoritmo', 'Dispensa lógica'], answer: 1, explain: 'Ao reconhecer padrões, você aplica estratégias já conhecidas em problemas similares.' },
        { q: 'Abstração em pensamento computacional é...', opts: ['Guardar todo detalhe possível', 'Focar no que é essencial e ignorar ruído', 'Escrever mais código', 'Evitar documentação'], answer: 1, explain: 'Abstração reduz complexidade ao focar apenas no que importa para resolver o problema.' },
        { q: 'Os pilares do pensamento computacional são decomposição, reconhecimento de padrões, abstração e...', opts: ['Compilação', 'Algoritmos', 'Internet', 'Hardware'], answer: 1, explain: 'O quarto pilar é o algoritmo: a sequência de passos que resolve o problema.' },
        { q: 'Organizar uma festa dividindo-a em convites, comida e música é um exemplo de...', opts: ['Abstração', 'Decomposição', 'Compilação', 'Criptografia'], answer: 1, explain: 'Dividir uma tarefa grande em partes menores e independentes é decomposição.' }
      ],
      medium: [
        { q: 'Qual sequência representa melhor o fluxo de resolução?', opts: ['Codar -> Entender problema -> Testar', 'Entender -> Planejar -> Implementar -> Testar', 'Testar -> Codar -> Planejar', 'Planejar -> Publicar -> Entender'], answer: 1, explain: 'Fluxo saudável: entender, planejar, implementar e validar com testes.' },
        { q: 'Quando dois problemas têm estrutura parecida, a melhor prática é...', opts: ['Criar tudo do zero sempre', 'Adaptar uma solução base para o novo contexto', 'Ignorar a semelhança', 'Trocar de linguagem'], answer: 1, explain: 'A reutilização de estratégia economiza tempo e reduz erros.' },
        { q: 'Pensamento computacional não depende de linguagem porque...', opts: ['Linguagens são todas iguais', 'A lógica da solução vem antes da sintaxe', 'Sintaxe não importa nunca', 'Computador resolve sozinho'], answer: 1, explain: 'A lógica é o núcleo; a linguagem é apenas a forma de implementar.' },
        { q: 'Um mapa de metrô mostra estações e linhas, mas não as ruas. Isso exemplifica...', opts: ['Decomposição', 'Abstração', 'Recursão', 'Depuração'], answer: 1, explain: 'O mapa ignora detalhes irrelevantes para o objetivo (ir de uma estação a outra).' },
        { q: 'Perceber que o frete de todos os pedidos segue a mesma regra é um caso de...', opts: ['Reconhecimento de padrões', 'Abstração de hardware', 'Erro de lógica', 'Otimização prematura'], answer: 0, explain: 'Ao identificar a regra comum, uma única solução serve para todos os pedidos.' }
      ],
      hard: [
        { q: 'Escolher entre duas soluções corretas costuma envolver...', opts: ['Apenas estética', 'Trade-off entre clareza, tempo e memória', 'Somente velocidade', 'Somente tamanho do código'], answer: 1, explain: 'Engenharia de software envolve balancear critérios, não otimizar um único ponto.' },
        { q: 'Uma solução escalável deve considerar principalmente...', opts: ['Apenas o caso de 1 usuário', 'Comportamento com aumento de dados e uso', 'Só a interface visual', 'Só o nome das variáveis'], answer: 1, explain: 'Escalabilidade analisa como a solução se comporta quando a carga cresce.' },
        { q: 'Qual prática fortalece raciocínio algorítmico?', opts: ['Pular validação de hipótese', 'Testar cenários normais, limites e erro', 'Memorizar código sem entender', 'Evitar depuração'], answer: 1, explain: 'Cobrir cenários diferentes melhora robustez da lógica.' },
        { q: 'Generalizar uma solução significa...', opts: ['Resolver só o caso de teste dado', 'Adaptá-la para funcionar com várias entradas parecidas, usando parâmetros', 'Remover todas as condições', 'Copiar código de outro projeto'], answer: 1, explain: 'Uma solução geral recebe os dados como parâmetros em vez de valores fixos.' },
        { q: 'Por que simular um algoritmo à mão com exemplos antes de programar é útil?', opts: ['Porque substitui todos os testes', 'Porque revela falhas de lógica cedo, quando corrigir é mais barato', 'Porque deixa o código mais rápido', 'Porque dispensa conhecer a linguagem'], answer: 1, explain: 'Erros de raciocínio encontrados no papel custam menos do que depois de implementados.' }
      ]
    },
    boas_praticas: {
      easy: [
        { q: 'Um bom nome de variável deve ser...', opts: ['Curto e sem sentido', 'Claro e descritivo', 'Sempre uma letra', 'Sempre em inglês técnico complexo'], answer: 1, explain: 'Nomes claros facilitam leitura, manutenção e revisão do código.' },
        { q: 'Indentação serve para...', opts: ['Apenas enfeite', 'Organizar visualmente blocos de código', 'Aumentar desempenho', 'Diminuir memória'], answer: 1, explain: 'Indentação facilita entender a estrutura lógica do programa.' },
        { q: 'Comentários úteis geralmente explicam...', opts: ['O óbvio', 'Decisões e contexto não triviais', 'A sintaxe básica da linguagem', 'Tudo linha por linha sem necessidade'], answer: 1, explain: 'Comentários devem registrar intenção e contexto, não repetir o código.' },
        { q: 'Qual nome de variável é mais claro para guardar a idade de um aluno?', opts: ['x', 'idadeAluno', 'a1', 'dado'], answer: 1, explain: 'O nome deve dizer o que a variável guarda, sem exigir que o leitor adivinhe.' },
        { q: 'Por que manter um padrão de formatação em todo o projeto?', opts: ['Para o código rodar mais rápido', 'Para facilitar a leitura e a colaboração da equipe', 'Para ocupar menos espaço em disco', 'Porque o compilador exige'], answer: 1, explain: 'Código com o mesmo estilo é mais fácil de ler, revisar e comparar.' }
      ],
      medium: [
        { q: 'O princípio DRY significa...', opts: ['Deixar rápido e pronto', 'Evitar duplicação desnecessária de lógica', 'Usar só funções grandes', 'Nunca reutilizar código'], answer: 1, explain: 'DRY (Don’t Repeat Yourself) reduz repetição e facilita manutenção.' },
        { q: 'Funções pequenas e coesas são melhores porque...', opts: ['Gastam menos memória sempre', 'São mais fáceis de testar e manter', 'Dispensam documentação', 'Impedem bugs automaticamente'], answer: 1, explain: 'Escopo reduzido facilita entendimento, testes e evolução do código.' },
        { q: 'Refatorar é...', opts: ['Adicionar nova funcionalidade', 'Reorganizar código sem mudar comportamento externo', 'Apagar testes', 'Trocar linguagem obrigatoriamente'], answer: 1, explain: 'Refatoração melhora estrutura interna preservando resultado funcional.' },
        { q: 'O que é um "número mágico" no código?', opts: ['Um número aleatório', 'Um valor literal sem explicação, como 86400, no lugar de uma constante nomeada', 'Um número primo', 'Uma variável global'], answer: 1, explain: 'Trocar 86400 por SEGUNDOS_POR_DIA deixa claro o significado e evita erros ao alterar.' },
        { q: 'O princípio KISS recomenda...', opts: ['Manter a solução simples', 'Criar camadas extras pensando no futuro', 'Escrever tudo em uma única função', 'Evitar testes'], answer: 0, explain: 'KISS ("Keep It Simple, Stupid"): soluções simples são mais fáceis de entender e manter.' }
      ],
      hard: [
        { q: 'Qual abordagem reduz risco ao refatorar?', opts: ['Refatorar tudo de uma vez sem testes', 'Pequenas mudanças com testes frequentes', 'Desativar validações', 'Trocar arquitetura inteira imediatamente'], answer: 1, explain: 'Incrementos pequenos e validados evitam regressões grandes.' },
        { q: 'Alta coesão e baixo acoplamento indicam que...', opts: ['Módulos dependem fortemente entre si', 'Cada módulo tem foco claro e poucas dependências', 'Não existe separação de responsabilidades', 'Tudo está em um único arquivo'], answer: 1, explain: 'Esse equilíbrio melhora manutenção e evolução do sistema.' },
        { q: 'Code review bem feito prioriza...', opts: ['Somente estilo visual', 'Correção, riscos, clareza e impacto de mudanças', 'Apenas tamanho do PR', 'Excluir comentários'], answer: 1, explain: 'Revisão técnica deve focar qualidade funcional e sustentabilidade do código.' },
        { q: 'O princípio YAGNI orienta a...', opts: ['Implementar já tudo o que talvez seja útil um dia', 'Não implementar funcionalidades antes que sejam realmente necessárias', 'Duplicar código para ganhar tempo', 'Evitar refatoração'], answer: 1, explain: 'YAGNI ("You Aren\'t Gonna Need It") evita complexidade especulativa que talvez nunca seja usada.' },
        { q: 'O "S" do SOLID (responsabilidade única) diz que uma classe ou módulo deve...', opts: ['Ter apenas um método', 'Ter um único motivo para mudar', 'Ser usado por um único arquivo', 'Ser escrito por uma só pessoa'], answer: 1, explain: 'Cada módulo deve cuidar de uma responsabilidade; assim, mudanças ficam localizadas.' }
      ]
    },
    testes_validacao: {
      easy: [
        { q: 'Caso de teste é...', opts: ['Apenas um bug encontrado', 'Uma entrada e resultado esperado para validar comportamento', 'Somente código de produção', 'Uma documentação visual'], answer: 1, explain: 'Caso de teste define cenário, entrada e resultado esperado.' },
        { q: 'Validar entrada do usuário ajuda a...', opts: ['Aumentar bugs', 'Evitar erros e dados inválidos', 'Remover necessidade de testes', 'Substituir banco de dados'], answer: 1, explain: 'Validação evita falhas por formatos e valores inválidos.' },
        { q: 'Teste de caso limite verifica...', opts: ['Somente casos comuns', 'Valores extremos e de fronteira', 'Apenas interface gráfica', 'Apenas performance'], answer: 1, explain: 'Casos de borda costumam revelar falhas escondidas.' },
        { q: 'Uma função de soma recebe 2 e 3. Qual resultado o teste deve esperar?', opts: ['23', '5', '6', '1'], answer: 1, explain: 'O teste compara a saída real com a esperada (5); se forem diferentes, o teste falha.' },
        { q: 'Quando um teste falha, isso significa que...', opts: ['O computador quebrou', 'O comportamento obtido é diferente do esperado', 'O teste deve ser apagado', 'O código está sempre certo'], answer: 1, explain: 'A falha indica uma divergência; pode ser bug no código ou no próprio teste, e precisa ser investigada.' }
      ],
      medium: [
        { q: 'Teste unitário foca em...', opts: ['Sistema inteiro com rede real', 'Uma parte isolada da lógica', 'Somente design visual', 'Servidor em produção'], answer: 1, explain: 'Unidade isolada facilita identificar a origem de erros.' },
        { q: 'Teste de regressão serve para...', opts: ['Criar funcionalidades novas', 'Garantir que mudanças não quebrem comportamentos antigos', 'Apenas medir latência', 'Substituir revisão de código'], answer: 1, explain: 'Regressão valida estabilidade após alterações.' },
        { q: 'A estrutura Given-When-Then ajuda a...', opts: ['Compilar mais rápido', 'Descrever cenário, ação e resultado esperado', 'Reduzir número de funções', 'Criar interface'], answer: 1, explain: 'Esse formato deixa testes legíveis e objetivos.' },
        { q: 'Uma função aceita idades de 0 a 120. Quais valores de fronteira são mais úteis no teste?', opts: ['Apenas 50', '-1, 0, 120 e 121', 'Apenas 10 e 20', 'Somente textos'], answer: 1, explain: 'Testar logo abaixo, no limite e logo acima revela erros como trocar < por <=.' },
        { q: 'Teste de integração verifica...', opts: ['Uma função isolada', 'Se partes diferentes do sistema funcionam bem juntas', 'Apenas a cor da interface', 'A velocidade da internet'], answer: 1, explain: 'Ele cobre a comunicação entre módulos, banco de dados e serviços.' }
      ],
      hard: [
        { q: 'Teste flaky é aquele que...', opts: ['Falha sempre no mesmo ponto', 'Alterna entre passar/falhar sem mudança no código', 'Executa mais rápido', 'Nunca deve ser corrigido'], answer: 1, explain: 'Flakiness reduz confiança na suíte de testes e precisa ser tratada.' },
        { q: 'Ao priorizar testes, você deve começar por...', opts: ['Funcionalidades de menor impacto', 'Fluxos críticos de negócio e risco alto', 'Apenas telas secundárias', 'Somente funções utilitárias'], answer: 1, explain: 'Cobertura de áreas críticas reduz risco operacional.' },
        { q: 'Automação de testes agrega valor quando...', opts: ['Substitui qualquer teste manual', 'Fornece feedback rápido e repetível para mudanças frequentes', 'É usada sem critério', 'Elimina necessidade de requisitos'], answer: 1, explain: 'Automação eficiente acelera validação contínua e confiável.' },
        { q: 'No TDD (desenvolvimento guiado por testes), qual é a ordem do ciclo?', opts: ['Código -> Teste -> Deploy', 'Escrever um teste que falha -> Fazer passar -> Refatorar', 'Refatorar -> Testar -> Escrever', 'Deploy -> Teste -> Código'], answer: 1, explain: 'O ciclo "vermelho, verde, refatorar" guia o design pelo comportamento esperado.' },
        { q: 'Para que serve um mock (dublê de teste)?', opts: ['Substituir uma dependência real, como uma API, por uma versão controlada', 'Deixar o teste mais lento', 'Apagar dados de produção', 'Gerar documentação'], answer: 0, explain: 'Com o mock, o teste não depende de rede nem de serviços externos e fica previsível.' }
      ]
    },
    eficiencia_basica: {
      easy: [
        { q: 'Eficiência em programação normalmente relaciona...', opts: ['Apenas aparência do app', 'Tempo de execução e uso de recursos', 'Somente número de linhas', 'Somente nome das funções'], answer: 1, explain: 'Eficiência considera desempenho e consumo de memória/CPU.' },
        { q: 'Evitar trabalho repetido dentro de loop ajuda a...', opts: ['Piorar performance', 'Melhorar tempo de execução', 'Aumentar bugs sempre', 'Remover legibilidade'], answer: 1, explain: 'Eliminar repetições desnecessárias costuma reduzir custo computacional.' },
        { q: 'Se você já encontrou o item procurado em uma lista, o ideal é...', opts: ['Continuar percorrendo até o fim sem necessidade', 'Interromper a busca', 'Ordenar toda lista', 'Copiar a lista'], answer: 1, explain: 'Saída antecipada evita processamento desnecessário.' },
        { q: 'Procurar um nome em uma lista telefônica ordenada abrindo perto da letra certa é mais eficiente que...', opts: ['Ler página por página desde o início', 'Usar o índice alfabético', 'Abrir no meio e seguir a ordem', 'Nenhuma das anteriores'], answer: 0, explain: 'Aproveitar a ordenação, como na busca binária, evita ler tudo.' },
        { q: 'Medir o tempo de execução de um trecho de código serve para...', opts: ['Descobrir de fato onde o programa está lento', 'Corrigir erros de sintaxe', 'Trocar de linguagem', 'Aumentar a memória'], answer: 0, explain: 'Medir mostra o gargalo real, em vez de otimizar no escuro.' }
      ],
      medium: [
        { q: 'Complexidade O(n) indica que...', opts: ['Tempo constante', 'Cresce proporcionalmente ao tamanho da entrada', 'Cresce ao quadrado sempre', 'Não depende dos dados'], answer: 1, explain: 'O(n) cresce linearmente com o número de elementos.' },
        { q: 'Em buscas frequentes por chave, estrutura chave-valor tende a ser...', opts: ['Pior escolha sempre', 'Mais adequada que varredura linear em array', 'Idêntica a lista ligada', 'Inútil para dados'], answer: 1, explain: 'Mapas/dicionários oferecem acesso mais rápido por chave na média.' },
        { q: 'Pré-calcular valores reutilizados é uma forma de...', opts: ['Aumentar complexidade sem ganho', 'Trocar algum uso de memória por ganho de tempo', 'Eliminar testes', 'Remover entrada do usuário'], answer: 1, explain: 'Esse trade-off pode acelerar operações repetitivas.' },
        { q: 'Complexidade O(1) significa que...', opts: ['O tempo cresce com a entrada', 'O tempo não depende do tamanho da entrada', 'O algoritmo roda só uma vez', 'O algoritmo nunca termina'], answer: 1, explain: 'Ex.: acessar arr[5] leva o mesmo tempo com 10 ou com 10 milhões de itens.' },
        { q: 'Com busca binária em uma lista ordenada de 1.000 itens, quantas comparações são necessárias, no máximo?', opts: ['Cerca de 10', 'Cerca de 100', 'Cerca de 500', '1.000'], answer: 0, explain: '2^10 = 1024: em cerca de 10 divisões pela metade resta um só item.' }
      ],
      hard: [
        { q: 'Dois loops aninhados sobre N elementos têm custo aproximado...', opts: ['O(1)', 'O(log n)', 'O(n²)', 'O(n)'], answer: 2, explain: 'Percursos aninhados do mesmo tamanho tendem a crescer quadraticamente.' },
        { q: 'Otimização prematura é um risco porque...', opts: ['Sempre melhora produto', 'Pode aumentar complexidade antes de medir gargalos reais', 'Dispensa benchmarks', 'Substitui arquitetura'], answer: 1, explain: 'Primeiro mede-se o problema real, depois otimiza com foco.' },
        { q: 'Uma decisão técnica madura sobre desempenho deve considerar...', opts: ['Somente velocidade bruta', 'Medições, impacto no código e custo de manutenção', 'Apenas opinião pessoal', 'Apenas moda do mercado'], answer: 1, explain: 'Boa engenharia considera evidência e trade-offs de longo prazo.' },
        { q: 'O que é memoização?', opts: ['Guardar resultados de chamadas já calculadas para reutilizá-los', 'Decorar o código-fonte', 'Apagar a memória após cada função', 'Compilar duas vezes'], answer: 0, explain: 'Ex.: um Fibonacci recursivo memoizado calcula cada valor uma única vez.' },
        { q: 'Um algoritmo O(n²) leva 1 segundo para n = 1.000. Quanto deve levar para n = 2.000?', opts: ['Cerca de 2 segundos', 'Cerca de 4 segundos', 'Cerca de 1 segundo', 'Cerca de 8 segundos'], answer: 1, explain: 'Dobrar n em O(n²) multiplica o tempo por 2² = 4.' }
      ]
    }
  },
  fundamentos_computacao: {
    hardware_software: {
      easy: [
        { q: 'Hardware é...', opts: ['Programas e aplicativos', 'Parte física do computador', 'Apenas sistema operacional', 'Somente internet'], answer: 1, explain: 'Hardware são componentes físicos: CPU, RAM, disco, etc.' },
        { q: 'Software é...', opts: ['Teclado e mouse', 'Conjunto de programas e instruções', 'Só cabos e placas', 'Memória física apenas'], answer: 1, explain: 'Software é a parte lógica executada pelo hardware.' },
        { q: 'Qual componente executa instruções do programa?', opts: ['CPU', 'Monitor', 'Gabinete', 'Mouse'], answer: 0, explain: 'A CPU processa instruções e coordena operações.' },
        { q: 'Qual destes é um dispositivo de entrada?', opts: ['Monitor', 'Teclado', 'Impressora', 'Caixa de som'], answer: 1, explain: 'O teclado envia dados ao computador; monitor, impressora e caixa de som são de saída.' },
        { q: 'Onde ficam guardados os arquivos mesmo com o computador desligado?', opts: ['Na memória RAM', 'No armazenamento (HD ou SSD)', 'No processador', 'Na placa de vídeo'], answer: 1, explain: 'HD e SSD são memória não volátil: mantêm os dados sem energia.' }
      ],
      medium: [
        { q: 'RAM difere de SSD porque a RAM...', opts: ['Guarda dados sem energia por anos', 'É volátil e perde dados ao desligar', 'É mais lenta sempre', 'Serve só para backup'], answer: 1, explain: 'RAM é memória temporária de alta velocidade e volátil.' },
        { q: 'Firmware é...', opts: ['Um navegador web', 'Software embarcado em hardware', 'Uma linguagem de programação', 'Um antivírus'], answer: 1, explain: 'Firmware controla funções básicas de dispositivos eletrônicos.' },
        { q: 'Uma GPU é especialmente eficiente para...', opts: ['Exibir apenas texto simples', 'Processamento gráfico e tarefas paralelas', 'Salvar arquivos em disco', 'Gerenciar permissões de usuário'], answer: 1, explain: 'GPU processa muitos dados em paralelo, útil em gráficos e IA.' },
        { q: 'Qual é a função principal da placa-mãe?', opts: ['Exibir imagens', 'Conectar os componentes e permitir que se comuniquem', 'Guardar arquivos permanentemente', 'Resfriar o processador'], answer: 1, explain: 'Processador, memória, armazenamento e placas se conectam e trocam dados pela placa-mãe.' },
        { q: 'O que é um driver?', opts: ['Um tipo de processador', 'Software que permite ao sistema operacional controlar um dispositivo', 'Um cabo de rede', 'Um vírus'], answer: 1, explain: 'Sem o driver certo, o sistema não sabe conversar com a impressora, a placa de vídeo etc.' }
      ],
      hard: [
        { q: 'Quando CPU está ociosa aguardando disco, o gargalo principal tende a ser...', opts: ['I/O de armazenamento', 'Interface gráfica', 'Nome da variável', 'Compilador'], answer: 0, explain: 'Se a CPU espera dados do disco, o limite está no subsistema de I/O.' },
        { q: 'Virtualização permite principalmente...', opts: ['Aumentar tamanho físico da RAM', 'Executar múltiplos ambientes isolados no mesmo hardware', 'Remover sistema operacional', 'Compilar código automaticamente'], answer: 1, explain: 'Com virtualização, várias máquinas virtuais compartilham hardware físico.' },
        { q: 'Arquiteturas como ARM e x86 diferem em...', opts: ['Somente na cor da placa-mãe', 'Conjunto de instruções e desenho de execução', 'Apenas no sistema de arquivos', 'Somente no tipo de monitor'], answer: 1, explain: 'Arquitetura define instruções e características de processamento.' },
        { q: 'O que significa um processador ter vários núcleos (cores)?', opts: ['Que ele tem mais memória RAM', 'Que pode executar várias sequências de instruções em paralelo', 'Que só funciona com jogos', 'Que dispensa sistema operacional'], answer: 1, explain: 'Cada núcleo executa instruções de forma independente, permitindo paralelismo real.' },
        { q: 'Qual memória é a mais rápida e fica dentro do próprio processador?', opts: ['SSD', 'Registradores', 'RAM', 'HD'], answer: 1, explain: 'Registradores (e depois os caches) estão no topo da hierarquia de memória: menores e mais rápidos que a RAM.' }
      ]
    },
    sistemas_operacionais: {
      easy: [
        { q: 'Um sistema operacional é responsável por...', opts: ['Criar internet global', 'Gerenciar recursos do computador e executar programas', 'Substituir hardware', 'Apenas tocar áudio'], answer: 1, explain: 'O SO organiza CPU, memória, arquivos e periféricos.' },
        { q: 'Processo é...', opts: ['Um arquivo de imagem', 'Programa em execução', 'Somente um driver', 'Pasta do sistema'], answer: 1, explain: 'Quando um programa roda, ele vira um processo no SO.' },
        { q: 'Sistema de arquivos serve para...', opts: ['Aumentar FPS', 'Organizar dados em arquivos e pastas', 'Criar linguagem de programação', 'Substituir memória RAM'], answer: 1, explain: 'O sistema de arquivos estrutura armazenamento e acesso aos dados.' },
        { q: 'Qual destes é um sistema operacional?', opts: ['Linux', 'Google Chrome', 'Microsoft Word', 'Python'], answer: 0, explain: 'Linux, Windows, macOS e Android são sistemas operacionais; Chrome e Word são aplicativos.' },
        { q: 'Para que serve o gerenciador de tarefas?', opts: ['Editar fotos', 'Ver e encerrar programas e processos em execução', 'Instalar a internet', 'Criar planilhas'], answer: 1, explain: 'Ele mostra o uso de CPU e memória de cada processo e permite encerrar os travados.' }
      ],
      medium: [
        { q: 'Multitarefa em SO moderno significa...', opts: ['Rodar um único processo', 'Executar vários processos alternando CPU rapidamente', 'Apenas abrir várias janelas', 'Somente usar múltiplos monitores'], answer: 1, explain: 'O escalonador alterna tarefas para dar sensação de paralelismo.' },
        { q: 'Permissões de arquivo existem para...', opts: ['Diminuir tamanho dos arquivos', 'Controlar quem pode ler, escrever ou executar', 'Acelerar internet', 'Trocar formato de imagem'], answer: 1, explain: 'Permissões reforçam segurança e controle de acesso.' },
        { q: 'Thread comparada a processo é geralmente...', opts: ['Mais pesada em recursos', 'Mais leve e compartilhando memória do processo', 'Um tipo de disco', 'Sempre isolada completamente'], answer: 1, explain: 'Threads compartilham contexto do processo e têm menor custo.' },
        { q: 'O kernel de um sistema operacional é...', opts: ['O papel de parede', 'O núcleo que gerencia hardware, memória e processos', 'Um aplicativo de mensagens', 'O navegador padrão'], answer: 1, explain: 'O kernel é a parte central do SO, com acesso direto ao hardware.' },
        { q: 'O que a memória virtual permite?', opts: ['Usar parte do disco como extensão da RAM', 'Baixar mais memória pela internet', 'Aumentar a velocidade da CPU', 'Rodar sem disco'], answer: 0, explain: 'Quando a RAM enche, páginas pouco usadas vão para o disco (paginação/swap), com custo de desempenho.' }
      ],
      hard: [
        { q: 'Deadlock ocorre quando...', opts: ['Todos processos terminam normalmente', 'Tarefas ficam bloqueadas esperando recursos umas das outras', 'A CPU superaquece', 'A rede cai'], answer: 1, explain: 'No deadlock, há espera circular sem progresso.' },
        { q: 'Escalonador de CPU decide principalmente...', opts: ['Cor da interface do app', 'Qual processo/thread executa a seguir', 'Formato de arquivo', 'Idioma do teclado'], answer: 1, explain: 'Scheduling define ordem e fatia de tempo de execução.' },
        { q: 'Troca de contexto (context switch) é...', opts: ['Copiar arquivos entre pastas', 'Salvar/restaurar estado ao alternar execução entre tarefas', 'Formatar memória RAM', 'Reiniciar sistema'], answer: 1, explain: 'O SO preserva estado de uma tarefa para executar outra.' },
        { q: 'Uma condição de corrida (race condition) acontece quando...', opts: ['Dois processos competem de propósito para ver quem termina primeiro', 'O resultado depende da ordem imprevisível em que threads acessam um dado compartilhado', 'A CPU fica mais rápida', 'O disco está cheio'], answer: 1, explain: 'Sem sincronização (como locks), duas threads alterando a mesma variável podem perder atualizações.' },
        { q: 'O que é uma chamada de sistema (system call)?', opts: ['Um telefonema do suporte técnico', 'O pedido de um programa ao kernel para usar um recurso, como ler um arquivo', 'Um erro do sistema', 'Um processo zumbi'], answer: 1, explain: 'Programas comuns não acessam o hardware diretamente; pedem ao kernel por meio de system calls.' }
      ]
    },
    redes_internet: {
      easy: [
        { q: 'Endereço IP identifica...', opts: ['Somente um navegador', 'Um dispositivo na rede', 'A senha do Wi-Fi', 'A resolução de tela'], answer: 1, explain: 'IP é o identificador lógico de rede para comunicação.' },
        { q: 'Modelo cliente-servidor significa que...', opts: ['Todo computador faz tudo ao mesmo tempo', 'Um cliente solicita e um servidor responde', 'Não há troca de dados', 'Só funciona sem internet'], answer: 1, explain: 'Esse modelo organiza requisições e respostas entre aplicações.' },
        { q: 'Uma URL representa...', opts: ['Apenas o nome do Wi-Fi', 'Endereço de um recurso na web', 'Tipo de cabo de rede', 'Modelo do roteador'], answer: 1, explain: 'URL localiza recursos web como páginas e APIs.' },
        { q: 'O que faz um roteador?', opts: ['Encaminha dados entre redes', 'Exibe imagens', 'Edita textos', 'Fornece energia elétrica'], answer: 0, explain: 'O roteador liga a rede de casa à internet e decide por onde os pacotes seguem.' },
        { q: 'O que significa fazer um "download"?', opts: ['Enviar um arquivo para a internet', 'Receber dados da internet no seu dispositivo', 'Apagar um arquivo', 'Desligar a rede'], answer: 1, explain: 'Download é baixar; o envio é o upload.' }
      ],
      medium: [
        { q: 'HTTPS adiciona ao HTTP principalmente...', opts: ['Compressão de imagens', 'Criptografia via TLS', 'Mais abas no navegador', 'Troca de sistema operacional'], answer: 1, explain: 'HTTPS protege comunicação com criptografia e autenticação.' },
        { q: 'DNS transforma...', opts: ['Texto em imagem', 'Nome de domínio em endereço IP', 'IP em senha', 'Pacotes em arquivos'], answer: 1, explain: 'DNS resolve nomes amigáveis para IPs roteáveis.' },
        { q: 'Latência em rede é...', opts: ['Quantidade total de dados', 'Tempo de ida e volta da comunicação', 'Número de usuários online', 'Capacidade do disco'], answer: 1, explain: 'Latência mede atraso temporal da comunicação.' },
        { q: 'Qual protocolo é usado tipicamente para enviar e-mails entre servidores?', opts: ['SMTP', 'FTP', 'DNS', 'DHCP'], answer: 0, explain: 'SMTP (Simple Mail Transfer Protocol) transporta as mensagens de e-mail.' },
        { q: 'Para que serve o DHCP?', opts: ['Atribuir endereços IP automaticamente aos dispositivos', 'Criptografar páginas', 'Traduzir nomes de domínio', 'Enviar e-mails'], answer: 0, explain: 'Ao entrar no Wi-Fi, o DHCP do roteador entrega ao aparelho um IP e outras configurações.' }
      ],
      hard: [
        { q: 'TCP e UDP diferem porque TCP...', opts: ['Nunca chega ao destino', 'Prioriza confiabilidade e ordem de entrega', 'É sempre mais rápido sem custo', 'Só funciona localmente'], answer: 1, explain: 'TCP garante entrega/ordem; UDP prioriza baixa sobrecarga.' },
        { q: 'CDN melhora entrega de conteúdo ao...', opts: ['Aumentar tamanho dos arquivos', 'Distribuir cópias em servidores geograficamente próximos', 'Remover cache', 'Desativar DNS'], answer: 1, explain: 'Servidores próximos reduzem latência de acesso.' },
        { q: 'Em APIs REST, endpoint representa...', opts: ['Cor do botão', 'URL de um recurso/operação', 'Formato físico do servidor', 'Tamanho da CPU'], answer: 1, explain: 'Endpoint é o ponto de acesso HTTP para recursos.' },
        { q: 'Por que o IPv6 foi criado?', opts: ['Para substituir o HTTP', 'Porque os endereços IPv4 (32 bits) estavam se esgotando', 'Para deixar o Wi-Fi mais rápido', 'Para eliminar o DNS'], answer: 1, explain: 'O IPv6 usa endereços de 128 bits, oferecendo uma quantidade enorme de endereços.' },
        { q: 'O código de status HTTP 404 indica...', opts: ['Sucesso', 'Recurso não encontrado', 'Erro interno do servidor', 'Redirecionamento'], answer: 1, explain: '2xx = sucesso, 3xx = redirecionamento, 4xx = erro do cliente (404 = não encontrado), 5xx = erro do servidor.' }
      ]
    },
    dados_memoria: {
      easy: [
        { q: '1 byte equivale a...', opts: ['2 bits', '4 bits', '8 bits', '16 bits'], answer: 2, explain: 'Byte é unidade de 8 bits.' },
        { q: 'Memória volátil perde dados quando...', opts: ['Atualiza o navegador', 'Falta energia/desliga o equipamento', 'Muda idioma do sistema', 'Conecta na internet'], answer: 1, explain: 'Memória volátil depende de energia para manter dados.' },
        { q: 'Bits armazenam informação em...', opts: ['Base decimal de 0 a 9', 'Dois estados: 0 e 1', 'Letras do alfabeto', 'Apenas símbolos'], answer: 1, explain: 'Bit é unidade binária com dois estados possíveis.' },
        { q: '1 kilobyte (KB) corresponde a aproximadamente...', opts: ['10 bytes', '1.000 bytes', '1 milhão de bytes', '8 bits'], answer: 1, explain: 'No padrão decimal, 1 KB = 1.000 bytes; o KiB, de base 2, tem 1.024 bytes.' },
        { q: 'Qual unidade é maior: 1 GB ou 1 MB?', opts: ['1 MB', '1 GB', 'São iguais', 'Depende do computador'], answer: 1, explain: '1 GB equivale a cerca de 1.000 MB.' }
      ],
      medium: [
        { q: 'UTF-8 é usado para...', opts: ['Comprimir vídeos', 'Codificar caracteres de texto', 'Formatar discos', 'Executar threads'], answer: 1, explain: 'UTF-8 representa caracteres de diferentes idiomas em bytes.' },
        { q: 'Overflow numérico ocorre quando...', opts: ['Variável recebe texto', 'Valor excede o limite representável do tipo', 'Programa compila com sucesso', 'CPU entra em modo de economia'], answer: 1, explain: 'Cada tipo tem limites de faixa; exceder gera overflow.' },
        { q: 'Cache de memória busca principalmente...', opts: ['Guardar backup permanente', 'Reduzir tempo de acesso a dados frequentes', 'Substituir banco de dados', 'Aumentar tamanho da tela'], answer: 1, explain: 'Cache aproxima dados de uso frequente do processador.' },
        { q: 'Quantos valores diferentes podem ser representados com 4 bits?', opts: ['4', '8', '16', '32'], answer: 2, explain: 'Cada bit dobra as combinações: 2⁴ = 16 valores (de 0 a 15).' },
        { q: 'O que a tabela ASCII associa?', opts: ['Cores a pixels', 'Números a caracteres, como 65 para "A"', 'Endereços IP a sites', 'Arquivos a pastas'], answer: 1, explain: 'ASCII define códigos numéricos para letras, dígitos e símbolos básicos.' }
      ],
      hard: [
        { q: 'Pilha (stack) e heap diferem porque stack...', opts: ['É sempre mais lenta', 'Armazena contexto local com gerenciamento mais previsível', 'Guarda somente arquivos', 'Não guarda variáveis'], answer: 1, explain: 'Stack é usada para chamadas/funções; heap para alocação dinâmica.' },
        { q: 'Serializar dados significa...', opts: ['Apagar dados antigos', 'Converter estrutura em formato para armazenamento/transmissão', 'Executar em paralelo', 'Trocar de linguagem automaticamente'], answer: 1, explain: 'Serialização transforma objetos em formatos como JSON/binário.' },
        { q: 'Endianness descreve...', opts: ['Velocidade de rede', 'Ordem dos bytes na representação de dados', 'Tipo de teclado', 'Quantidade de threads'], answer: 1, explain: 'Endian define como bytes multi-byte são organizados na memória.' },
        { q: 'Compressão sem perdas (lossless) significa que...', opts: ['Os dados originais podem ser recuperados exatamente', 'Parte da informação é descartada', 'O arquivo fica maior', 'Só funciona com imagens'], answer: 0, explain: 'ZIP e PNG são sem perdas; JPEG e MP3 descartam detalhes (compressão com perdas).' },
        { q: 'Por que percorrer dados guardados em sequência na memória costuma ser mais rápido?', opts: ['Porque aproveita melhor o cache (localidade espacial)', 'Porque a RAM fica mais fria', 'Porque o disco gira mais rápido', 'Porque o processador desliga núcleos'], answer: 0, explain: 'O cache traz blocos vizinhos de uma vez; dados contíguos já estão lá quando são usados.' }
      ]
    }
  },
  historia_computacao: {
    pioneiros: {
      easy: [
        { q: 'Ada Lovelace é lembrada por...', opts: ['Criar o primeiro navegador', 'Escrever um dos primeiros algoritmos para máquina analítica', 'Inventar o transistor', 'Fundar a internet'], answer: 1, explain: 'Ada Lovelace escreveu notas com algoritmo para a máquina de Babbage.' },
        { q: 'Alan Turing ficou conhecido por contribuições em...', opts: ['Design gráfico', 'Fundamentos da computação e criptoanálise', 'Banco de dados SQL', 'Hardware móvel'], answer: 1, explain: 'Turing contribuiu para teoria computacional e quebra de códigos.' },
        { q: 'Grace Hopper teve grande impacto em...', opts: ['Redes sociais', 'Compiladores e linguagens de alto nível', 'Placas de vídeo', 'Jogos 3D'], answer: 1, explain: 'Grace Hopper foi pioneira em compiladores e no COBOL.' },
        { q: 'Charles Babbage é conhecido por projetar...', opts: ['A máquina analítica', 'O primeiro smartphone', 'A internet', 'O mouse'], answer: 0, explain: 'No século XIX, Babbage projetou a máquina analítica, precursora dos computadores programáveis.' },
        { q: 'Steve Jobs e Steve Wozniak fundaram qual empresa?', opts: ['Microsoft', 'Apple', 'IBM', 'Intel'], answer: 1, explain: 'A Apple foi fundada em 1976; o Apple II ajudou a popularizar o computador pessoal.' }
      ],
      medium: [
        { q: 'Arquitetura de von Neumann introduziu a ideia de...', opts: ['Somente memória em nuvem', 'Programa armazenado na memória', 'GPU dedicada', 'Navegador integrado'], answer: 1, explain: 'Programa armazenado foi marco da computação moderna.' },
        { q: 'Cartões perfurados de Hollerith foram importantes para...', opts: ['Renderizar gráficos 3D', 'Processamento de dados em larga escala inicial', 'Criptografia quântica', 'Sistemas mobile'], answer: 1, explain: 'Cartões perfurados aceleraram processamento estatístico no início.' },
        { q: 'ENIAC é historicamente conhecido como...', opts: ['Primeiro smartphone', 'Um dos primeiros computadores eletrônicos de uso geral', 'Primeiro SSD', 'Primeiro notebook'], answer: 1, explain: 'ENIAC foi um marco entre os primeiros computadores eletrônicos gerais.' },
        { q: 'O Teste de Turing propõe avaliar se uma máquina...', opts: ['Calcula mais rápido que humanos', 'Consegue se passar por humano em uma conversa', 'Tem mais memória que um cérebro', 'Consegue quebrar códigos'], answer: 1, explain: 'Turing propôs, em 1950, que um avaliador conversasse sem saber se falava com pessoa ou máquina.' },
        { q: 'Dennis Ritchie é conhecido por criar...', opts: ['A linguagem C e, com Ken Thompson, o Unix', 'O Windows', 'O Java', 'A World Wide Web'], answer: 0, explain: 'Ritchie criou o C no Bell Labs, e o Unix foi reescrito nessa linguagem.' }
      ],
      hard: [
        { q: 'Claude Shannon é referência por conectar lógica booleana a...', opts: ['Motores de busca', 'Circuitos digitais e teoria da informação', 'Design de bancos relacionais', 'Sistemas embarcados automotivos'], answer: 1, explain: 'Shannon fundamentou teoria da informação e lógica em circuitos.' },
        { q: 'A máquina de Turing é relevante porque...', opts: ['Foi o primeiro computador comercial', 'Modela formalmente o conceito de computação', 'Criou a web', 'Eliminou necessidade de algoritmos'], answer: 1, explain: 'É um modelo matemático central para teoria da computação.' },
        { q: 'O avanço dos pioneiros influenciou diretamente...', opts: ['Somente jogos', 'Linguagens, arquitetura de computadores e ciência da computação', 'Apenas impressão de documentos', 'Só redes locais'], answer: 1, explain: 'As bases teóricas e práticas dos pioneiros sustentam tecnologia atual.' },
        { q: 'Konrad Zuse é lembrado por...', opts: ['Construir o Z3, um dos primeiros computadores programáveis (1941)', 'Inventar o transistor', 'Criar o protocolo TCP/IP', 'Fundar a Microsoft'], answer: 0, explain: 'O Z3, construído na Alemanha, é considerado o primeiro computador programável e automático em funcionamento.' },
        { q: 'Margaret Hamilton liderou o desenvolvimento do software de voo de qual programa?', opts: ['Apollo, da NASA', 'Projeto Manhattan', 'ARPANET', 'ENIAC'], answer: 0, explain: 'Ela chefiou a equipe do MIT que escreveu o software de bordo das missões Apollo e ajudou a popularizar o termo "engenharia de software".' }
      ]
    },
    geracoes_computadores: {
      easy: [
        { q: 'A primeira geração de computadores foi marcada por...', opts: ['Microprocessadores', 'Válvulas eletrônicas', 'Transistores', 'Computação em nuvem'], answer: 1, explain: 'Primeira geração usava válvulas, com grande consumo e tamanho.' },
        { q: 'A segunda geração evoluiu principalmente com...', opts: ['Discos SSD', 'Transistores', 'Tablets', 'Inteligência artificial generativa'], answer: 1, explain: 'Transistores substituíram válvulas, reduzindo tamanho e calor.' },
        { q: 'A quarta geração é associada ao avanço de...', opts: ['Cartões perfurados', 'Microprocessadores', 'Válvulas a vácuo', 'Relés mecânicos'], answer: 1, explain: 'Microprocessadores permitiram PCs e massificação da computação.' },
        { q: 'Os primeiros computadores eletrônicos ocupavam...', opts: ['O espaço de um relógio de pulso', 'Salas inteiras', 'Uma gaveta', 'O espaço de um celular'], answer: 1, explain: 'Máquinas como o ENIAC pesavam toneladas e ocupavam salas grandes.' },
        { q: 'Qual dispositivo popularizou a computação móvel no século XXI?', opts: ['O smartphone', 'A máquina de escrever', 'O cartão perfurado', 'O mainframe'], answer: 0, explain: 'Smartphones colocaram um computador conectado no bolso de bilhões de pessoas.' }
      ],
      medium: [
        { q: 'Circuitos integrados caracterizam principalmente a...', opts: ['Primeira geração', 'Terceira geração', 'Quinta geração', 'Geração mecânica'], answer: 1, explain: 'A terceira geração foi impulsionada por circuitos integrados.' },
        { q: 'A popularização do computador pessoal trouxe...', opts: ['Menos acesso à tecnologia', 'Computação para uso doméstico e empresarial amplo', 'Fim das linguagens de alto nível', 'Substituição completa da internet'], answer: 1, explain: 'PCs democratizaram acesso e produtividade digital.' },
        { q: 'A ideia de quinta geração historicamente envolve forte foco em...', opts: ['Máquinas de escrever', 'IA e sistemas mais inteligentes', 'Programação em cartões', 'Computadores sem memória'], answer: 1, explain: 'Muitos projetos da quinta geração focaram inteligência artificial.' },
        { q: 'O que era um mainframe?', opts: ['Um computador grande e centralizado, usado por empresas e governos', 'Um tipo de celular', 'Um programa de planilha', 'Uma rede social'], answer: 0, explain: 'Mainframes processavam grandes volumes de dados para muitos usuários ao mesmo tempo.' },
        { q: 'O Intel 4004, de 1971, é conhecido como...', opts: ['O primeiro microprocessador comercial', 'O primeiro mouse', 'O primeiro disco rígido', 'O primeiro computador quântico'], answer: 0, explain: 'Ele reuniu a unidade de processamento em um único chip.' }
      ],
      hard: [
        { q: 'A Lei de Moore descreve, de forma aproximada, que...', opts: ['Internet dobra de preço', 'Número de transistores cresce com o tempo', 'RAM deixa de existir', 'CPU sempre esquenta menos'], answer: 1, explain: 'A observação clássica trata do aumento de transistores em chips.' },
        { q: 'Miniaturização de componentes impactou diretamente...', opts: ['Apenas estética dos gabinetes', 'Custo, consumo energético e acesso em larga escala', 'Fim de sistemas operacionais', 'Eliminação de redes'], answer: 1, explain: 'Componentes menores viabilizaram dispositivos mais baratos e eficientes.' },
        { q: 'A transição para serviços em nuvem representa...', opts: ['Volta aos cartões perfurados', 'Mudança de paradigma para infraestrutura distribuída', 'Fim de data centers', 'Substituição de protocolos de rede'], answer: 1, explain: 'Cloud amplia elasticidade e distribuição de recursos computacionais.' },
        { q: 'Por que o IBM PC, de 1981, foi tão importante?', opts: ['Criou um padrão de arquitetura aberta que outros fabricantes copiaram', 'Foi o primeiro computador com válvulas', 'Eliminou o teclado', 'Era um computador quântico'], answer: 0, explain: 'A arquitetura aberta deu origem aos "PC compatíveis" e consolidou o padrão.' },
        { q: 'O que caracteriza a computação quântica em relação à clássica?', opts: ['Usa qubits, que podem estar em superposição de estados', 'Usa apenas válvulas', 'É idêntica, só que mais rápida', 'Não usa nenhum tipo de informação'], answer: 0, explain: 'Superposição e emaranhamento permitem algoritmos diferentes dos clássicos para certos problemas.' }
      ]
    },
    historia_internet: {
      easy: [
        { q: 'A internet moderna tem raízes em qual projeto?', opts: ['COBOL-Net', 'ARPANET', 'ENIAC-Web', 'FORTRAN-Link'], answer: 1, explain: 'ARPANET é um precursor importante da internet atual.' },
        { q: 'A World Wide Web foi proposta por...', opts: ['Alan Turing', 'Tim Berners-Lee', 'Bill Gates', 'Dennis Ritchie'], answer: 1, explain: 'Tim Berners-Lee propôs a web com HTTP, HTML e URL.' },
        { q: 'Navegadores web servem para...', opts: ['Compilar qualquer linguagem', 'Acessar e interpretar páginas da web', 'Substituir roteadores', 'Criar bancos relacionais'], answer: 1, explain: 'Browsers exibem conteúdo web e executam recursos associados.' },
        { q: 'Qual empresa lançou em 1998 o buscador que se tornou o mais usado do mundo?', opts: ['Google', 'Yahoo', 'Microsoft', 'Amazon'], answer: 0, explain: 'O Google foi fundado em 1998 por Larry Page e Sergey Brin.' },
        { q: 'A Wikipédia, lançada em 2001, é conhecida por ser...', opts: ['Uma enciclopédia colaborativa editada por voluntários', 'Um jogo online', 'Um sistema operacional', 'Um provedor de internet'], answer: 0, explain: 'Qualquer pessoa pode editar seus artigos, revisados pela própria comunidade.' }
      ],
      medium: [
        { q: 'Adoção do TCP/IP foi marco porque...', opts: ['Criou os chips', 'Padronizou comunicação entre redes diferentes', 'Eliminou endereços IP', 'Substituiu HTTP imediatamente'], answer: 1, explain: 'TCP/IP tornou interoperável a comunicação entre múltiplas redes.' },
        { q: 'O avanço da banda larga permitiu principalmente...', opts: ['Menos conteúdo multimídia', 'Mais velocidade e uso intenso de serviços online', 'Fim de vídeo na web', 'Fim das redes móveis'], answer: 1, explain: 'Mais banda favoreceu streaming, apps online e colaboração em tempo real.' },
        { q: 'Web 2.0 é geralmente associada a...', opts: ['Páginas totalmente estáticas', 'Participação ativa de usuários e plataformas sociais', 'Fim do JavaScript', 'Apenas sites acadêmicos'], answer: 1, explain: 'Web 2.0 destacou conteúdo gerado por usuários e interatividade.' },
        { q: 'Qual foi o primeiro navegador gráfico popular, lançado em 1993?', opts: ['Mosaic', 'Chrome', 'Firefox', 'Safari'], answer: 0, explain: 'O NCSA Mosaic popularizou a web com imagens junto ao texto; depois veio o Netscape.' },
        { q: 'A "guerra dos navegadores" dos anos 1990 foi entre...', opts: ['Netscape e Internet Explorer', 'Chrome e Safari', 'Opera e Firefox', 'Mosaic e Lynx'], answer: 0, explain: 'O Internet Explorer, distribuído com o Windows, acabou superando o Netscape.' }
      ],
      hard: [
        { q: 'Padrões abertos na internet são importantes porque...', opts: ['Aumentam bloqueio entre sistemas', 'Facilitam interoperabilidade e evolução do ecossistema', 'Impedem inovação', 'Eliminam segurança'], answer: 1, explain: 'Padrões abertos permitem que sistemas diversos se comuniquem.' },
        { q: 'Neutralidade de rede trata principalmente de...', opts: ['Cor dos cabos', 'Tratamento isonômico do tráfego por provedores', 'Compressão de imagem', 'Quantidade de roteadores'], answer: 1, explain: 'O princípio evita discriminação de tráfego por conteúdo/origem.' },
        { q: 'A evolução da internet para nuvem e edge computing reflete...', opts: ['Centralização absoluta em um único servidor', 'Distribuição de processamento conforme latência e escala', 'Fim dos protocolos', 'Substituição de DNS por arquivos locais'], answer: 1, explain: 'Arquiteturas modernas combinam nuvem e borda para desempenho e escala.' },
        { q: 'Em que ano a ARPANET fez sua primeira conexão entre computadores?', opts: ['1969', '1983', '1991', '1957'], answer: 0, explain: 'Em outubro de 1969, a UCLA e o Stanford Research Institute trocaram a primeira mensagem.' },
        { q: 'O que foi a "bolha das pontocom", por volta de 2000?', opts: ['Uma onda de especulação com empresas de internet que terminou em forte queda das ações', 'Um vírus de computador', 'O lançamento do primeiro smartphone', 'A criação do protocolo DNS'], answer: 0, explain: 'Muitas empresas de internet foram supervalorizadas e quebraram quando a bolha estourou.' }
      ]
    },
    historia_linguagens: {
      easy: [
        { q: 'FORTRAN é historicamente relevante por ser...', opts: ['Primeiro banco de dados', 'Uma das primeiras linguagens de alto nível amplamente usadas', 'Primeiro navegador', 'Primeiro sistema operacional gráfico'], answer: 1, explain: 'FORTRAN marcou o início do uso amplo de linguagens de alto nível.' },
        { q: 'A linguagem C influenciou fortemente...', opts: ['Apenas planilhas', 'Diversas linguagens modernas e sistemas operacionais', 'Somente design web', 'Redes sociais exclusivamente'], answer: 1, explain: 'C influenciou sintaxe e conceitos de muitas linguagens posteriores.' },
        { q: 'Python foi criado por...', opts: ['Guido van Rossum', 'Tim Berners-Lee', 'Bjarne Stroustrup', 'James Gosling'], answer: 0, explain: 'Guido van Rossum iniciou o desenvolvimento do Python.' },
        { q: 'Qual linguagem foi criada por James Gosling na Sun Microsystems?', opts: ['Java', 'Python', 'C', 'Ruby'], answer: 0, explain: 'O Java foi lançado em 1995 pela Sun Microsystems.' },
        { q: 'COBOL foi criada principalmente para aplicações...', opts: ['Comerciais e administrativas', 'De jogos 3D', 'De páginas web', 'De inteligência artificial'], answer: 0, explain: 'COBOL (1959) mira processamento de dados de negócios e ainda roda em bancos e governos.' }
      ],
      medium: [
        { q: 'Uma vantagem de linguagens de alto nível sobre baixo nível é...', opts: ['Menor legibilidade', 'Maior produtividade e abstração', 'Ausência total de desempenho', 'Impossibilidade de depurar'], answer: 1, explain: 'Alto nível acelera desenvolvimento ao abstrair detalhes de hardware.' },
        { q: 'Java popularizou a ideia de...', opts: ['Código só para um sistema', 'Portabilidade com “write once, run anywhere”', 'Programação sem classes', 'Web sem scripts'], answer: 1, explain: 'A JVM permitiu executar Java em múltiplas plataformas.' },
        { q: 'JavaScript se tornou central na web por...', opts: ['Rodar apenas no servidor originalmente', 'Permitir interatividade no navegador', 'Substituir HTML e CSS completamente', 'Excluir necessidade de APIs'], answer: 1, explain: 'JS habilitou interfaces dinâmicas no cliente web.' },
        { q: 'JavaScript foi criado em 1995 por Brendan Eich, na empresa...', opts: ['Netscape', 'Microsoft', 'Google', 'Apple'], answer: 0, explain: 'A primeira versão foi feita em poucos dias para o navegador Netscape.' },
        { q: 'C++ foi criado por Bjarne Stroustrup como uma extensão de C que adicionou...', opts: ['Orientação a objetos (classes)', 'Coleta de lixo obrigatória', 'Tipagem dinâmica', 'Indentação significativa'], answer: 0, explain: 'O nome original era "C com Classes".' }
      ],
      hard: [
        { q: 'Evolução de linguagens mostra que paradigmas...', opts: ['São imutáveis', 'Coexistem e se combinam conforme o problema', 'Só o imperativo importa', 'Eliminam necessidade de algoritmos'], answer: 1, explain: 'Hoje é comum linguagens suportarem múltiplos paradigmas.' },
        { q: 'Gerenciamento automático de memória (GC) impacta principalmente...', opts: ['Apenas visual do app', 'Produtividade e segurança, com trade-offs de desempenho', 'Formato de URL', 'Versão do navegador'], answer: 1, explain: 'GC reduz erros de memória, mas exige decisões de runtime.' },
        { q: 'Comunidades open source influenciam linguagens ao...', opts: ['Impedir evolução', 'Evoluir bibliotecas, ferramentas e padrões de uso', 'Excluir documentação', 'Remover compatibilidade'], answer: 1, explain: 'Ecossistema comunitário acelera inovação e adoção de boas práticas.' },
        { q: 'LISP, criada por John McCarthy em 1958, ficou associada a qual área?', opts: ['Inteligência artificial', 'Bancos de dados', 'Design gráfico', 'Redes de computadores'], answer: 0, explain: 'McCarthy, que cunhou o termo "inteligência artificial", usou LISP em pesquisas da área por décadas.' },
        { q: 'O que caracteriza a linguagem assembly?', opts: ['Usar mnemônicos que correspondem quase diretamente às instruções do processador', 'Ser a linguagem de mais alto nível', 'Funcionar igual em qualquer processador', 'Dispensar o uso de memória'], answer: 0, explain: 'Cada arquitetura tem seu assembly, com instruções como MOV e ADD.' }
      ]
    }
  },
  assuntos_gerais: {
    curiosidades_mundo: {
      easy: [
        { q: 'Qual animal é famoso por ter três corações?', opts: ['Polvo', 'Girafa', 'Pinguim', 'Golfinho'], answer: 0, explain: 'O polvo tem três corações: dois ajudam a bombear sangue para as brânquias e um para o resto do corpo.' },
        { q: 'Qual monumento de Paris foi construído para a Exposição Universal de 1889?', opts: ['Arco do Triunfo', 'Museu do Louvre', 'Torre Eiffel', 'Catedral de Notre-Dame'], answer: 2, explain: 'A Torre Eiffel foi erguida para a Exposição Universal de 1889 e se tornou um dos maiores símbolos da França.' },
        { q: 'Qual continente reúne o maior número de países reconhecidos?', opts: ['Europa', 'África', 'Ásia', 'América do Sul'], answer: 1, explain: 'A África concentra o maior número de países reconhecidos internacionalmente, com mais de 50 nações.' },
        { q: 'Qual alimento natural é famoso por durar muito tempo sem estragar quando bem armazenado?', opts: ['Leite', 'Mel', 'Pão', 'Banana'], answer: 1, explain: 'O mel tem baixa umidade e características naturais que dificultam a proliferação de micro-organismos.' },
        { q: 'Qual é o maior oceano da Terra?', opts: ['Atlântico', 'Índico', 'Ártico', 'Pacífico'], answer: 3, explain: 'O Oceano Pacífico é o maior do planeta, cobrindo uma área imensa entre Ásia, Oceania e Américas.' },
        { q: 'Qual é o animal terrestre mais rápido do mundo?', opts: ['Leão', 'Guepardo', 'Cavalo', 'Gazela'], answer: 1, explain: 'O guepardo passa de 100 km/h em arrancadas curtas, mais do que qualquer outro animal terrestre.' },
        { q: 'Quantas cores tem o arco-íris na divisão tradicional?', opts: ['5', '6', '7', '9'], answer: 2, explain: 'Pela divisão tradicional, o arco-íris tem sete cores: vermelho, laranja, amarelo, verde, azul, anil e violeta.' },
        { q: 'Qual é o maior mamífero do planeta?', opts: ['Elefante-africano', 'Baleia-azul', 'Girafa', 'Tubarão-baleia'], answer: 1, explain: 'A baleia-azul pode passar de 30 metros de comprimento. O tubarão-baleia é enorme, mas é um peixe.' },
        { q: 'Qual é a montanha mais alta do mundo acima do nível do mar?', opts: ['K2', 'Aconcágua', 'Monte Everest', 'Kilimanjaro'], answer: 2, explain: 'O Monte Everest, no Himalaia, tem cerca de 8.849 metros e fica na fronteira entre o Nepal e a China.' },
        { q: 'Quantas patas tem uma aranha?', opts: ['6', '8', '10', '12'], answer: 1, explain: 'Aranhas são aracnídeos e têm oito patas. Os insetos, como formigas e besouros, têm seis.' }
      ],
      medium: [
        { q: 'Por que a Estátua da Liberdade tem cor esverdeada hoje?', opts: ['Foi pintada de verde', 'É feita de bronze pintado', 'O cobre oxidou com o tempo', 'Mudou de cor por causa da chuva ácida'], answer: 2, explain: 'A camada externa da estátua é de cobre. Com o tempo, o metal oxidou e formou a coloração esverdeada.' },
        { q: 'De onde vem o nome "sanduíche"?', opts: ['De um cozinheiro francês', 'Do conde de Sandwich', 'De uma cidade italiana', 'De um festival inglês'], answer: 1, explain: 'O nome ficou associado ao conde de Sandwich, que teria pedido carne entre fatias de pão para comer sem interromper o jogo.' },
        { q: 'Qual fruta é conhecida por ter as sementes na parte externa?', opts: ['Uva', 'Morango', 'Maçã', 'Laranja'], answer: 1, explain: 'O morango é famoso por ter pequenas estruturas em sua superfície externa que parecem sementes.' },
        { q: 'O que é a chamada "ilusão da Lua"?', opts: ['A Lua muda de cor todo mês', 'A Lua parece maior perto do horizonte', 'A Lua some em noites frias', 'A Lua fica mais próxima da Terra no inverno'], answer: 1, explain: 'A ilusão da Lua é um efeito visual em que ela parece maior quando está próxima ao horizonte, embora o tamanho aparente real quase não mude.' },
        { q: 'Qual é o único mamífero capaz de voar batendo as asas?', opts: ['Esquilo-voador', 'Morcego', 'Petauro', 'Colugo'], answer: 1, explain: 'O morcego é o único mamífero com voo ativo. Esquilos-voadores, petauros e colugos apenas planam.' },
        { q: 'Qual metal fica líquido em temperatura ambiente?', opts: ['Mercúrio', 'Chumbo', 'Alumínio', 'Estanho'], answer: 0, explain: 'O mercúrio é o metal que permanece líquido em temperatura ambiente, por isso já foi muito usado em termômetros.' },
        { q: 'Qual língua tem o maior número de falantes nativos no mundo?', opts: ['Inglês', 'Espanhol', 'Mandarim', 'Hindi'], answer: 2, explain: 'O chinês mandarim lidera em falantes nativos. O inglês só fica à frente quando se somam os falantes de segunda língua.' },
        { q: 'Por que os flamingos costumam ter a plumagem rosada?', opts: ['Por causa do sol forte', 'Por pigmentos presentes na alimentação', 'Por uma doença comum na espécie', 'Porque já nascem cor-de-rosa'], answer: 1, explain: 'Algas e pequenos crustáceos que os flamingos comem têm carotenoides, pigmentos que deixam as penas rosadas. Os filhotes nascem acinzentados.' },
        { q: 'Qual país é o maior produtor de café do mundo?', opts: ['Colômbia', 'Vietnã', 'Brasil', 'Etiópia'], answer: 2, explain: 'O Brasil lidera a produção mundial de café há mais de um século e responde por cerca de um terço da colheita do planeta.' }
      ],
      hard: [
        { q: 'Qual papa promulgou o calendário gregoriano em 1582?', opts: ['Leão X', 'Gregório XIII', 'Inocêncio III', 'Júlio II'], answer: 1, explain: 'O calendário gregoriano recebeu esse nome porque foi promulgado pelo papa Gregório XIII para corrigir defasagens do calendário juliano.' },
        { q: 'Como se chama a técnica japonesa de reparar cerâmica com ouro?', opts: ['Origami', 'Kintsugi', 'Ikebana', 'Shibori'], answer: 1, explain: 'Kintsugi é a arte de reparar peças quebradas com laca e pó de ouro, valorizando a história do objeto.' },
        { q: 'Qual cidade já foi chamada de Bizâncio e depois Constantinopla?', opts: ['Atenas', 'Istambul', 'Alexandria', 'Cartago'], answer: 1, explain: 'A atual Istambul já foi conhecida como Bizâncio e Constantinopla em diferentes períodos históricos.' },
        { q: 'Qual país tem mais fusos horários quando se contam seus territórios ultramarinos?', opts: ['Rússia', 'Estados Unidos', 'França', 'China'], answer: 2, explain: 'Somando territórios espalhados por vários oceanos, a França chega a 12 fusos horários. A Rússia tem 11 em território contínuo.' },
        { q: 'Qual das Sete Maravilhas do Mundo Antigo ainda está de pé?', opts: ['Farol de Alexandria', 'Jardins Suspensos da Babilônia', 'Colosso de Rodes', 'Grande Pirâmide de Gizé'], answer: 3, explain: 'A Grande Pirâmide de Gizé é a mais antiga das Sete Maravilhas e a única que resistiu até hoje.' },
        { q: 'Como se chama o ponto mais profundo conhecido dos oceanos?', opts: ['Fossa de Porto Rico', 'Abismo Challenger', 'Fossa de Java', 'Fossa de Tonga'], answer: 1, explain: 'O Abismo Challenger fica na Fossa das Marianas, no Pacífico, e tem cerca de 11 mil metros de profundidade.' },
        { q: 'A bandeira de qual país é tradicionalmente considerada a mais antiga ainda em uso contínuo?', opts: ['Dinamarca', 'Reino Unido', 'Japão', 'Portugal'], answer: 0, explain: 'A Dannebrog, cruz branca sobre fundo vermelho da Dinamarca, é tradicionalmente apontada como a bandeira nacional mais antiga em uso contínuo.' },
        { q: 'Qual é o único país cuja bandeira nacional não é retangular nem quadrada?', opts: ['Butão', 'Nepal', 'Suíça', 'Catar'], answer: 1, explain: 'A bandeira do Nepal é formada por dois triângulos sobrepostos. Suíça e Vaticano têm bandeiras quadradas; as demais são retangulares.' }
      ]
    },
    historia_geral: {
      easy: [
        { q: 'As pirâmides de Gizé foram construídas por qual civilização antiga?', opts: ['Romana', 'Egípcia', 'Maia', 'Persa'], answer: 1, explain: 'As pirâmides de Gizé são obras do Egito Antigo e estão entre os monumentos mais famosos da humanidade.' },
        { q: 'Em que ano começou a Revolução Francesa?', opts: ['1492', '1789', '1914', '1945'], answer: 1, explain: 'A Revolução Francesa começou em 1789 e transformou profundamente a política e a sociedade europeia.' },
        { q: 'Qual muro caiu em 1989 e virou símbolo do fim da Guerra Fria?', opts: ['Muro de Adriano', 'Muro da China', 'Muro de Berlim', 'Muro das Lamentações'], answer: 2, explain: 'A queda do Muro de Berlim em 1989 marcou o enfraquecimento do bloco soviético e o fim de uma era.' },
        { q: 'Qual líder ficou conhecido pela defesa da não violência na luta pela independência da Índia?', opts: ['Nelson Mandela', 'Mahatma Gandhi', 'Winston Churchill', 'Napoleão Bonaparte'], answer: 1, explain: 'Mahatma Gandhi se tornou símbolo da resistência não violenta e da independência indiana.' },
        { q: 'Qual líder sul-africano passou 27 anos preso e depois se tornou presidente?', opts: ['Desmond Tutu', 'Nelson Mandela', 'Che Guevara', 'Fidel Castro'], answer: 1, explain: 'Nelson Mandela passou 27 anos preso durante o apartheid e depois liderou a África do Sul em uma transição histórica.' },
        { q: 'Em que ano a expedição de Cristóvão Colombo chegou à América?', opts: ['1492', '1500', '1453', '1588'], answer: 0, explain: 'Em 12 de outubro de 1492, a expedição de Colombo, financiada pelos reis da Espanha, chegou às ilhas do Caribe.' },
        { q: 'Quem foi o primeiro ser humano a pisar na Lua?', opts: ['Yuri Gagarin', 'Buzz Aldrin', 'Neil Armstrong', 'Michael Collins'], answer: 2, explain: 'Neil Armstrong pisou na Lua em 20 de julho de 1969, na missão Apollo 11. Buzz Aldrin desceu logo depois.' },
        { q: 'Qual civilização antiga criou os Jogos Olímpicos?', opts: ['Romana', 'Grega', 'Egípcia', 'Persa'], answer: 1, explain: 'Os Jogos Olímpicos surgiram em Olímpia, na Grécia Antiga, e a tradição registra a primeira edição em 776 a.C.' },
        { q: 'Qual guerra mundial terminou em 1945?', opts: ['Primeira Guerra Mundial', 'Segunda Guerra Mundial', 'Guerra Fria', 'Guerra dos Cem Anos'], answer: 1, explain: 'A Segunda Guerra Mundial durou de 1939 a 1945 e foi o conflito mais destrutivo da história.' },
        { q: 'Em que ano o Brasil proclamou sua independência de Portugal?', opts: ['1500', '1822', '1889', '1922'], answer: 1, explain: 'Em 7 de setembro de 1822, D. Pedro proclamou a independência às margens do riacho Ipiranga, em São Paulo.' }
      ],
      medium: [
        { q: 'Qual evento de 1453 costuma ser usado para marcar o fim da Idade Média?', opts: ['A descoberta da América', 'A queda de Constantinopla', 'A Revolução Francesa', 'A independência dos EUA'], answer: 1, explain: 'A queda de Constantinopla para os otomanos, em 1453, é um marco tradicional do fim da Idade Média.' },
        { q: 'O que foi a Pax Romana?', opts: ['Uma guerra civil em Roma', 'Um período de relativa paz e estabilidade no Império Romano', 'Uma lei religiosa da Roma Antiga', 'A divisão final do império em dois'], answer: 1, explain: 'Pax Romana foi um longo período de relativa estabilidade política e expansão administrativa no Império Romano.' },
        { q: 'Qual encontro de 1884-1885 ficou associado à partilha da África entre potências europeias?', opts: ['Congresso de Viena', 'Conferência de Berlim', 'Tratado de Versalhes', 'Conferência de Yalta'], answer: 1, explain: 'A Conferência de Berlim reuniu potências europeias e influenciou a divisão colonial de territórios africanos.' },
        { q: 'Qual líder se tornou símbolo da revolução do Haiti e da luta contra a escravidão?', opts: ['Simón Bolívar', 'Toussaint Louverture', 'Pancho Villa', 'José Martí'], answer: 1, explain: 'Toussaint Louverture foi uma das figuras centrais da Revolução Haitiana e da resistência contra o sistema escravista.' },
        { q: 'Quem foi o primeiro imperador de Roma?', opts: ['Júlio César', 'Augusto', 'Nero', 'Constantino'], answer: 1, explain: 'Otaviano recebeu o título de Augusto em 27 a.C. e se tornou o primeiro imperador. Júlio César nunca chegou a ser imperador.' },
        { q: 'Qual navegador português chegou à Índia por mar contornando a África, em 1498?', opts: ['Pedro Álvares Cabral', 'Vasco da Gama', 'Bartolomeu Dias', 'Fernão de Magalhães'], answer: 1, explain: 'Vasco da Gama chegou a Calicute em 1498, abrindo a rota marítima entre a Europa e a Índia.' },
        { q: 'Quem desenvolveu, por volta de 1450, a prensa de tipos móveis que revolucionou a impressão na Europa?', opts: ['Johannes Gutenberg', 'Leonardo da Vinci', 'Galileu Galilei', 'Martinho Lutero'], answer: 0, explain: 'A prensa de Gutenberg barateou a produção de livros e acelerou a circulação de ideias pela Europa.' },
        { q: 'A Guerra Fria foi uma disputa política e ideológica principalmente entre quais potências?', opts: ['Reino Unido e França', 'Estados Unidos e União Soviética', 'China e Japão', 'Alemanha e Itália'], answer: 1, explain: 'Estados Unidos e União Soviética disputaram influência no mundo entre o fim da Segunda Guerra e 1991, sem um confronto direto entre os dois.' },
        { q: 'Qual imperador francês foi derrotado na Batalha de Waterloo, em 1815?', opts: ['Luís XIV', 'Napoleão Bonaparte', 'Carlos Magno', 'Luís XVI'], answer: 1, explain: 'Napoleão foi vencido em Waterloo, na atual Bélgica, por britânicos e prussianos e passou o resto da vida exilado na ilha de Santa Helena.' }
      ],
      hard: [
        { q: 'Qual documento inglês de 1215 limitou o poder do rei e influenciou o constitucionalismo?', opts: ['Bill of Rights', 'Magna Carta', 'Código Napoleônico', 'Petição de Direito'], answer: 1, explain: 'A Magna Carta, assinada em 1215, limitou o poder real e se tornou referência histórica para liberdades e garantias legais.' },
        { q: 'Qual império tinha sua capital em Tenochtitlán?', opts: ['Inca', 'Asteca', 'Bizantino', 'Mongol'], answer: 1, explain: 'Tenochtitlán foi a capital do Império Asteca e ficava na região onde hoje está a Cidade do México.' },
        { q: 'Como ficou conhecida a política de abertura promovida por Mikhail Gorbachev na União Soviética?', opts: ['Perestroika', 'Glasnost', 'Cortina de Ferro', 'Coexistência Pacífica'], answer: 1, explain: 'Glasnost significa abertura e transparência política, enquanto Perestroika se relaciona mais à reestruturação econômica e administrativa.' },
        { q: 'Qual tratado de 1494 dividiu entre Portugal e Espanha as terras descobertas e por descobrir?', opts: ['Tratado de Madri', 'Tratado de Tordesilhas', 'Tratado de Utrecht', 'Tratado de Zamora'], answer: 1, explain: 'O Tratado de Tordesilhas traçou uma linha imaginária: as terras a oeste ficariam com a Espanha e as a leste com Portugal.' },
        { q: 'Durante qual dinastia chinesa foi construída a maior parte da Grande Muralha que se vê hoje?', opts: ['Dinastia Qin', 'Dinastia Han', 'Dinastia Ming', 'Dinastia Tang'], answer: 2, explain: 'As primeiras muralhas são bem mais antigas, mas os trechos mais conhecidos e preservados foram erguidos pela dinastia Ming, entre os séculos XIV e XVII.' },
        { q: 'Qual líder fundou o Império Mongol no início do século XIII?', opts: ['Kublai Khan', 'Gengis Khan', 'Tamerlão', 'Átila'], answer: 1, explain: 'Temujin foi proclamado Gengis Khan em 1206. O império que ele fundou se tornou o maior império contínuo da história.' },
        { q: 'Qual povo da Mesopotâmia desenvolveu a escrita cuneiforme, uma das mais antigas conhecidas?', opts: ['Egípcios', 'Sumérios', 'Fenícios', 'Hititas'], answer: 1, explain: 'Por volta de 3200 a.C., os sumérios marcavam sinais em forma de cunha em tabuletas de argila.' },
        { q: 'Qual faraó teve a tumba encontrada quase intacta por Howard Carter em 1922?', opts: ['Ramsés II', 'Quéops', 'Tutancâmon', 'Akhenaton'], answer: 2, explain: 'A tumba de Tutancâmon, no Vale dos Reis, guardava milhares de objetos, entre eles a famosa máscara funerária de ouro.' }
      ]
    },
    geografia_culturas: {
      easy: [
        { q: 'Qual país é frequentemente lembrado pelo formato de "bota" em seu mapa?', opts: ['Portugal', 'Itália', 'Grécia', 'Croácia'], answer: 1, explain: 'A Itália é famosa pelo contorno geográfico que lembra uma bota no mapa europeu.' },
        { q: 'Qual linha imaginária divide a Terra em hemisfério Norte e hemisfério Sul?', opts: ['Trópico de Câncer', 'Meridiano de Greenwich', 'Linha do Equador', 'Círculo Polar Ártico'], answer: 2, explain: 'A Linha do Equador divide o planeta em hemisfério Norte e hemisfério Sul.' },
        { q: 'Em qual continente fica o deserto do Saara?', opts: ['Ásia', 'África', 'América do Norte', 'Oceania'], answer: 1, explain: 'O Saara fica na África e é um dos desertos mais conhecidos do mundo.' },
        { q: 'Em qual país fica Machu Picchu?', opts: ['México', 'Peru', 'Chile', 'Bolívia'], answer: 1, explain: 'Machu Picchu está localizada no Peru e é um dos sítios arqueológicos mais famosos da civilização inca.' },
        { q: 'Qual festa tradicional mexicana é marcada por altares coloridos e homenagens aos mortos?', opts: ['Cinco de Mayo', 'Día de los Muertos', 'San Fermín', 'Carnaval de Barranquilla'], answer: 1, explain: 'O Día de los Muertos é uma tradição mexicana que celebra a memória de familiares e amigos com altares e símbolos coloridos.' },
        { q: 'Qual é o maior país do mundo em área territorial?', opts: ['Canadá', 'China', 'Estados Unidos', 'Rússia'], answer: 3, explain: 'A Rússia tem mais de 17 milhões de km² e se estende pela Europa e pela Ásia.' },
        { q: 'Qual é a capital do Japão?', opts: ['Pequim', 'Seul', 'Tóquio', 'Bangcoc'], answer: 2, explain: 'Tóquio é a capital do Japão e forma uma das maiores regiões metropolitanas do mundo.' },
        { q: 'Qual rio é o maior do mundo em volume de água?', opts: ['Rio Nilo', 'Rio Amazonas', 'Rio São Francisco', 'Rio Paraná'], answer: 1, explain: 'O Amazonas despeja no oceano mais água do que qualquer outro rio e disputa com o Nilo o título de mais extenso.' },
        { q: 'Qual é a capital da França?', opts: ['Lyon', 'Paris', 'Marselha', 'Nice'], answer: 1, explain: 'Paris é a capital e a maior cidade da França, cortada pelo rio Sena.' },
        { q: 'Qual é o país mais populoso da América do Sul?', opts: ['Argentina', 'Colômbia', 'Brasil', 'Peru'], answer: 2, explain: 'Com mais de 200 milhões de habitantes, o Brasil concentra cerca de metade da população sul-americana.' }
      ],
      medium: [
        { q: 'O que é um arquipélago?', opts: ['Uma floresta tropical fechada', 'Um conjunto de ilhas', 'Uma montanha vulcânica isolada', 'Um rio que atravessa vários países'], answer: 1, explain: 'Arquipélago é um conjunto de ilhas próximas entre si, como acontece em várias regiões do mundo.' },
        { q: 'Qual é a menor nação do mundo em área territorial?', opts: ['Mônaco', 'Malta', 'Vaticano', 'Luxemburgo'], answer: 2, explain: 'O Vaticano é o menor Estado soberano do mundo em área territorial.' },
        { q: 'Em qual país o tango se tornou um símbolo cultural ligado a Buenos Aires?', opts: ['Uruguai', 'Espanha', 'Argentina', 'Cuba'], answer: 2, explain: 'O tango está fortemente associado à Argentina, especialmente à cidade de Buenos Aires.' },
        { q: 'O que são fiordes?', opts: ['Rios subterrâneos', 'Planícies congeladas', 'Entradas estreitas do mar entre montanhas', 'Ilhas artificiais ligadas por pontes'], answer: 2, explain: 'Fiordes são entradas do mar cercadas por encostas íngremes, muito comuns em regiões moldadas por geleiras.' },
        { q: 'Segundo estimativas da ONU, qual país passou a ser o mais populoso do mundo em 2023?', opts: ['China', 'Índia', 'Estados Unidos', 'Indonésia'], answer: 1, explain: 'Em 2023, as estimativas da ONU apontaram que a Índia ultrapassou a China em número de habitantes.' },
        { q: 'Em qual país fica Petra, a cidade histórica esculpida em rocha rosada?', opts: ['Egito', 'Jordânia', 'Turquia', 'Marrocos'], answer: 1, explain: 'Petra fica na Jordânia e foi a capital dos nabateus, que esculpiram templos e túmulos direto nos paredões de arenito.' },
        { q: 'Qual é a cordilheira mais extensa do mundo, ao longo do oeste da América do Sul?', opts: ['Himalaia', 'Alpes', 'Andes', 'Montanhas Rochosas'], answer: 2, explain: 'Os Andes se estendem por cerca de 7 mil km, da Venezuela até a Patagônia.' },
        { q: 'Qual é o rio mais longo da Europa?', opts: ['Danúbio', 'Reno', 'Volga', 'Tâmisa'], answer: 2, explain: 'O Volga corre cerca de 3.500 km pela Rússia até o mar Cáspio. O Danúbio, segundo colocado, tem uns 2.850 km.' },
        { q: 'Em qual país ficam as cidades de Marrakech e Casablanca?', opts: ['Egito', 'Tunísia', 'Marrocos', 'Argélia'], answer: 2, explain: 'Marrakech e Casablanca ficam no Marrocos, no noroeste da África. A capital do país é Rabat.' }
      ],
      hard: [
        { q: 'Qual estreito separa a Ásia da América do Norte?', opts: ['Estreito de Gibraltar', 'Estreito de Bering', 'Canal de Suez', 'Estreito de Malaca'], answer: 1, explain: 'O Estreito de Bering separa o extremo leste da Ásia do extremo oeste da América do Norte.' },
        { q: 'Qual mar interior encolheu drasticamente no século XX por causa do desvio de rios para irrigação?', opts: ['Mar Cáspio', 'Mar Negro', 'Mar de Aral', 'Mar Vermelho'], answer: 2, explain: 'O Mar de Aral perdeu grande parte de sua área após projetos de irrigação que desviaram rios que o abasteciam.' },
        { q: 'Qual é a capital da Mongólia?', opts: ['Astana', 'Tashkent', 'Ulan Bator', 'Katmandu'], answer: 2, explain: 'Ulan Bator é a capital da Mongólia e concentra boa parte da população do país.' },
        { q: 'Qual país africano é totalmente cercado pelo território da África do Sul?', opts: ['Essuatíni', 'Lesoto', 'Botsuana', 'Namíbia'], answer: 1, explain: 'O Lesoto é um enclave dentro da África do Sul. Essuatíni também faz fronteira com Moçambique.' },
        { q: 'Qual é a capital da Austrália?', opts: ['Sydney', 'Melbourne', 'Camberra', 'Perth'], answer: 2, explain: 'Camberra foi planejada para ser a capital e encerrar a disputa entre Sydney e Melbourne pelo posto.' },
        { q: 'Qual é o lago mais profundo do mundo?', opts: ['Lago Vitória', 'Lago Superior', 'Lago Baikal', 'Lago Titicaca'], answer: 2, explain: 'O Baikal, na Sibéria, passa de 1.600 metros de profundidade e guarda cerca de um quinto da água doce em superfície do planeta.' },
        { q: 'Qual é a capital do Canadá?', opts: ['Toronto', 'Vancouver', 'Ottawa', 'Montreal'], answer: 2, explain: 'Ottawa, na província de Ontário, é a capital do Canadá, embora Toronto seja a maior cidade do país.' },
        { q: 'Qual é o ponto mais alto do Brasil?', opts: ['Pico da Bandeira', 'Pico da Neblina', 'Monte Roraima', 'Pico das Agulhas Negras'], answer: 1, explain: 'O Pico da Neblina, no Amazonas, perto da fronteira com a Venezuela, tem cerca de 2.995 metros de altitude.' }
      ]
    },
    ciencia_espaco: {
      easy: [
        { q: 'Qual é o maior planeta do Sistema Solar?', opts: ['Saturno', 'Marte', 'Júpiter', 'Netuno'], answer: 2, explain: 'Júpiter é o maior planeta do Sistema Solar, com massa muito superior à da Terra.' },
        { q: 'Qual gás as plantas absorvem principalmente para realizar fotossíntese?', opts: ['Oxigênio', 'Dióxido de carbono', 'Hidrogênio', 'Hélio'], answer: 1, explain: 'Na fotossíntese, as plantas absorvem dióxido de carbono e usam a luz para produzir energia química.' },
        { q: 'Qual força física nos mantém sobre o chão?', opts: ['Atrito', 'Gravidade', 'Magnetismo', 'Pressão'], answer: 1, explain: 'A gravidade é a força que atrai os corpos em direção ao centro da Terra.' },
        { q: 'Qual estrela está no centro do Sistema Solar?', opts: ['Sírius', 'Alpha Centauri', 'Sol', 'Betelgeuse'], answer: 2, explain: 'O Sol é a estrela central do Sistema Solar e a principal fonte de energia para a Terra.' },
        { q: 'Qual instrumento é usado para observar astros distantes com mais detalhe?', opts: ['Microscópio', 'Telescópio', 'Barômetro', 'Termômetro'], answer: 1, explain: 'O telescópio ajuda a observar planetas, estrelas e galáxias com mais ampliação e precisão.' },
        { q: 'Qual planeta é conhecido como Planeta Vermelho?', opts: ['Vênus', 'Marte', 'Mercúrio', 'Júpiter'], answer: 1, explain: 'Marte tem a superfície coberta por óxido de ferro, a mesma substância da ferrugem, o que lhe dá o tom avermelhado.' },
        { q: 'Em qual estado físico a água está quando vira gelo?', opts: ['Líquido', 'Gasoso', 'Sólido', 'Plasma'], answer: 2, explain: 'Abaixo de 0 °C, ao nível do mar, a água congela e passa para o estado sólido.' },
        { q: 'Qual órgão bombeia o sangue pelo corpo humano?', opts: ['Coração', 'Pulmão', 'Fígado', 'Estômago'], answer: 0, explain: 'O coração é um músculo que se contrai sem parar para levar o sangue a todo o corpo.' },
        { q: 'Quantos planetas existem no Sistema Solar?', opts: ['7', '8', '9', '10'], answer: 1, explain: 'São oito planetas. Desde 2006, Plutão é classificado como planeta-anão.' },
        { q: 'Qual é a fórmula química da água?', opts: ['CO2', 'H2O', 'O2', 'NaCl'], answer: 1, explain: 'Cada molécula de água tem dois átomos de hidrogênio ligados a um átomo de oxigênio: H2O.' }
      ],
      medium: [
        { q: 'O que a escala Richter mede?', opts: ['Velocidade do vento', 'Magnitude dos terremotos', 'Intensidade da luz solar', 'Profundidade do oceano'], answer: 1, explain: 'A escala Richter ficou conhecida por medir a magnitude dos terremotos, indicando a energia liberada.' },
        { q: 'O que é o DNA?', opts: ['Um órgão do corpo humano', 'Uma molécula que carrega informação genética', 'Uma estrela recém-formada', 'Um tipo de rocha vulcânica'], answer: 1, explain: 'O DNA armazena as instruções genéticas dos seres vivos e participa da hereditariedade.' },
        { q: 'Por que astronautas parecem flutuar em órbita?', opts: ['Porque não existe gravidade alguma no espaço', 'Porque estão em queda livre contínua ao redor da Terra', 'Porque usam roupas muito leves', 'Porque o ar da nave empurra seus corpos'], answer: 1, explain: 'Astronautas em órbita parecem flutuar porque a nave e tudo dentro dela estão em queda livre contínua ao redor da Terra.' },
        { q: 'O que é um ano-luz?', opts: ['O tempo que a Lua leva para orbitar a Terra', 'A distância que a luz percorre em um ano', 'O brilho emitido por uma estrela durante um ano', 'O tempo que a Terra leva para dar duas voltas no Sol'], answer: 1, explain: 'Ano-luz é uma unidade de distância usada em astronomia, não uma medida de tempo.' },
        { q: 'Qual é o planeta mais quente do Sistema Solar?', opts: ['Mercúrio', 'Vênus', 'Marte', 'Júpiter'], answer: 1, explain: 'A atmosfera densa de dióxido de carbono provoca um efeito estufa intenso em Vênus, que fica mais quente que Mercúrio mesmo estando mais longe do Sol.' },
        { q: 'Qual é a velocidade aproximada da luz no vácuo?', opts: ['300 mil km/s', '30 mil km/s', '3 mil km/s', '3 milhões de km/s'], answer: 0, explain: 'A luz viaja a cerca de 299.792 km por segundo no vácuo.' },
        { q: 'Qual é o símbolo químico do ouro?', opts: ['Ag', 'Au', 'Fe', 'Pb'], answer: 1, explain: 'Au vem do latim aurum. Ag é o símbolo da prata, Fe do ferro e Pb do chumbo.' },
        { q: 'Quantos ossos tem o esqueleto de um ser humano adulto?', opts: ['106', '186', '206', '306'], answer: 2, explain: 'O adulto tem 206 ossos. O bebê nasce com cerca de 300, e vários se fundem durante o crescimento.' },
        { q: 'Qual estrutura da célula é conhecida como a "usina de energia"?', opts: ['Ribossomo', 'Mitocôndria', 'Núcleo', 'Complexo de Golgi'], answer: 1, explain: 'A mitocôndria realiza a respiração celular e produz ATP, a principal fonte de energia da célula.' }
      ],
      hard: [
        { q: 'Em qual camada da atmosfera se concentra a maior parte do ozônio que protege a Terra?', opts: ['Troposfera', 'Mesosfera', 'Estratosfera', 'Termosfera'], answer: 2, explain: 'A camada de ozônio fica principalmente na estratosfera e ajuda a bloquear parte da radiação ultravioleta.' },
        { q: 'Como se chama a explosão de uma estrela que pode brilhar mais do que uma galáxia inteira por um período?', opts: ['Nebulosa', 'Supernova', 'Aurora', 'Eclipse'], answer: 1, explain: 'A supernova é uma explosão estelar extremamente energética, capaz de liberar enorme quantidade de luz e matéria.' },
        { q: 'O que é um exoplaneta?', opts: ['Um planeta localizado fora do Sistema Solar', 'Um planeta anão coberto por gelo', 'Um satélite natural muito grande', 'Um asteroide capturado por um planeta'], answer: 0, explain: 'Exoplaneta é qualquer planeta que orbita uma estrela que não seja o Sol.' },
        { q: 'Como se chama o limite ao redor de um buraco negro a partir do qual nem a luz consegue escapar?', opts: ['Horizonte de eventos', 'Heliopausa', 'Cinturão de Kuiper', 'Limite de Roche'], answer: 0, explain: 'Depois de cruzar o horizonte de eventos, nada escapa da gravidade do buraco negro, nem mesmo a luz.' },
        { q: 'Qual elemento químico é o mais abundante no universo?', opts: ['Oxigênio', 'Hélio', 'Hidrogênio', 'Carbono'], answer: 2, explain: 'O hidrogênio responde por cerca de três quartos da massa da matéria comum do universo e é o principal combustível das estrelas.' },
        { q: 'Qual é a grande galáxia espiral mais próxima da Via Láctea, que está se aproximando de nós?', opts: ['Galáxia do Triângulo', 'Galáxia de Andrômeda', 'Grande Nuvem de Magalhães', 'Galáxia Sombrero'], answer: 1, explain: 'Andrômeda fica a cerca de 2,5 milhões de anos-luz e se aproxima da Via Láctea. As duas podem se fundir daqui a bilhões de anos.' },
        { q: 'Qual planeta gira praticamente "deitado", com o eixo inclinado cerca de 98 graus?', opts: ['Netuno', 'Urano', 'Saturno', 'Vênus'], answer: 1, explain: 'Urano tem o eixo tão inclinado que parece rolar em sua órbita, provavelmente por causa de uma grande colisão no passado.' },
        { q: 'Qual cientista descobriu a penicilina em 1928?', opts: ['Louis Pasteur', 'Alexander Fleming', 'Marie Curie', 'Robert Koch'], answer: 1, explain: 'Alexander Fleming percebeu que um fungo do gênero Penicillium matava bactérias em suas placas de cultura, abrindo caminho para os antibióticos.' }
      ]
    },
    artes_entretenimento: {
      easy: [
        { q: 'Quem pintou a Mona Lisa?', opts: ['Vincent van Gogh', 'Leonardo da Vinci', 'Pablo Picasso', 'Claude Monet'], answer: 1, explain: 'A Mona Lisa foi pintada por Leonardo da Vinci e é uma das obras mais famosas da história da arte.' },
        { q: 'Em qual arte o público assiste a atores se apresentando ao vivo em um palco?', opts: ['Cinema', 'Teatro', 'Fotografia', 'Escultura'], answer: 1, explain: 'No teatro, a performance acontece ao vivo diante da plateia.' },
        { q: 'Qual estilo musical nasceu em Nova Orleans e ficou famoso pela improvisação?', opts: ['Ópera', 'Jazz', 'Reggae', 'Flamenco'], answer: 1, explain: 'O jazz se desenvolveu em Nova Orleans e se tornou conhecido pela improvisação e pela riqueza rítmica.' },
        { q: 'Qual instrumento costuma ter 88 teclas na versão clássica?', opts: ['Violino', 'Piano', 'Flauta', 'Tambor'], answer: 1, explain: 'O piano tradicional tem 88 teclas, distribuídas entre notas graves e agudas.' },
        { q: 'Como se chama a narrativa que combina imagens em sequência e balões de fala?', opts: ['História em quadrinhos', 'Sinfonia', 'Performance', 'Curta-metragem'], answer: 0, explain: 'Histórias em quadrinhos contam narrativas por meio de desenhos em sequência, texto e balões.' },
        { q: 'Quem escreveu a peça "Romeu e Julieta"?', opts: ['Machado de Assis', 'William Shakespeare', 'Charles Dickens', 'Molière'], answer: 1, explain: 'Romeu e Julieta é uma tragédia de William Shakespeare, escrita no fim do século XVI.' },
        { q: 'Qual pintor holandês criou o quadro "A Noite Estrelada"?', opts: ['Rembrandt', 'Vincent van Gogh', 'Johannes Vermeer', 'Piet Mondrian'], answer: 1, explain: 'Van Gogh pintou A Noite Estrelada em 1889, com o céu em pinceladas espirais que se tornaram sua marca.' },
        { q: 'Qual personagem de Mauricio de Sousa usa vestido vermelho e carrega um coelhinho de pelúcia?', opts: ['Magali', 'Mônica', 'Cascão', 'Cebolinha'], answer: 1, explain: 'Mônica dá nome à Turma da Mônica e anda sempre com o Sansão, seu coelho de pelúcia azul.' },
        { q: 'Qual banda britânica tinha John Lennon e Paul McCartney?', opts: ['The Rolling Stones', 'Queen', 'The Beatles', 'Pink Floyd'], answer: 2, explain: 'Lennon e McCartney formavam, com George Harrison e Ringo Starr, os Beatles, banda de Liverpool que marcou a música dos anos 1960.' },
        { q: 'Qual personagem do Sítio do Picapau Amarelo é uma boneca de pano falante?', opts: ['Narizinho', 'Emília', 'Dona Benta', 'Tia Nastácia'], answer: 1, explain: 'Emília, criada por Monteiro Lobato, é a boneca de pano que ganha a fala e se torna uma das personagens mais espertas do Sítio.' }
      ],
      medium: [
        { q: 'O que é um remake no cinema?', opts: ['Um filme feito sem roteiro', 'Uma nova versão de uma obra já existente', 'Um documentário sobre bastidores', 'Uma sequência filmada em plano único'], answer: 1, explain: 'Remake é uma nova adaptação ou recriação de uma obra que já havia sido lançada antes.' },
        { q: 'A qual movimento artístico Salvador Dalí está fortemente associado?', opts: ['Impressionismo', 'Cubismo', 'Surrealismo', 'Barroco'], answer: 2, explain: 'Salvador Dalí é um dos nomes mais conhecidos do surrealismo, movimento marcado por imagens oníricas e inesperadas.' },
        { q: 'Quem escreveu Dom Quixote?', opts: ['Miguel de Cervantes', 'William Shakespeare', 'Victor Hugo', 'Jorge Luis Borges'], answer: 0, explain: 'Dom Quixote foi escrito por Miguel de Cervantes e é uma das obras mais influentes da literatura ocidental.' },
        { q: 'O que é um storyboard?', opts: ['Uma trilha sonora provisória', 'Uma sequência de quadros usada para planejar cenas', 'Uma legenda automática para filmes', 'Um tipo de câmera analógica'], answer: 1, explain: 'Storyboard é um planejamento visual de cenas, muito usado em cinema, animação e publicidade.' },
        { q: 'Qual compositor continuou criando obras mesmo depois de ficar praticamente surdo, como a Nona Sinfonia?', opts: ['Wolfgang Amadeus Mozart', 'Ludwig van Beethoven', 'Johann Sebastian Bach', 'Frédéric Chopin'], answer: 1, explain: 'Beethoven estreou a Nona Sinfonia, com o coral da "Ode à Alegria", em 1824, quando já estava quase totalmente surdo.' },
        { q: 'Qual escritor brasileiro criou os romances "Dom Casmurro" e "Memórias Póstumas de Brás Cubas"?', opts: ['José de Alencar', 'Machado de Assis', 'Jorge Amado', 'Graciliano Ramos'], answer: 1, explain: 'Machado de Assis é um dos maiores nomes da literatura brasileira e foi o primeiro presidente da Academia Brasileira de Letras.' },
        { q: 'Qual foi o primeiro longa-metragem de animação dos estúdios Disney, lançado em 1937?', opts: ['Pinóquio', 'Branca de Neve e os Sete Anões', 'Fantasia', 'Cinderela'], answer: 1, explain: 'Branca de Neve e os Sete Anões estreou em 1937 e provou que um desenho animado podia sustentar um filme inteiro.' },
        { q: 'Quem pintou o teto da Capela Sistina, no Vaticano?', opts: ['Rafael', 'Michelangelo', 'Donatello', 'Botticelli'], answer: 1, explain: 'Michelangelo pintou o teto entre 1508 e 1512; a cena "A Criação de Adão" é a mais famosa.' },
        { q: 'Qual cantora brasileira, apelidada de "Pequena Notável", fez sucesso em Hollywood?', opts: ['Elis Regina', 'Carmen Miranda', 'Gal Costa', 'Clara Nunes'], answer: 1, explain: 'Carmen Miranda levou o samba aos Estados Unidos nos anos 1940, com figurinos de frutas na cabeça que viraram sua marca.' }
      ],
      hard: [
        { q: 'Qual termo italiano indica um andamento lento na música erudita?', opts: ['Allegro', 'Presto', 'Adagio', 'Vivace'], answer: 2, explain: 'Adagio indica andamento mais lento e expressivo, comum em trechos mais contemplativos.' },
        { q: 'No cinema, o que significa dizer que um som é diegético?', opts: ['É um som ouvido apenas pela plateia', 'É um som que pertence ao universo da cena', 'É um efeito usado só em filmes mudos', 'É um som gravado depois da edição final'], answer: 1, explain: 'Som diegético é aquele que faz parte do mundo narrativo e pode ser ouvido pelos personagens.' },
        { q: 'Qual técnica de animação fotografa quadro a quadro objetos reais para criar movimento?', opts: ['Motion capture', 'Rotoscopia', 'Stop-motion', 'Time-lapse'], answer: 2, explain: 'Stop-motion cria movimento ao registrar pequenas mudanças em objetos reais quadro a quadro.' },
        { q: 'Qual movimento artístico, criado por Picasso e Braque, mostra objetos vistos de vários ângulos ao mesmo tempo?', opts: ['Fauvismo', 'Cubismo', 'Dadaísmo', 'Expressionismo'], answer: 1, explain: 'O cubismo fragmenta figuras em formas geométricas e junta, na mesma imagem, pontos de vista diferentes.' },
        { q: 'Qual evento de 1922, em São Paulo, marcou o início do Modernismo no Brasil?', opts: ['Semana de Arte Moderna', 'Bienal de São Paulo', 'Tropicália', 'Exposição Universal'], answer: 0, explain: 'A Semana de Arte Moderna reuniu nomes como Mário de Andrade, Oswald de Andrade e Anita Malfatti no Theatro Municipal.' },
        { q: 'Qual ópera de Georges Bizet tem como protagonista uma cigana de Sevilha?', opts: ['La Traviata', 'Carmen', 'Aida', 'Tosca'], answer: 1, explain: 'Carmen estreou em Paris em 1875 e tem árias famosas, como a "Habanera".' },
        { q: 'Qual escritor colombiano escreveu "Cem Anos de Solidão"?', opts: ['Jorge Luis Borges', 'Gabriel García Márquez', 'Mario Vargas Llosa', 'Pablo Neruda'], answer: 1, explain: 'Gabriel García Márquez publicou o romance em 1967 e recebeu o Nobel de Literatura em 1982. É um marco do realismo mágico.' },
        { q: 'Qual arquiteto projetou os principais edifícios de Brasília, como o Congresso Nacional?', opts: ['Lúcio Costa', 'Oscar Niemeyer', 'Burle Marx', 'Lina Bo Bardi'], answer: 1, explain: 'Oscar Niemeyer projetou os prédios; Lúcio Costa fez o plano urbanístico da cidade, o Plano Piloto.' }
      ]
    },
    cotidiano_sociedade: {
      easy: [
        { q: 'Em um semáforo tradicional, qual cor indica atenção?', opts: ['Verde', 'Amarelo', 'Azul', 'Branco'], answer: 1, explain: 'No semáforo tradicional, o amarelo indica atenção e preparação para parar ou seguir com cuidado.' },
        { q: 'O que significa reciclar?', opts: ['Jogar qualquer lixo na rua', 'Transformar resíduos em novos materiais ou produtos', 'Guardar objetos sem uso para sempre', 'Misturar lixo orgânico e plástico'], answer: 1, explain: 'Reciclar é reaproveitar materiais descartados para gerar novos produtos e reduzir desperdícios.' },
        { q: 'Qual prática ajuda a criar uma senha mais segura?', opts: ['Usar apenas números em ordem', 'Repetir a mesma senha em todos os sites', 'Combinar letras, números e símbolos', 'Escolher a data de nascimento'], answer: 2, explain: 'Senhas mais fortes combinam diferentes tipos de caracteres e evitam padrões fáceis de adivinhar.' },
        { q: 'Para que serve a vacinação?', opts: ['Substituir a alimentação saudável', 'Treinar o sistema imunológico para se proteger melhor', 'Aumentar a força muscular', 'Eliminar a necessidade de higiene'], answer: 1, explain: 'A vacinação ajuda o organismo a reconhecer agentes infecciosos e responder melhor a eles.' },
        { q: 'O que um QR code permite fazer rapidamente com a câmera do celular?', opts: ['Aumentar o volume do aparelho', 'Abrir ou transferir informações digitais', 'Melhorar o sinal da internet', 'Carregar a bateria mais rápido'], answer: 1, explain: 'QR codes podem levar a links, pagamentos, cardápios, formulários e várias outras informações digitais.' },
        { q: 'Qual número de telefone chama o SAMU no Brasil?', opts: ['190', '192', '193', '199'], answer: 1, explain: 'O SAMU atende pelo 192. O 190 é da Polícia Militar, o 193 dos Bombeiros e o 199 da Defesa Civil.' },
        { q: 'Qual é a moeda oficial do Brasil?', opts: ['Peso', 'Real', 'Cruzeiro', 'Dólar'], answer: 1, explain: 'O real é a moeda brasileira desde 1994, quando entrou em vigor o Plano Real.' },
        { q: 'O que a faixa de pedestres indica no trânsito?', opts: ['Local para estacionar', 'Ponto preferencial para pedestres atravessarem a via', 'Pista exclusiva para bicicletas', 'Área de carga e descarga'], answer: 1, explain: 'Na faixa de pedestres, quem atravessa tem preferência e os motoristas devem parar.' },
        { q: 'O que significa a sigla CPF?', opts: ['Cadastro de Pessoas Físicas', 'Código Pessoal Federal', 'Certificado de Pessoa Física', 'Controle de Pagamento Fiscal'], answer: 0, explain: 'O CPF é o Cadastro de Pessoas Físicas da Receita Federal, número que identifica cada contribuinte no Brasil.' },
        { q: 'Na coleta seletiva, qual cor de lixeira é usada para papel?', opts: ['Azul', 'Vermelha', 'Verde', 'Amarela'], answer: 0, explain: 'No padrão brasileiro, azul é para papel, vermelho para plástico, verde para vidro e amarelo para metal.' }
      ],
      medium: [
        { q: 'O que é phishing?', opts: ['Uma técnica de pesca esportiva', 'Um golpe para roubar dados fingindo ser fonte confiável', 'Um antivírus para celular', 'Um tipo de conexão sem fio'], answer: 1, explain: 'Phishing é um golpe digital em que alguém tenta enganar a vítima para roubar senhas, códigos ou dados pessoais.' },
        { q: 'O que significa ver um cadeado com HTTPS no navegador?', opts: ['O site é sempre verdadeiro e confiável', 'A conexão entre navegador e site está criptografada', 'O site não usa cookies', 'O conteúdo foi revisado por órgãos públicos'], answer: 1, explain: 'HTTPS indica conexão criptografada. Isso ajuda na segurança, mas não garante sozinho a reputação do site.' },
        { q: 'O que é fake news?', opts: ['Uma notícia traduzida de outro idioma', 'Uma informação falsa ou enganosa divulgada como verdadeira', 'Uma piada publicada em revista', 'Uma notícia sem foto'], answer: 1, explain: 'Fake news é conteúdo falso ou enganoso espalhado como se fosse informação confiável.' },
        { q: 'Qual foi a principal ideia por trás do código de barras no comércio?', opts: ['Trocar preços por cores', 'Permitir leitura óptica rápida de produtos e dados', 'Eliminar a necessidade de embalagens', 'Substituir dinheiro por cartões'], answer: 1, explain: 'O código de barras facilitou identificar produtos e processar vendas com leitura automática e rápida.' },
        { q: 'O que é a Constituição de um país?', opts: ['Um livro sobre a história nacional', 'A lei fundamental que organiza o Estado e garante direitos', 'Um código que trata apenas de crimes', 'Um acordo comercial com outros países'], answer: 1, explain: 'A Constituição está acima das outras leis. A atual Constituição brasileira foi promulgada em 1988.' },
        { q: 'A partir de que idade o voto passa a ser obrigatório no Brasil?', opts: ['16 anos', '18 anos', '21 anos', '25 anos'], answer: 1, explain: 'O voto é obrigatório dos 18 aos 70 anos. Para quem tem 16 ou 17 anos, mais de 70 ou não é alfabetizado, ele é facultativo.' },
        { q: 'O que significa a sigla ONU?', opts: ['Organização das Nações Unidas', 'Ordem Nacional Universal', 'Organização dos Negócios Unidos', 'Ofício das Nações Unificadas'], answer: 0, explain: 'A Organização das Nações Unidas foi fundada em 1945, depois da Segunda Guerra Mundial, para promover a paz e a cooperação entre os países.' },
        { q: 'O que é inflação?', opts: ['Uma queda geral dos preços', 'Um aumento generalizado e contínuo dos preços', 'Um aumento dos salários', 'Uma redução de impostos'], answer: 1, explain: 'Inflação é a alta geral e persistente dos preços, que faz o dinheiro comprar cada vez menos.' },
        { q: 'Quantos são os Poderes da República no Brasil?', opts: ['Dois', 'Três', 'Quatro', 'Cinco'], answer: 1, explain: 'A Constituição define três Poderes independentes e harmônicos: Executivo, Legislativo e Judiciário.' }
      ],
      hard: [
        { q: 'O que significa autenticação em dois fatores?', opts: ['Usar duas contas ao mesmo tempo', 'Confirmar a identidade com uma segunda etapa além da senha', 'Ter duas senhas idênticas para o mesmo app', 'Trocar a senha a cada duas semanas'], answer: 1, explain: 'A autenticação em dois fatores adiciona uma segunda prova de identidade, como código, biometria ou aplicativo autenticador.' },
        { q: 'O que é obsolescência programada?', opts: ['Quando um produto melhora sozinho com o tempo', 'Quando um produto é projetado para ter vida útil limitada ou estimular troca frequente', 'Quando um software se atualiza automaticamente', 'Quando um aparelho é reciclado pela fábrica'], answer: 1, explain: 'Obsolescência programada descreve estratégias que reduzem a vida útil percebida ou real de produtos para incentivar substituição.' },
        { q: 'O que define a criptografia de ponta a ponta em uma conversa digital?', opts: ['A mensagem fica pública para auditoria', 'Somente remetente e destinatário conseguem ler o conteúdo', 'O texto pode ser lido por qualquer roteador da rede', 'A conversa some automaticamente após um minuto'], answer: 1, explain: 'Na criptografia de ponta a ponta, o conteúdo é protegido de modo que apenas as pontas da conversa consigam acessá-lo.' },
        { q: 'O que o IDH (Índice de Desenvolvimento Humano) leva em conta?', opts: ['Apenas a riqueza total produzida pelo país', 'Saúde, educação e renda da população', 'O número de habitantes por quilômetro quadrado', 'O volume de exportações'], answer: 1, explain: 'Calculado pela ONU, o IDH combina expectativa de vida, escolaridade e renda por pessoa.' },
        { q: 'O que é a pegada de carbono?', opts: ['A marca deixada por pneus no asfalto', 'O total de gases de efeito estufa emitidos por uma pessoa, empresa ou produto', 'A quantidade de carvão queimada nas usinas', 'A área de floresta desmatada por ano'], answer: 1, explain: 'A pegada de carbono soma as emissões diretas e indiretas de gases de efeito estufa de uma atividade, produto ou pessoa.' },
        { q: 'Qual lei brasileira regula o tratamento de dados pessoais por empresas e órgãos públicos?', opts: ['Marco Civil da Internet', 'Lei Geral de Proteção de Dados (LGPD)', 'Lei de Acesso à Informação', 'Código de Defesa do Consumidor'], answer: 1, explain: 'A LGPD (Lei 13.709/2018) entrou em vigor em 2020 e define regras para coletar, guardar e compartilhar dados pessoais.' },
        { q: 'O que é a taxa Selic na economia brasileira?', opts: ['A taxa básica de juros da economia', 'O imposto sobre produtos importados', 'O índice oficial de inflação', 'O reajuste anual do salário mínimo'], answer: 0, explain: 'A Selic é a taxa básica de juros, definida pelo Comitê de Política Monetária (Copom) do Banco Central, e serve de referência para os demais juros.' },
        { q: 'Quanto dura o mandato de um senador no Brasil?', opts: ['4 anos', '6 anos', '8 anos', '10 anos'], answer: 2, explain: 'Senadores têm mandato de 8 anos. As eleições renovam o Senado alternadamente em um terço e em dois terços a cada 4 anos.' }
      ]
    }
  },
  biblia_at: {
    genesis_criacao: {
      easy: [
        { q: 'Segundo Gênesis, em quantos dias Deus criou o mundo?', opts: ['5 dias', '6 dias', '7 dias', '10 dias'], answer: 1, explain: 'Deus criou tudo em 6 dias e descansou no 7º dia (Gênesis 1-2).' },
        { q: 'Quem foi o primeiro homem segundo a Bíblia?', opts: ['Noé', 'Abraão', 'Adão', 'Moisés'], answer: 2, explain: 'Adão foi o primeiro homem, criado por Deus do pó da terra (Gênesis 2:7).' },
        { q: 'Qual fruto era proibido no Jardim do Éden?', opts: ['Da árvore da vida', 'Da árvore do conhecimento do bem e do mal', 'Da oliveira sagrada', 'Da videira'], answer: 1, explain: 'Era proibido comer da árvore do conhecimento do bem e do mal (Gênesis 2:17).' },
        { q: 'Quem construiu a arca para sobreviver ao dilúvio?', opts: ['Abraão', 'Moisés', 'Noé', 'Davi'], answer: 2, explain: 'Noé construiu a arca por ordem de Deus (Gênesis 6:14).' },
        { q: 'Quem foram os filhos de Adão e Eva mencionados em Gênesis?', opts: ['Pedro e Paulo', 'Caim e Abel', 'Isaque e Ismael', 'Jacó e Esaú'], answer: 1, explain: 'Caim e Abel são os primeiros filhos de Adão e Eva mencionados (Gênesis 4:1-2).' },
        { q: 'O que Deus fez no sétimo dia da criação?', opts: ['Criou o homem', 'Criou os animais', 'Descansou', 'Criou a luz'], answer: 2, explain: 'No sétimo dia, Deus descansou de toda a obra que fizera (Gênesis 2:2).' }
      ],
      medium: [
        { q: 'Quantos de cada animal Noé levou na arca?', opts: ['Um casal de cada', 'Um casal dos impuros e sete casais dos puros', 'Sete de cada', 'Dez de cada'], answer: 1, explain: 'Dos animais puros levou sete casais e dos impuros um casal (Gênesis 7:2-3).' },
        { q: 'Qual foi o sinal da aliança de Deus com Noé após o dilúvio?', opts: ['Uma estrela', 'O arco-íris', 'Uma pomba', 'Um trovão'], answer: 1, explain: 'O arco-íris foi o sinal da aliança de que Deus não destruiria a terra com dilúvio novamente (Gênesis 9:13).' },
        { q: 'Por que Deus confundiu as línguas na Torre de Babel?', opts: ['Para punir Noé', 'Para espalhar a humanidade pela terra', 'Para criar novas nações', 'Para testar Abraão'], answer: 1, explain: 'Os homens queriam construir uma torre até o céu; Deus confundiu suas línguas para dispersá-los (Gênesis 11:7-9).' },
        { q: 'Quem foi Melquisedeque em Gênesis?', opts: ['Um faraó do Egito', 'Rei de Salém e sacerdote do Deus Altíssimo', 'Filho de Abraão', 'Um profeta de Israel'], answer: 1, explain: 'Melquisedeque era rei de Salém e sacerdote que abençoou Abraão (Gênesis 14:18).' },
        { q: 'Qual era o novo nome que Deus deu a Jacó?', opts: ['Abraão', 'Israel', 'Judá', 'Josué'], answer: 1, explain: 'Deus mudou o nome de Jacó para Israel, que significa "lutou com Deus" (Gênesis 32:28).' }
      ],
      hard: [
        { q: 'Em Gênesis 1, qual foi a primeira coisa que Deus criou?', opts: ['O céu e a terra', 'A luz', 'As águas', 'Os animais'], answer: 1, explain: 'A primeira coisa criada de forma nomeada foi a luz: "Haja luz" (Gênesis 1:3). Céu e terra são o contexto inicial.' },
        { q: 'Quantos anos Matusalém viveu segundo Gênesis?', opts: ['120 anos', '365 anos', '969 anos', '777 anos'], answer: 2, explain: 'Matusalém viveu 969 anos, sendo a pessoa mais longeva registrada na Bíblia (Gênesis 5:27).' },
        { q: 'Qual era a idade de Abraão quando Isaque nasceu?', opts: ['75 anos', '90 anos', '100 anos', '120 anos'], answer: 2, explain: 'Abraão tinha 100 anos quando Isaque nasceu (Gênesis 21:5).' },
        { q: 'Quem foi vendido como escravo pelos próprios irmãos no Egito?', opts: ['Benjamim', 'Judá', 'José', 'Rúben'], answer: 2, explain: 'José foi vendido por seus irmãos e levado ao Egito (Gênesis 37:28).' },
        { q: 'A aliança de Deus com Abraão prometia que sua descendência seria como...', opts: ['As ondas do mar', 'As estrelas do céu e a areia do mar', 'As árvores da floresta', 'Os rios da terra'], answer: 1, explain: 'Deus prometeu descendência inumerável como as estrelas e a areia (Gênesis 22:17).' }
      ]
    },
    exodo_lei: {
      easy: [
        { q: 'Quem liderou os israelitas para fora do Egito?', opts: ['Abraão', 'Josué', 'Moisés', 'Davi'], answer: 2, explain: 'Moisés foi chamado por Deus para libertar o povo de Israel da escravidão no Egito (Êxodo 3).' },
        { q: 'Quantas pragas Deus enviou sobre o Egito?', opts: ['5', '7', '10', '12'], answer: 2, explain: 'Foram 10 pragas enviadas sobre o Egito antes do faraó libertar os israelitas (Êxodo 7-12).' },
        { q: 'Qual mar Moisés abriu para o povo passar?', opts: ['Mar Mediterrâneo', 'Mar Morto', 'Mar Vermelho', 'Mar da Galileia'], answer: 2, explain: 'Deus abriu o Mar Vermelho para os israelitas passarem (Êxodo 14:21).' },
        { q: 'Onde Moisés recebeu os Dez Mandamentos?', opts: ['Monte Carmelo', 'Monte Sinai', 'Monte das Oliveiras', 'Monte Sião'], answer: 1, explain: 'Moisés recebeu as tábuas da Lei no Monte Sinai (Êxodo 19-20).' },
        { q: 'Qual foi a última das 10 pragas do Egito?', opts: ['Trevas', 'Gafanhotos', 'Morte dos primogênitos', 'Água em sangue'], answer: 2, explain: 'A décima praga foi a morte de todos os primogênitos do Egito (Êxodo 12:29).' }
      ],
      medium: [
        { q: 'Qual é o primeiro dos Dez Mandamentos?', opts: ['Não matarás', 'Não terás outros deuses diante de mim', 'Honra teu pai e tua mãe', 'Não furtarás'], answer: 1, explain: 'O primeiro mandamento é "Não terás outros deuses diante de mim" (Êxodo 20:3).' },
        { q: 'O que os israelitas fizeram enquanto Moisés estava no monte recebendo a Lei?', opts: ['Oraram e jejuaram', 'Fizeram um bezerro de ouro', 'Construíram um templo', 'Atravessaram o Jordão'], answer: 1, explain: 'O povo fez um bezerro de ouro para adorar (Êxodo 32:4).' },
        { q: 'O que é a Páscoa judaica originalmente?', opts: ['Festa da colheita', 'Celebração da libertação do Egito', 'Aniversário de Moisés', 'Dia de jejum'], answer: 1, explain: 'A Páscoa celebra a libertação dos israelitas da escravidão no Egito (Êxodo 12).' },
        { q: 'O que era o maná?', opts: ['Tipo de pão egípcio', 'Alimento que Deus dava ao povo no deserto', 'Uma bebida sagrada', 'Um sacrifício animal'], answer: 1, explain: 'Maná era o alimento miraculoso que Deus providenciava diariamente no deserto (Êxodo 16:14-15).' },
        { q: 'Qual era o papel de Arão junto a Moisés?', opts: ['General do exército', 'Porta-voz e sacerdote', 'Juiz de Israel', 'Escriba da Lei'], answer: 1, explain: 'Arão era irmão de Moisés, servia como seu porta-voz e foi o primeiro sumo sacerdote (Êxodo 4:14-16).' }
      ],
      hard: [
        { q: 'Quantos anos os israelitas vagaram pelo deserto?', opts: ['10 anos', '20 anos', '40 anos', '70 anos'], answer: 2, explain: 'Os israelitas vagaram 40 anos pelo deserto antes de entrar na Terra Prometida (Números 14:33).' },
        { q: 'O que era a Arca da Aliança?', opts: ['O barco de Noé', 'Um baú sagrado que guardava as tábuas da Lei', 'O altar do templo', 'Um escudo de guerra'], answer: 1, explain: 'A Arca da Aliança era o baú revestido de ouro que continha as tábuas dos Dez Mandamentos (Êxodo 25:10-22).' },
        { q: 'Qual o significado do nome "Êxodo"?', opts: ['Lei de Deus', 'Saída', 'Aliança', 'Promessa'], answer: 1, explain: 'Êxodo vem do grego "exodos" e significa "saída", referindo-se à saída do Egito.' },
        { q: 'O Tabernáculo era...', opts: ['O palácio de Moisés', 'O templo permanente em Jerusalém', 'A tenda portátil de adoração a Deus no deserto', 'A casa de Arão'], answer: 2, explain: 'O Tabernáculo era a tenda portátil onde Deus habitava entre seu povo durante a peregrinação (Êxodo 26).' },
        { q: 'O que Deus revelou a Moisés na sarça ardente?', opts: ['O nome "EU SOU O QUE SOU"', 'Os Dez Mandamentos', 'O plano do Tabernáculo', 'A profecia do Messias'], answer: 0, explain: 'Na sarça ardente, Deus revelou seu nome "EU SOU O QUE SOU" (YHWH) a Moisés (Êxodo 3:14).' }
      ]
    },
    reis_profetas: {
      easy: [
        { q: 'Quem foi o primeiro rei de Israel?', opts: ['Davi', 'Saul', 'Salomão', 'Samuel'], answer: 1, explain: 'Saul foi ungido por Samuel como o primeiro rei de Israel (1 Samuel 10:1).' },
        { q: 'Qual rei era conhecido por sua grande sabedoria?', opts: ['Davi', 'Saul', 'Salomão', 'Josias'], answer: 2, explain: 'Salomão pediu sabedoria a Deus e ficou conhecido como o rei mais sábio (1 Reis 3:12).' },
        { q: 'Quem derrotou o gigante Golias?', opts: ['Saul', 'Sansão', 'Davi', 'Josué'], answer: 2, explain: 'Davi, ainda jovem pastor, derrotou o gigante filisteu Golias com uma funda (1 Samuel 17).' },
        { q: 'O que Davi tocava para acalmar o rei Saul?', opts: ['Flauta', 'Harpa', 'Tambor', 'Trombeta'], answer: 1, explain: 'Davi tocava harpa (lira) para aliviar o espírito perturbado de Saul (1 Samuel 16:23).' },
        { q: 'Quem construiu o primeiro Templo de Jerusalém?', opts: ['Moisés', 'Davi', 'Salomão', 'Esdras'], answer: 2, explain: 'Salomão construiu o primeiro Templo em Jerusalém (1 Reis 6).' }
      ],
      medium: [
        { q: 'Qual profeta enfrentou os profetas de Baal no Monte Carmelo?', opts: ['Isaías', 'Jeremias', 'Elias', 'Eliseu'], answer: 2, explain: 'Elias desafiou os 450 profetas de Baal no Monte Carmelo e Deus respondeu com fogo (1 Reis 18).' },
        { q: 'Por que o reino de Israel se dividiu em dois?', opts: ['Invasão estrangeira', 'Porque Roboão impôs impostos pesados', 'Morte de Davi', 'Fome na terra'], answer: 1, explain: 'Após Salomão, seu filho Roboão recusou aliviar os impostos, causando a divisão (1 Reis 12).' },
        { q: 'Quais eram os dois reinos após a divisão?', opts: ['Israel e Judá', 'Israel e Samaria', 'Judá e Galileia', 'Israel e Jerusalém'], answer: 0, explain: 'O reino se dividiu em Israel (norte, 10 tribos) e Judá (sul, 2 tribos).' },
        { q: 'Qual profeta escreveu sobre o servo sofredor que viria?', opts: ['Jeremias', 'Ezequiel', 'Isaías', 'Daniel'], answer: 2, explain: 'Isaías escreveu sobre o servo sofredor no capítulo 53, profecia messiânica.' },
        { q: 'Quem foi lançado na cova dos leões?', opts: ['Elias', 'Jeremias', 'Daniel', 'Jonas'], answer: 2, explain: 'Daniel foi lançado na cova dos leões por orar a Deus, mas foi protegido (Daniel 6).' }
      ],
      hard: [
        { q: 'Qual profeta foi engolido por um grande peixe?', opts: ['Elias', 'Jonas', 'Amós', 'Oseias'], answer: 1, explain: 'Jonas fugiu da missão de pregar em Nínive e foi engolido por um grande peixe (Jonas 1:17).' },
        { q: 'Qual império destruiu Jerusalém e o Templo em 586 a.C.?', opts: ['Império Romano', 'Império Persa', 'Império Babilônico', 'Império Assírio'], answer: 2, explain: 'Nabucodonosor, rei da Babilônia, destruiu Jerusalém e o Templo em 586 a.C. (2 Reis 25).' },
        { q: 'Qual profeta teve a visão do vale de ossos secos?', opts: ['Isaías', 'Jeremias', 'Ezequiel', 'Daniel'], answer: 2, explain: 'Ezequiel teve a visão do vale de ossos secos que se tornaram vivos (Ezequiel 37).' },
        { q: 'O que a profecia de Daniel sobre a "estátua" com vários metais representava?', opts: ['As tribos de Israel', 'Impérios mundiais sucessivos', 'Os reis de Judá', 'Os anjos celestiais'], answer: 1, explain: 'A estátua de Daniel 2 representa impérios sucessivos: Babilônia, Medo-Persa, Grécia e Roma.' },
        { q: 'Qual profeta se casou com Gômer como símbolo do amor de Deus por Israel?', opts: ['Amós', 'Oseias', 'Miqueias', 'Joel'], answer: 1, explain: 'Oseias se casou com Gômer, simbolizando o amor fiel de Deus por Israel infiel (Oseias 1-3).' }
      ]
    },
    sabedoria: {
      easy: [
        { q: 'Quem escreveu a maioria dos Salmos?', opts: ['Moisés', 'Salomão', 'Davi', 'Samuel'], answer: 2, explain: 'Davi é tradicionalmente considerado o principal autor dos Salmos.' },
        { q: 'Qual livro é famoso por seus provérbios de sabedoria?', opts: ['Gênesis', 'Provérbios', 'Êxodo', 'Levítico'], answer: 1, explain: 'O livro de Provérbios contém ensinamentos de sabedoria, muitos atribuídos a Salomão.' },
        { q: 'Qual é o Salmo mais conhecido que começa com "O Senhor é meu pastor"?', opts: ['Salmo 1', 'Salmo 23', 'Salmo 91', 'Salmo 119'], answer: 1, explain: 'O Salmo 23 começa com "O Senhor é meu pastor, nada me faltará".' },
        { q: 'Qual livro fala sobre o sentido da vida e diz "vaidade de vaidades"?', opts: ['Jó', 'Eclesiastes', 'Cantares', 'Provérbios'], answer: 1, explain: 'Eclesiastes explora o sentido da vida e começa com "vaidade de vaidades" (Eclesiastes 1:2).' },
        { q: 'De que trata o livro de Jó?', opts: ['A criação do mundo', 'O sofrimento do justo', 'A história de Israel', 'As leis de Moisés'], answer: 1, explain: 'Jó aborda o sofrimento de um homem justo e a soberania de Deus.' }
      ],
      medium: [
        { q: '"O temor do Senhor é o princípio da sabedoria" está em qual livro?', opts: ['Cantares', 'Eclesiastes', 'Provérbios', 'Jó'], answer: 2, explain: 'A frase está em Provérbios 9:10 (com palavras parecidas, também em Provérbios 1:7 e no Salmo 111:10).' },
        { q: 'O Salmo 119 é especial porque...', opts: ['É o mais curto da Bíblia', 'É o mais longo capítulo da Bíblia', 'Foi escrito por Moisés', 'Não contém referência a Deus'], answer: 1, explain: 'O Salmo 119 é o mais longo capítulo da Bíblia com 176 versículos, cada seção segue o alfabeto hebraico.' },
        { q: 'Quem disse "Há tempo para tudo debaixo do céu"?', opts: ['Davi nos Salmos', 'O Pregador em Eclesiastes', 'Salomão em Provérbios', 'Jó'], answer: 1, explain: 'Esta passagem está em Eclesiastes 3:1, atribuída ao Pregador (Qohelet).' },
        { q: 'Em Provérbios, a sabedoria é personificada como...', opts: ['Um rei', 'Uma mulher', 'Um anjo', 'Uma criança'], answer: 1, explain: 'Em Provérbios 8, a sabedoria é personificada como uma mulher que clama nas ruas.' },
        { q: 'Qual foi a conclusão final de Eclesiastes?', opts: ['A vida não tem sentido', 'Teme a Deus e guarda seus mandamentos', 'Busque riquezas', 'Seja hedonista'], answer: 1, explain: 'A conclusão é: "Teme a Deus e guarda os seus mandamentos" (Eclesiastes 12:13).' }
      ],
      hard: [
        { q: 'O livro de Cantares de Salomão é interpretado como...', opts: ['Apenas um poema de amor humano', 'Uma alegoria do amor de Deus por seu povo', 'Uma profecia do fim dos tempos', 'Um livro de leis matrimoniais'], answer: 1, explain: 'Cantares é interpretado como alegoria do amor entre Deus e seu povo, além do amor conjugal.' },
        { q: 'Qual é a resposta final de Deus a Jó sobre seu sofrimento?', opts: ['Explicou cada razão do sofrimento', 'Revelou sua soberania e sabedoria infinita', 'Prometeu que nunca mais sofreria', 'Culpou os amigos de Jó'], answer: 1, explain: 'Deus respondeu a Jó revelando Sua grandeza e soberania sobre a criação (Jó 38-41).' },
        { q: 'Em Provérbios, "a resposta branda desvia o furor" ensina sobre...', opts: ['Estratégia militar', 'Sabedoria no falar e mansidão', 'Técnica de negociação', 'Obediência à lei'], answer: 1, explain: 'Provérbios 15:1 ensina que palavras brandas acalmam a ira, refletindo sabedoria relacional.' },
        { q: 'Os Salmos de imprecação (ex: Salmo 109) causam debate porque...', opts: ['São muito curtos', 'Pedem a Deus que julgue os inimigos', 'Negam a existência de Deus', 'Foram escritos por pagãos'], answer: 1, explain: 'Salmos imprecatórios pedem julgamento divino contra os ímpios, gerando debate ético e teológico.' },
        { q: 'O conceito de "temor do Senhor" nos livros sapienciais significa...', opts: ['Terror e medo de Deus', 'Reverência, respeito e submissão a Deus', 'Ignorância sobre Deus', 'Superstição religiosa'], answer: 1, explain: 'Temor do Senhor é reverência respeitosa e submissão à vontade de Deus, base da verdadeira sabedoria.' }
      ]
    }
  },
  biblia_nt: {
    vida_jesus: {
      easy: [
        { q: 'Em qual cidade Jesus nasceu?', opts: ['Nazaré', 'Jerusalém', 'Belém', 'Cafarnaum'], answer: 2, explain: 'Jesus nasceu em Belém da Judeia (Mateus 2:1).' },
        { q: 'Quem era a mãe de Jesus?', opts: ['Marta', 'Maria Madalena', 'Maria', 'Isabel'], answer: 2, explain: 'Maria foi a mãe de Jesus, concebido pelo Espírito Santo (Lucas 1:31).' },
        { q: 'Quantos apóstolos Jesus escolheu?', opts: ['7', '10', '12', '15'], answer: 2, explain: 'Jesus escolheu 12 apóstolos para segui-lo (Marcos 3:14).' },
        { q: 'Qual era a profissão de Jesus antes do ministério?', opts: ['Pescador', 'Carpinteiro', 'Pastor de ovelhas', 'Sacerdote'], answer: 1, explain: 'Jesus era carpinteiro, seguindo o ofício de José (Marcos 6:3).' },
        { q: 'Onde Jesus foi batizado?', opts: ['Mar da Galileia', 'Rio Jordão', 'Mar Morto', 'Tanque de Siloé'], answer: 1, explain: 'Jesus foi batizado por João Batista no Rio Jordão (Mateus 3:13).' }
      ],
      medium: [
        { q: 'Qual foi o primeiro milagre de Jesus registrado em João?', opts: ['Multiplicação dos pães', 'Transformar água em vinho', 'Cura de um cego', 'Andar sobre as águas'], answer: 1, explain: 'O primeiro milagre foi transformar água em vinho nas bodas de Caná (João 2:1-11).' },
        { q: 'Quantos dias Jesus jejuou no deserto antes das tentações?', opts: ['7 dias', '21 dias', '40 dias', '70 dias'], answer: 2, explain: 'Jesus jejuou 40 dias e 40 noites no deserto (Mateus 4:2).' },
        { q: 'Jesus disse "Eu sou o caminho, a verdade e a vida" em qual Evangelho?', opts: ['Mateus', 'Marcos', 'Lucas', 'João'], answer: 3, explain: 'Esta declaração está em João 14:6.' },
        { q: 'Quem era o apóstolo que negou Jesus três vezes?', opts: ['João', 'Judas', 'Pedro', 'Tomé'], answer: 2, explain: 'Pedro negou Jesus três vezes antes do galo cantar (Mateus 26:69-75).' },
        { q: 'O Sermão da Montanha está registrado em qual Evangelho?', opts: ['Mateus', 'Marcos', 'Lucas', 'João'], answer: 0, explain: 'O Sermão da Montanha está em Mateus capítulos 5 a 7.' }
      ],
      hard: [
        { q: 'Qual a diferença principal entre os Evangelhos sinóticos e João?', opts: ['João foi escrito em grego e os outros em hebraico', 'João foca mais na divindade de Cristo e em discursos teológicos', 'João não menciona milagres', 'Os sinóticos foram escritos por apóstolos e João não'], answer: 1, explain: 'O Evangelho de João tem perspectiva teológica mais profunda, focando na divindade de Cristo.' },
        { q: 'Jesus disse "Antes que Abraão existisse, EU SOU" conectando-se a...', opts: ['O batismo de João', 'A revelação do nome de Deus a Moisés (Êxodo 3:14)', 'A aliança com Noé', 'A criação de Adão'], answer: 1, explain: 'Jesus usou o nome divino "EU SOU" (ego eimi), o mesmo revelado a Moisés (João 8:58).' },
        { q: 'O título "Filho do Homem" que Jesus usava vem de...', opts: ['Gênesis', 'Salmos', 'Daniel 7:13', 'Provérbios'], answer: 2, explain: 'O título vem de Daniel 7:13, onde o "Filho do Homem" recebe domínio eterno de Deus.' },
        { q: 'A "Oração Sacerdotal" de Jesus em João 17 pede principalmente por...', opts: ['A destruição de Roma', 'A unidade dos crentes', 'Riquezas para os apóstolos', 'A reconstrução do Templo'], answer: 1, explain: 'Na oração de João 17, Jesus pede pela unidade e santificação dos que creem nele.' },
        { q: 'A Transfiguração de Jesus ocorreu diante de quais apóstolos?', opts: ['Todos os doze', 'Pedro, Tiago e João', 'Pedro e André', 'Mateus e Tomé'], answer: 1, explain: 'Pedro, Tiago e João testemunharam a Transfiguração (Mateus 17:1).' }
      ]
    },
    parabolas: {
      easy: [
        { q: 'Na parábola do Filho Pródigo, o que o filho mais novo fez?', opts: ['Ficou em casa trabalhando', 'Pediu sua herança e a gastou toda', 'Virou sacerdote', 'Construiu uma casa'], answer: 1, explain: 'O filho pródigo pediu sua herança, foi embora e gastou tudo (Lucas 15:13).' },
        { q: 'Na parábola do Bom Samaritano, quem ajudou o homem ferido?', opts: ['Um sacerdote', 'Um levita', 'Um samaritano', 'Um fariseu'], answer: 2, explain: 'O samaritano cuidou do homem ferido, enquanto o sacerdote e o levita passaram de largo (Lucas 10:33).' },
        { q: 'Na parábola do Semeador, o que representam as sementes?', opts: ['Dinheiro', 'A Palavra de Deus', 'Oração', 'Sacrifícios'], answer: 1, explain: 'As sementes representam a Palavra de Deus semeada nos corações (Marcos 4:14).' },
        { q: 'O que aconteceu com a ovelha perdida na parábola?', opts: ['Foi abandonada', 'O pastor foi buscá-la', 'Voltou sozinha', 'Foi comida pelo lobo'], answer: 1, explain: 'O pastor deixou as 99 e foi buscar a ovelha perdida (Lucas 15:4).' },
        { q: 'Na parábola dos talentos, o que o senhor deu aos servos?', opts: ['Terras', 'Talentos (dinheiro)', 'Ovelhas', 'Livros'], answer: 1, explain: 'O senhor deu talentos (moedas) aos servos para administrarem (Mateus 25:15).' }
      ],
      medium: [
        { q: 'Na parábola do Semeador, o que representa o solo rochoso?', opts: ['Quem ouve e pratica', 'Quem recebe com alegria mas desiste na tribulação', 'Quem ignora a Palavra', 'Quem é muito rico'], answer: 1, explain: 'O solo rochoso representa quem recebe com alegria mas não tem raiz e desiste (Marcos 4:16-17).' },
        { q: 'A parábola do Fermento ensina que o Reino de Deus...', opts: ['É violento', 'Cresce de forma gradual e penetrante', 'É apenas para poucos', 'Será destruído'], answer: 1, explain: 'O fermento na massa mostra como o Reino cresce gradualmente até permear tudo (Mateus 13:33).' },
        { q: 'Na parábola das Dez Virgens, por que cinco foram chamadas de tolas?', opts: ['Chegaram atrasadas', 'Não levaram azeite suficiente', 'Dormiam demais', 'Não conheciam o noivo'], answer: 1, explain: 'As cinco tolas não levaram azeite extra para suas lâmpadas (Mateus 25:3).' },
        { q: 'O que Jesus ensina na parábola do Fariseu e do Publicano?', opts: ['Que devemos jejuar muito', 'Que a humildade é mais aceita que a arrogância religiosa', 'Que impostos são errados', 'Que fariseus são melhores'], answer: 1, explain: 'O publicano humilde foi justificado, não o fariseu orgulhoso (Lucas 18:14).' },
        { q: 'A parábola da Pérola de Grande Valor ensina que...', opts: ['Devemos ser comerciantes', 'O Reino de Deus vale tudo que temos', 'Joias são importantes', 'Devemos guardar riquezas'], answer: 1, explain: 'O mercador vendeu tudo para comprar a pérola preciosa, assim vale o Reino (Mateus 13:45-46).' }
      ],
      hard: [
        { q: 'Na parábola dos Trabalhadores da Vinha, por que todos receberam o mesmo?', opts: ['Porque trabalharam igual', 'Para mostrar a generosidade soberana de Deus', 'Porque era obrigação legal', 'Porque os primeiros pediram'], answer: 1, explain: 'A parábola mostra que a graça de Deus não segue mérito humano, mas Sua generosidade (Mateus 20:15).' },
        { q: 'As parábolas de Jesus em Marcos 4 tinham o propósito de...', opts: ['Entreter as multidões', 'Revelar verdades aos discípulos e ocultar dos incrédulos', 'Substituir a Lei de Moisés', 'Contar histórias verídicas'], answer: 1, explain: 'Jesus explicou que as parábolas revelam mistérios aos discípulos mas ocultam dos de fora (Marcos 4:11-12).' },
        { q: 'A parábola do Rico e Lázaro ensina sobre...', opts: ['Como ficar rico', 'A realidade da vida após a morte e a reversão de condições', 'A importância do trabalho', 'Que mendigos são preguiçosos'], answer: 1, explain: 'A parábola mostra a reversão após a morte: Lázaro é consolado e o rico sofre (Lucas 16:19-31).' },
        { q: 'Na parábola dos Lavradores Maus, o filho enviado pelo dono representa...', opts: ['Moisés', 'João Batista', 'Jesus Cristo', 'Elias'], answer: 2, explain: 'O filho é Jesus, rejeitado e morto pelos líderes religiosos (Marcos 12:1-12).' },
        { q: 'A parábola do Joio e do Trigo ensina que o julgamento final...', opts: ['Deve ser feito imediatamente pela igreja', 'Será feito por Deus no tempo certo, na ceifa', 'Nunca acontecerá', 'Já aconteceu'], answer: 1, explain: 'Jesus ensinou que joio e trigo crescem juntos até a ceifa (julgamento final) — Mateus 13:30.' }
      ]
    },
    paixao_ressurreicao: {
      easy: [
        { q: 'Em que dia da semana Jesus ressuscitou?', opts: ['Sexta-feira', 'Sábado', 'Domingo', 'Segunda-feira'], answer: 2, explain: 'Jesus ressuscitou no primeiro dia da semana, domingo (Marcos 16:9).' },
        { q: 'Quem traiu Jesus?', opts: ['Pedro', 'Tomé', 'Judas Iscariotes', 'André'], answer: 2, explain: 'Judas Iscariotes traiu Jesus por 30 moedas de prata (Mateus 26:15).' },
        { q: 'Onde Jesus foi crucificado?', opts: ['Monte Sinai', 'Gólgota (Calvário)', 'Monte das Oliveiras', 'Betânia'], answer: 1, explain: 'Jesus foi crucificado no Gólgota, que significa "lugar da caveira" (Mateus 27:33).' },
        { q: 'O que Jesus celebrou com os discípulos antes de ser preso?', opts: ['A Festa de Purim', 'A Última Ceia (Páscoa)', 'O Pentecostes', 'O Yom Kippur'], answer: 1, explain: 'Jesus celebrou a Última Ceia, uma refeição pascal, com seus discípulos (Mateus 26:17-30).' },
        { q: 'Quantos dias após a ressurreição Jesus ascendeu ao céu?', opts: ['3 dias', '7 dias', '40 dias', '50 dias'], answer: 2, explain: 'Jesus ascendeu ao céu 40 dias após a ressurreição (Atos 1:3,9).' }
      ],
      medium: [
        { q: 'Qual foi o grito de Jesus na cruz registrado em Mateus?', opts: ['"Está consumado"', '"Deus meu, Deus meu, por que me desamparaste?"', '"Pai, perdoa-lhes"', '"Em tuas mãos entrego meu espírito"'], answer: 1, explain: 'Jesus clamou "Eli, Eli, lama sabactâni" — "Deus meu, por que me desamparaste?" (Mateus 27:46).' },
        { q: 'O véu do Templo se rasgou quando Jesus morreu. O que isso simbolizou?', opts: ['A destruição do Templo', 'O acesso direto a Deus para todos', 'O fim da lei judaica', 'A ira de Deus'], answer: 1, explain: 'O véu rasgado simboliza que o caminho a Deus foi aberto pela morte de Cristo (Hebreus 10:19-20).' },
        { q: 'Quem pediu a Pilatos o corpo de Jesus para sepultá-lo?', opts: ['Pedro', 'José de Arimateia', 'Nicodemos', 'João'], answer: 1, explain: 'José de Arimateia, discípulo secreto, pediu o corpo de Jesus (Mateus 27:57-58).' },
        { q: 'Quem foram as primeiras testemunhas da ressurreição?', opts: ['Os 12 apóstolos', 'Mulheres que foram ao túmulo', 'Os soldados romanos', 'Os sacerdotes'], answer: 1, explain: 'As mulheres, incluindo Maria Madalena, foram as primeiras no túmulo vazio (Marcos 16:1-6).' },
        { q: 'Qual apóstolo duvidou da ressurreição até ver Jesus?', opts: ['Pedro', 'João', 'Tomé', 'André'], answer: 2, explain: 'Tomé disse que só acreditaria se tocasse as feridas de Jesus (João 20:25).' }
      ],
      hard: [
        { q: 'Em qual jardim Jesus orou antes de ser preso?', opts: ['Jardim do Éden', 'Getsêmani', 'Jardim do Rei', 'Jardim de Betânia'], answer: 1, explain: 'Jesus orou no Getsêmani, pedindo que o cálice passasse dele (Mateus 26:36).' },
        { q: 'Paulo afirma em 1 Coríntios 15 que se Cristo não ressuscitou...', opts: ['A lei ainda vale', 'Nossa fé é vã', 'Devemos seguir Moisés', 'O Templo será reconstruído'], answer: 1, explain: '"Se Cristo não ressuscitou, é vã a nossa fé" — a ressurreição é central ao cristianismo (1 Co 15:14).' },
        { q: 'Isaías 53 profetiza sobre o servo sofredor. Qual verso diz "pelas suas pisaduras fomos sarados"?', opts: ['Isaías 53:3', 'Isaías 53:5', 'Isaías 53:7', 'Isaías 53:12'], answer: 1, explain: 'Isaías 53:5 diz: "ele foi ferido pelas nossas transgressões... pelas suas pisaduras fomos sarados".' },
        { q: 'A "descida ao Hades" mencionada no Credo Apostólico refere-se a...', opts: ['Jesus foi ao inferno sofrer', 'Jesus proclamou vitória sobre a morte entre os mortos', 'Jesus dormiu três dias', 'Uma metáfora sem significado'], answer: 1, explain: 'A tradição entende que Cristo proclamou sua vitória no reino dos mortos (1 Pedro 3:19).' },
        { q: 'Quantas aparições de Jesus ressurreto Paulo lista em 1 Coríntios 15?', opts: ['3', '5', '6', '8'], answer: 2, explain: 'Paulo lista 6 aparições: a Pedro, aos doze, a 500 irmãos, a Tiago, a todos os apóstolos e a ele mesmo (1 Co 15:5-8).' }
      ]
    },
    atos_epistolas: {
      easy: [
        { q: 'Quem escreveu a maioria das epístolas do Novo Testamento?', opts: ['Pedro', 'João', 'Paulo', 'Tiago'], answer: 2, explain: 'O apóstolo Paulo escreveu 13 das 21 epístolas do Novo Testamento.' },
        { q: 'O que aconteceu no dia de Pentecostes?', opts: ['Jesus nasceu', 'O Espírito Santo desceu sobre os discípulos', 'O Templo foi destruído', 'Paulo se converteu'], answer: 1, explain: 'No Pentecostes, o Espírito Santo desceu e os discípulos falaram em outras línguas (Atos 2).' },
        { q: 'Qual era o nome de Paulo antes da conversão?', opts: ['Silas', 'Barnabé', 'Saulo', 'Timóteo'], answer: 2, explain: 'Paulo se chamava Saulo antes de sua conversão no caminho de Damasco (Atos 9:1-4).' },
        { q: 'Qual livro narra a história da igreja primitiva?', opts: ['Romanos', 'Atos dos Apóstolos', 'Apocalipse', 'Hebreus'], answer: 1, explain: 'Atos dos Apóstolos, escrito por Lucas, narra o início e expansão da igreja.' },
        { q: 'Quem era o companheiro de viagem missionária de Paulo?', opts: ['Pedro', 'Barnabé', 'Tiago', 'Mateus'], answer: 1, explain: 'Barnabé acompanhou Paulo na primeira viagem missionária (Atos 13:2).' }
      ],
      medium: [
        { q: 'Em Romanos, Paulo ensina que a justificação vem pela...', opts: ['Obediência à Lei', 'Fé em Jesus Cristo', 'Circuncisão', 'Oferta de sacrifícios'], answer: 1, explain: 'Paulo ensina que somos justificados pela fé, não pelas obras da Lei (Romanos 3:28).' },
        { q: 'Qual é o "fruto do Espírito" listado em Gálatas 5?', opts: ['Poder, riqueza e fama', 'Amor, alegria, paz, paciência, bondade...', 'Sabedoria e conhecimento apenas', 'Fé e esperança apenas'], answer: 1, explain: 'O fruto do Espírito inclui amor, alegria, paz, paciência, bondade, fidelidade, mansidão e domínio próprio (Gl 5:22-23).' },
        { q: 'A quem Paulo escreveu sobre a "armadura de Deus"?', opts: ['Aos romanos', 'Aos coríntios', 'Aos efésios', 'Aos filipenses'], answer: 2, explain: 'A armadura de Deus é descrita em Efésios 6:10-18.' },
        { q: 'O que Pedro afirmou no primeiro sermão da igreja em Atos 2?', opts: ['Que Jesus era apenas um profeta', 'Que Jesus é Senhor e Cristo, ressuscitado por Deus', 'Que a Lei deve ser abolida', 'Que o Templo seria reconstruído'], answer: 1, explain: 'Pedro proclamou que Deus fez Jesus Senhor e Cristo (Atos 2:36).' },
        { q: 'A carta de Tiago ensina que a fé sem obras é...', opts: ['Suficiente', 'Morta', 'Superior', 'Opcional'], answer: 1, explain: 'Tiago 2:26 diz: "a fé sem obras é morta".' }
      ],
      hard: [
        { q: 'O "espinho na carne" de Paulo (2 Co 12:7) é interpretado como...', opts: ['Uma doença física', 'Algo debatido: pode ser doença, oposição ou tentação', 'Judas Iscariotes', 'Sua consciência pesada'], answer: 1, explain: 'O espinho na carne é debatido: pode ser problema visual, oposição ou outra aflição — Paulo não especifica.' },
        { q: 'O Concílio de Jerusalém (Atos 15) decidiu que os gentios convertidos...', opts: ['Deviam seguir toda a Lei judaica', 'Não precisavam ser circuncidados para serem salvos', 'Deviam adorar no Templo', 'Não podiam participar da igreja'], answer: 1, explain: 'O Concílio decidiu que os gentios não precisavam da circuncisão, apenas se abster de certas práticas (Atos 15:28-29).' },
        { q: 'Hebreus 11 é chamado de "galeria da fé" porque...', opts: ['Lista pinturas de santos', 'Apresenta exemplos de fé de personagens do AT', 'Descreve o Templo', 'Fala sobre os anjos'], answer: 1, explain: 'Hebreus 11 lista heróis da fé: Abel, Noé, Abraão, Moisés e muitos outros.' },
        { q: 'A doutrina da "justificação pela fé" de Paulo e as "obras" de Tiago são...', opts: ['Contraditórias e irreconciliáveis', 'Complementares: Paulo fala da base da salvação, Tiago da evidência', 'De autores diferentes que não se conheciam', 'Sobre assuntos completamente diferentes'], answer: 1, explain: 'Paulo enfatiza a fé como meio da salvação; Tiago enfatiza que a fé verdadeira produz obras — são complementares.' },
        { q: 'O Apocalipse foi escrito por João durante seu exílio em...', opts: ['Roma', 'Jerusalém', 'Patmos', 'Éfeso'], answer: 2, explain: 'João escreveu o Apocalipse na ilha de Patmos, exilado por causa do evangelho (Apocalipse 1:9).' }
      ]
    }
  },
  doutrinas: {
    trindade: {
      easy: [
        { q: 'A Trindade é a doutrina de que Deus é...', opts: ['Três deuses separados', 'Um Deus em três Pessoas', 'Apenas o Pai', 'Um Deus que muda de forma'], answer: 1, explain: 'A Trindade afirma que há um só Deus em três Pessoas: Pai, Filho e Espírito Santo.' },
        { q: 'Quais são as três Pessoas da Trindade?', opts: ['Deus, Jesus e Maria', 'Pai, Filho e Espírito Santo', 'Abraão, Moisés e Davi', 'Criador, Salvador e Profeta'], answer: 1, explain: 'As três Pessoas da Trindade são o Pai, o Filho (Jesus) e o Espírito Santo.' },
        { q: 'No batismo de Jesus, as três Pessoas da Trindade estão presentes?', opts: ['Não, apenas Jesus', 'Sim: o Filho é batizado, o Espírito desce e o Pai fala', 'Apenas Jesus e o Espírito', 'Não se sabe'], answer: 1, explain: 'No batismo: Jesus (Filho) é batizado, o Espírito desce como pomba e o Pai fala do céu (Mateus 3:16-17).' },
        { q: 'A palavra "Trindade" aparece na Bíblia?', opts: ['Sim, em Gênesis', 'Sim, em João', 'Não, mas o conceito está nas Escrituras', 'Sim, no Apocalipse'], answer: 2, explain: 'A palavra "Trindade" não aparece na Bíblia, mas o conceito é encontrado em diversas passagens.' },
        { q: 'Jesus Cristo é considerado...', opts: ['Apenas um profeta', 'Apenas um anjo', 'Verdadeiro Deus e verdadeiro homem', 'Apenas um homem sábio'], answer: 2, explain: 'A doutrina cristã afirma que Jesus é plenamente Deus e plenamente homem (duas naturezas, uma pessoa).' }
      ],
      medium: [
        { q: 'O Credo Niceno foi criado para combater qual heresia?', opts: ['Pelagianismo', 'Arianismo (que negava a divindade plena de Cristo)', 'Gnosticismo', 'Docetismo'], answer: 1, explain: 'O Credo Niceno (325 d.C.) combateu o arianismo de Ário, que dizia que Jesus era criatura, não Deus.' },
        { q: 'O que significa dizer que o Filho é "consubstancial" ao Pai?', opts: ['São a mesma Pessoa', 'Têm a mesma essência/natureza divina', 'São semelhantes mas não iguais', 'O Filho é inferior ao Pai'], answer: 1, explain: 'Consubstancial (homoousios) significa que Pai e Filho compartilham a mesma substância divina.' },
        { q: 'O Espírito Santo é...', opts: ['Uma força impessoal', 'A terceira Pessoa da Trindade, plenamente Deus', 'Um anjo poderoso', 'A energia de Deus'], answer: 1, explain: 'O Espírito Santo é a terceira Pessoa da Trindade, pessoal e plenamente Deus.' },
        { q: 'João 1:1 diz "o Verbo era Deus". O Verbo refere-se a...', opts: ['A Bíblia', 'O Espírito Santo', 'Jesus Cristo', 'A criação'], answer: 2, explain: 'O "Verbo" (Logos) em João 1:1 é Jesus Cristo: "No princípio era o Verbo, e o Verbo era Deus".' },
        { q: 'A doutrina trinitária NÃO afirma que...', opts: ['Deus é um em essência', 'Existem três Pessoas distintas', 'Existem três deuses separados', 'Cada Pessoa é plenamente Deus'], answer: 2, explain: 'A Trindade não é triteísmo (três deuses). É um Deus em três Pessoas distintas.' }
      ],
      hard: [
        { q: 'A controvérsia do "Filioque" divide católicos e ortodoxos sobre...', opts: ['A natureza de Cristo', 'Se o Espírito procede do Pai e do Filho ou só do Pai', 'A autoridade do Papa', 'O batismo infantil'], answer: 1, explain: 'Filioque ("e do Filho") foi adicionado ao Credo. Ocidentais dizem que o Espírito procede do Pai e do Filho; orientais, apenas do Pai.' },
        { q: 'O modalismo é a heresia que afirma que...', opts: ['Jesus não é Deus', 'Deus é uma só Pessoa que se manifesta em três modos', 'Existem três deuses', 'O Espírito Santo não existe'], answer: 1, explain: 'O modalismo (sabelianismo) diz que Pai, Filho e Espírito são modos de um só Deus, negando distinção de Pessoas.' },
        { q: 'A "pericórese" trinitária significa...', opts: ['Hierarquia entre as Pessoas', 'Mútua interpenetração e comunhão entre as Pessoas', 'Separação das funções divinas', 'O Filho ser inferior ao Pai'], answer: 1, explain: 'Pericórese descreve a mútua habitação e comunhão eterna entre Pai, Filho e Espírito Santo.' },
        { q: 'A fórmula batismal trinitária "em nome do Pai, do Filho e do Espírito Santo" está em...', opts: ['Marcos 16:15', 'Mateus 28:19', 'João 3:16', 'Atos 2:38'], answer: 1, explain: 'A Grande Comissão em Mateus 28:19 contém a fórmula batismal trinitária.' },
        { q: 'O subordinacionismo ontológico é rejeitado porque...', opts: ['Nega a existência do Espírito', 'Torna o Filho inferior em essência ao Pai', 'Diz que Jesus nunca existiu', 'Nega a ressurreição'], answer: 1, explain: 'O subordinacionismo ontológico é heresia pois faz o Filho ser de natureza inferior ao Pai, contradizendo homoousios.' }
      ]
    },
    salvacao: {
      easy: [
        { q: 'O que significa "graça" no contexto cristão?', opts: ['Merecimento por boas obras', 'Favor imerecido de Deus', 'Uma oração especial', 'Um ritual religioso'], answer: 1, explain: 'Graça é o favor imerecido de Deus dado aos seres humanos por amor.' },
        { q: 'Segundo João 3:16, Deus amou o mundo de tal maneira que...', opts: ['Criou as leis', 'Deu seu Filho unigênito', 'Enviou anjos', 'Construiu o Templo'], answer: 1, explain: '"Deus amou o mundo de tal maneira que deu seu Filho unigênito" (João 3:16).' },
        { q: 'O que é arrependimento?', opts: ['Sentir pena de si mesmo', 'Mudar de mente e direção, voltando-se para Deus', 'Fazer sacrifícios no templo', 'Ir à igreja todo domingo'], answer: 1, explain: 'Arrependimento (metanoia) é uma mudança de mente que leva a mudança de vida, voltando-se para Deus.' },
        { q: 'Quem pode ser salvo segundo a Bíblia?', opts: ['Apenas judeus', 'Apenas pessoas boas', 'Todo aquele que crê em Jesus', 'Apenas os apóstolos'], answer: 2, explain: '"Todo aquele que invocar o nome do Senhor será salvo" (Romanos 10:13).' },
        { q: 'O que Jesus disse ser necessário para entrar no Reino de Deus?', opts: ['Ser rico', 'Nascer de novo', 'Ser sacerdote', 'Nunca pecar'], answer: 1, explain: 'Jesus disse a Nicodemos: "Necessário vos é nascer de novo" (João 3:7).' }
      ],
      medium: [
        { q: 'Efésios 2:8-9 ensina que a salvação é por...', opts: ['Obras e fé juntas', 'Graça mediante a fé, não por obras', 'Guardar a Lei de Moisés', 'Batismo somente'], answer: 1, explain: '"Pela graça sois salvos, mediante a fé; e isto não vem de vós, é dom de Deus" (Efésios 2:8-9).' },
        { q: 'O que é "justificação" na teologia paulina?', opts: ['Tornar-se moralmente perfeito', 'Ser declarado justo por Deus com base na fé', 'Ganhar o perdão por boas obras', 'Seguir todos os mandamentos'], answer: 1, explain: 'Justificação é o ato de Deus declarar o pecador justo pela fé em Cristo (Romanos 5:1).' },
        { q: 'O que é "santificação"?', opts: ['O mesmo que justificação', 'O processo de ser tornado santo pelo Espírito', 'Tornar-se anjo', 'Ser batizado'], answer: 1, explain: 'Santificação é o processo contínuo de crescimento em santidade pela obra do Espírito Santo.' },
        { q: 'A "expiação" refere-se a...', opts: ['Oração diária', 'A obra de Cristo que remove o pecado e reconcilia com Deus', 'Leitura da Bíblia', 'Participar da Ceia'], answer: 1, explain: 'Expiação é a obra de Cristo na cruz que paga pelo pecado e restaura a relação com Deus.' },
        { q: 'Romanos 6:23 diz que "o salário do pecado é a morte, mas o dom de Deus é..."', opts: ['Sabedoria', 'Riqueza', 'A vida eterna em Cristo Jesus', 'Saúde'], answer: 2, explain: '"O dom gratuito de Deus é a vida eterna em Cristo Jesus nosso Senhor" (Romanos 6:23).' }
      ],
      hard: [
        { q: 'A doutrina da "substituição penal" afirma que...', opts: ['Jesus nos deu um exemplo moral', 'Cristo sofreu a penalidade do pecado em nosso lugar', 'Deus simplesmente ignora o pecado', 'A salvação vem por meditação'], answer: 1, explain: 'A substituição penal ensina que Cristo tomou sobre si a punição que nossos pecados mereciam.' },
        { q: 'A "ordo salutis" (ordem da salvação) na teologia reformada inclui...', opts: ['Apenas fé e arrependimento', 'Chamado, regeneração, fé, justificação, santificação e glorificação', 'Batismo, crisma e comunhão', 'Apenas obras e rituais'], answer: 1, explain: 'A ordo salutis descreve os passos lógicos da salvação: do chamado eficaz até a glorificação final.' },
        { q: 'A diferença entre monergismo e sinergismo na salvação é que...', opts: ['Monergismo diz que Deus age sozinho na regeneração; sinergismo requer cooperação humana', 'São a mesma coisa', 'Monergismo nega a graça', 'Sinergismo nega a fé'], answer: 0, explain: 'Monergismo: Deus regenera sozinho. Sinergismo: salvação requer cooperação entre Deus e o homem.' },
        { q: 'A "perseverança dos santos" ensina que...', opts: ['Cristãos nunca pecam', 'Quem é verdadeiramente salvo permanecerá na fé até o fim', 'A salvação pode ser perdida facilmente', 'Somente santos especiais são salvos'], answer: 1, explain: 'A perseverança dos santos afirma que Deus preserva os verdadeiramente regenerados na fé (João 10:28-29).' },
        { q: 'A "imputação da justiça de Cristo" significa que...', opts: ['Nos tornamos moralmente perfeitos', 'A justiça de Cristo é creditada a nós pela fé', 'Devemos imitar Cristo perfeitamente', 'A justiça é conquistada por obras'], answer: 1, explain: 'Imputação significa que a justiça perfeita de Cristo é contada como nossa por meio da fé (2 Coríntios 5:21).' }
      ]
    },
    biblia_doutrina: {
      easy: [
        { q: 'Quantos livros tem a Bíblia protestante?', opts: ['39', '66', '73', '81'], answer: 1, explain: 'A Bíblia protestante tem 66 livros: 39 no Antigo Testamento e 27 no Novo Testamento.' },
        { q: 'A Bíblia foi escrita originalmente em quais idiomas?', opts: ['Latim e grego', 'Hebraico, aramaico e grego', 'Apenas hebraico', 'Apenas grego'], answer: 1, explain: 'O AT foi escrito em hebraico e aramaico; o NT em grego koiné.' },
        { q: 'O que significa dizer que a Bíblia é "inspirada"?', opts: ['Foi escrita por anjos', 'Os autores humanos foram guiados pelo Espírito Santo', 'Foi ditada palavra por palavra', 'É apenas literatura humana'], answer: 1, explain: '"Toda Escritura é inspirada por Deus" (2 Timóteo 3:16) — os autores foram guiados pelo Espírito.' },
        { q: 'Os quatro Evangelhos foram escritos por...', opts: ['Paulo, Pedro, Tiago e João', 'Mateus, Marcos, Lucas e João', 'Moisés, Davi, Salomão e Daniel', 'Pedro, André, Tiago e João'], answer: 1, explain: 'Os Evangelhos são atribuídos a Mateus, Marcos, Lucas e João.' },
        { q: 'O Antigo Testamento e o Novo Testamento são conectados por...', opts: ['Nenhuma relação', 'Profecias cumpridas em Jesus Cristo', 'Apenas história', 'Foram escritos ao mesmo tempo'], answer: 1, explain: 'O AT contém profecias e promessas que encontram cumprimento em Jesus no NT.' }
      ],
      medium: [
        { q: 'O que é o "cânon" bíblico?', opts: ['Um tipo de oração', 'A lista oficial de livros reconhecidos como Escritura', 'O primeiro livro da Bíblia', 'Uma tradução da Bíblia'], answer: 1, explain: 'Cânon é a lista de livros aceitos como Escritura Sagrada inspirada por Deus.' },
        { q: 'O que são os "livros deuterocanônicos"?', opts: ['Livros do Novo Testamento', 'Livros aceitos pelos católicos mas não pelos protestantes no AT', 'Livros escritos por Paulo', 'Livros do Apocalipse'], answer: 1, explain: 'Os deuterocanônicos (ex: Tobias, Macabeus) são aceitos no cânon católico mas não no protestante.' },
        { q: 'A Septuaginta é...', opts: ['A tradução do AT para o latim', 'A tradução do AT do hebraico para o grego', 'O Novo Testamento original', 'Uma versão moderna da Bíblia'], answer: 1, explain: 'A Septuaginta (LXX) é a tradução grega do Antigo Testamento, feita no século III a.C.' },
        { q: '2 Timóteo 3:16-17 é importante porque...', opts: ['Narra a criação do mundo', 'Afirma que toda Escritura é inspirada e útil para ensino', 'Lista os livros da Bíblia', 'Descreve o Apocalipse'], answer: 1, explain: '"Toda Escritura é inspirada por Deus e útil para ensino, repreensão, correção e instrução na justiça".' },
        { q: 'O que significa "hermenêutica bíblica"?', opts: ['Tradução da Bíblia', 'A ciência da interpretação das Escrituras', 'Decorar versículos', 'Leitura em voz alta'], answer: 1, explain: 'Hermenêutica é a disciplina que estuda os princípios e métodos de interpretação da Bíblia.' }
      ],
      hard: [
        { q: 'A doutrina da "inerrância" bíblica afirma que...', opts: ['A Bíblia nunca foi traduzida', 'As Escrituras originais são sem erro em tudo que afirmam', 'Toda tradução é perfeita', 'Os copistas nunca cometeram erros'], answer: 1, explain: 'Inerrância afirma que os manuscritos originais (autógrafos) são sem erro naquilo que afirmam.' },
        { q: 'A "crítica textual" do NT busca...', opts: ['Criticar a Bíblia', 'Reconstruir o texto original comparando milhares de manuscritos', 'Reescrever a Bíblia', 'Eliminar livros do cânon'], answer: 1, explain: 'A crítica textual compara manuscritos para determinar a leitura mais próxima do texto original.' },
        { q: 'A diferença entre "revelação geral" e "revelação especial" é que...', opts: ['São a mesma coisa', 'Geral é pela natureza e consciência; especial é pela Escritura e Cristo', 'Geral é o NT; especial é o AT', 'Geral é para judeus; especial para gentios'], answer: 1, explain: 'Revelação geral vem da criação e consciência; especial vem da Bíblia e da pessoa de Cristo.' },
        { q: 'O princípio "Sola Scriptura" da Reforma significa...', opts: ['A Bíblia é o único livro que existe', 'A Escritura é a única autoridade final e infalível em matéria de fé', 'Só se pode ler a Bíblia', 'A tradição é igualmente autoritativa'], answer: 1, explain: 'Sola Scriptura afirma que a Bíblia é a autoridade suprema e suficiente para fé e prática.' },
        { q: 'O "sensus plenior" na hermenêutica refere-se a...', opts: ['O sentido literal apenas', 'Um sentido mais profundo pretendido por Deus além da intenção do autor humano', 'Tradução literal', 'Leitura devocional'], answer: 1, explain: 'Sensus plenior é o sentido mais pleno que Deus intencionava, além do que o autor humano compreendia.' }
      ]
    },
    escatologia: {
      easy: [
        { q: 'O que significa "escatologia"?', opts: ['Estudo dos anjos', 'Estudo das últimas coisas (fim dos tempos)', 'Estudo da criação', 'Estudo dos profetas'], answer: 1, explain: 'Escatologia vem do grego "eschatos" (último) e "logos" (estudo): estudo dos eventos finais.' },
        { q: 'Jesus prometeu que voltaria?', opts: ['Não', 'Sim, Ele prometeu voltar', 'Apenas simbolicamente', 'Apenas no AT'], answer: 1, explain: 'Jesus prometeu: "Virei outra vez e vos levarei para mim mesmo" (João 14:3).' },
        { q: 'O que é o "céu" na esperança cristã?', opts: ['Um lugar nas nuvens', 'A presença eterna de Deus com os salvos', 'Apenas um estado mental', 'Um planeta distante'], answer: 1, explain: 'O céu é a presença eterna e gloriosa de Deus onde os salvos viverão para sempre.' },
        { q: 'O último livro da Bíblia é...', opts: ['Malaquias', 'Judas', 'Apocalipse', 'Atos'], answer: 2, explain: 'O Apocalipse (Revelação) é o último livro da Bíblia, escrito pelo apóstolo João.' },
        { q: 'O que os cristãos chamam de "Segunda Vinda"?', opts: ['O nascimento de Jesus', 'O retorno glorioso de Cristo à terra', 'O Pentecostes', 'A Reforma'], answer: 1, explain: 'A Segunda Vinda é o retorno prometido de Jesus Cristo em glória (Atos 1:11).' }
      ],
      medium: [
        { q: 'O que é o "arrebatamento" segundo 1 Tessalonicenses 4?', opts: ['A morte de Jesus', 'Crentes sendo levados ao encontro do Senhor nos ares', 'A destruição do Templo', 'A criação do mundo'], answer: 1, explain: 'Paulo descreve crentes sendo "arrebatados nas nuvens para o encontro do Senhor" (1 Ts 4:17).' },
        { q: 'O "milênio" em Apocalipse 20 refere-se a...', opts: ['1000 dias', 'Um período de 1000 anos do reinado de Cristo', 'A eternidade', 'O ministério terreno de Jesus'], answer: 1, explain: 'O milênio é um período de 1000 anos mencionado em Apocalipse 20 associado ao reinado de Cristo.' },
        { q: 'As três principais visões sobre o milênio são...', opts: ['Judaísmo, islamismo e cristianismo', 'Pré-milenismo, pós-milenismo e amilenismo', 'Calvinismo, arminianismo e luteranismo', 'Trinitarismo, unitarismo e deísmo'], answer: 1, explain: 'As três visões escatológicas principais são pré-milenismo, pós-milenismo e amilenismo.' },
        { q: 'O "Juízo Final" é o evento em que...', opts: ['Os judeus voltam a Israel', 'Todos serão julgados por Deus segundo suas obras e fé', 'O Templo é reconstruído', 'Os anjos são julgados'], answer: 1, explain: 'No Juízo Final, todos comparecerão diante de Deus (Apocalipse 20:12).' },
        { q: 'A "Nova Jerusalém" em Apocalipse 21 representa...', opts: ['A cidade terrena reconstruída', 'A morada eterna de Deus com seu povo', 'O Templo de Salomão', 'Roma convertida'], answer: 1, explain: 'A Nova Jerusalém desce do céu como a habitação eterna de Deus com os redimidos (Ap 21:2-3).' }
      ],
      hard: [
        { q: 'O "amilenismo" interpreta os 1000 anos de Apocalipse 20 como...', opts: ['Literal, no futuro', 'Simbólico, representando a era presente da igreja', 'Referindo-se ao passado de Israel', 'Sem nenhum significado'], answer: 1, explain: 'O amilenismo vê os 1000 anos como simbólicos do período entre as duas vindas de Cristo.' },
        { q: 'O "preterismo" interpreta as profecias do Apocalipse como...', opts: ['Futuro distante', 'Já cumpridas no século I (destruição de Jerusalém em 70 d.C.)', 'Puramente simbólicas sem referência histórica', 'Relativas à Reforma'], answer: 1, explain: 'O preterismo entende que muitas profecias do Apocalipse se cumpriram na destruição de Jerusalém em 70 d.C.' },
        { q: 'A doutrina do "estado intermediário" trata de...', opts: ['O que acontece entre a morte e a ressurreição final', 'O período entre AT e NT', 'A vida na Terra', 'O tempo entre Páscoa e Pentecostes'], answer: 0, explain: 'O estado intermediário é o que acontece com a pessoa entre a morte física e a ressurreição corporal futura.' },
        { q: 'A "ressurreição corporal" cristã afirma que...', opts: ['A alma é imortal mas o corpo não', 'Os mortos em Cristo serão ressuscitados com corpos transformados e glorificados', 'Apenas a alma importa', 'Não haverá corpo na eternidade'], answer: 1, explain: 'A fé cristã afirma a ressurreição corporal: corpos transformados como o de Cristo ressurreto (1 Co 15:42-44).' },
        { q: 'O conceito de "já e ainda não" na escatologia significa que...', opts: ['O Reino de Deus já chegou em Cristo mas ainda aguarda sua plenitude futura', 'A salvação já acabou', 'O fim dos tempos já passou', 'Jesus ainda não veio a primeira vez'], answer: 0, explain: 'O "já e ainda não" ensina que o Reino foi inaugurado por Cristo, mas será consumado em sua volta.' }
      ]
    }
  },
  historia_igreja: {
    igreja_primitiva: {
      easy: [
        { q: 'A igreja cristã começou em qual cidade?', opts: ['Roma', 'Atenas', 'Jerusalém', 'Alexandria'], answer: 2, explain: 'A igreja nasceu em Jerusalém no dia de Pentecostes (Atos 2).' },
        { q: 'Os primeiros cristãos eram perseguidos por...', opts: ['Apenas gregos', 'O Império Romano e líderes judaicos', 'Apenas egípcios', 'Ninguém, eram bem aceitos'], answer: 1, explain: 'Os primeiros cristãos sofreram perseguição tanto de autoridades judaicas quanto do Império Romano.' },
        { q: 'Quem foi o primeiro mártir cristão?', opts: ['Pedro', 'Paulo', 'Estêvão', 'Tiago'], answer: 2, explain: 'Estêvão foi o primeiro mártir cristão, apedrejado por seu testemunho de fé (Atos 7:59-60).' },
        { q: 'O que os primeiros cristãos faziam juntos?', opts: ['Apenas oravam', 'Partiam o pão, oravam, ensinavam e compartilhavam bens', 'Construíam templos', 'Faziam guerra'], answer: 1, explain: 'Os primeiros cristãos perseveravam no ensino, comunhão, partir do pão e orações (Atos 2:42).' },
        { q: 'Qual imperador romano legalizou o cristianismo?', opts: ['Nero', 'Constantino', 'Augusto', 'Trajano'], answer: 1, explain: 'Constantino promulgou o Édito de Milão em 313 d.C., legalizando o cristianismo.' }
      ],
      medium: [
        { q: 'O que eram as catacumbas para os primeiros cristãos?', opts: ['Igrejas grandiosas', 'Túneis subterrâneos usados para culto e sepultamento', 'Bibliotecas', 'Palácios secretos'], answer: 1, explain: 'As catacumbas eram galerias subterrâneas onde cristãos se reuniam e sepultavam seus mortos durante perseguições.' },
        { q: 'Qual imperador foi responsável pela grande perseguição de 303-311 d.C.?', opts: ['Constantino', 'Nero', 'Diocleciano', 'Augusto'], answer: 2, explain: 'Diocleciano lançou a última e mais severa perseguição sistemática contra os cristãos.' },
        { q: 'Os "Pais da Igreja" são...', opts: ['Os apóstolos', 'Líderes e teólogos dos primeiros séculos que definiram a doutrina', 'Os profetas do AT', 'Os papas medievais'], answer: 1, explain: 'Pais da Igreja são teólogos como Agostinho, Atanásio e Irineu que moldaram a teologia cristã primitiva.' },
        { q: 'O Édito de Milão (313 d.C.) fez o quê?', opts: ['Proibiu o cristianismo', 'Deu liberdade religiosa aos cristãos', 'Destruiu o Templo', 'Criou o papado'], answer: 1, explain: 'O Édito de Milão, de Constantino, concedeu tolerância religiosa e liberdade aos cristãos.' },
        { q: 'O que Policarpo disse quando pediram que negasse Cristo?', opts: ['"Eu nunca o conheci"', '"86 anos o sirvo e nunca me fez mal. Como posso blasfemar meu Rei?"', '"Eu renuncio"', '"Preciso pensar"'], answer: 1, explain: 'Policarpo de Esmirna, discípulo de João, declarou fidelidade a Cristo ao ser martirizado (~155 d.C.).' }
      ],
      hard: [
        { q: 'O gnosticismo ameaçou a igreja primitiva porque...', opts: ['Negava a encarnação real de Cristo e misturava filosofia grega', 'Seguia os ensinamentos de Paulo', 'Apoiava o Império Romano', 'Era igual ao judaísmo'], answer: 0, explain: 'O gnosticismo negava a matéria como boa, a encarnação real de Cristo e oferecia salvação pelo conhecimento secreto.' },
        { q: 'Irineu de Lyon combateu o gnosticismo com qual argumento central?', opts: ['A filosofia grega', 'A sucessão apostólica e a regra de fé', 'A força militar', 'O isolamento dos hereges'], answer: 1, explain: 'Irineu usou a sucessão apostólica e a regra de fé transmitida desde os apóstolos para refutar os gnósticos.' },
        { q: 'O que era o "montanismo"?', opts: ['Uma filosofia grega', 'Movimento profético rigorista que alegava novas revelações do Espírito', 'Uma escola teológica', 'Uma ordem monástica'], answer: 1, explain: 'Montano e suas profetisas alegavam novas revelações do Espírito, promovendo rigorismo moral e profecia contínua.' },
        { q: 'Tertuliano é famoso pela frase...', opts: ['"Deus é amor"', '"Credo quia absurdum" (creio porque é absurdo)', '"Sola fide"', '"Ora et labora"'], answer: 1, explain: 'Tertuliano (embora a citação exata seja debatida) defendeu que a fé cristã transcende a razão humana.' },
        { q: 'O Édito de Tessalônica (380 d.C.) fez o cristianismo...', opts: ['Ilegal novamente', 'A religião oficial do Império Romano', 'Opcional para soldados', 'Limitado à Palestina'], answer: 1, explain: 'O Édito de Tessalônica, de Teodósio I, tornou o cristianismo niceno a religião oficial do Império Romano.' }
      ]
    },
    conc_credos: {
      easy: [
        { q: 'O que é um "concílio" na história da igreja?', opts: ['Uma guerra santa', 'Uma reunião de líderes cristãos para definir doutrina', 'Uma tradução da Bíblia', 'Uma festa religiosa'], answer: 1, explain: 'Concílios são assembleias de bispos e líderes para resolver questões doutrinárias e práticas.' },
        { q: 'O Credo Apostólico resume...', opts: ['A história de Israel', 'As crenças fundamentais do cristianismo', 'As leis de Moisés', 'Os milagres de Jesus'], answer: 1, explain: 'O Credo Apostólico é um resumo das crenças centrais da fé cristã.' },
        { q: 'O Concílio de Niceia aconteceu em que ano?', opts: ['100 d.C.', '325 d.C.', '500 d.C.', '1054 d.C.'], answer: 1, explain: 'O Concílio de Niceia foi convocado em 325 d.C. pelo imperador Constantino.' },
        { q: 'Qual era a questão principal do Concílio de Niceia?', opts: ['O formato do culto', 'A divindade de Cristo', 'A data da Páscoa apenas', 'A construção de igrejas'], answer: 1, explain: 'Niceia definiu que Cristo é "da mesma substância do Pai", combatendo o arianismo.' },
        { q: 'Um "credo" é...', opts: ['Um livro da Bíblia', 'Uma declaração de fé que resume crenças essenciais', 'Uma oração de pedido', 'Um hino de louvor'], answer: 1, explain: 'Credo (do latim "creio") é uma declaração concisa das crenças essenciais da fé cristã.' }
      ],
      medium: [
        { q: 'O Concílio de Calcedônia (451 d.C.) definiu que Cristo tem...', opts: ['Apenas natureza divina', 'Apenas natureza humana', 'Duas naturezas (divina e humana) em uma pessoa', 'Natureza mista'], answer: 2, explain: 'Calcedônia definiu que Cristo é uma pessoa com duas naturezas: plenamente Deus e plenamente homem, sem confusão.' },
        { q: 'O "monofisismo" é a heresia que afirma que Cristo tem...', opts: ['Duas naturezas', 'Apenas uma natureza (fusão de divina e humana)', 'Três naturezas', 'Nenhuma natureza'], answer: 1, explain: 'O monofisismo diz que Cristo tem apenas uma natureza, fundindo a divina e humana — rejeitado em Calcedônia.' },
        { q: 'O Credo Niceno-Constantinopolitano foi completado em...', opts: ['Niceia (325)', 'Constantinopla (381)', 'Calcedônia (451)', 'Éfeso (431)'], answer: 1, explain: 'O Credo Niceno foi expandido no Concílio de Constantinopla em 381 d.C., incluindo a doutrina do Espírito Santo.' },
        { q: 'O Concílio de Éfeso (431 d.C.) afirmou que Maria é "Theotokos", que significa...', opts: ['Mãe de Deus (portadora de Deus)', 'Rainha do céu', 'Santa perfeita', 'Mediadora'], answer: 0, explain: 'Theotokos ("portadora de Deus") afirma que Maria deu à luz a pessoa divina de Cristo, não apenas sua natureza humana.' },
        { q: 'Atanásio lutou contra o arianismo defendendo que...', opts: ['Cristo é uma criatura superior', 'Cristo é da mesma essência (homoousios) que o Pai', 'Cristo é semelhante ao Pai', 'Cristo é apenas um profeta'], answer: 1, explain: 'Atanásio defendeu firmemente que Cristo é homoousios (da mesma essência) com o Pai.' }
      ],
      hard: [
        { q: 'A "Definição de Calcedônia" usa quatro advérbios negativos para descrever a união das naturezas. Quais?', opts: ['Perfeitamente, eternamente, gloriosamente, fielmente', 'Sem confusão, sem mudança, sem divisão, sem separação', 'Sem pecado, sem erro, sem mal, sem morte', 'Sem início, sem fim, sem limite, sem medida'], answer: 1, explain: 'As duas naturezas estão unidas "sem confusão, sem mudança, sem divisão, sem separação".' },
        { q: 'O nestorianismo, condenado em Éfeso (431), ensinava que...', opts: ['Cristo é apenas Deus', 'Cristo é duas pessoas (uma divina e uma humana)', 'Cristo é uma criatura', 'Cristo não existiu'], answer: 1, explain: 'O nestorianismo separava as naturezas a ponto de sugerir duas pessoas em Cristo — condenado em Éfeso.' },
        { q: 'O "Grande Cisma" de 1054 dividiu...', opts: ['Protestantes e católicos', 'Igreja Católica Romana e Igreja Ortodoxa Oriental', 'Judeus e cristãos', 'Anglicanos e presbiterianos'], answer: 1, explain: 'O Grande Cisma de 1054 separou a Igreja Ocidental (Roma) da Oriental (Constantinopla).' },
        { q: 'O apolinarismo, condenado em Constantinopla (381), errava ao dizer que...', opts: ['Cristo não tinha corpo', 'Cristo tinha mente divina substituindo a mente humana', 'Cristo era dois seres', 'Cristo não era divino'], answer: 1, explain: 'Apolinário ensinou que o Logos divino substituiu a mente humana de Cristo, negando sua humanidade completa.' },
        { q: 'O Credo de Atanásio difere dos outros credos por...', opts: ['Ser mais curto', 'Conter cláusulas anatematizantes e definições trinitárias detalhadas', 'Ser escrito em hebraico', 'Negar a Trindade'], answer: 1, explain: 'O Credo Atanasiano é mais detalhado teologicamente e inclui advertências contra heresias trinitárias.' }
      ]
    },
    reforma: {
      easy: [
        { q: 'Quem iniciou a Reforma Protestante em 1517?', opts: ['João Calvino', 'Martinho Lutero', 'João Wesley', 'Ulrico Zuínglio'], answer: 1, explain: 'Martinho Lutero iniciou a Reforma ao fixar as 95 Teses em Wittenberg em 1517.' },
        { q: 'O que eram as "indulgências" que Lutero criticou?', opts: ['Orações especiais', 'Pagamentos para reduzir o tempo no purgatório', 'Doações voluntárias', 'Livros religiosos'], answer: 1, explain: 'Indulgências eram pagamentos à Igreja que supostamente reduziam penalidades pelo pecado.' },
        { q: 'As "95 Teses" de Lutero foram fixadas na porta de qual igreja?', opts: ['Catedral de Roma', 'Igreja de Wittenberg', 'Catedral de Genebra', 'Igreja de Canterbury'], answer: 1, explain: 'Lutero fixou suas 95 Teses na porta da Igreja do Castelo de Wittenberg, Alemanha.' },
        { q: 'Qual foi o lema central da Reforma sobre a salvação?', opts: ['Sola Ecclesia (só a Igreja)', 'Sola Fide (só a fé)', 'Solo amor', 'Sola Traditio (só a tradição)'], answer: 1, explain: 'Sola Fide (somente a fé) é um dos cinco "Solas" da Reforma: salvação pela fé, não por obras.' },
        { q: 'Em que país a Reforma começou?', opts: ['Inglaterra', 'França', 'Alemanha', 'Suíça'], answer: 2, explain: 'A Reforma começou na Alemanha com Martinho Lutero em 1517.' }
      ],
      medium: [
        { q: 'Quais são os "Cinco Solas" da Reforma?', opts: ['Sola Fide, Sola Gratia, Solus Christus, Sola Scriptura, Soli Deo Gloria', 'Sola Ecclesia, Sola Traditio, Sola Maria, Sola Papa, Sola Roma', 'Apenas três solas existem', 'São dez mandamentos reformados'], answer: 0, explain: 'Os Cinco Solas: Somente a Fé, a Graça, Cristo, a Escritura e a Deus a Glória.' },
        { q: 'João Calvino é mais associado a qual cidade?', opts: ['Wittenberg', 'Zurique', 'Genebra', 'Roma'], answer: 2, explain: 'Calvino estabeleceu seu ministério em Genebra, Suíça, transformando-a em centro da Reforma.' },
        { q: 'A Dieta de Worms (1521) foi o evento em que Lutero...', opts: ['Aceitou voltar ao catolicismo', 'Recusou retratar-se diante do imperador', 'Foi coroado rei', 'Escreveu a Bíblia em alemão'], answer: 1, explain: 'Em Worms, Lutero declarou: "Aqui estou, não posso fazer diferente" e recusou retratar-se.' },
        { q: 'A "Confissão de Augsburgo" (1530) é importante porque...', opts: ['Criou a Igreja Católica', 'É a principal confissão de fé luterana', 'Uniu protestantes e católicos', 'Foi escrita por Calvino'], answer: 1, explain: 'A Confissão de Augsburgo, escrita por Melanchthon, é o documento fundacional da fé luterana.' },
        { q: 'Ulrico Zuínglio liderou a Reforma em...', opts: ['Alemanha', 'França', 'Suíça (Zurique)', 'Escócia'], answer: 2, explain: 'Zuínglio iniciou a Reforma em Zurique, Suíça, de forma independente de Lutero.' }
      ],
      hard: [
        { q: 'A doutrina calvinista dos "Cinco Pontos" (TULIP) inclui...', opts: ['Depravação total, eleição incondicional, expiação limitada, graça irresistível, perseverança dos santos', 'Trindade, unidade, lei, intercessão, profecia', 'Apenas três pontos existem', 'Livre arbítrio, universalismo, legalismo, inovação, pluralismo'], answer: 0, explain: 'TULIP: Total depravity, Unconditional election, Limited atonement, Irresistible grace, Perseverance of the saints.' },
        { q: 'A Contra-Reforma católica foi formalizada no...', opts: ['Concílio de Niceia', 'Concílio de Trento (1545-1563)', 'Concílio Vaticano I', 'Concílio de Éfeso'], answer: 1, explain: 'O Concílio de Trento foi a resposta católica à Reforma, reafirmando doutrinas e implementando reformas internas.' },
        { q: 'John Knox levou a Reforma para qual país?', opts: ['Inglaterra', 'Irlanda', 'Escócia', 'País de Gales'], answer: 2, explain: 'John Knox, influenciado por Calvino, liderou a Reforma na Escócia e fundou o presbiterianismo escocês.' },
        { q: 'Os anabatistas se diferenciavam dos outros reformadores por...', opts: ['Rejeitarem a Bíblia', 'Defenderem o batismo apenas de crentes adultos e separação igreja-estado', 'Apoiarem o papado', 'Serem católicos secretos'], answer: 1, explain: 'Os anabatistas rejeitavam o batismo infantil e defendiam a separação completa entre igreja e estado.' },
        { q: 'A "Paz de Augsburgo" (1555) estabeleceu o princípio...', opts: ['"Uma só fé para todos"', '"Cuius regio, eius religio" (a religião do príncipe determina a da região)', '"Liberdade religiosa individual"', '"Todos devem ser católicos"'], answer: 1, explain: 'A Paz de Augsburgo permitiu que cada príncipe escolhesse entre luteranismo e catolicismo para seu território.' }
      ]
    },
    igreja_moderna: {
      easy: [
        { q: 'O "Grande Avivamento" nos EUA aconteceu no século...', opts: ['XV', 'XVI', 'XVIII', 'XX'], answer: 2, explain: 'O Primeiro Grande Avivamento ocorreu na década de 1730-1740 nos EUA e Inglaterra.' },
        { q: 'Quem fundou o movimento metodista?', opts: ['Martinho Lutero', 'João Wesley', 'João Calvino', 'Charles Spurgeon'], answer: 1, explain: 'João Wesley fundou o movimento metodista no século XVIII na Inglaterra.' },
        { q: 'O movimento missionário moderno é frequentemente associado a...', opts: ['Constantino', 'William Carey', 'Martinho Lutero', 'Agostinho'], answer: 1, explain: 'William Carey (1761-1834) é chamado de "pai das missões modernas" por seu trabalho na Índia.' },
        { q: 'O que é o "ecumenismo"?', opts: ['Uma doutrina específica', 'Movimento que busca unidade entre diferentes denominações cristãs', 'Uma seita', 'Um tipo de culto'], answer: 1, explain: 'O ecumenismo é o movimento pela unidade e diálogo entre as diversas denominações cristãs.' },
        { q: 'O movimento pentecostal moderno teve início em...', opts: ['1517', '1700', 'Início do século XX (1906)', '1990'], answer: 2, explain: 'O pentecostalismo moderno é frequentemente associado ao Avivamento da Rua Azusa em Los Angeles (1906).' }
      ],
      medium: [
        { q: 'O que foi o "Avivamento da Rua Azusa" (1906)?', opts: ['Uma reforma política', 'Um marco do pentecostalismo com ênfase nos dons do Espírito', 'Uma conferência acadêmica', 'Uma publicação teológica'], answer: 1, explain: 'A Rua Azusa em Los Angeles foi o epicentro do avivamento pentecostal com manifestações dos dons do Espírito.' },
        { q: 'O Concílio Vaticano II (1962-1965) trouxe mudanças como...', opts: ['Rejeição do cristianismo', 'Missa em língua vernácula e diálogo com outras religiões', 'Proibição do ecumenismo', 'Retorno ao latim obrigatório'], answer: 1, explain: 'O Vaticano II modernizou a liturgia católica, permitiu a missa em língua local e abriu diálogo ecumênico.' },
        { q: 'A "teologia da libertação" surgiu na...', opts: ['Europa medieval', 'América Latina no século XX', 'Grécia antiga', 'Reforma do século XVI'], answer: 1, explain: 'A teologia da libertação surgiu na América Latina nos anos 1960-70, enfatizando justiça social e os pobres.' },
        { q: 'Charles Spurgeon ficou conhecido como...', opts: ['O Papa protestante', 'O Príncipe dos Pregadores', 'O Pai da Reforma', 'O Apóstolo dos gentios'], answer: 1, explain: 'Charles Spurgeon (1834-1892) foi chamado de "Príncipe dos Pregadores" por seu ministério em Londres.' },
        { q: 'Em qual continente vive hoje o maior número de cristãos?', opts: ['Europa', 'América do Norte', 'África', 'Ásia'], answer: 2, explain: 'A África passou a Europa e a América Latina na última década; o centro de gravidade do cristianismo mudou para o Sul Global.' }
      ],
      hard: [
        { q: 'A "Declaração de Lausanne" (1974) é significativa porque...', opts: ['Uniu católicos e protestantes', 'Renovou o compromisso evangélico com evangelização mundial e responsabilidade social', 'Rejeitou missões', 'Fundou uma nova denominação'], answer: 1, explain: 'A Declaração de Lausanne, liderada por Billy Graham e John Stott, reafirmou o compromisso evangélico global.' },
        { q: 'Dietrich Bonhoeffer é lembrado por...', opts: ['Fundar o pentecostalismo', 'Resistir ao nazismo e morrer por sua fé', 'Ser o primeiro papa protestante', 'Traduzir a Bíblia para o inglês'], answer: 1, explain: 'Bonhoeffer foi teólogo luterano que resistiu ao regime nazista e foi executado em 1945.' },
        { q: 'O "Documento de Chicago sobre Inerrância" (1978) afirmou que...', opts: ['A Bíblia contém erros aceitáveis', 'A Escritura é sem erro nos manuscritos originais em tudo que afirma', 'Apenas o NT é confiável', 'A tradição supera a Bíblia'], answer: 1, explain: 'O Documento de Chicago reafirmou a inerrância bíblica como posição evangélica.' },
        { q: 'O crescimento do cristianismo na China é notável porque...', opts: ['O governo sempre apoiou', 'Cresceu massivamente apesar de décadas de perseguição comunista', 'Foi introduzido recentemente', 'Já era religião majoritária'], answer: 1, explain: 'O cristianismo na China cresceu de forma impressionante apesar de perseguição, especialmente via igrejas domésticas.' },
        { q: 'Karl Barth influenciou a teologia do século XX ao...', opts: ['Defender o liberalismo teológico', 'Reagir contra o liberalismo com a neo-ortodoxia centrada na revelação de Deus', 'Negar a existência de Deus', 'Fundar o pentecostalismo'], answer: 1, explain: 'Barth liderou a neo-ortodoxia, enfatizando a transcendência de Deus e a centralidade de Cristo contra o liberalismo.' }
      ]
    }
  }
};

function cloneQuestionTopicBank(topicBank = {}) {
  return JSON.parse(JSON.stringify(topicBank && typeof topicBank === 'object' ? topicBank : {}));
}

QUESTIONS.mundo_cultura = {
  curiosidades_mundo: cloneQuestionTopicBank(QUESTIONS.assuntos_gerais?.curiosidades_mundo),
  geografia_culturas: cloneQuestionTopicBank(QUESTIONS.assuntos_gerais?.geografia_culturas)
};

QUESTIONS.historia_sociedade = {
  historia_geral: cloneQuestionTopicBank(QUESTIONS.assuntos_gerais?.historia_geral),
  cotidiano_sociedade: cloneQuestionTopicBank(QUESTIONS.assuntos_gerais?.cotidiano_sociedade)
};

QUESTIONS.ciencia_criatividade = {
  ciencia_espaco: cloneQuestionTopicBank(QUESTIONS.assuntos_gerais?.ciencia_espaco),
  artes_entretenimento: cloneQuestionTopicBank(QUESTIONS.assuntos_gerais?.artes_entretenimento)
};

export { LANGUAGES, TOPICS, QUESTIONS };
