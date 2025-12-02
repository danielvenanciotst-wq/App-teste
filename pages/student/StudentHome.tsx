import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Subject } from '../../types';
import { GeminiService } from '../../services/geminiService';
import { Bot, Send, Sparkles, Lightbulb, BrainCircuit, ShieldAlert, BarChart3, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const StudentHome: React.FC = () => {
  const { currentUser } = useAuth();
  const { getAssignmentsByGrade } = useData();
  const [activeSubject, setActiveSubject] = useState<Subject>(Subject.MATH);
  
  // AI Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Adaptive Content State
  const [adaptiveTips, setAdaptiveTips] = useState<string>('');
  const [loadingTips, setLoadingTips] = useState(false);

  useEffect(() => {
    if (currentUser?.learningStyle && currentUser.grade) {
      setLoadingTips(true);
      GeminiService.getAdaptiveRecommendations(currentUser.learningStyle, activeSubject, currentUser.grade)
        .then(setAdaptiveTips)
        .finally(() => setLoadingTips(false));
    }
  }, [activeSubject, currentUser]);

  if (!currentUser || !currentUser.grade) return null;

  const assignments = getAssignmentsByGrade(currentUser.grade).filter(a => a.subject === activeSubject);

  const handleAskAI = async () => {
    if (!chatInput.trim()) return;
    setIsAiLoading(true);
    setChatResponse('');
    
    const response = await GeminiService.getTutorHelp(chatInput, currentUser.grade!, activeSubject);
    setChatResponse(response);
    setIsAiLoading(false);
  };

  const performanceData = [
    { name: 'Port', score: 85 },
    { name: 'Mat', score: 65 },
    { name: 'Hist', score: 90 },
    { name: 'Ciên', score: 75 },
    { name: 'Geo', score: 80 },
  ];

  const currentScore = performanceData.find(d => d.name.startsWith(activeSubject.substring(0, 3)))?.score || 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Minha Sala de Aula</h1>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
             <span>Turma: {currentUser.grade}</span>
             <span>•</span>
             <span>Estilo: <span className="font-medium text-indigo-600">{currentUser.learningStyle || 'Padrão'}</span></span>
          </div>
        </div>
        <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 flex gap-2 w-full md:w-auto">
           <select 
             value={activeSubject} 
             onChange={(e) => setActiveSubject(e.target.value as Subject)}
             className="bg-transparent font-medium text-gray-700 outline-none w-full md:w-auto"
           >
             {Object.values(Subject).map(s => <option key={s} value={s}>{s}</option>)}
           </select>
        </div>
      </div>

      {/* Adaptive Insight Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
        <div className="bg-white p-2 rounded-full shadow-sm text-indigo-600 mt-1">
          <Lightbulb className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-800 text-sm mb-1">Dicas para seu Estilo {currentUser.learningStyle}</h3>
          {loadingTips ? (
             <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded"></div>
          ) : (
             <div className="text-sm text-gray-600 markdown-preview prose-sm">
               {adaptiveTips.split('\n').slice(0, 2).map((line, i) => <p key={i} className="mb-0">{line}</p>)}
             </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
           {/* Welcome Banner */}
           <div className="bg-indigo-600 rounded-xl p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-2">Olá, {currentUser.name}!</h2>
                <p className="text-indigo-100 max-w-md">Pronto para aprender algo novo hoje? Verifique suas tarefas pendentes ou converse com o Tutor IA.</p>
              </div>
              <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-10 translate-y-10">
                <BrainCircuit className="w-40 h-40" />
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Assignments Widget */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-indigo-300 transition-colors cursor-pointer" onClick={() => window.location.hash = '#/assignments'}>
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                       <Clock className="text-orange-500 w-5 h-5" /> Tarefas Recentes
                    </h3>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">Ver todas</span>
                 </div>
                 {assignments.length === 0 ? (
                    <p className="text-sm text-gray-400">Nenhuma tarefa pendente!</p>
                 ) : (
                    <ul className="space-y-3">
                       {assignments.slice(0, 3).map(a => (
                          <li key={a.id} className="text-sm border-b border-gray-50 last:border-0 pb-2 last:pb-0">
                             <p className="font-medium text-gray-800 truncate">{a.title}</p>
                             <p className="text-xs text-gray-500">{a.dueDate}</p>
                          </li>
                       ))}
                    </ul>
                 )}
              </div>

              {/* Performance Widget */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                 <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                    <BarChart3 className="text-blue-500 w-5 h-5" /> Desempenho
                 </h3>
                 <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={performanceData}>
                        <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                        <Bar dataKey="score" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                 </div>
              </div>
           </div>
        </div>

        {/* Sidebar: AI Tutor */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-6 rounded-xl shadow-lg flex flex-col h-[500px]">
            <div className="flex items-center gap-2 mb-2 flex-shrink-0">
              <Bot className="w-6 h-6" />
              <h2 className="font-bold text-lg">Tutor IA</h2>
            </div>
            <p className="text-indigo-100 text-xs mb-4 flex-shrink-0">
              Dúvidas em {activeSubject}?
            </p>
            
            <div className="bg-white/10 rounded-lg p-3 flex-1 overflow-y-auto mb-3 text-sm scrollbar-thin scrollbar-thumb-white/20">
              {isAiLoading ? (
                 <div className="flex items-center gap-2 text-indigo-200 animate-pulse mt-2">
                   <Sparkles className="w-4 h-4" /> Pensando...
                 </div>
              ) : chatResponse ? (
                <div className="prose prose-invert prose-sm max-w-none">
                    <p className="whitespace-pre-line">{chatResponse}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-indigo-300 text-center">
                    <BrainCircuit className="w-8 h-8 mb-2 opacity-50" />
                    <p className="italic">"Explique Pitágoras"</p>
                    <p className="italic">"O que é fotossíntese?"</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 flex-shrink-0">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
                placeholder="Digite sua dúvida..."
                className="flex-1 bg-white/20 border border-indigo-400/30 rounded-lg px-3 py-2 text-sm placeholder-indigo-300 outline-none focus:bg-white/30 text-white transition-all"
              />
              <button 
                onClick={handleAskAI}
                className="bg-white text-indigo-700 p-2 rounded-lg hover:bg-indigo-50 transition-colors shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
      </div>
    </div>
  );
};
