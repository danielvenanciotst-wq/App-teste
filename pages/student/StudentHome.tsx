import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Subject } from '../../types';
import { GeminiService } from '../../services/geminiService';
import { Bot, PlayCircle, FileText, Send, Sparkles, Lightbulb, BrainCircuit, ShieldAlert, Search, X, BookOpen } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const StudentHome: React.FC = () => {
  const { currentUser } = useAuth();
  const { getMaterialsByGrade, getAssignmentsByGrade } = useData();
  const [activeSubject, setActiveSubject] = useState<Subject>(Subject.MATH);
  
  // AI Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Adaptive Content State
  const [adaptiveTips, setAdaptiveTips] = useState<string>('');
  const [loadingTips, setLoadingTips] = useState(false);

  // Search & Study Models State
  const [searchTerm, setSearchTerm] = useState('');
  const [studyModels, setStudyModels] = useState('');
  const [isGeneratingModels, setIsGeneratingModels] = useState(false);

  useEffect(() => {
    if (currentUser?.learningStyle && currentUser.grade) {
      setLoadingTips(true);
      GeminiService.getAdaptiveRecommendations(currentUser.learningStyle, activeSubject, currentUser.grade)
        .then(setAdaptiveTips)
        .finally(() => setLoadingTips(false));
    }
  }, [activeSubject, currentUser]);

  if (!currentUser || !currentUser.grade) return null;

  const materials = getMaterialsByGrade(currentUser.grade).filter(m => m.subject === activeSubject);
  const assignments = getAssignmentsByGrade(currentUser.grade).filter(a => a.subject === activeSubject);

  // Filter materials based on search
  const filteredMaterials = materials.filter(m => 
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAskAI = async () => {
    if (!chatInput.trim()) return;
    setIsAiLoading(true);
    setChatResponse('');
    
    // Pass last material as context if available
    const context = materials.length > 0 ? `Material recente: ${materials[0].title} - ${materials[0].description}` : '';
    
    const response = await GeminiService.getTutorHelp(chatInput, currentUser.grade!, activeSubject, context);
    setChatResponse(response);
    setIsAiLoading(false);
  };

  const handleGenerateStudyModels = async () => {
    if (!searchTerm.trim()) return;
    setIsGeneratingModels(true);
    setStudyModels('');
    const models = await GeminiService.generateStudyModels(searchTerm, currentUser.grade!, activeSubject);
    setStudyModels(models);
    setIsGeneratingModels(false);
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
    <div className="space-y-6">
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
           {/* Subject Selector */}
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
          
          {/* Recent Materials */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <PlayCircle className="text-indigo-600" /> Materiais de Estudo
              </h2>
              {/* Search Bar */}
              <div className="relative w-full sm:w-64 group">
                 <input 
                   type="text" 
                   placeholder="Pesquisar tópico..." 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                 />
                 <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 group-focus-within:text-indigo-500" />
               </div>
            </div>
            
            {/* AI Study Models Feature */}
            {searchTerm && (
              <div className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-white rounded-full text-purple-600 shadow-sm">
                      <Sparkles className="w-5 h-5" />
                   </div>
                   <div>
                      <h3 className="text-sm font-bold text-gray-800">Quer estudar "{searchTerm}"?</h3>
                      <p className="text-xs text-gray-600">A IA pode criar 3 modelos de estudo exclusivos.</p>
                   </div>
                </div>
                <button 
                  onClick={handleGenerateStudyModels}
                  disabled={isGeneratingModels}
                  className="w-full sm:w-auto bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 shadow-sm transition-colors flex items-center justify-center gap-2 font-medium"
                >
                   {isGeneratingModels ? <Sparkles className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
                   Gerar 3 Modelos
                </button>
              </div>
            )}

            {/* AI Generated Models Display */}
            {studyModels && (
               <div className="mb-6 bg-white border border-purple-100 shadow-md p-5 rounded-xl animate-in fade-in slide-in-from-top-4">
                  <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-3">
                     <div className="flex items-center gap-2 text-purple-700">
                        <Bot className="w-5 h-5" /> 
                        <h3 className="font-bold">Planos de Estudo IA: {searchTerm}</h3>
                     </div>
                     <button onClick={() => setStudyModels('')} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                     </button>
                  </div>
                  <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line leading-relaxed">
                     {studyModels}
                  </div>
               </div>
            )}

            {/* Materials List */}
            {filteredMaterials.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                 <p className="text-gray-500 italic">Nenhum material encontrado {searchTerm ? `para "${searchTerm}"` : 'nesta categoria'}.</p>
                 {searchTerm && <p className="text-xs text-indigo-500 mt-2">Use o botão acima para pedir ajuda à IA!</p>}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMaterials.map(m => (
                  <div key={m.id} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer flex justify-between items-center group">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded mt-1">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">{m.title}</h3>
                        <p className="text-sm text-gray-500">{m.description}</p>
                      </div>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium">{m.type}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Assignments */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FileText className="text-orange-500" /> Tarefas Pendentes
            </h2>
            {assignments.length === 0 ? (
              <p className="text-gray-400 italic">Você está em dia com as tarefas!</p>
            ) : (
              <div className="grid gap-4">
                {assignments.map(a => (
                  <div key={a.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-orange-50 rounded-lg border border-orange-100 gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-800">{a.title}</h3>
                      <p className="text-sm text-gray-600">Entrega: {a.dueDate}</p>
                    </div>
                    <button className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-600 w-full sm:w-auto shadow-sm">
                      Resolver
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar: AI Tutor & Stats */}
        <div className="space-y-6">
          
          {/* AI Tutor Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-6 rounded-xl shadow-lg flex flex-col h-96">
            <div className="flex items-center gap-2 mb-2 flex-shrink-0">
              <Bot className="w-6 h-6" />
              <h2 className="font-bold text-lg">Tutor IA</h2>
            </div>
            <p className="text-indigo-100 text-xs mb-4 flex-shrink-0">
              Dúvidas em {activeSubject}? Estou aqui para ajudar!
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
                    <p className="italic">"Como resolvo uma equação?"</p>
                    <p className="italic">"Resuma a Revolução Francesa"</p>
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

          {/* Performance Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-700 mb-4">Meu Desempenho</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                  <Bar dataKey="score" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
             {currentScore < 70 && (
              <div className="mt-4 text-xs text-red-700 bg-red-50 p-3 rounded border border-red-100 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>A IA identificou lacunas em <b>{activeSubject}</b>. Recomendamos revisar os materiais marcados como "Básico".</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};