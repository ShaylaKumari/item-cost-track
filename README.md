# Custeia: Your Business Costs

Custeia — Criação da primeira versão do produto

Crie a primeira versão funcional do Custeia, uma aplicação web para pequenos negócios controlarem custos de produtos, precificação, vendas e resultado financeiro.

1. Objetivo do produto

O Custeia deve ajudar o pequeno empreendedor a responder de forma simples:

Quanto custa produzir meu produto?

Por quanto devo vender?

Quanto estou ganhando?

Quais são minhas despesas?

Qual foi meu resultado em determinado período?

O sistema deve priorizar clareza, simplicidade e utilidade, evitando transformar o produto em um dashboard financeiro complexo.

2. Diretriz principal de UX/UI

A interface NÃO deve parecer uma aplicação gerada por IA.

Evite explicitamente:

dashboards genéricos de SaaS;

excesso de cards;

excesso de métricas na tela inicial;

gradientes decorativos;

glassmorphism;

sombras exageradas;

bordas arredondadas em absolutamente todos os elementos;

títulos enormes;

textos genéricos como "Bem-vindo de volta!";

excesso de ícones;

gráficos apenas para preencher espaço;

animações desnecessárias;

efeitos visuais chamativos;

aparência de template pronto;

layout excessivamente parecido com ferramentas de IA, CRMs ou plataformas SaaS genéricas.

Não utilize uma interface "bonita" apenas por adicionar elementos visuais.

A prioridade deve ser:

hierarquia visual → legibilidade → fluxo de tarefa → consistência → estética.

A interface deve parecer um produto desenvolvido por uma equipe de frontend preocupada com usabilidade, e não um template gerado automaticamente.

3. Princípios de frontend

Utilize boas práticas modernas de frontend:

componentes reutilizáveis;

separação clara entre componentes de UI, páginas e lógica;

tipagem forte;

estado local apenas quando necessário;

formulários com validação;

feedback claro para ações do usuário;

estados de loading, vazio e erro;

responsividade;

acessibilidade;

navegação consistente;

tratamento de erros;

confirmação para ações destrutivas;

evitar duplicação de código;

evitar componentes gigantes;

nomes de componentes, funções e variáveis claros.

A arquitetura deve permitir substituir facilmente os dados mockados por dados reais do Supabase posteriormente.

Não conectar ao Supabase nesta primeira etapa.

4. Stack

Utilize:

React

TypeScript

Vite

Tailwind CSS

Utilize componentes reutilizáveis e mantenha a estrutura preparada para integração futura com Supabase.

Crie uma camada de acesso a dados separada da interface.

Por exemplo, a interface não deve depender diretamente de arrays mockados espalhados pelos componentes.

Estruture de forma que posteriormente seja possível substituir:

mockData → Supabase

sem precisar reescrever as páginas.

5. Estrutura inicial de navegação

A aplicação deve ter uma navegação simples.

Se houver sidebar, ela deve ser discreta e funcional, sem ocupar espaço excessivo.

Itens principais:

Visão geral

Produtos

Insumos

Vendas

Despesas

Não criar páginas desnecessárias.

6. Visão geral

A página inicial deve responder rapidamente:

Como está o negócio?

Quanto vendi?

Quanto gastei?

Qual foi o resultado?

Não criar um dashboard cheio de cards.

Utilize poucas informações realmente relevantes.

Exemplo de informações:

Vendas no período

Despesas no período

Resultado

Margem

Abaixo dessas informações, pode existir uma visualização simples da evolução das vendas/resultados.

Se não houver informação suficiente para justificar um gráfico, não crie um gráfico.

A tela deve continuar útil mesmo com poucos dados.

7. Insumos

Criar uma página para gerenciamento dos insumos utilizados nas receitas.

Cada insumo deve possuir:

nome;

unidade de medida;

quantidade disponível;

custo;

observação opcional.

Exemplos:

Farinha de trigo — kg

Açúcar — kg

Chocolate — kg

Embalagem — unidade

Gás — unidade

Permitir:

cadastrar;

editar;

excluir;

pesquisar;

visualizar custo.

A tabela/listagem deve ser limpa e objetiva.

Evite transformar cada item em um card.

8. Produtos / Receitas

O conceito de produto deve estar relacionado a uma receita.

Cada produto deve possuir:

nome;

descrição opcional;

rendimento;

unidade de rendimento;

ingredientes utilizados;

quantidade de cada ingrediente;

custo total;

custo por unidade;

preço de venda;

margem de lucro.

O usuário deve conseguir montar uma receita selecionando os insumos cadastrados.

Exemplo:

Produto: Brownie

Rendimento: 20 unidades

Ingredientes:

500g de farinha

300g de chocolate

200g de açúcar

20 embalagens

O sistema deve calcular automaticamente:

custo total da receita

e

custo por unidade.

9. Precificação

Na tela do produto, permitir informar o preço de venda.

Calcular automaticamente:

custo unitário;

preço de venda;

lucro unitário;

margem percentual.

A apresentação deve ser extremamente clara.

Não criar uma calculadora visual exagerada.

O usuário precisa conseguir entender imediatamente:

Custo: R$ X

Preço: R$ Y

Lucro: R$ Z

Margem: X%

10. Vendas

Criar uma área para registrar vendas.

Cada venda deve possuir:

data;

produtos vendidos;

quantidade;

preço;

valor total.

O sistema deve calcular automaticamente o total da venda.

Criar listagem de vendas com:

data;

quantidade de itens;

valor;

ações.

Permitir visualizar os detalhes de uma venda.

11. Despesas

Criar uma área para registrar despesas do negócio.

Cada despesa deve possuir:

descrição;

categoria;

valor;

data;

observação opcional.

Exemplos:

gás;

energia;

transporte;

embalagem;

aluguel;

outros.

Não assumir que toda despesa é um ingrediente.

Despesas devem ser tratadas separadamente dos custos diretamente associados às receitas.

12. Resultado

O sistema deve conseguir calcular, em determinado período:

Receita de vendas

menos

Custos dos produtos vendidos

menos

Despesas

igual a

Resultado

A lógica deve ser preparada para futuramente utilizar os dados reais do Supabase.

13. Modelo de dados

Mesmo sem conectar ao Supabase agora, estruture os tipos/interfaces considerando estas entidades:

businesses

id

name

created_at

updated_at

ingredients

id

business_id

name

unit

quantity

cost

notes

created_at

updated_at

recipes

id

business_id

name

description

yield_quantity

yield_unit

selling_price

created_at

updated_at

recipe_ingredients

id

recipe_id

ingredient_id

quantity

expenses

id

business_id

description

category

amount

date

notes

created_at

updated_at

sales

id

business_id

sale_date

total_amount

created_at

sale_items

id

sale_id

recipe_id

quantity

unit_price

total_amount

A estrutura deve considerar relacionamento entre as entidades.

Não criar tabelas adicionais sem necessidade.

14. Preparação para Supabase

O projeto ainda NÃO possui um projeto Supabase conectado.

Portanto:

não inventar credenciais;

não criar integração falsa;

não depender de dados armazenados diretamente nos componentes;

utilizar dados mockados inicialmente;

criar interfaces/types equivalentes ao modelo de dados;

criar uma camada/repositório de dados;

deixar explícito no código onde futuramente será implementada a integração com Supabase.

Quando o Supabase for conectado posteriormente, quero conseguir substituir a implementação de mock por chamadas reais ao banco sem alterar a maior parte da UI.

15. Dados iniciais

Utilize dados mockados realistas para demonstrar o funcionamento.

Exemplo de negócio:

Uma pequena confeitaria.

Criar alguns insumos, produtos, vendas e despesas para que todas as telas possam ser visualizadas com dados.

Os dados devem parecer reais, mas deixar claro no código que são apenas mocks.

16. Estados da interface

Todas as páginas relevantes devem possuir:

loading state;

empty state;

error state;

success feedback;

confirmação antes de exclusões.

O empty state deve ser útil e contextual.

Não utilizar frases genéricas como:

"Comece sua jornada!"

Prefira mensagens objetivas, como:

"Você ainda não cadastrou nenhum insumo."

17. Design visual

Criar uma identidade visual própria para o Custeia, porém discreta.

Priorizar:

fundo neutro;

tipografia legível;

bom espaçamento;

contraste adequado;

poucos elementos decorativos;

componentes consistentes;

tabelas e formulários bem estruturados.

A interface deve transmitir:

organização + confiança + simplicidade.

Não quero uma aparência de fintech exagerada nem de dashboard corporativo.

18. Responsividade

A aplicação deve funcionar bem em:

desktop;

tablet;

mobile.

No mobile, tabelas podem utilizar uma abordagem adequada para telas pequenas, sem simplesmente quebrar o layout.

19. O que NÃO implementar agora

Não implementar:

autenticação real;

integração com Supabase;

pagamentos;

emissão fiscal;

estoque avançado;

múltiplos usuários/permissões;

notificações;

IA;

chatbot;

relatórios extremamente complexos;

funcionalidades não relacionadas ao objetivo principal.

O objetivo desta primeira versão é validar a experiência e o fluxo principal do produto.

20. Resultado esperado

Ao final, quero uma aplicação navegável e funcional utilizando dados mockados, com:

Visão geral → Insumos → Produtos/Receitas → Vendas → Despesas → Resultado

A aplicação deve parecer um produto real em desenvolvimento, com uma interface simples, madura e intencional.

Evite qualquer decisão visual que pareça ter sido adicionada apenas porque "é comum em interfaces de IA".

Antes de implementar elementos visuais adicionais, pergunte implicitamente:

"Isso melhora a compreensão ou a execução de uma tarefa?"

Se não melhorar, não adicione.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9721ca6f-ba7c-4d91-9804-f058ae05183d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
