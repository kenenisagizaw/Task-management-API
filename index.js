const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, "tasks.json");

app.use(express.json());

let tasks = [];
let currentId = 1;

// Load tasks from file (if exists)
function loadTasks() {
  if (fs.existsSync(DATA_FILE)) {
    const jsonData = fs.readFileSync(DATA_FILE, "utf-8");
    tasks = JSON.parse(jsonData);
    if (tasks.length > 0) {
      currentId = Math.max(...tasks.map(t => t.id)) + 1;
    }
  }
}

// Save tasks to file
function saveTasks() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
}

// Initial load
loadTasks();

// GET /api/tasks
app.get("/api/tasks", (req, res) => {
  res.json(tasks);
});

// POST /api/tasks
app.post("/api/tasks", (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ message: "Task title is required" });

  const newTask = { id: currentId++, title, completed: false };
  tasks.push(newTask);
  saveTasks();
  res.status(201).json(newTask);
});

// PUT /api/tasks/:id
app.put("/api/tasks/:id", (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ message: "Task not found" });

  task.completed = true;
  saveTasks();
  res.json(task);
});

// DELETE /api/tasks/:id
app.delete("/api/tasks/:id", (req, res) => {
  const taskIndex = tasks.findIndex(t => t.id === parseInt(req.params.id));
  if (taskIndex === -1) return res.status(404).json({ message: "Task not found" });

  const deleted = tasks.splice(taskIndex, 1);
  saveTasks();
  res.json(deleted[0]);
});

// Home page
app.get("/", (req, res) => {
  res.send(`<h1>Task API is running</h1>`);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
