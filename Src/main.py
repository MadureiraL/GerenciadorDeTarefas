from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import sqlite3


app = Flask(__name__)
CORS(app)



def init_db():
    conn = sqlite3.connect('tasks.db')
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS tasks(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        completed BOOLEAN NOT NULL DEFAULT 0
       )
                   ''')
    conn.commit()
    conn.close()


init_db()


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/task', methods=['GET'])
def get_tasks():
    conn = sqlite3.connect('tasks.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tasks")
    tasks = cursor.fetchall()
    conn.close()
    return jsonify([{'id': task[0], 'title': task[1], 'description': task[2], 'completed': task[3]} for task in tasks])


@app.route('/task', methods=['POST'])
def add_task():
    data = request.json
    title = data.get('title')
    description = data.get('description')

    if not title or not description:
        return jsonify({'error': 'Title and description are required'}), 400

    conn = sqlite3.connect('tasks.db')
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO tasks (title, description) VALUES (?, ?)", (title, description))
    conn.commit()
    task_id = cursor.lastrowid
    conn.close()

    return jsonify({'message': 'tasks added', 'id': task_id, 'title': title, 'description': description, 'completed': False}), 201


@app.route('/task/<int:id>', methods=['PUT'])
def update_task(id):
    data = request.json

    conn = sqlite3.connect('tasks.db')
    cursor = conn.cursor()

    # Monta dinamicamente os campos a serem atualizados
    fields = []
    values = []

    if 'title' in data:
        fields.append("title = ?")
        values.append(data['title'])

    if 'description' in data:
        fields.append("description = ?")
        values.append(data['description'])

    if 'completed' in data:
        fields.append("completed = ?")
        values.append(data['completed'])

    if not fields:
        return jsonify({'error': 'Nenhum campo para atualizar'}), 400

    # Adiciona o ID no final da lista de valores
    values.append(id)

    query = f"UPDATE tasks SET {', '.join(fields)} WHERE id = ?"
    cursor.execute(query, values)

    conn.commit()
    conn.close()

    return jsonify({'message': 'Tarefa atualizada com sucesso'})

@app.route('/task/<int:id>', methods=['DELETE'])
def delete_task(id):
    conn = sqlite3.connect('tasks.db')
    cursor = conn.cursor()
    cursor.execute("DELETE FROM tasks WHERE id = ?", (id,))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Task deleted successfully', 'id': id})

if __name__ == '__main__':
    app.run(debug=True)

