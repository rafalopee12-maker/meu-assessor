const A = require('../app/src/main/assets/parser.js');
const hoje = new Date(2026, 10, 7, 13, 0); // sáb 07/11/2026
const ctx = () => ({ hoje, config: { contaPadrao: 'carteira', cartao: 'credito' }, aprendido: {} });

let fail = 0, pass = 0;
function check(frase, exp) {
  const r = A.interpretar(frase, ctx());
  const errs = [];
  for (const k of Object.keys(exp)) {
    if (k === 'itens') {
      const it = r.itens || [];
      if (it.length !== exp.itens.length) errs.push(`itens.length ${it.length} != ${exp.itens.length}`);
      exp.itens.forEach((e, i) => {
        for (const kk of Object.keys(e)) { if (e[kk] === undefined) continue;
          const got = it[i] && it[i][kk];
          if (got !== e[kk]) errs.push(`itens[${i}].${kk}: ${JSON.stringify(got)} != ${JSON.stringify(e[kk])}`);
        }
      });
    } else if (r[k] !== exp[k]) errs.push(`${k}: ${JSON.stringify(r[k])} != ${JSON.stringify(exp[k])}`);
  }
  if (errs.length) { fail++; console.log('✗', frase, '\n   ', errs.join('\n    '), '\n    got:', JSON.stringify(r.itens ? r.itens.map(({descToks, ...x}) => x) : r)); }
  else pass++;
}
const out = (valor, desc, cat, extra = {}) => ({ tipo: 'saida', valor, desc, cat, ...extra });
const inn = (valor, desc, cat, extra = {}) => ({ tipo: 'entrada', valor, desc, cat, ...extra });
const L = (...itens) => ({ acao: 'lancamentos', itens });

check('meu assessor, eu comprei um chocolate por 10 reais', L(out(1000, 'Chocolate', 'lazer', { conta: 'carteira', data: '2026-11-07' })));
check('Meu assessor eu comprei um chocolate por R$ 10', L(out(1000, 'Chocolate', 'lazer')));
check('comprei um chocolate por R$10,50', L(out(1050, 'Chocolate', 'lazer')));
check('gastei 50 reais no mercado', L(out(5000, 'Mercado', 'alimentacao')));
check('gastei cinquenta reais no mercado', L(out(5000, 'Mercado', 'alimentacao')));
check('paguei a conta de luz 120 reais no pix', L(out(12000, 'Conta de luz', 'casa', { conta: 'banco' })));
check('paguei 35 de uber', L(out(3500, 'Uber', 'transporte')));
check('uber 15 reais', L(out(1500, 'Uber', 'transporte')));
check('almocei 25 reais', L(out(2500, undefined, 'alimentacao')));
check('recebi meu salário de 3000 reais', L(inn(300000, 'Salário', 'salario')));
check('recebi 3.500 de salário', L(inn(350000, 'Salário', 'salario')));
check('caiu o salário 2 mil e 500 na conta', L(inn(250000, undefined, 'salario', { conta: 'banco' })));
check('ganhei 50 reais da minha mãe', L(inn(5000, 'Mãe', 'presente')));
check('vendi um bolo por 30 reais', L(inn(3000, 'Bolo', 'extra')));
check('comprei dois sorvetes por 12 reais', L(out(1200, 'Dois sorvetes', 'lazer')));
check('comprei 2 chocolates por 10 reais', L(out(1000, '2 chocolates', 'lazer')));
check('comprei um pão de queijo por quatro e cinquenta', L(out(450, 'Pão de queijo', 'alimentacao')));
check('gastei dez e cinquenta no lanche', L(out(1050, 'Lanche', 'alimentacao')));
check('gastei 10 reais e 50 centavos de pão', L(out(1050, 'Pão', 'alimentacao')));
check('comprei uma bala por cinquenta centavos', L(out(50, 'Bala', 'lazer')));
check('comprei um tênis de 300 reais no cartão', L(out(30000, 'Tênis', 'compras', { conta: 'cartao' })));
check('comprei um tênis de 300 reais no crédito parcelado', L(out(30000, 'Tênis', 'compras', { conta: 'cartao' })));
check('paguei 80 reais de gasolina no débito', L(out(8000, 'Gasolina', 'transporte', { conta: 'banco' })));
check('comprei remédio na farmácia 45,90', L(out(4590, 'Remédio na farmácia', 'saude')));
check('ontem eu gastei 30 reais com cerveja', L(out(3000, 'Cerveja', 'lazer', { data: '2026-11-06' })));
check('dia 3 paguei 1.200 de aluguel', L(out(120000, 'Aluguel', 'casa', { data: '2026-11-03' })));
check('dia 15 paguei 100 reais de internet', L(out(10000, 'Internet', 'casa', { data: '2026-10-15' })));
check('gastei 10 reais de chocolate e 20 de pizza', L(out(1000, 'Chocolate', 'lazer'), out(2000, 'Pizza', 'alimentacao')));
check('comprei um chocolate por 10 reais e um refri por 5', L(out(1000, 'Chocolate', 'lazer'), out(500, 'Refri', 'lazer')));
check('paguei 30 de uber e 20 de lanche', L(out(3000, 'Uber', 'transporte'), out(2000, 'Lanche', 'alimentacao')));
check('netflix 55,90', L(out(5590, 'Netflix', 'assinaturas')));
check('ração do cachorro 89 reais', L(out(8900, 'Ração do cachorro', 'pets')));
check('cortei o cabelo 40 reais', L(out(4000, undefined, 'cuidados')));
check('paguei 15 reais no 99', L(out(1500, '99', 'transporte')));
check('comprei um livro de 60 reais', L(out(6000, 'Livro', 'educacao')));
check('entrou 200 reais de freela no pix', L(inn(20000, 'Freela', 'extra', { conta: 'banco' })));
check('o joão me pagou 50 reais', L(inn(5000, 'João', 'reembolso')));
check('meu assessor, gastei mil reais', L(out(100000)));
check('gastei mil e duzentos reais no mercado', L(out(120000, 'Mercado', 'alimentacao')));
check('gastei R$ 1.234,56 de compras', L(out(123456)));
check('gastei um real de bala', L(out(100, 'Bala', 'lazer')));
check('gastei vinte e cinco reais com açaí', L(out(2500, 'Açaí', 'lazer')));
check('comprei um sorvete de 8 reais em dinheiro', L(out(800, 'Sorvete', 'lazer', { conta: 'carteira' })));

// saldo
check('tenho 300 reais na carteira', { acao: 'saldo', conta: 'carteira', valor: 30000 });
check('meu assessor, eu tenho 150 reais', { acao: 'saldo', conta: 'carteira', valor: 15000 });
check('tô com 80 reais na carteira', { acao: 'saldo', conta: 'carteira', valor: 8000 });
check('tenho 2 mil no banco', { acao: 'saldo', conta: 'banco', valor: 200000 });
check('no nubank tenho 1500', { acao: 'saldo', conta: 'banco', valor: 150000 });
check('minha fatura do cartão tá 800 reais', { acao: 'saldo', conta: 'cartao', valor: -80000 });
check('na carteira tem 45 reais', { acao: 'saldo', conta: 'carteira', valor: 4500 });

// transferências
check('saquei 100 reais', { acao: 'transferencia', de: 'banco', para: 'carteira', valor: 10000 });
check('depositei 50 reais no banco', { acao: 'transferencia', de: 'carteira', para: 'banco', valor: 5000 });
check('paguei a fatura do cartão 500 reais', { acao: 'transferencia', de: 'banco', para: 'cartao', valor: 50000 });

// perguntas
check('quanto eu gastei esse mês', { acao: 'pergunta', tema: 'gastos', periodo: 'mes' });
check('quanto gastei hoje', { acao: 'pergunta', tema: 'gastos', periodo: 'hoje' });
check('quanto eu gastei com lazer', { acao: 'pergunta', tema: 'gastos', cat: 'lazer' });
check('quanto gastei com uber', { acao: 'pergunta', tema: 'gastos', cat: 'transporte' });
check('quanto eu tenho na carteira', { acao: 'pergunta', tema: 'saldo', conta: 'carteira' });
check('qual meu saldo', { acao: 'pergunta', tema: 'saldo' });
check('quanto eu recebi esse mês', { acao: 'pergunta', tema: 'entradas' });
check('quanto tá a fatura', { acao: 'pergunta', tema: 'fatura' });

// outros
check('comprei dois chocolates', { acao: 'naoentendi' });
check('tenho que pagar 50 de luz', { acao: 'aviso' });
check('desfaz o último', { acao: 'desfazer' });


// frases como o reconhecimento de voz do Google costuma escrever
check('Meu assessor eu comprei um chocolate por R$ 10', L(out(1000, 'Chocolate', 'lazer')));
check('Eu gastei R$ 50 no mercado hoje', L(out(5000, 'Mercado', 'alimentacao')));
check('Recebi R$ 1.500 do salário', L(inn(150000, 'Salário', 'salario')));
check('Paguei R$ 120 de luz', L(out(12000, 'Luz', 'casa')));
check('gastei 5 conto de pão', L(out(500, 'Pão', 'alimentacao')));
check('coloca aí 30 reais de gasolina', L(out(3000, 'Gasolina', 'transporte')));
check('anota aí gastei 20 no lanche', L(out(2000, 'Lanche', 'alimentacao')));
check('Gastei 15,90 no iFood', L(out(1590, 'iFood', 'alimentacao')));
check('Comprei uma Coca de 6 reais', L(out(600, 'Coca', 'lazer')));
check('Mandei 50 reais pra minha mãe', L(out(5000, 'Mãe', 'outros')));
check('Gastei 200 reais', L(out(20000, '', 'outros')));
check('recebi 100', L(inn(10000)));
check('100 reais de lanche', L(out(10000, 'Lanche', 'alimentacao')));
check('bom dia meu assessor, gastei 12 reais de café', L(out(1200, 'Café', 'alimentacao')));
check('oi assessor gastei 7 reais de pão hoje cedo', L(out(700)));
check('Quanto eu tenho', { acao: 'pergunta', tema: 'saldo' });
check('me fala quanto gastei', { acao: 'pergunta', tema: 'gastos' });
check('a fatura veio 950', { acao: 'saldo', conta: 'cartao', valor: -95000 });
{
  const r = A.interpretar('tenho 200 reais na carteira e 1000 no banco', ctx());
  const ok = r.acao === 'saldo' && r.saldos && r.saldos.length === 2 && r.saldos[0].conta === 'carteira' && r.saldos[0].valor === 20000 && r.saldos[1].conta === 'banco' && r.saldos[1].valor === 100000;
  if (!ok) { fail++; console.log('✗ dois saldos', JSON.stringify(r)); } else pass++;
}

// aprendizado
{
  const c = ctx();
  A.aprender(c.aprendido, 'saida', 'Chocolate', 'alimentacao');
  const r = A.interpretar('comprei chocolate 5 reais', c);
  if (r.itens[0].cat !== 'alimentacao') { fail++; console.log('✗ aprendizado', r.itens[0].cat); } else pass++;
}

console.log(`\n${pass} ok, ${fail} falharam`);
process.exit(fail ? 1 : 0);
