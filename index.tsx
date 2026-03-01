import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

// --- Components ---

const DEFAULT_RESUME_URL = '/resume.pdf';
const resumeUrl = import.meta.env.VITE_RESUME_URL || DEFAULT_RESUME_URL;
const themeStorageKey = 'portfolio-theme';
const minimumContactSubmitDelayMs = 2500;

const NavBar = ({ isDarkMode, onToggleTheme, resumeLink }: { isDarkMode: boolean, onToggleTheme: () => void, resumeLink: string }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        setIsMobileMenuOpen(false);
    };

    return (
        <nav className="fixed top-0 left-0 w-full z-50 p-4 md:p-6 pointer-events-none">
            <div className="container mx-auto flex justify-between items-center">
                <a href="#" className="pointer-events-auto hover:scale-105 transition-transform duration-200">
                    <div className="bg-white dark:bg-slate-800 border-2 border-dev-ink px-4 py-2 rounded-lg shadow-cartoon flex items-center gap-2">
                        <span className="material-icons-round text-dev-primary-dark">terminal</span>
                        <span className="text-lg md:text-xl font-bold tracking-tight text-dev-ink dark:text-slate-100 font-mono">&lt;Akshat Aggarwal /&gt;</span>
                    </div>
                </a>
                
                <div className="hidden md:flex space-x-4 items-center pointer-events-auto font-mono text-sm font-bold">
                    <button onClick={() => scrollToSection('home')} className="bg-white dark:bg-slate-800 border-2 border-dev-ink text-dev-accent-blue py-2 px-4 rounded-lg shadow-cartoon hover:translate-y-[2px] hover:shadow-cartoon-hover transition-all">
                        &lt;Home /&gt;
                    </button>
                    <button onClick={() => scrollToSection('projects')} className="bg-white dark:bg-slate-800 border-2 border-dev-ink text-dev-accent-purple py-2 px-4 rounded-lg shadow-cartoon hover:translate-y-[2px] hover:shadow-cartoon-hover transition-all">
                        &lt;Projects /&gt;
                    </button>
                    <button onClick={() => scrollToSection('contact')} className="bg-dev-ink border-2 border-dev-ink text-white py-2 px-4 rounded-lg shadow-cartoon hover:bg-gray-800 hover:translate-y-[2px] hover:shadow-cartoon-hover transition-all">
                        &lt;Contact /&gt;
                    </button>
                    <a href={resumeLink} target="_blank" rel="noopener noreferrer" className="bg-dev-accent-yellow border-2 border-dev-ink text-dev-ink py-2 px-4 rounded-lg shadow-cartoon hover:translate-y-[2px] hover:shadow-cartoon-hover transition-all">
                        &lt;Resume /&gt;
                    </a>
                </div>

                <div className="pointer-events-auto flex items-center gap-2">
                    <button
                        onClick={onToggleTheme}
                        aria-label="Toggle dark mode"
                        className="bg-white dark:bg-slate-800 border-2 border-dev-ink text-dev-ink dark:text-slate-100 p-2 rounded-lg shadow-cartoon hover:translate-y-[2px] hover:shadow-cartoon-hover transition-all"
                    >
                        <span className="material-icons-round text-xl">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
                    </button>
                    <button
                        onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                        aria-label="Toggle menu"
                        className="md:hidden bg-white dark:bg-slate-800 border-2 border-dev-ink text-dev-ink dark:text-slate-100 p-2 rounded-lg shadow-cartoon hover:translate-y-[2px] hover:shadow-cartoon-hover transition-all"
                    >
                        <span className="material-icons-round text-xl">{isMobileMenuOpen ? 'close' : 'menu'}</span>
                    </button>
                </div>
            </div>
            {isMobileMenuOpen && (
                <div className="md:hidden pointer-events-auto mt-3 bg-white dark:bg-slate-800 border-2 border-dev-ink rounded-xl p-3 shadow-cartoon flex flex-col gap-2 font-mono text-sm font-bold">
                    <button onClick={() => scrollToSection('home')} className="w-full text-left bg-white dark:bg-slate-900 border-2 border-dev-ink text-dev-accent-blue py-2 px-3 rounded-lg">
                        &lt;Home /&gt;
                    </button>
                    <button onClick={() => scrollToSection('projects')} className="w-full text-left bg-white dark:bg-slate-900 border-2 border-dev-ink text-dev-accent-purple py-2 px-3 rounded-lg">
                        &lt;Projects /&gt;
                    </button>
                    <button onClick={() => scrollToSection('contact')} className="w-full text-left bg-dev-ink border-2 border-dev-ink text-white py-2 px-3 rounded-lg">
                        &lt;Contact /&gt;
                    </button>
                    <a
                        href={resumeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-full text-left bg-dev-accent-yellow border-2 border-dev-ink text-dev-ink py-2 px-3 rounded-lg"
                    >
                        &lt;Resume /&gt;
                    </a>
                </div>
            )}
        </nav>
    );
};

const ChatInterface = () => {
    const [messages, setMessages] = useState<{role: 'user'|'model', text: string}[]>([
        { role: 'model', text: '// System initialized. \n// I am AkshatAI. I know everything about Akshat\'s work in React, ML, and C++. Ask away!' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        const userText = input;
        setInput('');
        setIsLoading(true);
        setMessages(prev => [...prev, { role: 'user', text: userText }]);
        setMessages(prev => [...prev, { role: 'model', text: '' }]); // Placeholder

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userText }),
            });

            if (!response.ok) {
                throw new Error('Chat service unavailable');
            }

            const data = await response.json();
            const modelText = typeof data.text === 'string' ? data.text : '// No response generated.';
            setMessages(prev => {
                const newArr = [...prev];
                newArr[newArr.length - 1].text = modelText;
                return newArr;
            });
        } catch (e: any) {
            setMessages(prev => {
                 const newArr = [...prev];
                 newArr[newArr.length - 1].text = `// Error: ${e.message}`;
                 return newArr;
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#1e1e1e] font-mono text-xs md:text-sm">
            {/* Header */}
            <div className="flex items-center px-4 py-2 bg-[#2d2d2d] border-b border-[#3e3e3e] text-gray-400 select-none">
                <span className="material-icons-round text-sm mr-2">terminal</span>
                <span>akshat_ai_terminal — bash</span>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-gray-300">
                {messages.map((msg, i) => (
                    <div key={i} className={`${msg.role === 'user' ? 'text-dev-primary' : 'text-dev-accent-blue'}`}>
                        <span className="opacity-50 mr-2">{msg.role === 'user' ? '>' : '#'}</span>
                        <span className="whitespace-pre-wrap">{msg.text}</span>
                    </div>
                ))}
                {isLoading && (
                     <div className="text-dev-accent-blue animate-pulse">
                        <span className="opacity-50 mr-2">#</span>
                        <span>Computing...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-[#252526] border-t border-[#3e3e3e] flex items-center gap-2">
                <span className="text-dev-primary font-bold">{'>'}</span>
                <input 
                    type="text" 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    className="flex-1 bg-transparent border-none text-white focus:ring-0 p-0 font-mono placeholder-gray-600"
                    placeholder="Execute command..."
                    autoComplete="off"
                />
            </div>
        </div>
    );
};

const HeroSection = ({ resumeLink }: { resumeLink: string }) => {
    return (
        <section id="home" className="min-h-screen pt-24 pb-12 flex items-center relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-20 right-[15%] w-16 h-16 border-4 border-dev-accent-blue/30 rounded-full animate-bounce delay-700 pointer-events-none"></div>
            <div className="absolute bottom-20 left-[10%] text-6xl text-dev-accent-purple/20 font-black animate-pulse font-mono pointer-events-none">{`{ }`}</div>
            
            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                    
                    {/* Left Content */}
                    <div className="flex-1 max-w-xl relative">
                        <div className="relative bg-white dark:bg-slate-800 border-4 border-dev-ink p-6 md:p-8 rounded-2xl rounded-bl-none shadow-cartoon-deep mb-8 animate-float w-full">
                            <div className="absolute -bottom-5 left-8 w-6 h-6 bg-white dark:bg-slate-800 border-r-4 border-b-4 border-dev-ink transform rotate-45 z-10"></div>
                            <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight text-dev-ink dark:text-slate-100 font-display">
                                HELLO WORLD!<br/>
                                I'M <span className="text-dev-primary">AKSHAT</span><span className="animate-blink">_</span>
                            </h1>
                        </div>
                        
                        <div className="space-y-6 pl-2">
                            <div className="bg-blue-50 dark:bg-slate-800 inline-block px-4 py-3 rounded-lg border-2 border-dashed border-dev-accent-blue/50 transform rotate-1">
                                <p className="text-lg md:text-xl font-bold text-dev-ink dark:text-slate-100 font-mono flex items-center gap-2">
                                    <span className="material-icons-round text-dev-accent-blue">school</span>
                                    CSE Student at Punjab Engineering College(PEC),Chandigarh
                                </p>
                            </div>
                            
                            <div className="flex flex-wrap gap-4">
                                <button onClick={() => document.getElementById('projects')?.scrollIntoView({behavior:'smooth'})} className="group relative inline-flex items-center justify-center bg-dev-primary hover:bg-dev-primary-dark border-4 border-dev-ink text-white text-xl font-bold font-mono px-8 py-3 rounded-xl uppercase tracking-wider shadow-cartoon active:translate-y-1 active:shadow-cartoon-sm transition-all">
                                    <span className="material-icons-round mr-2">play_arrow</span>
                                    PROJECTS()
                                </button>
                                <button onClick={() => window.open('https://github.com/akshat-chd', '_blank', 'noopener,noreferrer')} className="group relative inline-flex items-center justify-center bg-white dark:bg-slate-800 border-4 border-dev-ink text-dev-ink dark:text-slate-100 text-xl font-bold font-mono px-8 py-3 rounded-xl shadow-cartoon hover:bg-gray-50 dark:hover:bg-slate-700 active:translate-y-1 active:shadow-cartoon-sm transition-all">
                                    GitHub()
                                </button>
                                <a href={resumeLink} target="_blank" rel="noopener noreferrer" className="group relative inline-flex items-center justify-center bg-dev-accent-yellow border-4 border-dev-ink text-dev-ink text-xl font-bold font-mono px-8 py-3 rounded-xl shadow-cartoon hover:bg-yellow-300 active:translate-y-1 active:shadow-cartoon-sm transition-all">
                                    Resume()
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Right Content: Laptop/Terminal */}
                    <div className="flex-1 w-full max-w-xl flex justify-center lg:justify-end">
                         <div className="relative w-full aspect-[4/3] max-w-[500px]">
                            {/* Laptop Lid */}
                            <div className="absolute inset-0 bg-dev-ink rounded-t-2xl p-3 shadow-cartoon-deep z-10 flex flex-col">
                                {/* Screen Bezel */}
                                <div className="flex-1 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-700 relative flex flex-col">
                                    {/* Camera Dot */}
                                    <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-black rounded-full z-20 opacity-50"></div>
                                    {/* CHAT INTERFACE */}
                                    <ChatInterface />
                                </div>
                            </div>
                            {/* Laptop Base */}
                            <div className="absolute -bottom-4 left-[-10%] w-[120%] h-6 bg-gray-200 border-4 border-dev-ink rounded-b-xl shadow-cartoon z-20 flex justify-center items-center">
                                <div className="w-20 h-1 bg-gray-400 rounded-full"></div>
                            </div>
                            
                            {/* Floating Icons */}
                            <div className="absolute -top-6 -right-6 bg-white border-2 border-dev-ink p-2 rounded-lg shadow-cartoon rotate-12 animate-float" style={{animationDelay: '1s'}}>
                                <span className="material-icons-round text-dev-accent-yellow text-3xl">lightbulb</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const ImageGenerator = () => {
    const [prompt, setPrompt] = useState('');
    const [status, setStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
    const [result, setResult] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim() || status === 'generating') return;
        setStatus('generating');
        try {
            const response = await fetch('/api/generate-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            });

            if (!response.ok) {
                throw new Error('Image service unavailable');
            }

            const data = await response.json();
            if (!data.imageDataUrl) {
                throw new Error('No image found');
            }

            setResult(data.imageDataUrl);
            setStatus('success');
        } catch (e) {
            console.error(e);
            setStatus('error');
        }
    };

    return (
        <div className="bg-gradient-to-br from-[#5b46e8] to-[#3a2db5] rounded-3xl p-6 md:p-10 text-white shadow-cartoon overflow-hidden relative border-4 border-dev-ink">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px'}}></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                {/* Visualizer Circle */}
                <div className="flex-shrink-0">
                    <div className="w-40 h-40 md:w-56 md:h-56 rounded-full border-4 border-white/30 flex items-center justify-center bg-black/20 relative overflow-hidden shadow-inner group">
                        {status === 'generating' && (
                             <div className="absolute inset-0 border-t-4 border-dev-accent-yellow rounded-full animate-spin"></div>
                        )}
                        {result ? (
                            <img src={result} alt="Generated" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-center p-4">
                                <span className="material-icons-round text-5xl opacity-50 mb-2">auto_awesome</span>
                                <div className="text-xs font-mono opacity-70">AI_CORE</div>
                            </div>
                        )}
                        
                        {/* Status Label */}
                        <div className="absolute bottom-4 bg-dev-accent-yellow text-black text-xs font-bold px-2 py-0.5 rounded border border-black">
                            {status === 'idle' ? 'READY' : status.toUpperCase()}
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex-1 w-full text-center md:text-left">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-white/30">
                        <span className="material-icons-round text-sm">science</span>
                        Experimental Build
                    </div>
                    <h3 className="text-3xl md:text-4xl font-black font-display mb-2">GENERATE.ASSET()</h3>
                    <p className="text-blue-100 mb-6 max-w-md">
                        While I code, my AI sidekick creates art. Describe an idea to generate a unique visual asset.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input 
                            type="text" 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="A futuristic data center in neon style..."
                            className="flex-1 px-4 py-3 rounded-xl border-2 border-transparent focus:border-dev-accent-yellow text-dev-ink font-bold placeholder-gray-400 outline-none shadow-sm"
                        />
                        <button 
                            onClick={handleGenerate}
                            disabled={status === 'generating'}
                            className="bg-white text-dev-ink px-6 py-3 rounded-xl font-bold font-mono uppercase hover:bg-dev-accent-yellow border-b-4 border-black/20 hover:border-black/40 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {status === 'generating' ? 'Computing' : 'Generate'}
                            <span className="material-icons-round">bolt</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProjectCard = ({ title, type, status, color, tech, link }: { title: string, type: string, status: string, color: string, tech: string, link: string }) => (
    <div className="bg-white dark:bg-slate-800 border-4 border-dev-ink rounded-2xl p-2 shadow-cartoon hover:-translate-y-2 hover:shadow-cartoon-deep transition-all duration-300 group cursor-pointer flex flex-col h-full">
        {/* Card Image Area */}
        <div className={`h-40 rounded-xl ${color} border-2 border-dev-ink mb-4 relative overflow-hidden flex items-center justify-center`}>
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]"></div>
            <span className="material-icons-round text-6xl text-dev-ink opacity-20 group-hover:scale-110 transition-transform">
                {title.includes('Disaster') ? 'warning' : title.includes('Street') ? 'pets' : 'code'}
            </span>
        </div>
        
        {/* Card Content */}
        <div className="px-2 pb-2 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-black font-display text-dev-ink dark:text-slate-100">{title}</h3>
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-dev-bg border border-dev-ink px-1.5 py-0.5 rounded">
                    <div className={`w-2 h-2 rounded-full ${status.includes('LIVE') ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></div>
                    {status}
                </div>
            </div>
            <p className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-1">{type}</p>
            <p className="text-xs font-mono text-gray-500 dark:text-slate-400 mb-4">{tech}</p>
            
            <div className="mt-auto">
                <button onClick={() => window.open(link, '_blank', 'noopener,noreferrer')} className="w-full bg-white dark:bg-slate-700 border-2 border-dev-ink text-dev-ink dark:text-slate-100 font-bold py-2 rounded-lg text-sm hover:bg-dev-ink hover:text-white transition-colors flex items-center justify-center gap-2">
                    VIEW DETAILS <span className="material-icons-round text-sm">visibility</span>
                </button>
            </div>
        </div>
    </div>
);

const ProjectsSection = () => {
    return (
        <section id="projects" className="py-20 relative">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <div className="inline-block bg-white dark:bg-slate-800 border-2 border-dev-ink rounded-full px-6 py-2 mb-4 shadow-sm">
                        <span className="font-bold text-dev-primary-dark tracking-widest uppercase text-sm font-mono flex items-center gap-2">
                            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                            Status: Contributing
                        </span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-dev-ink dark:text-slate-100 font-display uppercase tracking-tight">
                        Projects & Achievements
                    </h2>
                    <p className="mt-4 text-xl text-gray-600 dark:text-slate-300 font-medium max-w-2xl mx-auto font-body">
                        From Full-Stack apps to ML models, here is what I have built.
                    </p>
                </div>

                {/* Filter Bar */}
                {/* <div className="flex justify-center gap-4 mb-12 flex-wrap">
                    {['ALL', 'FULL STACK', 'ML / AI', 'COMPETITIVE'].map((filter, i) => (
                        <button key={filter} className={`px-6 py-2 rounded-xl font-bold font-mono border-2 border-dev-ink transition-all ${i===0 ? 'bg-dev-accent-blue text-white shadow-cartoon' : 'bg-white text-dev-ink hover:bg-gray-50'}`}>
                            {filter}
                        </button>
                    ))}
                </div> */}

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 max-w-6xl mx-auto">
                    <ProjectCard 
                        title="DisasterIQ" 
                        type="Disaster Risk Assessment" 
                        tech="React, Flask, XGBoost, Leaflet"
                        status="LIVE" 
                        color="bg-red-200" 
                        link="https://disasteriq-frontend.onrender.com/"
                    />
                    <ProjectCard 
                        title="AnyStreet" 
                        type="Animal Welfare Platform" 
                        tech="React, Bootstrap"
                        status="LIVE" 
                        color="bg-orange-200" 
                        link="https://any-street2-l1tk.vercel.app"
                    />
                    <ProjectCard 
                        title="LeetCode" 
                        type="Competitive Programming" 
                        tech="650+ Solved, Rating 1720"
                        status="RANK 1680" 
                        color="bg-yellow-100" 
                        link="https://leetcode.com/u/Knowledge_is_Power/"
                    />
                </div>

                {/* AI Feature Section */}
                {/* <div className="max-w-5xl mx-auto">
                    <ImageGenerator />
                </div> */}
            </div>
        </section>
    );
};

const ContactSection = () => {
    const [sender, setSender] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [honeypot, setHoneypot] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [statusType, setStatusType] = useState<'idle' | 'success' | 'error'>('idle');
    const [formStartedAt] = useState(() => Date.now());

    const sendEmail = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isSending) return;

        // Hidden field trap blocks simple bots without impacting humans.
        if (honeypot.trim()) {
            setStatusType('success');
            setStatusMessage('Transmission sent successfully.');
            return;
        }

        if (Date.now() - formStartedAt < minimumContactSubmitDelayMs) {
            setStatusType('error');
            setStatusMessage('Please wait a moment before sending.');
            return;
        }

        const toEmail = (import.meta as any).env?.VITE_CONTACT_TO_EMAIL;

        if (!toEmail) {
            setStatusType('error');
            setStatusMessage('Recipient email is not configured yet.');
            return;
        }

        setIsSending(true);
        setStatusType('idle');
        setStatusMessage('');

        try {
            const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(toEmail)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    name: sender,
                    email,
                    message,
                    submitted_at: new Date().toISOString(),
                    _subject: `UPLINK-V1 message from ${sender}`,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            setStatusType('success');
            setStatusMessage('Transmission sent successfully.');
            setSender('');
            setEmail('');
            setMessage('');
            setHoneypot('');
        } catch (error) {
            setStatusType('error');
            setStatusMessage('Failed to send transmission. Please try again.');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <section id="contact" className="py-20 bg-dev-bg relative overflow-hidden">
            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-50 bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-10">
                    <h2 className="text-5xl md:text-7xl font-bold mb-4 drop-shadow-[4px_4px_0_rgba(0,0,0,1)] text-white" style={{WebkitTextStroke: '2px black'}}>
                        GET IN TOUCH
                    </h2>
                    <p className="text-xl text-gray-600 font-medium bg-white/80 inline-block px-4 py-1 rounded-lg border-2 border-transparent">
                        Have a project or opportunity? Send a secure transmission.
                    </p>
                </div>

                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left: Terminal Form */}
                    <div className="lg:col-span-8 w-full">
                        <div className="bg-dev-surface border-4 border-dev-ink rounded-[2rem] p-4 md:p-6 shadow-cartoon relative">
                            {/* Badge */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black text-white px-4 py-1 rounded-full text-xs font-bold tracking-widest border-2 border-white">
                                UPLINK-V1
                            </div>
                            
                            {/* Screen */}
                            <div className="bg-[#e6f2ff] border-4 border-dev-ink rounded-xl p-6 md:p-8 relative overflow-hidden">
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] pointer-events-none bg-[length:100%_4px,3px_100%] z-0"></div>
                                
                                <form className="relative z-10 space-y-6" onSubmit={sendEmail}>
                                    <div className="hidden" aria-hidden="true">
                                        <label htmlFor="company-website">Company website</label>
                                        <input
                                            id="company-website"
                                            name="company_website"
                                            tabIndex={-1}
                                            autoComplete="off"
                                            value={honeypot}
                                            onChange={(event) => setHoneypot(event.target.value)}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="block font-bold text-dev-ink text-lg flex items-center gap-2">
                                                <span className="material-icons-round text-dev-accent-blue">badge</span>
                                                SENDER
                                            </label>
                                            <input
                                                className="w-full bg-white border-4 border-dev-ink rounded-full px-6 py-3 font-bold text-dev-ink placeholder-gray-400 focus:outline-none focus:shadow-[4px_4px_0_#3B82F6] transition-all"
                                                placeholder="Recruiter / Dev"
                                                value={sender}
                                                onChange={(event) => setSender(event.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block font-bold text-dev-ink text-lg flex items-center gap-2">
                                                <span className="material-icons-round text-dev-accent-blue">alternate_email</span>
                                                EMAIL
                                            </label>
                                            <input
                                                type="email"
                                                className="w-full bg-white border-4 border-dev-ink rounded-full px-6 py-3 font-bold text-dev-ink placeholder-gray-400 focus:outline-none focus:shadow-[4px_4px_0_#3B82F6] transition-all"
                                                placeholder="hr@company.com"
                                                value={email}
                                                onChange={(event) => setEmail(event.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block font-bold text-dev-ink text-lg flex items-center gap-2">
                                            <span className="material-icons-round text-dev-accent-blue">chat</span>
                                            MESSAGE
                                        </label>
                                        <textarea
                                            rows={5}
                                            className="w-full bg-white border-4 border-dev-ink rounded-2xl px-6 py-4 font-bold text-dev-ink placeholder-gray-400 focus:outline-none focus:shadow-[4px_4px_0_#3B82F6] transition-all resize-none"
                                            placeholder="Hey Akshat, I saw your portfolio..."
                                            value={message}
                                            onChange={(event) => setMessage(event.target.value)}
                                            required
                                        ></textarea>
                                    </div>
                                    {statusMessage && (
                                        <p className={`font-bold ${statusType === 'error' ? 'text-red-600' : 'text-green-700'}`}>
                                            {statusMessage}
                                        </p>
                                    )}
                                    <div className="flex justify-end pt-2">
                                        <button
                                            type="submit"
                                            disabled={isSending}
                                            className="bg-dev-accent-blue hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-xl px-10 py-4 rounded-full border-4 border-dev-ink shadow-cartoon hover:shadow-cartoon-hover active:shadow-none active:translate-y-1 active:translate-x-1 transition-all flex items-center gap-2"
                                        >
                                            {isSending ? 'SENDING...' : 'SEND'} <span className="material-icons-round">send</span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Right: Social Hub */}
                    <div className="lg:col-span-4 w-full h-full flex flex-col justify-center">
                        <div className="bg-[#1e293b] border-4 border-dev-ink rounded-[2rem] p-6 shadow-cartoon text-white relative">
                            <div className="flex items-center justify-between mb-6 border-b-2 border-gray-600 pb-4">
                                <div className="flex gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse delay-75"></div>
                                </div>
                                <h2 className="font-bold text-gray-400 tracking-widest text-xs uppercase font-mono">Social Array</h2>
                            </div>
                            
                            <div className="space-y-4 font-body">
                                <a href="https://github.com/akshat-chd" target="_blank" rel="noopener noreferrer" className="block w-full bg-white text-dev-ink border-4 border-black rounded-xl p-4 shadow-sm hover:shadow-cartoon hover:-translate-y-1 hover:-rotate-1 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-black text-white p-2 rounded-lg flex items-center justify-center">
                                            {/* GitHub favicon */}
                                            <img src="https://github.githubassets.com/favicons/favicon.svg" alt="GitHub" className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-lg leading-none">GitHub</div>
                                            <div className="text-xs font-bold text-gray-500">View Repos</div>
                                        </div>
                                    </div>
                                </a>
                                <a href="https://www.linkedin.com/in/akshat-aggarwal-10bbba301/" target="_blank" rel="noopener noreferrer" className="block w-full bg-[#0077b5] text-white border-4 border-black rounded-xl p-4 shadow-sm hover:shadow-cartoon hover:-translate-y-1 hover:rotate-1 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-white text-[#0077b5] p-2 rounded-lg"><span className="material-symbols-rounded">work</span></div>
                                        <div>
                                            <div className="font-bold text-lg leading-none">LinkedIn</div>
                                            <div className="text-xs font-bold text-blue-100">Connect</div>
                                        </div>
                                    </div>
                                </a>
                                <a href="mailto:akshataggarwal2107@gmail.com" className="block w-full bg-dev-accent-yellow text-black border-4 border-black rounded-xl p-4 shadow-sm hover:shadow-cartoon hover:-translate-y-1 hover:-rotate-1 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-black text-dev-accent-yellow p-2 rounded-lg"><span className="material-symbols-rounded">mail</span></div>
                                        <div>
                                            <div className="font-bold text-lg leading-none">Email</div>
                                            <div className="text-xs font-bold text-yellow-900/70">akshataggarwal2107@gmail.com</div>
                                        </div>
                                    </div>
                                </a>
                                <a href="https://codeforces.com/profile/Obtuse123" target="_blank" rel="noopener noreferrer" className="block w-full bg-white text-dev-ink border-4 border-black rounded-xl p-4 shadow-sm hover:shadow-cartoon hover:-translate-y-1 hover:-rotate-1 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-black p-2 rounded-lg flex items-center justify-center">
                                            {/* Codeforces favicon */}
                                            <img src="https://codeforces.org/favicon.ico" alt="Codeforces" className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-lg leading-none">Codeforces</div>
                                            <div className="text-xs font-bold text-gray-500">Handle: Obtuse123</div>
                                        </div>
                                    </div>
                                </a>
                                <a href="https://www.geeksforgeeks.org/user/akshatagganxah/" target="_blank" rel="noopener noreferrer" className="block w-full bg-white text-dev-ink border-4 border-black rounded-xl p-4 shadow-sm hover:shadow-cartoon hover:-translate-y-1 hover:-rotate-1 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-dev-accent-green text-black p-2 rounded-lg"><span className="material-symbols-rounded">school</span></div>
                                        <div>
                                            <div className="font-bold text-lg leading-none">GeeksforGeeks</div>
                                            <div className="text-xs font-bold text-gray-500">Profile: akshatagganxah</div>
                                        </div>
                                    </div>
                                </a>
                                <a href="https://pwoc.vercel.app/" target="_blank" rel="noopener noreferrer" className="block w-full bg-white text-dev-ink border-4 border-black rounded-xl p-4 shadow-sm hover:shadow-cartoon hover:-translate-y-1 hover:-rotate-1 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-dev-primary text-white p-2 rounded-lg"><span className="material-symbols-rounded">public</span></div>
                                        <div>
                                            <div className="font-bold text-lg leading-none">Portfolio</div>
                                            <div className="text-xs font-bold text-gray-500">pwoc.vercel.app</div>
                                        </div>
                                    </div>
                                </a>
                            </div>

                            <div className="mt-8 pt-4 border-t border-gray-600 flex justify-between items-end opacity-60 font-mono text-xs">
                                <div>
                                    SYS.OP: AKSHAT A.<br/>
                                    LOC: CHANDIGARH
                                </div>
                                <span className="material-icons-round text-2xl animate-spin-slow">settings</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// --- Main App Component ---

function App() {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem(themeStorageKey);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldUseDark = savedTheme ? savedTheme === 'dark' : prefersDark;
        setIsDarkMode(shouldUseDark);
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode);
        localStorage.setItem(themeStorageKey, isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    return (
        <div className="min-h-screen font-body text-dev-ink dark:text-slate-100 selection:bg-dev-primary selection:text-white transition-colors">
            <NavBar
                isDarkMode={isDarkMode}
                onToggleTheme={() => setIsDarkMode((prev) => !prev)}
                resumeLink={resumeUrl}
            />
            <HeroSection resumeLink={resumeUrl} />
            <ProjectsSection />
            <ContactSection />
            
            <footer className="bg-dev-ink dark:bg-slate-950 text-white py-8 text-center font-mono text-sm">
                <p>&copy; 2025  Built by Akshat  </p>
                <div className="mt-2 text-gray-500">Built with React & Tailwind</div>
            </footer>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);
