// Voice Form Processor - Smart field detection and form filling
// Handles pattern matching, validation, and intelligent field detection

class VoiceFormProcessor {
  constructor() {
    this.focusedField = null;
    this.lastFilledField = null;

    // Field type patterns for validation
    this.fieldPatterns = {
      name: /^[a-zA-Z\s]{2,50}$/,
      age: /^\d{1,3}$/,
      aadhar: /^\d{12}$/,
      phone: /^\d{10}$/,
      pincode: /^\d{6}$/,
      email: /^[\w\.-]+@[\w\.-]+\.\w+$/
    };

    // Word to number conversion (comprehensive)
    this.numberWords = {
      // English - single digits
      'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4,
      'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9,
      // English - teens
      'ten': 10, 'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14,
      'fifteen': 15, 'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19,
      // English - tens
      'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50,
      'sixty': 60, 'seventy': 70, 'eighty': 80, 'ninety': 90,
      // English - hundreds
      'hundred': 100, 'thousand': 1000,

      // Hindi - single digits
      'शून्य': 0, 'एक': 1, 'दो': 2, 'तीन': 3, 'चार': 4,
      'पांच': 5, 'पाँच': 5, 'छह': 6, 'छः': 6, 'सात': 7, 'आठ': 8, 'नौ': 9,
      // Hindi - teens
      'दस': 10, 'ग्यारह': 11, 'बारह': 12, 'तेरह': 13, 'चौदह': 14,
      'पंद्रह': 15, 'सोलह': 16, 'सत्रह': 17, 'अठारह': 18, 'उन्नीस': 19,
      // Hindi - tens
      'बीस': 20, 'तीस': 30, 'चालीस': 40, 'पचास': 50,
      'साठ': 60, 'सत्तर': 70, 'अस्सी': 80, 'नब्बे': 90,
      // Hindi - hundreds
      'सौ': 100, 'हजार': 1000
    };

    // Correction commands
    this.correctionCommands = [
      'clear', 'delete', 'erase', 'remove', 'reset',
      'saaf karo', 'mita do', 'hatao', 'clear karo'
    ];

    // Structured command patterns (order matters - more specific first)
    this.commandPatterns = [
      // English patterns - Specific fields first
      { regex: /(?:my\s+)?aadhar\s+(?:number\s+)?(?:is\s+)?(\d[\d\s]+)/i, field: 'aadhar' },
      { regex: /(?:my\s+)?phone\s+(?:number\s+)?(?:is\s+)?(\d+)/i, field: 'phone' },
      { regex: /(?:my\s+)?mobile\s+(?:number\s+)?(?:is\s+)?(\d+)/i, field: 'phone' },
      { regex: /(?:my\s+)?email\s+(?:address\s+)?(?:is\s+)?(.+@.+\..+)/i, field: 'email' },
      { regex: /(?:my\s+)?pincode\s+(?:is\s+)?(\d+)/i, field: 'pincode' },
      { regex: /(?:my\s+)?age\s+(?:is\s+)?(\d+)/i, field: 'age' },
      { regex: /(?:i\s+am\s+)?(\d+)\s+years?\s+old/i, field: 'age' },
      { regex: /(?:my\s+)?name\s+(?:is\s+)?(.+)/i, field: 'name' },
      { regex: /(?:i\s+am\s+)?([a-zA-Z\s]+)$/i, field: 'name', priority: 'low' },
      { regex: /(?:my\s+)?address\s+(?:is\s+)?(.+)/i, field: 'address' },
      { regex: /(?:i\s+live\s+(?:at|in)\s+)?(.+)/i, field: 'address', priority: 'low' },

      // Hindi patterns
      { regex: /mera\s+naam\s+(.+?)(?:\s+hai)?$/i, field: 'name' },
      { regex: /(?:meri\s+)?umar\s+(\d+)(?:\s+(?:saal|varsh))?/i, field: 'age' },
      { regex: /main\s+(\d+)\s+(?:saal|varsh)/i, field: 'age' },
      { regex: /(?:mera\s+)?aadhar\s+(?:number\s+)?(\d[\d\s]+)/i, field: 'aadhar' },
      { regex: /(?:mera\s+)?phone\s+(?:number\s+)?(\d+)/i, field: 'phone' },
      { regex: /(?:mera\s+)?mobile\s+(\d+)/i, field: 'phone' },
      { regex: /(?:mera\s+)?pata\s+(.+)/i, field: 'address' },
      { regex: /(?:main\s+)?(.+)\s+(?:mein\s+)?rahta\s+hun/i, field: 'address', priority: 'low' },

      // Income field patterns (MUST come before generic patterns)
      { regex: /(?:my\s+)?(?:annual\s+)?income\s+(?:is\s+)?(\d+)/i, field: 'income' },
      { regex: /(?:meri\s+)?(?:varshik\s+)?aay\s+(\d+)/i, field: 'income' },
      { regex: /(?:i\s+earn\s+)?(\d+)\s+(?:per\s+year|annually)/i, field: 'income' },

      // Additional document fields (common in Indian forms)
      { regex: /(?:my\s+)?pan\s+(?:number\s+)?(?:is\s+)?([A-Z]{5}\d{4}[A-Z])/i, field: 'pan' },
      { regex: /(?:my\s+)?voter\s+(?:id\s+)?(?:is\s+)?(.+)/i, field: 'voter_id' },
      { regex: /(?:bank\s+)?account\s+(?:number\s+)?(?:is\s+)?(\d+)/i, field: 'account' },
      { regex: /(?:ifsc\s+)?code\s+(?:is\s+)?([A-Z]{4}\d{7})/i, field: 'ifsc' }
    ];
  }

  // Set the currently focused field
  setFocusedField(field) {
    this.focusedField = field;
  }

  // Main processing function with enhanced contextualization
  processTranscript(transcript, focusedField = null, formContext = {}) {
    if (!transcript || transcript.trim().length === 0) {
      return null;
    }

    const cleanTranscript = transcript.trim();
    const lowerTranscript = cleanTranscript.toLowerCase();

    // Update focused field if provided
    if (focusedField) {
      this.focusedField = focusedField;
    }

    // Check for correction commands
    if (this.correctionCommands.some(cmd => lowerTranscript.includes(cmd))) {
      if (this.focusedField) {
        return { field: this.focusedField, value: '', confidence: 'high', action: 'clear' };
      }
      return null;
    }

    // Priority 1: STRICT - If field is focused, ONLY fill that field unless explicit command
    if (this.focusedField) {
      // Check if transcript contains explicit field mention that differs from focused field
      const hasExplicitFieldMention = this.commandPatterns.some(pattern => {
        const match = cleanTranscript.match(pattern.regex);
        return match && pattern.field !== this.focusedField;
      });

      // If no explicit different field mentioned, treat as natural input for focused field
      if (!hasExplicitFieldMention) {
        const value = this.processNaturalInput(cleanTranscript, this.focusedField);
        if (value !== null && value !== undefined && value !== '') {
          // Semantic validation: Check if the value makes sense for the focused field
          const semanticScore = this.getSemanticScore(value, this.focusedField, formContext);
          
          console.log(`[Voice] Field: ${this.focusedField}, Value: "${value}", Score: ${semanticScore.toFixed(2)}`);
          
          // Accept if score is above 0.5 (more lenient)
          if (semanticScore >= 0.5) {
            return { 
              field: this.focusedField, 
              value, 
              confidence: semanticScore >= 0.7 ? 'high' : 'medium',
              semanticScore 
            };
          } else {
            console.warn(`[Voice] Rejected - Low score (${semanticScore.toFixed(2)}) for ${this.focusedField}: "${value}"`);
          }
        }
        // If validation fails, don't try other fields - return null
        return null;
      }
    }

    // Priority 2: Check for EXPLICIT structured commands (only if no field focused or explicit mention)
    const structured = this.parseStructuredCommand(cleanTranscript);
    if (structured && structured.priority === 'high') {
      // Only accept high-priority structured commands (explicit field mentions)
      const semanticScore = this.getSemanticScore(structured.value, structured.field, formContext);
      return { ...structured, confidence: 'high', semanticScore };
    }

    // Priority 3: Smart inference with high confidence threshold
    // Only when no field is focused and no explicit command found
    if (!this.focusedField) {
      const inferred = this.inferFieldFromContent(cleanTranscript);
      if (inferred) {
        const semanticScore = this.getSemanticScore(inferred.value, inferred.field, formContext);
        
        // Only accept high-confidence inferences
        if (semanticScore >= 0.8) {
          return { 
            ...inferred, 
            confidence: 'medium', 
            semanticScore,
            source: 'inference'
          };
        }
      }
    }

    return null;
  }

  // NEW: Semantic scoring to validate if value makes sense for the field
  getSemanticScore(value, field, formContext = {}) {
    let score = 0.5; // Start with neutral
    const fieldLower = field.toLowerCase();
    const valueLower = value.toLowerCase();

    // Type compatibility check (40% weight)
    const typeMatch = this.checkTypeCompatibility(value, field);
    score += typeMatch * 0.4;

    // Length appropriateness (20% weight)
    const lengthScore = this.checkLengthAppropriate(value, field);
    score += lengthScore * 0.2;

    // Context awareness (20% weight)
    const contextScore = this.checkContextualFit(value, field, formContext);
    score += contextScore * 0.2;

    // Content pattern match (20% weight)
    const patternScore = this.checkContentPatterns(value, field);
    score += patternScore * 0.2;

    return Math.min(Math.max(score, 0), 1); // Clamp between 0-1
  }

  // Check if value type matches field expectations
  checkTypeCompatibility(value, field) {
    const fieldLower = field.toLowerCase();
    const valueClean = value.replace(/\s+/g, '').replace(/[-]/g, '');
    
    // Numeric fields
    if (fieldLower.includes('age') || fieldLower.includes('umar')) {
      return /^\d{1,3}$/.test(valueClean) ? 1.0 : 0.0;
    }
    
    if (fieldLower.includes('aadhar') || fieldLower.includes('aadhaar')) {
      return /^\d{12}$/.test(valueClean) ? 1.0 : 0.0;
    }
    
    if (fieldLower.includes('phone') || fieldLower.includes('mobile')) {
      return /^\d{10}$/.test(valueClean) ? 1.0 : 0.0;
    }
    
    if (fieldLower.includes('pin') || fieldLower.includes('postal')) {
      return /^\d{6}$/.test(valueClean) ? 1.0 : 0.0;
    }
    
    if (fieldLower.includes('income') || fieldLower.includes('salary')) {
      return /^\d+$/.test(valueClean) ? 1.0 : 0.0;
    }
    
    // Text fields
    if (fieldLower.includes('name') || fieldLower.includes('naam')) {
      return /^[a-zA-Z\s]+$/.test(value) ? 1.0 : 0.0;
    }
    
    if (fieldLower.includes('email')) {
      return /@/.test(value) ? 1.0 : 0.0;
    }
    
    if (fieldLower.includes('address') || fieldLower.includes('pata')) {
      return value.length > 5 ? 1.0 : 0.5;
    }
    
    // For unknown/dynamic fields (like document fields), be lenient
    // If it has reasonable length and content, give it a good score
    if (value.length >= 2 && value.length <= 500) {
      return 0.8; // High neutral score for unknown fields
    }
    
    return 0.6; // Still acceptable for very short values
  }

  // Check if length is appropriate for field
  checkLengthAppropriate(value, field) {
    const fieldLower = field.toLowerCase();
    const len = value.length;
    
    if (fieldLower.includes('name')) {
      return (len >= 2 && len <= 50) ? 1.0 : 0.2;
    }
    
    if (fieldLower.includes('age')) {
      return (len >= 1 && len <= 3) ? 1.0 : 0.0;
    }
    
    if (fieldLower.includes('aadhar')) {
      const digits = value.replace(/\D/g, '').length;
      return digits === 12 ? 1.0 : 0.0;
    }
    
    if (fieldLower.includes('phone')) {
      const digits = value.replace(/\D/g, '').length;
      return digits === 10 ? 1.0 : 0.0;
    }
    
    if (fieldLower.includes('address')) {
      return (len >= 5 && len <= 500) ? 1.0 : 0.5;
    }
    
    // Be more lenient for unknown fields
    if (len >= 1 && len <= 500) {
      return 0.9;
    }
    
    return 0.7; // Still okay for edge cases
  }

  // Check contextual fit (e.g., not filling same value again)
  checkContextualFit(value, field, formContext) {
    // If no context provided, assume good fit
    if (!formContext || !formContext.filledFields) {
      return 1.0;
    }
    
    // Check if value is already filled (avoid duplicates)
    if (formContext.filledFields[field]) {
      const existing = formContext.filledFields[field];
      if (existing === value) {
        return 0.8; // Allow re-filling same value (user might be correcting)
      }
    }
    
    // Check if value is similar to other fields (potential misplacement)
    // But be more lenient - only penalize exact matches in critical fields
    const criticalFields = ['name', 'aadhar', 'phone'];
    const fieldLower = field.toLowerCase();
    const isCritical = criticalFields.some(cf => fieldLower.includes(cf));
    
    if (isCritical) {
      for (const [otherField, otherValue] of Object.entries(formContext.filledFields)) {
        if (otherField !== field && otherValue === value) {
          return 0.5; // Moderate penalty for duplicates in critical fields
        }
      }
    }
    
    return 1.0; // Good contextual fit
  }

  // Check content patterns specific to field types
  checkContentPatterns(value, field) {
    const fieldLower = field.toLowerCase();
    const valueLower = value.toLowerCase();
    
    // Name fields should have name-like patterns
    if (fieldLower.includes('name')) {
      // Check for common name patterns
      const hasCapitals = /[A-Z]/.test(value);
      const noNumbers = !/\d/.test(value);
      const wordCount = value.split(/\s+/).length;
      
      let score = 0.5;
      if (hasCapitals) score += 0.2;
      if (noNumbers) score += 0.2;
      if (wordCount >= 2 && wordCount <= 4) score += 0.1;
      
      return score;
    }
    
    // Age should be reasonable
    if (fieldLower.includes('age')) {
      const age = parseInt(value);
      if (age >= 1 && age <= 120) return 1.0;
      if (age > 0 && age <= 150) return 0.5;
      return 0.0;
    }
    
    // Phone numbers often start with 6-9 in India
    if (fieldLower.includes('phone')) {
      const firstDigit = value.replace(/\D/g, '')[0];
      if (['6', '7', '8', '9'].includes(firstDigit)) return 1.0;
      return 0.6;
    }
    
    return 0.7; // Neutral
  }

  // Process natural speech for focused field
  processNaturalInput(text, field) {
    let value = text;

    // Convert number words to digits
    value = this.convertNumberWords(value);

    // Remove common voice artifacts
    value = this.cleanVoiceInput(value);

    // Format based on field type
    value = this.formatValue(field, value);

    // Validate
    if (!this.validateValue(field, value)) {
      return null;
    }

    return value;
  }

  // Parse structured commands
  parseStructuredCommand(text) {
    const matches = [];

    for (const pattern of this.commandPatterns) {
      const match = text.match(pattern.regex);
      if (match) {
        let value = match[1].trim();
        value = this.convertNumberWords(value);
        value = this.cleanVoiceInput(value);
        value = this.formatValue(pattern.field, value);

        if (this.validateValue(pattern.field, value)) {
          matches.push({
            field: pattern.field,
            value,
            priority: pattern.priority || 'high'
          });
        }
      }
    }

    // Return highest priority match
    const highPriority = matches.find(m => m.priority === 'high');
    return highPriority || matches[0] || null;
  }

  // Infer field from content type
  inferFieldFromContent(text) {
    const cleanText = this.cleanVoiceInput(text);

    // Check if it's purely numeric
    if (/^\d+$/.test(cleanText)) {
      const digits = cleanText.length;

      if (digits <= 3) {
        return { field: 'age', value: cleanText };
      } else if (digits === 6) {
        return { field: 'pincode', value: cleanText };
      } else if (digits === 10) {
        return { field: 'phone', value: cleanText };
      } else if (digits === 12) {
        return { field: 'aadhar', value: this.formatValue('aadhar', cleanText) };
      }
    }

    // Check if it's a name (alphabetic with spaces)
    if (/^[a-zA-Z\s]+$/.test(cleanText) && cleanText.length > 2) {
      return { field: 'name', value: this.formatValue('name', cleanText) };
    }

    // Check if it's an email
    if (this.fieldPatterns.email.test(cleanText)) {
      return { field: 'email', value: cleanText.toLowerCase() };
    }

    // Longer text might be address
    if (cleanText.length > 20) {
      return { field: 'address', value: cleanText };
    }

    return null;
  }

  // Convert number words to digits
  convertNumberWords(text) {
    let result = text;

    // Simple conversion for common cases
    Object.keys(this.numberWords).forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      result = result.replace(regex, this.numberWords[word].toString());
    });

    // Handle compound numbers like "twenty five"
    result = result.replace(/(\d+)\s+(\d+)/g, (match, p1, p2) => {
      const num1 = parseInt(p1);
      const num2 = parseInt(p2);
      if (num1 >= 20 && num1 < 100 && num2 < 10) {
        return (num1 + num2).toString();
      }
      return match;
    });

    return result;
  }

  // Clean voice input artifacts
  cleanVoiceInput(text) {
    return text
      .replace(/\s+/g, ' ') // Multiple spaces to single
      .replace(/[^\w\s@.-]/g, '') // Remove special chars except email chars
      .trim();
  }

  // Format value based on field type
  formatValue(field, value) {
    const fieldLower = field.toLowerCase();

    // Handle field name variations
    if (fieldLower.includes('name') || fieldLower.includes('naam')) {
      return value
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }

    if (fieldLower.includes('age') || fieldLower.includes('umar')) {
      return value.replace(/\D/g, '');
    }

    if (fieldLower.includes('aadhar') || fieldLower.includes('aadhaar')) {
      const aadharDigits = value.replace(/\D/g, '');
      if (aadharDigits.length === 12) {
        return aadharDigits.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3');
      }
      return aadharDigits;
    }

    if (fieldLower.includes('phone') || fieldLower.includes('mobile')) {
      const phoneDigits = value.replace(/\D/g, '');
      if (phoneDigits.length === 10) {
        return phoneDigits.replace(/(\d{5})(\d{5})/, '$1-$2');
      }
      return phoneDigits;
    }

    if (fieldLower.includes('pin') || fieldLower.includes('postal')) {
      return value.replace(/\D/g, '');
    }

    if (fieldLower.includes('email')) {
      return value.toLowerCase();
    }

    if (fieldLower.includes('pan')) {
      return value.toUpperCase();
    }

    if (fieldLower.includes('ifsc')) {
      return value.toUpperCase();
    }

    // Default switches for exact field matches
    switch (field) {
      case 'aadhar':
        const aadharDigits = value.replace(/\D/g, '');
        if (aadharDigits.length === 12) {
          return aadharDigits.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3');
        }
        return aadharDigits;

      case 'phone':
      case 'mobile':
        const phoneDigits = value.replace(/\D/g, '');
        if (phoneDigits.length === 10) {
          return phoneDigits.replace(/(\d{5})(\d{5})/, '$1-$2');
        }
        return phoneDigits;

      case 'pincode':
        return value.replace(/\D/g, '');

      case 'name':
        return value
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');

      case 'email':
        return value.toLowerCase();

      case 'age':
        return value.replace(/\D/g, '');

      case 'income':
      case 'annual_income':
      case 'salary':
        return value.replace(/\D/g, '');

      case 'pan':
      case 'ifsc':
        return value.toUpperCase();

      default:
        // For unknown fields, return as-is but trimmed
        return value.trim();
    }
  }

  // Validate value for field type
  validateValue(field, value) {
    if (!value) return false;

    const fieldLower = field.toLowerCase();

    // Handle field name variations
    if (fieldLower.includes('name') || fieldLower.includes('naam')) {
      return /^[a-zA-Z\s]{2,100}$/.test(value);
    }

    if (fieldLower.includes('age') || fieldLower.includes('umar')) {
      const age = parseInt(value);
      return age >= 0 && age <= 150;
    }

    if (fieldLower.includes('aadhar') || fieldLower.includes('aadhaar')) {
      const aadharDigits = value.replace(/\D/g, '');
      return aadharDigits.length === 12;
    }

    if (fieldLower.includes('phone') || fieldLower.includes('mobile')) {
      const phoneDigits = value.replace(/\D/g, '');
      return phoneDigits.length === 10;
    }

    if (fieldLower.includes('pin') || fieldLower.includes('postal')) {
      return /^\d{6}$/.test(value.replace(/\D/g, ''));
    }

    if (fieldLower.includes('email')) {
      return this.fieldPatterns.email.test(value);
    }

    if (fieldLower.includes('pan')) {
      return /^[A-Z]{5}\d{4}[A-Z]$/.test(value);
    }

    if (fieldLower.includes('ifsc')) {
      return /^[A-Z]{4}\d{7}$/.test(value);
    }

    // Default switches for exact matches
    switch (field) {
      case 'name':
        return /^[a-zA-Z\s]{2,100}$/.test(value);

      case 'age':
        const age = parseInt(value);
        return age >= 0 && age <= 150;

      case 'aadhar':
        const aadharDigits = value.replace(/\D/g, '');
        return aadharDigits.length === 12;

      case 'phone':
      case 'mobile':
        const phoneDigits = value.replace(/\D/g, '');
        return phoneDigits.length === 10;

      case 'pincode':
        return /^\d{6}$/.test(value.replace(/\D/g, ''));

      case 'email':
        return this.fieldPatterns.email.test(value);

      case 'address':
        return value.length >= 5 && value.length <= 500;

      case 'income':
      case 'annual_income':
      case 'salary':
        const income = parseInt(value.replace(/\D/g, ''));
        return !isNaN(income) && income >= 0 && income <= 100000000; // Up to 10 crore

      case 'pan':
        return /^[A-Z]{5}\d{4}[A-Z]$/.test(value);

      case 'ifsc':
        return /^[A-Z]{4}\d{7}$/.test(value);

      default:
        // For dynamic/unknown fields, be lenient
        return value.length > 0 && value.length <= 500;
    }
  }

  // Get field order for auto-navigation
  getNextField(currentField, availableFields) {
    const currentIndex = availableFields.indexOf(currentField);
    if (currentIndex !== -1 && currentIndex < availableFields.length - 1) {
      return availableFields[currentIndex + 1];
    }
    return null;
  }

  // Throttle function for performance
  throttle(func, wait) {
    let timeout;
    let lastRan;

    return function executedFunction(...args) {
      const context = this;

      if (!lastRan) {
        func.apply(context, args);
        lastRan = Date.now();
      } else {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          if (Date.now() - lastRan >= wait) {
            func.apply(context, args);
            lastRan = Date.now();
          }
        }, wait - (Date.now() - lastRan));
      }
    };
  }
}

// Export singleton instance
export default new VoiceFormProcessor();
