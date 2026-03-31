// Quick Test Script for ML Voice Assistant
// Copy this into browser console (F12) to test the ML components

import entityExtractor from './src/utils/entityExtractor.js';
import mlFieldMapper from './src/utils/mlFieldMapper.js';

console.log('🧪 Testing ML Voice Assistant Components\n');

// Test 1: English Name & Age
console.log('TEST 1: English Multi-Field');
const test1 = "My name is Rajesh Kumar and I am 35 years old";
const entities1 = entityExtractor.extractEntities(test1, 'en');
console.log('Input:', test1);
console.log('Entities:', entities1);

const mappings1 = mlFieldMapper.mapToFields(
    test1,
    'en',
    null,
    { availableFields: ['name', 'age', 'phone', 'aadhar'], filledFields: {} }
);
console.log('Field Mappings:', mappings1);
console.log('✅ Expected: name="Rajesh Kumar", age="35"\n');

// Test 2: Hindi
console.log('TEST 2: Hindi Multi-Field');
const test2 = "मेरा नाम राज है और उम्र 25 साल";
const entities2 = entityExtractor.extractEntities(test2, 'hi');
console.log('Input:', test2);
console.log('Entities:', entities2);

const mappings2 = mlFieldMapper.mapToFields(
    test2,
    'hi',
    null,
    { availableFields: ['name', 'age', 'phone'], filledFields: {} }
);
console.log('Field Mappings:', mappings2);
console.log('✅ Expected: name="राज", age="25"\n');

// Test 3: Phone & Aadhaar
console.log('TEST 3: Structured Data');
const test3 = "Phone 9876543210 and Aadhaar 1234 5678 9012";
const entities3 = entityExtractor.extractEntities(test3, 'en');
console.log('Input:', test3);
console.log('Entities:', entities3);
console.log('✅ Expected: phone="9876543210", aadhaar="123456789012"\n');

// Test 4: Number Words
console.log('TEST 4: Number Words');
const test4 = "I am twenty five years old";
const entities4 = entityExtractor.extractEntities(test4, 'en');
console.log('Input:', test4);
console.log('Entities:', entities4);
console.log('✅ Expected: age="25"\n');

// Test 5: Hindi Number Words
console.log('TEST 5: Hindi Number Words');
const test5 = "मेरी उम्र पच्चीस साल है";
const entities5 = entityExtractor.extractEntities(test5, 'hi');
console.log('Input:', test5);
console.log('Entities:', entities5);
console.log('✅ Expected: age="25"\n');

console.log('🎉 All tests complete! Check results above.');
