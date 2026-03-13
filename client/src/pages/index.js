import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { FileUp, MessageSquare, Send, User, Bot, LogOut, LayoutDashboard, FileText, CheckCircle, Loader2, Sparkles, Settings, Menu, X, Camera, Mail, Building, Plus, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

// --- CENTRALIZED API URL FOR EASY DEPLOYMENT ---
// Yahan se aakhir wala '/api' hata diya hai taake double na ho jaye
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://rafaykhalil-skillforge-backend.hf.space';

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('resume'); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Profile States
  const [profilePic, setProfilePic] = useState(null);
  const [displayName, setDisplayName] = useState('Rafay Khalil'); 
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const [prompt, setPrompt] = useState('');
  const [promptLoading, setPromptLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(1);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom();
    }
  }, [chatHistory, promptLoading, activeTab]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
      fetchSessions(); 
      startNewChat(false); 
      
      // Load Saved Profile Data from LocalStorage
      const savedProfilePic = localStorage.getItem('skillforge_profile_pic');
      if (savedProfilePic) {
        setProfilePic(savedProfilePic);
      }
      const savedName = localStorage.getItem('skillforge_display_name');
      if (savedName) {
        setDisplayName(savedName);
      }

      // Check Tour
      const tourCompleted = localStorage.getItem('skillforge_first_visit_tour');
      if (!tourCompleted) {
        setShowTour(true);
      }
    }
  }, [router]);

  const handleNextStep = () => {
    if (tourStep < 4) {
      setTourStep(tourStep + 1);
    } else {
      closeTour();
    }
  };

  const closeTour = () => {
    setShowTour(false);
    localStorage.setItem('skillforge_first_visit_tour', 'true');
  };

  const fetchSessions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/sessions`);
      setSessions(response.data.data);
    } catch (error) {
      console.log("Error loading sessions:", error);
    }
  };

  const loadSpecificChat = async (sessionId) => {
    setCurrentSessionId(sessionId);
    setActiveTab('chat');
    setIsMobileMenuOpen(false);
    setChatHistory([]); 
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/chats/${sessionId}`);
      const dbChats = response.data.data;
      const formattedHistory = [];
      dbChats.forEach(chat => {
        formattedHistory.push({ role: 'user', content: chat.prompt });
        if (chat.reply) formattedHistory.push({ role: 'ai', content: chat.reply });
      });
      setChatHistory(formattedHistory);
    } catch (error) {
      console.log("Error loading specific chat:", error);
    }
  };

  const startNewChat = (switchTab = true) => {
    const newId = Date.now().toString(); 
    setCurrentSessionId(newId);
    setChatHistory([]);
    if(switchTab){
       setActiveTab('chat');
       setIsMobileMenuOpen(false);
    }
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('resume', file);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/upload`, formData);
      setResult(response.data.data);
    } catch (error) {
      alert("Error: The Backend is not responding!");
    } finally {
      setLoading(false);
    }
  };

  const handlePromptSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    const userMessage = prompt;
    const activeSessionId = currentSessionId || Date.now().toString();
    if (!currentSessionId) setCurrentSessionId(activeSessionId);

    setPrompt('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]); 
    setPromptLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/chat`, { 
          prompt: userMessage, 
          sessionId: activeSessionId 
      });
      setChatHistory(prev => [...prev, { role: 'ai', content: response.data.data }]); 
      fetchSessions(); 
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'ai', content: "❌ Error connecting to AI." }]);
    } finally {
      setPromptLoading(false);
    }
  };

  const handleSaveSettings = () => {
    setIsSaving(true);
    setSaveMessage('');
    // Save Name to LocalStorage for Portfolio Demo
    localStorage.setItem('skillforge_display_name', displayName);
    
    setTimeout(() => {
      setIsSaving(false);
      setSaveMessage('Profile updated successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    }, 1500);
  };

  // PROFILE PICTURE CHANGE HANDLER
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setProfilePic(base64String);
        localStorage.setItem('skillforge_profile_pic', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isAuthenticated) return null;

  const switchTab = (tabName) => {
    setActiveTab(tabName);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 font-sans overflow-hidden">
      
      {/* ONBOARDING TOUR MODAL */}
      {showTour && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in-95 duration-300 relative">
            <button onClick={closeTour} className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors bg-slate-50 hover:bg-slate-100 p-2 rounded-full">
              <X size={18} />
            </button>
            <div className="flex flex-col items-center text-center mb-8 mt-4">
              <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
                {tourStep === 1 && <FileText size={36} />}
                {tourStep === 2 && <MessageSquare size={36} />}
                {tourStep === 3 && <Clock size={36} />}
                {tourStep === 4 && <Settings size={36} />}
              </div>
              <h3 className="text-2xl font-extrabold text-slate-800 mb-3 tracking-tight">
                {tourStep === 1 && "Welcome to SkillForge!"}
                {tourStep === 2 && "Your Personal AI Coach"}
                {tourStep === 3 && "Never Lose Context"}
                {tourStep === 4 && "Make it Yours"}
              </h3>
              <p className="text-slate-500 leading-relaxed text-sm">
                {tourStep === 1 && "Start by uploading your resume in the Career Analyzer. Our AI will instantly detect your role and generate a personalized roadmap."}
                {tourStep === 2 && "Switch to the AI Assistant tab anytime to ask technical questions, simulate interviews, or get real-time coding advice."}
                {tourStep === 3 && "Your chat history is automatically saved in the sidebar. You can always jump back into a previous session without losing progress."}
                {tourStep === 4 && "Head over to the Settings tab to update your profile details and organization. You're all set to achieve your goals!"}
              </p>
            </div>
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <button onClick={closeTour} className="text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors">
                Skip Tour
              </button>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map(step => (
                  <div key={step} className={`h-2 rounded-full transition-all duration-300 ${tourStep === step ? 'bg-teal-600 w-6' : 'bg-slate-200 w-2'}`} />
                ))}
              </div>
              <button onClick={handleNextStep} className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-teal-600/20">
                {tourStep === 4 ? "Get Started" : "Next"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUPS SECTION FOR LOGOUT */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-2xl max-w-sm w-full animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                <LogOut size={20} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Confirm Logout</h3>
            </div>
            <p className="text-slate-500 mb-6 text-sm leading-relaxed">
              Are you sure you want to log out of your SkillForge account? You will need to sign in again to access your AI workspace.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowLogoutModal(false)} className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-sm font-medium">
                Cancel
              </button>
              <button onClick={confirmLogout} className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white transition-colors text-sm font-bold shadow-md shadow-red-900/20">
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`fixed inset-y-0 left-0 bg-white border-r border-slate-200 flex flex-col shadow-xl md:shadow-sm z-50 w-64 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="w-full flex justify-center py-2">
            <img 
               src="/img.png" 
               alt="SkillForge Logo" 
               className="h-12 md:h-14 object-contain" 
            />
          </div>
          <button className="md:hidden text-slate-400 hover:text-slate-700 absolute right-4 top-4" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <button 
            onClick={() => startNewChat(true)}
            className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl transition-all font-bold shadow-sm shadow-teal-600/20"
          >
            <Plus size={18} /> New Chat
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-teal-800 scrollbar-track-transparent">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-2">Main Menu</p>
            <div className="space-y-1">
              <button onClick={() => switchTab('resume')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium ${activeTab === 'resume' ? 'bg-teal-50 text-teal-700 shadow-sm border border-teal-100' : 'text-slate-600 hover:bg-slate-50'}`}>
                <FileText size={18} className={activeTab === 'resume' ? 'text-teal-600' : 'text-slate-400'} /> Career Analyzer
              </button>
              <button onClick={() => setActiveTab('chat')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium ${activeTab === 'chat' ? 'bg-teal-50 text-teal-700 shadow-sm border border-teal-100' : 'text-slate-600 hover:bg-slate-50'}`}>
                <MessageSquare size={18} className={activeTab === 'chat' ? 'text-teal-600' : 'text-slate-400'} /> AI Assistant
              </button>
              <button onClick={() => switchTab('settings')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium ${activeTab === 'settings' ? 'bg-teal-50 text-teal-700 shadow-sm border border-teal-100' : 'text-slate-600 hover:bg-slate-50'}`}>
                <Settings size={18} className={activeTab === 'settings' ? 'text-teal-600' : 'text-slate-400'} /> Settings
              </button>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-2 flex items-center gap-1.5">
              <Clock size={14} /> Recent Chats
            </p>
            <div className="space-y-1">
              {sessions.length === 0 ? (
                <p className="text-xs text-slate-400 italic px-2">No past chats found.</p>
              ) : (
                sessions.map((session) => {
                    const isSelected = currentSessionId === session._id && activeTab === 'chat';
                    return (
                        <div key={session._id} className="relative group">
                            <div className={`flex items-center group rounded-xl ${isSelected ? 'bg-slate-100 border border-slate-200' : 'hover:bg-slate-50'}`}>
                                <button 
                                    onClick={() => loadSpecificChat(session._id)}
                                    className={`flex-1 text-left px-4 py-2.5 rounded-xl transition-all text-sm truncate ${isSelected ? 'text-slate-800 font-semibold' : 'text-slate-500 hover:text-slate-700 font-medium'}`}
                                >
                                    {session.title.length > 22 ? session.title.substring(0, 22) + '...' : session.title}
                                </button>
                            </div>
                        </div>
                    );
                })
              )}
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-200 bg-slate-50/50">
          <button onClick={() => setShowLogoutModal(true)} className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 text-slate-700 px-4 py-2.5 rounded-xl transition-all font-semibold shadow-sm">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col h-screen relative w-full overflow-hidden bg-[#F8FAFC]">
        
        <header className="h-16 shrink-0 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 text-slate-800">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            
            <img src="/img.png" alt="SkillForge" className="h-6 md:h-8 object-contain hidden md:block" />
            <div className="h-5 w-px bg-slate-300 hidden md:block mx-2"></div>
            
            <h2 className="text-base md:text-lg font-bold truncate">
              {activeTab === 'chat' && 'Direct AI Chat Workspace'}
              {activeTab === 'resume' && 'AI Career Analyzer'}
              {activeTab === 'settings' && 'Account Settings'}
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={() => switchTab('settings')} className="bg-teal-600 hover:bg-teal-700 text-white px-4 md:px-5 py-2 rounded-full text-xs md:text-sm font-semibold transition-all shadow-md shadow-teal-600/20 flex items-center gap-2 whitespace-nowrap">
              {profilePic ? (
                 <img src={profilePic} alt="User" className="w-5 h-5 rounded-full object-cover border border-white/50" />
              ) : (
                 <User size={16} />
              )}
              <span className="hidden sm:inline">My Profile</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50">
          <div className="max-w-4xl mx-auto h-full flex flex-col">
            
            {/* --- RESUME TAB --- */}
            {activeTab === 'resume' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 w-full">
                
                <div className="mb-8 bg-teal-950 rounded-[2rem] p-8 md:p-10 shadow-xl relative overflow-hidden text-center">
                   <div className="relative z-10">
                     <h1 className="text-2xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
                       Discover Your True Potential
                     </h1>
                     <p className="text-teal-100/80 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                       Upload your resume and let our AI analyze your skills. Get personalized career recommendations, custom learning roadmaps, and tailored interview preparation to land your dream job.
                     </p>
                   </div>
                   <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-teal-500 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
                   <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-emerald-500 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
                </div>

                <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-8 md:p-12 text-center hover:border-teal-500 hover:bg-teal-50/30 transition-all group cursor-pointer shadow-sm relative overflow-hidden">
                  <input type="file" id="fileInput" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleFileUpload} accept=".pdf" />
                  <div className="relative z-0">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:scale-110 group-hover:bg-teal-100 transition-all duration-300">
                      <FileUp size={32} className="text-teal-600 md:w-10 md:h-10" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800">Upload Your Resume (PDF)</h2>
                    <p className="text-sm md:text-base text-slate-500 mt-2">Maximum file size: 5MB</p>
                    {loading && (
                      <div className="mt-8 flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin text-teal-600" size={32} />
                        <p className="text-teal-600 font-medium text-sm animate-pulse">Analyzing your profile...</p>
                      </div>
                    )}
                  </div>
                </div>

                {result && (
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-8">
                    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                      <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Detected Role</h3>
                      <p className="text-xl md:text-3xl font-extrabold mt-3 text-slate-800">{result.role}</p>
                    </div>
                    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-teal-500"></div>
                      <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-5">Suggested Roadmap</h3>
                      <ul className="space-y-4">
                        {result.roadmap?.map((step, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm md:text-base text-slate-700">
                            <CheckCircle className="text-teal-500 shrink-0 mt-0.5" size={20} /> 
                            <span className="leading-relaxed font-medium">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* --- CHAT TAB --- */}
            {activeTab === 'chat' && (
               <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
               
               <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-slate-50 flex flex-col gap-4 md:gap-6">
                 {chatHistory.length === 0 ? (
                   <div className="h-full flex flex-col items-center justify-center text-center px-4 relative z-0">
                     <div className="mx-auto mb-8 flex justify-center">
                        <img 
                          src="/img.png" 
                          alt="SkillForge AI" 
                          className="w-48 md:w-64 object-contain mb-8 opacity-90" 
                        />
                     </div>
                     <h3 className="text-lg md:text-xl font-bold text-slate-700 mb-2">Start a New Conversation</h3>
                     <p className="text-xs md:text-sm text-slate-500">Type your question below to begin!</p>
                   </div>
                 ) : (
                   chatHistory.map((msg, idx) => (
                     <div key={idx} className={`flex gap-3 md:gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                       <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm mt-1 overflow-hidden ${msg.role === 'user' ? 'bg-teal-600 text-white' : 'bg-white border border-slate-200 text-teal-600'}`}>
                         {msg.role === 'user' ? (
                            profilePic ? <img src={profilePic} alt="User" className="w-full h-full object-cover" /> : <User size={16} />
                         ) : (
                            <Bot size={16} />
                         )}
                       </div>
                       <div className={`p-3 md:p-5 rounded-2xl max-w-[90%] md:max-w-[85%] shadow-sm overflow-hidden ${msg.role === 'user' ? 'bg-teal-600 text-white rounded-tr-sm' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm'}`}>
                         {msg.role === 'user' ? (
                           <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-[15px]">{msg.content}</p>
                         ) : (
                           <ReactMarkdown
                             components={{
                               code({node, inline, className, children, ...props}) {
                                 const match = /language-(\w+)/.exec(className || '')
                                 return !inline && match ? (
                                   <div className="rounded-xl overflow-hidden my-4 border border-slate-700 shadow-lg text-[13px] md:text-sm">
                                     <div className="bg-slate-800 text-slate-400 px-4 py-1.5 text-xs font-mono uppercase tracking-wider border-b border-slate-700">{match[1]}</div>
                                     <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" customStyle={{ margin: 0, padding: '1rem', background: '#0f172a' }} {...props}>
                                       {String(children).replace(/\n$/, '')}
                                     </SyntaxHighlighter>
                                   </div>
                                 ) : (
                                   <code className="bg-slate-100 text-teal-700 px-1.5 py-0.5 rounded-md text-sm font-mono border border-slate-200" {...props}>{children}</code>
                                 )
                               },
                               p({children}) { return <p className="mb-4 last:mb-0 leading-relaxed text-sm md:text-[15px]">{children}</p> },
                               ul({children}) { return <ul className="list-disc pl-5 mb-4 space-y-2 text-sm md:text-[15px]">{children}</ul> },
                               ol({children}) { return <ol className="list-decimal pl-5 mb-4 space-y-2 text-sm md:text-[15px]">{children}</ol> },
                               h1({children}) { return <h1 className="text-xl font-bold mb-4 mt-6 text-slate-800">{children}</h1> },
                               h2({children}) { return <h2 className="text-lg font-bold mb-3 mt-5 text-slate-800">{children}</h2> },
                               h3({children}) { return <h3 className="text-base font-bold mb-3 mt-4 text-slate-800">{children}</h3> },
                               strong({children}) { return <strong className="font-bold text-slate-900">{children}</strong> }
                             }}
                           >
                             {msg.content}
                           </ReactMarkdown>
                         )}
                       </div>
                     </div>
                   ))
                 )}
                 {promptLoading && (
                    <div className="flex gap-3 md:gap-4 flex-row">
                       <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border border-slate-200 text-teal-600 flex items-center justify-center shrink-0 shadow-sm mt-1 overflow-hidden">
                         <Sparkles size={16} className="animate-pulse" />
                       </div>
                       <div className="p-3 md:p-5 rounded-2xl bg-white border border-slate-100 text-slate-700 rounded-tl-sm shadow-sm flex items-center gap-2 md:gap-3">
                         <Loader2 className="animate-spin text-teal-500" size={16} />
                         <span className="text-xs md:text-sm font-medium text-slate-500">SkillForge is thinking...</span>
                       </div>
                    </div>
                 )}
                 <div ref={messagesEndRef} />
               </div>

               <div className="px-4 md:px-6 py-4 flex gap-2 md:gap-3 justify-center border-t border-slate-100 bg-white flex-wrap">
                  <span className="px-3 py-1.5 bg-teal-50 text-teal-700 border border-teal-100 rounded-full text-xs font-semibold cursor-pointer hover:bg-teal-100 transition-colors">ATS Optimizer</span>
                  <span className="px-3 py-1.5 bg-teal-50 text-teal-700 border border-teal-100 rounded-full text-xs font-semibold cursor-pointer hover:bg-teal-100 transition-colors">Coding Coach</span>
                  <span className="px-3 py-1.5 bg-teal-50 text-teal-700 border border-teal-100 rounded-full text-xs font-semibold cursor-pointer hover:bg-teal-100 transition-colors">Interview Simulator</span>
               </div>

               <div className="p-3 md:p-4 bg-white border-t border-slate-100 shrink-0">
                 <form onSubmit={handlePromptSubmit} className="flex gap-2 md:gap-3 max-w-3xl mx-auto">
                   <input
                     type="text"
                     value={prompt}
                     onChange={(e) => setPrompt(e.target.value)}
                     placeholder="Message SkillForge AI..."
                     className="flex-1 p-3 md:p-4 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:outline-none transition-all text-slate-700 placeholder:text-slate-400 text-sm md:text-base"
                   />
                   <button
                     type="submit"
                     disabled={promptLoading || !prompt.trim()}
                     className="bg-teal-600 text-white px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold hover:bg-teal-700 disabled:opacity-50 disabled:hover:bg-teal-600 flex items-center justify-center shadow-md shadow-teal-600/20 transition-all"
                   >
                     <Send size={20} className={!prompt.trim() ? 'opacity-50' : 'opacity-100'} />
                   </button>
                 </form>
               </div>
             </div>
            )}

            {/* --- TAB 3: SETTINGS --- */}
            {activeTab === 'settings' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto space-y-6 pb-12 w-full">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Account Settings</h2>
                  <p className="text-slate-500 text-sm mt-1">Manage your profile information and system preferences.</p>
                </div>
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-400 to-emerald-500"></div>
                   <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                     <User size={20} className="text-teal-600" /> Personal Details
                   </h3>
                   <div className="flex flex-col md:flex-row gap-8 items-start">
                     <label className="relative group cursor-pointer flex-shrink-0 mx-auto md:mx-0">
                        <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
                           {profilePic ? (
                             <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                           ) : (
                             <User size={40} className="text-slate-400 group-hover:opacity-0 transition-opacity duration-300" />
                           )}
                        </div>
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                           <Camera size={24} className="text-white" />
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleProfilePicChange} />
                     </label>
                     <div className="flex-1 w-full space-y-5">
                        <div className="grid grid-cols-1 gap-5">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Display Name</label>
                            {/* DYNAMIC DISPLAY NAME FOR PORTFOLIO */}
                            <input 
                              type="text" 
                              value={displayName} 
                              onChange={(e) => setDisplayName(e.target.value)}
                              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 transition-all text-slate-700 font-medium" 
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Mail size={14}/> Registered Email
                          </label>
                          {/* GENERIC DEMO EMAIL */}
                          <input type="email" value="ka097799@gmail.com" disabled className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed" />
                          <p className="text-xs text-slate-400 mt-1.5">Email address cannot be changed for this account.</p>
                        </div>
                     </div>
                   </div>
                </div>
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
                   <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                     <Building size={20} className="text-teal-600" /> Organization
                   </h3>
                   <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Institute / Company</label>
                        <input type="text" defaultValue="" placeholder="Enter Institution Name" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:bg-white transition-all text-slate-700" />
                      </div>
                   </div>
                </div>
                <div className="flex items-center justify-end gap-4 pt-2">
                  {saveMessage && (
                    <span className="text-emerald-600 text-sm font-semibold flex items-center gap-1.5 animate-in fade-in slide-in-from-right-4">
                      <CheckCircle size={16} /> {saveMessage}
                    </span>
                  )}
                  <button onClick={handleSaveSettings} disabled={isSaving} className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 disabled:opacity-70 disabled:cursor-not-allowed">
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />} 
                    {isSaving ? 'Saving Changes...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}