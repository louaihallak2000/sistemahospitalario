import sqlite3

conn = sqlite3.connect('hospital_db.sqlite')
cursor = conn.cursor()

print("Estructura tabla episodios:")
cursor.execute('PRAGMA table_info(episodios)')
for row in cursor.fetchall():
    print(f"  {row}")

print("\nPrimeros 3 episodios:")
cursor.execute('SELECT * FROM episodios LIMIT 3')
for row in cursor.fetchall():
    print(f"  {row}")

conn.close() 