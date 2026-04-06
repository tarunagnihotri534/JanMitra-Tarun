from fastapi import FastAPI, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
import re
from datetime import datetime
import json
from pathlib import Path
import logging
import db
import os
from dotenv import load_dotenv

load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI()

# Database initialization moved after mock_schemes definition

# CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from deep_translator import GoogleTranslator

import json
import os

translation_cache = {}
try:
    with open('translation_cache.json', 'r', encoding='utf-8') as f:
        translation_cache = json.load(f)
except Exception as e:
    print("Warning: Could not load translation_cache.json", e)

def translate_text(text, target_lang):
    """Translate text using Google Translator with caching."""
    # Map custom/legacy codes to standard ISO codes
    lang_map = {'bi': 'hi'} 
    target_lang = lang_map.get(target_lang, target_lang)

    if target_lang == "en" or not text:
        return text
        
    cache_key = f"{text}_{target_lang}"
    if cache_key in translation_cache:
        return translation_cache[cache_key]
        
    try:
        translated = GoogleTranslator(source='en', target=target_lang).translate(text)
        translation_cache[cache_key] = translated
        return translated
    except Exception as e:
        print(f"Translation error for '{text}': {e}")
        return text

def translate_list(items, target_lang):
    """Translate a list of strings."""
    if target_lang == "en":
        return items
    return [translate_text(item, target_lang) for item in items]

def translate_details(details, target_lang):
    """Translate details list of objects."""
    if not details or target_lang == "en":
        return details
    
    translated_details = []
    for item in details:
        translated_details.append({
            "title": translate_text(item.get("title", ""), target_lang),
            "content": translate_text(item.get("content", ""), target_lang)
        })
    return translated_details

# Request Models
class VoiceMessage(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000, description="Voice command text")
    
    @validator('message')
    def sanitize_message(cls, v):
        if not v or not v.strip():
            raise ValueError('Message cannot be empty')

        return v.strip()[:1000]

class FormSubmission(BaseModel):
    formType: str = Field(..., min_length=1, max_length=100)
    formData: Dict[str, Any] = Field(..., description="Form field data")
    
    @validator('formType')
    def validate_form_type(cls, v):
        # Sanitize form type
        return re.sub(r'[^a-zA-Z0-9_-]', '', v)[:100]
    
    @validator('formData')
    def sanitize_form_data(cls, v):
        if not isinstance(v, dict):
            raise ValueError('formData must be a dictionary')
        # Limit nested data size
        if len(str(v)) > 50000:  # 50KB limit
            raise ValueError('Form data too large')
        return v

# Response Models
class SchemeResponse(BaseModel):
    id: int
    name: str
    state: str
    city: str
    gender: str
    age_group: str
    category: str
    description: str
    required_docs: List[str]
    filling_steps: List[str]
    benefits: List[str] = []
    details: Optional[List[Dict[str, str]]] = None

class SubmissionResponse(BaseModel):
    success: bool
    message: str
    id: Optional[int] = None

class VoiceResponse(BaseModel):
    reply: str
    action: Optional[Dict[str, Any]] = None

class HealthResponse(BaseModel):
    status: str
    version: str
    database: str
    schemes_count: int

# Mock Scheme Data
mock_schemes = [
    # --- Central Government Schemes ---
    {
        "id": 1, 
        "name": "Pradhan Mantri Kishan Samman Nidhi (PM-KISAN)", 
        "state": "All States", 
        "city": "Any", 
        "gender": "Any", 
        "age_group": "18-60", 
        "category": "General", 
        "description": "Income support of Rs. 6000/- per year to all landholding farmer families.", 
        "last_date": "10 April 2026",
        "required_docs": ["Aadhar Card", "Land Records", "Bank Passbook"],
        "filling_steps": [
            "Enter your full name as per Aadhar.",
            "Enter your mobile number.",
            "Upload your Aadhar Card.",
            "Upload your Land Records.",
            "Upload your Bank Passbook."
        ],
        "benefits": ["Financial support of Rs. 6000 per year.", "Direct transfer to bank account."]
    },
    {
        "id": 2, 
        "name": "Pradhan Mantri Awas Yojana (PMAY) - Urban", 
        "state": "All States", 
        "city": "Any", 
        "gender": "Any", 
        "age_group": "18-60", 
        "category": "EWS/LIG", 
        "description": "Affordable housing for the urban poor with interest subsidies.", 
        "last_date": "25 April 2026",
        "required_docs": ["Aadhar Card", "Income Certificate", "Residence Proof", "Bank Passbook"],
        "filling_steps": [
            "Enter your full name as per Aadhar.",
            "Enter your address.",
            "Upload your Income Certificate.",
            "Upload your Residence Proof.",
            "Upload your Bank Passbook."
        ],
        "benefits": ["Subsidy on home loan interest.", "Financial assistance for house construction."]
    },
    {
        "id": 3, 
        "name": "Sukanya Samriddhi Yojana", 
        "state": "All States", 
        "city": "Any", 
        "gender": "Female", 
        "age_group": "0-18", 
        "category": "Any", 
        "description": "Small deposit scheme for the girl child to encourage education and savings.", 
        "last_date": "15 May 2026",
        "required_docs": ["Birth Certificate", "Aadhar Card of Parent", "Address Proof", "Passport Size Photo"],
        "filling_steps": [
            "Enter your full name as per Aadhar.",
            "Upload your Birth Certificate.",
            "Upload your Aadhar Card of Parent.",
            "Upload your Photo."
        ],
        "benefits": ["High interest rate of 8.2%.", "Tax benefits under Section 80C.", "Financial security for girl child."],
        "details": [
            {
                "title": "What is the Sukanya Samriddhi Yojana (SSY)?",
                "content": "The Sukanya Samriddhi Yojana (SSY) is a scheme launched by the government in 2015 as part of the Beti Bachao Beti Padhao campaign to encourage saving for the girl child’s future. It is a fixed income investment through which you can make regular deposits and earn interest on it. You can also claim tax deductions up to ₹1.5 lakh in a financial year under Section 80C of the Income Tax Act for your contributions towards the Sukanya Samriddhi scheme."
            },
            {
                "title": "Key Features of Sukanya Samriddhi Yojana (SSY)",
                "content": "Interest Rate: 8% p.a. (compounded annually)\nMinimum Investment: Rs. 250 in a financial year\nMaximum Investment: Rs. 1.5 lakh in a financial year\nMaturity Period: When girl child is 21 years old or on marriage after 18 years of age\nEligibility to age limit: Girl child must be 10 years old or younger at the time of account opening"
            },
            {
                "title": "Features of Sukanya Samriddhi Yojana Account",
                "content": "Interest rate: The government fixes the Sukanya Samriddhi Yojana interest rate every quarter. For the quarter ending June 2023, the rate of interest is 8% per annum, compounded annually.\n\nLock-in period: The lock-in period is 21 years.\n\nDeposits: A minimum deposit of ₹250 is needed, per year, for 15 years. Maximum ₹1.5 lakh."
            },
            {
                "title": "Eligibility Criteria",
                "content": "Beneficiary: Only girl children. Age limit is 10 years (with 1 year grace).\nOperator: Biological parent or legal guardian only."
            },
            {
                "title": "Benefits of Sukanya Samriddhi Yojana Account",
                "content": "Guaranteed Returns: Government-backed scheme with 8% p.a. return.\nTax Benefits: Deduction up to Rs 1.5 lakh under section 80C. Interest and maturity amount are tax-exempt.\nIdeal for Girl Child: Maturity amount can be used for education or marriage.\nEconomical: Start with just Rs 250."
            }
        ]
    },
    {
        "id": 4, 
        "name": "Ayushman Bharat Pradhan Mantri Jan Arogya Yojana", 
        "state": "All States", 
        "city": "Any", 
        "gender": "Any", 
        "age_group": "Any", 
        "category": "BPL", 
        "description": "Health cover of Rs. 5 lakhs per family per year for secondary and tertiary care hospitalization.", 
        "last_date": "30 May 2026",
        "required_docs": ["Ration Card", "Aadhar Card", "Mobile Number"],
        "filling_steps": [
            "Enter your full name as per Aadhar.",
            "Enter your mobile number.",
            "Upload your Ration Card.",
            "Upload your Aadhar Card."
        ],
        "benefits": ["Cashless treatment up to Rs. 5 Lakhs.", "Covers secondary and tertiary care hospitalization.", "Portable across India."]
    },
    {
        "id": 5, 
        "name": "Atal Pension Yojana (APY)", 
        "state": "All States", 
        "city": "Any", 
        "gender": "Any", 
        "age_group": "18-40", 
        "category": "Any", 
        "description": "Pension scheme for citizens of India focused on the unorganized sector workers.", 
        "last_date": "15 June 2026",
        "required_docs": ["Aadhar Card", "Bank Passbook", "Mobile Number"],
        "filling_steps": [
            "Enter your full name as per Aadhar.",
            "Enter your age.",
            "Enter your mobile number.",
            "Upload your Bank Passbook."
        ],
        "benefits": ["Guaranteed minimum pension of Rs. 1000-5000 per month.", "Government co-contribution for eligible subscribers."]
    },
    {
        "id": 6, 
        "name": "Pradhan Mantri Mudra Yojana (PMMY)", 
        "state": "All States", 
        "city": "Any", 
        "gender": "Any", 
        "age_group": "18-60", 
        "category": "Any", 
        "description": "Loans up to 10 lakhs to non-corporate, non-farm small/micro enterprises.", 
        "last_date": "30 June 2026",
        "required_docs": ["Identity Proof", "Address Proof", "Business License", "Business Plan"],
        "filling_steps": [
             "Enter your full name as per Aadhar.",
             "Upload your Identity Proof.",
             "Upload your Business Plan."
        ],
        "benefits": ["Loans up to Rs. 10 Lakhs.", "No collateral required.", "Business growth support."]
    },
    {
        "id": 7, 
        "name": "Stand Up India Scheme", 
        "state": "All States", 
        "city": "Any", 
        "gender": "Any", 
        "age_group": "18-60", 
        "category": "SC/ST/Woman", 
        "description": "Bank loans between 10 lakh and 1 Crore for greenfield enterprises.", 
        "last_date": "15 July 2026",
        "required_docs": ["Caste Certificate", "Aadhar Card", "Project Report", "Pan Card"],
        "filling_steps": [
            "Enter your full name as per Aadhar.",
            "Upload your Caste Certificate.",
            "Upload your Project Report."
        ],
        "benefits": ["Loans from Rs. 10 Lakh to Rs. 1 Crore.", "Support for SC/ST and Women entrepreneurs.", "Handholding support."]
    },
    {
        "id": 8, 
        "name": "National Old Age Pension Scheme (NOAPS)", 
        "state": "All States", 
        "city": "Any", 
        "gender": "Any", 
        "age_group": "60+", 
        "category": "BPL", 
        "description": "Monthly pension for BPL persons aged 60 years or above.", 
        "last_date": "31 July 2026",
        "required_docs": ["Age Proof", "Aadhar Card", "Income Certificate", "Bank Passbook"],
        "filling_steps": [
             "Enter your full name as per Aadhar.",
             "Enter your age.",
             "Upload your Income Certificate.",
             "Upload your Bank Passbook."
        ],
        "benefits": ["Monthly pension support.", "Financial independence for elderly."]
    },
    {
        "id": 9, 
        "name": "Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)", 
        "state": "All States", 
        "city": "Any", 
        "gender": "Any", 
        "age_group": "18-50", 
        "category": "Any", 
        "description": "Life insurance of Rs. 2 lakhs with a low premium of Rs. 436 per annum.", 
        "last_date": "15 August 2026",
        "required_docs": ["Aadhar Card", "Bank Passbook"],
        "filling_steps": [
            "Enter your full name as per Aadhar.",
            "Upload your Aadhar Card.",
            "Upload your Bank Passbook."
        ],
        "benefits": ["Life cover of Rs. 2 Lakhs.", "Low affordable premium.", "Easy enrollment."]
    },
    {
        "id": 10, 
        "name": "Pradhan Mantri Matru Vandana Yojana (PMMVY)", 
        "state": "All States", 
        "city": "Any", 
        "gender": "Female", 
        "age_group": "18-60", 
        "category": "Any", 
        "description": "Maternity benefit cash incentive of Rs. 5000 in three installments.", 
        "last_date": "31 August 2026",
        "required_docs": ["Aadhar Card", "Mother and Child Protection Card", "Bank Passbook"],
        "filling_steps": [
             "Enter your full name as per Aadhar.",
             "Upload your Aadhar Card.",
             "Upload your Bank Passbook."
        ],
        "benefits": ["Cash incentive of Rs. 5000.", "Health and nutrition support.", "Wage compensation."]
    },
    # --- State Specific Schemes ---
    {
        "id": 11, 
        "name": "Ladli Behna Yojana", 
        "state": "Madhya Pradesh", 
        "city": "Any", 
        "gender": "Female", 
        "age_group": "23-60", 
        "category": "General", 
        "description": "Financial assistance of Rs. 1000 per month to women.", 
        "last_date": "15 September 2026",
        "required_docs": ["Aadhar Card", "Samagra ID", "Bank Passbook", "Mobile Number"],
        "filling_steps": [
             "Enter your full name as per Aadhar.",
             "Enter your mobile number.",
             "Upload your Samagra ID.",
             "Upload your Bank Passbook."
        ],
        "benefits": ["Rs. 1000 monthly assistance.", "Economic empowerment of women.", "Direct bank transfer."]
    },
    {
        "id": 12, 
        "name": "Kanyashree Prakalpa", 
        "state": "West Bengal", 
        "city": "Any", 
        "gender": "Female", 
        "age_group": "13-18", 
        "category": "Any", 
        "description": "Conditional cash transfer to improve the status of the girl child.", 
        "last_date": "30 September 2026",
        "required_docs": ["Birth Certificate", "School ID", "Bank Passbook"],
        "filling_steps": ["Enter name.", "Upload docs."],
        "benefits": ["Annual scholarship of Rs. 1000.", "One-time grant of Rs. 25,000.", "Prevents early marriage."]
    },
    {
        "id": 13, 
        "name": "Rythu Bandhu Scheme", 
        "state": "Telangana", 
        "city": "Any", 
        "gender": "Any", 
        "age_group": "Any", 
        "category": "Farmers", 
        "description": "Investment support for agriculture and horticulture crops.", 
        "last_date": "15 October 2026",
        "required_docs": ["Pattadar Passbook", "Aadhar Card", "Bank Passbook"],
        "filling_steps": ["Enter name.", "Upload docs."],
        "benefits": ["Investment support per acre.", "Available for both seasons.", "Direct transfer."]
    },
    {
        "id": 14, 
        "name": "Jagananna Amma Vodi", 
        "state": "Andhra Pradesh", 
        "city": "Any", 
        "gender": "Female", 
        "age_group": "Any", 
        "category": "Mothers", 
        "description": "Financial assistance to mothers to send their children to school.", 
        "last_date": "31 October 2026",
        "required_docs": ["Aadhar Card", "School ID", "Ration Card", "Bank Passbook"],
        "filling_steps": ["Enter name.", "Upload docs."],
        "benefits": ["Rs. 15,000 per year assistance.", "Encourages school attendance.", "Direct to mother's account."]
    },
    {
        "id": 15, 
        "name": "Kalaignar Magalir Urimai Thogai", 
        "state": "Tamil Nadu", 
        "city": "Any", 
        "gender": "Female", 
        "age_group": "21-55", 
        "category": "Any", 
        "description": "Monthly rights grant of Rs. 1000 for eligible women heads of families.", 
        "last_date": "15 November 2026",
        "required_docs": ["Aadhar Card", "Ration Card", "Bank Passbook"],
        "filling_steps": ["Enter name.", "Upload docs."],
        "benefits": ["Rs. 1000 monthly grant.", "Financial independence.", "Social security."]
    },
    {
        "id": 16, 
        "name": "Gruha Lakshmi Scheme", 
        "state": "Karnataka", 
        "city": "Any", 
        "gender": "Female", 
        "age_group": "Any", 
        "category": "Head of Family", 
        "description": "Rs. 2000 monthly assistance to the woman head of the family.", 
        "last_date": "30 November 2026",
        "required_docs": ["Aadhar Card", "Ration Card", "Bank Passbook"],
        "filling_steps": ["Enter name.", "Upload docs."],
        "benefits": ["Rs. 2000 per month.", "Supports woman head of family.", "Direct Benefit Transfer."]
    },
    {
        "id": 17, 
        "name": "Mukhyamantri Kanya Sumangala Yojana", 
        "state": "Uttar Pradesh", 
        "city": "Any", 
        "gender": "Female", 
        "age_group": "0-18", 
        "category": "Any", 
        "description": "Financial assistance to the girl child in six stages from birth to graduation.", 
        "last_date": "15 December 2026",
        "required_docs": ["Birth Certificate", "Aadhar Card", "Residence Proof", "Photo"],
        "filling_steps": ["Enter name.", "Upload docs."],
        "benefits": ["Rs. 15,000 total assistance in phases.", "Supports education and health.", "Prevents female foeticide."]
    },
    {
        "id": 18, 
        "name": "Mission Shakti", 
        "state": "Odisha", 
        "city": "Any", 
        "gender": "Female", 
        "age_group": "Any", 
        "category": "Any", 
        "description": "Holistic empowerment of women through Self Help Groups (SHGs).", 
        "last_date": "31 December 2026",
        "required_docs": ["Aadhar Card", "SHG Group ID", "Bank Passbook"],
        "filling_steps": ["Enter name.", "Upload docs."],
        "benefits": ["Interest subvention on loans.", "Skill development training.", "Market linkage support."]
    },
    {
        "id": 19, 
        "name": "Indira Gandhi Pyari Behna Sukh Samman Nidhi", 
        "state": "Himachal Pradesh", 
        "city": "Any", 
        "gender": "Female", 
        "age_group": "18-60", 
        "category": "Any", 
        "description": "Rs. 1500 monthly pension for eligible women.", 
        "last_date": "15 January 2027",
        "required_docs": ["Aadhar Card", "Bank Passbook", "Age Proof"],
        "filling_steps": ["Enter name.", "Upload docs."],
        "benefits": ["Rs. 1500 monthly pension.", "Social security for women.", "Financial support."]
    },
    {
        "id": 20, 
        "name": "Mukhyamantri Yuva Sambal Yojana", 
        "state": "Rajasthan", 
        "city": "Any", 
        "gender": "Any", 
        "age_group": "21-30", 
        "category": "Unemployed", 
        "description": "Unemployment allowance for educated youth.", 
        "last_date": "31 January 2027",
        "required_docs": ["Aadhar Card", "Degree Certificate", "Domicile Certificate", "Bank Passbook"],
        "filling_steps": ["Enter name.", "Upload docs."],
        "benefits": ["Monthly allowance for unemployed.", "Skill training support.", "Financial relief."]
    },
    # --- New 0-18 Schemes ---
    {
        "id": 21,
        "name": "Bal Sakha Yojana",
        "state": "All States",
        "city": "Any",
        "gender": "Any",
        "age_group": "0-18",
        "category": "Vulnerable/BPL",
        "description": "Comprehensive support for vulnerable children focusing on development and well-being.",
        "last_date": "15 February 2027",
        "required_docs": ["Birth Certificate", "BPL Ration Card", "Parent Aadhar Card"],
        "filling_steps": ["Enter child name.", "Upload birth certificate.", "Upload BPL card."],
        "benefits": ["Financial assistance for development.", "Medical support for newborns.", "Educational support."]
    },
    {
        "id": 22,
        "name": "PM CARES for Children",
        "state": "All States",
        "city": "Any",
        "gender": "Any",
        "age_group": "0-18",
        "category": "Orphaned",
        "description": "Support for children who lost both parents or legal guardian or adoptive parents due to COVID-19 pandemic.",
        "last_date": "28 February 2027",
        "required_docs": ["Death Certificate of Parents", "Child Birth Certificate", "Guardian ID"],
        "filling_steps": ["Register beneficiary.", "Upload death certificates.", "Verify with DM."],
        "benefits": ["Fixed deposit of Rs. 10 Lakhs.", "Free health insurance.", "Education support.", "Monthly stipend from 18-23 years."]
    },
    {
        "id": 23,
        "name": "Mukhyamantri Bal Seva Yojana",
        "state": "Uttar Pradesh",
        "city": "Any",
        "gender": "Any",
        "age_group": "0-18",
        "category": "Destitute/Orphaned",
        "description": "Financial assistance to children who have lost their parents.",
        "last_date": "15 March 2027",
        "required_docs": ["Death Certificate", "Guardian Aadhar", "Bank Account Details"],
        "filling_steps": ["Enter details.", "Upload death certificate.", "Enter bank details."],
        "benefits": ["Rs. 2500 monthly financial aid.", "Free education.", "Marriage assistance for girls."]
    },
    {
        "id": 24,
        "name": "National Means-cum-Merit Scholarship",
        "state": "All States",
        "city": "Any",
        "gender": "Any",
        "age_group": "12-16",
        "category": "Students",
        "description": "Scholarships for meritorious students of economically weaker sections to arrest drop-outs at class VIII.",
        "last_date": "31 March 2027",
        "required_docs": ["Income Certificate", "Mark Sheet of Class VII", "Caste Certificate"],
        "filling_steps": ["Register on NSP.", "Upload documents.", "Submit application."],
        "benefits": ["Rs. 12,000 per annum scholarship.", "Supports secondary education.", " Reduces dropout rate."]
    },
    {
        "id": 25,
        "name": "Pradhan Mantri Kaushal Vikas Yojana (PMKVY 4.0)",
        "state": "All States",
        "city": "Any",
        "gender": "Any",
        "age_group": "15-45",
        "category": "Youth",
        "description": "The flagship scheme of MSDE implemented by NSDC to enable Indian youth to take up industry-relevant skill training.",
        "last_date": "15 April 2027",
        "required_docs": ["Aadhar Card", "Bank Passbook", "Educational Certificates"],
        "filling_steps": ["Register on Skill India Digital.", "Choose a course.", "Complete training.", "Get certified."],
        "benefits": ["Free Short Term Training (STT).", "Recognition of Prior Learning (RPL).", "Placement assistance.", "Kaushal Dikshant Samaroh certification."]
    }
]

# Dynamically add details to schemes that don't have them
for scheme in mock_schemes:
    if "details" not in scheme or not scheme["details"]:
        n = scheme["name"]
        benefits_list = "\n".join([f"- {b}" for b in scheme.get("benefits", [])])
        scheme["details"] = [
            {
                "title": f"What is {n}?",
                "content": f"{n} is a comprehensive public welfare program designed for targeted beneficiaries. {scheme.get('description', '')}"
            },
            {
                "title": "Key Features and Eligibility",
                "content": f"The scheme focuses on providing direct access to essential services and resources. It specifically targets individuals in the '{scheme.get('category', 'General')}' category within the '{scheme.get('age_group', 'applicable')}' age group.\nGender preference: {scheme.get('gender', 'Any')}."
            },
            {
                "title": "Application Process & Advantages",
                "content": f"Beneficiaries of the scheme receive multi-faceted support, ensuring long-term welfare. Key advantages include:\n{benefits_list}\n\nPlease submit all required documents before the official deadline."
            }
        ]

# Initialize Database with seed data
db.init_db(initial_schemes=mock_schemes)

@app.get("/schemes")
def get_schemes(state: str = None, gender: str = None, age: str = None, category: str = None, language: str = "en", updated_only: bool = False):
    # Map custom language codes
    lang_map = {'bi': 'hi'}
    language = lang_map.get(language, language)

    # Always fetch English schemes for filtering (the canonical data source)
    schemes = db.get_all_schemes(state=state, gender=gender, age=age, category=category, updated_only=updated_only)

    # For Hindi — use the pre-stored Hindi table (instant, no API calls)
    if language == 'hi':
        ids = [s['id'] for s in schemes]
        if ids:
            return db.get_all_schemes_hi(ids)
        return []

    # For other non-English languages — translate on the fly
    if language != "en":
        # Translate filter inputs back to English first (for DB query)
        try:
            translator = GoogleTranslator(source='auto', target='en')
            if state: state = translator.translate(state)
            if gender: gender = translator.translate(gender)
            if category: category = translator.translate(category)
            if age: age = translator.translate(age)
        except Exception as e:
            print(f"Input translation failed: {e}")
        # Re-fetch with translated filters
        schemes = db.get_all_schemes(state=state, gender=gender, age=age, category=category, updated_only=updated_only)
        translated_schemes = []
        for scheme in schemes:
            translated_schemes.append({
                **scheme,
                "name": translate_text(scheme["name"], language),
                "description": translate_text(scheme["description"], language),
                "state": translate_text(scheme["state"], language),
                "city": translate_text(scheme["city"], language),
                "category": translate_text(scheme["category"], language),
                "gender": translate_text(scheme["gender"], language),
                "last_date": translate_text(scheme["last_date"], language),
                "required_docs": translate_list(scheme["required_docs"], language),
                "filling_steps": translate_list(scheme.get("filling_steps", []), language),
                "benefits": translate_list(scheme.get("benefits", []), language),
                "details": translate_details(scheme.get("details", None), language)
            })
        return translated_schemes

    return schemes

@app.get("/schemes/{scheme_id}", response_model=SchemeResponse)
async def get_scheme_by_id(scheme_id: int, language: str = "en"):
    """Get a specific scheme by ID"""
    try:
        if scheme_id < 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid scheme ID"
            )
        
        scheme = db.get_scheme_by_id(scheme_id)
        
        if not scheme:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Scheme with ID {scheme_id} not found"
            )
        
        if language != "en":
            lang_map = {'bi': 'hi'}
            language = lang_map.get(language, language)

            # Hindi: use pre-stored DB table
            if language == 'hi':
                hi_scheme = db.get_scheme_by_id_hi(scheme_id)
                if hi_scheme:
                    return hi_scheme
                # fallback to English if not found in hi table
                return scheme

            # Other languages: translate on the fly
            try:
                return {
                    **scheme,
                    "name": translate_text(scheme["name"], language),
                    "description": translate_text(scheme["description"], language),
                    "state": translate_text(scheme["state"], language),
                    "city": translate_text(scheme["city"], language),
                    "category": translate_text(scheme["category"], language),
                    "gender": translate_text(scheme["gender"], language),
                    "last_date": translate_text(scheme["last_date"], language),
                    "required_docs": translate_list(scheme["required_docs"], language),
                    "filling_steps": translate_list(scheme.get("filling_steps", []), language),
                    "benefits": translate_list(scheme.get("benefits", []), language),
                    "details": translate_details(scheme.get("details", None), language)
                }
            except Exception as e:
                logger.error(f"Translation error for scheme {scheme_id}: {e}")
                return scheme  # Fallback to original
        
        return scheme
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching scheme {scheme_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch scheme"
        )

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "JanMitra Backend Running",
        "version": "2.0",
        "status": "healthy",
        "endpoints": ["/schemes", "/submissions", "/voice", "/health"]
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint with database validation"""
    try:
        # Check database connectivity
        schemes = db.get_all_schemes()
        return HealthResponse(
            status="healthy",
            version="2.0",
            database="connected",
            schemes_count=len(schemes)
        )
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service unhealthy"
        )

@app.post("/submissions", response_model=SubmissionResponse)
async def submit_form(submission: FormSubmission):
    """Save form submission to database"""
    try:
        result = db.create_submission(submission.formType, submission.formData)
        logger.info(f"Form submitted successfully: ID {result['id']}")
        return SubmissionResponse(
            success=True,
            message="Form submitted successfully",
            id=result["id"]
        )
    except Exception as e:
        logger.error(f"Error submitting form: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to submit form"
        )

@app.get("/submissions")
async def get_submissions():
    """Get all form submissions from database"""
    try:
        submissions = db.get_all_submissions()
        return submissions
    except Exception as e:
        logger.error(f"Error fetching submissions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch submissions"
        )

@app.post("/voice", response_model=VoiceResponse)
async def process_voice(data: VoiceMessage):
    """Process voice commands"""
    try:
        text = data.message.lower()
        
        # Detect language basic heuristic
        is_hindi = any(word in text for word in ["kholo", "jao", "banao", "mera", "meri", "humara", "chahiye", "hai"])

        response = {
            "reply": "I didn't understand that." if not is_hindi else "मैं समझ नहीं पाया। कृपया पुनः प्रयास करें।",
            "action": None
        }

        # 1. Navigation Intents
        if any(k in text for k in ["open", "go to", "kholo", "jao", "chalo", "le chalo"]):
            if any(k in text for k in ["income", "aaye", "aay"]):
                response["reply"] = "Opening Income Certificate Form." if not is_hindi else "आय प्रमाण पत्र फॉर्म खोल रहा हूँ।"
                response["action"] = {"type": "navigate", "payload": "/forms/income"}
            elif any(k in text for k in ["caste", "jati", "jaati"]):
                response["reply"] = "Opening Caste Certificate Form." if not is_hindi else "जाति प्रमाण पत्र फॉर्म खोल रहा हूँ।"
                response["action"] = {"type": "navigate", "payload": "/forms/caste"}
            elif any(k in text for k in ["dashboard", "home", "ghar", "mukhya", "main"]):
                response["reply"] = "Going to Dashboard." if not is_hindi else "डैशबोर्ड पर जा रहा हूँ।"
                response["action"] = {"type": "navigate", "payload": "/"}
        
        # 2. Form Filling Intents
        
        # Name: "my name is [name]" or "mera naam [name] hai"
        name_match = re.search(r"(?:my name is|i am) ([\w\s]+)", text)
        if name_match:
            name = name_match.group(1).strip()
            response["reply"] = f"Okay, setting name to {name}."
            response["action"] = {"type": "fill_form", "data": {"name": name}}
            return VoiceResponse(**response)
            
        # Hindi Name
        hindi_name_match = re.search(r"mera naam ([\w\s]+?)(?:hai)?$", text)
        if hindi_name_match:
            name = hindi_name_match.group(1).strip()
            response["reply"] = f"ठीक है, नाम {name} सेट कर दिया गया है।"
            response["action"] = {"type": "fill_form", "data": {"name": name}}
            return VoiceResponse(**response)

        # Age: "i am [num] years old" or "meri umar [num] hai"
        age_match = re.search(r"(?:i am|age is) (\d+)", text)
        if age_match:
            age = age_match.group(1)
            response["reply"] = f"Got it, setting age to {age}."
            response["action"] = {"type": "fill_form", "data": {"age": age}}
            return VoiceResponse(**response)
            
        hindi_age_match = re.search(r"(?:meri umar|mein) (\d+) (?:saal|varsh)", text)
        if not hindi_age_match:
            hindi_age_match = re.search(r"umar (\d+) hai", text)
            
        if hindi_age_match:
            age = hindi_age_match.group(1)
            response["reply"] = f"समझ गया, आयु {age} वर्ष सेट कर दी गई है।"
            response["action"] = {"type": "fill_form", "data": {"age": age}}
            return VoiceResponse(**response)
            
        # Aadhar: "my aadhar is [num]" or "mera aadhar [num] hai"
        aadhar_match = re.search(r"aadhar(?: number)? (?:is|hai)?\s*(\d{4}\s?\d{4}\s?\d{4})", text)
        if not aadhar_match:
            aadhar_match = re.search(r"aadhar(?: number)? (?:is|hai)?\s*(\d+)", text)
            
        if aadhar_match:
            aadhar = aadhar_match.group(1).replace(" ", "")
            response["reply"] = "Updated Aadhar number." if not is_hindi else "आधार नंबर अपडेट कर दिया गया है।"
            response["action"] = {"type": "fill_form", "data": {"aadhar": aadhar}}
            return VoiceResponse(**response)

        return VoiceResponse(**response)
        
    except Exception as e:
        logger.error(f"Error processing voice command: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process voice command"
        )

@app.post("/analyze-issue")
async def analyze_civic_issue(data: dict):
    """
    JanMitra AI: Analyze civic complaints and convert to structured JSON.
    """
    message = data.get("citizen_message", "")
    if not message:
        raise HTTPException(status_code=400, detail="Missing citizen_message")
    
    import os
    import json
    
    # Try using Gemini for processing
    try:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            # Simulated rule-based AI fallback if API key is not configured
            # Simple keyword matching for demo
            lower_msg = message.lower()
            category = "Other"
            dept = "Administrative Office"
            severity = "Low"
            
            if "pothole" in lower_msg or "road" in lower_msg:
                category, dept, severity = "Road Damage", "Municipal Corporation / PWD", "High"
            elif "garbage" in lower_msg or "trash" in lower_msg or "kachra" in lower_msg:
                category, dept, severity = "Garbage / Sanitation", "Sanitation Department", "Medium"
            elif "water" in lower_msg or "pani" in lower_msg:
                category, dept, severity = "Water Supply Problem", "Water Authority", "High"
            elif "electric" in lower_msg or "light" in lower_msg or "wire" in lower_msg:
                category, dept, severity = "Electricity Issue", "Electricity Board", "Critical" if "wire" in lower_msg else "Medium"
                
            return {
                "issue_category": category,
                "department": dept,
                "severity": severity,
                "location": "Detected from context",
                "short_summary": message[:30] + "...",
                "recommended_action": "Forward to designated department for inspection",
                "citizen_message": message
            }

        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-2.5-flash")
        
        prompt = f"""
You are JanMitra AI, an intelligent civic issue analysis system used in a citizen-government platform.
Your role is to analyze citizen complaints (text or image description) and convert them into structured data so that the backend system can automatically route the issue to the correct government department.

IMPORTANT RULES:
* Do NOT explain anything.
* Do NOT generate extra text.
* Always return STRICT JSON only.
* Never modify the original citizen message.
* Your response must be usable directly by backend systems.

TASKS
1. Understand the citizen complaint written in natural language.
2. Identify the issue category.
3. Identify the responsible government department.
4. Detect severity level.
5. Extract location if mentioned.
6. Create a short professional summary.
7. Suggest recommended action.

SUPPORTED ISSUE CATEGORIES
Road Damage
Garbage / Sanitation
Electricity Issue
Water Supply Problem
Sewage / Drainage
Broken Street Light
Public Safety Hazard
Government Service Issue
Other

DEPARTMENT ROUTING RULES
Road Damage -> Municipal Corporation or Public Works Department (PWD)
Garbage / Sanitation -> Sanitation Department or Municipal Corporation
Electricity Issue -> Electricity Board
Water Supply Problem -> Water Authority / Jal Nigam
Sewage / Drainage -> Drainage Department
Broken Street Light -> Municipal Electrical Department
Public Safety Hazard -> Police Department or Municipal Safety Department
Government Service Issue -> Administrative Office

SEVERITY CLASSIFICATION
Critical: open electric wires, sewage overflow, large dangerous potholes, collapsed infrastructure, serious public safety risk
High: damaged roads, water shortages, major electricity outages, flooding
Medium: garbage accumulation, broken street lights, drainage blockage
Low: minor civic issues, small maintenance complaints

OUTPUT FORMAT (STRICT JSON)
{{
"issue_category": "",
"department": "",
"severity": "",
"location": "",
"short_summary": "",
"recommended_action": "",
"citizen_message": ""
}}

Citizen Input:
"{message}"
"""
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
            
        if text.endswith("```"):
            text = text[:-3]
            
        return json.loads(text.strip())
        
    except Exception as e:
        logger.error(f"AI Analysis Failed: {e}")
        return {
            "issue_category": "Processing Error",
            "department": "IT Support",
            "severity": "Low",
            "location": "N/A",
            "short_summary": "System could not parse the issue",
            "recommended_action": "Manual review required",
            "citizen_message": message
        }

@app.post("/analyze-document")
async def analyze_document(file: UploadFile = File(...)):
    """
    JanMitra AI: Analyze the uploaded document (e.g. Aadhar card) and extract user traits.
    """
    try:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="Gemini API Key not configured")

        contents = await file.read()
        
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-2.5-flash")
        
        prompt = """
You are an intelligent document analyzer for a citizen-government platform. 
Analyze the provided document image (it could be an Aadhar card, PAN card, or any identity document).
Extract as much of the following information as possible. If you cannot find a specific piece of information from the image itself, make a reasonable guess based on the visual context or just leave it empty.
DO NOT output any extra text. ONLY output STRICT JSON.

1. age: Calculate age from DOB if available, or just guess the age bracket (e.g. 25-40). For the response, just output one of the following exact strings based on the age: "0-14", "15-24", "25-40", "41-59", "60+".
2. gender: "male", "female", or "other".
3. state: Extract the Indian state name if an address is present.
4. category: Try to infer the social category ("general", "sc", "st", "obc"). If it's an Aadhar, it usually doesn't say, so just output "general".
5. occupation: Infer occupation. If not possible, output "other" or "student".
6. income: Infer the annual income bracket ("below1", "1to3", "3to8", "above8") based on visual cues. If not possible, output "1to3".

OUTPUT FORMAT (STRICT JSON):
{
  "age_group": "",
  "gender": "",
  "state": "",
  "category": "",
  "occupation": "",
  "income": ""
}
"""
        import tempfile
        import PIL.Image
        import io
        
        image = PIL.Image.open(io.BytesIO(contents))

        response = model.generate_content([prompt, image])
        text = response.text.strip()
        
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
            
        if text.endswith("```"):
            text = text[:-3]
            
        return json.loads(text.strip())
        
    except Exception as e:
        logger.error(f"Document Analysis Failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyze document"
        )

@app.post("/analyze-form-risk")
async def analyze_form_risk(file: UploadFile = File(...)):
    """
    Analyze form/agreement for hidden risks, fraud, or misleading terms.
    """
    try:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="Gemini API Key not configured")

        contents = await file.read()
        mime_type = file.content_type or "application/pdf"
        
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-2.5-flash")
        
        prompt = """
You are an expert legal and fraud-detection assistant.
A user has uploaded a document (form/agreement/contract). Your job is to analyze it carefully and protect the user from hidden risks, fraud, or misleading terms.

### Instructions:
1. Read the entire document thoroughly.
2. Identify and clearly explain any:
   * Hidden charges or payment obligations
   * Auto-renewal or subscription traps
   * Legal liabilities or penalties
   * One-sided or unfair clauses
   * Data privacy risks (data sharing, permissions)
   * Misleading or confusing language
   * Fine print that may harm the user
   * Any signs of fraud, manipulation, or misrepresentation
3. Highlight the exact sentences or clauses from the document that are risky.
4. Rate the overall risk level: Low Risk, Medium Risk, or High Risk.
5. Provide a simple explanation in plain language so a non-technical user can understand.
6. Suggest what the user should do: Safe to proceed, Proceed with caution, or Do NOT sign / avoid.
7. If possible, suggest safer alternatives or precautions.

OUTPUT FORMAT (STRICT JSON):
{
  "summary": "2-3 lines summary",
  "key_risks": ["risk 1", "risk 2"],
  "suspicious_clauses": [
    {"clause": "exact sentence", "reason": "why it's risky"}
  ],
  "risk_level": "Low Risk | Medium Risk | High Risk",
  "recommendation": "Safe to proceed | Proceed with caution | Do NOT sign / avoid",
  "explanation": "Simple explanation"
}
"""
        doc_part = {
            "mime_type": mime_type,
            "data": contents
        }

        response = model.generate_content([prompt, doc_part])
        text = response.text.strip()
        
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
            
        if text.endswith("```"):
            text = text[:-3]
            
        return json.loads(text.strip())
        
    except Exception as e:
        logger.error(f"Form Risk Analysis Failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

class ChatMessage(BaseModel):
    message: str
    language: str = "en"

@app.post("/chat")
async def chat_with_bot(data: ChatMessage):
    """
    Chat with the Government Scheme Assistant
    """
    try:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="Gemini API Key not configured")

        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-2.5-flash")

        if data.language == "hi":
            language_instruction = "You must communicate ENTIRELY in simple Hindi (Devanagari script), mixed with easy to understand English terms if necessary. DO NOT reply in full English."
            format_labels = {
                "name": "योजना का नाम",
                "desc": "विवरण",
                "eligibility": "पात्रता",
                "deadline": "अंतिम तिथि",
                "docs": "आवश्यक दस्तावेज",
                "apply": "आवेदन कैसे करें",
                "source": "आधिकारिक वेबसाइट",
                "notes": "महत्वपूर्ण बातें"
            }
        else:
            language_instruction = "You must communicate ENTIRELY in English. DO NOT use Hindi."
            format_labels = {
                "name": "Scheme Name",
                "desc": "Description",
                "eligibility": "Eligibility",
                "deadline": "Last Date / Deadline",
                "docs": "Required Documents",
                "apply": "How to Apply",
                "source": "Official Source",
                "notes": "Important Notes"
            }

        prompt = f"""
You are an expert Government Scheme Assistant for India. {language_instruction}

Your job is to provide accurate, up-to-date, and user-friendly information about Government schemes, deadlines, eligibility, and required documents.

### Instructions:
1. Understand the user's query clearly.
2. Provide ONLY verified and factual information. Never hallucinate rules or dates.
3. If the query involves a deadline, mention the exact date (if known) and specify if tentative.
4. If uncertain, state: "Please verify from the official website." (Or the Hindi equivalent).

### Format for Scheme Queries:
* **📄 {format_labels["name"]}:** [Name]
* **🧾 {format_labels["desc"]}:** [Simple 1-2 line explanation]
* **👥 {format_labels["eligibility"]}:** [Bullet points explaining who can apply]
* **📅 {format_labels["deadline"]}:** **[Highlight Date Boldly]**
* **📂 {format_labels["docs"]}:** [List of required documents]
* **📝 {format_labels["apply"]}:** [Step-by-step process]
* **🔗 {format_labels["source"]}:** [Portal Name or URL]
* **⚠️ {format_labels["notes"]}:** [Warnings or common mistakes]

Note: If the user just says hello or asks a general question, reply simply in the requested language ({data.language}) without using the strict scheme format. Produce text formatted in markdown without the ``` markdown code blocks around it.
"""
        response = model.generate_content([prompt, data.message])
        return {"reply": response.text.strip()}
        
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# Vercel Adapter: Mount the FastAPI app at /api to match Vercel rewriting
original_app = app
app = FastAPI()
app.mount("/api", original_app)

