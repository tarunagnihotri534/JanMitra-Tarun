@echo off
echo ========================================
echo    JanMitra - View Stored Form Data
echo ========================================
echo.

cd /d "%~dp0"

python -c "import sqlite3, json; conn = sqlite3.connect('janmitra.db'); cursor = conn.cursor(); cursor.execute('SELECT * FROM submissions ORDER BY id DESC'); rows = cursor.fetchall(); print('\n=== ALL FORM SUBMISSIONS ===\n'); [print(f'ID: {row[0]}\nForm Type: {row[1]}\nData: {json.loads(row[2])}\nSubmitted: {row[3]}\n' + '-'*60) for row in rows]; print(f'\nTotal Submissions: {len(rows)}'); conn.close()"

echo.
echo ========================================
pause
