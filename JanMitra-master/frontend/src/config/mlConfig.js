// ML Configuration - Settings for ML-based voice assistant

export const mlConfig = {
    // Entity types supported
    entityTypes: ['NAME', 'AGE', 'AADHAAR', 'PHONE', 'EMAIL', 'ADDRESS', 'PINCODE'],

    // Confidence thresholds
    confidence: {
        high: 0.85,      // Accept without confirmation
        medium: 0.65,    // Accept but show to user
        low: 0.50        // Minimum to suggest
    },

    // Language support
    languages: {
        supported: ['hi', 'en'],
        default: 'en',
        autoDetect: true
    },

    // Processing modes
    modes: {
        ml: true,              // Enable ML processing
        rule: true,            // Enable rule-based fallback
        hybrid: true,          // Use both (recommended)
        multiEntity: true      // Allow multiple entities per utterance
    },

    // Feature flags
    features: {
        enableLearning: false,          // Future: Learn from corrections
        enableMultiField: true,         // Fill multiple fields at once
        enableEntityPreview: true,      // Show detected entities in UI
        enableConfidenceScore: true,    // Display confidence scores
        enableVoiceConfirmation: true   // Speak confirmations
    },

    // Performance settings
    performance: {
        maxEntitiesPerUtterance: 5,
        processingTimeout: 500,      // ms
        debounceInterval: 300        // ms
    },

    // UI settings
    ui: {
        showEntityBadges: true,
        highlightFilledFields: true,
        animationDuration: 300,
        colors: {
            high: '#10b981',    // Green
            medium: '#f59e0b',  // Amber
            low: '#6b7280'      // Gray
        }
    },

    // Validation
    validation: {
        validateBeforeFill: true,
        strictMode: false,           // If true, reject low-confidence entities
        allowOverwrite: true         // Allow overwriting filled fields
    }
};

export default mlConfig;
