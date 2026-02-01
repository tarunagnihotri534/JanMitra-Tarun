import sys
try:
    import db
    print("db.py imported successfully")
except Exception as e:
    print(f"Error importing db.py: {e}")

try:
    import main
    print("main.py imported successfully")
except Exception as e:
    print(f"Error importing main.py: {e}")
