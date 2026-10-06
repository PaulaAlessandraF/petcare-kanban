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

    listaHistorico.forEach(function(registro) {
        var responsavel = registro.responsavel;
        var dataHora = registro.data_hora;
        var tarefa = registro.tarefa;
        var titulo = tarefa.titulo;
        var etapa = registro.etapa;
        var pet = tarefa.pet;

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



function abrirHistorico(){
    socket.emit('obter_historico');
}

function renderizarColuna(colunaId, listaTarefas) {
    var container = document.getElementById('lista-' + colunaId);
    if (!container) return;
    container.innerHTML = ''; 

    listaTarefas.forEach(function(tarefa) {
        var cartao = document.createElement('div');
        cartao.className = 'cartao-tarefa';
        cartao.draggable = true; 
        
        cartao.innerHTML = `
            <button class="btn-apagar" onclick="apagarTarefa('${tarefa.id}', '${colunaId}')" title="Excluir">✕</button>
            <h4> ${tarefa.titulo}</h4>
            <p><strong>Pet:</strong> ${tarefa.pet}</p>
            <p>${tarefa.descricao}</p>
            <div class="cartao-historico"> ${tarefa.historico}</div>
        `;

        cartao.addEventListener('dragstart', function(evento) {
            evento.dataTransfer.setData('text/plain', JSON.stringify({
                id: tarefa.id,
                origem: colunaId
            }));
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
    
    socket.emit('mover_tarefa', {
        id: dados.id,
        origem: dados.origem,
        destino: colunaDestino
    });
}

function adicionarTarefa() {
    var inputTitulo = document.getElementById('tituloTarefa');
    var inputDescricao = document.getElementById('descricaoTarefa');
    
    var titulo = inputTitulo.value.trim();
    var descricao = inputDescricao.value.trim();
    
    if (titulo !== "") {

        var elementoPet = document.getElementById('labelPet');
        var textoPet = elementoPet.innerText;
        var nomePet = textoPet.split("Pet:")[1].trim();

        socket.emit('adicionar_tarefa', {
            titulo: titulo,
            descricao: descricao !== "" ? descricao : 'Sem observações',
            pet: nomePet
        });
        inputTitulo.value = '';
        inputDescricao.value = '';
    }
}

function apagarTarefa(id, coluna) {
    var elementoResponsavel = document.getElementById('labelResponsavel');
    var nomeResponsavel = "Alguém";
    if (elementoResponsavel) {
        var textoHtml = elementoResponsavel.innerText;
        nomeResponsavel = textoHtml.split("Cuidador(a):")[1] ? textoHtml.split("Cuidador(a):")[1].trim() : "Paula;"
    }

    socket.emit('apagar_tarefa', {
        id: id,
        coluna: coluna,
        responsavel: nomeResponsavel
    });
}

function mudarIdentificacao() {
    var nomePet = prompt("Qual é o nome do pet?", "Zoe");
    var nomeResponsavel = prompt("Quem é o responsável pelos cuidados agora?", "Paula");

    if (nomePet) {
        document.getElementById("labelPet").innerHTML = ` Pet: <strong>${nomePet}</strong>`;
    }
    if (nomeResponsavel) {
        document.getElementById("labelResponsavel").innerHTML = ` Cuidador(a): <strong>${nomeResponsavel}</strong>`;
    }
}