import { GoogleGenAI, Type } from "@google/genai";
import { SchoolGrade, Subject, LearningStyle } from "../types";

// Helper to safely get API Key without crashing in browser if 'process' is undefined
const getApiKey = () => {
  try {
    // Check if process is defined (Node/Bundler environment)
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
    // Check for Vite specific env
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
      // @ts-ignore
      return import.meta.env.VITE_API_KEY;
    }
  } catch (e) {
    console.warn("Environment variable access failed", e);
  }
  return '';
};

const apiKey = getApiKey();
// Initialize conditionally to prevent crash on load if key is missing
const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key-to-prevent-crash' });

const MODEL_FAST = 'gemini-2.5-flash';

export const GeminiService = {
  /**
   * Provides personalized tutoring based on student grade and subject.
   */
  async getTutorHelp(question: string, grade: SchoolGrade, subject: Subject, context: string = ""): Promise<string> {
    if (!apiKey) return "⚠️ Erro de Configuração: API Key não encontrada. Configure a variável de ambiente.";
    
    try {
      const systemInstruction = `Você é um professor particular amigável e encorajador para um aluno do ${grade}. 
      A matéria é ${subject}. 
      Sua resposta deve ser didática, adequada à idade da criança/adolescente, e usar emojis para tornar o aprendizado divertido.
      Se o aluno tiver dificuldades, ofereça exemplos práticos.
      Responda em português do Brasil.`;

      const response = await ai.models.generateContent({
        model: MODEL_FAST,
        contents: `Contexto: ${context}\n\nPergunta do aluno: ${question}`,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      return response.text || "Desculpe, não consegui processar sua dúvida agora.";
    } catch (error) {
      console.error("Gemini Tutor Error:", error);
      return "Ocorreu um erro ao consultar o professor virtual. Verifique sua conexão ou tente novamente.";
    }
  },

  /**
   * Auto-grades a simple text answer.
   */
  async autoGradeAnswer(question: string, answer: string, grade: SchoolGrade): Promise<{ grade: number; feedback: string }> {
    if (!apiKey) return { grade: 0, feedback: "Erro: API Key ausente." };

    try {
      const prompt = `
        Aja como um professor corrigindo uma prova de um aluno do ${grade}.
        Pergunta: "${question}"
        Resposta do Aluno: "${answer}"
        
        Avalie a resposta de 0 a 100 baseando-se na precisão e clareza.
        Forneça um feedback construtivo curto (máximo 2 frases).
        Retorne APENAS JSON.
      `;

      const response = await ai.models.generateContent({
        model: MODEL_FAST,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              grade: { type: Type.INTEGER },
              feedback: { type: Type.STRING }
            }
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error("No response");
      return JSON.parse(text);
    } catch (error) {
      console.error("Gemini Grading Error:", error);
      return { grade: 0, feedback: "Erro na correção automática." };
    }
  },

  /**
   * Generates a lesson plan or summary for teachers.
   */
  async generateLessonContent(topic: string, grade: SchoolGrade, subject: Subject): Promise<string> {
    if (!apiKey) return "Erro: API Key ausente.";

    try {
      const response = await ai.models.generateContent({
        model: MODEL_FAST,
        contents: `Crie um resumo de aula introdutório sobre "${topic}" para alunos do ${grade} na matéria de ${subject}. Inclua 3 pontos principais e uma curiosidade. Use formatação Markdown.`,
      });
      return response.text || "";
    } catch (error) {
      return "Erro ao gerar conteúdo.";
    }
  },

  /**
   * Suggests study resources based on learning style.
   */
  async getAdaptiveRecommendations(style: LearningStyle, subject: Subject, grade: SchoolGrade): Promise<string> {
    if (!apiKey) return "Dicas indisponíveis (API Key ausente).";

    try {
       const response = await ai.models.generateContent({
        model: MODEL_FAST,
        contents: `Sugira 3 atividades ou tipos de conteúdo para um aluno do ${grade} estudar ${subject}. O aluno tem estilo de aprendizado ${style}.
        Para visual: sugira diagramas, vídeos (descrições), mapas mentais.
        Para auditivo: podcasts, explicar em voz alta.
        Para cinestésico: experimentos, montar coisas.
        Formate como uma lista markdown curta.`,
      });
      return response.text || "Sem recomendações no momento.";
    } catch (error) {
      return "Não foi possível carregar recomendações.";
    }
  },

  /**
   * Identifies knowledge gaps based on recent performance mock data.
   */
  async analyzePerformanceGaps(subject: Subject, recentScores: number[]): Promise<string> {
    if (!apiKey) return "Análise indisponível (API Key ausente).";

    try {
      const average = recentScores.reduce((a,b) => a+b, 0) / recentScores.length;
      const prompt = `
        Analise o desempenho de um aluno em ${subject}. Notas recentes: [${recentScores.join(', ')}]. Média: ${average}.
        Identifique potenciais lacunas e sugira uma estratégia de recuperação em 2 frases.
      `;
      const response = await ai.models.generateContent({
        model: MODEL_FAST,
        contents: prompt
      });
      return response.text || "";
    } catch (error) {
      return "Análise indisponível.";
    }
  },

  /**
   * Generates 3 distinct study models for a specific topic (User Request).
   */
  async generateStudyStrategies(topic: string, grade: SchoolGrade, subject: Subject): Promise<string> {
    if (!apiKey) return "Erro: API Key ausente.";

    try {
      const prompt = `
        Como um especialista em educação para o ${grade} na matéria ${subject}, crie 3 estratégias de estudo distintas para o tema "${topic}".
        
        Saída esperada (Markdown):
        
        # 📝 1. Resumo Inteligente
        [Um resumo conciso e claro dos pontos chave do tópico]
        
        # ❓ 2. Quiz Rápido (3 Perguntas)
        [3 perguntas de múltipla escolha ou aberta para testar conhecimento, com as respostas escondidas ou no final]
        
        # 🎨 3. Associação Visual / Prática
        [Descreva uma imagem mental, diagrama ou atividade prática para fixar o conteúdo]
        
        Seja engajador e fale diretamente com o aluno.
      `;
      
      const response = await ai.models.generateContent({
        model: MODEL_FAST,
        contents: prompt
      });
      return response.text || "Não foi possível gerar as estratégias.";
    } catch (error) {
      console.error(error);
      return "Erro ao conectar com a IA.";
    }
  },

  /**
   * Provides a hint for an assignment without solving it (User Request).
   */
  async getAssignmentHint(question: string, grade: SchoolGrade, subject: Subject): Promise<string> {
    if (!apiKey) return "Dica indisponível (API Key ausente).";

    try {
      const prompt = `
        O aluno do ${grade} está com dificuldade na seguinte questão de ${subject}: "${question}".
        
        Dê uma **DICA** ou uma explicação conceitual que ajude o aluno a chegar à resposta sozinho.
        🚫 IMPORTANTE: NÃO dê a resposta final. NÃO resolva o problema completamente.
        Apenas guie o raciocínio. Seja breve (max 3 frases).
      `;
      
      const response = await ai.models.generateContent({
        model: MODEL_FAST,
        contents: prompt
      });
      return response.text || "Tente reler a pergunta com calma. Qual é o conceito principal?";
    } catch (error) {
      return "Não consegui gerar uma dica agora.";
    }
  }
};