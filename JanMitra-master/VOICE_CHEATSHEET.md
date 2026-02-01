# Voice Commands Cheat Sheet

Quick reference for all voice commands and patterns.

## 🎤 Form Filling Commands

### Method 1: Focus & Speak (Easiest)
```
1. Click any field
2. Say the value
3. Done!
```

**Examples:**
| Field Focused | Say This | Result |
|--------------|----------|---------|
| Name | "Rajesh Kumar" | Fills name, capitalizes |
| Age | "25" or "twenty five" | Fills 25 |
| Aadhar | "1234 5678 9012" | Formats to 1234-5678-9012 |
| Phone | "9876543210" | Formats to 98765-43210 |
| Address | "123 Main Street, Delhi" | Fills address |
| Email | "user@email.com" | Fills email, lowercases |

### Method 2: Structured Commands (Hands-free)

**English:**
| Command | Fills |
|---------|-------|
| "My name is [name]" | Name field |
| "I am [number] years old" | Age field |
| "Age is [number]" | Age field |
| "Aadhar number is [number]" | Aadhar field |
| "My address is [address]" | Address field |
| "Phone number is [number]" | Phone field |
| "Email is [email]" | Email field |
| "Pincode is [number]" | Pincode field |

**Hindi:**
| Command | Fills |
|---------|-------|
| "Mera naam [naam] hai" | Name field |
| "Meri umar [number] saal hai" | Age field |
| "Mera aadhar [number]" | Aadhar field |
| "Mera pata [pata]" | Address field |
| "Mera phone [number]" | Phone field |

## 🎮 Control Commands

| Command | Action |
|---------|--------|
| "Guide me" | Open step-by-step guide |
| "Help" / "Madad" | Open guide |
| "Next" / "Agla" | Next guide step |
| "Previous" / "Piche" | Previous guide step |
| "Repeat" / "Phir se" | Repeat current step |
| "Stop" / "Band" / "Close" | Close guide |
| "Clear" / "Delete" | Clear focused field |

## 🔢 Number Conversion

**Say this → Get this:**
| Spoken | Written |
|--------|---------|
| "zero" / "शून्य" | 0 |
| "one" / "एक" | 1 |
| "twenty" / "बीस" | 20 |
| "twenty five" | 25 |
| "fifty two" | 52 |
| "one hundred" / "सौ" | 100 |

## 🎨 Visual Indicators

| Color | Meaning |
|-------|---------|
| 🔵 Blue border | Field focused |
| 🔵 Blue bubble | Interim transcript |
| 🟢 Green border | Voice filled |
| ✅ Green checkmark | Success confirmation |
| 🟢 Green badge | Continuous listening |
| ⚪ Gray text | Preview (interim) |

## ⚡ Quick Patterns

### Aadhar Numbers
```
Say: "one two three four five six seven eight nine zero one two"
→ Fills: 1234-5678-9012

Say: "1234 5678 9012"
→ Fills: 1234-5678-9012
```

### Phone Numbers
```
Say: "nine eight seven six five four three two one zero"
→ Fills: 98765-43210

Say: "9876543210"
→ Fills: 98765-43210
```

### Names
```
Say: "john smith"
→ Fills: "John Smith" (auto-capitalizes)

Say: "RAJESH KUMAR"
→ Fills: "Rajesh Kumar" (fixes case)
```

### Addresses
```
Say naturally: "123 Main Street, Sector 15, New Delhi, 110001"
→ Fills exactly as spoken
```

## 🔧 Troubleshooting Quick Fixes

| Problem | Say This / Do This |
|---------|-------------------|
| Wrong value | Focus field → "Clear" → Say correct value |
| Didn't hear | Click ON/OFF button to restart |
| Not filling | Check green badge is showing |
| Wrong field | Focus correct field first |
| Mic permission | Allow in browser settings (lock icon) |

## 📱 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Tab | Next field (works with voice!) |
| Shift+Tab | Previous field |
| Enter | Submit form |
| Escape | Close guide (if open) |

## 🌍 Language Support

| Language | Code | Speech Recognition |
|----------|------|-------------------|
| English | en | ✅ Full support |
| Hindi | hi | ✅ Full support |
| Bengali | bn | ✅ Recognition only |
| Tamil | ta | ✅ Recognition only |
| Telugu | te | ✅ Recognition only |
| Marathi | mr | ✅ Recognition only |
| Punjabi | pa | ✅ Recognition only |

**Note**: Pattern matching currently optimized for English & Hindi. Other languages work for natural speech when field is focused.

## ⚙️ Settings (for Developers)

Edit `frontend/src/config/voiceConfig.js`:

```javascript
// Disable auto-start
autoEnableOnForms: false

// Disable interim preview
showInterimTranscript: false

// Disable audio confirmations
enableConfirmations: false

// Change timeout
silenceTimeout: 5000  // 5 seconds instead of 10

// Strict validation
strictMode: true  // Reject invalid inputs
```

## 🎯 Common Use Cases

### Use Case 1: Long Forms
**Best approach**: Continuous mode + Focus & Speak
- Auto-enabled ✓
- Click field → Speak → Auto-moves ✓
- Complete quickly ✓

### Use Case 2: Short Forms
**Best approach**: Structured commands
- Say: "My name is X, age is Y, aadhar is Z"
- All fields fill at once ✓

### Use Case 3: Mobile
**Best approach**: Voice only (avoid typing on small screen)
- Tap field → Speak
- Much easier than typing! ✓

### Use Case 4: Accessibility
**Best approach**: Continuous voice with guide
- Say "Guide me" for step-by-step
- Follow voice prompts
- Completely hands-free ✓

## 📊 Performance Tips

### For Fastest Filling
1. Use Chrome browser
2. Good microphone
3. Quiet environment
4. Focus field before speaking
5. Speak clearly at normal pace
6. Use Tab key between fields

**Result**: Forms in 15-20 seconds!

### For Best Accuracy
1. Focus the field (99% accurate)
2. Speak complete value
3. Wait for green ✓ before moving
4. Check interim preview

**Result**: Zero errors!

### For Multitasking
1. Enable continuous mode
2. Don't watch screen constantly
3. Read from documents while speaking
4. System handles the rest

**Result**: More efficient workflow!

## 🎓 Learning Path

### Day 1: Basics
- Try focus & speak
- Fill 2-3 forms
- Get comfortable

### Day 2: Advanced
- Try structured commands
- Use auto-navigation
- Try corrections

### Day 3: Expert
- Mix voice and typing
- Use keyboard shortcuts
- Fill forms in <20 seconds

## 🌟 Pro Tips

1. **Tab is your friend** - Tab + Voice = Fastest combo
2. **Trust the preview** - Blue bubble shows what you're saying
3. **Don't watch the mic** - Just speak naturally
4. **Let it auto-navigate** - Don't manually click next field
5. **Use "clear" for mistakes** - Faster than backspace
6. **Focus for accuracy** - When in doubt, focus the field first

## 📞 Quick Help

| Issue | Quick Fix |
|-------|-----------|
| Not working | Refresh page |
| Won't start | Click ON/OFF button |
| Wrong field | Focus field first |
| Inaccurate | Speak slower |
| No permission | Allow in browser |
| Chrome only | Use Chrome/Edge |

## 🏃 Speed Challenges

### Challenge 1: Beat Your Record
- Fill standard form (4 fields)
- Current record: 13 seconds
- Can you beat it?

### Challenge 2: Zero Clicks
- Fill entire form using only voice commands
- No field clicking allowed!
- How fast can you go?

### Challenge 3: Eyes Closed
- Fill form without looking at screen
- Use only voice feedback
- Trust the auto-navigation!

---

## Print-Friendly Version

**Most Common:**
1. Click field → Say value → Done
2. "My name is [name]"
3. "Age is [number]"
4. "Aadhar is [12 digits]"
5. "Clear" to reset field

**Controls:**
- Green ON/OFF button (toggle continuous mode)
- Blue bubble (what you're saying)
- Green badge (listening status)

**Remember**: Chrome browser recommended!

---

**Keep this handy** while getting used to voice features! 📋✨
