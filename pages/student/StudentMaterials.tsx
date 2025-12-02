import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { GeminiService } from '../../services/geminiService';
import { Subject, SchoolGrade } from '../../types';
import { Search, Sparkles, BookOpen, Layers, PlayCircle, FileText } from 'lucide-react';

export const StudentMaterials: React.FC = () => {
  const { currentUser } = useAuth();
  const { getMaterialsByGrade } = useData();
  const [activeSubject, setActiveSubject] = useState<Subject>(Subject.MATH);
  const [searchTerm, setSearchTerm] = useState('');
  
  // AI Strategy State
  const [aiStrategies, setAiStrategies] = useState('');
  const [loadingStrategies, setLoadingStrategies] = useState(false);

  if (!currentUser?.grade) return null;

  const materials = getMaterialsByGrade(currentUser.grade).filter(m => m.subject === activeSubject);
  const filteredMaterials = materials.filter(m => 
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGenerateStrategies = async () => {
    if (!searchTerm.trim()) return;
    setLoadingStrategies(true);
    const strategies = await GeminiService.generateStudyStrategies(searchTerm, currentUser.grade!, activeSubject);
    setAiStrategies(strategies);
    setLoadingStrategies(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="text-indigo-600" /> Materiais de Estudo
          </h1>
          <p className="text-gray-500">Explore conteúdos e use a IA para criar planos de estudo.</p>
        </div>
        
        <select 
          value={activeSubject} 
          onChange={(e) => setActiveSubject(e.target.value as Subject)}
          className="bg-white border border-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {Object.values(Subject).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Search & AI Action */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Pesquisar tópico (ex: Frações, Revolução Industrial)..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button 
            onClick={handleGenerateStrategies}
            disabled={!searchTerm || loadingStrategies}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loadingStrategies ? <Sparkles className="w-5 h-5 animate-spin" /> : <Layers className="w-5 h-5" />}
            Gerar 3 Estratégias IA
          </button>
        </div>

        {/* AI Results Area */}
        {aiStrategies && (
          <div className="mt-6 bg-indigo-50 border border-indigo-100 rounded-xl p-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5">
               <Sparkles className="w-40 h-40 text-indigo-900" />
             </div>
             <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
               <Sparkles className="w-5 h-5 text-purple-600" /> Estratégias Personalizadas para "{searchTerm}"
             </h3>
             <div className="prose prose-indigo max-w-none text-gray-700 bg-white/50 p-4 rounded-lg">
               <div className="whitespace-pre-line">{aiStrategies}</div>
             </div>
          </div>
        )}
      </div>

      {/* Standard Materials List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map(m => (
          <div key={m.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-indigo-300 transition-colors group cursor-pointer flex flex-col h-full">
            <div className="flex items-start justify-between mb-3">
              <div className={`p-3 rounded-lg ${m.type === 'VIDEO' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                {m.type === 'VIDEO' ? <PlayCircle className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
              </div>
              <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded">{m.type}</span>
            </div>
            <h3 className="font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">{m.title}</h3>
            <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1">{m.description}</p>
            <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-sm">
              <span className="text-gray-400">Prof. {m.authorName}</span>
              <button className="text-indigo-600 font-medium hover:underline">Acessar</button>
            </div>
          </div>
        ))}
        
        {filteredMaterials.length === 0 && !aiStrategies && (
          <div className="col-span-full text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Nenhum material encontrado. Use a busca acima para gerar conteúdo com IA!</p>
          </div>
        )}
      </div>
    </div>
  );
};