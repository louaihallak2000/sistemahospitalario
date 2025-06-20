from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

# Configurar conexión
db_path = os.path.join(os.path.dirname(__file__), "hospital_db.sqlite")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{db_path}"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

db = SessionLocal()

# Verificar episodios
from app.models.episodio import Episodio
episodios = db.query(Episodio).all()
print(f"Total episodios en DB: {len(episodios)}")

for ep in episodios[:3]:  # Primeros 3
    print(f"- ID: {ep.id}, Estado: {ep.estado}, Hospital: {ep.hospital_id}")
    print(f"  datos_json type: {type(ep.datos_json)}")
    print(f"  datos_json value: {ep.datos_json}")

db.close() 