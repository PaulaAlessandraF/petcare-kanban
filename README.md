# PetCare — Sistema de Gestão de Tarefas

Sistema web desenvolvido para auxiliar na organização e acompanhamento de tarefas internas relacionadas aos cuidados de um pet.
O projeto utiliza comunicação em tempo real entre o navegador e o servidor, permitindo que as alterações realizadas no quadro de tarefas sejam atualizadas para os usuários conectados.

## Sobre o projeto
O PetCare foi desenvolvido como um sistema de gerenciamento de tarefas baseado em um quadro visual inspirado em Kanban, permitindo acompanhar o andamento das atividades por meio de três etapas:

- A Fazer
- Em Andamento
- Concluído

Cada tarefa possui informações sobre o pet, descrição e histórico de movimentações, permitindo acompanhar quando uma tarefa foi criada, iniciada e concluída, além de atribuir a responsabilidade por cada ação ao usuário selecionado.


## Funcionalidades

- Criação de tarefas
- Identificação do pet
- Identificação do responsável pelos cuidados
- Organização das tarefas em três etapas
- Movimentação de tarefas entre as etapas
- Registro de histórico das tarefas
- Registro de responsável, data e hora das ações
- Exclusão de tarefas
- Histórico de tarefas excluídas
- Limpeza do histórico de exclusões
- Atualização do quadro em tempo real entre usuários conectados
## Interface do sistema

<img width="700"  alt="Captura de tela 2026-10-07 162808" src="https://github.com/user-attachments/assets/ca74dc2d-e513-4604-a266-8a7ecf383b3f" />


## Comunicação em tempo real
A aplicação utiliza **Socket.IO** para realizar a comunicação entre o navegador e o servidor. O navegador atua como cliente e envia eventos para o servidor. O servidor, desenvolvido em Python com Flask-SocketIO, recebe esses eventos, processa as informações e envia as atualizações de volta aos clientes conectados.

Exemplo do fluxo:

Navegador (Cliente)
       ↓
   Socket.IO
       ↓
Servidor Python + Flask-SocketIO
       ↓
Processamento da tarefa
       ↓
   Socket.IO
       ↓
Navegadores conectados

## Tecnologias

**Backend**
- Python
- Flask
- Flask-SocketIO

**Frontend**
- HTML
- CSS
- JavaScript
- Socket.IO

**Ferramentas**
- Replit
- Git
- GitHub

## Arquitetura
O projeto utiliza uma arquitetura cliente-servidor.

### Cliente
O cliente é executado no navegador e é responsável pela interface visual da aplicação.
Entre suas principais funções estão:

- Exibir o quadro de tarefas
- Criar tarefas
- Exibir informações do pet
- Identificar o responsável
- Permitir a movimentação das tarefas
- Exibir os históricos
- Enviar eventos ao servidor

### Servidor
O servidor é desenvolvido em Python utilizando Flask e Flask-SocketIO.
Suas principais responsabilidades são:

- Receber eventos enviados pelo cliente
- Criar e armazenar tarefas em memória
- Controlar a movimentação das tarefas
- Registrar o histórico das ações
- Registrar exclusões
- Enviar atualizações aos clientes conectados

## Execução e desenvolvimento
Para executar o projeto localmente, é necessário ter o Python instalado. Após clonar o repositório, basta acessar a pasta do projeto, instalar as dependências disponíveis no arquivo `requirements.txt` e executar o servidor com `python server.py`.
O projeto foi desenvolvido utilizando Replit e seu código-fonte é versionado com Git e armazenado no GitHub, permitindo acompanhar as alterações realizadas durante o desenvolvimento por meio de commits.
O principal objetivo do projeto é desenvolver uma aplicação web para auxiliar na organização e acompanhamento de tarefas relacionadas aos cuidados de um pet, aplicando na prática conceitos de desenvolvimento web, arquitetura cliente-servidor e comunicação em tempo real.
