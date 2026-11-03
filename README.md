# TaskFlow — Gerenciador de Tarefas Web

O **TaskFlow** é uma aplicação web para organizar tarefas pessoais, acompanhar o andamento das atividades e visualizar indicadores de produtividade por meio de um quadro Kanban. Desenvolvido como exercício prático utilizando **HTML, CSS e JavaScript puro**.

## Objetivo

Permitir criar, consultar, editar, excluir, pesquisar e organizar tarefas por status, sem banco de dados ou servidor. Os dados ficam armazenados no próprio navegador.

## Funcionalidades

- **Dashboard:** total de tarefas, a fazer, em andamento e concluídas.
- **Indicador de produtividade:** porcentagem de tarefas concluídas.
- **Cadastro:** título, descrição, prioridade (baixa, média ou alta), dificuldade **SP de 1 a 20** e prazo **opcional**.
- **Gerenciamento:** editar, excluir e alterar o status de cada tarefa.
- **Quadro Kanban:** colunas **A Fazer**, **Em Andamento** e **Concluídas**.
- **Arrastar e soltar (Drag and Drop):** mover os cartões entre colunas com mouse ou, no celular, pela alça do cartão.
- **Pesquisa e filtros:** busca pelo título, filtro por prioridade e por status, com opção de limpar os filtros.
- **Persistência local:** tarefas salvas com `localStorage`, mesmo após atualizar ou reabrir a página no mesmo navegador.
- **Modo claro/escuro:** botão de alternância de tema com preferência salva.
- **Responsividade:** layout adaptado para desktop e celular.
- **Avisos de prazo:** destaque visual para tarefas atrasadas quando há prazo informado.

## Tecnologias utilizadas

| Tecnologia | Finalidade |
| --- | --- |
| HTML5 | Estrutura da aplicação |
| CSS3 | Layout, aparência, temas e responsividade |
| JavaScript puro | Cadastro, eventos, Kanban, filtros e indicadores |
| localStorage | Armazenamento local de tarefas e tema |

**Ambiente sugerido no exercício:** Visual Studio Code com apoio do OpenCode.

O projeto **não utiliza frameworks, bibliotecas externas, APIs, backend, servidores ou banco de dados**.

## Como executar

1. Baixe o projeto em **Code → Download ZIP**, ou clone o repositório:

   ```bash
   git clone https://github.com/Luk41400/gerenciador-web.git
   ```

2. Abra a pasta `gerenciador-web` no computador ou no VS Code.
3. Abra o arquivo **`index.html`** diretamente no navegador.

Não é necessário instalar dependências ou iniciar um servidor.

## Como usar

1. No formulário, digite o **título** da tarefa, escolha sua **prioridade** e defina o **SP entre 1 e 20**. A descrição e o prazo podem ficar em branco.
2. Clique em **Adicionar tarefa**: ela aparecerá inicialmente em **A Fazer**.
3. Arraste o cartão para **Em Andamento** ou **Concluídas**, ou escolha o status pelo seletor no cartão.
4. Use os botões **Editar** e **Excluir** para gerenciar suas tarefas.
5. Use a pesquisa e os filtros para localizar tarefas rapidamente.
6. Alterne entre **modo claro e escuro** pelo botão no cabeçalho.

## Estrutura do projeto

```text
gerenciador-web/
├── index.html   # Estrutura HTML
├── style.css    # Estilos e layout responsivo
├── script.js    # Lógica JavaScript e armazenamento
└── README.md    # Documentação do projeto
```

## Como os dados são salvos

Cada tarefa é representada por um **objeto** em um **array JavaScript**. Quando uma tarefa é cadastrada, editada, excluída ou movida, o sistema usa `JSON.stringify()` para converter os dados em JSON e salvá-los no `localStorage`. Ao abrir a página, `JSON.parse()` recupera os dados. A pesquisa e os filtros alteram apenas a exibição, sem apagar os registros originais.

> **Atenção:** os dados ficam no navegador/dispositivo utilizado. Não há sincronização entre dispositivos; limpar os dados do site no navegador pode apagar as tarefas salvas.

## Testes recomendados

- Cadastrar tarefas com e sem prazo.
- Editar e excluir uma tarefa.
- Arrastar tarefas entre as três colunas e conferir os indicadores.
- Pesquisar pelo título e combinar filtros de prioridade e status.
- Atualizar a página e verificar se os dados permanecem salvos.
- Testar o modo claro/escuro e o layout no celular.

## Integrantes

**Nome(s):** _Preencher com os integrantes antes da entrega._

## Entrega

Conforme o exercício, a entrega deve ser feita pelo **link do repositório Git**, com os arquivos-fonte completos e este README. Confira se o professor consegue visualizar o repositório e se a última versão foi enviada por commit e push.

**Repositório:** https://github.com/Luk41400/gerenciador-web
