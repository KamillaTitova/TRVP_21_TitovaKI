export default class Task {
	#taskID = '';
	#taskText = '';
	#taskPosition = -1;
	#taskMass = 0
	#taskDistrict = ''
	#taskAdress = ''

	constructor({
		taskID = null,
		text,
		position,
		mass,
		district,
		adress
	}) {
		this.#taskID = taskID || crypto.randomUUID();
		this.#taskText = text;
		this.#taskPosition = position
		this.#taskMass = mass
		this.#taskDistrict = district
		this.#taskAdress = adress
	}

	get taskID() { return this.#taskID; }

	get taskText() { return this.#taskText; }
	set taskText(value) {
		if (typeof value === 'string') {
		this.#taskText = value;
		}
	}
	
	get taskDistrict() { return this.#taskDistrict; }
	set taskDistrict(value) {
		if (typeof value === 'string') {
		this.#taskDistrict = value;
		}
	}

	get taskAdress() { return this.#taskAdress; }
	set taskAdress(value) {
		if (typeof value === 'string') {
		this.#taskAdress = value;
		}
	}

	get taskPosition() { return this.#taskPosition; }
	set taskPosition(value) {
		if (typeof value === 'number' && value >= 0) {
			this.#taskPosition = value;
		}
	}

	get taskMass() { return this.#taskMass; }
	set taskMass(value) {
		if (typeof value === 'number' && value >= 0) {
			this.#taskMass = value;
		}
	}
// TODO: Rework
	render() {
		const liElement = document.createElement('li');
		liElement.classList.add('courier__tasks-list-item', 'task');
		liElement.setAttribute('id', this.#taskID);
		liElement.setAttribute('draggable', true);
		liElement.addEventListener('dragstart', (evt) => {
			evt.target.classList.add('task_selected');
			localStorage.setItem('movedTaskID', this.#taskID);
		});
		liElement.addEventListener('dragend', (evt) => evt.target.classList.remove('task_selected'));

		const span = document.createElement('span');
		span.classList.add('task__text');
		span.innerHTML = this.#taskText;
		liElement.appendChild(span);

		const span1 = document.createElement('span');
		span1.classList.add('task__text');
		span1.innerHTML = this.#taskDistrict;
		liElement.appendChild(span1);

		const span2 = document.createElement('span');
		span2.classList.add('task__text');
		span2.innerHTML = this.#taskAdress;
		liElement.appendChild(span2);

		const span3 = document.createElement('span');
		span3.classList.add('task__text');
		span3.innerHTML = this.#taskMass;
		liElement.appendChild(span3);

		const controlsDiv = document.createElement('div');
		controlsDiv.classList.add('task__controls');

		const lowerRowDiv = document.createElement('div');
		lowerRowDiv.classList.add('task__controls-row');

		// const editBtn = document.createElement('button');
		// editBtn.setAttribute('type', 'button');
		// editBtn.classList.add('task__contol-btn', 'edit-icon');
		// editBtn.addEventListener('click', () => {
		// 	localStorage.setItem('editTaskID', this.#taskID)
		// 	document.getElementById('modal-edit-task').showModal()
		// });
		// lowerRowDiv.appendChild(editBtn);

		const deleteBtn = document.createElement('button');
		deleteBtn.setAttribute('type', 'button');
		deleteBtn.classList.add('task__contol-btn', 'delete-icon');
		deleteBtn.addEventListener('click', () => {
			localStorage.setItem('deleteTaskID', this.#taskID)
			const deleteTaskModal = document.getElementById('modal-delete-task')
			deleteTaskModal.querySelector('.app-modal__question')
				.innerHTML = `Задание '${this.#taskText}' будет удалено. Прододлжить?`
			
			deleteTaskModal.showModal()
		});
		lowerRowDiv.appendChild(deleteBtn);

		controlsDiv.appendChild(lowerRowDiv);

		liElement.appendChild(controlsDiv);

		return liElement;
	}
};
