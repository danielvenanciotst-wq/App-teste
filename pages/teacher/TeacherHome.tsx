import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { GeminiService } from '../../services/geminiService';
import { SchoolGrade, Subject, UserRole } from '../../types';
import { Plus, Users, Sparkles, BrainCircuit, Save, CheckCircle2, AlertTriangle, BarChart3 } from 'lucide-react';

export const TeacherHome: React.FC = () => {
  const { currentUser } = useAuth();
  const { addMaterial } = useData();
  
  // Create Material State
  const [selectedGrade, setSelectedGrade] = useState<SchoolGrade>(currentUser?.teachingGrades?.[0] || SchoolGrade.GRADE_1);
  const [selectedSubject, setSelectedSubject] = useState<Subject>(currentUser?.teachingSubjects?.[0] || Subject.MATH);
  const [topic, setTopic] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // AI Insights State
  const [gapAnalysis, setGapAnalysis] = useState<string>('');

  if (currentUser?.status !== 'ACTIVE') {
    return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8">
            <AlertTriangle className="w-12 h-12 text-orange-500 mb-4" />
            <h2 className="text-xl font-bold text-gray-800">Aprovação Pendente</h2>
            <p className="text-gray-600 mt-2">Sua conta aguarda aprovação do administrador.</p>
        </div>
    );
  }

  const handleGenerateAI = async () => {
    if (!topic) return;
    setIsGenerating(true);
    const content = await GeminiService.generateLessonContent(topic, selectedGrade, selectedSubject);
    setGeneratedContent(content);
    setIsGenerating(false);
  };

  const handleSaveMaterial = () => {
    if (!generatedContent || !topic) return;
    addMaterial({
      id: crypto.randomUUID(),
      title: topic,
      description: `Material gerado por IA sobre ${topic}`,
      type: 'TEXT',
      textContent: generatedContent,
      authorId: currentUser.id,
      authorName: currentUser.name,
      grade: selectedGrade,
      subject: selectedSubject,
      createdAt: new Date().toISOString()
    });
    setTopic('');
    setGeneratedContent('');
    alert('Material publicado com sucesso!');
  };

  const handleAnalyzeGaps = async () => {
      setGapAnalysis("Analisando dados da turma...");
      // Mock data for demonstration
      const mockScores = [50, 60, 45, 80, 55, 40, 90];
      const analysis = await GeminiService.analyzePerformanceGaps(selectedSubject, mockScores);
      setGapAnalysis(analysis);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Painel do Professor</h1>
            <p className="text-gray-500">Gerencie conteúdos e acompanhe suas turmas</p>
        </div>
        <div className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
          <Users className="w-4 h-4" /> Minhas Turmas: {currentUser.teachingGrades?.length}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end">
         <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Turma</label>
              <select 
                className="border rounded-lg p-2 bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-200"
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value as SchoolGrade)}
              >
                {currentUser.teachingGrades?.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Matéria</label>
              <select 
                className="border rounded-lg p-2 bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-200"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value as Subject)}
              >
                {currentUser.teachingSubjects?.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Create Content with AI */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 md:col-span-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <BrainCircuit className="w-32 h-32 text-purple-600" />
          </div>
          
          <div className="flex items-center gap-2 mb-6 relative z-10">
            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Criador de Aulas Inteligente</h2>
              <p className="text-sm text-gray-500">Gere conteúdo adaptado automaticamente.</p>
            </div>
          </div>

          <div className="mb-4 relative z-10">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tópico da Aula</label>
            <div className="flex gap-2">
                <input 
                    type="text"
                    className="flex-1 border rounded-lg p-2 focus:ring-2 focus:ring-purple-200 outline-none"
                    placeholder="Ex: O Ciclo da Água, Frações, Era Vargas..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                />
                <button 
                onClick={handleGenerateAI}
                disabled={isGenerating || !topic}
                className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-all shadow-md"
                >
                {isGenerating ? <Sparkles className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Gerar
                </button>
            </div>
          </div>

          {generatedContent && (
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-700">Conteúdo Gerado:</h3>
                   <button 
                    onClick={handleSaveMaterial}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm shadow-sm"
                    >
                    <Save className="w-4 h-4" />
                    Publicar para Turma
                    </button>
              </div>
              <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-line bg-white p-4 rounded border border-gray-100 max-h-60 overflow-y-auto">
                {generatedContent}
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats / Automated Grading */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                 <h3 className="font-bold text-gray-800">Correção Automática</h3>
                 <CheckCircle2 className="text-green-500 w-5 h-5" />
            </div>
            
            <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                <p className="text-sm text-green-800 font-medium mb-2">Status da IA:</p>
                <div className="flex items-center gap-2 text-xs text-green-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Monitorando novas submissões
                </div>
                <p className="text-xs mt-3 text-green-600">
                    Tarefas objetivas e dissertativas curtas serão corrigidas e receberão feedback imediato assim que o aluno enviar.
                </p>
            </div>
            
            <div className="mt-4 text-center py-4 border-t border-gray-100">
                <span className="text-3xl font-bold text-gray-700">0</span>
                <p className="text-xs text-gray-500">Tarefas pendentes de revisão manual</p>
            </div>
        </div>

        {/* Gap Analysis */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <div className="flex items-center gap-2 mb-4">
                 <BarChart3 className="text-blue-600" />
                 <h3 className="font-bold text-gray-800">Identificação de Lacunas</h3>
             </div>
             
             <div className="space-y-4">
                 <div className="flex items-center justify-between text-sm">
                     <span className="text-gray-600">Média da Turma ({selectedSubject})</span>
                     <span className="text-blue-600 font-bold text-lg">6.2</span>
                 </div>
                 <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '62%' }}></div>
                 </div>
                 
                 {!gapAnalysis ? (
                     <button 
                        onClick={handleAnalyzeGaps}
                        className="w-full mt-2 border border-blue-200 text-blue-600 py-2 rounded-lg hover:bg-blue-50 text-sm transition-colors"
                     >
                         Gerar Análise Preditiva
                     </button>
                 ) : (
                     <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 border border-blue-100 animate-in fade-in">
                         <p>{gapAnalysis}</p>
                     </div>
                 )}
             </div>
        </div>

      </div>
    </div>
  );
};