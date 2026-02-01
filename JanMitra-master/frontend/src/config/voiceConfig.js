// Voice Assistant Configuration
// Customize these settings for optimal voice recognition

export const voiceConfig = {
  // Recognition settings
  recognition: {
    // Continuous mode settings
    continuous: true,
    interimResults: true,
    maxAlternatives: 1,
    
    // Timeout settings (in milliseconds)
    silenceTimeout: 10000, // 10 seconds
    interimDebounce: 300, // 300ms
    autoFocusDelay: 150, // 150ms
    
    // Auto-restart settings
    autoRestartDelay: 1000, // 1 second
    maxRestartAttempts: 3,
  },

  // Language settings
  language: {
    // Language codes for speech recognition
    languageMap: {
      'en': 'en-IN',
      'hi': 'hi-IN',
      'bn': 'bn-IN',
      'ta': 'ta-IN',
      'te': 'te-IN',
      'mr': 'mr-IN',
      'pa': 'pa-IN',
      'bi': 'hi-IN' // Bihari uses Hindi recognition
    },
    
    // Fallback language
    defaultLanguage: 'en-IN'
  },

  // Visual feedback settings
  ui: {
    // Animation durations
    successAnimationDuration: 2000, // 2 seconds
    interimPreviewDelay: 100, // 100ms
    
    // Colors
    colors: {
      focused: '#3b82f6', // Blue
      success: '#10b981', // Green
      interim: '#f59e0b', // Amber
      error: '#ef4444' // Red
    },
    
    // Auto-enable on form pages
    autoEnableOnForms: true,
    
    // Show interim transcript
    showInterimTranscript: true,
    
    // Show focused field indicator
    showFocusedFieldIndicator: true
  },

  // Audio feedback settings
  audio: {
    // Enable audio confirmations
    enableConfirmations: true,
    
    // Speech synthesis settings
    volume: 1.0,
    rate: 1.0,
    pitch: 1.0,
    
    // Confirmation messages
    confirmationStyle: 'short' // 'short', 'detailed', 'none'
  },

  // Field detection settings
  fieldDetection: {
    // Confidence thresholds
    highConfidenceThreshold: 0.9,
    mediumConfidenceThreshold: 0.7,
    
    // Enable smart detection
    enableSmartDetection: true,
    
    // Enable auto-navigation
    enableAutoNavigation: true,
    
    // Enable auto-formatting
    enableAutoFormatting: true
  },

  // Validation settings
  validation: {
    // Enable real-time validation
    enableRealtimeValidation: true,
    
    // Show validation errors
    showValidationErrors: true,
    
    // Strict mode (reject invalid inputs)
    strictMode: true,
    
    // Age limits
    ageMin: 0,
    ageMax: 150,
    
    // Length limits
    nameMinLength: 2,
    nameMaxLength: 100,
    addressMinLength: 5,
    addressMaxLength: 500
  },

  // Performance settings
  performance: {
    // Enable throttling for interim results
    enableThrottling: true,
    throttleInterval: 150, // 150ms
    
    // Memory management
    maxTranscriptHistory: 10,
    clearHistoryInterval: 60000, // 1 minute
    
    // Error recovery
    enableAutoRecovery: true,
    recoveryAttempts: 3
  },

  // Debug settings
  debug: {
    // Enable console logging
    enableLogging: false,
    
    // Log levels: 'none', 'error', 'warn', 'info', 'debug'
    logLevel: 'warn',
    
    // Show confidence scores
    showConfidenceScores: false,
    
    // Performance monitoring
    enablePerformanceMonitoring: false
  }
};

// Helper function to get language code
export const getRecognitionLanguage = (languageCode) => {
  return voiceConfig.language.languageMap[languageCode] || voiceConfig.language.defaultLanguage;
};

// Helper function to check if on form page
export const isFormPage = (pathname) => {
  const pathParts = pathname.split('/');
  return pathParts[1] === 'forms' && pathParts[2];
};

// Helper function to get field order
export const getDefaultFieldOrder = () => {
  return ['name', 'age', 'aadhar', 'address', 'phone', 'email', 'pincode'];
};

export default voiceConfig;
