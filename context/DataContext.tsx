import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Material, Assignment, Submission, UserRole, UserStatus, SchoolGrade, Subject } from '../types';

interface DataContextType {
  users: User[];
  materials: Material[];
  assignments: Assignment[];
  submissions: Submission[];
  addUser: (user: User) => void;
  updateUserStatus: (id: string, status: UserStatus) => void;
  addMaterial: (material: Material) => void;
  addAssignment: (assignment: Assignment) => void;
  submitAssignment: (submission: Submission) => void;
  getMaterialsByGrade: (grade: SchoolGrade) => Material[];
  getAssignmentsByGrade: (grade: SchoolGrade) => Assignment[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const MOCK_ADMIN: User = {
  id: 'admin-1',
  name: 'Administrador Principal',
  email: 'admin@educa.com',
  role: UserRole.ADMIN,
  status: UserStatus.ACTIVE
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([MOCK_ADMIN]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  // Load from local storage on mount
  useEffect(() => {
    const loadedUsers = localStorage.getItem('educa_users');
    if (loadedUsers) setUsers(JSON.parse(loadedUsers));

    const loadedMat = localStorage.getItem('educa_materials');
    if (loadedMat) setMaterials(JSON.parse(loadedMat));

    const loadedAss = localStorage.getItem('educa_assignments');
    if (loadedAss) setAssignments(JSON.parse(loadedAss));

    const loadedSub = localStorage.getItem('educa_submissions');
    if (loadedSub) setSubmissions(JSON.parse(loadedSub));
  }, []);

  // Save to local storage on change
  useEffect(() => localStorage.setItem('educa_users', JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem('educa_materials', JSON.stringify(materials)), [materials]);
  useEffect(() => localStorage.setItem('educa_assignments', JSON.stringify(assignments)), [assignments]);
  useEffect(() => localStorage.setItem('educa_submissions', JSON.stringify(submissions)), [submissions]);

  const addUser = (user: User) => setUsers(prev => [...prev, user]);
  
  const updateUserStatus = (id: string, status: UserStatus) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u));
  };

  const addMaterial = (material: Material) => setMaterials(prev => [material, ...prev]);
  const addAssignment = (assignment: Assignment) => setAssignments(prev => [assignment, ...prev]);
  const submitAssignment = (submission: Submission) => setSubmissions(prev => [submission, ...prev]);

  const getMaterialsByGrade = (grade: SchoolGrade) => materials.filter(m => m.grade === grade);
  const getAssignmentsByGrade = (grade: SchoolGrade) => assignments.filter(a => a.grade === grade);

  return (
    <DataContext.Provider value={{
      users,
      materials,
      assignments,
      submissions,
      addUser,
      updateUserStatus,
      addMaterial,
      addAssignment,
      submitAssignment,
      getMaterialsByGrade,
      getAssignmentsByGrade
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within DataProvider");
  return context;
};