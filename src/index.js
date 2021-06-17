const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
    const { username } = request.headers;

    const user = users.find(user => user.username === username);

    if (!user) {
        return response.status(400).json({ error: 'User not found' })
    }

    request.user = user;

    return next();
}

app.post('/users', (request, response) => {
    const { name, username } = request.body;

    const userAlreadyExists = users.some(user => user.username === username);

    if (userAlreadyExists) {
        return response.status(400).json({ error: 'Username already exists' })
    }

    const user = {
        name,
        username,
        id: uuidv4(),
        todos: [],
    }

    users.push(user);

    return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
    const { user } = request;
    return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
    const { user } = request;

    const { title, deadline } = request.body;

    const todo = {
        id: uuidv4(),
        title,
        done: false,
        deadline: new Date(deadline),
        created_at: new Date()
    }

    user.todos.push(todo);

    return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
    const { user } = request;
    const { id } = request.params;
    const { title, deadline } = request.body;

    const todoAlreadyExists = user.todos.find(todo => todo.id === id);

    if (!todoAlreadyExists) {
        return response.status(404).json({ error: 'Todo not found' })
    }

    user.todos = user.todos.map(todo => {
        if (todo.id === id) {
            return {
                ...todo,
                title,
                deadline: new Date(deadline)
            }
        }
        return todo;
    })

    return response.json(user.todos[0]);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
    const { user } = request;
    const { id } = request.params;

    const todoAlreadyExists = user.todos.find(todo => todo.id === id);

    if (!todoAlreadyExists) {
        return response.status(404).json({ error: 'Todo not found' })
    }

    user.todos = user.todos.map(todo => {
        if (todo.id === id) {
            return {
                ...todo,
                done: true,
            }
        }
        return todo;
    })
    return response.json(user.todos[0]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
    const { user } = request;
    const { id } = request.params;

    const todoAlreadyExists = user.todos.find(todo => todo.id === id);

    if (!todoAlreadyExists) {
        return response.status(404).json({ error: 'Todo not found' })
    }

    user.todos = user.todos.filter(todo => todo.id !== id);

    return response.status(204).send();

});

module.exports = app;