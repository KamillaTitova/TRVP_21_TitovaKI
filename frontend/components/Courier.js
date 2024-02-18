import Task from './Task';
import AppModel from '../model/AppModel';

export default class Courier {
	#tasks = [];
	#courierName = '';
	#courierID = '';
	#district = ''

	constructor({
		courierID = null,
		name,
		district,
		onDropTaskInCourier,
		addNotification
	}) {
		this.#courierName = name;
		this.#courierID = courierID || crypto.randomUUID();
		this.#district = district
		this.onDropTaskInCourier = onDropTaskInCourier;
		this.addNotification = addNotification
	}

	get courierID() { return this.#courierID; }

	get name() { return this.#courierName }
	set name(value) { 
		if (typeof value === 'string') {
			this.#courierName = value;
		}
	}
	get district() { return this.#district }
	set district(value) {
		if (typeof value === 'string') {
			this.#district = value;
		}
	}

	pushTask = ({ task }) => this.#tasks.push(task);

	getTaskById = ({ taskID }) => this.#tasks.find(task => task.taskID === taskID);

	getSumMass = () => {
		let count = 0
		for (let task of this.#tasks) {
			count += parseInt(task.taskMass)
		}
		return count
	}

	deleteTask = ({ taskID }) => {
		const deleteTaskIndex = this.#tasks.findIndex(task => task.taskID === taskID);

		if (deleteTaskIndex === -1) return;

		const [deletedTask] = this.#tasks.splice(deleteTaskIndex, 1);

		return deletedTask;
	};

	reorderTasks = () => {
		const orderedTasksIDs = Array.from(
			document.querySelector(`[id="${this.#courierID}"] .courier__tasks-list`).children,
			elem => elem.getAttribute('id')
		);

		orderedTasksIDs.forEach((taskID, position) => {
			this.#tasks.find(task => task.taskID === taskID).taskPosition = position;
		});
	};

	appendNewTask = async ({ text, district, adress, mass }) => {
		try {
			const taskID = crypto.randomUUID()
			const addTaskResult = await AppModel.addTask({
				taskID,
				text,
				mass, 
				district, 
				adress,
				courierID: this.#courierID
			})
			this.addNewTaskLocal({taskID, text, position: this.#tasks.length, mass, district, adress})
			this.addNotification({text: addTaskResult.message, type: 'success'})
		} catch(err) {
			this.addNotification({text: err.message, type: 'error'})
			console.error(err)
		}
	};


	addNewTaskLocal = ({ taskID = null, text, position, mass, district, adress }) => {
		const newTask = new Task({
			taskID,
			text,
			position,
			mass, 
			district, 
			adress
		});
		this.#tasks.push(newTask);

		const newTaskElement = newTask.render();
		document.querySelector(`[id="${this.#courierID}"] .courier__tasks-list`)
			.appendChild(newTaskElement);
	}
// Переработать, вставить значения 
	render() {
		const liElement = document.createElement('li');
		liElement.classList.add(
			'couriers-list__item',
			'courier'
		);
		liElement.setAttribute('id', this.#courierID);
		liElement.addEventListener(
			'dragstart',
			() => localStorage.setItem('srcCourierID', this.#courierID)
		);
		liElement.addEventListener('drop', this.onDropTaskInCourier);
		
		const divElement = document.createElement('div')
		divElement.classList.add('courier-list__item-header')

		const h2Element = document.createElement('span');
		h2Element.classList.add('courier__name');
		h2Element.innerHTML = this.#courierName;
		divElement.appendChild(h2Element);

		const pElement = document.createElement('span')
		pElement.classList.add('courier__district')
		pElement.innerHTML = this.#district
		divElement.appendChild(pElement)

		const editBtn = document.createElement('button');
		editBtn.setAttribute('type', 'button');
		editBtn.classList.add('courier__edit-btn', 'edit-icon');
		editBtn.addEventListener('click', () => {
			localStorage.setItem('editCourierID', this.#courierID)
			localStorage.setItem('district', this.#district)
			localStorage.setItem('tasksLength', this.#tasks.length)
			document.getElementById('modal-edit-courier').showModal()
		});
		divElement.appendChild(editBtn)
		liElement.appendChild(divElement)

		const innerUlElement = document.createElement('ul');
		innerUlElement.classList.add('courier__tasks-list');
		liElement.appendChild(innerUlElement);

		const button = document.createElement('button');
		button.setAttribute('type', 'button');
		button.classList.add('courier__add-task-btn');
		button.innerHTML = '&#10010; Добавить задание';
		button.addEventListener('click', () => {
			let count = 0
			for (let task of this.#tasks) {
				count += parseInt(task.taskMass)
			}
			if (count < 3) {
				localStorage.setItem('addTaskCourierID', this.#courierID)
				document.getElementById('modal-add-task').showModal()
			} else {
				this.addNotification({text: 'Нельлзя добавить задание, максимум 3', type:'error' })
			}
		});
		liElement.appendChild(button);

		const adderElement = document.querySelector('.courier-adder');
		adderElement.parentElement.insertBefore(liElement, adderElement);
	}
};
