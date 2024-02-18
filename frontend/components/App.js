import Courier from './Courier';
import AppModel from '../model/AppModel'


export default class App {
	#couriers = [];

	onEscapeKeydown = (event) => {
		if (event.key === 'Escape') {
			const input = document.querySelector('.courier-adder__input');
			input.style.display = 'none';
			input.value = '';

			document.querySelector('.courier-adder__btn')
			.style.display = 'inherit';
		}
	};

	// onInputKeydown = async (event) => {
	// 	if (event.key !== 'Enter') return;

	// 	if (event.target.value) {
	// 		const courierID = crypto.randomUUID()

	// 		try {
	// 			const addCourierResult = await AppModel.addCourier({
	// 			courierID,
	// 			name: event.target.value,
	// 			position: this.#couriers.length
	// 			})

	// 			const newCourier = new Courier({
	// 				courierID,
	// 				name: event.target.value,
	// 				onDropTaskInCourier: this.onDropTaskInCourier,
	// 				addNotification: this.addNotification
	// 			})

	// 			this.#couriers.push(newCourier)
	// 			newCourier.render()
				
	// 			this.addNotification({text: addCourierResult.message, type: 'success'})
	// 		} catch(err) {
	// 			this.addNotification({text: err.message, type: 'error'})
	// 			console.error(err)
	// 		}
	// 	}

	// 	event.target.style.display = 'none';
	// 	event.target.value = '';

	// 	document.querySelector('.courier-adder__btn')
	// 	.style.display = 'inherit';
	// };

	onDropTaskInCourier = async (evt) => {
		evt.stopPropagation();

		const destCourierElement = evt.currentTarget;
		destCourierElement.classList.remove('courier_droppable');

		const movedTaskID = localStorage.getItem('movedTaskID');
		const srcCourierID = localStorage.getItem('srcCourierID');
		const destCourierID = destCourierElement.getAttribute('id');

		localStorage.setItem('movedTaskID', '');
		localStorage.setItem('srcCourierID', '');

		if (!destCourierElement.querySelector(`[id="${movedTaskID}"]`)) return;

		const srcCourier = this.#couriers.find(courier => courier.courierID === srcCourierID);
		const destCourier = this.#couriers.find(courier => courier.courierID === destCourierID);
		const fTask = srcCourier.getTaskById({taskID: movedTaskID})
		if (fTask.taskDistrict === destCourier.district) {
			if (parseInt(destCourier.getSumMass()) + parseInt(fTask.taskMass) <= 3) {
				try {
					if (srcCourierID !== destCourierID) {
						await AppModel.moveTask({ taskID: movedTaskID, srcCourierID, destCourierID })

						const movedTask = srcCourier.deleteTask({ taskID: movedTaskID });
						destCourier.pushTask({ task: movedTask });

						srcCourier.reorderTasks();
					}

					destCourier.reorderTasks()
					this.addNotification({text: `Задание  ${movedTaskID} перемещена между курьерами`, type: 'success'})
				} catch(err) {
					this.addNotification({text: err.message, type: 'error'})
					console.error(err)
				}
			} else {
				alert('Количество заданий превышено')
				location.reload()
				this.addNotification({text: 'Количество заданий превышено', type: 'error'})
			}
		} else {
			alert('Нельзя добавить задание с другим регионом курьеру')
			location.reload()
			setTimeout(() => 5000)
			this.addNotification({text: 'Нельзя добавить задание с другим регионом курьеру', type: 'error'})
		}
	};
// TODO: сделать изменение курьера !!!
	editCourier = async ({ courierID, newName, newDistrict}) => {
		let fCourier = null;
		fCourier = this.#couriers.find(courier => courier.courierID === courierID);

		const curCourierName = fCourier.name;

		if (!curCourierName || newName === curCourierName) return;

		try {
			const updateCourierResult = await AppModel.updateCourier({courierID, name: newName, district: newDistrict})

			fCourier.name = newName
			fCourier.district = newDistrict
			document.querySelector(`[id="${courierID}"] span.courier__name`).innerHTML = newName;
			document.querySelector(`[id="${courierID}"] span.courier__district`).innerHTML = newDistrict;
		} catch(err) {
			this.addNotification({text: err.message, type: 'error'})
			console.error(err)
		}
	};

	deleteTask = async ({ taskID }) => {
		let fTask = null;
		let fCourier = null;
		for (let courier of this.#couriers) {
			fCourier = courier;
			fTask = courier.getTaskById({ taskID });
			if (fTask) break;
		}

		try {
			const deleteTaskResult = await AppModel.deleteTask({ taskID })
			fCourier.deleteTask({ taskID })
			document.getElementById(taskID).remove();
			this.addNotification({text: deleteTaskResult.message, type: 'success'})
		} catch(err) {
			this.addNotification({text: err.message, type: 'error'})
			console.error(err)
		}
	};

	initAddCourierModal() {
		const AddCourierModal = document.getElementById('modal-add-courier')

		const cancelHandler = () => {
			AddCourierModal.close()
			AddCourierModal.querySelector('.app-modal__input').value = ''
		}

		const okHandler = async () => {
			const courierID = crypto.randomUUID()
			const modalInput = document.getElementById('modal-add-courier-input')
			const modalSelector = document.getElementById('modal-add-courier-selector')
			if (modalInput.value && modalSelector.value) {
				try {
					const addCourierResult = await AppModel.addCourier({
						courierID,
						name: modalInput.value,
						district: modalSelector.value,
					})
	
					const newCourier = new Courier({
						courierID,
						name: modalInput.value,
						district: modalSelector.value,
						onDropTaskInCourier: this.onDropTaskInCourier,
						addNotification: this.addNotification
					})
	
					this.#couriers.push(newCourier)
					newCourier.render()
					
					this.addNotification({text: addCourierResult.message, type: 'success'})
				} catch(err) {
					this.addNotification({text: err.message, type: 'error'})
					console.error(err)
				}
			}
			cancelHandler()
		}

		AddCourierModal.querySelector('.modal-ok-btn').addEventListener('click', okHandler)
		AddCourierModal.querySelector('.modal-cancel-btn').addEventListener('click', cancelHandler)
		AddCourierModal.addEventListener('close', cancelHandler)
	}

	initAddTaskModal() {
		const addTaskModal = document.getElementById('modal-add-task')

		const cancelHandler = () => {
			addTaskModal.close()
			localStorage.setItem('addTaskCourierID', '')
			addTaskModal.querySelector('.app-modal__input').value = ''
			document.getElementById('modal-add-task-input-adress').value = ''
		}

		const okHandler = () => {
			const courierID = localStorage.getItem('addTaskCourierID')
			const modalInput = document.getElementById('modal-add-task-input')
			const modalAdress = document.getElementById('modal-add-task-input-adress')
			const modalMass = document.getElementById('modal-add-task-selector-mass')
			const modalDistrict = document.getElementById('modal-add-task-selector')
			const courier = this.#couriers.find(courier => courier.courierID === courierID)
			const summ = courier.getSumMass()
			if (summ + parseInt(modalMass.value) <= 3) { 
				if (modalDistrict.value === courier.district) {
					if (courierID && modalInput.value && modalAdress.value && modalMass.value && modalDistrict.value) {
						this.#couriers.find(courier => courier.courierID === courierID)
							.appendNewTask({text: modalInput.value, district: modalDistrict.value, adress: modalAdress.value, mass: modalMass.value})

					}
				} else {
					this.addNotification({text: 'Невозможно добавить задание с другим районом'})
				}
			} else {
				this.addNotification({text: 'Невозможно добавить задание, максимум вес - 3'})
			}
			cancelHandler()
		}

		addTaskModal.querySelector('.modal-ok-btn').addEventListener('click', okHandler)
		addTaskModal.querySelector('.modal-cancel-btn').addEventListener('click', cancelHandler)
		addTaskModal.addEventListener('close', cancelHandler)
	}

	initEditCourierModal() {
		const editCourierModal = document.getElementById('modal-edit-courier')

		const cancelHandler = () => {
			editCourierModal.close()
			localStorage.setItem('editTaskID', '')
			editCourierModal.querySelector('.app-modal__input').value = ''
		}

		const okHandler = () => {
			const courierID = localStorage.getItem('editCourierID')
			const Cdistrict = localStorage.getItem('district')
			const tasksLength = localStorage.getItem('tasksLength')
			const modalInput = document.getElementById('modal-edit-courier-input')
			const modalSelector = document.getElementById('modal-edit-courier-selector')
			console.log(tasksLength)
			if (courierID && modalInput.value) {
				if (tasksLength === '0') {
					console.log('here')
					this.editCourier({courierID, newName: modalInput.value, newDistrict: modalSelector.value})
				} else if ((modalSelector.value === Cdistrict && tasksLength !== '0')) {
					this.editCourier({courierID, newName: modalInput.value, newDistrict: modalSelector.value})
				} else {
					alert('Нельзя изменить район курьера если у него есть задания')
				}

			}
			cancelHandler()
		}

		editCourierModal.querySelector('.modal-ok-btn').addEventListener('click', okHandler);
		editCourierModal.querySelector('.modal-cancel-btn').addEventListener('click', cancelHandler);
		editCourierModal.addEventListener('close', cancelHandler)
	}

	initDeleteTaskModal() {
		const deleteTaskModal = document.getElementById('modal-delete-task')

		const cancelHandler = () => {
			deleteTaskModal.close()
			localStorage.setItem('deleteTaskID', '')
		}

		const okHandler = () => {
			const taskID = localStorage.getItem('deleteTaskID')

			if (taskID) {
				this.deleteTask({taskID})

			}
			cancelHandler()
		}

		deleteTaskModal.querySelector('.modal-ok-btn').addEventListener('click', okHandler);
		deleteTaskModal.querySelector('.modal-cancel-btn').addEventListener('click', cancelHandler);
		deleteTaskModal.addEventListener('close', cancelHandler)
	}

	initNotifications() {
		const notifications = document.getElementById('app-notifications')
		notifications.show()

	}

	addNotification = ({ text, type }) => {
		const notifications = document.getElementById('app-notifications')

		const notificationID = crypto.randomUUID()
		const notification = document.createElement('div')
		notification.classList.add(
			'notification',
			type === 'success' ? 'notification-success' : 'notification-error'
		)
		notification.setAttribute('id', notificationID)
		notification.innerHTML = text

		notifications.appendChild(notification)

		setTimeout(() => { document.getElementById(notificationID).remove()}, 5000)
	}

	async init() {
		document.querySelector('.courier-adder__btn')
		.addEventListener(
			'click',
			(event) => {
				document.getElementById('modal-add-courier').showModal()
				// event.target.style.display = 'none';

				// // const input = document.querySelector('.courier-adder__input');
				// input.style.display = 'inherit';
				// input.focus();
			}
		);

		document.addEventListener('keydown', this.onEscapeKeydown);

		// document.querySelector('.courier-adder__input')
		// 	.addEventListener('keydown', this.onInputKeydown);

		// document.getElementById('theme-switch')
		// 	.addEventListener('change', (evt) => {
		// 		(evt.target.checked
		// 			? document.body.classList.add('dark-theme')
		// 			: document.body.classList.remove('dark-theme'));
		// });

		this.initAddTaskModal()
		this.initEditCourierModal()
		this.initDeleteTaskModal()
		this.initNotifications()
		this.initAddCourierModal()

		document.addEventListener('dragover', (evt) => {
			evt.preventDefault();

			const draggedElement = document.querySelector('.task.task_selected');
			const draggedElementPrevList = draggedElement.closest('.courier');

			const currentElement = evt.target;
			const prevDroppable = document.querySelector('.courier_droppable');
			let curDroppable = evt.target;
			while (!curDroppable.matches('.courier') && curDroppable !== document.body) {
				curDroppable = curDroppable.parentElement;
			}

			if (curDroppable !== prevDroppable) {
				if (prevDroppable) prevDroppable.classList.remove('courier_droppable');

				if (curDroppable.matches('.courier')) {
					curDroppable.classList.add('courier_droppable');
				}
			}

			if (!curDroppable.matches('.courier') || draggedElement === currentElement) return;

			if (curDroppable === draggedElementPrevList) {
				if (!currentElement.matches('.task')) return;

				const nextElement = (currentElement === draggedElement.nextElementSibling)
					? currentElement.nextElementSibling
					: currentElement;

				curDroppable.querySelector('.courier__tasks-list')
					.insertBefore(draggedElement, nextElement);

				return;
			}

			if (currentElement.matches('.task')) {
				curDroppable.querySelector('.courier__tasks-list')
					.insertBefore(draggedElement, currentElement);

				return;
			}

			if (!curDroppable.querySelector('.courier__tasks-list').children.length) {
				curDroppable.querySelector('.courier__tasks-list')
					.appendChild(draggedElement);
			}
		});
		try {
			const couriers = await AppModel.getCouriers()
			for (const courier of couriers) {
				const courierObj = new Courier({
					courierID: courier.courierID,
					name: courier.name,
					district: courier.district,
					onDropTaskInCourier: this.onDropTaskInCourier,
					addNotification: this.addNotification
				})

				this.#couriers.push(courierObj)
				courierObj.render()

				let i = 0
				for (const task of courier.tasks) {
					courierObj.addNewTaskLocal({
						taskID: task.taskID,
						text: task.text,
						position: i,
						mass: task.mass,
						district: task.district,
						adress: task.adress
					})
					i += 1
				}
			}
		} catch(error) {
			this.addNotification({text: error.message, type: 'error'})
			console.error(error)
		}
	}
};
