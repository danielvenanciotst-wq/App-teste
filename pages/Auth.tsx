import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole, SchoolGrade, Subject, UserStatus, LearningStyle } from '../types';
import { GraduationCap, Mail, Lock, User, School, Book, Chrome } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register } = useAuth();
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Not actually used for mock auth but good for UI
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [selectedGrade, setSelectedGrade] = useState<SchoolGrade>(SchoolGrade.GRADE_1);
  const [learningStyle, setLearningStyle] = useState<LearningStyle>(LearningStyle.VISUAL);
  const [teachingGrades, setTeachingGrades] = useState<SchoolGrade[]>([]);
  const [teachingSubjects, setTeachingSubjects] = useState<Subject[]>([]);
  const [error, setError] = useState('');
  const [pendingMessage, setPendingMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email);
    if (!success) setError('Usuário não encontrado. Tente "admin@educa.com" ou cadastre-se.');
  };

  const handleGoogleMock = async () => {
    // Simulates Google OAuth
    const mockEmail = `google_user_${Math.floor(Math.random() * 1000)}@gmail.com`;
    const mockName = "Usuário Google";
    
    // If logging in vs registering, logic would differ in real app. 
    // Here we assume registration for simplicity if not found, or login if found.
    const success = await login(mockEmail);
    if (success) return;

    // Register flow if not found
    const newUser = {
      id: crypto.randomUUID(),
      name: mockName,
      email: mockEmail,
      role: UserRole.STUDENT, // Default to student for Google quick auth
      status: UserStatus.ACTIVE,
      grade: SchoolGrade.GRADE_1,
      learningStyle: LearningStyle.VISUAL
    };
    await register(newUser);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    const newUser = {
      id: crypto.randomUUID(),
      name,
      email,
      role,
      status: role === UserRole.TEACHER ? UserStatus.PENDING : UserStatus.ACTIVE,
      grade: role === UserRole.STUDENT ? selectedGrade : undefined,
      learningStyle: role === UserRole.STUDENT ? learningStyle : undefined,
      teachingGrades: role === UserRole.TEACHER ? teachingGrades : undefined,
      teachingSubjects: role === UserRole.TEACHER ? teachingSubjects : undefined
    };

    await register(newUser);
    if (role === UserRole.TEACHER) {
      setPendingMessage("Cadastro realizado! Aguarde a aprovação do administrador para acessar o sistema.");
      setIsLogin(true); // Back to login screen to wait
    }
  };

  const toggleTeachingGrade = (grade: SchoolGrade) => {
    setTeachingGrades(prev => 
      prev.includes(grade) ? prev.filter(g => g !== grade) : [...prev, grade]
    );
  };

  const toggleTeachingSubject = (subject: Subject) => {
    setTeachingSubjects(prev => 
      prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
    );
  };

  if (pendingMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center">
          <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Aguardando Aprovação</h2>
          <p className="text-gray-600 mb-6">{pendingMessage}</p>
          <button onClick={() => setPendingMessage('')} className="text-indigo-600 font-semibold hover:underline">
            Voltar ao Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-indigo-50">
      {/* Branding Side */}
      <div className="md:w-1/2 bg-indigo-700 p-12 text-white flex flex-col justify-center relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-8">
            <GraduationCap className="w-12 h-12" />
            <h1 className="text-4xl font-bold">EducaFácil</h1>
          </div>
          <p className="text-xl text-indigo-100 mb-8">
            Plataforma inteligente para escolas de ensino fundamental.
          </p>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-600 p-2 rounded">🧠</div>
              <span>Personalização com IA para cada aluno</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-600 p-2 rounded">📝</div>
              <span>Gestão de turmas e correção automática</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-600 p-2 rounded">🔒</div>
              <span>Segurança e Privacidade total</span>
            </div>
          </div>
        </div>
        {/* Abstract circles */}
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500 rounded-full opacity-50"></div>
        <div className="absolute top-12 right-12 w-32 h-32 bg-indigo-400 rounded-full opacity-20"></div>
      </div>

      {/* Form Side */}
      <div className="md:w-1/2 p-8 md:p-12 flex items-center justify-center overflow-y-auto">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900">{isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta'}</h2>
            <p className="text-gray-500 mt-2">
              {isLogin ? 'Entre para acessar sua sala de aula.' : 'Comece sua jornada de aprendizado.'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
            {!isLogin && (
              <>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Nome Completo"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="flex gap-4 mb-4">
                  <button
                    type="button"
                    onClick={() => setRole(UserRole.STUDENT)}
                    className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold transition-colors ${role === UserRole.STUDENT ? 'border-indigo-600 text-indigo-600 bg-indigo-50' : 'border-gray-200 text-gray-500'}`}
                  >
                    Aluno
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole(UserRole.TEACHER)}
                    className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold transition-colors ${role === UserRole.TEACHER ? 'border-indigo-600 text-indigo-600 bg-indigo-50' : 'border-gray-200 text-gray-500'}`}
                  >
                    Professor
                  </button>
                </div>

                {role === UserRole.STUDENT ? (
                  <>
                    <div className="relative">
                      <School className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                      <select
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white"
                        value={selectedGrade}
                        onChange={e => setSelectedGrade(e.target.value as SchoolGrade)}
                      >
                        {Object.values(SchoolGrade).map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div className="relative">
                       <p className="text-xs text-gray-500 mb-1 ml-1">Estilo de Aprendizado (para personalização IA)</p>
                       <select
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white"
                        value={learningStyle}
                        onChange={e => setLearningStyle(e.target.value as LearningStyle)}
                      >
                        {Object.values(LearningStyle).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <span className="text-sm font-semibold text-gray-700 block mb-2">Turmas que leciona:</span>
                      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                        {Object.values(SchoolGrade).map(g => (
                          <label key={g} className="flex items-center space-x-2 text-sm">
                            <input type="checkbox" checked={teachingGrades.includes(g)} onChange={() => toggleTeachingGrade(g)} className="rounded text-indigo-600" />
                            <span>{g}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-700 block mb-2">Matérias:</span>
                      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                        {Object.values(Subject).map(s => (
                          <label key={s} className="flex items-center space-x-2 text-sm">
                            <input type="checkbox" checked={teachingSubjects.includes(s)} onChange={() => toggleTeachingSubject(s)} className="rounded text-indigo-600" />
                            <span>{s}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="email"
                placeholder="E-mail"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="password"
                placeholder="Senha"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md"
            >
              {isLogin ? 'Entrar' : 'Criar Conta'}
            </button>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Ou continue com</span>
              </div>
            </div>

            <button 
              type="button" 
              onClick={handleGoogleMock}
              className="w-full flex items-center justify-center gap-2 border border-gray-200 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
               <Chrome className="w-5 h-5 text-gray-600" />
               <span className="font-medium text-gray-700">Google (Simulado)</span>
            </button>

            <p className="text-center text-sm text-gray-500 mt-6">
              {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
              <button
                type="button"
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="ml-1 text-indigo-600 font-semibold hover:underline"
              >
                {isLogin ? 'Cadastre-se' : 'Faça Login'}
              </button>
            </p>
          </form>
          {isLogin && <p className="text-xs text-center mt-4 text-gray-400">Dica Admin: admin@educa.com</p>}
        </div>
      </div>
    </div>
  );
};