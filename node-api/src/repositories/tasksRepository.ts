import fs from 'fs';
import path from 'path';

interface Task {
  id: number;
  text: string;
  summary: string | null;
  lang: string;
}

export class TasksRepository {
  private tasks: Task[] = [];
  private filePath: string;

  //constructor para guardar as tarefas em um arquivo json
  constructor() {
    this.filePath = path.join(__dirname, 'tasks.json');
    this.loadTasksFromFile();
  }
  private currentId: number = 1;
  
  // Carrega as tarefas do arquivo JSON
  private loadTasksFromFile() {
    if (fs.existsSync(this.filePath)) {
      const data = fs.readFileSync(this.filePath, 'utf-8');
      this.tasks = JSON.parse(data);
    } else {
      this.saveTasksToFile();
    }
  }
    // Salva as tarefas no arquivo JSON
    private saveTasksToFile() {
      fs.writeFileSync(this.filePath, JSON.stringify(this.tasks, null, 2));
    }
  
    //criando tarefas
  createTask(text: string,lang: string): Task {
    const task: Task = {
      id: this.currentId++,
      text,
      summary: null,
      lang
    };
    this.tasks.push(task);
    this.saveTasksToFile();
    return task;
  }

  //atualizando tarefas (basicamente para atualizar o summary)
  updateTask(id: number, summary: string): Task | null {
    const taskIndex = this.tasks.findIndex(t => t.id === id);
    if (taskIndex > -1) {
      this.tasks[taskIndex].summary = summary;
      return this.tasks[taskIndex];
    }
    return null;
  }

  //procurar cada tarefa pelo seu id
  getTaskById(id: number): Task | null {
    return this.tasks.find(t => t.id === id) || null;
  }

  //mostrar todas as tarefas
  getAllTasks(): Task[] {
    return this.tasks;
  }

  //deletar alguma tarefa em especifico pelo id
  deleteTasks(id: number): Task | null {
    const taskIndex = this.tasks.findIndex(task => task.id === id);
  
    if (taskIndex === -1) {
      return null; // Tarefa não encontrada
    }
    this.saveTasksToFile();
    // Remove e retorna a tarefa removida
    return this.tasks.splice(taskIndex, 1)[id];
  }

}

