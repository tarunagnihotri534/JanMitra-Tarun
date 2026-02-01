@echo off
cd /d "%~dp0"
echo Loading submissions from database...
if exist "backend\janmitra.db" (
    cd backend
    python -c "import sqlite3, json; conn = sqlite3.connect('janmitra.db'); cursor = conn.cursor(); cursor.execute('SELECT * FROM submissions ORDER BY id DESC'); rows = cursor.fetchall(); print('\n=== ALL SUBMISSIONS ===\n'); [print(f'ID: {row[0]} | Type: {row[1]} | Date: {row[3]}\nData: {json.loads(row[2])}\n' + '-'*50) for row in rows]; print(f'\nTotal: {len(rows)}'); conn.close()"
) else (
    echo Error: Could not find database file in backend folder.
    echo Current directory: %CD%
)
pause
