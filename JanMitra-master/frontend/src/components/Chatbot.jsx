
import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';
import { MessageSquare, X, Send, Mic, ChevronDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const chatbotContent = {
    en: {
        title: "JanMitra",
        subtitle: "Bot Assistant",
        placeholder: "Type something...",
        disclaimer: "*JanMitra assistant can make mistakes. Consider checking important information.",
        welcome: "Hi! I am JanMitra Assistant, here to help you find eligible government schemes and provide information on eligibility criteria, application process, and more.",
        learning: "I'm still learning! Please try exploring the schemes section for more details.",
        chips: {
            info: "Information about schemes",
            dates: "Last dates for apply",
            safe: "Is JanMitra safe?"
        },
        responses: {
            safe: "Yes, JanMitra is completely safe. We use secure encryption to protect your data and only source information from official government portals.",
            scheme: "You can find detailed information about all government schemes in our 'Services' section. We cover 4590+ schemes!",
            dates: "Application deadlines vary by scheme. Please check the specific scheme details page for the most accurate last date.",
            hello: "Hello! How can I assist you with government schemes today?"
        }
    },
    hi: {
        title: "जनमित्र",
        subtitle: "बॉट सहायक",
        placeholder: "कुछ टाइप करें...",
        disclaimer: "*जनमित्र सहायक गलतियां कर सकता है। महत्वपूर्ण जानकारी की जांच करें।",
        welcome: "नमस्ते! मैं जनमित्र सहायक हूं, यहां आपकी पात्र सरकारी योजनाओं को खोजने और पात्रता मानदंड, आवेदन प्रक्रिया और अधिक जानकारी प्रदान करने में मदद करने के लिए हूं।",
        learning: "मैं अभी भी सीख रहा हूं! कृपया अधिक जानकारी के लिए योजना अनुभाग का अन्वेषण करें।",
        chips: {
            info: "योजनाओं के बारे में जानकारी",
            dates: "आवेदन की अंतिम तिथियां",
            safe: "क्या जनमित्र सुरक्षित है?"
        },
        responses: {
            safe: "हां, जनमित्र पूरी तरह सुरक्षित है। हम आपके डेटा की सुरक्षा के लिए सुरक्षित एन्क्रिप्शन का उपयोग करते हैं और केवल आधिकारिक सरकारी पोर्टलों से जानकारी प्राप्त करते हैं।",
            scheme: "आप हमारे 'सेवा' अनुभाग में सभी सरकारी योजनाओं के बारे में विस्तृत जानकारी प्राप्त कर सकते हैं। हम 4590+ योजनाओं को कवर करते हैं!",
            dates: "आवेदन की अंतिम तिथियां योजना के अनुसार भिन्न होती हैं। कृपया सबसे सटीक अंतिम तिथि के लिए विशिष्ट योजना विवरण पृष्ठ देखें।",
            hello: "नमस्ते! मैं आज सरकारी योजनाओं के साथ आपकी कैसे सहायता कर सकता हूं?"
        }
    }
};

const Chatbot = () => {
    const { language } = useLanguage();
    const currLang = (language === 'hi' || language === 'en') ? language : 'en'; // Default to English if not Hindi/English supported strictly yet
    const content = chatbotContent[currLang];

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { type: 'bot', text: content.welcome }
    ]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);

    // Reset messages when language changes
    useEffect(() => {
        setMessages([{ type: 'bot', text: content.welcome }]);
    }, [currLang]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMsg = inputValue;
        setInputValue('');
        setMessages(prev => [...prev, { type: 'user', text: userMsg }]);

        // Send to backend
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg, language: currLang })
            });
            const data = await res.json();

            if (res.ok && data.reply) {
                setMessages(prev => [...prev, { type: 'bot', text: data.reply }]);
            } else {
                setMessages(prev => [...prev, { type: 'bot', text: "Sorry, I encountered an error answering your question. " + (data.detail || "") }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { type: 'bot', text: "Error connecting to AI Assistant." }]);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    const handleChipClick = async (key) => {
        const text = content.chips[key];
        setMessages(prev => [...prev, { type: 'user', text: text }]);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, language: currLang })
            });
            const data = await res.json();

            if (res.ok && data.reply) {
                setMessages(prev => [...prev, { type: 'bot', text: data.reply }]);
            } else {
                setMessages(prev => [...prev, { type: 'bot', text: "Sorry, I encountered an error." }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { type: 'bot', text: "Error connecting to AI Assistant." }]);
        }
    };

    return (
        <div className="chatbot-container">
            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <div className="chatbot-title">
                            <h3>{content.title}</h3>
                            <p>{content.subtitle}</p>
                        </div>
                        <button className="chatbot-close" onClick={() => setIsOpen(false)}>
                            <ChevronDown size={24} />
                        </button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.type}`}>
                                {msg.text}
                            </div>
                        ))}

                        {/* Show chips only if it's the start or requested explicitly */}
                        {messages.length > 0 && messages[messages.length - 1].type === 'bot' && (
                            <div className="chatbot-chips">
                                <button className="chip" onClick={() => handleChipClick("info")}>
                                    {content.chips.info}
                                </button>
                                <button className="chip" onClick={() => handleChipClick("dates")}>
                                    {content.chips.dates}
                                </button>
                                <button className="chip" onClick={() => handleChipClick("safe")}>
                                    {content.chips.safe}
                                </button>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chatbot-input-area">
                        <div className="chatbot-input-wrapper">
                            <input
                                type="text"
                                className="chatbot-input"
                                placeholder={content.placeholder}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <button className="chatbot-mic-btn">
                                <Mic size={18} />
                            </button>
                            <button className="chatbot-send-btn" onClick={handleSend}>
                                <Send size={18} />
                            </button>
                        </div>
                        <p className="chatbot-disclaimer">
                            {content.disclaimer}
                        </p>
                    </div>
                </div>
            )}

            {!isOpen && (
                <button className="chatbot-toggle" onClick={() => setIsOpen(true)}>
                    <MessageSquare />
                </button>
            )}
        </div>
    );
};

export default Chatbot;
