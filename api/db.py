import json
import logging
import threading
import os
from datetime import datetime, timedelta
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("SUPABASE_URL and SUPABASE_KEY environment variables are required")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def init_db(initial_schemes=None):
    if initial_schemes:
        seed_schemes(initial_schemes)
    _ensure_hindi_table(initial_schemes or [])


def _ensure_hindi_table(schemes_data):
    try:
        result = supabase.table("schemes_hi").select("id", count="exact").limit(1).execute()
        count = result.count or 0
    except Exception:
        count = 0
    if count == 0 and schemes_data:
        print("[JanMitra] Hindi table empty - building in background...")
        thread = threading.Thread(target=_build_hindi_table, args=(schemes_data,), daemon=True)
        thread.start()
    else:
        print(f"[JanMitra] Hindi table ready ({count} schemes).")


def _build_hindi_table(schemes_data):
    try:
        from deep_translator import GoogleTranslator
        from concurrent.futures import ThreadPoolExecutor, as_completed

        def t(text):
            if not text or not str(text).strip():
                return text
            try:
                return GoogleTranslator(source='en', target='hi').translate(str(text))
            except Exception:
                return text

        def t_list(lst):
            return [t(item) for item in (lst or [])]

        def t_details(details):
            if not details:
                return []
            return [{"title": t(d.get("title", "")), "content": t(d.get("content", ""))} for d in details]

        def translate_scheme(scheme):
            print(f"[JanMitra] Translating: {scheme['name'][:40]}...")
            return {
                "id": scheme["id"],
                "name": t(scheme["name"]),
                "state": t(scheme.get("state", "")),
                "city": t(scheme.get("city", "Any")),
                "gender": t(scheme.get("gender", "Any")),
                "age_group": scheme.get("age_group", "Any"),
                "category": t(scheme.get("category", "Any")),
                "description": t(scheme.get("description", "")),
                "last_date": t(scheme.get("last_date", "31 December 2026")),
                "required_docs": t_list(scheme.get("required_docs", [])),
                "filling_steps": t_list(scheme.get("filling_steps", [])),
                "benefits": t_list(scheme.get("benefits", [])),
                "details": t_details(scheme.get("details", [])),
            }

        translated = []
        with ThreadPoolExecutor(max_workers=8) as executor:
            futures = {executor.submit(translate_scheme, s): s for s in schemes_data}
            for future in as_completed(futures):
                try:
                    translated.append(future.result())
                except Exception as e:
                    print(f"[JanMitra] Translation error: {e}")

        translated.sort(key=lambda x: x["id"])
        if translated:
            supabase.table("schemes_hi").upsert(translated).execute()
        print(f"[JanMitra] Hindi table built with {len(translated)} schemes!")
    except Exception as e:
        print(f"[JanMitra] Hindi table build failed: {e}")


def seed_schemes(schemes_data):
    print(f"Updating {len(schemes_data)} schemes in Supabase...")
    rows = []
    for s in schemes_data:
        rows.append({
            "id": s["id"], "name": s["name"],
            "state": s.get("state"), "city": s.get("city"),
            "gender": s.get("gender"), "age_group": s.get("age_group"),
            "category": s.get("category"), "description": s.get("description"),
            "required_docs": s.get("required_docs", []),
            "filling_steps": s.get("filling_steps", []),
            "benefits": s.get("benefits", []),
            "details": s.get("details", []),
            "last_date": s.get("last_date", "31 December 2026"),
            "updated_at": datetime.utcnow().isoformat(),
        })
    supabase.table("schemes").upsert(rows).execute()
    print("Schemes update completed.")


def _to_scheme_dict(row, include_timestamps=True):
    d = {
        "id": row["id"], "name": row["name"],
        "state": row.get("state"), "city": row.get("city"),
        "gender": row.get("gender"), "age_group": row.get("age_group"),
        "category": row.get("category"), "description": row.get("description"),
        "required_docs": row.get("required_docs", []),
        "filling_steps": row.get("filling_steps", []),
        "benefits": row.get("benefits", []),
        "details": row.get("details", []),
        "last_date": row.get("last_date", "31 December 2026"),
    }
    if include_timestamps:
        d["created_at"] = row.get("created_at")
        d["updated_at"] = row.get("updated_at")
    return d


def get_all_schemes(state=None, gender=None, age=None, category=None, updated_only=False):
    result = supabase.table("schemes").select("*").execute()
    schemes = []
    for row in result.data:
        if state and state not in ["All States", "\u0938\u092d\u0940 \u0930\u093e\u091c\u094d\u092f", "Any"]:
            if row.get("state") not in [state, "Any", "All States"]:
                continue
        if gender and gender not in ["Any", "\u0915\u094b\u0908 \u092d\u0940"]:
            if row.get("gender") not in [gender, "Any"]:
                continue
        if age and age not in ["Any", "\u0915\u094b\u0908 \u092d\u0940"]:
            if row.get("age_group") not in [age, "Any"]:
                continue
        if category and category not in ["Any", "\u0915\u094b\u0908 \u092d\u0940"]:
            if row.get("category") not in [category, "Any"]:
                continue
        if updated_only:
            ua = row.get("updated_at")
            if ua and str(ua) < (datetime.utcnow() - timedelta(days=30)).isoformat():
                continue
        schemes.append(_to_scheme_dict(row))
    return schemes


def get_all_schemes_hi(en_ids):
    result = supabase.table("schemes_hi").select("*").in_("id", en_ids).execute()
    id_map = {r["id"]: _to_scheme_dict(r, include_timestamps=False) for r in result.data}
    return [id_map[i] for i in en_ids if i in id_map]


def get_scheme_by_id_hi(scheme_id):
    result = supabase.table("schemes_hi").select("*").eq("id", scheme_id).execute()
    if result.data:
        return _to_scheme_dict(result.data[0], include_timestamps=False)
    return None


def get_scheme_by_id(scheme_id):
    result = supabase.table("schemes").select("*").eq("id", scheme_id).execute()
    if result.data:
        return _to_scheme_dict(result.data[0])
    return None


def migrate_from_json():
    pass  # No longer needed with Supabase


def create_submission(form_type, form_data):
    timestamp = datetime.utcnow().isoformat()
    result = supabase.table("submissions").insert({
        "form_type": form_type, "form_data": form_data, "timestamp": timestamp,
    }).execute()
    new_row = result.data[0]
    return {"id": new_row["id"], "formType": form_type, "formData": form_data, "timestamp": timestamp}


def get_all_submissions():
    result = supabase.table("submissions").select("*").order("id", desc=True).execute()
    return [{"id": r["id"], "formType": r["form_type"], "formData": r.get("form_data", {}), "timestamp": r["timestamp"]} for r in result.data]
