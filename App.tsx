import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { AuthPage } from './pages/Auth';
import { Layout } from './components/Layout';
import { StudentHome } from './pages/student/StudentHome';
import { StudentMaterials } from './pages/student/StudentMaterials';
import { StudentAssignments } from './pages/student/StudentAssignments';
import { TeacherHome } from './pages/teacher/TeacherHome';
import { AdminPanel } from './pages/admin/AdminPanel';
import { UserRole } from './types';

const AppContent: React.FC = () => {
  const { currentUser } = useAuth();
  const [currentRoute, setCurrentRoute] = useState(window.location.hash || '#/');

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(window.location.hash || '#/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (!currentUser) {
    return <AuthPage />;
  }

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
        if (currentRoute === '#/materials') return <StudentMaterials />;
        if (currentRoute === '#/assignments') return <StudentAssignments />;
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
