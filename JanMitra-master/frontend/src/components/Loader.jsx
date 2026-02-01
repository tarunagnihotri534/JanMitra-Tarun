import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function Loader({ fullScreen = true, text = "Loading JanMitra..." }) {
    if (fullScreen) {
        return (
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(8px)',
                zIndex: 9999,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}>
                <Spinner />
                <p style={{ marginTop: '1.5rem', fontWeight: 600, color: 'var(--primary)', letterSpacing: '0.5px' }}>{text}</p>
            </div>
        );
    }
    return <Spinner />;
}

const Spinner = () => (
    <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        style={{ position: 'relative', width: '60px', height: '60px' }}
    >
        {/* Outer Ring */}
        <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            border: '4px solid rgba(217, 119, 6, 0.2)',
            borderTopColor: 'var(--secondary)',
            borderRadius: '50%'
        }}></div>

        {/* Inner Branding (Ashoka Chakra-ish) */}
        <div style={{
            position: 'absolute', top: '15px', left: '15px', right: '15px', bottom: '15px',
            border: '4px solid rgba(15, 23, 42, 0.2)',
            borderBottomColor: 'var(--primary)',
            borderRadius: '50%'
        }}></div>
    </motion.div>
);
