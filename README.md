# 🎙️ Meu Assessor

App Android para anotar gastos e entradas de dinheiro **falando**.

> “Meu assessor, comprei um chocolate por 10 reais” → anota **R$ 10,00 em Lazer**, na carteira.

## Baixar

👉 **[Baixar MeuAssessor.apk](https://github.com/rafalopee12-maker/meu-assessor/releases/latest/download/MeuAssessor.apk)**

No celular: abra o arquivo baixado → se pedir, permita “instalar apps desta fonte” → **Instalar**.
Para atualizar, é só baixar de novo e instalar por cima: os dados continuam.

## O que dá pra falar

| Você fala | O app faz |
|---|---|
| “Comprei um chocolate por 10 reais” | Gasto de R$ 10 em Lazer |
| “Paguei 120 de luz no pix” | Gasto em Casa e contas, saindo do banco |
| “Comprei um tênis de 300 no crédito” | Vai para a fatura do cartão |
| “Recebi 1.500 de salário” | Entrada |
| “Ontem gastei 30 de uber e 20 de lanche” | Dois gastos, com a data de ontem |
| “Tenho 200 reais na carteira e 1.000 no banco” | Acerta os saldos |
| “Saquei 100 reais” / “Paguei a fatura, 500 reais” | Move dinheiro entre carteira, banco e cartão |
| “Quanto eu gastei esse mês?” / “Quanto gastei com lazer?” | Responde (e fala, se quiser) |
| “Desfaz o último” | Apaga o que acabou de anotar |

Se uma categoria vier errada, toque no lançamento e corrija: o app aprende para a próxima vez.

## Privacidade

O app **não tem permissão de internet**. Tudo fica salvo só no seu celular.
Em *Ajustes* dá para salvar um backup (arquivo `.json`) e exportar uma planilha (`.csv`).

## Como é feito

- `app/src/main/assets/` — a tela do app (HTML/JS) e o interpretador de frases (`parser.js`)
- `app/src/main/java/.../MainActivity.java` — liga o app ao microfone do Google, à voz e ao armazenamento
- `.github/workflows/build.yml` — a cada mudança, o GitHub compila e publica um APK novo em *Releases*
- `tests/test_parser.js` — testes com dezenas de frases (`node tests/test_parser.js`)
