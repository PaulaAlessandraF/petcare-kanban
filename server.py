from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from datetime import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = 'segredo-petcare'
socketio = SocketIO(app)

# Quadro começa totalmente limpo, sem exemplos fixos
quadro_tarefas = {
    'todo': [],
    'doing': [],
    'done': [],
}
historico_exclusoes = []

@app.route('/')
def pagina_inicial():
    return render_template('index.html')

@socketio.on('obter_quadro')
def enviar_quadro():
    emit('atualizar_quadro', quadro_tarefas)

@socketio.on('obter_historico')
def enviar_historico():
    emit('historico_atualizado', historico_exclusoes)


# Adicionar nova tarefa com data/hora de criação
@socketio.on('adicionar_tarefa')
def adicionar_tarefa(dados):
    nova_id = str(len(quadro_tarefas['todo']) + len(quadro_tarefas['doing']) + len(quadro_tarefas['done']) + 1)
    agora = datetime.now().strftime('%d/%m/%Y às %H:%M')
    
    nova_tarefa = {
        'id': nova_id,
        'titulo': dados['titulo'],
        'descricao': dados.get('descricao', 'Sem observações'),
        'pet': dados.get('pet', 'Não informado'),
        'historico': f"Criado em: {agora}"
        
    }
    
    quadro_tarefas['todo'].append(nova_tarefa)
    emit('atualizar_quadro', quadro_tarefas, broadcast=True)


# Mover tarefa e registar data/hora da mudança de fase
@socketio.on('mover_tarefa')
def mover_tarefa(dados):
    tarefa_id = dados['id']
    coluna_origem = dados['origem']
    coluna_destino = dados['destino']

    if coluna_origem == coluna_destino:
        return

    ordem_colunas = {'todo': 1, 'doing': 2, 'done': 3}

    if ordem_colunas.get(coluna_destino,0) < ordem_colunas.get(coluna_origem, 0):
        return
    
    tarefa_movida = None 
    for tarefa in quadro_tarefas[coluna_origem]:
        if tarefa['id'] == tarefa_id:
            tarefa_movida = tarefa
            break
            
    if tarefa_movida:
        quadro_tarefas[coluna_origem].remove(tarefa_movida)
        
        agora = datetime.now().strftime('%d/%m/%Y às %H:%M')
        if coluna_destino == 'doing':
            tarefa_movida['historico'] += f" | Iniciado em: {agora}"
        elif coluna_destino == 'done':
            tarefa_movida['historico'] += f" | Concluído em: {agora}"
            
        quadro_tarefas[coluna_destino].append(tarefa_movida)
        emit('atualizar_quadro', quadro_tarefas, broadcast=True)

# Apagar tarefa
@socketio.on('apagar_tarefa')
def apagar_tarefa(dados):
    tarefa_id = dados['id']
    coluna = dados['coluna']
    responsavel = dados.get('responsavel', 'alguem')
    agora = datetime.now().strftime('%d/%m/%Y às %H:%M')

    for tarefa in quadro_tarefas[coluna]:
        if tarefa['id'] == tarefa_id:
            historico_exclusoes.append({
                "tarefa": tarefa,
                "etapa": coluna,
                "responsavel": responsavel,
                "data_hora": agora
            })

            print(f"Tarefa '{tarefa['titulo']}' apagada por {responsavel} em {agora}")
        
            quadro_tarefas[coluna].remove(tarefa)
            break
            
    emit('atualizar_quadro', quadro_tarefas, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True, allow_unsafe_werkzeug=True)