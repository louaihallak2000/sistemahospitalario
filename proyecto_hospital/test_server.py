from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/test")
def test():
    return {"status": "ok", "message": "Backend funcionando"}

if __name__ == "__main__":
    import uvicorn
    print("🚀 Iniciando servidor de prueba...")
    uvicorn.run(app, host="127.0.0.1", port=8000) 