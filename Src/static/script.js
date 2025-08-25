document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskList = document.getElementById('task-list');

    async function fetchTasks() {
        const response = await fetch('/task');
        if (!response.ok) throw new Error('Erro ao buscar tarefas');

        const tasks = await response.json();
        taskList.innerHTML = '';

        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = task.completed ? 'concluida' : '';

            // Armazena os dados originais como atributos
            li.dataset.tituloOriginal = task.title;
            li.dataset.descricaoOriginal = task.description;

            const title = document.createElement('strong');
            title.className = 'titulo';
            title.textContent = task.title;

            const description = document.createElement('p');
            description.className = 'descricao';
            description.textContent = task.description;

            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'actions';

            // Botão concluir/desfazer
            const toggleBtn = document.createElement('button');
            toggleBtn.textContent = task.completed ? '↩ Desfazer' : '✔ Concluir';
            toggleBtn.className = task.completed ? 'btn-desfazer' : 'btn-concluir';

            toggleBtn.addEventListener('click', () => {
                const isDesfazer = (task.id, !task.completed);
                
                const newTitle = isDesfazer ? li.dataset.tituloOriginal : 'Atualizado';
                const newDescription = isDesfazer ? li.dataset.descricaoOriginal : 'Atualizado';


                toggleComplete(task.id, !task.completed, newTitle, newDescription);
            });

            // Botão Editar
            const editBtn = document.createElement('button');
            editBtn.className = 'btn-editar';
            editBtn.innerHTML = '✎ Editar';
            editBtn.addEventListener('click', () => editTask(task.id, task.title, task.description));

            // Botão Excluir
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn-excluir';
            deleteBtn.innerHTML = '🗑 Excluir';
            deleteBtn.addEventListener('click', () => deleteTask(task.id));

            actionsDiv.append(toggleBtn, editBtn, deleteBtn);
            li.append(title, description, actionsDiv);
            taskList.appendChild(li);
        });
    }

    const defaultSubmit = async (e) => {
        e.preventDefault();
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;

        const response = await fetch('/task', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description })
        });

        if (!response.ok) throw new Error('Erro ao adicionar tarefa');

        taskForm.reset();
        fetchTasks();
    };

    taskForm.onsubmit = defaultSubmit;

    async function toggleComplete(id, completed) {
        const response = await fetch(`/task/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed })
        });
        if (!response.ok) throw new Error('Erro ao atualizar tarefa');
        fetchTasks();
    }

    function editTask(id, title, description) {
        document.getElementById('title').value = title;
        document.getElementById('description').value = description;

        taskForm.onsubmit = async (e) => {
            e.preventDefault();
            const newTitle = document.getElementById('title').value;
            const newDescription = document.getElementById('description').value;

            const response = await fetch(`/task/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTitle, description: newDescription, completed: false })
            });

            if (!response.ok) throw new Error('Erro ao editar tarefa');

            taskForm.reset();
            taskForm.onsubmit = defaultSubmit;
            fetchTasks();
        };
    }

    async function deleteTask(id) {
        const response = await fetch(`/task/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Erro ao excluir tarefa');
        fetchTasks();
    }

    fetchTasks();
});
// Este script gerencia as funcionalidades de gerenciamento de tarefas, como adicionar, editar, excluir e alternar o status de conclusão das tarefas.
// Ele usa a API Fetch para se comunicar com o backend e atualiza dinamicamente a lista de tarefas no documento HTML.
// O script escuta o evento DOMContentLoaded para garantir que o HTML esteja totalmente carregado antes de executá-lo.
// Ele também fornece funções para gerenciar o envio de formulários, alternar a conclusão de tarefas, editar tarefas e excluí-las.
// A lista de tarefas é preenchida dinamicamente com tarefas recuperadas do servidor, e cada tarefa possui botões para concluir, editar e excluir a tarefa.
// O script usa async/await para operações assíncronas, garantindo uma experiência tranquila para o usuário, sem recarregamentos de página.
// O formulário de tarefas é redefinido após cada operação bem-sucedida para limpar os campos de entrada.