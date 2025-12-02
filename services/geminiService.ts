import { GoogleGenAI, Type } from "@google/genai";
import { SchoolGrade, Subject, LearningStyle } from "../types";

// Ensure API key is available
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const MODEL_FAST = 'gemini-2.5-flash';

export const GeminiService = {
  /**
   * Provides personalized tutoring based on student grade and subject.
   */
  async getTutorHelp(question: string, grade: SchoolGrade, subject: Subject, context: string = ""): Promise<string> {
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
      return "Ocorreu um erro ao consultar o professor virtual. Tente novamente.";
    }
  },

  /**
   * Auto-grades a simple text answer.
   */
  async autoGradeAnswer(question: string, answer: string, grade: SchoolGrade): Promise<{ grade: number; feedback: string }> {
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
   * Generates 3 distinct study models/plans for a specific topic.
   */
  async generateStudyModels(topic: string, grade: SchoolGrade, subject: Subject): Promise<string> {
    try {
      const prompt = `
        Atue como um especialista em educação. Para um aluno do ${grade} estudando ${subject}, crie 3 modelos de estudo diferentes e criativos para o tópico "${topic}".
        
        Estruture a resposta exatamente assim:
        
        🏁 **Modelo 1: [Nome da Estratégia]**
        [Descrição curta e como fazer]
        
        🧩 **Modelo 2: [Nome da Estratégia]**
        [Descrição curta e como fazer]
        
        🎨 **Modelo 3: [Nome da Estratégia]**
        [Descrição curta e como fazer]
        
        Seja didático, direto e use uma linguagem motivadora para o aluno.
      `;
      
      const response = await ai.models.generateContent({
        model: MODEL_FAST,
        contents: prompt
      });
      return response.text || "Não foi possível gerar os modelos de estudo.";
    } catch (error) {
      console.error(error);
      return "Erro ao conectar com o tutor IA para gerar modelos.";
    }
  }
};