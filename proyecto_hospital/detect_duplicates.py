import sys
import os
from collections import defaultdict

# Add the project root to the Python path to allow imports from 'app'
# This ensures that the script can find the necessary modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.paciente import Paciente
from app.models.episodio import Episodio
from app.models.hospital import Hospital
from app.models.usuario import Usuario

def find_duplicate_patients():
    """
    Connects to the database to detect and report duplicate patients based on their full name,
    ignoring case and leading/trailing whitespace.
    """
    db: Session = SessionLocal()
    try:
        all_patients = db.query(Paciente).all()
        
        # Group patients by their normalized full name to find duplicates
        grouped_by_name = defaultdict(list)
        for patient in all_patients:
            if patient.nombre_completo:
                # Normalize the name for accurate comparison
                normalized_name = patient.nombre_completo.strip().lower()
                grouped_by_name[normalized_name].append(patient)
        
        print("="*60)
        print("      Análisis de Pacientes Duplicados por Nombre")
        print("="*60)
        
        duplicates_found = False
        for normalized_name, patients_list in grouped_by_name.items():
            if len(patients_list) > 1:
                if not duplicates_found:
                    print("Se han detectado los siguientes pacientes duplicados:")
                    duplicates_found = True
                
                print(f"\n--- Paciente Duplicado Encontrado ---")
                # Display the original name from the first record found
                print(f"Nombre Completo: '{patients_list[0].nombre_completo}'")
                print(f"Número de veces que aparece: {len(patients_list)}")
                print("Detalles de los registros:")
                for p in patients_list:
                    print(f"  - ID: {p.id} | DNI: {p.dni} | Fecha Creación: {p.fecha_creacion.strftime('%Y-%m-%d %H:%M:%S')}")
                
                print("\nSugerencia para Resolución:")
                print("  - Se recomienda fusionar estos registros en uno solo. Conserve el registro más antiguo o el que contenga la información más completa y actualizada.")
                print("  - Antes de eliminar, es crucial verificar que los IDs de los registros duplicados no estén siendo utilizados en la tabla de 'episodios' u otras tablas relacionadas para evitar inconsistencias en los datos.")

        if not duplicates_found:
            print("\n✅ No se encontraron pacientes duplicados por nombre completo en la base de datos.")
            
        print("\n" + "="*60)
        print("Análisis completado.")
        print("="*60)

    except Exception as e:
        print(f"\n❌ Error durante el análisis: {e}")
        print("  - Asegúrese de que la base de datos 'hospital_db.sqlite' exista y sea accesible.")
        print("  - Verifique que el script se está ejecutando desde el directorio 'proyecto_hospital'.")
    finally:
        db.close()

if __name__ == "__main__":
    find_duplicate_patients() 