import express, { Router, Request, Response } from "express";
import { TasksRepository } from "../repositories/tasksRepository";
import axios from 'axios';

const router = Router();
const tasksRepository = new TasksRepository();
const app = express();

app.use(express.json());

// POST: Cria uma tarefa e solicita resumo ao serviço Python
router.post("/", async (req: Request, res: Response) => {
  try {
    const { text, lang } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Campo "text" é obrigatório.' });
  
    }
    if (!lang) {
      return res.status(400).json({ error: 'Campo "lang" é obrigatório.' });
  
    }else if (lang !== 'pt' && lang !== 'en' && lang !== 'es') {
      return res.status(400).json({ error: 'Language not supported.' });
    }
    // Chamar o serviço Python
    const pythonResponse = await axios.post("http://127.0.0.1:8000/summarize", { text ,lang});

    // Obter o resumo retornado
    const resumo = pythonResponse.data.summary;
    const summary = resumo;

    // Cria a "tarefa"
    const task = tasksRepository.createTask(text,lang);

    // Atualiza a tarefa com o resumo
    tasksRepository.updateTask(task.id, summary);

    return res.status(201).json({
      message: "Tarefa criada com sucesso!",
      task: tasksRepository.getTaskById(task.id),
    });
  } catch (error) {
    console.error("Erro ao criar tarefa:", error);
    return res
      .status(500)
      .json({ error: "Ocorreu um erro ao criar a tarefa." });
  }
});

app.post("/summarize", async (req: Request, res: Response) => {
  try {
      const { text } = req.body;

      // Chamar o serviço Python
      const pythonResponse = await axios.post("http://127.0.0.1:8000/summarize", { text });

      // Obter o resumo retornado
      const summary = pythonResponse.data.summary;

      // Retornar o resumo para o cliente
      res.json({ summary });
  } catch (error) {
      console.error("Erro ao conectar com o serviço Python:", error);
      res.status(500).json({ error: "Erro ao processar o texto" });
  }
});

// GET: Lista todas as tarefas
router.get('/', (req, res) => {
  const tasks = tasksRepository.getAllTasks();
  return res.status(200).json({ 
    message: "API is running",
    tasks });
  });
// GET: Lista todas as tarefas
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  return res.status(201).json({
    message: "Task ID:"+id+" selecionada!",
    task: tasksRepository.getTaskById(id),
  });
});
router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const summary = req.body.summary;
  tasksRepository.updateTask(id, summary);
  return res.status(200).json({ message: 'Tarefa atualizada com sucesso!' });
});
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  console.log(id);  
  tasksRepository.deleteTasks(id);
  return res.status(201).json({
    message: "Task ID:"+id+" removida com sucesso!",
    task: tasksRepository.getTaskById(id),
  });
});


;

export default router;
