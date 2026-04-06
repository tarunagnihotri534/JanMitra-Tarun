import db
import main
import json

def test_logic():
    print("Testing get_all_schemes...")
    try:
        schemes = db.get_all_schemes()
        print(f"Retrieved {len(schemes)} schemes.")
        if schemes:
            print("Sample scheme (first):")
            print(json.dumps(schemes[0], indent=2, default=str))
            
            # Check details field specifically
            if 'details' in schemes[0]:
                print(f"Details field type: {type(schemes[0]['details'])}")
            else:
                print("Details field MISSING in output!")
    except Exception as e:
        print(f"CRASH in db.get_all_schemes: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_logic()
