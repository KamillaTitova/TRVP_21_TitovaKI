import pg from 'pg'

export default class DB {
    #dbClient = null
    #dbHost = ''
    #dbPort = ''
    #dbName = ''
    #dbLogin = ''
    #dbPassword = ''

    constructor() {
        this.#dbHost = process.env.DB_HOST
        this.#dbPort = process.env.DB_PORT
        this.#dbName = process.env.DB_NAME
        this.#dbLogin = process.env.DB_LOGIN
        this.#dbPassword = process.env.DB_PASSWORD

        this.#dbClient = new pg.Client({
            user: this.#dbLogin,
            password: this.#dbPassword,
            host: this.#dbHost,
            port: this.#dbPort,
            database: this.#dbName
        })
    }

    async connect() {
        try {
            await this.#dbClient.connect()
            console.log('DB connection established')
        } catch(error) {
            console.error('Unable to connect to DB: ', error)
            return Promise.reject(error)
        }
    }

    async disconnect() {
        await this.#dbClient.end()
        console.log('DB disconected')
    }

    async getCouriers () {
        try {
            const couriers = await this.#dbClient.query(
                'SELECT * FROM couriers ORDER BY id;'
                )
                return couriers.rows
        } catch(error) {
            console.error('Unable to get couriers: ', error);
            return Promise.reject({
                type: 'internal',
                error
            })
        }
    }

    async getTasks () {
        try {
            const tasks = await this.#dbClient.query(
                'SELECT * FROM tasks ORDER BY courier_id'
                )
                return tasks.rows
        } catch(error) {
            console.error('Unable to get tasks: ', error);
            return Promise.reject({
                type: 'internal',
                error
            })
        }
    }

    async addCourier({ courierID, name, district = ''} = {courierID: null, name: '', district: ''}) {
        if (!courierID || !name || !district) {
            const errMsg = 'Add courier error: wrong params'
            console.error(errMsg)
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            })
        }
        try {
            await this.#dbClient.query(
                'INSERT INTO couriers (id, name, district) VALUES ($1, $2, $3);',
                [courierID, name, district]
                )
        } catch(error) {
            console.error('Unable to add courier: ', error);
            return Promise.reject({
                type: 'internal',
                error
            })
        }
    }

    async addTask({ 
        taskID, 
        text,
        mass = -1,
        district = '',
        adress = '',
        courierID
    } = {
        taskID: null, 
        text: '',
        mass: -1, 
        district: '',
        adress: '',
        courierID: null
    }) {
        if (!taskID || !text || mass <= 0 || !district || !adress || !courierID) {
            const errMsg = `Add task error: wrong params ${taskID}, ${text}, ${mass}, ${district}, ${adress}, ${courierID}`
            console.error(errMsg)
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            })
        }
        try {
            await this.#dbClient.query(
                'INSERT INTO tasks (id, text, mass, district, adress, courier_id) VALUES ($1, $2, $3, $4, $5, $6);',
                [taskID, text, mass, district, adress, courierID]
                )
            await this.#dbClient.query(
                'UPDATE couriers SET tasks = array_append(tasks, $1) WHERE id = $2;',
                [taskID, courierID]
                )
        } catch(error) {
            console.error('Unable to add task: ', error);
            return Promise.reject({
                type: 'internal',
                error
            })
        }
    }

    async updateCourier({courierID, name, district = ''} = {courierID: null, name: '', district: ''}) {
        console.log(courierID)
        console.log(name)
        console.log(district)
        if (!courierID || (!name && !district)) {
            const errMsg = 'Update courier error: wrong params'
            console.error(errMsg)
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            })
        }
        let query = null
        const queryParams = []
        if (name && district) {
            query = 'UPDATE couriers SET name = $1, district = $2 WHERE id = $3;'
            queryParams.push(name, district, courierID)
        } else if (name) {
            query = 'UPDATE couriers SET name = $1 WHERE id = $2;'
            queryParams.push(name, courierID)
        } else {
            query = 'UPDATE couriers SET district = $1 WHERE id = $2;'
            queryParams.push(district, courierID)
        }

        try {
            await this.#dbClient.query(query, queryParams)
        } catch(error) {
            console.error('Unable to update courier: ', error);
            return Promise.reject({
                type: 'internal',
                error
            })
        }
    }

    async deleteTask({taskID} = {taskID: null}) {
        if (!taskID) {
            const errMsg = 'Delete task error: wrong params'
            console.error(errMsg)
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            })
        }
        try {
            const queryResult = await this.#dbClient.query(
                'SELECT courier_id FROM tasks WHERE id = $1;',
                [taskID]
            )
            const {courier_id: courierID} = queryResult.rows[0]

            await this.#dbClient.query(
                'DELETE FROM tasks WHERE id = $1;',
                [taskID]
                )
            await this.#dbClient.query(
                'UPDATE couriers SET tasks = array_remove(tasks, $1) WHERE id = $2;',
                [taskID, courierID]
                )
        } catch(error) {
            console.error('Unable to delete task: ', error);
            return Promise.reject({
                type: 'internal',
                error
            })
        }
    }

    async moveTask({taskID, srcCourierID, destCourierID} = {taskID: null, srcCourierID: null, destCourierID: null}) {
        if (!taskID || !srcCourierID || !destCourierID) {
            const errMsg = 'Move task error: wrong params'
            console.error(errMsg)
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            })
        }
        try {
            await this.#dbClient.query(
                'UPDATE tasks SET courier_id = $1 WHERE id = $2;',
                [destCourierID, taskID]
            )
            await this.#dbClient.query(
                'UPDATE couriers SET tasks = array_append(tasks, $1) WHERE id = $2;',
                [taskID, destCourierID]
                )
            await this.#dbClient.query(
                'UPDATE couriers SET tasks = array_remove(tasks, $1) WHERE id = $2;',
                [taskID, srcCourierID]
                )
        } catch(error) {
            console.error('Unable to move task: ', error);
            return Promise.reject({
                type: 'internal',
                error
            })
        }
    }
}