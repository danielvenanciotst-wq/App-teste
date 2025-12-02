export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN'
}

export enum UserStatus {
  PENDING = 'PENDING', // For teachers waiting approval
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  REJECTED = 'REJECTED'
}

export enum LearningStyle {
  VISUAL = 'Visual',
  AUDITORY = 'Auditivo',
  KINESTHETIC = 'Cinestésico',
  READING = 'Leitura/Escrita'
}

export enum SchoolGrade {
  GRADE_1 = '1° Ano',
  GRADE_2 = '2° Ano',
  GRADE_3 = '3° Ano',
  GRADE_4 = '4° Ano',
  GRADE_5 = '5° Ano',
  GRADE_6 = '6° Ano',
  GRADE_7 = '7° Ano',
  GRADE_8 = '8° Ano',
  GRADE_9 = '9° Ano'
}

export enum Subject {
  PORTUGUESE = 'Português',
  MATH = 'Matemática',
  HISTORY = 'História',
  SCIENCE = 'Ciências',
  GEOGRAPHY = 'Geografia',
  ARTS = 'Arte',
  IT = 'Informática',
  LIBRAS = 'Libras',
  PE = 'Educação Física'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  learningStyle?: LearningStyle; // For students, determined by AI or selection
  // Specific fields
  grade?: SchoolGrade; // For students
  teachingGrades?: SchoolGrade[]; // For teachers
  teachingSubjects?: Subject[]; // For teachers
}

export interface Material {
  id: string;
  title: string;
  description: string;
  type: 'VIDEO' | 'PDF' | 'IMAGE' | 'TEXT';
  contentUrl?: string; // Simulated URL or base64
  textContent?: string;
  authorId: string;
  authorName: string;
  grade: SchoolGrade;
  subject: Subject;
  createdAt: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  grade: SchoolGrade;
  subject: Subject;
  dueDate: string;
  questions: {
    id: string;
    text: string;
  }[];
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  answers: { questionId: string; text: string }[];
  aiFeedback?: string;
  aiGrade?: number; // 0-100
  teacherGrade?: number;
  status: 'SUBMITTED' | 'GRADED';
}