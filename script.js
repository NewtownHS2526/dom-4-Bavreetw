// Simple To-Do app with localStorage persistence

const STORAGE_KEY = 'todo.tasks.v1';

const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const list = document.getElementById('tasks');
const filters = document.querySelectorAll('.filter');
const clearBtn = document.getElementById('clear-completed');
const itemsLeft = document.getElementById('items-left');

let tasks = loadTasks();
let filter = 'all';

function loadTasks(){
	try{
		return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
	}catch(e){
		return [];
	}
}

function saveTasks(){
	localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function render(){
	list.innerHTML = '';
	const visible = tasks.filter(t => {
		if(filter === 'active') return !t.completed;
		if(filter === 'completed') return t.completed;
		return true;
	});

	visible.forEach(task => {
		const li = document.createElement('li');
		li.className = 'task-item';
		li.dataset.id = task.id;

		const checkbox = document.createElement('input');
		checkbox.type = 'checkbox';
		checkbox.checked = task.completed;
		checkbox.className = 'task-checkbox';
		checkbox.addEventListener('change', () => toggleComplete(task.id));

		const label = document.createElement('span');
		label.className = 'task-label';
		label.textContent = task.text;
		if(task.completed) label.classList.add('done');
		label.addEventListener('dblclick', () => startEdit(task.id));

		const editInput = document.createElement('input');
		editInput.className = 'task-edit';
		editInput.value = task.text;
		editInput.addEventListener('keydown', e => {
			if(e.key === 'Enter') finishEdit(task.id, editInput.value);
			if(e.key === 'Escape') render();
		});
		editInput.addEventListener('blur', () => finishEdit(task.id, editInput.value));

		const del = document.createElement('button');
		del.className = 'task-delete';
		del.textContent = '✕';
		del.title = 'Delete';
		del.addEventListener('click', () => deleteTask(task.id));

		li.appendChild(checkbox);
		li.appendChild(label);
		li.appendChild(editInput);
		li.appendChild(del);
		list.appendChild(li);
	});

	const remaining = tasks.filter(t => !t.completed).length;
	itemsLeft.textContent = `${remaining} item${remaining !== 1 ? 's' : ''} left`;
	saveTasks();
}

function addTask(text){
	const trimmed = text.trim();
	if(!trimmed) return;
	tasks.unshift({id: Date.now().toString(), text: trimmed, completed: false});
	input.value = '';
	render();
}

function toggleComplete(id){
	const t = tasks.find(x => x.id === id);
	if(!t) return;
	t.completed = !t.completed;
	render();
}

function deleteTask(id){
	tasks = tasks.filter(t => t.id !== id);
	render();
}

function startEdit(id){
	const li = document.querySelector(`li[data-id="${id}"]`);
	if(!li) return;
	li.classList.add('editing');
	const inputEl = li.querySelector('.task-edit');
	inputEl.focus();
	inputEl.select();
}

function finishEdit(id, value){
	const t = tasks.find(x => x.id === id);
	if(!t) return;
	const v = value.trim();
	if(!v) {
		deleteTask(id);
		return;
	}
	t.text = v;
	render();
}

function clearCompleted(){
	tasks = tasks.filter(t => !t.completed);
	render();
}

form.addEventListener('submit', e => {
	e.preventDefault();
	addTask(input.value);
});

filters.forEach(btn => btn.addEventListener('click', e => {
	filters.forEach(b => b.classList.remove('active'));
	e.target.classList.add('active');
	filter = e.target.dataset.filter;
	render();
}));

clearBtn.addEventListener('click', clearCompleted);

// initial render
render();

