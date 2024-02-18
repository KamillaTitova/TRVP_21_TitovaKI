-- TABLE creation 
CREATE TABLE couriers (
    id UUID PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    district VARCHAR(100) NOT NULL,
    tasks UUID[] DEFAULT '{}'
) IF NOT EXISTS;

CREATE TABLE tasks (
    id UUID PRIMARY KEY,
    text VARCHAR(100) NOT NULL,
    mass INTEGER NOT NULL,
    district VARCHAR(100) NOT NULL,
    adress VARCHAR(100) NOT NULL,
    courier_id UUID REFERENCES couriers
);

-- USER actions: SELECT, INSERT, UPDATE, DELETE
CREATE ROLE manager LOGIN ENCRYPTED PASSWORD 'admin';
GRANT SELECT, INSERT, UPDATE, DELETE ON couriers, tasks TO manager;

-- SQL queries
SELECT * FROM couriers ORDER BY id;
SELECT * FROM tasks ORDER BY courier_id;

INSERT INTO couriers (id, name, district) VALUES (<id>, <name>, <district>);

INSERT INTO tasks (id, text, mass, district, adress, courier_id) VALUES (<id>, <text>, <mass>, <district>, <adress>, <coureier_id>);
UPDATE couriers SET tasks = array_append(tasks, <task_id>) WHERE id = <courier_id>;

UPDATE couriers SET name = <name>, district = <district> WHERE id = <id>;

SELECT courier_id FROM tasks WHERE id = <task_id>
UPDATE couriers SET tasks = array_remove(tasks, <task_id>) WHERE id = <courier_id>;
DELETE FROM tasks WHERE id = <task_id>;

UPDATE tasks SET courier_id = <dest_courier_id> WHERE id = <task_id>
UPDATE couriers SET tasks = array_append(tasks, <task_id>) WHERE id = <dest_courier_id>;
UPDATE couriers SET tasks = array_remove(tasks, <task_id>) WHERE id = <src_courier_id>;
