import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { LogOut, LayoutDashboard, BookOpen, Users, CheckSquare, GraduationCap } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentUser, logout } = useAuth();

  if (!currentUser) return <>{children}</>;

  const getNavItems = () => {
    switch (currentUser.role) {
      case UserRole.STUDENT:
        return [
          { icon: LayoutDashboard, label: 'Meu Painel', href: '#/' },
          { icon: BookOpen, label: 'Materiais', href: '#/materials' },
          { icon: CheckSquare, label: 'Tarefas', href: '#/assignments' },
        ];
      case UserRole.TEACHER:
        return [
          { icon: LayoutDashboard, label: 'Visão Geral', href: '#/' },
          { icon: Users, label: 'Minhas Turmas', href: '#/classes' },
          { icon: BookOpen, label: 'Postar Material', href: '#/create-material' },
        ];
      case UserRole.ADMIN:
        return [
          { icon: LayoutDashboard, label: 'Admin Dashboard', href: '#/' },
          { icon: Users, label: 'Aprovações', href: '#/approvals' },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-indigo-700 text-white flex-shrink-0">
        <div className="p-6 border-b border-indigo-600 flex items-center space-x-2">
          <GraduationCap className="w-8 h-8" />
          <h1 className="text-xl font-bold">EducaFácil</h1>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <p className="text-xs text-indigo-300 uppercase tracking-wider">Bem-vindo,</p>
            <p className="font-semibold truncate">{currentUser.name}</p>
            <p className="text-xs text-indigo-200 mt-1">{currentUser.role === 'TEACHER' ? 'Professor(a)' : currentUser.role === 'STUDENT' ? 'Aluno(a)' : 'Admin'}</p>
          </div>

          <nav className="space-y-2">
            {getNavItems().map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-indigo-600 transition-colors"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
        </div>

        <div className="p-6 mt-auto">
          <button
            onClick={logout}
            className="flex items-center space-x-3 px-4 py-3 w-full text-left text-red-200 hover:text-white hover:bg-indigo-600 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
