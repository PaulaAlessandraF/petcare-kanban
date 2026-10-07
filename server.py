from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from datetime import datetime
from zoneinfo import ZoneInfo

# cria o servidor e liga o Socket.IO
app = Flask(__name__)
app.config['SECRET_KEY'] = 'segredo-petcare'
socketio = SocketIO(app)

# tarefas separadas pelas 3 colunas
quadro_tarefas = {
    'todo': [],
    'doing': [],
    'done': [],
}

# histórico das tarefas excluídas
historico_exclusoes = []

proximo_id = 1


def obter_data_hora():
    agora = datetime.now(ZoneInfo('America/Sao_Paulo'))
    return agora.strftime('%d/%m/%Y às %H:%M')


@app.route('/')
def pagina_inicial():
    return render_template('index.html')


# envia o quadro atual para o navegador
@socketio.on('obter_quadro')
def enviar_quadro():
    emit('atualizar_quadro', quadro_tarefas)


# envia o histórico de exclusões
@socketio.on('obter_historico')
def enviar_historico():
    emit('historico_atualizado', historico_exclusoes)

# limpa o histórico de exclusões
@socketio.on('limpar_historico')
def limpar_historico():
    historico_exclusoes.clear()

    emit(
        'historico_atualizado',
        historico_exclusoes,
        broadcast=True
    )


# cria uma nova tarefa
@socketio.on('adicionar_tarefa')
def adicionar_tarefa(dados):
    global proximo_id

    agora = obter_data_hora()

    titulo = dados.get('titulo', 'Sem título')
    descricao = dados.get('descricao', 'Sem observações')
    pet = dados.get('pet', 'Não informado')
    responsavel = dados.get('responsavel', 'Alguém')

    registro_criacao = {
        'acao': 'criado',
        'responsavel': responsavel,
        'data_hora': agora,
        'etapa': 'todo'
    }

    nova_tarefa = {
        'id': str(proximo_id),
        'titulo': titulo,
        'descricao': descricao,
        'pet': pet,
        'historico': [
            registro_criacao
        ]
    }

    proximo_id += 1

    quadro_tarefas['todo'].append(nova_tarefa)

    emit('atualizar_quadro', quadro_tarefas, broadcast=True)


# move a tarefa de uma coluna para outra
@socketio.on('mover_tarefa')
def mover_tarefa(dados):
    tarefa_id = dados.get('id')
    coluna_origem = dados.get('origem')
    coluna_destino = dados.get('destino')
    responsavel = dados.get('responsavel', 'Alguém')

    if coluna_origem == coluna_destino:
        return

    ordem_colunas = {
        'todo': 1,
        'doing': 2,
        'done': 3
    }

    if ordem_colunas.get(coluna_destino, 0) < ordem_colunas.get(coluna_origem, 0):
        return

    tarefa_movida = None

    for tarefa in quadro_tarefas.get(coluna_origem, []):
        if tarefa['id'] == tarefa_id:
            tarefa_movida = tarefa
            break

    if not tarefa_movida:
        return

    quadro_tarefas[coluna_origem].remove(tarefa_movida)

    agora = obter_data_hora()

    if 'historico' not in tarefa_movida:
        tarefa_movida['historico'] = []

    if coluna_destino == 'doing':
        registro = {
            'acao': 'iniciado',
            'responsavel': responsavel,
            'data_hora': agora,
            'etapa': 'doing'
        }

        tarefa_movida['historico'].append(registro)

    elif coluna_destino == 'done':
        registro = {
            'acao': 'concluido',
            'responsavel': responsavel,
            'data_hora': agora,
            'etapa': 'done'
        }

        tarefa_movida['historico'].append(registro)

    quadro_tarefas[coluna_destino].append(tarefa_movida)

    emit('atualizar_quadro', quadro_tarefas, broadcast=True)


# apaga a tarefa e salva os dados no histórico
@socketio.on('apagar_tarefa')
def apagar_tarefa(dados):
    tarefa_id = dados.get('id')
    coluna = dados.get('coluna')
    responsavel = dados.get('responsavel', 'Alguém')

    agora = obter_data_hora()

    tarefa_encontrada = None

    for tarefa in quadro_tarefas.get(coluna, []):
        if tarefa['id'] == tarefa_id:
            tarefa_encontrada = tarefa
            break

    if not tarefa_encontrada:
        return

    historico_exclusoes.append({
        'tarefa': tarefa_encontrada,
        'etapa': coluna,
        'responsavel': responsavel,
        'data_hora': agora
    })

    print(
        f"Tarefa '{tarefa_encontrada['titulo']}' "
        f"apagada por {responsavel} em {agora}"
    )

    quadro_tarefas[coluna].remove(tarefa_encontrada)

    emit('atualizar_quadro', quadro_tarefas, broadcast=True)

    emit(
        'historico_atualizado',
        historico_exclusoes,
        broadcast=True
    )


# inicia o servidor
if __name__ == '__main__':
    socketio.run(
        app,
        host='0.0.0.0',
        port=5000,
        debug=True,
        allow_unsafe_werkzeug=True
    )