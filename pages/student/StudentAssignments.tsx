import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { GeminiService } from '../../services/geminiService';
import { Subject, Assignment } from '../../types';
import { CheckSquare, HelpCircle, Send, Lightbulb, ChevronRight, ArrowLeft } from 'lucide-react';

export const StudentAssignments: React.FC = () => {
  const { currentUser } = useAuth();
  const { getAssignmentsByGrade, submitAssignment } = useData();
  const [activeSubject, setActiveSubject] = useState<Subject>(Subject.MATH);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  // AI Hint State
  const [hint, setHint] = useState<string | null>(null);
  const [loadingHint, setLoadingHint] = useState<string | null>(null); // Stores question ID loading

  if (!currentUser?.grade) return null;

  const assignments = getAssignmentsByGrade(currentUser.grade).filter(a => a.subject === activeSubject);

  const handleGetHint = async (questionText: string, questionId: string) => {
    setLoadingHint(questionId);
    const hintText = await GeminiService.getAssignmentHint(questionText, currentUser.grade!, activeSubject);
    setHint(hintText); // In a real app, map hints to specific questions. Here we show one modal/toast.
    setLoadingHint(null);
  };

  const handleSubmit = () => {
    if(!selectedAssignment) return;
    submitAssignment({
      id: crypto.randomUUID(),
      assignmentId: selectedAssignment.id,
      studentId: currentUser.id,
      studentName: currentUser.name,
      answers: Object.entries(answers).map(([qid, text]) => ({ questionId: qid, text })),
      status: 'SUBMITTED'
    });
    alert('Tarefa enviada com sucesso!');
    setSelectedAssignment(null);
    setAnswers({});
  };

  if (selectedAssignment) {
    return (
      <div className="animate-in slide-in-from-right duration-300">
        <button 
          onClick={() => { setSelectedAssignment(null); setHint(null); }}
          className="flex items-center text-gray-500 hover:text-indigo-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Tarefas
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 bg-indigo-50 border-b border-indigo-100">
            <h2 className="text-xl font-bold text-gray-800">{selectedAssignment.title}</h2>
            <p className="text-gray-600">{selectedAssignment.description}</p>
          </div>

          <div className="p-6 space-y-8">
            {selectedAssignment.questions.map((q, index) => (
              <div key={q.id} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                 <div className="flex justify-between items-start mb-3">
                   <h3 className="font-semibold text-gray-800">Questão {index + 1}</h3>
                   <button 
                     onClick={() => handleGetHint(q.text, q.id)}
                     disabled={loadingHint === q.id}
                     className="text-xs flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-full hover:bg-yellow-200 transition-colors"
                   >
                     {loadingHint === q.id ? <div className="animate-spin w-3 h-3 border-2 border-yellow-700 border-t-transparent rounded-full"></div> : <Lightbulb className="w-3 h-3" />}
                     Pedir Dica IA
                   </button>
                 </div>
                 <p className="text-gray-700 mb-4 text-lg">{q.text}</p>
                 
                 {/* Hint Display Area (Simplification: Only showing latest hint right below the button or via a modal would be better, but inline is fine) */}
                 {hint && loadingHint === null && (
                   // Ideally we check if hint belongs to this question, but for simplicity:
                   <div className="mb-4 bg-yellow-50 border border-yellow-200 p-3 rounded text-sm text-yellow-800 flex gap-2">
                     <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" />
                     <div>
                       <span className="font-bold">Dica do Tutor:</span> {hint}
                     </div>
                   </div>
                 )}

                 <textarea
                   className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                   rows={4}
                   placeholder="Sua resposta..."
                   value={answers[q.id] || ''}
                   onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                 />
              </div>
            ))}
          </div>
          
          <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end">
            <button 
              onClick={handleSubmit}
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <Send className="w-5 h-5" /> Enviar Tarefa
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <CheckSquare className="text-indigo-600" /> Tarefas da Turma
        </h1>
        <select 
          value={activeSubject} 
          onChange={(e) => setActiveSubject(e.target.value as Subject)}
          className="bg-white border border-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {Object.values(Subject).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="grid gap-4">
        {assignments.length === 0 ? (
           <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
             <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
               <CheckSquare className="w-8 h-8 text-green-600" />
             </div>
             <h3 className="text-lg font-bold text-gray-800">Tudo Feito!</h3>
             <p className="text-gray-500">Você não tem tarefas pendentes de {activeSubject}.</p>
           </div>
        ) : (
          assignments.map(a => (
            <div key={a.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 hover:border-indigo-300 transition-all group">
               <div>
                 <h3 className="font-bold text-lg text-gray-800 group-hover:text-indigo-600 transition-colors">{a.title}</h3>
                 <p className="text-gray-500 text-sm mb-2">{a.description}</p>
                 <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-medium">Entrega: {a.dueDate}</span>
                 <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium ml-2">{a.questions.length} questões</span>
               </div>
               <button 
                 onClick={() => setSelectedAssignment(a)}
                 className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2"
               >
                 Resolver <ChevronRight className="w-4 h-4" />
               </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};