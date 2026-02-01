import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("Uncaught Error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div style={{
                    padding: '2rem',
                    textAlign: 'center',
                    fontFamily: 'system-ui, sans-serif',
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f8fafc'
                }}>
                    <h1 style={{ color: '#ef4444', marginBottom: '1rem' }}>Something went wrong.</h1>
                    <p style={{ color: '#4b5563', marginBottom: '2rem', maxWidth: '600px' }}>
                        The application encountered an unexpected error. Please check the console for more details.
                    </p>
                    <div style={{
                        backgroundColor: '#1e293b',
                        color: '#e2e8f0',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        textAlign: 'left',
                        overflow: 'auto',
                        maxWidth: '800px',
                        width: '100%',
                        maxHeight: '300px',
                        fontSize: '0.9rem',
                        fontFamily: 'monospace'
                    }}>
                        <p><strong>Error:</strong> {this.state.error && this.state.error.toString()}</p>
                        <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '2rem',
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        Reload Application
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
