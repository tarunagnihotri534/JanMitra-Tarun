// Training Data for ML-based Entity Recognition
// Bilingual (Hindi + English) examples for common form fields

export const trainingData = {
    hindi: [
        // Name patterns
        { text: "मेरा नाम राज है", entities: [{ type: "NAME", value: "राज", start: 8, end: 11 }] },
        { text: "मेरा नाम राज कुमार है", entities: [{ type: "NAME", value: "राज कुमार", start: 8, end: 17 }] },
        { text: "मै अमित हूं", entities: [{ type: "NAME", value: "अमित", start: 3, end: 7 }] },
        { text: "नाम सोनिया शर्मा", entities: [{ type: "NAME", value: "सोनिया शर्मा", start: 4, end: 15 }] },
        { text: "विकास प्रसाद", entities: [{ type: "NAME", value: "विकास प्रसाद", start: 0, end: 12 }] },

        // Age patterns
        { text: "मेरी उम्र पच्चीस साल है", entities: [{ type: "AGE", value: "25", start: 9, end: 15 }] },
        { text: "मै 25 साल का हूं", entities: [{ type: "AGE", value: "25", start: 3, end: 5 }] },
        { text: "उम्र तीस वर्ष", entities: [{ type: "AGE", value: "30", start: 4, end: 8 }] },
        { text: "मेरी आयु बीस साल", entities: [{ type: "AGE", value: "20", start: 8, end: 12 }] },
        { text: "35 साल", entities: [{ type: "AGE", value: "35", start: 0, end: 2 }] },

        // Phone patterns
        { text: "मेरा फोन नंबर 9876543210 है", entities: [{ type: "PHONE", value: "9876543210", start: 15, end: 25 }] },
        { text: "मोबाइल 9123456789", entities: [{ type: "PHONE", value: "9123456789", start: 7, end: 17 }] },
        { text: "फोन नम्बर 8765432109", entities: [{ type: "PHONE", value: "8765432109", start: 11, end: 21 }] },
        { text: "नंबर 7654321098 है", entities: [{ type: "PHONE", value: "7654321098", start: 5, end: 15 }] },

        // Aadhaar patterns
        { text: "मेरा आधार कार्ड 123456789012 है", entities: [{ type: "AADHAAR", value: "123456789012", start: 16, end: 28 }] },
        { text: "आधार नंबर 234567890123", entities: [{ type: "AADHAAR", value: "234567890123", start: 11, end: 23 }] },
        { text: "1234 5678 9012", entities: [{ type: "AADHAAR", value: "123456789012", start: 0, end: 14 }] },

        // Address patterns
        { text: "मेरा पता दिल्ली सेक्टर 15 है", entities: [{ type: "ADDRESS", value: "दिल्ली सेक्टर 15", start: 8, end: 24 }] },
        { text: "मै मुंबई अंधेरी में रहता हूं", entities: [{ type: "ADDRESS", value: "मुंबई अंधेरी", start: 3, end: 15 }] },
        { text: "पता बैंगलोर इंदिरानगर", entities: [{ type: "ADDRESS", value: "बैंगलोर इंदिरानगर", start: 4, end: 21 }] },

        // Email patterns  
        { text: "मेरा ईमेल raj@gmail.com है", entities: [{ type: "EMAIL", value: "raj@gmail.com", start: 10, end: 23 }] },
        { text: "ईमेल आईडी amit.sharma@yahoo.co.in", entities: [{ type: "EMAIL", value: "amit.sharma@yahoo.co.in", start: 10, end: 33 }] },

        // Pincode patterns
        { text: "मेरा पिनकोड 110001 है", entities: [{ type: "PINCODE", value: "110001", start: 12, end: 18 }] },
        { text: "पोस्टल कोड 560001", entities: [{ type: "PINCODE", value: "560001", start: 11, end: 17 }] },

        // Multi-entity patterns
        {
            text: "मेरा नाम राज है और उम्र 25 साल", entities: [
                { type: "NAME", value: "राज", start: 8, end: 11 },
                { type: "AGE", value: "25", start: 23, end: 25 }
            ]
        },
        {
            text: "नाम विकास कुमार उम्र 30 फोन 9876543210", entities: [
                { type: "NAME", value: "विकास कुमार", start: 4, end: 15 },
                { type: "AGE", value: "30", start: 21, end: 23 },
                { type: "PHONE", value: "9876543210", start: 28, end: 38 }
            ]
        }
    ],

    english: [
        // Name patterns
        { text: "my name is raj", entities: [{ type: "NAME", value: "raj", start: 11, end: 14 }] },
        { text: "my name is raj kumar", entities: [{ type: "NAME", value: "raj kumar", start: 11, end: 20 }] },
        { text: "i am amit sharma", entities: [{ type: "NAME", value: "amit sharma", start: 5, end: 16 }] },
        { text: "name is sonia verma", entities: [{ type: "NAME", value: "sonia verma", start: 8, end: 19 }] },
        { text: "john smith", entities: [{ type: "NAME", value: "john smith", start: 0, end: 10 }] },
        { text: "i'm vikram", entities: [{ type: "NAME", value: "vikram", start: 4, end: 10 }] },

        // Age patterns
        { text: "my age is 25", entities: [{ type: "AGE", value: "25", start: 10, end: 12 }] },
        { text: "i am 30 years old", entities: [{ type: "AGE", value: "30", start: 5, end: 7 }] },
        { text: "age is twenty five", entities: [{ type: "AGE", value: "25", start: 7, end: 18 }] },
        { text: "i'm 35 years", entities: [{ type: "AGE", value: "35", start: 4, end: 6 }] },
        { text: "twenty years old", entities: [{ type: "AGE", value: "20", start: 0, end: 6 }] },
        { text: "age 28", entities: [{ type: "AGE", value: "28", start: 4, end: 6 }] },

        // Phone patterns
        { text: "my phone number is 9876543210", entities: [{ type: "PHONE", value: "9876543210", start: 19, end: 29 }] },
        { text: "phone 9123456789", entities: [{ type: "PHONE", value: "9123456789", start: 6, end: 16 }] },
        { text: "mobile number 8765432109", entities: [{ type: "PHONE", value: "8765432109", start: 14, end: 24 }] },
        { text: "contact number is 7654321098", entities: [{ type: "PHONE", value: "7654321098", start: 18, end: 28 }] },

        // Aadhaar patterns
        { text: "my aadhaar number is 123456789012", entities: [{ type: "AADHAAR", value: "123456789012", start: 21, end: 33 }] },
        { text: "aadhaar 234567890123", entities: [{ type: "AADHAAR", value: "234567890123", start: 8, end: 20 }] },
        { text: "aadhar number 345678901234", entities: [{ type: "AADHAAR", value: "345678901234", start: 14, end: 26 }] },
        { text: "1234 5678 9012", entities: [{ type: "AADHAAR", value: "123456789012", start: 0, end: 14 }] },

        // Address patterns
        { text: "my address is delhi sector 15", entities: [{ type: "ADDRESS", value: "delhi sector 15", start: 14, end: 29 }] },
        { text: "i live in mumbai andheri", entities: [{ type: "ADDRESS", value: "mumbai andheri", start: 10, end: 24 }] },
        { text: "address bangalore indiranagar", entities: [{ type: "ADDRESS", value: "bangalore indiranagar", start: 8, end: 29 }] },
        { text: "pune koregaon park", entities: [{ type: "ADDRESS", value: "pune koregaon park", start: 0, end: 18 }] },

        // Email patterns
        { text: "my email is raj@gmail.com", entities: [{ type: "EMAIL", value: "raj@gmail.com", start: 12, end: 25 }] },
        { text: "email address amit.sharma@yahoo.co.in", entities: [{ type: "EMAIL", value: "amit.sharma@yahoo.co.in", start: 14, end: 37 }] },
        { text: "email john.doe@company.com", entities: [{ type: "EMAIL", value: "john.doe@company.com", start: 6, end: 26 }] },

        // Pincode patterns
        { text: "my pincode is 110001", entities: [{ type: "PINCODE", value: "110001", start: 14, end: 20 }] },
        { text: "postal code 560001", entities: [{ type: "PINCODE", value: "560001", start: 12, end: 18 }] },
        { text: "pin 400001", entities: [{ type: "PINCODE", value: "400001", start: 4, end: 10 }] },

        // Multi-entity patterns
        {
            text: "my name is raj and age is 25", entities: [
                { type: "NAME", value: "raj", start: 11, end: 14 },
                { type: "AGE", value: "25", start: 26, end: 28 }
            ]
        },
        {
            text: "name john age 30 phone 9876543210", entities: [
                { type: "NAME", value: "john", start: 5, end: 9 },
                { type: "AGE", value: "30", start: 14, end: 16 },
                { type: "PHONE", value: "9876543210", start: 23, end: 33 }
            ]
        },
        {
            text: "i'm amit sharma and my age is 28 years", entities: [
                { type: "NAME", value: "amit sharma", start: 4, end: 15 },
                { type: "AGE", value: "28", start: 30, end: 32 }
            ]
        }
    ]
};

// Field keywords for mapping
export const fieldKeywords = {
    hindi: {
        name: ["नाम", "naam", "मेरा नाम", "mai", "मै"],
        age: ["उम्र", "umar", "आयु", "साल", "वर्ष", "saal"],
        phone: ["फोन", "phone", "मोबाइल", "mobile", "नंबर", "number"],
        aadhaar: ["आधार", "aadhaar", "aadhar", "कार्ड"],
        address: ["पता", "address", "रहता", "रहती", "live"],
        email: ["ईमेल", "email", "आईडी"],
        pincode: ["पिनकोड", "pincode", "पोस्टल", "postal"]
    },
    english: {
        name: ["name", "my name", "i am", "i'm", "called"],
        age: ["age", "years old", "year old", "years", "old"],
        phone: ["phone", "mobile", "contact", "number"],
        aadhaar: ["aadhaar", "aadhar", "adhaar"],
        address: ["address", "live", "staying", "residence"],
        email: ["email", "mail", "e-mail"],
        pincode: ["pincode", "pin code", "postal", "zip"]
    }
};

export default trainingData;
