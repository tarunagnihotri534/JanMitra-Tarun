import sqlite3

def check_db():
    conn = sqlite3.connect('janmitra.db')
    c = conn.cursor()
    
    print("\n--- Testing Youth Query ---")
    category = "Youth"
    query = "SELECT id, name, category, age_group FROM schemes WHERE 1=1 AND (category = ? OR category = 'Any')"
    c.execute(query, (category,))
    results = c.fetchall()
    print(f"Found {len(results)} schemes for Youth:")
    for row in results:
        print(row)

    conn.close()

if __name__ == "__main__":
    check_db()
