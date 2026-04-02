import sqlite3
import json

conn = sqlite3.connect('janmitra.db')
conn.row_factory = sqlite3.Row
rows = conn.execute('SELECT * FROM submissions ORDER BY id DESC').fetchall()

print(f"Total submissions: {len(rows)}")
for r in rows:
    print(f"\n--- ID: {r['id']} | Type: {r['form_type']} | Time: {r['timestamp']} ---")
    print(json.dumps(json.loads(r['form_data']), indent=2, ensure_ascii=False))

conn.close()
