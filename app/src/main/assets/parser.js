/*
 * Meu Assessor — interpretador de frases em português.
 * Transforma "meu assessor, comprei um chocolate por 10 reais" em
 * { tipo: 'saida', valor: 1000 (centavos), desc: 'Chocolate', cat: 'lazer', ... }
 * Funciona 100% offline, sem internet.
 */
(function (root) {
  'use strict';

  // ------------------------------------------------------------------
  // Categorias
  // ------------------------------------------------------------------
  var CATEGORIAS = {
    saida: [
      { id: 'alimentacao', nome: 'Alimentação', emoji: '🍽️', cor: '#E8833A' },
      { id: 'lazer', nome: 'Lazer', emoji: '🎉', cor: '#D9488B' },
      { id: 'transporte', nome: 'Transporte', emoji: '🚗', cor: '#3B82C4' },
      { id: 'casa', nome: 'Casa e contas', emoji: '🏠', cor: '#9A7444' },
      { id: 'saude', nome: 'Saúde', emoji: '💊', cor: '#2BA37A' },
      { id: 'educacao', nome: 'Educação', emoji: '📚', cor: '#6C5CE7' },
      { id: 'compras', nome: 'Compras', emoji: '🛍️', cor: '#C9A227' },
      { id: 'assinaturas', nome: 'Assinaturas', emoji: '📺', cor: '#E0533D' },
      { id: 'cuidados', nome: 'Cuidados pessoais', emoji: '💇', cor: '#B565D9' },
      { id: 'pets', nome: 'Pets', emoji: '🐾', cor: '#7A9E3B' },
      { id: 'outros', nome: 'Outros', emoji: '📦', cor: '#8C8C8C' }
    ],
    entrada: [
      { id: 'salario', nome: 'Salário', emoji: '💼', cor: '#127A55' },
      { id: 'extra', nome: 'Renda extra', emoji: '💡', cor: '#1E9E6A' },
      { id: 'presente', nome: 'Presente', emoji: '🎁', cor: '#2BB673' },
      { id: 'reembolso', nome: 'Reembolso', emoji: '↩️', cor: '#3AA88F' },
      { id: 'investimentos', nome: 'Investimentos', emoji: '📈', cor: '#0E6B5C' },
      { id: 'outros_in', nome: 'Outras entradas', emoji: '💰', cor: '#4C9A6A' }
    ]
  };

  // Palavras-chave (sem acento). "palavra*" = começa com.
  var KW = {
    alimentacao: 'mercado supermercado mercadinho atacadao assai carrefour almoco almocei janta jantar jantei lanche* lanchei comida refeic* restaurante* marmit* quentinha padaria pao paes feira acougue hortifruti sacolao verdura* fruta* legume* carne* frango arroz feijao macarrao leite ovo ovos queijo* presunto iogurte* ifood rappi delivery pizza* hamburguer* burger mcdonald* mcdonalds esfiha* pastel* salgado* coxinha* cafe cafezinho agua acucar oleo biscoito* bolacha* cafe-da-manha|cafe da manha|burger king|pao de queijo',
    lazer: 'chocolate* doce doces docinho* bala balas chiclete* sorvete* acai picole* bombom* brigadeiro* bolo* torta* salgadinho* refri refris refrigerante* coca cerveja* breja* chopp chope latinha* bebida* drink* vinho* whisky uisque vodka cachaca gin bar barzinho boteco balada festa* cinema filme pipoca show shows ingresso* teatro jogo jogos game games steam playstation xbox nintendo passeio parque praia viagem viajar hotel pousada airbnb boliche futebol pelada karaoke role rolezinho sinuca museu aposta* bet|meia entrada',
    transporte: 'uber 99 99pop taxi onibus busao metro trem brt vlt passagem* bilhete* gasolina combustivel etanol diesel gnv abasteci* abastecer posto estacionamento estacionar pedagio oficina mecanico pneu* borracharia lavagem moto carro ipva licenciamento multa* revisao bicicleta bike patinete cabify indriver|zona azul|lava jato|troca de oleo|bilhete unico',
    casa: 'aluguel condominio luz energia enel cemig copel sabesp internet wifi telefone gas botijao iptu boleto* conta contas faxina diarista limpeza detergente sabao amaciante moveis movel sofa reforma eletricista encanador|conta de luz|conta de agua|conta de gas|conta de internet|conta de telefone|recarga de celular|recarga do celular|papel higienico|material de construcao|produto de limpeza|produtos de limpeza',
    saude: 'farmacia drogaria drogasil remedio* medicamento* medico* medica consulta* dentista exame* hospital clinica convenio psicolog* terapia terapeuta vacina* vitamina* oculos lente* academia smartfit suplemento* whey creatina fisioterapia fisio|plano de saude',
    educacao: 'curso* faculdade escola colegio mensalidade livro* apostila* caderno* caneta* lapis ingles aula* udemy alura prova inscricao vestibular enem xerox impressao|material escolar',
    compras: 'roupa* camisa* camiseta* blusa* calca calcas bermuda* shorts vestido* saia* jaqueta* casaco* moletom* meia meias cueca* calcinha* sutia tenis sapato* chinelo* sandalia* bone* bolsa* mochila* relogio* perfume* maquiagem celular fone* carregador* eletronico* notebook computador tv televisao presente* loja* shopping shopee amazon shein aliexpress magalu americanas brinquedo* utensilio*|mercado livre',
    assinaturas: 'netflix spotify disney hbo globoplay deezer icloud assinatura* chatgpt paramount crunchyroll|amazon prime|prime video|youtube premium|apple music|game pass|ps plus|disney plus',
    cuidados: 'cabelo cabeleireir* salao barbeiro barbearia barba manicure unha* sobrancelha* depilacao estetica skincare shampoo xampu condicionador sabonete* desodorante* creme* hidratante* escova*|pasta de dente|corte de cabelo',
    pets: 'racao pet petshop veterinari* vet cachorro gato coleira petisco*|banho e tosa|areia do gato|pet shop',
    salario: 'salario* holerite contracheque adiantamento vale ferias plr bonus pagamento|decimo terceiro',
    extra: 'freela* freelance bico* venda* vendi comissao servico* trampo corrida* gorjeta* cliente* uber 99 ifood cache diaria',
    presente: 'presente* mesada aniversario heranca mae pai vo avo avos tia tio namorad* padrinho madrinha irmao irma esposa marido|me deu|me deram|ganhei de',
    reembolso: 'reembolso* devolveu devolveram estorno* cashback|me pagou|me pagaram|me devolveu|me devolveram',
    investimentos: 'rendimento* rendeu juros dividendo* cdb poupanca tesouro acoes fii fiis resgate resgatei cripto bitcoin'
  };

  var KW_INDEX = (function () {
    var idx = {};
    Object.keys(KW).forEach(function (cat) {
      var parts = KW[cat].split('|');
      var single = parts[0].split(/\s+/).filter(Boolean);
      idx[cat] = {
        exact: {},
        prefix: [],
        multi: parts.slice(1).map(function (m) { return m.trim(); }).filter(Boolean)
      };
      single.forEach(function (w) {
        if (w.indexOf('-') >= 0) { idx[cat].multi.push(w.replace(/-/g, ' ')); return; }
        if (w.charAt(w.length - 1) === '*') idx[cat].prefix.push(w.slice(0, -1));
        else idx[cat].exact[w] = true;
      });
    });
    return idx;
  })();

  var CAT_ORDER = {
    saida: ['assinaturas', 'pets', 'saude', 'educacao', 'casa', 'transporte', 'cuidados', 'lazer', 'alimentacao', 'compras'],
    entrada: ['salario', 'investimentos', 'extra', 'reembolso', 'presente']
  };

  // ------------------------------------------------------------------
  // Utilidades
  // ------------------------------------------------------------------
  function norm(s) {
    return String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  function catInfo(id) {
    var all = CATEGORIAS.saida.concat(CATEGORIAS.entrada);
    for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
    return CATEGORIAS.saida[CATEGORIAS.saida.length - 1];
  }

  function tokenMatchesCat(tok, cat) {
    var ix = KW_INDEX[cat];
    if (!ix || !tok) return false;
    if (ix.exact[tok]) return true;
    if (tok.length > 3 && tok.charAt(tok.length - 1) === 's' && ix.exact[tok.slice(0, -1)]) return true;
    if (tok.length > 4 && tok.slice(-2) === 'es' && ix.exact[tok.slice(0, -2)]) return true;
    for (var i = 0; i < ix.prefix.length; i++) {
      if (tok.indexOf(ix.prefix[i]) === 0) return true;
    }
    return false;
  }

  function multiMatch(text, cat) {
    var ix = KW_INDEX[cat];
    var padded = ' ' + text + ' ';
    for (var i = 0; i < ix.multi.length; i++) {
      if (padded.indexOf(' ' + ix.multi[i] + ' ') >= 0) return true;
    }
    return false;
  }

  var STOP = toSet('a o as os um uma uns umas de do da dos das no na nos nas em num numa por pelo pela pelos pelas pra pro pras pros para com e ou que ao aos meu minha meus minhas seu sua seus suas teu tua isso esse essa este esta aquele aquela la ali aqui mais muito pouco so tambem ja ainda entao tipo ne ai ae eu me mim nos voce agora hoje gente coisa coisinha');

  function toSet(str) {
    var s = {};
    str.split(/\s+/).forEach(function (w) { if (w) s[w] = true; });
    return s;
  }

  /**
   * Escolhe a categoria.
   * descToks: tokens normalizados da descrição; allToks: todos os tokens da frase.
   */
  function categorizar(tipo, descToks, allToks, aprendido) {
    aprendido = aprendido || {};
    var desc = descToks.join(' ');
    var lista = CAT_ORDER[tipo === 'entrada' ? 'entrada' : 'saida'];
    var valid = {};
    lista.forEach(function (c) { valid[c] = true; });
    valid[tipo === 'entrada' ? 'outros_in' : 'outros'] = true;

    var porDesc = aprendido.desc || {};
    var porTok = aprendido.tok || {};
    var key = tipo + ':' + desc;
    if (desc && porDesc[key] && (valid[porDesc[key]])) return porDesc[key];

    var i, j;
    for (i = 0; i < descToks.length; i++) {
      var lt = porTok[tipo + ':' + descToks[i]];
      if (lt && valid[lt]) return lt;
    }
    for (j = 0; j < lista.length; j++) if (multiMatch(desc, lista[j])) return lista[j];
    for (i = 0; i < descToks.length; i++) {
      if (STOP[descToks[i]]) continue;
      for (j = 0; j < lista.length; j++) if (tokenMatchesCat(descToks[i], lista[j])) return lista[j];
    }
    var all = allToks.join(' ');
    for (j = 0; j < lista.length; j++) if (multiMatch(all, lista[j])) return lista[j];
    for (i = 0; i < allToks.length; i++) {
      if (STOP[allToks[i]]) continue;
      for (j = 0; j < lista.length; j++) if (tokenMatchesCat(allToks[i], lista[j])) return lista[j];
    }
    return tipo === 'entrada' ? 'outros_in' : 'outros';
  }

  // ------------------------------------------------------------------
  // Números
  // ------------------------------------------------------------------
  var WORDNUM = {
    zero: [0, 'u'],
    um: [1, 'u'], uma: [1, 'u'], dois: [2, 'u'], duas: [2, 'u'], tres: [3, 'u'], quatro: [4, 'u'],
    cinco: [5, 'u'], seis: [6, 'u'], sete: [7, 'u'], oito: [8, 'u'], nove: [9, 'u'],
    dez: [10, 't'], onze: [11, 't'], doze: [12, 't'], treze: [13, 't'], catorze: [14, 't'], quatorze: [14, 't'],
    quinze: [15, 't'], dezesseis: [16, 't'], dezasseis: [16, 't'], dezessete: [17, 't'], dezassete: [17, 't'],
    dezoito: [18, 't'], dezenove: [19, 't'], dezanove: [19, 't'],
    vinte: [20, 'd'], trinta: [30, 'd'], quarenta: [40, 'd'], cinquenta: [50, 'd'], sessenta: [60, 'd'],
    setenta: [70, 'd'], oitenta: [80, 'd'], noventa: [90, 'd'],
    cem: [100, 'c'], cento: [100, 'c'], duzentos: [200, 'c'], duzentas: [200, 'c'], trezentos: [300, 'c'],
    trezentas: [300, 'c'], quatrocentos: [400, 'c'], quatrocentas: [400, 'c'], quinhentos: [500, 'c'],
    quinhentas: [500, 'c'], seiscentos: [600, 'c'], seiscentas: [600, 'c'], setecentos: [700, 'c'],
    setecentas: [700, 'c'], oitocentos: [800, 'c'], oitocentas: [800, 'c'], novecentos: [900, 'c'], novecentas: [900, 'c'],
    mil: [1000, 'm'], milhao: [1000000, 'm'], milhoes: [1000000, 'm']
  };

  var MOEDA = toSet('real reais conto contos pila pilas pau paus mango mangos prata pratas');
  var CENTAVOS = toSet('centavo centavos');
  var UNIDADES = toSet('kg quilo quilos kilo kilos litro litros l g gramas grama unidade unidades un pacote pacotes caixa caixas hora horas h min minuto minutos dia dias mes meses ano anos km metro metros m ml vez vezes x parcela parcelas porcento % fatias fatia pedacos pedaco');
  var PRECO_ANTES = toSet('por custou custa custando custaram paguei pago pagar gastei gasto gastar gastos foi foram deu deram recebi recebo ganhei ganho valor total tenho tem tinha com caiu cairam entrou entraram vendi saquei saque depositei sobrou sobraram ficou restam resta r$ preco torrei gastamos pagamos recebemos ganhamos abasteci transferi mandei rendeu');
  var PREP_DEPOIS = toSet('de do da dos das no na nos nas em com pro pra para pelo pela');

  function digitValue(t) {
    if (/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(t)) return parseFloat(t.replace(/\./g, '').replace(',', '.'));
    if (/^\d{1,3}(,\d{3})+$/.test(t)) return parseFloat(t.replace(/,/g, ''));
    if (/^\d+,\d{1,2}$/.test(t)) return parseFloat(t.replace(',', '.'));
    if (/^\d+\.\d{1,2}$/.test(t)) return parseFloat(t);
    if (/^\d+$/.test(t)) return parseInt(t, 10);
    return null;
  }

  function canAdd(cur, kind) {
    var r = cur % 1000;
    if (kind === 'c') return r === 0;
    if (kind === 'd' || kind === 't') return r % 100 === 0;
    if (kind === 'u') return r % 10 === 0 && (r % 100 === 0 || r % 100 >= 20);
    return false;
  }

  /** Lê um número (dígitos ou por extenso) a partir de tokens[i]. */
  function readNumber(T, i) {
    if (i >= T.length) return null;
    var t = T[i].n;
    var dv = digitValue(t);
    if (dv !== null) {
      var end = i + 1;
      var v = dv;
      if (!T[i].brk && end < T.length && WORDNUM[T[end].n] && WORDNUM[T[end].n][1] === 'm') {
        v = dv * WORDNUM[T[end].n][0];
        end++;
        // "2 mil e 500"
        if (!T[end - 1].brk && end + 1 < T.length && T[end].n === 'e') {
          var rest = readNumber(T, end + 1);
          if (rest && rest.v < 1000 && !(rest.end < T.length && CENTAVOS[T[rest.end].n])) {
            v += rest.v; end = rest.end;
          }
        }
      }
      return { v: v, start: i, end: end, words: false, soUm: false };
    }
    if (!WORDNUM[t]) return null;
    var total = 0, cur = 0, any = false, j = i, last = i, usedMil = false, count = 0;
    while (j < T.length) {
      var k = j;
      var tt = T[k].n;
      var hadE = false;
      if (any && tt === 'e') {
        if (T[k].brk) break;
        hadE = true; k = j + 1;
        if (k >= T.length) break;
        tt = T[k].n;
      }
      var w = WORDNUM[tt];
      if (!w) break;
      if (w[1] === 'm') {
        if (hadE) break;
        if (w[0] === 1000) {
          if (usedMil) break;
          total += (cur || 1) * 1000; cur = 0; usedMil = true;
        } else {
          if (!any) break;
          total = (total + cur) * 1000000; cur = 0;
        }
      } else {
        if (!canAdd(cur, w[1])) break;
        if (any && cur === 0 && total === 0) break;
        cur += w[0];
      }
      any = true; count++;
      last = k + 1; j = k + 1;
      if (T[k].brk) break;
    }
    if (!any) return null;
    var val = total + cur;
    return { v: val, start: i, end: last, words: true, soUm: count === 1 && (t === 'um' || t === 'uma') };
  }

  /** Lê um valor em dinheiro: "R$ 10,50", "10 reais e 50 centavos", "dez e cinquenta"... */
  function readMoney(T, i) {
    var start = i;
    var prefix = false;
    if (T[i].n === 'r$') { prefix = true; i++; if (i >= T.length) return null; }
    var num = readNumber(T, i);
    if (!num) return null;
    var end = num.end;
    var cents = Math.round(num.v * 100);
    var moeda = prefix;
    var prevBrk = T[end - 1].brk;
    if (!prevBrk && end < T.length && MOEDA[T[end].n]) { moeda = true; end++; prevBrk = T[end - 1].brk; }
    else if (!prevBrk && end + 1 < T.length && T[end].n === 'de' && MOEDA[T[end + 1].n]) { moeda = true; end += 2; prevBrk = T[end - 1].brk; }
    else if (!prevBrk && end < T.length && CENTAVOS[T[end].n] && num.v < 100) {
      // "cinquenta centavos"
      return { v: Math.round(num.v), start: start, end: end + 1, moeda: true, words: num.words, soUm: false };
    }
    // centavos: "10 reais e 50 (centavos)", "dez e cinquenta"
    if (!prevBrk && end + 1 < T.length && T[end].n === 'e' && Math.floor(num.v) === num.v) {
      var b = readNumber(T, end + 1);
      if (b && b.v > 0 && b.v < 100 && Math.floor(b.v) === b.v) {
        var after = b.end;
        var nextN = after < T.length ? T[after].n : null;
        var merge = false;
        var fimFrase = !nextN || T[after - 1].brk;
        if (nextN && CENTAVOS[nextN]) { merge = true; after++; }
        else if (b.soUm) merge = false;
        else if (moeda) {
          // "10 reais e 50" só junta se for o fim da frase ou vier forma de pagamento/data
          merge = fimFrase || (nextN && ['hoje', 'ontem', 'anteontem'].indexOf(nextN) >= 0) ||
            (nextN && ['no', 'na', 'em', 'pelo', 'pela', 'via', 'com'].indexOf(nextN) >= 0 && after + 1 < T.length && PAGAMENTO_INICIO[T[after + 1].n]) ||
            (nextN && PAGAMENTO_INICIO[nextN]);
        }
        else if (nextN && MOEDA[nextN]) { merge = true; after++; moeda = true; }
        else merge = fimFrase || !!PREP_DEPOIS[nextN] || !!STOP[nextN];
        if (merge) { cents += b.v; end = after; }
      }
    }
    return { v: cents, start: start, end: end, moeda: moeda, words: num.words, soUm: num.soUm };
  }

  // ------------------------------------------------------------------
  // Tokenização
  // ------------------------------------------------------------------
  function tokenize(text) {
    var s = String(text || '')
      .replace(/R\$\s*/gi, ' R$ ')
      .replace(/(\d)\s*%/g, '$1 %')
      .replace(/(\d)(reais|real|mil|k)\b/gi, '$1 $2')
      .replace(/[“”"()]/g, ' ');
    var raw = s.split(/\s+/).filter(Boolean);
    var T = [];
    for (var i = 0; i < raw.length; i++) {
      var r = raw[i];
      var brk = /[.,;:!?…]+$/.test(r) && !/^\d+[.,]\d+$/.test(r);
      var clean = r === 'R$' || r === 'r$' ? 'R$' : r.replace(/^[^\p{L}\p{N}%]+/u, '').replace(/[^\p{L}\p{N}%]+$/u, '');
      if (!clean) { if (brk && T.length) T[T.length - 1].brk = true; continue; }
      if (/^\d+k$/i.test(clean)) { T.push({ o: clean.slice(0, -1), n: clean.slice(0, -1), brk: false }); T.push({ o: 'mil', n: 'mil', brk: brk }); continue; }
      T.push({ o: clean, n: norm(clean), brk: brk });
    }
    return T;
  }

  // ------------------------------------------------------------------
  // Frases-chave
  // ------------------------------------------------------------------
  var VERBO_ENTRADA = ['recebi', 'recebo', 'recebemos', 'ganhei', 'ganho', 'ganhamos', 'entrou', 'entraram', 'entrada',
    'caiu', 'cairam', 'vendi', 'vendemos', 'depositaram', 'me pagou', 'me pagaram', 'me deu', 'me deram',
    'me mandou', 'me mandaram', 'me transferiu', 'me transferiram', 'me devolveu', 'me devolveram', 'me passou',
    'rendeu', 'renderam', 'faturei', 'lucrei', 'pingou', 'recebimento', 'recebido'];
  var VERBO_SAIDA = ['comprei', 'compramos', 'compra', 'comprar', 'gastei', 'gastamos', 'gasto', 'gastar', 'paguei', 'pagamos',
    'torrei', 'comi', 'almocei', 'jantei', 'lanchei', 'abasteci', 'dei', 'doei', 'emprestei', 'perdi', 'assinei',
    'mandei', 'transferi', 'fiz um pix', 'fiz pix', 'saiu', 'sairam', 'debitou', 'despesa', 'saida', 'tomei', 'bebi', 'peguei'];
  var VERBO_SALDO = ['tenho', 'to com', 'tou com', 'estou com', 'ta com', 'tem', 'fiquei com', 'sobrou', 'sobraram', 'ficou',
    'saldo', 'restam', 'resta', 'possuo', 'tenho agora', 'agora tenho', 'esta com', 'esta', 'ta', 'deu', 'veio', 'e de'];
  var VERBO_PERGUNTA = ['quanto', 'quantos', 'qual', 'quais', 'resumo', 'mostra', 'mostre', 'extrato', 'como estou', 'como to', 'como ta'];
  var COMANDO = toSet('anota anote anotar registra registre registrar coloca coloque colocar marca marque marcar bota bote botar adiciona adicione adicionar lanca lance lancar salva salve inclui inclua acabei favor obrigado obrigada valeu');

  var CONTA_FRASES = [
    // [frase, conta]  (conta 'cartao_generico' = depende da configuração)
    ['cartao de credito', 'cartao'], ['no credito', 'cartao'], ['credito', 'cartao'], ['parcelado', 'cartao'], ['parcelei', 'cartao'], ['fatura', 'cartao'],
    ['cartao de debito', 'banco'], ['no debito', 'banco'], ['debito', 'banco'], ['pix', 'banco'], ['no banco', 'banco'], ['do banco', 'banco'],
    ['na conta', 'banco'], ['da conta', 'banco'], ['pra conta', 'banco'], ['conta corrente', 'banco'], ['transferencia', 'banco'], ['ted', 'banco'],
    ['nubank', 'banco'], ['itau', 'banco'], ['bradesco', 'banco'], ['santander', 'banco'], ['banco do brasil', 'banco'], ['c6', 'banco'],
    ['picpay', 'banco'], ['mercado pago', 'banco'], ['pagbank', 'banco'], ['inter', 'banco'], ['caixa economica', 'banco'], ['poupanca', 'banco'],
    ['carteira', 'carteira'], ['em dinheiro', 'carteira'], ['no dinheiro', 'carteira'], ['dinheiro vivo', 'carteira'], ['em especie', 'carteira'],
    ['bolso', 'carteira'], ['cash', 'carteira'], ['dinheiro', 'carteira'],
    ['no cartao', 'cartao_generico'], ['cartao', 'cartao_generico'], ['banco', 'banco']
  ];
  var PAGAMENTO_INICIO = toSet('pix credito debito cartao dinheiro carteira banco conta especie');

  var MESES = { janeiro: 1, fevereiro: 2, marco: 3, abril: 4, maio: 5, junho: 6, julho: 7, agosto: 8, setembro: 9, outubro: 10, novembro: 11, dezembro: 12 };
  var SEMANA = { domingo: 0, segunda: 1, terca: 2, quarta: 3, quinta: 4, sexta: 5, sabado: 6 };

  function findPhrase(T, phrase, from, to) {
    var parts = phrase.split(' ');
    from = from || 0; to = to == null ? T.length : to;
    for (var i = from; i + parts.length <= to; i++) {
      var ok = true;
      for (var j = 0; j < parts.length; j++) if (T[i + j].n !== parts[j]) { ok = false; break; }
      if (ok) return i;
    }
    return -1;
  }

  function hasAny(T, list) {
    for (var i = 0; i < list.length; i++) if (findPhrase(T, list[i]) >= 0) return list[i];
    return null;
  }

  function markPhrase(T, phrase, used, from, to) {
    var p = findPhrase(T, phrase, from, to);
    if (p < 0) return -1;
    var n = phrase.split(' ').length;
    for (var k = 0; k < n; k++) used[p + k] = true;
    return p;
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function isoDate(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }

  // ------------------------------------------------------------------
  // Detecção de partes
  // ------------------------------------------------------------------
  function detectarData(T, used, hoje) {
    var d = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    var achou = false;
    var p;
    if ((p = findPhrase(T, 'antes de ontem')) >= 0) { used[p] = used[p + 1] = used[p + 2] = true; d.setDate(d.getDate() - 2); achou = true; }
    else if ((p = findPhrase(T, 'anteontem')) >= 0) { used[p] = true; d.setDate(d.getDate() - 2); achou = true; }
    else if ((p = findPhrase(T, 'ontem')) >= 0) { used[p] = true; d.setDate(d.getDate() - 1); achou = true; }
    else if ((p = findPhrase(T, 'semana passada')) >= 0) { used[p] = used[p + 1] = true; d.setDate(d.getDate() - 7); achou = true; }
    if (!achou) {
      for (var i = 0; i < T.length; i++) {
        var dia = null, mes = null, endIx = i;
        if (T[i].n === 'dia' && i + 1 < T.length) {
          var n = T[i + 1].n === 'primeiro' ? { v: 1, end: i + 2 } : readNumber(T, i + 1);
          if (n && n.v >= 1 && n.v <= 31 && Math.floor(n.v) === n.v) { dia = n.v; endIx = n.end; }
        } else {
          var n2 = readNumber(T, i);
          if (n2 && !n2.words && n2.v >= 1 && n2.v <= 31 && n2.end + 1 < T.length && T[n2.end].n === 'de' && MESES[T[n2.end + 1].n]) { dia = n2.v; endIx = n2.end; }
        }
        if (dia) {
          if (endIx + 1 < T.length && T[endIx].n === 'de' && MESES[T[endIx + 1].n]) { mes = MESES[T[endIx + 1].n]; endIx += 2; }
          for (var k = i; k < endIx; k++) used[k] = true;
          if (i > 0 && (T[i - 1].n === 'no' || T[i - 1].n === 'em')) used[i - 1] = true;
          var cand = new Date(hoje.getFullYear(), mes ? mes - 1 : hoje.getMonth(), dia);
          if (cand > hoje) { if (mes) cand.setFullYear(cand.getFullYear() - 1); else cand.setMonth(cand.getMonth() - 1); }
          d = cand; achou = true;
          break;
        }
        var ws = SEMANA[T[i].n];
        if (ws != null && (i + 1 >= T.length || T[i + 1].n === 'passada' || T[i + 1].n === 'feira' || i === 0 || ['na', 'no', 'semana', 'dessa', 'desta', 'ultima'].indexOf(T[i - 1].n) >= 0)) {
          used[i] = true;
          if (i + 1 < T.length && (T[i + 1].n === 'feira' || T[i + 1].n === 'passada')) used[i + 1] = true;
          if (i + 2 < T.length && T[i + 1].n === 'feira' && T[i + 2].n === 'passada') used[i + 2] = true;
          if (i > 0 && ['na', 'no'].indexOf(T[i - 1].n) >= 0) used[i - 1] = true;
          var diff = (hoje.getDay() - ws + 7) % 7;
          d.setDate(d.getDate() - diff);
          achou = true;
          break;
        }
      }
    }
    if ((p = findPhrase(T, 'hoje')) >= 0) used[p] = true;
    return { data: isoDate(d), explicita: achou };
  }

  function detectarConta(T, used, cfg) {
    for (var i = 0; i < CONTA_FRASES.length; i++) {
      var fr = CONTA_FRASES[i][0];
      var p = findPhrase(T, fr);
      if (p < 0) continue;
      // "conta" de "conta de luz" não é conta bancária
      var conta = CONTA_FRASES[i][1];
      var n = fr.split(' ').length;
      for (var k = 0; k < n; k++) used[p + k] = true;
      // remove a preposição antes ("no pix", "pelo nubank", "via pix", "com cartão")
      if (p > 0 && ['no', 'na', 'em', 'pelo', 'pela', 'via', 'com', 'do', 'da', 'de', 'pro', 'pra', 'o', 'a'].indexOf(T[p - 1].n) >= 0) {
        used[p - 1] = true;
        if (p > 1 && ['no', 'na', 'em', 'pelo', 'pela', 'com', 'via'].indexOf(T[p - 2].n) >= 0 && ['o', 'a'].indexOf(T[p - 1].n) >= 0) used[p - 2] = true;
      }
      // "cartão do nubank", "cartão de crédito do inter"
      if (conta === 'cartao_generico') {
        var resto = T.slice(p + n).map(function (t) { return t.n; }).join(' ');
        if (/\bdebito\b/.test(resto)) conta = 'banco';
        else if (/\bcredito\b/.test(resto)) conta = 'cartao';
        else conta = (cfg && cfg.cartao === 'debito') ? 'banco' : 'cartao';
      }
      // marca nomes de banco que vêm depois do cartão ("no cartão do nubank")
      for (var j = 0; j < CONTA_FRASES.length; j++) {
        var q = findPhrase(T, CONTA_FRASES[j][0]);
        if (q >= 0 && q > p && q <= p + n + 2 && (CONTA_FRASES[j][1] === 'banco' || CONTA_FRASES[j][1] === 'cartao')) {
          var m = CONTA_FRASES[j][0].split(' ').length;
          for (var z = 0; z < m; z++) used[q + z] = true;
          if (q > 0 && ['do', 'da', 'de', 'no', 'na'].indexOf(T[q - 1].n) >= 0) used[q - 1] = true;
        }
      }
      return conta;
    }
    return null;
  }

  function candidatosValor(T, used) {
    var cands = [];
    var i = 0;
    while (i < T.length) {
      if (used[i]) { i++; continue; }
      var m = readMoney(T, i);
      if (!m || m.v <= 0) { i++; continue; }
      var prev = m.start > 0 ? T[m.start - 1].n : null;
      var prev2 = m.start > 1 ? T[m.start - 2].n : null;
      var next = m.end < T.length ? T[m.end].n : null;
      var next2 = m.end + 1 < T.length ? T[m.end + 1].n : null;
      if (m.soUm && !m.moeda) { i++; continue; }
      if (prev === 'dia' || (next === 'de' && next2 && MESES[next2])) { i = m.end; continue; }
      if (next === '%' || next === 'porcento' || (next === 'por' && next2 === 'cento')) { i = m.end; continue; }
      var score = m.words ? 0 : 1;
      if (m.moeda) score += 3;
      if (prev && PRECO_ANTES[prev]) score += 2;
      else if (prev2 && PRECO_ANTES[prev2] && prev && ['de', 'uns', 'umas', 'tipo', 'quase', 'uns', 'mais', 'menos', 'apenas', 'so', 'exatamente', 'r$'].indexOf(prev) >= 0) score += 2;
      if (prev && ['no', 'na', 'do', 'da'].indexOf(prev) >= 0 && !m.moeda) score -= 2;
      if (next && UNIDADES[next] && !m.moeda) score -= 3;
      else if (next && PREP_DEPOIS[next] && next2 && !WORDNUM[next2] && digitValue(next2) === null) score += 1;
      else if (next && !m.moeda && next !== 'e' && !T[m.end - 1].brk && !STOP[next] && !PAGAMENTO_INICIO[next]) score -= 2;
      cands.push({ v: m.v, start: m.start, end: m.end, score: score, moeda: m.moeda });
      i = m.end;
    }
    return cands;
  }

  function isSeparator(T, i) {
    var n = T[i].n;
    return n === 'e' || n === 'mais' || n === 'tambem' || n === 'depois';
  }

  // ------------------------------------------------------------------
  // Interpretação principal
  // ------------------------------------------------------------------
  var WAKE = toSet('assessor assessora acessor acessora assesor acesor assessoria sucessor assistente');
  var SAUDACAO = toSet('ei oi ola fala hey alo opa');

  function removerChamado(T) {
    // "meu assessor", "ei assessora", "oi meu assessor," no começo (ou em qualquer lugar)
    var out = [];
    for (var i = 0; i < T.length; i++) {
      if (WAKE[T[i].n]) {
        // remove "meu/minha" e saudações imediatamente antes
        while (out.length && (out[out.length - 1].n === 'meu' || out[out.length - 1].n === 'minha' || (SAUDACAO[out[out.length - 1].n] && out.length <= 3))) out.pop();
        if (out.length) out[out.length - 1].brk = true;
        continue;
      }
      out.push(T[i]);
    }
    // saudações soltas no começo ("oi", "bom dia", "e aí")
    var mudou = true;
    while (mudou && out.length > 1) {
      mudou = false;
      if (SAUDACAO[out[0].n]) { out.shift(); mudou = true; continue; }
      if (out.length > 2 && ((out[0].n === 'bom' && out[1].n === 'dia') || (out[0].n === 'boa' && (out[1].n === 'tarde' || out[1].n === 'noite')) || (out[0].n === 'e' && out[1].n === 'ai'))) { out.splice(0, 2); mudou = true; }
    }
    return out;
  }

  function montarDescricao(T, used) {
    var rest = [];
    for (var i = 0; i < T.length; i++) {
      if (used[i]) continue;
      if (COMANDO[T[i].n]) continue;
      if (MOEDA[T[i].n] || CENTAVOS[T[i].n] || T[i].n === 'r$') continue;
      rest.push(T[i]);
    }
    while (rest.length && STOP[rest[0].n]) rest.shift();
    while (rest.length && STOP[rest[rest.length - 1].n]) rest.pop();
    // "de" sobrando no começo de expressões como "de uber"
    var toks = rest.map(function (t) { return t.n; });
    var texto = rest.map(function (t) { return t.o; }).join(' ');
    if (texto.length > 60) texto = texto.slice(0, 60).replace(/\s+\S*$/, '') + '…';
    if (texto && !/^\p{Ll}\p{Lu}/u.test(texto)) texto = texto.charAt(0).toUpperCase() + texto.slice(1);
    return { texto: texto, toks: toks };
  }

  function marcarVerbos(T, used, listas) {
    listas.forEach(function (lista) {
      lista.forEach(function (v) {
        var p = -1, from = 0;
        while ((p = findPhrase(T, v, from)) >= 0) {
          var n = v.split(' ').length;
          for (var k = 0; k < n; k++) used[p + k] = true;
          from = p + n;
        }
      });
    });
  }

  function interpretarSegmento(T, ctx, herdado) {
    var used = {};
    var hoje = ctx.hoje;
    var data = detectarData(T, used, hoje);
    var conta = detectarConta(T, used, ctx.config);
    var cands = candidatosValor(T, used);
    var best = null;
    cands.forEach(function (c) { if (!best || c.score > best.score || (c.score === best.score && c.moeda && !best.moeda)) best = c; });
    if (best && best.score < 1) best = null;

    var tipo = null;
    if (hasAny(T, VERBO_ENTRADA)) tipo = 'entrada';
    if (hasAny(T, VERBO_SAIDA)) {
      // "me pagou" já é entrada; "paguei" é saída
      var e = hasAny(T, VERBO_ENTRADA);
      var s = hasAny(T, VERBO_SAIDA);
      if (!e) tipo = 'saida';
      else tipo = findPhrase(T, s) < findPhrase(T, e) ? 'saida' : 'entrada';
    }
    if (!tipo && herdado && herdado.tipo) tipo = herdado.tipo;

    if (best) for (var k = best.start; k < best.end; k++) used[k] = true;
    marcarVerbos(T, used, [VERBO_ENTRADA, VERBO_SAIDA]);
    var desc = montarDescricao(T, used);
    var allToks = T.map(function (t) { return t.n; });
    if (!tipo) tipo = 'saida';
    if (!conta) conta = (herdado && herdado.conta) || (ctx.config && ctx.config.contaPadrao) || 'carteira';
    if (!data.explicita && herdado && herdado.data) data.data = herdado.data;
    return {
      tipo: tipo,
      valor: best ? best.v : null,
      desc: desc.texto,
      cat: categorizar(tipo, desc.toks, allToks, ctx.aprendido),
      conta: conta,
      data: data.data,
      descToks: desc.toks
    };
  }

  function interpretar(texto, ctx) {
    ctx = ctx || {};
    ctx.hoje = ctx.hoje || new Date();
    ctx.config = ctx.config || {};
    var original = String(texto || '').trim();
    var T = removerChamado(tokenize(original));
    if (!T.length) return { acao: 'nada', texto: original };
    var frase = T.map(function (t) { return t.n; }).join(' ');

    // ---------- desfazer ----------
    if (/^(desfaz|desfazer|desfaca|apaga|apague|cancela|cancele|exclui|exclua|remove|remova)\b.*\b(ultimo|ultima|isso|anterior)\b/.test(frase) || /^(desfaz|desfazer|desfaca)$/.test(frase)) {
      return { acao: 'desfazer', texto: original };
    }

    // ---------- "tenho que pagar" ----------
    if (/\b(tenho|tem|vou ter) (que|de) pagar\b|\bvou pagar\b|\bpreciso pagar\b/.test(frase)) {
      return { acao: 'aviso', texto: original, msg: 'Quando você pagar, me fala "paguei ..." que eu anoto.' };
    }

    var usedTmp = {};
    detectarData(T, usedTmp, ctx.hoje);
    var cands = candidatosValor(T, usedTmp);
    var fortes = cands.filter(function (c) { return c.score >= 1; });

    // ---------- perguntas ----------
    var pergunta = hasAny(T, VERBO_PERGUNTA);
    if (pergunta && !fortes.length || (pergunta && /^(quanto|qual|quais|quantos)\b/.test(frase))) {
      return interpretarPergunta(T, frase, original, ctx);
    }

    if (!fortes.length) {
      if (/\b(ajuda|socorro|o que (eu )?(posso|consigo) (falar|dizer)|como (funciona|usa))\b/.test(frase)) return { acao: 'ajuda', texto: original };
      return { acao: 'naoentendi', texto: original, motivo: 'valor' };
    }

    // ---------- transferências ----------
    var transf = null;
    if (/\b(saquei|saque|tirei)\b/.test(frase) && !/\btirei (uma|um)\b/.test(frase)) transf = { de: 'banco', para: 'carteira', desc: 'Saque' };
    else if (/\b(depositei|guardei)\b/.test(frase)) transf = { de: 'carteira', para: 'banco', desc: 'Depósito' };
    else if (/\b(paguei|pagar|pagamento|quitei)\b.*\b(fatura|cartao)\b/.test(frase) && !/\b(no|pelo|com o|com) cartao\b/.test(frase)) {
      transf = { de: /\b(em dinheiro|dinheiro)\b/.test(frase) ? 'carteira' : 'banco', para: 'cartao', desc: 'Pagamento da fatura' };
    }
    if (transf) {
      var bestT = fortes.reduce(function (a, b) { return b.score > a.score ? b : a; });
      var usedD = {};
      var dt = detectarData(T, usedD, ctx.hoje);
      return { acao: 'transferencia', texto: original, de: transf.de, para: transf.para, valor: bestT.v, desc: transf.desc, data: dt.data };
    }

    // ---------- definir saldo ----------
    var temSaldo = hasAny(T, VERBO_SALDO);
    var temMov = hasAny(T, VERBO_ENTRADA) || hasAny(T, VERBO_SAIDA);
    var mencionaConta = /\b(carteira|banco|conta|nubank|itau|bradesco|santander|inter|c6|picpay|poupanca|bolso|fatura|cartao|dinheiro)\b/.test(frase);
    if (temSaldo && !temMov && (mencionaConta || /^(eu )?(tenho|to com|tou com|estou com|fiquei com|sobrou|sobraram|agora tenho|tenho agora)\b/.test(frase))) {
      // pode ser mais de um: "tenho 200 na carteira e 1000 no banco"
      var partes = [];
      if (fortes.length >= 2) {
        var ini2 = 0;
        for (var q = 0; q < fortes.length - 1; q++) {
          for (var w = fortes[q].end; w < fortes[q + 1].start; w++) {
            if (isSeparator(T, w) || T[w].brk) { partes.push(T.slice(ini2, T[w].brk && !isSeparator(T, w) ? w + 1 : w)); ini2 = w + 1; break; }
          }
        }
        partes.push(T.slice(ini2));
      } else partes.push(T);
      var saldos = [];
      partes.forEach(function (P) {
        var u = {};
        detectarData(P, u, ctx.hoje);
        var cs = candidatosValor(P, u).filter(function (x) { return x.score >= 1; });
        if (!cs.length) return;
        var cc = detectarConta(P, {}, ctx.config) || (saldos.length ? null : 'carteira');
        if (!cc) return;
        var pn = P.map(function (t) { return t.n; }).join(' ');
        var bs = cs.reduce(function (a, b) { return b.score > a.score ? b : a; });
        var alvo = bs.v;
        if (cc === 'cartao' || /\b(fatura|devo)\b/.test(pn)) { cc = 'cartao'; alvo = -Math.abs(alvo); }
        saldos.push({ conta: cc, valor: alvo });
      });
      if (saldos.length === 1) return { acao: 'saldo', texto: original, conta: saldos[0].conta, valor: saldos[0].valor, saldos: saldos };
      if (saldos.length > 1) return { acao: 'saldo', texto: original, conta: saldos[0].conta, valor: saldos[0].valor, saldos: saldos };
    }

    // ---------- lançamentos (pode ter mais de um) ----------
    var segmentos = [];
    if (fortes.length >= 2) {
      var ini = 0;
      for (var i = 0; i < fortes.length - 1; i++) {
        var a = fortes[i], b = fortes[i + 1];
        var corte = -1;
        for (var j = a.end; j < b.start; j++) {
          if (isSeparator(T, j)) { corte = j; break; }
          if (T[j].brk && j + 1 <= b.start) { corte = j + 0.5; break; }
        }
        if (corte < 0 && T[a.end - 1] && T[a.end - 1].brk) corte = a.end - 0.5;
        if (corte >= 0) {
          var fim = Math.ceil(corte) === corte ? corte : Math.ceil(corte);
          var proximo = Math.ceil(corte) === corte ? corte + 1 : Math.ceil(corte);
          segmentos.push(T.slice(ini, fim));
          ini = proximo;
        }
      }
      segmentos.push(T.slice(ini));
    } else {
      segmentos.push(T);
    }

    var itens = [];
    var herdado = null;
    for (var s = 0; s < segmentos.length; s++) {
      if (!segmentos[s].length) continue;
      var it = interpretarSegmento(segmentos[s], ctx, herdado);
      if (it.valor == null) continue;
      itens.push(it);
      herdado = { tipo: it.tipo, data: it.data, conta: null };
    }
    if (!itens.length) return { acao: 'naoentendi', texto: original, motivo: 'valor' };
    return { acao: 'lancamentos', texto: original, itens: itens };
  }

  function interpretarPergunta(T, frase, original, ctx) {
    var periodo = 'mes';
    if (/\bhoje\b/.test(frase)) periodo = 'hoje';
    else if (/\bontem\b/.test(frase)) periodo = 'ontem';
    else if (/\bsemana\b/.test(frase)) periodo = 'semana';
    else if (/\bmes passado\b/.test(frase)) periodo = 'mespassado';
    var used = {};
    var conta = detectarConta(T, used, ctx.config);
    var cat = null;
    var lista = CATEGORIAS.saida.concat(CATEGORIAS.entrada);
    for (var i = 0; i < lista.length; i++) {
      var nomeN = norm(lista[i].nome);
      if (frase.indexOf(nomeN) >= 0 || (lista[i].id !== 'outros' && lista[i].id !== 'outros_in' && new RegExp('\\b' + lista[i].id + '\\b').test(frase))) { cat = lista[i].id; break; }
    }
    if (!cat) {
      var m = frase.match(/\b(com|de|no|na|em)\s+(.+)$/);
      if (m && /gast/.test(frase)) {
        var toks = m[2].split(' ').filter(function (t) { return !STOP[t]; });
        if (toks.length) {
          var c = categorizar('saida', toks, toks, ctx.aprendido);
          if (c !== 'outros') cat = c;
        }
      }
    }
    var tema;
    if (/\b(gast|gastei|gastou|gastamos|saiu|sairam|saidas|despesa)/.test(frase)) tema = 'gastos';
    else if (/\b(receb|ganhei|entrou|entraram|entradas|ganhos)/.test(frase)) tema = 'entradas';
    else if (/\b(fatura|devo|cartao)\b/.test(frase)) tema = 'fatura';
    else if (/\b(resumo|como estou|como to|como ta|balanco)\b/.test(frase)) tema = 'resumo';
    else if (/\b(tenho|saldo|sobrou|sobra|dinheiro|carteira|banco|conta)\b/.test(frase)) tema = 'saldo';
    else tema = 'resumo';
    return { acao: 'pergunta', texto: original, tema: tema, periodo: periodo, conta: conta, cat: cat };
  }

  // ------------------------------------------------------------------
  // Formatação
  // ------------------------------------------------------------------
  function brl(cents) {
    var neg = cents < 0;
    var v = Math.abs(cents) / 100;
    var s = v.toFixed(2).split('.');
    var int = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return (neg ? '-' : '') + 'R$ ' + int + ',' + s[1];
  }

  function falado(cents) {
    cents = Math.abs(cents);
    var r = Math.floor(cents / 100), c = cents % 100;
    var partes = [];
    if (r > 0) partes.push(r + (r === 1 ? ' real' : ' reais'));
    if (c > 0) partes.push(c + (c === 1 ? ' centavo' : ' centavos'));
    if (!partes.length) return 'zero reais';
    return partes.join(' e ');
  }

  /** Aprende com correções: guarda descrição e palavras -> categoria */
  function aprender(aprendido, tipo, descTexto, cat) {
    aprendido.desc = aprendido.desc || {};
    aprendido.tok = aprendido.tok || {};
    var toks = norm(descTexto).replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(function (t) { return t && !STOP[t]; });
    if (!toks.length) return;
    aprendido.desc[tipo + ':' + toks.join(' ')] = cat;
    toks.forEach(function (t) { if (t.length >= 3 && !/^\d+$/.test(t)) aprendido.tok[tipo + ':' + t] = cat; });
  }

  function descToks(texto) {
    return norm(texto).replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(function (t) { return t && !STOP[t]; });
  }

  var API = {
    interpretar: interpretar,
    categorizar: categorizar,
    descToks: descToks,
    aprender: aprender,
    CATEGORIAS: CATEGORIAS,
    catInfo: catInfo,
    norm: norm,
    brl: brl,
    falado: falado,
    isoDate: isoDate
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else root.Assessor = API;
})(typeof window !== 'undefined' ? window : this);
