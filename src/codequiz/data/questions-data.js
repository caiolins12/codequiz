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
  { id: 'sql', name: 'SQL', icon: '🗄️', color: '#336791', desc: 'Consulte e gerencie dados' }
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
        { q: 'Qual algoritmo de ordenação compara pares adjacentes e troca se estiverem fora de ordem?', opts: ['Merge Sort', 'Quick Sort', 'Bubble Sort', 'Binary Search'], answer: 2, explain: 'Bubble Sort "borbulha" o maior elemento para o final comparando pares adjacentes.' }
      ],
      hard: [
        { q: 'Qual é a complexidade do Bubble Sort no pior caso?', opts: ['O(N)', 'O(N log N)', 'O(N²)', 'O(log N)'], answer: 2, explain: 'Bubble Sort compara todos os pares em cada passada: N × N = O(N²).' },
        { q: 'O que é recursão?', opts: ['Um loop infinito', 'Uma função que chama a si mesma', 'Um tipo de variável', 'Um erro de programação'], answer: 1, explain: 'Recursão é quando uma função se chama com um subproblema menor até atingir um caso base.' },
        { q: 'Todo algoritmo recursivo precisa de...', opts: ['Um loop for', 'Um caso base', 'Variáveis globais', 'Múltiplas funções'], answer: 1, explain: 'Sem caso base, a recursão nunca para (stack overflow). O caso base é a condição de parada.' }
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
        { q: 'Qual é a vantagem de criar um fluxograma ANTES de programar?', opts: ['Não tem vantagem', 'Visualizar a lógica e encontrar erros antes de codificar', 'É obrigatório por lei', 'Deixa o código mais rápido'], answer: 1, explain: 'Fluxogramas ajudam a planejar a lógica visualmente, facilitando encontrar falhas antes de escrever código.' }
      ],
      hard: [
        { q: 'O que é um fluxograma estruturado?', opts: ['Usa apenas retângulos', 'Segue regras de programação estruturada (sequência, decisão, repetição)', 'Tem mais de 100 passos', 'Usa cores'], answer: 1, explain: 'Fluxograma estruturado usa apenas 3 estruturas: sequência, seleção (if) e repetição (loop).' },
        { q: 'Um losango com a condição "contador < 10" seguido de uma seta voltando ao início representa...', opts: ['Uma função', 'Um loop while', 'Uma entrada de dados', 'Um erro'], answer: 1, explain: 'A condição + seta de retorno forma um loop: repete enquanto contador < 10.' }
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
        { q: 'O que acontece ao somar um inteiro com um float?', opts: ['Erro', 'O resultado é inteiro', 'O resultado é float', 'O resultado é string'], answer: 2, explain: 'Na maioria das linguagens, o inteiro é promovido a float e o resultado é float.' }
      ],
      hard: [
        { q: 'O que é escopo de variável?', opts: ['O tamanho da variável', 'A região do código onde a variável é acessível', 'O tipo da variável', 'A velocidade de acesso'], answer: 1, explain: 'Escopo define onde a variável pode ser lida/modificada: local (dentro da função) ou global (todo o programa).' },
        { q: 'O que é passagem por valor vs passagem por referência?', opts: ['São a mesma coisa', 'Valor: copia o dado. Referência: compartilha o endereço', 'Referência é mais segura', 'Valor é mais rápido sempre'], answer: 1, explain: 'Por valor: a função recebe uma cópia. Por referência: recebe o endereço original e pode modificá-lo.' }
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
        { q: 'O que são condicionais aninhados?', opts: ['Condicionais lado a lado', 'Um if dentro de outro if', 'Condicionais sem else', 'Loops com condição'], answer: 1, explain: 'Aninhamento: um bloco condicional dentro de outro, criando múltiplos níveis de decisão.' }
      ],
      hard: [
        { q: 'O que é curto-circuito em avaliação lógica?', opts: ['Um erro elétrico', 'Parar de avaliar quando o resultado já é certo', 'Um tipo de loop', 'Uma variável booleana'], answer: 1, explain: 'Em "falso AND X", X não é avaliado (resultado já é falso). Em "verdadeiro OR X", X não é avaliado (já é verdadeiro).' },
        { q: 'Qual a vantagem de usar switch em vez de múltiplos if-else?', opts: ['É mais rápido sempre', 'Mais legível quando há muitos valores fixos para comparar', 'Não tem vantagem', 'Aceita condições complexas'], answer: 1, explain: 'Switch é mais claro quando testamos uma variável contra muitos valores específicos.' }
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
        { q: 'Qual o resultado: soma=0; para i de 1 até 4: soma = soma + i', opts: ['4', '10', '6', '0'], answer: 1, explain: 'soma = 0+1+2+3+4 = 10.' }
      ],
      hard: [
        { q: 'O que são loops aninhados?', opts: ['Dois loops em sequência', 'Um loop dentro de outro', 'Loop com break', 'Loop sem condição'], answer: 1, explain: 'Loop aninhado: para cada iteração do loop externo, o loop interno executa completamente.' },
        { q: 'Se temos um loop de 1 a N dentro de outro loop de 1 a N, quantas vezes o bloco interno executa?', opts: ['N', '2N', 'N²', 'N + N'], answer: 2, explain: 'N iterações externas × N internas = N² execuções totais.' },
        { q: 'Qual técnica transforma um loop em uma chamada de função que se repete?', opts: ['Iteração', 'Recursão', 'Casting', 'Herança'], answer: 1, explain: 'Recursão substitui loops: a função chama a si mesma com um caso base para parar.' }
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
        { q: 'O que é uma lista ligada (linked list)?', opts: ['Um array dinâmico', 'Elementos conectados por ponteiros/referências', 'Uma lista ordenada', 'Um tipo de pilha'], answer: 1, explain: 'Cada elemento (nó) aponta para o próximo, formando uma cadeia dinâmica.' }
      ],
      hard: [
        { q: 'Qual estrutura de dados usa chave-valor?', opts: ['Array', 'Pilha', 'Dicionário/HashMap', 'Fila'], answer: 2, explain: 'Dicionário/HashMap armazena pares (chave → valor) com busca rápida pela chave.' },
        { q: 'Qual é a complexidade de busca em um HashMap?', opts: ['O(N)', 'O(log N)', 'O(1) em média', 'O(N²)'], answer: 2, explain: 'HashMap usa hashing para acesso direto: O(1) na média, O(N) no pior caso.' },
        { q: 'O que é uma árvore binária?', opts: ['Estrutura com 2 elementos', 'Cada nó tem no máximo 2 filhos', 'Array de 2 dimensões', 'Pilha dupla'], answer: 1, explain: 'Árvore binária: cada nó tem até 2 filhos (esquerdo e direito). Usada em busca, ordenação, etc.' }
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
        { q: 'O que significa requisito em um problema de programação?', opts: ['A cor da tela', 'Uma condição/regra que a solução deve atender', 'Somente o nome da variável', 'Um erro de compilação'], answer: 1, explain: 'Requisitos descrevem o que a solução precisa fazer corretamente.' }
      ],
      hard: [
        { q: 'Um algoritmo é determinístico quando...', opts: ['Sempre usa inteligência artificial', 'Com a mesma entrada, produz a mesma saída', 'Roda apenas em um sistema operacional', 'Tem no máximo 10 passos'], answer: 1, explain: 'Determinístico significa previsível: mesma entrada, mesmo resultado.' },
        { q: 'Abstração em programação é...', opts: ['Ignorar o problema', 'Esconder detalhes desnecessários e focar no essencial', 'Escrever sem testar', 'Usar apenas gráficos'], answer: 1, explain: 'Abstração reduz complexidade ao focar no que importa para resolver o problema.' },
        { q: 'Caso de borda (edge case) é...', opts: ['O caso mais comum', 'Um cenário extremo que pode quebrar a solução', 'Uma regra de estilo', 'Uma variável global'], answer: 1, explain: 'Casos de borda testam limites, como lista vazia, zero, valores mínimos e máximos.' }
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
        { q: 'Em algoritmos, uma ordem mal definida gera principalmente...', opts: ['Código mais curto', 'Ambiguidade e resultados imprevisíveis', 'Mais segurança', 'Mais memória disponível'], answer: 1, explain: 'Ambiguidade permite interpretações diferentes e erros de execução.' }
      ],
      hard: [
        { q: 'Escolher uma ordem que minimiza retrabalho é exemplo de...', opts: ['Otimização de fluxo', 'Erro sintático', 'Tipagem dinâmica', 'Recursão infinita'], answer: 0, explain: 'Boa ordem de execução reduz dependências quebradas e retrabalho.' },
        { q: 'Ao detectar dependências entre tarefas, você está modelando...', opts: ['Entrada e saída de áudio', 'Relações de precedência', 'Estilo visual', 'Conexão de internet'], answer: 1, explain: 'Precedência indica quais tarefas precisam vir antes de outras.' },
        { q: 'Uma sequência robusta deve considerar...', opts: ['Somente o caso ideal', 'Casos normais e de erro', 'Apenas interface gráfica', 'Apenas velocidade'], answer: 1, explain: 'Fluxos robustos contemplam sucesso e falhas esperadas.' }
      ]
    },
    boolean_reasoning: {
      easy: [
        { q: 'Booleano representa quais valores?', opts: ['Texto e número', 'Verdadeiro e falso', 'Somente números positivos', 'Letras maiúsculas e minúsculas'], answer: 1, explain: 'Tipo booleano possui apenas dois estados: true ou false.' },
        { q: 'Se idade = 20, a condição idade >= 18 é...', opts: ['Falsa', 'Verdadeira', 'Indefinida', 'Erro'], answer: 1, explain: '20 é maior ou igual a 18, então a condição é verdadeira.' },
        { q: 'No operador E (AND), o resultado é verdadeiro quando...', opts: ['Pelo menos uma condição é verdadeira', 'As duas condições são verdadeiras', 'As duas são falsas', 'Sempre'], answer: 1, explain: 'AND exige que todas as partes sejam verdadeiras.' },
        { q: 'No operador OU (OR), o resultado é verdadeiro quando...', opts: ['As duas são falsas', 'Pelo menos uma é verdadeira', 'A primeira é falsa', 'Sempre'], answer: 1, explain: 'OR retorna verdadeiro se qualquer condição for verdadeira.' },
        { q: 'O operador NÃO (NOT) faz o quê?', opts: ['Soma valores', 'Inverte verdadeiro/falso', 'Compara números', 'Repete condição'], answer: 1, explain: 'NOT transforma true em false e false em true.' }
      ],
      medium: [
        { q: 'Qual resultado de: verdadeiro AND falso?', opts: ['Verdadeiro', 'Falso', 'Erro', 'Nulo'], answer: 1, explain: 'No AND, basta uma condição falsa para o resultado final ser falso.' },
        { q: 'Qual resultado de: falso OR verdadeiro?', opts: ['Verdadeiro', 'Falso', 'Erro', 'Depende da linguagem'], answer: 0, explain: 'No OR, uma condição verdadeira já torna o resultado verdadeiro.' },
        { q: 'Qual expressão representa: "idade entre 18 e 60"?', opts: ['idade > 18 OR idade < 60', 'idade >= 18 AND idade <= 60', 'idade == 18 AND idade == 60', 'idade < 18 AND idade > 60'], answer: 1, explain: 'Para estar entre dois limites, as duas comparações devem ser verdadeiras.' },
        { q: 'Qual é a saída lógica de NOT(verdadeiro OR falso)?', opts: ['Verdadeiro', 'Falso', 'Erro', 'Nulo'], answer: 1, explain: 'verdadeiro OR falso = verdadeiro; NOT(verdadeiro) = falso.' }
      ],
      hard: [
        { q: 'NOT(A AND B) é equivalente a...', opts: ['NOT A AND NOT B', 'NOT A OR NOT B', 'A OR B', 'A AND B'], answer: 1, explain: 'Lei de De Morgan: NOT(A AND B) = (NOT A) OR (NOT B).' },
        { q: 'NOT(A OR B) é equivalente a...', opts: ['NOT A OR NOT B', 'NOT A AND NOT B', 'A AND B', 'A OR B'], answer: 1, explain: 'Lei de De Morgan: NOT(A OR B) = (NOT A) AND (NOT B).' },
        { q: 'Uma condição bem escrita deve priorizar...', opts: ['Frases vagas', 'Clareza e ausência de ambiguidade', 'Quantidade de operadores', 'Uso de termos técnicos difíceis'], answer: 1, explain: 'Condições claras reduzem erros de lógica e manutenção.' }
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
        { q: 'Qual resultado de (2 + 3) * 4?', opts: ['14', '10', '20', '24'], answer: 2, explain: 'Parênteses têm prioridade: (2+3)=5; 5*4 = 20.' },
        { q: 'Se x começa em 10 e fazemos x = x + 5, novo x é...', opts: ['5', '10', '15', '20'], answer: 2, explain: 'A expressão soma 5 ao valor atual de x.' },
        { q: 'Qual expressão verifica se n é par?', opts: ['n % 2 == 0', 'n / 2 == 1', 'n % 2 == 1', 'n > 2'], answer: 0, explain: 'Números pares têm resto 0 ao dividir por 2.' }
      ],
      hard: [
        { q: 'Qual resultado de 17 % 5?', opts: ['2', '3', '4', '5'], answer: 0, explain: '17 = 5*3 + 2, então o resto é 2.' },
        { q: 'Em muitas linguagens, x += 3 equivale a...', opts: ['x = 3', 'x = x + 3', 'x = x - 3', 'x == 3'], answer: 1, explain: 'Operador composto += soma e reatribui na mesma variável.' },
        { q: 'Qual expressão é mais segura para média de a e b?', opts: ['a + b / 2', '(a + b) / 2', 'a / b + 2', 'a + (b / 0)'], answer: 1, explain: 'Parênteses evitam erro de precedência e deixam a intenção clara.' }
      ]
    },
    trace_execution: {
      easy: [
        { q: 'Se x = 2 e depois x = x + 3, qual o valor final de x?', opts: ['2', '3', '5', '6'], answer: 2, explain: 'x começa em 2 e recebe 2 + 3, ficando 5.' },
        { q: 'Se total = 10 e fazemos total = total - 4, total vira...', opts: ['14', '6', '4', '10'], answer: 1, explain: '10 - 4 = 6.' },
        { q: 'Qual valor de y após: y = 1; y = y * 4?', opts: ['1', '4', '5', '0'], answer: 1, explain: 'y é atualizado para 1*4, então y=4.' },
        { q: 'Após: a = 5; b = a; a = 9, qual valor de b?', opts: ['9', '5', '14', '0'], answer: 1, explain: 'b recebeu cópia de a quando a valia 5.' },
        { q: 'Qual técnica ajuda a acompanhar variáveis passo a passo?', opts: ['Tabela de rastreio', 'Ignorar testes', 'Somente decorar sintaxe', 'Remover comentários'], answer: 0, explain: 'Tabela de rastreio mostra como cada variável muda por linha.' }
      ],
      medium: [
        { q: 'Qual valor final de soma?\nsoma = 0\npara i de 1 até 3:\n  soma = soma + i', opts: ['3', '6', '9', '1'], answer: 1, explain: 'soma = 0+1+2+3 = 6.' },
        { q: 'Qual valor de contador após 4 repetições iniciando em 0 e incrementando de 1 em 1?', opts: ['3', '4', '5', '0'], answer: 1, explain: 'Após 4 incrementos: 0 -> 1 -> 2 -> 3 -> 4.' },
        { q: 'Se x = 8, y = 3 e trocamos os valores usando auxiliar t, qual é o resultado?', opts: ['x=8, y=3', 'x=3, y=8', 'x=11, y=0', 'x=0, y=11'], answer: 1, explain: 'Troca correta com variável temporária inverte os valores.' },
        { q: 'Em rastreio, qual erro é comum?', opts: ['Atualizar uma variável sem registrar', 'Usar linha numerada', 'Anotar estado inicial', 'Conferir condição'], answer: 0, explain: 'Esquecer atualização leva a conclusões erradas sobre o algoritmo.' }
      ],
      hard: [
        { q: 'Se n=3 e loop "enquanto n > 0: n = n - 1", quantas iterações ocorrem?', opts: ['1', '2', '3', '4'], answer: 2, explain: 'n passa por 3,2,1 e para quando vira 0. Total de 3 iterações.' },
        { q: 'Por que rastrear condição de parada é crítico?', opts: ['Para usar menos memória sempre', 'Para evitar loop infinito e travamentos', 'Para aumentar tamanho do código', 'Para reduzir variáveis'], answer: 1, explain: 'Sem condição de parada correta, o fluxo pode nunca terminar.' },
        { q: 'Rastrear execução ajuda principalmente a...', opts: ['Substituir testes automatizados totalmente', 'Entender causa de erro lógico', 'Evitar escrever código', 'Aumentar o número de arquivos'], answer: 1, explain: 'Rastreio revela onde a lógica diverge do esperado.' }
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
        { q: 'Qual atitude melhora depuração em equipe?', opts: ['Esconder contexto do erro', 'Descrever passos, entrada e saída esperada', 'Enviar só print sem detalhes', 'Mudar o problema'], answer: 1, explain: 'Contexto claro ajuda outros a reproduzir e resolver rapidamente.' }
      ],
      hard: [
        { q: 'Um bom relatório de bug deve conter...', opts: ['Apenas "não funciona"', 'Passos para reproduzir, esperado, obtido e ambiente', 'Somente o nome do arquivo', 'Somente horário'], answer: 1, explain: 'Esses dados permitem reproduzir e tratar o problema com precisão.' },
        { q: 'Por que corrigir sem entender causa raiz é arriscado?', opts: ['Porque sempre piora performance', 'Pode mascarar o sintoma e o bug voltar', 'Porque impede deploy', 'Porque aumenta o número de telas'], answer: 1, explain: 'Sem causa raiz, a correção pode ser parcial e instável.' },
        { q: 'Qual prática reduz erros ao longo do tempo?', opts: ['Evitar revisão de código', 'Refatorar trechos confusos e manter testes', 'Remover validações', 'Aumentar complexidade'], answer: 1, explain: 'Código claro + testes constantes reduz chance de novos bugs.' }
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
        { q: 'Qual é o resultado?', code: 'console.log(!!"" === !!0);', opts: ['true', 'false', 'Error', 'undefined'], answer: 0, explain: '!!"" = false, !!0 = false. false === false = true.' }
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
        { q: 'Qual é o resultado?', code: 'let i = 5;\nwhile (i > 0) {\n  i -= 2;\n}\nconsole.log(i);', opts: ['0', '-1', '1', '2'], answer: 1, explain: 'i: 5→3→1→-1. Quando i=-1, a condição i>0 é false.' }
      ],
      hard: [
        { q: 'Qual é o resultado?', code: 'for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}', opts: ['0, 1, 2', '3, 3, 3', '0, 0, 0', 'Error'], answer: 1, explain: 'var não tem escopo de bloco. Quando os callbacks executam, i já é 3.' },
        { q: 'Qual é o resultado?', code: 'const a = [10, 20, 30];\nfor (const [i, v] of a.entries()) {\n  if (i === 1) break;\n}\nconsole.log("done");', opts: ['"done"', 'Error', '10', 'undefined'], answer: 0, explain: 'O break sai do loop. "done" é impresso normalmente após o for.' },
        { q: 'Quantas iterações?', code: 'let n = 64;\nlet c = 0;\nwhile (n > 1) {\n  n = Math.floor(n / 2);\n  c++;\n}\nconsole.log(c);', opts: ['6', '32', '64', '8'], answer: 0, explain: '64→32→16→8→4→2→1 = 6 divisões (log2 de 64).' }
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
        { q: 'Qual é o resultado?', code: 'const fn = function() {\n  return 42;\n};\nconsole.log(typeof fn);', opts: ['"number"', '"function"', '"object"', '"undefined"'], answer: 1, explain: 'fn é uma expressão de função. typeof retorna "function".' }
      ],
      hard: [
        { q: 'Qual é o resultado?', code: 'function counter() {\n  let n = 0;\n  return () => ++n;\n}\nconst c = counter();\nc(); c();\nconsole.log(c());', opts: ['1', '2', '3', '0'], answer: 2, explain: 'Closure: a função interna mantém acesso a n. Cada chamada incrementa.' },
        { q: 'Qual é o resultado?', code: 'const add = a => b => a + b;\nconsole.log(add(2)(3));', opts: ['5', '23', 'Error', 'undefined'], answer: 0, explain: 'Currying: add(2) retorna b => 2 + b. Depois (3) = 2 + 3 = 5.' },
        { q: 'Qual é o resultado?', code: 'function foo() {\n  console.log(this);\n}\nconst obj = { foo };\nconst bar = obj.foo;\nbar();', opts: ['obj', 'window/global', 'undefined', 'Error'], answer: 1, explain: 'bar é chamado sem contexto. Em não-strict mode, this = window/global.' }
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
        { q: 'Qual é o resultado?', code: 'const a = [1, 2, 3];\nconst s = a.reduce((acc, x) => acc + x, 0);\nconsole.log(s);', opts: ['6', '[1, 2, 3]', '0', '3'], answer: 0, explain: 'reduce() acumula: 0+1=1, 1+2=3, 3+3=6.' }
      ],
      hard: [
        { q: 'Qual é o resultado?', code: 'const a = [3, 1, 4, 1, 5];\na.sort();\nconsole.log(a[0]);', opts: ['1', '3', '5', '0'], answer: 0, explain: 'sort() sem argumento ordena como strings. Resultado: [1,1,3,4,5].' },
        { q: 'Qual é o resultado?', code: 'const a = [[1,2],[3,4],[5]];\nconsole.log(a.flat().length);', opts: ['3', '5', '6', 'Error'], answer: 1, explain: 'flat() achata um nível: [1,2,3,4,5]. Length = 5.' },
        { q: 'Qual é o resultado?', code: 'const a = [1,2,3];\nconst b = [...a];\nb.push(4);\nconsole.log(a.length);', opts: ['3', '4', 'Error', 'undefined'], answer: 0, explain: 'Spread cria cópia rasa. Alterar b não afeta a.' }
      ]
    },
    objects: {
      easy: [
        { q: 'Como acessar a propriedade "nome" de um objeto?', opts: ['obj.nome', 'obj[nome]', 'obj->nome', 'obj::nome'], answer: 0, explain: 'Notação de ponto: obj.nome. Também funciona obj["nome"].' },
        { q: 'Qual é o resultado?', code: 'const obj = { a: 1, b: 2 };\nconsole.log(Object.keys(obj));', opts: ['[1, 2]', '["a", "b"]', '{a: 1}', '2'], answer: 1, explain: 'Object.keys() retorna um array com as chaves do objeto.' },
        { q: 'Como adicionar uma propriedade a um objeto?', opts: ['obj.add("x", 1)', 'obj.x = 1', 'obj.push(x)', 'obj.insert("x")'], answer: 1, explain: 'Basta atribuir: obj.x = 1 ou obj["x"] = 1.' },
        { q: 'Qual é o resultado?', code: 'const obj = {x: 10};\nconsole.log("x" in obj);', opts: ['true', 'false', '10', 'Error'], answer: 0, explain: 'O operador "in" verifica se uma propriedade existe no objeto.' }
      ],
      medium: [
        { q: 'Qual é o resultado?', code: 'const a = {x: 1};\nconst b = a;\nb.x = 2;\nconsole.log(a.x);', opts: ['1', '2', 'undefined', 'Error'], answer: 1, explain: 'Objetos são passados por referência. a e b apontam para o mesmo objeto.' },
        { q: 'O que Object.freeze() faz?', opts: ['Deleta o objeto', 'Impede modificações', 'Copia o objeto', 'Converte para string'], answer: 1, explain: 'Object.freeze() torna o objeto imutável (propriedades não podem ser alteradas).' },
        { q: 'Qual é o resultado?', code: 'const {a, ...rest} = {a:1, b:2, c:3};\nconsole.log(rest);', opts: ['{b:2, c:3}', '{a:1}', '[2, 3]', 'Error'], answer: 0, explain: 'Rest operator coleta as propriedades restantes em um novo objeto.' }
      ],
      hard: [
        { q: 'Qual é o resultado?', code: 'const obj = {};\nobj[{}] = "a";\nobj[{}] = "b";\nconsole.log(Object.keys(obj).length);', opts: ['0', '1', '2', 'Error'], answer: 1, explain: 'Qualquer objeto como chave é convertido para "[object Object]". Mesma chave, sobrescreve.' },
        { q: 'Qual é o resultado?', code: 'const p = {get x() { return 42; }};\nconsole.log(p.x);', opts: ['42', 'undefined', 'function', 'Error'], answer: 0, explain: 'Getter: acessar p.x chama a função get que retorna 42.' }
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
        { q: 'O que é None em Python?', opts: ['0', 'False', 'Ausência de valor', 'String vazia'], answer: 2, explain: 'None representa ausência de valor (equivalente a null em outras linguagens).' }
      ],
      hard: [
        { q: 'Qual é o resultado?', code: 'a = [1, [2, 3]]\nb = a.copy()\nb[1].append(4)\nprint(a[1])', opts: ['[2, 3]', '[2, 3, 4]', 'Error', '[1, [2, 3]]'], answer: 1, explain: 'copy() é cópia rasa. A lista interna é compartilhada.' },
        { q: 'Qual é o resultado?', code: 'x = (1,)\ny = (1)\nprint(type(x).__name__, type(y).__name__)', opts: ['tuple tuple', 'tuple int', 'int int', 'Error'], answer: 1, explain: '(1,) é tupla (note a vírgula). (1) é apenas o inteiro 1 entre parênteses.' },
        { q: 'Qual é o resultado?', code: 'print(bool(""), bool(" "))', opts: ['False False', 'True True', 'False True', 'True False'], answer: 2, explain: 'String vazia é falsy, mas string com espaço é truthy.' }
      ]
    },
    conditionals: {
      easy: [
        { q: 'Qual é a sintaxe correta de if em Python?', opts: ['if (x > 5) {}', 'if x > 5:', 'if x > 5 then', 'if [x > 5]'], answer: 1, explain: 'Em Python, if usa dois-pontos e indentação, sem parênteses obrigatórios.' },
        { q: 'Qual palavra-chave substitui "else if" em Python?', opts: ['elseif', 'else if', 'elif', 'elsif'], answer: 2, explain: 'Python usa "elif" como abreviação de "else if".' },
        { q: 'Qual operador lógico nega uma condição em Python?', opts: ['!', 'not', '~', 'no'], answer: 1, explain: 'Python usa "not" em vez de "!" para negação lógica.' },
        { q: 'Qual é o resultado?', code: 'x = 10\nif x > 5:\n    print("A")\nelse:\n    print("B")', opts: ['"A"', '"B"', 'Error', '"AB"'], answer: 0, explain: '10 > 5 é True, então imprime "A".' }
      ],
      medium: [
        { q: 'Qual é o resultado?', code: 'x = 0\nif x:\n    print("A")\nelse:\n    print("B")', opts: ['"A"', '"B"', 'Error', '0'], answer: 1, explain: '0 é falsy em Python, então entra no else.' },
        { q: 'Qual é o resultado?', code: 'a = [1, 2, 3]\nif 2 in a:\n    print("sim")\nelse:\n    print("nao")', opts: ['"sim"', '"nao"', 'Error', 'True'], answer: 0, explain: '"in" verifica se um elemento existe na lista.' },
        { q: 'Qual é o resultado?', code: 'x = 15\nr = "par" if x % 2 == 0 else "impar"\nprint(r)', opts: ['"par"', '"impar"', 'Error', '15'], answer: 1, explain: 'Expressão ternária em Python: valor_if_true if condição else valor_if_false.' }
      ],
      hard: [
        { q: 'Qual é o resultado?', code: 'x = []\ny = []\nprint(x == y, x is y)', opts: ['True True', 'True False', 'False False', 'False True'], answer: 1, explain: '== compara valores (iguais). "is" compara identidade (objetos diferentes).' },
        { q: 'Qual é o resultado?', code: 'print(all([True, 1, "a", [0]]))', opts: ['True', 'False', 'Error', 'None'], answer: 0, explain: 'all() retorna True se todos os itens forem truthy. [0] é truthy (lista não vazia).' }
      ]
    },
    loops: {
      easy: [
        { q: 'Qual é a sintaxe correta de um for em Python?', opts: ['for (i=0; i<5; i++)', 'for i in range(5):', 'for i from 0 to 5', 'for each i in 5'], answer: 1, explain: 'Python usa "for x in iterável:" com indentação.' },
        { q: 'O que range(3) gera?', opts: ['[1, 2, 3]', '[0, 1, 2]', '[0, 1, 2, 3]', '[3]'], answer: 1, explain: 'range(3) gera 0, 1, 2 (começa em 0, para antes de 3).' },
        { q: 'Qual é o resultado?', code: 'for i in range(1, 4):\n    print(i, end=" ")', opts: ['"1 2 3"', '"1 2 3 4"', '"0 1 2 3"', '"0 1 2"'], answer: 0, explain: 'range(1, 4) gera 1, 2, 3.' },
        { q: 'Como sair de um loop em Python?', opts: ['exit', 'break', 'stop', 'return'], answer: 1, explain: 'break encerra o loop imediatamente.' }
      ],
      medium: [
        { q: 'Qual é o resultado?', code: 'nums = [1, 2, 3]\nr = [x**2 for x in nums]\nprint(r)', opts: ['[1, 4, 9]', '[2, 4, 6]', '[1, 2, 3]', 'Error'], answer: 0, explain: 'List comprehension: cria nova lista com cada elemento ao quadrado.' },
        { q: 'Qual é o resultado?', code: 'for i in range(5):\n    if i == 3:\n        continue\n    print(i, end=" ")', opts: ['"0 1 2 4"', '"0 1 2 3"', '"0 1 2"', '"3"'], answer: 0, explain: 'continue pula i=3, imprimindo 0 1 2 4.' },
        { q: 'O que faz enumerate()?', opts: ['Conta elementos', 'Retorna índice e valor', 'Ordena a lista', 'Filtra elementos'], answer: 1, explain: 'enumerate() retorna tuplas (índice, valor) para iteração.' }
      ],
      hard: [
        { q: 'Qual é o resultado?', code: 'r = {x: x**2 for x in range(4)}\nprint(r[3])', opts: ['3', '9', '6', 'Error'], answer: 1, explain: 'Dict comprehension cria {0:0, 1:1, 2:4, 3:9}. r[3] = 9.' },
        { q: 'Qual é o resultado?', code: 'g = (x for x in range(3))\nprint(type(g).__name__)', opts: ['list', 'generator', 'tuple', 'range'], answer: 1, explain: 'Parênteses criam generator expression, não tupla nem lista.' }
      ]
    },
    functions: {
      easy: [
        { q: 'Como declarar uma função em Python?', opts: ['function nome():', 'def nome():', 'func nome():', 'fn nome():'], answer: 1, explain: 'Python usa "def" para declarar funções.' },
        { q: 'Qual é o resultado?', code: 'def soma(a, b):\n    return a + b\nprint(soma(3, 4))', opts: ['7', '"34"', 'Error', 'None'], answer: 0, explain: 'soma(3, 4) retorna 3 + 4 = 7.' },
        { q: 'O que acontece se uma função não tem return?', opts: ['Retorna 0', 'Retorna None', 'Dá erro', 'Retorna False'], answer: 1, explain: 'Funções sem return explícito retornam None.' },
        { q: 'O que é um parâmetro padrão?', opts: ['Parâmetro obrigatório', 'Valor se não for passado', 'Primeiro parâmetro', 'Parâmetro global'], answer: 1, explain: 'Ex: def f(x=10) — se x não for passado, usa 10.' }
      ],
      medium: [
        { q: 'Qual é o resultado?', code: 'def f(a, b=5, c=10):\n    return a + b + c\nprint(f(1, c=20))', opts: ['26', '16', '31', 'Error'], answer: 0, explain: 'a=1, b=5 (padrão), c=20 (nomeado). 1+5+20=26.' },
        { q: 'O que *args faz?', opts: ['Recebe argumentos nomeados', 'Recebe número variável de argumentos', 'Desempacota lista', 'Multiplica argumentos'], answer: 1, explain: '*args coleta argumentos posicionais extras como tupla.' },
        { q: 'Qual é o resultado?', code: 'dobro = lambda x: x * 2\nprint(dobro(7))', opts: ['14', '7', 'Error', 'None'], answer: 0, explain: 'Lambda é uma função anônima de uma expressão. 7 * 2 = 14.' }
      ],
      hard: [
        { q: 'Qual é o resultado?', code: 'def make_adder(n):\n    def add(x):\n        return x + n\n    return add\nf = make_adder(5)\nprint(f(3))', opts: ['8', '5', '3', 'Error'], answer: 0, explain: 'Closure: add captura n=5. f(3) = 3 + 5 = 8.' },
        { q: 'Qual é o resultado?', code: 'def f(a, b=[]):\n    b.append(a)\n    return b\nprint(f(1))\nprint(f(2))', opts: ['[1] [2]', '[1] [1, 2]', 'Error', '[1, 2] [1, 2]'], answer: 1, explain: 'Armadilha: parâmetros mutáveis padrão são compartilhados entre chamadas.' }
      ]
    },
    lists: {
      easy: [
        { q: 'Como acessar o último elemento de uma lista?', opts: ['lista[-1]', 'lista[last]', 'lista.last()', 'lista[len]'], answer: 0, explain: 'Índice negativo: -1 é o último, -2 o penúltimo, etc.' },
        { q: 'Qual método adiciona um elemento ao final da lista?', opts: ['add()', 'append()', 'push()', 'insert()'], answer: 1, explain: 'append() adiciona ao final da lista.' },
        { q: 'Qual é o resultado?', code: 'a = [1, 2, 3]\nprint(len(a))', opts: ['2', '3', '4', 'Error'], answer: 1, explain: 'len() retorna o número de elementos: 3.' },
        { q: 'Qual é a diferença entre lista e tupla?', opts: ['Nenhuma', 'Lista é mutável, tupla não', 'Tupla é mutável, lista não', 'Lista só aceita números'], answer: 1, explain: 'Listas são mutáveis (podem mudar). Tuplas são imutáveis.' }
      ],
      medium: [
        { q: 'Qual é o resultado?', code: 'a = [1, 2, 3, 4, 5]\nprint(a[1:4])', opts: ['[1, 2, 3]', '[2, 3, 4]', '[2, 3, 4, 5]', '[1, 2, 3, 4]'], answer: 1, explain: 'Slicing a[1:4] retorna elementos nos índices 1, 2, 3.' },
        { q: 'Qual é o resultado?', code: 'a = [3, 1, 4, 1, 5]\na.sort()\nprint(a[0])', opts: ['3', '1', '5', '0'], answer: 1, explain: 'sort() ordena a lista. O menor elemento (1) fica na posição 0.' },
        { q: 'Qual é o resultado?', code: 'a = [1, 2, 3]\nb = a + [4, 5]\nprint(b)', opts: ['[1,2,3,4,5]', '[1,2,3,[4,5]]', 'Error', '15'], answer: 0, explain: 'O operador + concatena listas.' }
      ],
      hard: [
        { q: 'Qual é o resultado?', code: 'a = [1, 2, 3]\nb = a[::-1]\nprint(b)', opts: ['[1, 2, 3]', '[3, 2, 1]', '[3]', 'Error'], answer: 1, explain: '[::-1] cria uma cópia invertida da lista.' },
        { q: 'Qual é o resultado?', code: 'a = [[0]*3 for _ in range(2)]\na[0][1] = 5\nprint(a)', opts: ['[[0,5,0],[0,0,0]]', '[[0,5,0],[0,5,0]]', 'Error', '[[5,5,5],[5,5,5]]'], answer: 0, explain: 'List comprehension cria listas independentes. Alterar uma não afeta a outra.' }
      ]
    },
    dicts: {
      easy: [
        { q: 'Como criar um dicionário vazio?', opts: ['d = {}', 'd = []', 'd = ()', 'd = set()'], answer: 0, explain: '{} cria um dicionário vazio em Python.' },
        { q: 'Como acessar um valor no dicionário?', opts: ['d.get[key]', 'd[key]', 'd(key)', 'd.value(key)'], answer: 1, explain: 'd[key] acessa o valor associado à chave.' },
        { q: 'Qual é o resultado?', code: 'd = {"a": 1, "b": 2}\nprint(d["b"])', opts: ['1', '2', '"b"', 'Error'], answer: 1, explain: 'd["b"] retorna o valor 2 associado à chave "b".' },
        { q: 'Qual método retorna todas as chaves?', opts: ['d.keys()', 'd.items()', 'd.values()', 'd.all()'], answer: 0, explain: 'd.keys() retorna todas as chaves do dicionário.' }
      ],
      medium: [
        { q: 'Qual é o resultado?', code: 'd = {"x": 1}\nd["y"] = 2\nprint(len(d))', opts: ['1', '2', '3', 'Error'], answer: 1, explain: 'Adicionou chave "y". O dict agora tem 2 itens.' },
        { q: 'Qual é a diferença entre d[key] e d.get(key)?', opts: ['Nenhuma', 'd.get() retorna None se não existir', 'd[key] é mais lento', 'd.get() modifica o dict'], answer: 1, explain: 'd[key] lança KeyError se não existir. d.get(key) retorna None.' },
        { q: 'Qual é o resultado?', code: 'd = {"a":1, "b":2, "c":3}\nfor k, v in d.items():\n    if v > 1:\n        print(k, end=" ")', opts: ['"b c"', '"a b c"', '"2 3"', '"a"'], answer: 0, explain: 'items() retorna pares (chave, valor). Filtra v > 1: b e c.' }
      ],
      hard: [
        { q: 'Qual é o resultado?', code: 'from collections import Counter\nc = Counter("abracadabra")\nprint(c.most_common(1))', opts: ["[('a', 5)]", "{'a': 5}", "[('b', 2)]", "Error"], answer: 0, explain: 'Counter conta ocorrências. "a" aparece 5 vezes (mais comum).' },
        { q: 'Qual é o resultado?', code: 'd = {}\nd.setdefault("x", []).append(1)\nd.setdefault("x", []).append(2)\nprint(d["x"])', opts: ['[1, 2]', '[2]', '[1]', 'Error'], answer: 0, explain: 'setdefault cria a chave se não existir. Na 2ª vez, a lista já existe.' }
      ]
    }
  },
  java: {
    variables: {
      easy: [
        { q: 'Qual tipo armazena números inteiros em Java?', opts: ['int', 'float', 'String', 'bool'], answer: 0, explain: 'int armazena números inteiros (32 bits) em Java.' },
        { q: 'Qual é o tipo para texto em Java?', opts: ['str', 'Text', 'String', 'string'], answer: 2, explain: 'String (com S maiúsculo) é o tipo para texto em Java.' },
        { q: 'Java é uma linguagem de tipagem...', opts: ['Dinâmica', 'Estática', 'Fraca', 'Sem tipagem'], answer: 1, explain: 'Java tem tipagem estática — tipos devem ser declarados.' },
        { q: 'Qual é o resultado?', code: 'int x = 10;\ndouble y = x;\nSystem.out.println(y);', opts: ['10', '10.0', 'Error', '0'], answer: 1, explain: 'Conversão implícita de int para double: 10 vira 10.0.' }
      ],
      medium: [
        { q: 'Qual é a diferença entre int e Integer?', opts: ['Nenhuma', 'int é primitivo, Integer é objeto', 'Integer é mais rápido', 'int aceita null'], answer: 1, explain: 'int é tipo primitivo. Integer é a classe wrapper (objeto).' },
        { q: 'Qual é o resultado?', code: 'String a = "hello";\nString b = "hello";\nSystem.out.println(a == b);', opts: ['true', 'false', 'Error', 'null'], answer: 0, explain: 'String literals são internalizadas. Mesma referência no pool.' },
        { q: 'Qual modificador torna uma variável imutável?', opts: ['static', 'const', 'final', 'immutable'], answer: 2, explain: 'final impede reatribuição da variável após inicialização.' }
      ],
      hard: [
        { q: 'Qual é o resultado?', code: 'String a = new String("hi");\nString b = new String("hi");\nSystem.out.println(a == b);\nSystem.out.println(a.equals(b));', opts: ['true true', 'false false', 'false true', 'true false'], answer: 2, explain: '== compara referências (diferentes). equals() compara conteúdo (iguais).' },
        { q: 'Qual é o resultado?', code: 'int x = 127;\nint y = 127;\nInteger a = x;\nInteger b = y;\nSystem.out.println(a == b);', opts: ['true', 'false', 'Error', 'null'], answer: 0, explain: 'Integer cache: valores -128 a 127 são cacheados, mesma referência.' }
      ]
    },
    conditionals: {
      easy: [
        { q: 'Qual é a sintaxe correta de if em Java?', opts: ['if x > 5:', 'if (x > 5) {}', 'if x > 5 then', 'if [x > 5]'], answer: 1, explain: 'Java usa parênteses para condição e chaves para bloco.' },
        { q: 'Qual operador lógico significa "E"?', opts: ['||', '&&', '!', '&'], answer: 1, explain: '&& é o operador AND lógico (curto-circuito).' },
        { q: 'Qual é o resultado?', code: 'int x = 5;\nif (x > 3 && x < 10) {\n    System.out.println("A");\n}', opts: ['"A"', 'Nada', 'Error', '"true"'], answer: 0, explain: '5 > 3 E 5 < 10 são ambos true. Imprime "A".' }
      ],
      medium: [
        { q: 'Qual é o resultado?', code: 'int x = 2;\nswitch(x) {\n  case 1: System.out.print("A");\n  case 2: System.out.print("B");\n  case 3: System.out.print("C");\n}', opts: ['"B"', '"BC"', '"ABC"', '"C"'], answer: 1, explain: 'Sem break, ocorre fall-through. Imprime "B" e "C".' },
        { q: 'Como comparar Strings em Java?', opts: ['a == b', 'a.equals(b)', 'a.compare(b)', 'a is b'], answer: 1, explain: 'equals() compara conteúdo de Strings. == compara referências.' }
      ],
      hard: [
        { q: 'Qual é o resultado?', code: 'Integer a = null;\nif (a != null && a > 0) {\n    System.out.println("pos");\n} else {\n    System.out.println("nao");\n}', opts: ['"pos"', '"nao"', 'NullPointerException', 'Error'], answer: 1, explain: '&& faz curto-circuito: a != null é false, não avalia a > 0.' }
      ]
    },
    loops: {
      easy: [
        { q: 'Qual é a sintaxe do for em Java?', opts: ['for i in range(5)', 'for (int i=0; i<5; i++)', 'for (i to 5)', 'for each (0..5)'], answer: 1, explain: 'Java usa for (inicialização; condição; incremento).' },
        { q: 'Quantas vezes o loop executa?', code: 'for (int i = 0; i < 4; i++) {\n    System.out.print(i);\n}', opts: ['3', '4', '5', '0'], answer: 1, explain: 'i vai de 0 a 3: 4 iterações.' },
        { q: 'O que break faz em Java?', opts: ['Pula iteração', 'Sai do loop', 'Reinicia', 'Pausa'], answer: 1, explain: 'break encerra o loop imediatamente.' }
      ],
      medium: [
        { q: 'Qual é a sintaxe do for-each?', opts: ['for x in arr', 'for (int x : arr)', 'foreach (x in arr)', 'for each x arr'], answer: 1, explain: 'Enhanced for loop: for (tipo variável : coleção).' },
        { q: 'Qual é o resultado?', code: 'int s = 0;\nfor (int i=1; i<=5; i++) s += i;\nSystem.out.println(s);', opts: ['10', '15', '5', '20'], answer: 1, explain: '1+2+3+4+5 = 15.' }
      ],
      hard: [
        { q: 'Qual é o resultado?', code: 'outer:\nfor (int i=0; i<3; i++) {\n  for (int j=0; j<3; j++) {\n    if (j==1) continue outer;\n    System.out.print(i+""+j+" ");\n  }\n}', opts: ['"00 10 20"', '"00 01 10 11 20 21"', '"00 10 20 "', 'Error'], answer: 0, explain: 'Label "outer" faz continue pular para o próximo i. Só j=0 é impresso.' }
      ]
    },
    functions: {
      easy: [
        { q: 'O que "void" significa no retorno de um método?', opts: ['Retorna 0', 'Retorna null', 'Não retorna nada', 'Retorna vazio'], answer: 2, explain: 'void indica que o método não retorna nenhum valor.' },
        { q: 'Qual é a sintaxe para declarar um método?', opts: ['def metodo():', 'function metodo()', 'tipo nomeMetodo(params)', 'method nomeMetodo'], answer: 2, explain: 'Em Java: tipoRetorno nomeDoMetodo(parametros) { corpo }.' },
        { q: 'O que é sobrecarga (overload)?', opts: ['Métodos com mesmo nome e parâmetros diferentes', 'Herdar um método', 'Método privado', 'Método estático'], answer: 0, explain: 'Overload: mesmo nome, parâmetros diferentes (tipo ou quantidade).' }
      ],
      medium: [
        { q: 'Qual é o resultado?', code: 'static int soma(int a, int b) {\n    return a + b;\n}\n// chamada:\nSystem.out.println(soma(3, 4));', opts: ['7', '34', 'Error', 'void'], answer: 0, explain: 'Método soma retorna 3 + 4 = 7.' },
        { q: 'Java passa objetos por...', opts: ['Valor', 'Referência', 'Cópia da referência', 'Ponteiro'], answer: 2, explain: 'Java passa a cópia da referência. Pode mutar o objeto, mas não reatribuir.' }
      ],
      hard: [
        { q: 'O que é um método varargs?', code: 'static int soma(int... nums) {\n    int s = 0;\n    for (int n : nums) s += n;\n    return s;\n}', opts: ['Método com array fixo', 'Aceita número variável de args', 'Método genérico', 'Método sobrecarregado'], answer: 1, explain: 'Varargs (int...) aceita 0 ou mais argumentos como array.' }
      ]
    },
    arrays: {
      easy: [
        { q: 'Como declarar um array de inteiros em Java?', opts: ['int arr[]', 'int[] arr', 'Ambas estão corretas', 'array<int> arr'], answer: 2, explain: 'Tanto int[] arr quanto int arr[] são válidos em Java.' },
        { q: 'Qual é o índice do primeiro elemento?', opts: ['0', '1', '-1', 'Depende'], answer: 0, explain: 'Arrays em Java são indexados a partir de 0.' },
        { q: 'Como obter o tamanho de um array?', opts: ['arr.size()', 'arr.length', 'arr.count()', 'len(arr)'], answer: 1, explain: 'Arrays usam .length (sem parênteses). ArrayList usa .size().' }
      ],
      medium: [
        { q: 'Qual é o resultado?', code: 'int[] a = {5, 3, 1};\nArrays.sort(a);\nSystem.out.println(a[0]);', opts: ['5', '3', '1', 'Error'], answer: 2, explain: 'Arrays.sort() ordena em ordem crescente. a[0] = 1.' },
        { q: 'ArrayList vs Array: qual vantagem?', opts: ['ArrayList é mais rápido', 'ArrayList tem tamanho dinâmico', 'Array aceita generics', 'Nenhuma diferença'], answer: 1, explain: 'ArrayList cresce dinamicamente. Arrays têm tamanho fixo.' }
      ],
      hard: [
        { q: 'Qual é o resultado?', code: 'int[] a = {1, 2, 3};\nint[] b = a;\nb[0] = 99;\nSystem.out.println(a[0]);', opts: ['1', '99', 'Error', '0'], answer: 1, explain: 'Arrays são objetos. b = a copia a referência, não o conteúdo.' }
      ]
    },
    oop: {
      easy: [
        { q: 'O que é uma classe em Java?', opts: ['Uma variável', 'Um molde para objetos', 'Um método', 'Um pacote'], answer: 1, explain: 'Classe é um molde/template que define atributos e métodos de objetos.' },
        { q: 'Qual palavra-chave cria um objeto?', opts: ['create', 'new', 'make', 'init'], answer: 1, explain: 'new instancia (cria) um objeto a partir de uma classe.' },
        { q: 'O que é encapsulamento?', opts: ['Herdar métodos', 'Esconder dados internos', 'Criar objetos', 'Sobrescrever métodos'], answer: 1, explain: 'Encapsulamento protege dados internos usando modificadores de acesso.' }
      ],
      medium: [
        { q: 'Qual palavra-chave indica herança?', opts: ['implements', 'extends', 'inherits', 'super'], answer: 1, explain: '"extends" faz uma classe herdar de outra.' },
        { q: 'O que é polimorfismo?', opts: ['Uma classe ter vários atributos', 'Mesmo método com comportamentos diferentes', 'Criar múltiplos objetos', 'Ter várias interfaces'], answer: 1, explain: 'Polimorfismo: mesma chamada de método, comportamento diferente por tipo.' },
        { q: 'Interface vs Classe abstrata?', opts: ['São iguais', 'Interface só tem assinaturas, abstrata pode ter implementação', 'Classe abstrata não pode ter métodos', 'Interface pode ser instanciada'], answer: 1, explain: 'Interfaces definem contratos. Classes abstratas podem ter métodos implementados.' }
      ],
      hard: [
        { q: 'Java suporta herança múltipla de classes?', opts: ['Sim', 'Não, mas suporta múltiplas interfaces', 'Sim, com diamond pattern', 'Depende da versão'], answer: 1, explain: 'Java não permite herdar de 2+ classes, mas pode implementar múltiplas interfaces.' }
      ]
    }
  },
  c: {
    variables: {
      easy: [
        { q: 'Qual tipo armazena um caractere em C?', opts: ['char', 'string', 'character', 'chr'], answer: 0, explain: 'char armazena um único caractere (1 byte) em C.' },
        { q: 'Qual é o tamanho de int na maioria dos sistemas?', opts: ['1 byte', '2 bytes', '4 bytes', '8 bytes'], answer: 2, explain: 'int geralmente ocupa 4 bytes (32 bits) em sistemas modernos.' },
        { q: 'Como imprimir um inteiro com printf?', opts: ['%s', '%d', '%f', '%c'], answer: 1, explain: '%d é o especificador de formato para inteiros em printf.' },
        { q: 'Qual é o resultado?', code: 'int x = 7 / 2;\nprintf("%d", x);', opts: ['3.5', '3', '4', 'Error'], answer: 1, explain: 'Divisão inteira: 7 / 2 = 3 (trunca a parte decimal).' }
      ],
      medium: [
        { q: 'Qual é o resultado?', code: 'int a = 5;\nfloat b = a / 2;\nprintf("%.1f", b);', opts: ['2.5', '2.0', '2', 'Error'], answer: 1, explain: '5 / 2 é divisão inteira = 2. Depois é convertido para float 2.0.' },
        { q: 'O que sizeof retorna?', opts: ['Valor da variável', 'Tamanho em bytes', 'Endereço de memória', 'Tipo da variável'], answer: 1, explain: 'sizeof retorna o tamanho em bytes de um tipo ou variável.' },
        { q: 'Qual a diferença entre float e double?', opts: ['Nenhuma', 'double tem mais precisão', 'float é mais preciso', 'double é para inteiros'], answer: 1, explain: 'float: 4 bytes (~7 dígitos). double: 8 bytes (~15 dígitos).' }
      ],
      hard: [
        { q: 'Qual é o resultado?', code: 'unsigned int x = -1;\nprintf("%u", x);', opts: ['−1', '0', '4294967295', 'Error'], answer: 2, explain: 'unsigned int interpreta -1 como o maior valor possível (2^32 - 1).' },
        { q: 'Qual é o resultado?', code: 'char c = 65;\nprintf("%c", c);', opts: ['"65"', '"A"', 'Error', '"a"'], answer: 1, explain: '65 é o código ASCII de "A".' }
      ]
    },
    conditionals: {
      easy: [
        { q: 'Qual é a sintaxe do if em C?', opts: ['if x > 5:', 'if (x > 5) {}', 'if x > 5 then', 'if [x > 5]'], answer: 1, explain: 'C usa parênteses para condição e chaves para bloco.' },
        { q: 'Qual operador significa "diferente de"?', opts: ['<>', '!=', '=/=', 'not'], answer: 1, explain: '!= é o operador "não igual" em C.' },
        { q: 'Em C, qual valor é considerado "false"?', opts: ['0', '-1', 'null', '"false"'], answer: 0, explain: 'Em C, 0 é false. Qualquer valor diferente de 0 é true.' }
      ],
      medium: [
        { q: 'Qual é o resultado?', code: 'int x = 5;\nint r = (x > 3) ? 10 : 20;\nprintf("%d", r);', opts: ['10', '20', '5', 'Error'], answer: 0, explain: '5 > 3 é verdadeiro, então r = 10.' },
        { q: 'Qual é o resultado?', code: 'int x = 0;\nif (x = 5) {\n    printf("A");\n} else {\n    printf("B");\n}', opts: ['"A"', '"B"', 'Error', '"0"'], answer: 0, explain: 'x = 5 é atribuição (não comparação). O valor 5 é truthy.' }
      ],
      hard: [
        { q: 'Qual é o resultado?', code: 'int a = 1, b = 0;\nint c = a || (b = 5);\nprintf("%d %d", c, b);', opts: ['1 5', '1 0', '0 5', '5 0'], answer: 1, explain: '|| faz curto-circuito: a é truthy, então b = 5 NÃO é avaliado.' }
      ]
    },
    loops: {
      easy: [
        { q: 'Quantas vezes o loop executa?', code: 'for (int i = 0; i < 5; i++) {\n    printf("%d ", i);\n}', opts: ['4', '5', '6', 'infinito'], answer: 1, explain: 'i vai de 0 a 4: 5 iterações.' },
        { q: 'Qual loop verifica a condição após executar?', opts: ['for', 'while', 'do-while', 'switch'], answer: 2, explain: 'do-while executa o corpo e depois verifica a condição.' },
        { q: 'O que break faz?', opts: ['Pula iteração', 'Sai do loop', 'Volta ao início', 'Encerra programa'], answer: 1, explain: 'break sai do loop mais interno.' }
      ],
      medium: [
        { q: 'Qual é o resultado?', code: 'int i = 10;\nwhile (i > 0) {\n    i /= 3;\n}\nprintf("%d", i);', opts: ['0', '1', '3', 'Loop infinito'], answer: 0, explain: 'i: 10→3→1→0. Quando i=0, i > 0 é false.' },
        { q: 'O que acontece com for(;;)?', opts: ['Erro de sintaxe', 'Não executa', 'Loop infinito', 'Executa uma vez'], answer: 2, explain: 'for(;;) é um loop infinito válido em C (todos campos vazios).' }
      ],
      hard: [
        { q: 'Qual é o resultado?', code: 'int s = 0;\nfor (int i=1; i<=100; i++) {\n    if (i % 2 != 0) continue;\n    s += i;\n}\nprintf("%d", s);', opts: ['5050', '2550', '2500', '50'], answer: 1, explain: 'Soma apenas os pares de 1 a 100: 2+4+6+...+100 = 2550.' }
      ]
    },
    functions: {
      easy: [
        { q: 'O que "void" significa como tipo de retorno?', opts: ['Retorna 0', 'Não retorna valor', 'Retorna null', 'Retorna vazio'], answer: 1, explain: 'void indica que a função não retorna nenhum valor.' },
        { q: 'O que é um protótipo de função?', opts: ['O corpo da função', 'Declaração antes do main', 'Uma variável', 'Uma macro'], answer: 1, explain: 'Protótipo declara a assinatura da função antes de seu uso.' },
        { q: 'C passa parâmetros por...', opts: ['Referência', 'Valor', 'Nome', 'Tipo'], answer: 1, explain: 'C passa tudo por valor. Para simular referência, usa-se ponteiros.' }
      ],
      medium: [
        { q: 'Como simular passagem por referência em C?', opts: ['Usar &', 'Passar ponteiro', 'Usar global', 'Não é possível'], answer: 1, explain: 'Passa-se um ponteiro para a variável, permitindo modificá-la.' },
        { q: 'Qual é o resultado?', code: 'int fatorial(int n) {\n    if (n <= 1) return 1;\n    return n * fatorial(n - 1);\n}\nprintf("%d", fatorial(5));', opts: ['120', '24', '5', 'Error'], answer: 0, explain: '5! = 5 * 4 * 3 * 2 * 1 = 120.' }
      ],
      hard: [
        { q: 'O que é um ponteiro para função?', code: 'int (*op)(int, int);', opts: ['Array de funções', 'Variável que armazena endereço de função', 'Macro', 'Template'], answer: 1, explain: 'Ponteiro para função armazena o endereço de uma função para chamá-la indiretamente.' }
      ]
    },
    pointers: {
      easy: [
        { q: 'O que é um ponteiro?', opts: ['Um número', 'Uma variável que armazena endereço', 'Uma função', 'Um array'], answer: 1, explain: 'Ponteiro é uma variável que armazena o endereço de memória de outra variável.' },
        { q: 'Qual operador obtém o endereço de uma variável?', opts: ['*', '&', '->', '#'], answer: 1, explain: '& (address-of) retorna o endereço de memória da variável.' },
        { q: 'Qual operador acessa o valor apontado?', opts: ['&', '*', '->', '.'], answer: 1, explain: '* (dereference) acessa o valor no endereço que o ponteiro guarda.' }
      ],
      medium: [
        { q: 'Qual é o resultado?', code: 'int x = 10;\nint *p = &x;\n*p = 20;\nprintf("%d", x);', opts: ['10', '20', 'Endereço', 'Error'], answer: 1, explain: '*p = 20 modifica o valor no endereço de x. Agora x = 20.' },
        { q: 'O que NULL representa?', opts: ['0', 'Ponteiro para nenhum lugar', 'Erro', 'Fim de string'], answer: 1, explain: 'NULL indica que o ponteiro não aponta para nenhum endereço válido.' },
        { q: 'Qual é a relação entre arrays e ponteiros?', opts: ['Nenhuma', 'O nome do array é um ponteiro para o primeiro elemento', 'São idênticos', 'Arrays são ponteiros duplos'], answer: 1, explain: 'O nome de um array decai para um ponteiro para seu primeiro elemento.' }
      ],
      hard: [
        { q: 'Qual é o resultado?', code: 'int a[] = {10, 20, 30};\nint *p = a;\nprintf("%d", *(p + 2));', opts: ['10', '20', '30', 'Error'], answer: 2, explain: 'p + 2 avança 2 posições. *(p + 2) = a[2] = 30.' },
        { q: 'O que é um ponteiro para ponteiro?', code: 'int x = 5;\nint *p = &x;\nint **pp = &p;', opts: ['Ponteiro que armazena endereço de outro ponteiro', 'Array bidimensional', 'Ponteiro nulo', 'Erro de sintaxe'], answer: 0, explain: '**pp armazena o endereço de p, que por sua vez aponta para x.' }
      ]
    },
    structs: {
      easy: [
        { q: 'O que é uma struct em C?', opts: ['Uma classe', 'Um tipo composto definido pelo usuário', 'Um array especial', 'Uma função'], answer: 1, explain: 'struct agrupa diferentes tipos de dados sob um único nome.' },
        { q: 'Como acessar um membro de struct?', opts: ['struct.membro', 'variavel.membro', 'struct->membro', 'variavel[membro]'], answer: 1, explain: 'Usa-se o operador ponto: variavel.membro.' },
        { q: 'O que typedef faz com struct?', opts: ['Cria ponteiro', 'Cria alias de tipo', 'Aloca memória', 'Libera memória'], answer: 1, explain: 'typedef cria um nome alternativo para o tipo struct.' }
      ],
      medium: [
        { q: 'Quando usar -> em vez de . ?', opts: ['Sempre', 'Quando o struct é grande', 'Quando temos ponteiro para struct', 'Nunca'], answer: 2, explain: 'Usa-se -> com ponteiros para struct: ptr->membro equivale a (*ptr).membro.' },
        { q: 'Qual é o resultado?', code: 'struct Ponto { int x, y; };\nstruct Ponto p = {3, 7};\nprintf("%d", p.x + p.y);', opts: ['3', '7', '10', 'Error'], answer: 2, explain: 'p.x = 3, p.y = 7. Soma = 10.' }
      ],
      hard: [
        { q: 'Structs podem conter ponteiros para si mesmas?', opts: ['Não, causa erro', 'Sim, é usado em listas ligadas', 'Só com typedef', 'Só em C++'], answer: 1, explain: 'Structs auto-referenciadas são a base de listas ligadas e árvores.' }
      ]
    }
  },
  html_css: {
    html_basics: {
      easy: [
        { q: 'Qual tag define o título da página (aba do navegador)?', opts: ['<head>', '<title>', '<h1>', '<header>'], answer: 1, explain: '<title> define o texto que aparece na aba do navegador.' },
        { q: 'Qual tag cria um parágrafo?', opts: ['<text>', '<p>', '<par>', '<paragraph>'], answer: 1, explain: '<p> é a tag para parágrafos em HTML.' },
        { q: 'Qual atributo define o destino de um link?', opts: ['src', 'href', 'link', 'url'], answer: 1, explain: 'href (Hypertext Reference) define para onde o link aponta.' },
        { q: 'Qual tag cria uma imagem?', opts: ['<image>', '<img>', '<picture>', '<photo>'], answer: 1, explain: '<img> é a tag para imagens. É self-closing (não tem tag de fechamento).' }
      ],
      medium: [
        { q: 'Qual é a diferença entre <div> e <span>?', opts: ['Nenhuma', 'div é bloco, span é inline', 'span é bloco, div é inline', 'div é obsoleto'], answer: 1, explain: '<div> é block-level (ocupa linha inteira). <span> é inline.' },
        { q: 'Qual atributo torna uma tag única na página?', opts: ['class', 'id', 'name', 'unique'], answer: 1, explain: 'id deve ser único na página. class pode ser repetida.' },
        { q: 'O que são tags semânticas?', opts: ['Tags com CSS', 'Tags que descrevem o conteúdo', 'Tags obsoletas', 'Tags invisíveis'], answer: 1, explain: 'Tags semânticas (<article>, <nav>, <footer>) descrevem o significado do conteúdo.' }
      ],
      hard: [
        { q: 'Qual atributo melhora acessibilidade em imagens?', opts: ['title', 'alt', 'desc', 'aria-label'], answer: 1, explain: 'alt descreve a imagem para leitores de tela e quando a imagem não carrega.' },
        { q: 'O que é o DOCTYPE?', opts: ['Uma tag HTML', 'Declara o tipo do documento', 'Metadata', 'Comentário'], answer: 1, explain: '<!DOCTYPE html> diz ao navegador que é HTML5.' }
      ]
    },
    html_forms: {
      easy: [
        { q: 'Qual tag cria um formulário?', opts: ['<form>', '<input>', '<field>', '<submit>'], answer: 0, explain: '<form> é o container para elementos de formulário.' },
        { q: 'Qual tipo de input cria uma caixa de texto?', opts: ['type="text"', 'type="input"', 'type="field"', 'type="string"'], answer: 0, explain: 'type="text" cria um campo de texto simples.' },
        { q: 'Qual tag cria um botão de envio?', opts: ['<submit>', '<button type="submit">', '<send>', '<action>'], answer: 1, explain: '<button type="submit"> ou <input type="submit"> envia o formulário.' }
      ],
      medium: [
        { q: 'Qual atributo torna um campo obrigatório?', opts: ['mandatory', 'required', 'needed', 'must'], answer: 1, explain: 'required impede envio do formulário se o campo estiver vazio.' },
        { q: 'Qual tipo de input cria um campo de email?', opts: ['type="text"', 'type="email"', 'type="mail"', 'type="address"'], answer: 1, explain: 'type="email" valida automaticamente o formato de email.' },
        { q: 'O que <label for="x"> faz?', opts: ['Estiliza o input', 'Associa texto ao input com id="x"', 'Cria uma variável', 'Esconde o input'], answer: 1, explain: 'label associa texto ao input — clicar no label foca o input.' }
      ],
      hard: [
        { q: 'Qual é a diferença entre GET e POST?', opts: ['Nenhuma', 'GET envia na URL, POST no corpo', 'POST envia na URL', 'GET é mais seguro'], answer: 1, explain: 'GET: dados na URL (visíveis). POST: dados no corpo da requisição.' }
      ]
    },
    css_selectors: {
      easy: [
        { q: 'Como selecionar um elemento por classe?', opts: ['#nome', '.nome', 'nome', '*nome'], answer: 1, explain: '.nome seleciona elementos com class="nome".' },
        { q: 'Como selecionar um elemento por ID?', opts: ['.id', '#id', 'id', '@id'], answer: 1, explain: '#id seleciona o elemento com id="id".' },
        { q: 'O que * seleciona em CSS?', opts: ['Nada', 'Todos os elementos', 'Apenas divs', 'Elementos ocultos'], answer: 1, explain: '* é o seletor universal — seleciona TODOS os elementos.' }
      ],
      medium: [
        { q: 'O que "div p" (com espaço) seleciona?', opts: ['div E p', 'p dentro de div', 'div seguido de p', 'p adjacente a div'], answer: 1, explain: 'Seletor descendente: seleciona todos os p dentro de div (qualquer nível).' },
        { q: 'O que :hover faz?', opts: ['Esconde elemento', 'Aplica estilo ao passar mouse', 'Seleciona primeiro filho', 'Anima elemento'], answer: 1, explain: ':hover aplica estilos quando o cursor está sobre o elemento.' },
        { q: 'Qual tem MAIOR especificidade?', opts: ['tag', '.classe', '#id', 'inline style'], answer: 3, explain: 'Especificidade: inline > #id > .class > tag.' }
      ],
      hard: [
        { q: 'O que "div > p" seleciona?', opts: ['Todos p dentro de div', 'Apenas filhos diretos p de div', 'div após p', 'p que contém div'], answer: 1, explain: '> é seletor de filho direto. Não inclui p em níveis mais profundos.' },
        { q: 'O que :nth-child(2n) seleciona?', opts: ['Segundo filho', 'Filhos pares', 'Filhos ímpares', 'Todos os filhos'], answer: 1, explain: '2n = 2, 4, 6... Seleciona elementos em posições pares.' }
      ]
    },
    css_box: {
      easy: [
        { q: 'Qual propriedade define espaço INTERNO?', opts: ['margin', 'padding', 'border', 'gap'], answer: 1, explain: 'padding é o espaço entre o conteúdo e a borda.' },
        { q: 'Qual propriedade define espaço EXTERNO?', opts: ['margin', 'padding', 'border', 'gap'], answer: 0, explain: 'margin é o espaço fora da borda do elemento.' },
        { q: 'Qual é a ordem do box model de fora para dentro?', opts: ['margin, border, padding, content', 'padding, margin, border, content', 'content, padding, border, margin', 'border, margin, padding, content'], answer: 0, explain: 'De fora para dentro: margin → border → padding → content.' }
      ],
      medium: [
        { q: 'O que box-sizing: border-box faz?', opts: ['Remove bordas', 'Inclui padding e border no width', 'Dobra a margem', 'Centraliza o elemento'], answer: 1, explain: 'border-box faz width incluir padding e border, não apenas content.' },
        { q: 'Margens verticais adjacentes podem...', opts: ['Somar', 'Colapsar (merge)', 'Cancelar', 'Multiplicar'], answer: 1, explain: 'Margin collapse: margens verticais adjacentes se fundem (usa a maior).' }
      ],
      hard: [
        { q: 'Quando padding NÃO funciona como esperado?', opts: ['Em div', 'Em elementos inline', 'Em body', 'Em forms'], answer: 1, explain: 'Elementos inline (span, a) não respeitam padding/margin vertical como block.' }
      ]
    },
    css_flex: {
      easy: [
        { q: 'Qual propriedade ativa o Flexbox?', opts: ['flex: 1', 'display: flex', 'position: flex', 'layout: flex'], answer: 1, explain: 'display: flex no container ativa o layout Flexbox.' },
        { q: 'Qual propriedade alinha itens no eixo principal?', opts: ['align-items', 'justify-content', 'flex-direction', 'flex-wrap'], answer: 1, explain: 'justify-content alinha no eixo principal (horizontal por padrão).' },
        { q: 'Qual propriedade alinha itens no eixo transversal?', opts: ['justify-content', 'align-items', 'flex-direction', 'text-align'], answer: 1, explain: 'align-items alinha no eixo transversal (vertical por padrão).' }
      ],
      medium: [
        { q: 'O que flex-direction: column faz?', opts: ['Cria colunas CSS', 'Muda eixo principal para vertical', 'Remove flexbox', 'Centraliza itens'], answer: 1, explain: 'column muda o eixo principal para vertical (de cima para baixo).' },
        { q: 'O que flex: 1 faz em um item?', opts: ['Fixa largura em 1px', 'Ocupa espaço disponível proporcionalmente', 'Remove do flex', 'Define ordem 1'], answer: 1, explain: 'flex: 1 faz o item crescer para ocupar o espaço disponível.' },
        { q: 'Como centralizar um item vertical e horizontalmente?', opts: ['text-align: center', 'margin: auto', 'justify-content: center + align-items: center', 'position: center'], answer: 2, explain: 'justify-content + align-items: center centraliza em ambos os eixos.' }
      ],
      hard: [
        { q: 'O que flex-wrap: wrap faz?', opts: ['Quebra linha quando não cabe', 'Esconde overflow', 'Fixa largura', 'Desativa flex'], answer: 0, explain: 'flex-wrap: wrap permite que itens quebrem para a próxima linha.' },
        { q: 'Qual propriedade define espaço entre itens flex?', opts: ['margin', 'gap', 'spacing', 'gutter'], answer: 1, explain: 'gap define espaçamento entre itens flex (e grid) sem margin.' }
      ]
    },
    css_responsive: {
      easy: [
        { q: 'O que é design responsivo?', opts: ['Design bonito', 'Adapta-se a diferentes telas', 'Usa apenas CSS', 'Sem JavaScript'], answer: 1, explain: 'Design responsivo se adapta a diferentes tamanhos de tela.' },
        { q: 'Qual meta tag é essencial para mobile?', opts: ['<meta charset>', '<meta viewport>', '<meta mobile>', '<meta responsive>'], answer: 1, explain: 'viewport meta tag controla como a página é exibida em dispositivos móveis.' },
        { q: 'O que são media queries?', opts: ['Consultas ao banco', 'Regras CSS condicionais por tela', 'Imagens responsivas', 'APIs de mídia'], answer: 1, explain: 'Media queries aplicam CSS baseado em condições como largura de tela.' }
      ],
      medium: [
        { q: 'Qual unidade é relativa ao tamanho da fonte pai?', opts: ['px', 'em', 'vh', '%'], answer: 1, explain: 'em é relativa ao font-size do elemento pai.' },
        { q: 'Qual unidade é relativa à viewport?', opts: ['em', 'rem', 'vw', '%'], answer: 2, explain: 'vw = viewport width. 1vw = 1% da largura da viewport.' },
        { q: 'O que mobile-first significa?', opts: ['Só funciona em mobile', 'Desenha primeiro para mobile', 'Usa apenas min-width', 'Ignora desktop'], answer: 1, explain: 'Mobile-first: CSS base para mobile, media queries para telas maiores.' }
      ],
      hard: [
        { q: 'Qual unidade é relativa ao font-size do root?', opts: ['em', 'rem', 'vh', 'ch'], answer: 1, explain: 'rem = root em. Sempre relativa ao font-size do <html>.' }
      ]
    }
  },
  sql: {
    select: {
      easy: [
        { q: 'Qual comando busca dados de uma tabela?', opts: ['GET', 'FETCH', 'SELECT', 'FIND'], answer: 2, explain: 'SELECT é o comando para consultar dados em SQL.' },
        { q: 'Qual cláusula seleciona TODAS as colunas?', opts: ['ALL', '*', 'EVERY', 'FULL'], answer: 1, explain: 'SELECT * retorna todas as colunas da tabela.' },
        { q: 'Qual cláusula limita o número de resultados?', opts: ['MAX', 'TOP', 'LIMIT', 'FIRST'], answer: 2, explain: 'LIMIT restringe o número de linhas retornadas.' },
        { q: 'O que DISTINCT faz?', opts: ['Ordena resultados', 'Remove duplicatas', 'Conta resultados', 'Filtra nulos'], answer: 1, explain: 'DISTINCT retorna apenas valores únicos, sem repetições.' }
      ],
      medium: [
        { q: 'Qual é a ordem correta das cláusulas?', opts: ['SELECT FROM WHERE ORDER', 'FROM SELECT WHERE ORDER', 'SELECT WHERE FROM ORDER', 'FROM WHERE SELECT ORDER'], answer: 0, explain: 'Ordem: SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT.' },
        { q: 'O que ORDER BY nome DESC faz?', opts: ['Ordena A-Z', 'Ordena Z-A', 'Agrupa por nome', 'Filtra por nome'], answer: 1, explain: 'DESC = decrescente (Z-A, maior-menor). ASC = crescente.' },
        { q: 'O que AS faz?', opts: ['Cria tabela', 'Dá um alias (apelido)', 'Filtra', 'Junta tabelas'], answer: 1, explain: 'AS cria um alias: SELECT nome AS n FROM usuarios.' }
      ],
      hard: [
        { q: 'O que é uma subquery?', code: 'SELECT * FROM users\nWHERE id IN (\n  SELECT user_id FROM orders\n);', opts: ['Query inválida', 'Query dentro de outra query', 'JOIN especial', 'View temporária'], answer: 1, explain: 'Subquery é uma consulta dentro de outra, usada como filtro ou valor.' }
      ]
    },
    where: {
      easy: [
        { q: 'Qual cláusula filtra resultados?', opts: ['FILTER', 'WHERE', 'HAVING', 'IF'], answer: 1, explain: 'WHERE filtra linhas com base em condições.' },
        { q: 'Qual operador verifica se um valor está numa lista?', opts: ['CONTAINS', 'IN', 'HAS', 'EXISTS'], answer: 1, explain: 'IN verifica se o valor está na lista: WHERE id IN (1, 2, 3).' },
        { q: 'Qual operador busca padrões de texto?', opts: ['MATCH', 'LIKE', 'FIND', 'SEARCH'], answer: 1, explain: 'LIKE usa % e _ para busca por padrão. Ex: LIKE "%ana%".' },
        { q: 'Qual é o resultado?', code: "SELECT * FROM users\nWHERE age >= 18 AND city = 'SP';", opts: ['Todos os users', 'Maiores de 18 em SP', 'Menores de 18 em SP', 'Maiores de 18 OU em SP'], answer: 1, explain: 'AND exige ambas condições: idade >= 18 E cidade = SP.' }
      ],
      medium: [
        { q: 'O que BETWEEN faz?', opts: ['Junta tabelas', 'Filtra intervalo de valores', 'Remove duplicatas', 'Ordena'], answer: 1, explain: 'BETWEEN filtra intervalo: WHERE age BETWEEN 18 AND 30.' },
        { q: 'Como verificar valores NULL?', opts: ['= NULL', 'IS NULL', '== NULL', 'EQUALS NULL'], answer: 1, explain: 'NULL não se compara com =. Use IS NULL ou IS NOT NULL.' },
        { q: 'O que % significa em LIKE?', opts: ['Qualquer caractere único', 'Zero ou mais caracteres', 'Número', 'Exato'], answer: 1, explain: '% = zero ou mais caracteres. _ = exatamente um caractere.' }
      ],
      hard: [
        { q: 'Qual a diferença entre WHERE e HAVING?', opts: ['Nenhuma', 'WHERE filtra linhas, HAVING filtra grupos', 'HAVING é mais rápido', 'WHERE é para JOINs'], answer: 1, explain: 'WHERE filtra antes de agrupar. HAVING filtra após GROUP BY.' },
        { q: 'O que EXISTS faz?', opts: ['Verifica se tabela existe', 'Retorna TRUE se subquery retornar resultados', 'Cria tabela', 'Valida dados'], answer: 1, explain: 'EXISTS retorna TRUE se a subquery retornar ao menos uma linha.' }
      ]
    },
    joins: {
      easy: [
        { q: 'O que um JOIN faz?', opts: ['Deleta dados', 'Combina dados de 2+ tabelas', 'Cria tabela', 'Ordena dados'], answer: 1, explain: 'JOIN combina linhas de duas ou mais tabelas baseado em condição.' },
        { q: 'Qual JOIN retorna apenas correspondências?', opts: ['LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'FULL JOIN'], answer: 2, explain: 'INNER JOIN retorna apenas linhas com correspondência em ambas tabelas.' },
        { q: 'Qual JOIN retorna tudo da tabela da esquerda?', opts: ['INNER', 'LEFT', 'RIGHT', 'CROSS'], answer: 1, explain: 'LEFT JOIN retorna todas as linhas da esquerda, com ou sem match.' }
      ],
      medium: [
        { q: 'Qual é a sintaxe correta de um JOIN?', opts: ['JOIN users ON id', 'JOIN users ON users.id = orders.user_id', 'JOIN users WHERE id = id', 'JOIN users USING id'], answer: 1, explain: 'JOIN tabela ON condição_de_correspondência.' },
        { q: 'O que CROSS JOIN faz?', opts: ['JOIN sem condição (produto cartesiano)', 'JOIN com condição', 'JOIN de 3 tabelas', 'JOIN com NULL'], answer: 0, explain: 'CROSS JOIN combina cada linha de uma tabela com todas da outra.' },
        { q: 'Colunas sem match em LEFT JOIN ficam como?', opts: ['0', 'Vazio', 'NULL', 'Error'], answer: 2, explain: 'Colunas da tabela direita sem correspondência ficam NULL.' }
      ],
      hard: [
        { q: 'O que é um self-join?', opts: ['JOIN duplicado', 'Tabela juntando consigo mesma', 'JOIN automático', 'JOIN sem condição'], answer: 1, explain: 'Self-join: mesma tabela aparece dos dois lados, com aliases diferentes.' }
      ]
    },
    aggregate: {
      easy: [
        { q: 'Qual função conta o número de linhas?', opts: ['SUM()', 'COUNT()', 'TOTAL()', 'NUM()'], answer: 1, explain: 'COUNT() conta o número de linhas no resultado.' },
        { q: 'Qual função calcula a soma?', opts: ['ADD()', 'TOTAL()', 'SUM()', 'PLUS()'], answer: 2, explain: 'SUM() soma os valores de uma coluna numérica.' },
        { q: 'Qual função calcula a média?', opts: ['MEAN()', 'AVG()', 'AVERAGE()', 'MID()'], answer: 1, explain: 'AVG() calcula a média aritmética dos valores.' }
      ],
      medium: [
        { q: 'O que GROUP BY faz?', opts: ['Ordena resultados', 'Agrupa linhas com valores iguais', 'Filtra grupos', 'Conta linhas'], answer: 1, explain: 'GROUP BY agrupa linhas com mesmo valor para aplicar funções de agregação.' },
        { q: 'Qual é o resultado?', code: "SELECT city, COUNT(*)\nFROM users\nGROUP BY city\nHAVING COUNT(*) > 5;", opts: ['Todas as cidades', 'Cidades com mais de 5 users', 'Total de users', 'Error'], answer: 1, explain: 'GROUP BY agrupa por cidade. HAVING filtra grupos com mais de 5.' },
        { q: 'Diferença entre COUNT(*) e COUNT(coluna)?', opts: ['Nenhuma', 'COUNT(*) conta NULLs, COUNT(col) não', 'COUNT(col) é mais rápido', 'COUNT(*) é inválido'], answer: 1, explain: 'COUNT(*) conta todas as linhas. COUNT(col) ignora NULLs.' }
      ],
      hard: [
        { q: 'O que é uma window function?', code: 'SELECT nome, salario,\n  RANK() OVER (ORDER BY salario DESC)\nFROM funcionarios;', opts: ['Função de agregação normal', 'Calcula sobre partição sem agrupar', 'Função de filtro', 'Subquery'], answer: 1, explain: 'Window functions calculam sobre um conjunto de linhas relacionadas sem colapsar.' }
      ]
    },
    insert_update: {
      easy: [
        { q: 'Qual comando insere dados em uma tabela?', opts: ['ADD', 'INSERT INTO', 'PUT', 'CREATE'], answer: 1, explain: 'INSERT INTO tabela (colunas) VALUES (valores).' },
        { q: 'Qual comando atualiza dados existentes?', opts: ['CHANGE', 'MODIFY', 'UPDATE', 'ALTER'], answer: 2, explain: 'UPDATE tabela SET coluna = valor WHERE condição.' },
        { q: 'Qual comando remove linhas?', opts: ['REMOVE', 'DROP', 'DELETE', 'ERASE'], answer: 2, explain: 'DELETE FROM tabela WHERE condição.' }
      ],
      medium: [
        { q: 'O que acontece com UPDATE sem WHERE?', opts: ['Erro', 'Atualiza todas as linhas', 'Não atualiza nada', 'Atualiza a primeira linha'], answer: 1, explain: 'Sem WHERE, UPDATE afeta TODAS as linhas da tabela — muito perigoso!' },
        { q: 'Qual é a sintaxe correta?', opts: ["INSERT users VALUES ('Ana')", "INSERT INTO users (nome) VALUES ('Ana')", "INSERT TO users VALUES ('Ana')", "ADD INTO users ('Ana')"], answer: 1, explain: 'INSERT INTO tabela (colunas) VALUES (valores) é a sintaxe correta.' }
      ],
      hard: [
        { q: 'O que é UPSERT?', opts: ['Update + Insert', 'Inserir ou atualizar se existir', 'Update duplo', 'Insert paralelo'], answer: 1, explain: 'UPSERT: INSERT se não existe, UPDATE se já existe (ON CONFLICT em PostgreSQL).' }
      ]
    },
    create: {
      easy: [
        { q: 'Qual comando cria uma tabela?', opts: ['MAKE TABLE', 'NEW TABLE', 'CREATE TABLE', 'BUILD TABLE'], answer: 2, explain: 'CREATE TABLE define uma nova tabela no banco de dados.' },
        { q: 'O que PRIMARY KEY garante?', opts: ['Valor padrão', 'Unicidade e não-nulo', 'Auto incremento', 'Índice'], answer: 1, explain: 'PRIMARY KEY garante que o valor é único e não pode ser NULL.' },
        { q: 'O que NOT NULL faz?', opts: ['Deleta nulos', 'Impede valores nulos', 'Define padrão', 'Cria índice'], answer: 1, explain: 'NOT NULL obriga a coluna a ter um valor (não aceita NULL).' }
      ],
      medium: [
        { q: 'O que é uma FOREIGN KEY?', opts: ['Chave primária estrangeira', 'Referência a outra tabela', 'Chave criptografada', 'Índice especial'], answer: 1, explain: 'FOREIGN KEY cria referência entre tabelas, garantindo integridade.' },
        { q: 'Qual comando modifica a estrutura de uma tabela?', opts: ['MODIFY TABLE', 'UPDATE TABLE', 'ALTER TABLE', 'CHANGE TABLE'], answer: 2, explain: 'ALTER TABLE permite adicionar, remover ou modificar colunas.' }
      ],
      hard: [
        { q: 'Qual a diferença entre DROP e TRUNCATE?', opts: ['Nenhuma', 'DROP remove tabela, TRUNCATE remove dados', 'TRUNCATE é mais lento', 'DROP mantém estrutura'], answer: 1, explain: 'DROP deleta a tabela inteira. TRUNCATE remove só os dados, mantendo a estrutura.' }
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
        { q: 'Quanto é 2⁻² (2 elevado a -2)?', opts: ['−4', '4', '0.25', '−0.25'], answer: 2, explain: '2⁻² = 1/2² = 1/4 = 0.25.' },
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
        { q: 'Se x = 3 e y = 2, quanto vale x + y?', opts: ['5', '6', '1', '32'], answer: 0, explain: 'x + y = 3 + 2 = 5.' },
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
        { q: 'Simplifique: (2x³)²', opts: ['4x⁶', '2x⁶', '4x⁵', '2x⁵'], answer: 0, explain: '(2x³)² = 2² × (x³)² = 4x⁶.' }
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
        { q: 'Qual é o resultado de TRUE XOR TRUE?', opts: ['TRUE', 'FALSE', 'NULL', 'ERRO'], answer: 1, explain: 'XOR retorna FALSE quando ambos são iguais. TRUE XOR TRUE = FALSE.' }
      ],
      hard: [
        { q: 'Simplifique: A AND (A OR B)', opts: ['A', 'B', 'A AND B', 'A OR B'], answer: 0, explain: 'Lei da absorção: A AND (A OR B) = A.' },
        { q: 'Quantas linhas tem a tabela-verdade de 3 variáveis?', opts: ['3', '6', '8', '9'], answer: 2, explain: '2³ = 8 combinações possíveis para 3 variáveis booleanas.' },
        { q: 'Qual porta lógica é equivalente a NOT (A OR B)?', opts: ['NAND', 'NOR', 'XOR', 'XNOR'], answer: 1, explain: 'NOR = NOT OR. Retorna TRUE apenas quando ambos são FALSE.' },
        { q: 'Na implicação lógica (A → B), quando ela é FALSE?', opts: ['A=TRUE, B=TRUE', 'A=TRUE, B=FALSE', 'A=FALSE, B=TRUE', 'A=FALSE, B=FALSE'], answer: 1, explain: 'A implicação só é falsa quando a premissa (A) é verdadeira e a conclusão (B) é falsa.' }
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
        { q: 'Qual é o resultado de 5 << 1 (shift left)?', opts: ['2', '5', '10', '25'], answer: 2, explain: 'Shift left por 1 multiplica por 2. 5 << 1 = 10.' }
      ]
    },
    sets: {
      easy: [
        { q: 'O que é a UNIÃO de dois conjuntos (A ∪ B)?', opts: ['Elementos em A e B', 'Elementos em A ou B (ou ambos)', 'Elementos só em A', 'Elementos só em B'], answer: 1, explain: 'União inclui todos os elementos que estão em A, em B, ou em ambos.' },
        { q: 'O que é a INTERSEÇÃO (A ∩ B)?', opts: ['Todos elementos', 'Elementos em ambos A e B', 'Elementos só em A', 'Conjunto vazio'], answer: 1, explain: 'Interseção são os elementos que pertencem a A E a B simultaneamente.' },
        { q: 'Se A = {1,2,3} e B = {2,3,4}, qual é A ∩ B?', opts: ['{1,2,3,4}', '{2,3}', '{1,4}', '{1}'], answer: 1, explain: 'Elementos em ambos: 2 e 3. A ∩ B = {2,3}.' },
        { q: 'O que é o conjunto vazio?', opts: ['Um conjunto com zero', 'Um conjunto sem elementos', 'Um conjunto infinito', 'Não existe'], answer: 1, explain: 'Conjunto vazio (∅) não contém nenhum elemento.' },
        { q: 'Se A = {1,2,3} e B = {2,3,4}, qual é A ∪ B?', opts: ['{2,3}', '{1,4}', '{1,2,3,4}', '{1,2,3}'], answer: 2, explain: 'União de todos os elementos: {1,2,3,4}.' }
      ],
      medium: [
        { q: 'O que é A - B (diferença de conjuntos)?', opts: ['Elementos em A que NÃO estão em B', 'Elementos em B que não estão em A', 'Interseção', 'União'], answer: 0, explain: 'A - B = elementos exclusivos de A (que não estão em B).' },
        { q: 'Se A = {1,2,3,4} e B = {3,4,5}, qual é A - B?', opts: ['{1,2}', '{5}', '{3,4}', '{1,2,5}'], answer: 0, explain: 'A - B = elementos em A e não em B = {1,2}.' },
        { q: 'A é subconjunto de B (A ⊂ B) significa que...', opts: ['A e B são iguais', 'Todo elemento de A está em B', 'A é maior que B', 'A e B não têm elementos em comum'], answer: 1, explain: 'A ⊂ B significa que todos os elementos de A também estão em B.' },
        { q: 'Qual é o complemento de A se o universo U = {1,2,3,4,5} e A = {1,3}?', opts: ['{2,4,5}', '{1,3}', '{1,2,3,4,5}', '∅'], answer: 0, explain: 'Complemento = U - A = elementos no universo que não estão em A = {2,4,5}.' }
      ],
      hard: [
        { q: 'Se |A| = 10, |B| = 7 e |A ∩ B| = 3, qual é |A ∪ B|?', opts: ['14', '17', '20', '10'], answer: 0, explain: '|A ∪ B| = |A| + |B| - |A ∩ B| = 10 + 7 - 3 = 14.' },
        { q: 'O que é o produto cartesiano A × B?', opts: ['Interseção de A e B', 'Todos os pares ordenados (a,b)', 'Soma dos conjuntos', 'Diferença simétrica'], answer: 1, explain: 'A × B = conjunto de todos os pares (a,b) onde a∈A e b∈B.' },
        { q: 'Se A = {1,2} e B = {a,b}, quantos elementos tem A × B?', opts: ['2', '4', '6', '8'], answer: 1, explain: '|A × B| = |A| × |B| = 2 × 2 = 4 pares: (1,a), (1,b), (2,a), (2,b).' }
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
        { q: 'Quantos anagramas tem "ARARA"?', opts: ['120', '60', '20', '10'], answer: 2, explain: '5 letras com repetição: 5! / (3!×1!×1!) = 120/6 = 20.' }
      ]
    }
  },
  fundamentos_programacao: {
    pensamento_computacional: {
      easy: [
        { q: 'O que significa decompor um problema em programação?', opts: ['Ignorar partes difíceis', 'Quebrar em partes menores', 'Usar apenas uma linguagem', 'Executar sem planejar'], answer: 1, explain: 'Decomposição é dividir um problema grande em partes menores e mais simples.' },
        { q: 'Reconhecimento de padrões ajuda porque...', opts: ['Evita testes', 'Permite reaproveitar soluções parecidas', 'Substitui o algoritmo', 'Dispensa lógica'], answer: 1, explain: 'Ao reconhecer padrões, você aplica estratégias já conhecidas em problemas similares.' },
        { q: 'Abstração em pensamento computacional é...', opts: ['Guardar todo detalhe possível', 'Focar no que é essencial e ignorar ruído', 'Escrever mais código', 'Evitar documentação'], answer: 1, explain: 'Abstração reduz complexidade ao focar apenas no que importa para resolver o problema.' }
      ],
      medium: [
        { q: 'Qual sequência representa melhor o fluxo de resolução?', opts: ['Codar -> Entender problema -> Testar', 'Entender -> Planejar -> Implementar -> Testar', 'Testar -> Codar -> Planejar', 'Planejar -> Publicar -> Entender'], answer: 1, explain: 'Fluxo saudável: entender, planejar, implementar e validar com testes.' },
        { q: 'Quando dois problemas têm estrutura parecida, a melhor prática é...', opts: ['Criar tudo do zero sempre', 'Adaptar uma solução base para o novo contexto', 'Ignorar a semelhança', 'Trocar de linguagem'], answer: 1, explain: 'A reutilização de estratégia economiza tempo e reduz erros.' },
        { q: 'Pensamento computacional não depende de linguagem porque...', opts: ['Linguagens são todas iguais', 'A lógica da solução vem antes da sintaxe', 'Sintaxe não importa nunca', 'Computador resolve sozinho'], answer: 1, explain: 'A lógica é o núcleo; a linguagem é apenas a forma de implementar.' }
      ],
      hard: [
        { q: 'Escolher entre duas soluções corretas costuma envolver...', opts: ['Apenas estética', 'Trade-off entre clareza, tempo e memória', 'Somente velocidade', 'Somente tamanho do código'], answer: 1, explain: 'Engenharia de software envolve balancear critérios, não otimizar um único ponto.' },
        { q: 'Uma solução escalável deve considerar principalmente...', opts: ['Apenas o caso de 1 usuário', 'Comportamento com aumento de dados e uso', 'Só a interface visual', 'Só o nome das variáveis'], answer: 1, explain: 'Escalabilidade analisa como a solução se comporta quando a carga cresce.' },
        { q: 'Qual prática fortalece raciocínio algorítmico?', opts: ['Pular validação de hipótese', 'Testar cenários normais, limites e erro', 'Memorizar código sem entender', 'Evitar depuração'], answer: 1, explain: 'Cobrir cenários diferentes melhora robustez da lógica.' }
      ]
    },
    boas_praticas: {
      easy: [
        { q: 'Um bom nome de variável deve ser...', opts: ['Curto e sem sentido', 'Claro e descritivo', 'Sempre uma letra', 'Sempre em inglês técnico complexo'], answer: 1, explain: 'Nomes claros facilitam leitura, manutenção e revisão do código.' },
        { q: 'Indentação serve para...', opts: ['Apenas enfeite', 'Organizar visualmente blocos de código', 'Aumentar desempenho', 'Diminuir memória'], answer: 1, explain: 'Indentação facilita entender a estrutura lógica do programa.' },
        { q: 'Comentários úteis geralmente explicam...', opts: ['O óbvio', 'Decisões e contexto não triviais', 'A sintaxe básica da linguagem', 'Tudo linha por linha sem necessidade'], answer: 1, explain: 'Comentários devem registrar intenção e contexto, não repetir o código.' }
      ],
      medium: [
        { q: 'O princípio DRY significa...', opts: ['Deixar rápido e pronto', 'Evitar duplicação desnecessária de lógica', 'Usar só funções grandes', 'Nunca reutilizar código'], answer: 1, explain: 'DRY (Don’t Repeat Yourself) reduz repetição e facilita manutenção.' },
        { q: 'Funções pequenas e coesas são melhores porque...', opts: ['Gastam menos memória sempre', 'São mais fáceis de testar e manter', 'Dispensam documentação', 'Impedem bugs automaticamente'], answer: 1, explain: 'Escopo reduzido facilita entendimento, testes e evolução do código.' },
        { q: 'Refatorar é...', opts: ['Adicionar nova funcionalidade', 'Reorganizar código sem mudar comportamento externo', 'Apagar testes', 'Trocar linguagem obrigatoriamente'], answer: 1, explain: 'Refatoração melhora estrutura interna preservando resultado funcional.' }
      ],
      hard: [
        { q: 'Qual abordagem reduz risco ao refatorar?', opts: ['Refatorar tudo de uma vez sem testes', 'Pequenas mudanças com testes frequentes', 'Desativar validações', 'Trocar arquitetura inteira imediatamente'], answer: 1, explain: 'Incrementos pequenos e validados evitam regressões grandes.' },
        { q: 'Alta coesão e baixo acoplamento indicam que...', opts: ['Módulos dependem fortemente entre si', 'Cada módulo tem foco claro e poucas dependências', 'Não existe separação de responsabilidades', 'Tudo está em um único arquivo'], answer: 1, explain: 'Esse equilíbrio melhora manutenção e evolução do sistema.' },
        { q: 'Code review bem feito prioriza...', opts: ['Somente estilo visual', 'Correção, riscos, clareza e impacto de mudanças', 'Apenas tamanho do PR', 'Excluir comentários'], answer: 1, explain: 'Revisão técnica deve focar qualidade funcional e sustentabilidade do código.' }
      ]
    },
    testes_validacao: {
      easy: [
        { q: 'Caso de teste é...', opts: ['Apenas um bug encontrado', 'Uma entrada e resultado esperado para validar comportamento', 'Somente código de produção', 'Uma documentação visual'], answer: 1, explain: 'Caso de teste define cenário, entrada e resultado esperado.' },
        { q: 'Validar entrada do usuário ajuda a...', opts: ['Aumentar bugs', 'Evitar erros e dados inválidos', 'Remover necessidade de testes', 'Substituir banco de dados'], answer: 1, explain: 'Validação evita falhas por formatos e valores inválidos.' },
        { q: 'Teste de caso limite verifica...', opts: ['Somente casos comuns', 'Valores extremos e de fronteira', 'Apenas interface gráfica', 'Apenas performance'], answer: 1, explain: 'Casos de borda costumam revelar falhas escondidas.' }
      ],
      medium: [
        { q: 'Teste unitário foca em...', opts: ['Sistema inteiro com rede real', 'Uma parte isolada da lógica', 'Somente design visual', 'Servidor em produção'], answer: 1, explain: 'Unidade isolada facilita identificar a origem de erros.' },
        { q: 'Teste de regressão serve para...', opts: ['Criar funcionalidades novas', 'Garantir que mudanças não quebrem comportamentos antigos', 'Apenas medir latência', 'Substituir revisão de código'], answer: 1, explain: 'Regressão valida estabilidade após alterações.' },
        { q: 'A estrutura Given-When-Then ajuda a...', opts: ['Compilar mais rápido', 'Descrever cenário, ação e resultado esperado', 'Reduzir número de funções', 'Criar interface'], answer: 1, explain: 'Esse formato deixa testes legíveis e objetivos.' }
      ],
      hard: [
        { q: 'Teste flaky é aquele que...', opts: ['Falha sempre no mesmo ponto', 'Alterna entre passar/falhar sem mudança no código', 'Executa mais rápido', 'Nunca deve ser corrigido'], answer: 1, explain: 'Flakiness reduz confiança na suíte de testes e precisa ser tratada.' },
        { q: 'Ao priorizar testes, você deve começar por...', opts: ['Funcionalidades de menor impacto', 'Fluxos críticos de negócio e risco alto', 'Apenas telas secundárias', 'Somente funções utilitárias'], answer: 1, explain: 'Cobertura de áreas críticas reduz risco operacional.' },
        { q: 'Automação de testes agrega valor quando...', opts: ['Substitui qualquer teste manual', 'Fornece feedback rápido e repetível para mudanças frequentes', 'É usada sem critério', 'Elimina necessidade de requisitos'], answer: 1, explain: 'Automação eficiente acelera validação contínua e confiável.' }
      ]
    },
    eficiencia_basica: {
      easy: [
        { q: 'Eficiência em programação normalmente relaciona...', opts: ['Apenas aparência do app', 'Tempo de execução e uso de recursos', 'Somente número de linhas', 'Somente nome das funções'], answer: 1, explain: 'Eficiência considera desempenho e consumo de memória/CPU.' },
        { q: 'Evitar trabalho repetido dentro de loop ajuda a...', opts: ['Piorar performance', 'Melhorar tempo de execução', 'Aumentar bugs sempre', 'Remover legibilidade'], answer: 1, explain: 'Eliminar repetições desnecessárias costuma reduzir custo computacional.' },
        { q: 'Se você já encontrou o item procurado em uma lista, o ideal é...', opts: ['Continuar percorrendo até o fim sem necessidade', 'Interromper a busca', 'Ordenar toda lista', 'Copiar a lista'], answer: 1, explain: 'Saída antecipada evita processamento desnecessário.' }
      ],
      medium: [
        { q: 'Complexidade O(n) indica que...', opts: ['Tempo constante', 'Cresce proporcionalmente ao tamanho da entrada', 'Cresce ao quadrado sempre', 'Não depende dos dados'], answer: 1, explain: 'O(n) cresce linearmente com o número de elementos.' },
        { q: 'Em buscas frequentes por chave, estrutura chave-valor tende a ser...', opts: ['Pior escolha sempre', 'Mais adequada que varredura linear em array', 'Idêntica a lista ligada', 'Inútil para dados'], answer: 1, explain: 'Mapas/dicionários oferecem acesso mais rápido por chave na média.' },
        { q: 'Pré-calcular valores reutilizados é uma forma de...', opts: ['Aumentar complexidade sem ganho', 'Trocar algum uso de memória por ganho de tempo', 'Eliminar testes', 'Remover entrada do usuário'], answer: 1, explain: 'Esse trade-off pode acelerar operações repetitivas.' }
      ],
      hard: [
        { q: 'Dois loops aninhados sobre N elementos têm custo aproximado...', opts: ['O(1)', 'O(log n)', 'O(n²)', 'O(n)'], answer: 2, explain: 'Percursos aninhados do mesmo tamanho tendem a crescer quadraticamente.' },
        { q: 'Otimização prematura é um risco porque...', opts: ['Sempre melhora produto', 'Pode aumentar complexidade antes de medir gargalos reais', 'Dispensa benchmarks', 'Substitui arquitetura'], answer: 1, explain: 'Primeiro mede-se o problema real, depois otimiza com foco.' },
        { q: 'Uma decisão técnica madura sobre desempenho deve considerar...', opts: ['Somente velocidade bruta', 'Medições, impacto no código e custo de manutenção', 'Apenas opinião pessoal', 'Apenas moda do mercado'], answer: 1, explain: 'Boa engenharia considera evidência e trade-offs de longo prazo.' }
      ]
    }
  },
  fundamentos_computacao: {
    hardware_software: {
      easy: [
        { q: 'Hardware é...', opts: ['Programas e aplicativos', 'Parte física do computador', 'Apenas sistema operacional', 'Somente internet'], answer: 1, explain: 'Hardware são componentes físicos: CPU, RAM, disco, etc.' },
        { q: 'Software é...', opts: ['Teclado e mouse', 'Conjunto de programas e instruções', 'Só cabos e placas', 'Memória física apenas'], answer: 1, explain: 'Software é a parte lógica executada pelo hardware.' },
        { q: 'Qual componente executa instruções do programa?', opts: ['CPU', 'Monitor', 'Gabinete', 'Mouse'], answer: 0, explain: 'A CPU processa instruções e coordena operações.' }
      ],
      medium: [
        { q: 'RAM difere de SSD porque a RAM...', opts: ['Guarda dados sem energia por anos', 'É volátil e perde dados ao desligar', 'É mais lenta sempre', 'Serve só para backup'], answer: 1, explain: 'RAM é memória temporária de alta velocidade e volátil.' },
        { q: 'Firmware é...', opts: ['Um navegador web', 'Software embarcado em hardware', 'Uma linguagem de programação', 'Um antivírus'], answer: 1, explain: 'Firmware controla funções básicas de dispositivos eletrônicos.' },
        { q: 'Uma GPU é especialmente eficiente para...', opts: ['Exibir apenas texto simples', 'Processamento gráfico e tarefas paralelas', 'Salvar arquivos em disco', 'Gerenciar permissões de usuário'], answer: 1, explain: 'GPU processa muitos dados em paralelo, útil em gráficos e IA.' }
      ],
      hard: [
        { q: 'Quando CPU está ociosa aguardando disco, o gargalo principal tende a ser...', opts: ['I/O de armazenamento', 'Interface gráfica', 'Nome da variável', 'Compilador'], answer: 0, explain: 'Se a CPU espera dados do disco, o limite está no subsistema de I/O.' },
        { q: 'Virtualização permite principalmente...', opts: ['Aumentar tamanho físico da RAM', 'Executar múltiplos ambientes isolados no mesmo hardware', 'Remover sistema operacional', 'Compilar código automaticamente'], answer: 1, explain: 'Com virtualização, várias máquinas virtuais compartilham hardware físico.' },
        { q: 'Arquiteturas como ARM e x86 diferem em...', opts: ['Somente na cor da placa-mãe', 'Conjunto de instruções e desenho de execução', 'Apenas no sistema de arquivos', 'Somente no tipo de monitor'], answer: 1, explain: 'Arquitetura define instruções e características de processamento.' }
      ]
    },
    sistemas_operacionais: {
      easy: [
        { q: 'Um sistema operacional é responsável por...', opts: ['Criar internet global', 'Gerenciar recursos do computador e executar programas', 'Substituir hardware', 'Apenas tocar áudio'], answer: 1, explain: 'O SO organiza CPU, memória, arquivos e periféricos.' },
        { q: 'Processo é...', opts: ['Um arquivo de imagem', 'Programa em execução', 'Somente um driver', 'Pasta do sistema'], answer: 1, explain: 'Quando um programa roda, ele vira um processo no SO.' },
        { q: 'Sistema de arquivos serve para...', opts: ['Aumentar FPS', 'Organizar dados em arquivos e pastas', 'Criar linguagem de programação', 'Substituir memória RAM'], answer: 1, explain: 'O sistema de arquivos estrutura armazenamento e acesso aos dados.' }
      ],
      medium: [
        { q: 'Multitarefa em SO moderno significa...', opts: ['Rodar um único processo', 'Executar vários processos alternando CPU rapidamente', 'Apenas abrir várias janelas', 'Somente usar múltiplos monitores'], answer: 1, explain: 'O escalonador alterna tarefas para dar sensação de paralelismo.' },
        { q: 'Permissões de arquivo existem para...', opts: ['Diminuir tamanho dos arquivos', 'Controlar quem pode ler, escrever ou executar', 'Acelerar internet', 'Trocar formato de imagem'], answer: 1, explain: 'Permissões reforçam segurança e controle de acesso.' },
        { q: 'Thread comparada a processo é geralmente...', opts: ['Mais pesada em recursos', 'Mais leve e compartilhando memória do processo', 'Um tipo de disco', 'Sempre isolada completamente'], answer: 1, explain: 'Threads compartilham contexto do processo e têm menor custo.' }
      ],
      hard: [
        { q: 'Deadlock ocorre quando...', opts: ['Todos processos terminam normalmente', 'Tarefas ficam bloqueadas esperando recursos umas das outras', 'A CPU superaquece', 'A rede cai'], answer: 1, explain: 'No deadlock, há espera circular sem progresso.' },
        { q: 'Escalonador de CPU decide principalmente...', opts: ['Cor da interface do app', 'Qual processo/thread executa a seguir', 'Formato de arquivo', 'Idioma do teclado'], answer: 1, explain: 'Scheduling define ordem e fatia de tempo de execução.' },
        { q: 'Troca de contexto (context switch) é...', opts: ['Copiar arquivos entre pastas', 'Salvar/restaurar estado ao alternar execução entre tarefas', 'Formatar memória RAM', 'Reiniciar sistema'], answer: 1, explain: 'O SO preserva estado de uma tarefa para executar outra.' }
      ]
    },
    redes_internet: {
      easy: [
        { q: 'Endereço IP identifica...', opts: ['Somente um navegador', 'Um dispositivo na rede', 'A senha do Wi-Fi', 'A resolução de tela'], answer: 1, explain: 'IP é o identificador lógico de rede para comunicação.' },
        { q: 'Modelo cliente-servidor significa que...', opts: ['Todo computador faz tudo ao mesmo tempo', 'Um cliente solicita e um servidor responde', 'Não há troca de dados', 'Só funciona sem internet'], answer: 1, explain: 'Esse modelo organiza requisições e respostas entre aplicações.' },
        { q: 'Uma URL representa...', opts: ['Apenas o nome do Wi-Fi', 'Endereço de um recurso na web', 'Tipo de cabo de rede', 'Modelo do roteador'], answer: 1, explain: 'URL localiza recursos web como páginas e APIs.' }
      ],
      medium: [
        { q: 'HTTPS adiciona ao HTTP principalmente...', opts: ['Compressão de imagens', 'Criptografia via TLS', 'Mais abas no navegador', 'Troca de sistema operacional'], answer: 1, explain: 'HTTPS protege comunicação com criptografia e autenticação.' },
        { q: 'DNS transforma...', opts: ['Texto em imagem', 'Nome de domínio em endereço IP', 'IP em senha', 'Pacotes em arquivos'], answer: 1, explain: 'DNS resolve nomes amigáveis para IPs roteáveis.' },
        { q: 'Latência em rede é...', opts: ['Quantidade total de dados', 'Tempo de ida e volta da comunicação', 'Número de usuários online', 'Capacidade do disco'], answer: 1, explain: 'Latência mede atraso temporal da comunicação.' }
      ],
      hard: [
        { q: 'TCP e UDP diferem porque TCP...', opts: ['Nunca chega ao destino', 'Prioriza confiabilidade e ordem de entrega', 'É sempre mais rápido sem custo', 'Só funciona localmente'], answer: 1, explain: 'TCP garante entrega/ordem; UDP prioriza baixa sobrecarga.' },
        { q: 'CDN melhora entrega de conteúdo ao...', opts: ['Aumentar tamanho dos arquivos', 'Distribuir cópias em servidores geograficamente próximos', 'Remover cache', 'Desativar DNS'], answer: 1, explain: 'Servidores próximos reduzem latência de acesso.' },
        { q: 'Em APIs REST, endpoint representa...', opts: ['Cor do botão', 'URL de um recurso/operação', 'Formato físico do servidor', 'Tamanho da CPU'], answer: 1, explain: 'Endpoint é o ponto de acesso HTTP para recursos.' }
      ]
    },
    dados_memoria: {
      easy: [
        { q: '1 byte equivale a...', opts: ['2 bits', '4 bits', '8 bits', '16 bits'], answer: 2, explain: 'Byte é unidade de 8 bits.' },
        { q: 'Memória volátil perde dados quando...', opts: ['Atualiza o navegador', 'Falta energia/desliga o equipamento', 'Muda idioma do sistema', 'Conecta na internet'], answer: 1, explain: 'Memória volátil depende de energia para manter dados.' },
        { q: 'Bits armazenam informação em...', opts: ['Base decimal de 0 a 9', 'Dois estados: 0 e 1', 'Letras do alfabeto', 'Apenas símbolos'], answer: 1, explain: 'Bit é unidade binária com dois estados possíveis.' }
      ],
      medium: [
        { q: 'UTF-8 é usado para...', opts: ['Comprimir vídeos', 'Codificar caracteres de texto', 'Formatar discos', 'Executar threads'], answer: 1, explain: 'UTF-8 representa caracteres de diferentes idiomas em bytes.' },
        { q: 'Overflow numérico ocorre quando...', opts: ['Variável recebe texto', 'Valor excede o limite representável do tipo', 'Programa compila com sucesso', 'CPU entra em modo de economia'], answer: 1, explain: 'Cada tipo tem limites de faixa; exceder gera overflow.' },
        { q: 'Cache de memória busca principalmente...', opts: ['Guardar backup permanente', 'Reduzir tempo de acesso a dados frequentes', 'Substituir banco de dados', 'Aumentar tamanho da tela'], answer: 1, explain: 'Cache aproxima dados de uso frequente do processador.' }
      ],
      hard: [
        { q: 'Pilha (stack) e heap diferem porque stack...', opts: ['É sempre mais lenta', 'Armazena contexto local com gerenciamento mais previsível', 'Guarda somente arquivos', 'Não guarda variáveis'], answer: 1, explain: 'Stack é usada para chamadas/funções; heap para alocação dinâmica.' },
        { q: 'Serializar dados significa...', opts: ['Apagar dados antigos', 'Converter estrutura em formato para armazenamento/transmissão', 'Executar em paralelo', 'Trocar de linguagem automaticamente'], answer: 1, explain: 'Serialização transforma objetos em formatos como JSON/binário.' },
        { q: 'Endianness descreve...', opts: ['Velocidade de rede', 'Ordem dos bytes na representação de dados', 'Tipo de teclado', 'Quantidade de threads'], answer: 1, explain: 'Endian define como bytes multi-byte são organizados na memória.' }
      ]
    }
  },
  historia_computacao: {
    pioneiros: {
      easy: [
        { q: 'Ada Lovelace é lembrada por...', opts: ['Criar o primeiro navegador', 'Escrever um dos primeiros algoritmos para máquina analítica', 'Inventar o transistor', 'Fundar a internet'], answer: 1, explain: 'Ada Lovelace escreveu notas com algoritmo para a máquina de Babbage.' },
        { q: 'Alan Turing ficou conhecido por contribuições em...', opts: ['Design gráfico', 'Fundamentos da computação e criptoanálise', 'Banco de dados SQL', 'Hardware móvel'], answer: 1, explain: 'Turing contribuiu para teoria computacional e quebra de códigos.' },
        { q: 'Grace Hopper teve grande impacto em...', opts: ['Redes sociais', 'Compiladores e linguagens de alto nível', 'Placas de vídeo', 'Jogos 3D'], answer: 1, explain: 'Grace Hopper foi pioneira em compiladores e no COBOL.' }
      ],
      medium: [
        { q: 'Arquitetura de von Neumann introduziu a ideia de...', opts: ['Somente memória em nuvem', 'Programa armazenado na memória', 'GPU dedicada', 'Navegador integrado'], answer: 1, explain: 'Programa armazenado foi marco da computação moderna.' },
        { q: 'Cartões perfurados de Hollerith foram importantes para...', opts: ['Renderizar gráficos 3D', 'Processamento de dados em larga escala inicial', 'Criptografia quântica', 'Sistemas mobile'], answer: 1, explain: 'Cartões perfurados aceleraram processamento estatístico no início.' },
        { q: 'ENIAC é historicamente conhecido como...', opts: ['Primeiro smartphone', 'Um dos primeiros computadores eletrônicos de uso geral', 'Primeiro SSD', 'Primeiro notebook'], answer: 1, explain: 'ENIAC foi um marco entre os primeiros computadores eletrônicos gerais.' }
      ],
      hard: [
        { q: 'Claude Shannon é referência por conectar lógica booleana a...', opts: ['Motores de busca', 'Circuitos digitais e teoria da informação', 'Design de bancos relacionais', 'Sistemas embarcados automotivos'], answer: 1, explain: 'Shannon fundamentou teoria da informação e lógica em circuitos.' },
        { q: 'A máquina de Turing é relevante porque...', opts: ['Foi o primeiro computador comercial', 'Modela formalmente o conceito de computação', 'Criou a web', 'Eliminou necessidade de algoritmos'], answer: 1, explain: 'É um modelo matemático central para teoria da computação.' },
        { q: 'O avanço dos pioneiros influenciou diretamente...', opts: ['Somente jogos', 'Linguagens, arquitetura de computadores e ciência da computação', 'Apenas impressão de documentos', 'Só redes locais'], answer: 1, explain: 'As bases teóricas e práticas dos pioneiros sustentam tecnologia atual.' }
      ]
    },
    geracoes_computadores: {
      easy: [
        { q: 'A primeira geração de computadores foi marcada por...', opts: ['Microprocessadores', 'Válvulas eletrônicas', 'Transistores', 'Computação em nuvem'], answer: 1, explain: 'Primeira geração usava válvulas, com grande consumo e tamanho.' },
        { q: 'A segunda geração evoluiu principalmente com...', opts: ['Discos SSD', 'Transistores', 'Tablets', 'Inteligência artificial generativa'], answer: 1, explain: 'Transistores substituíram válvulas, reduzindo tamanho e calor.' },
        { q: 'A quarta geração é associada ao avanço de...', opts: ['Cartões perfurados', 'Microprocessadores', 'Válvulas a vácuo', 'Relés mecânicos'], answer: 1, explain: 'Microprocessadores permitiram PCs e massificação da computação.' }
      ],
      medium: [
        { q: 'Circuitos integrados caracterizam principalmente a...', opts: ['Primeira geração', 'Terceira geração', 'Quinta geração', 'Geração mecânica'], answer: 1, explain: 'A terceira geração foi impulsionada por circuitos integrados.' },
        { q: 'A popularização do computador pessoal trouxe...', opts: ['Menos acesso à tecnologia', 'Computação para uso doméstico e empresarial amplo', 'Fim das linguagens de alto nível', 'Substituição completa da internet'], answer: 1, explain: 'PCs democratizaram acesso e produtividade digital.' },
        { q: 'A ideia de quinta geração historicamente envolve forte foco em...', opts: ['Máquinas de escrever', 'IA e sistemas mais inteligentes', 'Programação em cartões', 'Computadores sem memória'], answer: 1, explain: 'Muitos projetos da quinta geração focaram inteligência artificial.' }
      ],
      hard: [
        { q: 'A Lei de Moore descreve, de forma aproximada, que...', opts: ['Internet dobra de preço', 'Número de transistores cresce com o tempo', 'RAM deixa de existir', 'CPU sempre esquenta menos'], answer: 1, explain: 'A observação clássica trata do aumento de transistores em chips.' },
        { q: 'Miniaturização de componentes impactou diretamente...', opts: ['Apenas estética dos gabinetes', 'Custo, consumo energético e acesso em larga escala', 'Fim de sistemas operacionais', 'Eliminação de redes'], answer: 1, explain: 'Componentes menores viabilizaram dispositivos mais baratos e eficientes.' },
        { q: 'A transição para serviços em nuvem representa...', opts: ['Volta aos cartões perfurados', 'Mudança de paradigma para infraestrutura distribuída', 'Fim de data centers', 'Substituição de protocolos de rede'], answer: 1, explain: 'Cloud amplia elasticidade e distribuição de recursos computacionais.' }
      ]
    },
    historia_internet: {
      easy: [
        { q: 'A internet moderna tem raízes em qual projeto?', opts: ['COBOL-Net', 'ARPANET', 'ENIAC-Web', 'FORTRAN-Link'], answer: 1, explain: 'ARPANET é um precursor importante da internet atual.' },
        { q: 'A World Wide Web foi proposta por...', opts: ['Alan Turing', 'Tim Berners-Lee', 'Bill Gates', 'Dennis Ritchie'], answer: 1, explain: 'Tim Berners-Lee propôs a web com HTTP, HTML e URL.' },
        { q: 'Navegadores web servem para...', opts: ['Compilar qualquer linguagem', 'Acessar e interpretar páginas da web', 'Substituir roteadores', 'Criar bancos relacionais'], answer: 1, explain: 'Browsers exibem conteúdo web e executam recursos associados.' }
      ],
      medium: [
        { q: 'Adoção do TCP/IP foi marco porque...', opts: ['Criou os chips', 'Padronizou comunicação entre redes diferentes', 'Eliminou endereços IP', 'Substituiu HTTP imediatamente'], answer: 1, explain: 'TCP/IP tornou interoperável a comunicação entre múltiplas redes.' },
        { q: 'O avanço da banda larga permitiu principalmente...', opts: ['Menos conteúdo multimídia', 'Mais velocidade e uso intenso de serviços online', 'Fim de vídeo na web', 'Fim das redes móveis'], answer: 1, explain: 'Mais banda favoreceu streaming, apps online e colaboração em tempo real.' },
        { q: 'Web 2.0 é geralmente associada a...', opts: ['Páginas totalmente estáticas', 'Participação ativa de usuários e plataformas sociais', 'Fim do JavaScript', 'Apenas sites acadêmicos'], answer: 1, explain: 'Web 2.0 destacou conteúdo gerado por usuários e interatividade.' }
      ],
      hard: [
        { q: 'Padrões abertos na internet são importantes porque...', opts: ['Aumentam bloqueio entre sistemas', 'Facilitam interoperabilidade e evolução do ecossistema', 'Impedem inovação', 'Eliminam segurança'], answer: 1, explain: 'Padrões abertos permitem que sistemas diversos se comuniquem.' },
        { q: 'Neutralidade de rede trata principalmente de...', opts: ['Cor dos cabos', 'Tratamento isonômico do tráfego por provedores', 'Compressão de imagem', 'Quantidade de roteadores'], answer: 1, explain: 'O princípio evita discriminação de tráfego por conteúdo/origem.' },
        { q: 'A evolução da internet para nuvem e edge computing reflete...', opts: ['Centralização absoluta em um único servidor', 'Distribuição de processamento conforme latência e escala', 'Fim dos protocolos', 'Substituição de DNS por arquivos locais'], answer: 1, explain: 'Arquiteturas modernas combinam nuvem e borda para desempenho e escala.' }
      ]
    },
    historia_linguagens: {
      easy: [
        { q: 'FORTRAN é historicamente relevante por ser...', opts: ['Primeiro banco de dados', 'Uma das primeiras linguagens de alto nível amplamente usadas', 'Primeiro navegador', 'Primeiro sistema operacional gráfico'], answer: 1, explain: 'FORTRAN marcou o início do uso amplo de linguagens de alto nível.' },
        { q: 'A linguagem C influenciou fortemente...', opts: ['Apenas planilhas', 'Diversas linguagens modernas e sistemas operacionais', 'Somente design web', 'Redes sociais exclusivamente'], answer: 1, explain: 'C influenciou sintaxe e conceitos de muitas linguagens posteriores.' },
        { q: 'Python foi criado por...', opts: ['Guido van Rossum', 'Tim Berners-Lee', 'Bjarne Stroustrup', 'James Gosling'], answer: 0, explain: 'Guido van Rossum iniciou o desenvolvimento do Python.' }
      ],
      medium: [
        { q: 'Uma vantagem de linguagens de alto nível sobre baixo nível é...', opts: ['Menor legibilidade', 'Maior produtividade e abstração', 'Ausência total de desempenho', 'Impossibilidade de depurar'], answer: 1, explain: 'Alto nível acelera desenvolvimento ao abstrair detalhes de hardware.' },
        { q: 'Java popularizou a ideia de...', opts: ['Código só para um sistema', 'Portabilidade com “write once, run anywhere”', 'Programação sem classes', 'Web sem scripts'], answer: 1, explain: 'A JVM permitiu executar Java em múltiplas plataformas.' },
        { q: 'JavaScript se tornou central na web por...', opts: ['Rodar apenas no servidor originalmente', 'Permitir interatividade no navegador', 'Substituir HTML e CSS completamente', 'Excluir necessidade de APIs'], answer: 1, explain: 'JS habilitou interfaces dinâmicas no cliente web.' }
      ],
      hard: [
        { q: 'Evolução de linguagens mostra que paradigmas...', opts: ['São imutáveis', 'Coexistem e se combinam conforme o problema', 'Só o imperativo importa', 'Eliminam necessidade de algoritmos'], answer: 1, explain: 'Hoje é comum linguagens suportarem múltiplos paradigmas.' },
        { q: 'Gerenciamento automático de memória (GC) impacta principalmente...', opts: ['Apenas visual do app', 'Produtividade e segurança, com trade-offs de desempenho', 'Formato de URL', 'Versão do navegador'], answer: 1, explain: 'GC reduz erros de memória, mas exige decisões de runtime.' },
        { q: 'Comunidades open source influenciam linguagens ao...', opts: ['Impedir evolução', 'Evoluir bibliotecas, ferramentas e padrões de uso', 'Excluir documentação', 'Remover compatibilidade'], answer: 1, explain: 'Ecossistema comunitário acelera inovação e adoção de boas práticas.' }
      ]
    }
  }
};

const QUESTION_VARIANT_PREFIXES = [
  'Contexto prático:',
  'Situação real:',
  'Releitura guiada:'
];

function createQuestionTextVariant(question, index) {
  const prefix = QUESTION_VARIANT_PREFIXES[index % QUESTION_VARIANT_PREFIXES.length];
  const clean = typeof question.q === 'string' ? question.q.trim() : '';
  const opts = Array.isArray(question.opts) ? [...question.opts] : [];
  let answer = Number(question.answer || 0);
  if (opts.length > 1) {
    const shift = (index % (opts.length - 1)) + 1;
    const rotated = opts.map((_, i) => opts[(i + shift) % opts.length]);
    answer = (answer - shift + opts.length) % opts.length;
    return {
      q: `${prefix} ${clean}`,
      code: question.code,
      opts: rotated,
      answer,
      explain: question.explain
    };
  }
  return {
    q: `${prefix} ${clean}`,
    code: question.code,
    opts,
    answer,
    explain: question.explain
  };
}

function injectQuestionVariants() {
  Object.values(QUESTIONS).forEach((langGroup) => {
    Object.values(langGroup).forEach((topicGroup) => {
      ['easy', 'medium', 'hard'].forEach((diff) => {
        const list = topicGroup[diff];
        if (!Array.isArray(list) || list.length === 0) return;
        const base = [...list];
        const variantCount = Math.max(1, Math.floor(base.length * 0.35));
        const variants = base.slice(0, variantCount).map((q, idx) => createQuestionTextVariant(q, idx));
        list.push(...variants);
      });
    });
  });
}

injectQuestionVariants();


export { LANGUAGES, TOPICS, QUESTIONS };
