// ML Field Mapper - Intelligent mapping of extracted entities to form fields
// Uses semantic similarity and context awareness

import entityExtractor from './entityExtractor';

class MLFieldMapper {
    constructor() {
        // Entity type to field name mapping
        this.entityToFieldMap = {
            'NAME': ['name', 'fullName', 'full_name', 'applicant_name'],
            'AGE': ['age', 'applicant_age', 'year_of_birth'],
            'PHONE': ['phone', 'mobile', 'contact', 'phone_number', 'mobile_number'],
            'AADHAAR': ['aadhar', 'aadhaar', 'adhaar', 'aadhar_number', 'aadhaar_number'],
            'EMAIL': ['email', 'email_id', 'email_address'],
            'ADDRESS': ['address', 'permanent_address', 'residential_address'],
            'PINCODE': ['pincode', 'pin_code', 'postal_code', 'zip']
        };

        // Field priority scores (higher = more likely to be filled first)
        this.fieldPriority = {
            'name': 10,
            'age': 9,
            'phone': 8,
            'email': 7,
            'aadhar': 6,
            'address': 5,
            'pincode': 4
        };
    }

    /**
     * Main mapping function - maps extracted entities to form fields
     * @param {string} text - Original speech text
     * @param {string} language - Language code
     * @param {string} focusedField - Currently focused field (if any)
     * @param {Object} formContext - Available fields and filled values
     * @returns {Array} Array of field mappings
     */
    mapToFields(text, language, focusedField = null, formContext = {}) {
        // Step 1: Extract entities
        const entities = entityExtractor.extractEntities(text, language);

        if (entities.length === 0) {
            return [];
        }

        // Step 2: Map each entity to potential fields
        const mappings = [];

        for (const entity of entities) {
            const fieldMapping = this.mapEntityToField(entity, focusedField, formContext);
            if (fieldMapping) {
                mappings.push(fieldMapping);
            }
        }

        // Step 3: Resolve conflicts and prioritize
        const resolvedMappings = this.resolveConflicts(mappings, focusedField, formContext);

        return resolvedMappings;
    }

    /**
     * Map a single entity to the best matching field
     */
    mapEntityToField(entity, focusedField, formContext) {
        const { availableFields = [], filledFields = {} } = formContext;

        // Get candidate fields for this entity type
        const candidateFieldNames = this.entityToFieldMap[entity.type] || [];

        // Find matching fields in the form
        const matchingFields = availableFields.filter(field => {
            const fieldLower = field.toLowerCase();
            return candidateFieldNames.some(candidate =>
                fieldLower.includes(candidate) || candidate.includes(fieldLower)
            );
        });

        // If no exact matches, try fuzzy matching
        let targetField = matchingFields[0];

        if (!targetField && availableFields.length > 0) {
            // Fuzzy match based on entity type
            targetField = this.fuzzyMatchField(entity.type, availableFields);
        }

        if (!targetField) {
            return null;
        }

        // Calculate confidence score
        let confidence = entity.confidence;

        // Boost confidence if focused field matches
        if (focusedField && targetField === focusedField) {
            confidence = Math.min(1.0, confidence + 0.15);
        }

        // Reduce confidence if field already filled (might be a mistake)
        if (filledFields[targetField] && filledFields[targetField] !== '') {
            confidence = confidence * 0.7;
        }

        return {
            field: targetField,
            value: entity.value,
            confidence: confidence,
            entityType: entity.type,
            source: 'ml'
        };
    }

    /**
     * Fuzzy match entity type to available fields
     */
    fuzzyMatchField(entityType, availableFields) {
        const entityTypeLower = entityType.toLowerCase();

        // Try direct name match
        for (const field of availableFields) {
            const fieldLower = field.toLowerCase();
            if (fieldLower.includes(entityTypeLower) || entityTypeLower.includes(fieldLower)) {
                return field;
            }
        }

        // Try semantic matching
        const semanticMap = {
            'NAME': ['name', 'naam', 'full'],
            'AGE': ['age', 'umar', 'year', 'birth'],
            'PHONE': ['phone', 'mobile', 'contact', 'number'],
            'AADHAAR': ['aadhar', 'aadhaar', 'id', 'card'],
            'EMAIL': ['email', 'mail'],
            'ADDRESS': ['address', 'pata', 'location', 'residence'],
            'PINCODE': ['pin', 'postal', 'zip']
        };

        const keywords = semanticMap[entityType] || [];

        for (const field of availableFields) {
            const fieldLower = field.toLowerCase();
            if (keywords.some(keyword => fieldLower.includes(keyword))) {
                return field;
            }
        }

        return null;
    }

    /**
     * Resolve conflicts when multiple entities map to same field
     */
    resolveConflicts(mappings, focusedField, formContext) {
        if (mappings.length === 0) return [];

        // Group by field
        const fieldGroups = {};
        mappings.forEach(mapping => {
            if (!fieldGroups[mapping.field]) {
                fieldGroups[mapping.field] = [];
            }
            fieldGroups[mapping.field].push(mapping);
        });

        // For each field, keep only the highest confidence mapping
        const resolved = [];

        Object.keys(fieldGroups).forEach(field => {
            const candidates = fieldGroups[field];

            if (candidates.length === 1) {
                resolved.push(candidates[0]);
            } else {
                // Multiple candidates - pick best by confidence
                const best = candidates.reduce((prev, current) =>
                    current.confidence > prev.confidence ? current : prev
                );
                resolved.push(best);
            }
        });

        // Sort by confidence and field priority
        return resolved.sort((a, b) => {
            // Focused field always first
            if (focusedField) {
                if (a.field === focusedField) return -1;
                if (b.field === focusedField) return 1;
            }

            // Then by confidence
            if (Math.abs(a.confidence - b.confidence) > 0.1) {
                return b.confidence - a.confidence;
            }

            // Then by field priority
            const priorityA = this.fieldPriority[a.field.toLowerCase()] || 0;
            const priorityB = this.fieldPriority[b.field.toLowerCase()] || 0;
            return priorityB - priorityA;
        });
    }

    /**
     * Calculate semantic similarity between two strings
     */
    calculateSimilarity(str1, str2) {
        const s1 = str1.toLowerCase();
        const s2 = str2.toLowerCase();

        // Exact match
        if (s1 === s2) return 1.0;

        // Contains match
        if (s1.includes(s2) || s2.includes(s1)) return 0.8;

        // Calculate Jaccard similarity
        const set1 = new Set(s1.split(''));
        const set2 = new Set(s2.split(''));

        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);

        return intersection.size / union.size;
    }

    /**
     * Process multi-entity utterance
     * Example: "My name is Raj and age is 25"
     */
    processMultiEntity(text, language, formContext) {
        return this.mapToFields(text, language, null, formContext);
    }

    /**
     * Get suggested next field based on filled fields
     */
    suggestNextField(formContext) {
        const { availableFields = [], filledFields = {} } = formContext;

        // Find unfilled fields
        const unfilledFields = availableFields.filter(field =>
            !filledFields[field] || filledFields[field] === ''
        );

        if (unfilledFields.length === 0) return null;

        // Return field with highest priority
        return unfilledFields.reduce((prev, current) => {
            const priorityPrev = this.fieldPriority[prev.toLowerCase()] || 0;
            const priorityCurrent = this.fieldPriority[current.toLowerCase()] || 0;
            return priorityCurrent > priorityPrev ? current : prev;
        });
    }
}

// Export singleton instance
export default new MLFieldMapper();
