from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
import re
from datetime import datetime
import json
from pathlib import Path
import logging
import db

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

translation_cache = {}

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
        "required_docs": ["Aadhar Card", "Bank Passbook", "Educational Certificates"],
        "filling_steps": ["Register on Skill India Digital.", "Choose a course.", "Complete training.", "Get certified."],
        "benefits": ["Free Short Term Training (STT).", "Recognition of Prior Learning (RPL).", "Placement assistance.", "Kaushal Dikshant Samaroh certification."]
    }
]

# Initialize Database with seed data
db.init_db(initial_schemes=mock_schemes)

@app.get("/schemes")
def get_schemes(state: str = None, gender: str = None, age: str = None, category: str = None, language: str = "en", updated_only: bool = False):
    # Map custom language codes
    lang_map = {'bi': 'hi'} 
    language = lang_map.get(language, language)

    # Translate inputs TO English if in another language
    if language != "en":
        try:
            translator = GoogleTranslator(source='auto', target='en')
            if state: state = translator.translate(state)
            if gender: gender = translator.translate(gender)
            if category: category = translator.translate(category)
            # Age group usually contains numbers, might not need translation but good to be safe if it has words
            if age: age = translator.translate(age)
        except Exception as e:
            print(f"Input translation failed: {e}")

    # Fetch filtered schemes from database
    schemes = db.get_all_schemes(state=state, gender=gender, age=age, category=category, updated_only=updated_only)
    
    # Translate content if language is not English
    if language != "en":
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
            
            try:
                return {
                    **scheme,
                    "name": translate_text(scheme["name"], language),
                    "description": translate_text(scheme["description"], language),
                    "state": translate_text(scheme["state"], language),
                    "city": translate_text(scheme["city"], language),
                    "category": translate_text(scheme["category"], language),
                    "gender": translate_text(scheme["gender"], language),
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
