var socket = io();


socket.on('connect', function() {
    socket.emit('obter_quadro');
});


socket.on('atualizar_quadro', function(tarefas) {
    renderizarColuna('todo', tarefas.todo);
    renderizarColuna('doing', tarefas.doing);
    renderizarColuna('done', tarefas.done);
});


socket.on('historico_atualizado', function(listaHistorico) {
    var container = document.getElementById('historico');

    if (!container) return;

    // Evita duplicação do histórico ao clicar várias vezes
    container.innerHTML = '';

    listaHistorico.forEach(function(registro) {
        var responsavel = registro.responsavel || 'Alguém';
        var dataHora = registro.data_hora || 'Data não informada';
        var tarefa = registro.tarefa || {};

        var titulo = tarefa.titulo || 'Tarefa sem título';
        var pet = tarefa.pet || 'Pet não informado';
        var etapa = registro.etapa || '';

        if (etapa === 'todo') {
            etapa = 'A Fazer';
        } else if (etapa === 'doing') {
            etapa = 'Em Andamento';
        } else if (etapa === 'done') {
            etapa = 'Concluído';
        }

        var item = document.createElement('div');

        item.innerHTML = `
            <strong>${titulo}</strong>
            <p>Pet: ${pet}</p>
            <p>Etapa: ${etapa}</p>
            <p>Excluído por: ${responsavel}</p>
            <p>Data e hora: ${dataHora}</p>
        `;

        container.appendChild(item);
    });
});


function abrirHistorico() {
    socket.emit('obter_historico');
}

function limparHistorico() {
    var confirmar = confirm('Tem certeza que deseja limpar o histórico de exclusões?');

    if (confirmar) {
        socket.emit('limpar_historico');
    }
}


// Pega o nome do cuidador/responsável atual
function obterResponsavel() {
    var elementoResponsavel = document.getElementById('labelResponsavel');

    if (!elementoResponsavel) {
        return 'Alguém';
    }

    var texto = elementoResponsavel.innerText || '';
    var partes = texto.split('Cuidador(a):');

    if (partes[1]) {
        var nome = partes[1].trim();

        if (nome !== '') {
            return nome;
        }
    }

    return 'Alguém';
}


// Monta a linha do tempo que aparece dentro do card
function montarHistoricoCard(historico) {
    if (!historico || !Array.isArray(historico)) {
        return '';
    }

    var html = '';

    historico.forEach(function(registro, index) {
        if (index > 0) {
            html += '<hr>';
        }

        var acao = registro.acao || '';
        var responsavel = registro.responsavel || 'Alguém';
        var dataHora = registro.data_hora || 'Data não informada';

        var tituloAcao = '';

        if (acao === 'criado') {
            tituloAcao = 'Criado em';
        } else if (acao === 'iniciado') {
            tituloAcao = 'Iniciado em';
        } else if (acao === 'concluido') {
            tituloAcao = 'Concluído em';
        } else {
            tituloAcao = 'Atualizado em';
        }

        html += `
            <div class="registro-historico">
                <strong>${tituloAcao}: ${dataHora}</strong>
                <p>Por: ${responsavel}</p>
            </div>
        `;
    });

    return html;
}


function renderizarColuna(colunaId, listaTarefas) {
    var container = document.getElementById('lista-' + colunaId);

    if (!container) return;

    container.innerHTML = '';

    listaTarefas.forEach(function(tarefa) {
        var cartao = document.createElement('div');

        cartao.className = 'cartao-tarefa';
        cartao.draggable = true;

        var nomeResponsavel = obterResponsavel();

        var historicoHtml = montarHistoricoCard(tarefa.historico);

        cartao.innerHTML = `
            <button
                class="btn-apagar"
                onclick="apagarTarefa('${tarefa.id}', '${colunaId}')"
                title="Excluir">
                ✕
            </button>

            <h4>${tarefa.titulo}</h4>

            <p>
                <strong>Pet:</strong> ${tarefa.pet}
            </p>

            <p>
                ${tarefa.descricao}
            </p>

            <p>
                <strong>Responsável:</strong> ${nomeResponsavel}
            </p>

            <div class="cartao-historico">
                ${historicoHtml}
            </div>
        `;

        cartao.addEventListener('dragstart', function(evento) {
            evento.dataTransfer.setData(
                'text/plain',
                JSON.stringify({
                    id: tarefa.id,
                    origem: colunaId
                })
            );
        });

        container.appendChild(cartao);
    });
}


function permitirDrop(evento) {
    evento.preventDefault();
}


function soltar(evento, colunaDestino) {
    evento.preventDefault();

    var dadosBrutos = evento.dataTransfer.getData('text/plain');

    if (!dadosBrutos) return;

    var dados = JSON.parse(dadosBrutos);

    var nomeResponsavel = obterResponsavel();

    socket.emit('mover_tarefa', {
        id: dados.id,
        origem: dados.origem,
        destino: colunaDestino,
        responsavel: nomeResponsavel
    });
}


function adicionarTarefa() {
    var inputTitulo = document.getElementById('tituloTarefa');
    var inputDescricao = document.getElementById('descricaoTarefa');

    var titulo = inputTitulo.value.trim();
    var descricao = inputDescricao.value.trim();

    if (titulo !== '') {

        var elementoPet = document.getElementById('labelPet');

        if (!elementoPet) {
            return;
        }

        var textoPet = elementoPet.innerText || '';
        var partesPet = textoPet.split('Pet:');

        var nomePet = 'Pet não informado';

        if (partesPet[1]) {
            nomePet = partesPet[1].trim();
        }

        var nomeResponsavel = obterResponsavel();

        socket.emit('adicionar_tarefa', {
            titulo: titulo,
            descricao: descricao !== '' ? descricao : 'Sem observações',
            pet: nomePet,
            responsavel: nomeResponsavel
        });

        inputTitulo.value = '';
        inputDescricao.value = '';
    }
}


function apagarTarefa(id, coluna) {
    var nomeResponsavel = obterResponsavel();

    socket.emit('apagar_tarefa', {
        id: id,
        coluna: coluna,
        responsavel: nomeResponsavel
    });
}


function mudarIdentificacao() {
    var nomePet = prompt('Qual é o nome do pet?', 'Zoe');
    var nomeResponsavel = prompt(
        'Quem é o responsável pelos cuidados agora?',
        'Paula'
    );

    if (nomePet) {
        document.getElementById('labelPet').innerHTML =
            `Pet: <strong>${nomePet}</strong>`;
    }

    if (nomeResponsavel) {
        document.getElementById('labelResponsavel').innerHTML =
            `Cuidador(a): <strong>${nomeResponsavel}</strong>`;
    }
}