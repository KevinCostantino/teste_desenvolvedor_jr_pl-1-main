import sys
from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel
from app import *
import requests


# Carregar variáveis de ambiente
load_dotenv()


# Configurar caminho
sys.path.append("./app")
from services.llm_service import LLMService

# Inicializar FastAPI
app = FastAPI()
llm_service = LLMService()

# Modelo para entrada de texto
class TextData(BaseModel):
    text: str
    lang: str


# Função para resumir um texto de diferentes formas (supostamente) depedendo do idioma escolhido
def summarize_text(text: str,lang: str) -> str: # type: ignore
    if lang == "pt":
        prompt = "Escreva de forma resumida em português o seguinte texto: "
        full_text = prompt + text
        return  llm_service.summarize_text(full_text)
    elif lang == "en":
        prompt = "Escreva de forma resumida em inglês o seguinte texto:  "
        full_text = prompt + text
        return  llm_service.summarize_text(full_text) 
    elif lang == "es":
        prompt = "Escreva de forma resumida em espanhol o seguinte texto:  "
        full_text = prompt + text
        return  llm_service.summarize_text(full_text) 





# Endpoint FastAPI para resumir textos
@app.post("/summarize")
async def summarize(request: TextData):
    text = request.text
    lang = request.lang
    print(f"Texto recebido: {text}")  # Log para debug

    # Gerar resumo
    summary = summarize_text(text,lang)
    print(f"Resumo gerado: {summary}")  # Log para debug
    return {"summary": summary}


def process_tasks():
    # Obter todas as tarefas
    response = requests.get("http://localhost:3005/tasks")

    # Verificar se a resposta foi bem-sucedida
    if response.status_code != 200:
        print(f"Erro ao obter tarefas: {response.status_code}")
        return

    # Processar cada tarefa
    tasks = response.json()
    for task in tasks:
        try:
            task_id = task.get("id")
            text = task.get("text", "")
            lang = task.get("lang", "")

            # Validar se o texto existe
            if not text:
                print(f"Tarefa {task_id} não contém texto. Ignorando...")
                continue

            # Gerar resumo
            summary = summarize_text(text,lang)

            # Atualizar a tarefa no servidor
            update_response = requests.put(
                f"http://localhost:3005/tasks/{task_id}",
                json={"summary": summary}
            )

            # Verificar se a atualização foi bem-sucedida
            if update_response.status_code == 200:
                print(f"Tarefa {task_id} atualizada com sucesso.")
            else:
                print(f"Erro ao atualizar tarefa {task_id}: {update_response.status_code}")

        except Exception as e:
            print(f"Erro ao processar tarefa {task.get('id')}: {e}")



if __name__ == "__main__":
    import uvicorn

    # Iniciar o servidor FastAPI
    uvicorn.run(app, host="0.0.0.0", port=8000)

    # Processar tarefas
    process_tasks()