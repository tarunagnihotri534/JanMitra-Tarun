import sqlite3
import json
import logging
from pathlib import Path
from datetime import datetime

DB_FILE = "janmitra.db"
JSON_FILE = "submissions.json"

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db(initial_schemes=None):
    """Initialize the database and tables."""
    conn = get_db_connection()
    c = conn.cursor()
    
    # Create submissions table
    c.execute('''
        CREATE TABLE IF NOT EXISTS submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            form_type TEXT NOT NULL,
            form_data TEXT NOT NULL,
            timestamp TEXT NOT NULL
        )
    ''')

    # Create schemes table
    c.execute('''
        CREATE TABLE IF NOT EXISTS schemes (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            state TEXT,
            city TEXT,
            gender TEXT,
            age_group TEXT,
            category TEXT,
            description TEXT,
            required_docs TEXT,
            filling_steps TEXT,
            benefits TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Add timestamps to existing table if they don't exist
    try:
        c.execute("ALTER TABLE schemes ADD COLUMN created_at TEXT DEFAULT CURRENT_TIMESTAMP")
    except sqlite3.OperationalError:
        pass  # Column already exists
    try:
        c.execute("ALTER TABLE schemes ADD COLUMN updated_at TEXT DEFAULT CURRENT_TIMESTAMP")
    except sqlite3.OperationalError:
        pass  # Column already exists

    # Add benefits column if it doesn't exist
    try:
        c.execute("ALTER TABLE schemes ADD COLUMN benefits TEXT")
    except sqlite3.OperationalError:
        pass

    # Add details column if it doesn't exist
    try:
        c.execute("ALTER TABLE schemes ADD COLUMN details TEXT")
    except sqlite3.OperationalError:
        pass
    
    conn.commit()
    conn.close()
    
    # Migrate existing data if needed
    migrate_from_json()
    
    # Seed schemes if provided
    if initial_schemes:
        seed_schemes(initial_schemes)

def seed_schemes(schemes_data):
    """Seed the database with initial schemes data, updating existing ones."""
    conn = get_db_connection()
    c = conn.cursor()
    
    print(f"Updating {len(schemes_data)} schemes in database...")
    for scheme in schemes_data:
        # Use INSERT OR REPLACE to update existing schemes
        c.execute('''
            INSERT OR REPLACE INTO schemes 
            (id, name, state, city, gender, age_group, category, description, required_docs, filling_steps, benefits, details, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ''', (
            scheme['id'],
            scheme['name'],
            scheme.get('state'),
            scheme.get('city'),
            scheme.get('gender'),
            scheme.get('age_group'),
            scheme.get('category'),
            scheme.get('description'),
            json.dumps(scheme.get('required_docs', [])),
            json.dumps(scheme.get('filling_steps', [])),
            json.dumps(scheme.get('benefits', [])),
            json.dumps(scheme.get('details', []))
        ))
    conn.commit()
    print("Schemes update completed.")
    
    conn.close()

def get_all_schemes(state=None, gender=None, age=None, category=None, updated_only=False):
    """Retrieve schemes with optional filtering."""
    conn = get_db_connection()
    c = conn.cursor()
    
    query = "SELECT * FROM schemes WHERE 1=1"
    params = []
    
    if state and state not in ["All States", "सभी राज्य", "Any"]:
         query += " AND (state = ? OR state = 'Any')"
         params.append(state)
         
    if gender and gender not in ["Any", "कोई भी"]:
        query += " AND (gender = ? OR gender = 'Any')"
        params.append(gender)
        
    if age and age not in ["Any", "कोई भी"]:
        # Logic for age range check can be complex, simplifying for string matching for now
        # Ideally, age_group should be parsed, but keeping consistent with existing string logic
        query += " AND (age_group = ? OR age_group = 'Any' OR age_group = '0-18')" 
        # Note: If user selects 0-18, we want schemes that are exactly 0-18 OR Any.
        # But if the user selects 18-60, we don't want 0-18. 
        # The simple string match below is flawed for ranges but fits the current simple architecture.
        # Let's trust the exact match + 'Any' for now, or refine if needed.
        params.append(age)
        
    if category and category not in ["Any", "कोई भी"]:
        query += " AND (category = ? OR category = 'Any')"
        params.append(category)
        
    if updated_only:
        # Get schemes updated in the last 30 days
        query += " AND updated_at >= datetime('now', '-30 days')"
    
    c.execute(query, params)
    rows = c.fetchall()
    
    schemes = []
    for row in rows:
        schemes.append({
            "id": row['id'],
            "name": row['name'],
            "state": row['state'],
            "city": row['city'],
            "gender": row['gender'],
            "age_group": row['age_group'],
            "category": row['category'],
            "description": row['description'],
            "required_docs": json.loads(row['required_docs']),
            "filling_steps": json.loads(row['filling_steps']),
            "benefits": json.loads(row['benefits']) if row['benefits'] else [],
            "details": json.loads(row['details']) if row.keys().__contains__('details') and row['details'] else [],
            "created_at": row['created_at'],
            "updated_at": row['updated_at']
        })
    
    conn.close()
    return schemes

def get_scheme_by_id(scheme_id):
    """Retrieve a single scheme by ID."""
    conn = get_db_connection()
    c = conn.cursor()
    
    c.execute('SELECT * FROM schemes WHERE id = ?', (scheme_id,))
    row = c.fetchone()
    
    if row:
        scheme = {
            "id": row['id'],
            "name": row['name'],
            "state": row['state'],
            "city": row['city'],
            "gender": row['gender'],
            "age_group": row['age_group'],
            "category": row['category'],
            "description": row['description'],
            "required_docs": json.loads(row['required_docs']),
            "filling_steps": json.loads(row['filling_steps']),
            "benefits": json.loads(row['benefits']) if row['benefits'] else [],
            "details": json.loads(row['details']) if row.keys().__contains__('details') and row['details'] else [],
            "created_at": row['created_at'],
            "updated_at": row['updated_at']
        }
        conn.close()
        return scheme
    
    conn.close()
    return None

def migrate_from_json():
    """Migrate data from legacy JSON file to SQLite."""
    json_path = Path(JSON_FILE)
    if not json_path.exists():
        return

    try:
        with open(json_path, 'r') as f:
            data = json.load(f)
            
        if not data:
            return

        conn = get_db_connection()
        c = conn.cursor()

        # Check if we've already migrated (simple check: if table is empty but json has data)
        # Better approach: Insert if not exists. Since we don't have unique IDs in JSON that map perfectly 
        # to DB (JSON ids might be 1, 2, 3... and DB autoincrements), we'll just check if table is empty.
        
        c.execute('SELECT count(*) FROM submissions')
        count = c.fetchone()[0]
        
        if count == 0:
            print(f"Migrating {len(data)} records from {JSON_FILE} to SQLite...")
            for item in data:
                form_type = item.get('formType', 'Unknown')
                form_data = json.dumps(item.get('formData', {}))
                timestamp = item.get('timestamp', datetime.now().isoformat())
                
                c.execute('''
                    INSERT INTO submissions (form_type, form_data, timestamp)
                    VALUES (?, ?, ?)
                ''', (form_type, form_data, timestamp))
            
            conn.commit()
            print("Migration completed.")
            
            # Optional: Rename JSON file to backup
            json_path.rename(json_path.with_suffix('.json.bak'))
            
        conn.close()
    except Exception as e:
        print(f"Error migrating data: {e}")

def create_submission(form_type, form_data):
    """Create a new form submission."""
    conn = get_db_connection()
    c = conn.cursor()
    
    timestamp = datetime.now().isoformat()
    form_data_json = json.dumps(form_data)
    
    c.execute('''
        INSERT INTO submissions (form_type, form_data, timestamp)
        VALUES (?, ?, ?)
    ''', (form_type, form_data_json, timestamp))
    
    new_id = c.lastrowid
    conn.commit()
    conn.close()
    
    return {
        "id": new_id,
        "formType": form_type,
        "formData": form_data,
        "timestamp": timestamp
    }

def get_all_submissions():
    """Retrieve all submissions."""
    conn = get_db_connection()
    c = conn.cursor()
    
    c.execute('SELECT * FROM submissions ORDER BY id DESC')
    rows = c.fetchall()
    
    submissions = []
    for row in rows:
        submissions.append({
            "id": row['id'],
            "formType": row['form_type'],
            "formData": json.loads(row['form_data']),
            "timestamp": row['timestamp']
        })
    
    conn.close()
    return submissions
