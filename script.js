// TaskFlow - JavaScript puro (sem bibliotecas, banco de dados ou servidor).

const CHAVE_STORAGE = "taskflow_tarefas_v1";
const CHAVE_TEMA = "taskflow_tema_v1";
const PRIORIDADES = { baixa: "Baixa", media: "Média", alta: "Alta" };
const STATUS = { pendente: "A fazer", andamento: "Em andamento", concluida: "Concluída" };

const formulario = document.getElementById("form-tarefa");
const campoTitulo = document.getElementById("titulo");
const campoDescricao = document.getElementById("descricao");
const campoPrioridade = document.getElementById("prioridade");
const campoSP = document.getElementById("sp");
const campoPrazo = document.getElementById("prazo");
const mensagemFormulario = document.getElementById("mensagem-formulario");
const botaoSalvar = document.getElementById("botao-salvar");
const botaoCancelar = document.getElementById("botao-cancelar");
const campoPesquisa = document.getElementById("pesquisa");
const filtroPrioridade = document.getElementById("filtro-prioridade");
const filtroStatus = document.getElementById("filtro-status");
const kanban = document.getElementById("kanban");
const botaoTema = document.getElementById("alternar-tema");
const rotuloTema = document.getElementById("rotulo-tema");
const avisoKanban = document.getElementById("aviso-kanban");

// A escolha de tema é independente das tarefas e também fica salva no navegador.
function aplicarTema(tema) {
  const escuro = tema === "dark";
  document.documentElement.setAttribute("data-theme", escuro ? "dark" : "light");
  botaoTema.setAttribute("aria-pressed", String(escuro));
  botaoTema.setAttribute("aria-label", escuro ? "Ativar modo claro" : "Ativar modo escuro");
  rotuloTema.textContent = escuro ? "Modo claro" : "Modo escuro";
}

function carregarTema() {
  try {
    const temaSalvo = localStorage.getItem(CHAVE_TEMA);
    if (temaSalvo === "dark" || temaSalvo === "light") return temaSalvo;
  } catch (erro) {
    console.warn("Não foi possível recuperar o tema:", erro);
  }
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

aplicarTema(carregarTema());

botaoTema.addEventListener("click", function () {
  const novoTema = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  aplicarTema(novoTema);
  try {
    localStorage.setItem(CHAVE_TEMA, novoTema);
  } catch (erro) {
    console.warn("Não foi possível salvar a preferência do tema:", erro);
  }
});

// Cada tarefa é um objeto guardado dentro deste array.
let tarefas = carregarTarefas();
let idEmEdicao = null;

// JSON.stringify transforma o array em texto para salvar no navegador.
function salvarTarefas() {
  try {
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(tarefas));
    return true;
  } catch (erro) {
    console.error("Não foi possível salvar as tarefas:", erro);
    mostrarMensagem("O navegador não permitiu salvar as tarefas.", true);
    return false;
  }
}

// JSON.parse recupera o array do localStorage ao abrir ou atualizar a página.
function carregarTarefas() {
  try {
    const dados = localStorage.getItem(CHAVE_STORAGE);
    if (dados === null) return [];

    const resultado = JSON.parse(dados);
    if (!Array.isArray(resultado)) return [];

    // Tarefas antigas não tinham SP: recebem dificuldade 1 sem perder os outros dados.
    return resultado.filter(tarefa =>
      tarefa && typeof tarefa.id === "string" &&
      typeof tarefa.titulo === "string" &&
      typeof tarefa.descricao === "string" &&
      typeof tarefa.prazo === "string" &&
      PRIORIDADES[tarefa.prioridade] && STATUS[tarefa.status]
    ).map(tarefa => ({
      ...tarefa,
      sp: Number.isInteger(Number(tarefa.sp)) && Number(tarefa.sp) >= 1 && Number(tarefa.sp) <= 20
        ? Number(tarefa.sp) : 1
    }));
  } catch (erro) {
    console.error("Não foi possível recuperar as tarefas:", erro);
    return [];
  }
}

function mostrarMensagem(texto, erro = false) {
  mensagemFormulario.textContent = texto;
  mensagemFormulario.classList.toggle("form-message--error", erro);
}

function criarId() {
  return Date.now().toString() + Math.random().toString(36).slice(2, 8);
}

// O formulário serve tanto para cadastrar como para editar tarefas.
formulario.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const titulo = campoTitulo.value.trim();
  const descricao = campoDescricao.value.trim();
  const prioridade = campoPrioridade.value;
  const sp = Number(campoSP.value);
  const prazo = campoPrazo.value;

  if (!titulo || !PRIORIDADES[prioridade]) {
    mostrarMensagem("Preencha o título e selecione uma prioridade.", true);
    return;
  }

  if (campoSP.value.trim() === "" || !Number.isInteger(sp) || sp < 1 || sp > 20) {
    mostrarMensagem("O SP deve ser um número inteiro de 1 a 20.", true);
    return;
  }

  if (idEmEdicao !== null) {
    const tarefa = tarefas.find(item => item.id === idEmEdicao);
    if (!tarefa) {
      cancelarEdicao();
      mostrarMensagem("Essa tarefa não foi encontrada.", true);
      return;
    }
    tarefa.titulo = titulo;
    tarefa.descricao = descricao;
    tarefa.prioridade = prioridade;
    tarefa.sp = sp;
    tarefa.prazo = prazo;
  } else {
    tarefas.push({
      id: criarId(),
      titulo: titulo,
      descricao: descricao,
      prioridade: prioridade,
      sp: sp,
      prazo: prazo,
      status: "pendente"
    });
  }

  const estavaEditando = idEmEdicao !== null;
  cancelarEdicao();
  salvarTarefas();
  renderizarTudo();
  mostrarMensagem(estavaEditando ? "Tarefa atualizada!" : "Tarefa adicionada!");
});

function editarTarefa(id) {
  const tarefa = tarefas.find(item => item.id === id);
  if (!tarefa) return;

  idEmEdicao = id;
  campoTitulo.value = tarefa.titulo;
  campoDescricao.value = tarefa.descricao;
  campoPrioridade.value = tarefa.prioridade;
  campoSP.value = tarefa.sp;
  campoPrazo.value = tarefa.prazo;

  document.getElementById("titulo-formulario").textContent = "Editar tarefa";
  botaoSalvar.textContent = "✓ Salvar alterações";
  botaoCancelar.hidden = false;
  mostrarMensagem("");
  document.getElementById("nova-tarefa").scrollIntoView({ behavior: "smooth" });
  campoTitulo.focus({ preventScroll: true });
}

function cancelarEdicao() {
  idEmEdicao = null;
  formulario.reset();
  document.getElementById("titulo-formulario").textContent = "Adicionar nova tarefa";
  botaoSalvar.textContent = "＋ Adicionar tarefa";
  botaoCancelar.hidden = true;
}

botaoCancelar.addEventListener("click", function () {
  cancelarEdicao();
  mostrarMensagem("");
});

function excluirTarefa(id) {
  const tarefa = tarefas.find(item => item.id === id);
  if (!tarefa) return;

  if (!window.confirm(`Deseja excluir a tarefa "${tarefa.titulo}"?`)) return;

  tarefas = tarefas.filter(item => item.id !== id);
  if (idEmEdicao === id) cancelarEdicao();
  salvarTarefas();
  renderizarTudo();
  mostrarMensagem("Tarefa excluída.");
}

function alterarStatus(id, novoStatus) {
  const tarefa = tarefas.find(item => item.id === id);
  if (!tarefa || !STATUS[novoStatus]) return;

  if (tarefa.status === novoStatus) return;
  tarefa.status = novoStatus;
  salvarTarefas();
  renderizarTudo();
  avisoKanban.textContent = `Tarefa ${tarefa.titulo} movida para ${STATUS[novoStatus]}.`;
}

// Drag and Drop nativo para computadores (mouse/trackpad).
// Os cartões podem ser movidos para qualquer uma das três colunas.
let idArrastado = null;

function limparDestaqueDrop() {
  kanban.querySelectorAll(".kanban-column--drop-target").forEach(coluna => {
    coluna.classList.remove("kanban-column--drop-target");
  });
}

function terminarArrasteDesktop() {
  idArrastado = null;
  limparDestaqueDrop();
  kanban.querySelectorAll(".task-card--dragging").forEach(cartao => {
    cartao.classList.remove("task-card--dragging");
  });
  document.body.classList.remove("taskflow-drag-active");
}

kanban.addEventListener("dragstart", function (evento) {
  const cartao = evento.target.closest(".task-card");
  if (!cartao || !evento.dataTransfer) return;

  idArrastado = cartao.dataset.id;
  evento.dataTransfer.effectAllowed = "move";
  evento.dataTransfer.setData("text/plain", idArrastado);
  document.body.classList.add("taskflow-drag-active");

  // Mantém o cartão visível no início do arraste, mas destaca a origem.
  requestAnimationFrame(() => cartao.classList.add("task-card--dragging"));
});

kanban.addEventListener("dragover", function (evento) {
  if (!idArrastado) return;
  const coluna = evento.target.closest(".kanban-column");
  if (!coluna) return;
  evento.preventDefault(); // necessário para permitir soltar
  if (evento.dataTransfer) evento.dataTransfer.dropEffect = "move";
  limparDestaqueDrop();
  coluna.classList.add("kanban-column--drop-target");
});

kanban.addEventListener("drop", function (evento) {
  if (!idArrastado) return;
  const coluna = evento.target.closest(".kanban-column");
  if (coluna) {
    evento.preventDefault();
    const id = idArrastado;
    const status = coluna.dataset.coluna;
    terminarArrasteDesktop();
    alterarStatus(id, status);
  }
});

kanban.addEventListener("dragend", terminarArrasteDesktop);

// No celular, o HTML Drag and Drop não funciona de forma consistente.
// Pointer Events permitem segurar a alça ⠿ e arrastar com o dedo.
let arrasteToque = null;
let animacaoRolagem = null;

function colunaSobDedo(x, y) {
  const elemento = document.elementFromPoint(x, y);
  return elemento ? elemento.closest(".kanban-column") : null;
}

function destacarColunaNoToque(x, y) {
  const coluna = colunaSobDedo(x, y);
  limparDestaqueDrop();
  if (coluna) coluna.classList.add("kanban-column--drop-target");
  return coluna;
}

function pararRolagemAutomatica() {
  if (animacaoRolagem !== null) cancelAnimationFrame(animacaoRolagem);
  animacaoRolagem = null;
}

function rolarAoArrastar() {
  if (!arrasteToque || !arrasteToque.movendo) {
    animacaoRolagem = null;
    return;
  }
  const y = arrasteToque.y;
  const margem = 75;
  const velocidade = y < margem ? -12 : y > window.innerHeight - margem ? 12 : 0;
  if (velocidade) window.scrollBy(0, velocidade);
  destacarColunaNoToque(arrasteToque.x, arrasteToque.y);
  animacaoRolagem = requestAnimationFrame(rolarAoArrastar);
}

function finalizarArrasteToque(confirmar, evento) {
  if (!arrasteToque) return;
  const arraste = arrasteToque;
  // Em alguns celulares, pointerup não informa a posição final do toque.
  // Usamos as coordenadas guardadas no último pointermove.
  const destino = confirmar && arraste.movendo ? colunaSobDedo(arraste.x, arraste.y) : null;
  arrasteToque = null;
  pararRolagemAutomatica();
  limparDestaqueDrop();
  document.body.classList.remove("taskflow-drag-active");
  arraste.cartao.classList.remove("task-card--dragging");
  if (arraste.fantasma) arraste.fantasma.remove();
  if (destino) alterarStatus(arraste.id, destino.dataset.coluna);
}

kanban.addEventListener("pointerdown", function (evento) {
  if (evento.pointerType === "mouse" || !evento.isPrimary) return;
  const alca = evento.target.closest(".task-drag-handle");
  if (!alca) return;
  const cartao = alca.closest(".task-card");
  if (!cartao) return;
  evento.preventDefault();
  arrasteToque = {
    id: cartao.dataset.id,
    cartao,
    alca,
    pointerId: evento.pointerId,
    inicioX: evento.clientX,
    inicioY: evento.clientY,
    x: evento.clientX,
    y: evento.clientY,
    movendo: false,
    fantasma: null
  };
  alca.setPointerCapture(evento.pointerId);
});

kanban.addEventListener("pointermove", function (evento) {
  if (!arrasteToque || evento.pointerId !== arrasteToque.pointerId) return;
  const arraste = arrasteToque;
  const distancia = Math.hypot(evento.clientX - arraste.inicioX, evento.clientY - arraste.inicioY);
  if (!arraste.movendo && distancia < 8) return;
  evento.preventDefault();

  if (!arraste.movendo) {
    arraste.movendo = true;
    const retangulo = arraste.cartao.getBoundingClientRect();
    const fantasma = arraste.cartao.cloneNode(true);
    fantasma.classList.add("task-card--ghost");
    fantasma.classList.remove("task-card--dragging");
    fantasma.style.width = `${retangulo.width}px`;
    document.body.appendChild(fantasma);
    arraste.fantasma = fantasma;
    arraste.cartao.classList.add("task-card--dragging");
    document.body.classList.add("taskflow-drag-active");
    animacaoRolagem = requestAnimationFrame(rolarAoArrastar);
  }

  arraste.x = evento.clientX;
  arraste.y = evento.clientY;
  arraste.fantasma.style.left = `${evento.clientX}px`;
  arraste.fantasma.style.top = `${evento.clientY}px`;
  destacarColunaNoToque(evento.clientX, evento.clientY);
});

kanban.addEventListener("pointerup", function (evento) {
  if (arrasteToque && evento.pointerId === arrasteToque.pointerId) {
    finalizarArrasteToque(true, evento);
  }
});

kanban.addEventListener("pointercancel", function (evento) {
  if (arrasteToque && evento.pointerId === arrasteToque.pointerId) {
    finalizarArrasteToque(false, evento);
  }
});

// Event delegation: um evento atende aos botões de todos os cartões.
kanban.addEventListener("click", function (evento) {
  const botao = evento.target.closest("button[data-acao]");
  if (!botao) return;

  const cartao = botao.closest("[data-id]");
  if (!cartao) return;

  if (botao.dataset.acao === "editar") editarTarefa(cartao.dataset.id);
  if (botao.dataset.acao === "excluir") excluirTarefa(cartao.dataset.id);
});

kanban.addEventListener("change", function (evento) {
  if (!evento.target.matches("select[data-acao='status']")) return;
  const cartao = evento.target.closest("[data-id]");
  if (cartao) alterarStatus(cartao.dataset.id, evento.target.value);
});

function dataEmPortugues(dataISO) {
  // Montamos a data localmente para não mudar o dia por causa do fuso horário.
  const partes = dataISO.split("-").map(Number);
  if (partes.length !== 3 || partes.some(Number.isNaN)) return dataISO;
  return new Date(partes[0], partes[1] - 1, partes[2]).toLocaleDateString("pt-BR");
}

function hojeISO() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

// textContent mostra o texto cadastrado de forma segura, sem interpretar HTML.
function criarCartao(tarefa) {
  const cartao = document.createElement("article");
  cartao.className = `task-card priority--${tarefa.prioridade}`;
  cartao.dataset.id = tarefa.id;
  cartao.draggable = true;
  cartao.title = "Arraste para outra coluna ou altere o status pelo seletor";

  // Apenas a estrutura fixa é criada com innerHTML. Os dados entram por textContent.
  cartao.innerHTML = `
    <div class="task-card__top">
      <div class="task-badges">
        <span class="priority-tag"></span>
        <span class="sp-tag"></span>
      </div>
      <div class="task-card__actions">
        <span class="task-drag-handle" role="img" aria-label="Alça para arrastar a tarefa" title="Segure para arrastar no celular">⠿</span>
        <button type="button" data-acao="editar" aria-label="Editar tarefa">Editar</button>
        <button type="button" data-acao="excluir" aria-label="Excluir tarefa">Excluir</button>
      </div>
    </div>
    <h4 class="task-card__title"></h4>
    <p class="task-card__description"></p>
    <div class="task-card__bottom">
      <span class="task-date"></span>
      <label class="task-card__status">Status
        <select data-acao="status" aria-label="Alterar status da tarefa">
          <option value="pendente">A fazer</option>
          <option value="andamento">Em andamento</option>
          <option value="concluida">Concluída</option>
        </select>
      </label>
    </div>
  `;

  cartao.querySelector(".priority-tag").textContent = PRIORIDADES[tarefa.prioridade];
  const marcadorSP = cartao.querySelector(".sp-tag");
  marcadorSP.textContent = `SP ${tarefa.sp}/20`;
  marcadorSP.title = `Dificuldade ${tarefa.sp} de 20`;
  marcadorSP.classList.add(tarefa.sp <= 6 ? "sp-tag--easy" : tarefa.sp <= 13 ? "sp-tag--medium" : "sp-tag--hard");
  cartao.querySelector(".task-card__title").textContent = tarefa.titulo;
  const descricao = cartao.querySelector(".task-card__description");
  descricao.textContent = tarefa.descricao || "Sem descrição";
  const prazo = cartao.querySelector(".task-date");
  prazo.textContent = tarefa.prazo ? `◷ Prazo: ${dataEmPortugues(tarefa.prazo)}` : "◷ Sem prazo definido";
  if (tarefa.prazo && tarefa.prazo < hojeISO() && tarefa.status !== "concluida") {
    prazo.classList.add("task-date--late");
    prazo.textContent += " · Atrasada";
  }
  cartao.querySelector("select").value = tarefa.status;
  return cartao;
}

function filtrarTarefas() {
  const pesquisa = campoPesquisa.value.trim().toLocaleLowerCase("pt-BR");
  const prioridade = filtroPrioridade.value;
  const status = filtroStatus.value;

  // filter cria uma NOVA lista; não apaga nem altera o array original.
  return tarefas.filter(tarefa => {
    const correspondeTitulo = tarefa.titulo.toLocaleLowerCase("pt-BR").includes(pesquisa);
    const correspondePrioridade = prioridade === "todas" || tarefa.prioridade === prioridade;
    const correspondeStatus = status === "todos" || tarefa.status === status;
    return correspondeTitulo && correspondePrioridade && correspondeStatus;
  });
}

function renderizarIndicadores() {
  const pendentes = tarefas.filter(item => item.status === "pendente").length;
  const andamento = tarefas.filter(item => item.status === "andamento").length;
  const concluidas = tarefas.filter(item => item.status === "concluida").length;
  const percentual = tarefas.length === 0 ? 0 : Math.round(concluidas / tarefas.length * 100);

  document.getElementById("total-tarefas").textContent = tarefas.length;
  document.getElementById("tarefas-pendentes").textContent = pendentes;
  document.getElementById("tarefas-andamento").textContent = andamento;
  document.getElementById("tarefas-concluidas").textContent = concluidas;
  document.getElementById("porcentagem-progresso").textContent = `${percentual}%`;
  document.getElementById("preenchimento-progresso").style.width = `${percentual}%`;
  document.getElementById("barra-progresso").setAttribute("aria-valuenow", percentual);
}

function criarEstadoVazio(existeFiltro) {
  const caixa = document.createElement("div");
  caixa.className = "empty-state";

  const simbolo = document.createElement("span");
  simbolo.textContent = "☷";
  const titulo = document.createElement("strong");
  titulo.textContent = existeFiltro ? "Nenhuma tarefa encontrada" : "Tudo livre por aqui";
  const subtitulo = document.createElement("p");
  subtitulo.textContent = existeFiltro ? "Tente mudar os filtros." : "Quando houver tarefas, elas aparecerão aqui.";
  caixa.append(simbolo, titulo, subtitulo);
  return caixa;
}

function renderizarKanban() {
  const tarefasFiltradas = filtrarTarefas();
  const filtroAtivo = campoPesquisa.value.trim() !== "" || filtroPrioridade.value !== "todas" || filtroStatus.value !== "todos";

  document.getElementById("contador-filtros").textContent = `${tarefasFiltradas.length} ${tarefasFiltradas.length === 1 ? "tarefa encontrada" : "tarefas encontradas"}`;

  for (const status of Object.keys(STATUS)) {
    const coluna = document.getElementById(`coluna-${status}`);
    const lista = tarefasFiltradas.filter(item => item.status === status);
    document.getElementById(`quantidade-${status}`).textContent = lista.length;
    coluna.replaceChildren();

    if (lista.length === 0) {
      coluna.appendChild(criarEstadoVazio(filtroAtivo));
    } else {
      for (const tarefa of lista) coluna.appendChild(criarCartao(tarefa));
    }
  }
}

function renderizarTudo() {
  renderizarIndicadores();
  renderizarKanban();
}

// Os três filtros funcionam juntos.
campoPesquisa.addEventListener("input", renderizarKanban);
filtroPrioridade.addEventListener("change", renderizarKanban);
filtroStatus.addEventListener("change", renderizarKanban);

document.getElementById("limpar-filtros").addEventListener("click", function () {
  campoPesquisa.value = "";
  filtroPrioridade.value = "todas";
  filtroStatus.value = "todos";
  renderizarKanban();
});

document.getElementById("data-hoje").textContent = new Date().toLocaleDateString("pt-BR", {
  day: "numeric", month: "long", year: "numeric"
});

renderizarTudo();
