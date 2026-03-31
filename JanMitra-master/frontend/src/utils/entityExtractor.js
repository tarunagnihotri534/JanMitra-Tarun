// Entity Extractor - ML-based entity recognition for bilingual voice input
// Supports Hindi and English with pattern matching and heuristics

import trainingData, { fieldKeywords } from '../data/trainingData';

class EntityExtractor {
    constructor() {
        this.trainingData = trainingData;
        this.fieldKeywords = fieldKeywords;

        // Number word mappings
        this.numberWords = {
            // English
            'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
            'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
            'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
            'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19,
            'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50,
            'sixty': 60, 'seventy': 70, 'eighty': 80, 'ninety': 90,

            // Hindi
            'शून्य': 0, 'एक': 1, 'दो': 2, 'तीन': 3, 'चार': 4, 'पांच': 5, 'पाँच': 5,
            'छह': 6, 'छः': 6, 'सात': 7, 'आठ': 8, 'नौ': 9, 'दस': 10,
            'ग्यारह': 11, 'बारह': 12, 'तेरह': 13, 'चौदह': 14, 'पंद्रह': 15,
            'सोलह': 16, 'सत्रह': 17, 'अठारह': 18, 'उन्नीस': 19,
            'बीस': 20, 'तीस': 30, 'चालीस': 40, 'पचास': 50, 'पच्चीस': 25,
            'साठ': 60, 'सत्तर': 70, 'अस्सी': 80, 'नब्बे': 90
        };

        // Entity patterns
        this.patterns = {
            PHONE: /\b[6-9]\d{9}\b/g,
            AADHAAR: /\b\d{4}\s?\d{4}\s?\d{4}\b/g,
            EMAIL: /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g,
            PINCODE: /\b\d{6}\b/g,
            AGE_DIGIT: /\b(\d{1,3})\s*(?:साल|saal|years?|year|वर्ष)\b/gi,
            AGE_STANDALONE: /\b(1?\d{1,2})\b/g // Matches standalone numbers 1-199
        };
    }

    /**
     * Main extraction method
     * @param {string} text - Input text from speech
     * @param {string} language - Language code ('hi' or 'en')
     * @returns {Array} Array of extracted entities
     */
    extractEntities(text, language = 'en') {
        if (!text || text.trim().length === 0) {
            return [];
        }

        const normalizedText = text.toLowerCase().trim();
        const entities = [];

        // Step 1: Extract structured entities (phone, email, etc.)
        entities.push(...this.extractStructuredEntities(normalizedText));

        // Step 2: Extract contextual entities (name, age with context)
        entities.push(...this.extractContextualEntities(normalizedText, language));

        // Step 3: Deduplicate and score
        const scoredEntities = this.scoreAndDeduplicate(entities, normalizedText, language);

        return scoredEntities;
    }

    /**
     * Extract entities with clear patterns (phone, email, aadhaar, pincode)
     */
    extractStructuredEntities(text) {
        const entities = [];

        // Phone numbers
        const phones = text.matchAll(this.patterns.PHONE);
        for (const match of phones) {
            entities.push({
                type: 'PHONE',
                value: match[0].replace(/\s/g, ''),
                confidence: 0.95,
                start: match.index,
                end: match.index + match[0].length
            });
        }

        // Aadhaar numbers
        const aadhaars = text.matchAll(this.patterns.AADHAAR);
        for (const match of aadhaars) {
            entities.push({
                type: 'AADHAAR',
                value: match[0].replace(/\s/g, ''),
                confidence: 0.95,
                start: match.index,
                end: match.index + match[0].length
            });
        }

        // Email addresses
        const emails = text.matchAll(this.patterns.EMAIL);
        for (const match of emails) {
            entities.push({
                type: 'EMAIL',
                value: match[0],
                confidence: 0.95,
                start: match.index,
                end: match.index + match[0].length
            });
        }

        // Pincodes (only if not part of phone/aadhaar)
        const pincodes = text.matchAll(this.patterns.PINCODE);
        for (const match of pincodes) {
            // Check if this is not part of a phone or aadhaar
            const isPartOfOther = entities.some(e =>
                e.start <= match.index && e.end >= match.index + match[0].length
            );

            if (!isPartOfOther) {
                entities.push({
                    type: 'PINCODE',
                    value: match[0],
                    confidence: 0.8,
                    start: match.index,
                    end: match.index + match[0].length
                });
            }
        }

        return entities;
    }

    /**
     * Extract contextual entities (name, age, address)
     */
    extractContextualEntities(text, language) {
        const entities = [];

        // Age extraction
        const ageEntity = this.extractAge(text, language);
        if (ageEntity) entities.push(ageEntity);

        // Name extraction
        const nameEntity = this.extractName(text, language);
        if (nameEntity) entities.push(nameEntity);

        // Address extraction
        const addressEntity = this.extractAddress(text, language);
        if (addressEntity) entities.push(addressEntity);

        return entities;
    }

    /**
     * Extract age from text
     */
    extractAge(text, language) {
        // Try numeric age with context
        const ageWithContext = text.match(this.patterns.AGE_DIGIT);
        if (ageWithContext) {
            const ageMatch = ageWithContext[0].match(/\d{1,3}/);
            if (ageMatch) {
                const age = parseInt(ageMatch[0]);
                if (age >= 1 && age <= 150) {
                    return {
                        type: 'AGE',
                        value: age.toString(),
                        confidence: 0.9,
                        start: text.indexOf(ageWithContext[0]),
                        end: text.indexOf(ageWithContext[0]) + ageWithContext[0].length
                    };
                }
            }
        }

        // Try number words
        const converted = this.convertNumberWords(text);
        if (converted !== text) {
            const ageMatch = converted.match(/\b(\d{1,3})\b/);
            if (ageMatch) {
                const age = parseInt(ageMatch[1]);
                if (age >= 1 && age <= 150) {
                    return {
                        type: 'AGE',
                        value: age.toString(),
                        confidence: 0.85,
                        start: text.indexOf(ageMatch[0]),
                        end: text.indexOf(ageMatch[0]) + ageMatch[0].length
                    };
                }
            }
        }

        // Try standalone reasonable age numbers (18-99 only)
        const keywords = language === 'hi'
            ? ['उम्र', 'umar', 'आयु', 'age']
            : ['age', 'years', 'old'];

        for (const keyword of keywords) {
            if (text.includes(keyword)) {
                const matches = [...text.matchAll(this.patterns.AGE_STANDALONE)];
                for (const match of matches) {
                    const age = parseInt(match[1]);
                    if (age >= 18 && age <= 99) {
                        return {
                            type: 'AGE',
                            value: age.toString(),
                            confidence: 0.75,
                            start: match.index,
                            end: match.index + match[0].length
                        };
                    }
                }
            }
        }

        return null;
    }

    /**
     * Extract name from text
     */
    extractName(text, language) {
        const keywords = this.fieldKeywords[language]?.name || this.fieldKeywords.english.name;

        // Common patterns for name extraction
        const patterns = language === 'hi' ? [
            /(?:मेरा नाम|naam|नाम)\s+(?:है\s+)?([a-zA-Zा-ॿ\s]{2,30}?)(?:\s+है|\s+हूं|$)/i,
            /(?:मै|mai)\s+([a-zA-Zा-ॿ\s]{2,30}?)\s+(?:हूं|hun)/i
        ] : [
            /(?:my name is|name is|i am|i'm|called)\s+([a-z\s]{2,30}?)(?:\s+and|\s+age|$)/i,
            /^([a-z\s]{2,30}?)(?:\s+age|\s+years|$)/i
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                const name = match[1].trim();

                // Validate: should be 2-4 words, alphabetic
                const words = name.split(/\s+/);
                if (words.length >= 1 && words.length <= 4) {
                    const isValid = words.every(word =>
                        /^[a-zA-Zा-ॿ]+$/.test(word) && word.length >= 2
                    );

                    if (isValid) {
                        return {
                            type: 'NAME',
                            value: this.capitalizeName(name),
                            confidence: 0.85,
                            start: text.indexOf(match[1]),
                            end: text.indexOf(match[1]) + match[1].length
                        };
                    }
                }
            }
        }

        return null;
    }

    /**
     * Extract address from text
     */
    extractAddress(text, language) {
        const keywords = this.fieldKeywords[language]?.address || this.fieldKeywords.english.address;

        const patterns = language === 'hi' ? [
            /(?:मेरा पता|pata|पता)\s+(?:है\s+)?(.{5,100}?)(?:\s+है|$)/i,
            /(?:मै|रहता|रहती)\s+(.{5,100}?)\s+(?:में|mein|hun|हूं)/i
        ] : [
            /(?:my address is|address is|i live in)\s+(.{5,100}?)(?:\s+and|$)/i,
            /(?:address|live|staying)\s+(.{5,100}?)$/i
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                const address = match[1].trim();

                // Validate: should be at least 5 characters
                if (address.length >= 5 && address.length <= 100) {
                    return {
                        type: 'ADDRESS',
                        value: address,
                        confidence: 0.75,
                        start: text.indexOf(match[1]),
                        end: text.indexOf(match[1]) + match[1].length
                    };
                }
            }
        }

        return null;
    }

    /**
     * Convert number words to digits
     */
    convertNumberWords(text) {
        let result = text;

        Object.keys(this.numberWords).forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            result = result.replace(regex, this.numberWords[word].toString());
        });

        // Handle compound numbers like "twenty five" -> 25
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

    /**
     * Capitalize name properly
     */
    capitalizeName(name) {
        return name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }

    /**
     * Score and deduplicate entities
     */
    scoreAndDeduplicate(entities, text, language) {
        if (entities.length === 0) return [];

        // Remove duplicates (prefer higher confidence)
        const uniqueEntities = [];
        const seen = new Set();

        entities
            .sort((a, b) => b.confidence - a.confidence)
            .forEach(entity => {
                const key = `${entity.type}-${entity.value}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    uniqueEntities.push(entity);
                }
            });

        return uniqueEntities;
    }

    /**
     * Detect language from text
     */
    detectLanguage(text) {
        const hindiChars = text.match(/[\u0900-\u097F]/g);
        const hindiRatio = hindiChars ? hindiChars.length / text.length : 0;
        return hindiRatio > 0.3 ? 'hi' : 'en';
    }
}

// Export singleton instance
export default new EntityExtractor();
