import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { UserRole, UserStatus } from '../../types';
import { Check, X, ShieldAlert, UserCheck, UserX, Search, School, Filter } from 'lucide-react';

type Tab = 'DASHBOARD' | 'APPROVALS' | 'USERS';

export const AdminPanel: React.FC = () => {
  const { users, updateUserStatus } = useData();
  const [activeTab, setActiveTab] = useState<Tab>('DASHBOARD');
  const [filterText, setFilterText] = useState('');

  const pendingTeachers = users.filter(u => u.role === UserRole.TEACHER && u.status === UserStatus.PENDING);
  const activeTeachers = users.filter(u => u.role === UserRole.TEACHER && u.status === UserStatus.ACTIVE);
  const students = users.filter(u => u.role === UserRole.STUDENT);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(filterText.toLowerCase()) || 
    u.email.toLowerCase().includes(filterText.toLowerCase())
  );

  const renderDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-300 transition-all" onClick={() => setActiveTab('APPROVALS')}>
         <div className={`p-4 rounded-full mb-3 ${pendingTeachers.length > 0 ? 'bg-orange-100 text-orange-600 animate-pulse' : 'bg-gray-100 text-gray-400'}`}>
           <ShieldAlert className="w-8 h-8" />
         </div>
         <h3 className="text-2xl font-bold text-gray-800">{pendingTeachers.length}</h3>
         <p className="text-sm text-gray-500">Aprovações Pendentes</p>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
         <div className="p-4 bg-blue-100 rounded-full text-blue-600 mb-3">
           <School className="w-8 h-8" />
         </div>
         <h3 className="text-2xl font-bold text-gray-800">{activeTeachers.length}</h3>
         <p className="text-sm text-gray-500">Professores Ativos</p>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
         <div className="p-4 bg-green-100 rounded-full text-green-600 mb-3">
           <UserCheck className="w-8 h-8" />
         </div>
         <h3 className="text-2xl font-bold text-gray-800">{students.length}</h3>
         <p className="text-sm text-gray-500">Alunos Cadastrados</p>
      </div>
    </div>
  );

  const renderApprovals = () => (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 bg-orange-50 border-b border-orange-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ShieldAlert className="text-orange-600" />
            <h2 className="text-lg font-bold text-orange-900">Aprovação de Professores</h2>
          </div>
          <span className="text-sm bg-white px-2 py-1 rounded border border-orange-200 text-orange-800 font-mono">
            {pendingTeachers.length} Pendente(s)
          </span>
        </div>
        
        {pendingTeachers.length === 0 ? (
          <div className="p-12 text-center text-gray-400 flex flex-col items-center">
            <Check className="w-12 h-12 mb-2 text-green-300" />
            <p>Tudo em dia! Não há professores aguardando aprovação.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {pendingTeachers.map(teacher => (
              <div key={teacher.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="mb-4 md:mb-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-800 text-lg">{teacher.name}</h3>
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full uppercase font-bold">Novo</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{teacher.email}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {teacher.teachingGrades?.map(g => (
                      <span key={g} className="text-xs border border-gray-200 text-gray-600 px-2 py-1 rounded bg-white">{g}</span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {teacher.teachingSubjects?.map(s => (
                      <span key={s} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      if(confirm(`Aprovar o acesso de ${teacher.name}?`)) {
                        updateUserStatus(teacher.id, UserStatus.ACTIVE);
                      }
                    }}
                    className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 shadow-sm transition-transform active:scale-95"
                  >
                    <Check className="w-4 h-4" /> <span>Aprovar</span>
                  </button>
                  <button 
                    onClick={() => {
                       if(confirm(`Rejeitar e bloquear o cadastro de ${teacher.name}?`)) {
                        updateUserStatus(teacher.id, UserStatus.REJECTED);
                       }
                    }}
                    className="flex items-center gap-2 bg-white border border-red-200 text-red-600 px-5 py-2 rounded-lg hover:bg-red-50 transition-transform active:scale-95"
                  >
                    <X className="w-4 h-4" /> <span>Rejeitar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
  );

  const renderUsers = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou email..." 
            className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
        <button className="p-2 border rounded-lg hover:bg-gray-50">
          <Filter className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
            <tr>
              <th className="p-4">Usuário</th>
              <th className="p-4">Papel</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="p-4">
                  <p className="font-semibold text-gray-800">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-1 rounded-full font-bold ${user.role === UserRole.TEACHER ? 'bg-purple-100 text-purple-700' : user.role === UserRole.STUDENT ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4">
                   <span className={`text-xs px-2 py-1 rounded ${
                     user.status === UserStatus.ACTIVE ? 'text-green-600 bg-green-50' : 
                     user.status === UserStatus.PENDING ? 'text-orange-600 bg-orange-50' : 
                     'text-red-600 bg-red-50'
                   }`}>
                     {user.status}
                   </span>
                </td>
                <td className="p-4 text-right">
                  {user.role !== UserRole.ADMIN && (
                     <div className="flex justify-end gap-2">
                       {user.status === UserStatus.ACTIVE ? (
                          <button onClick={() => updateUserStatus(user.id, UserStatus.SUSPENDED)} title="Suspender" className="p-1 text-red-500 hover:bg-red-50 rounded">
                            <UserX className="w-4 h-4" />
                          </button>
                       ) : (
                          <button onClick={() => updateUserStatus(user.id, UserStatus.ACTIVE)} title="Ativar" className="p-1 text-green-500 hover:bg-green-50 rounded">
                            <Check className="w-4 h-4" />
                          </button>
                       )}
                     </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Painel Administrativo</h1>
          <p className="text-gray-500">Gerencie a plataforma EducaFácil</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
          <button 
            onClick={() => setActiveTab('DASHBOARD')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'DASHBOARD' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Visão Geral
          </button>
          <button 
            onClick={() => setActiveTab('APPROVALS')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'APPROVALS' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Aprovações {pendingTeachers.length > 0 && <span className="ml-1 px-1.5 py-0.5 bg-orange-500 text-white text-xs rounded-full">{pendingTeachers.length}</span>}
          </button>
          <button 
             onClick={() => setActiveTab('USERS')}
             className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'USERS' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Todos Usuários
          </button>
        </div>
      </div>

      {activeTab === 'DASHBOARD' && renderDashboard()}
      {activeTab === 'APPROVALS' && renderApprovals()}
      {activeTab === 'USERS' && renderUsers()}
    </div>
  );
};