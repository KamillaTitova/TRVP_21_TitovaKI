export default class AppModel {
    static async getCouriers()  {
        try {
            const couriersResponse = await fetch('http://localhost:8080/couriers')
            const couriersBody = await couriersResponse.json()

            if (couriersResponse.status !== 200) {
                return Promise.reject(couriersBody)
            }

            return couriersBody.couriers
        } catch(err) {
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            })
        }
    }

    static async addCourier({courierID, name, district})  {
        try {
            const addCourierResponse = await fetch('http://localhost:8080/couriers', {
                method: 'POST',
                body: JSON.stringify({courierID, name, district}),
                headers: {
                    'Content-type': 'application/json'
                }
            })

            if (addCourierResponse.status !== 200) {
                const addCourierBody = await addCourierResponse.json()
                return Promise.reject(addCourierBody)
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Курьер ${name} был успешно добавлен`
            }
        } catch(err) {
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            })
        }
    }

    static async addTask({taskID, text, mass, district, adress, courierID})  {
        try {
            const addTaskResponse = await fetch('http://localhost:8080/tasks', {
                method: 'POST',
                body: JSON.stringify({taskID, text, mass, district, adress, courierID}),
                headers: {
                    'Content-type': 'application/json'
                }
            })

            if (addTaskResponse.status !== 200) {
                const addTaskBody = await addTaskResponse.json()
                return Promise.reject(addTaskBody)
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Задание ${text} было успешно добавлено`
            }
        } catch(err) {
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            })
        }
    }

    static async updateCourier({courierID, name, district}) {
        try {
            const updateCourierResponse = await fetch(`http://localhost:8080/couriers/${courierID}`, {
                method: 'PATCH',
                body: JSON.stringify({name, district}),
                headers: {
                    'Content-type': 'application/json'
                }
            })

            if (updateCourierResponse.status !== 200) {
                const updateCourierBody = await updateCourierResponse.json()
                return Promise.reject(updateCourierBody)
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Курьер ${name} был успешно изменен`
            }
        } catch(err) {
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            })
        }
    }

    static async deleteTask({taskID})  {
        try {
            const deleteTaskResponse = await fetch(`http://localhost:8080/tasks/${taskID}`, {
                method: 'DELETE',
            })

            if (deleteTaskResponse.status !== 200) {
                const deleteTaskBody = await deleteTaskResponse.json()
                return Promise.reject(deleteTaskBody)
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Задание ${taskID} было успешно удалено`
            }
        } catch(err) {
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            })
        }
    }

    static async moveTask({taskID, srcCourierID, destCourierID})  {
        try {
            const moveTaskResponse = await fetch(`http://localhost:8080/couriers`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({taskID, srcCourierID, destCourierID})
            })

            if (moveTaskResponse.status !== 200) {
                const moveTaskBody = await moveTaskResponse.json()
                return Promise.reject(moveTaskBody)
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Задание ${taskID} было успешна перемещена`
            }
        } catch(err) {
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            })
        }
    }
}