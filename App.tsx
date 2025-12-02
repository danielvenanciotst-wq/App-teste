import React from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { AuthPage } from './pages/Auth';
import { Layout } from './components/Layout';
import { StudentHome } from './pages/student/StudentHome';
import { TeacherHome } from './pages/teacher/TeacherHome';
import { AdminPanel } from './pages/admin/AdminPanel';
import { UserRole } from './types';

const AppContent: React.FC = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <AuthPage />;
  }

  // Very simple Hash routing for demo purposes
  const getPage = () => {
    // Check pending status for teachers
    if (currentUser.role === UserRole.TEACHER && currentUser.status === 'PENDING') {
      return (
         <div className="flex items-center justify-center h-full text-center">
           <div>
             <h2 className="text-xl font-bold text-gray-800 mb-2">Cadastro em Análise</h2>
             <p className="text-gray-500">Seu perfil de professor ainda não foi aprovado pelo administrador.</p>
           </div>
         </div>
      );
    }

    switch (currentUser.role) {
      case UserRole.STUDENT:
        return <StudentHome />;
      case UserRole.TEACHER:
        return <TeacherHome />;
      case UserRole.ADMIN:
        return <AdminPanel />;
      default:
        return <div>Papel de usuário desconhecido</div>;
    }
  };

  return (
    <Layout>
      {getPage()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <DataProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </DataProvider>
  );
};

export default App;
