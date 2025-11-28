import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ChatMessage } from '../types';

const getApiKey = (): string => {
  const key = process.env.API_KEY;
  if (!key) {
    throw new Error("API Key not found in environment variables.");
  }
  return key;
};

// Helper to convert File to Base64
export const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeResume = async (
  file: File,
  jobDescription: string
): Promise<AnalysisResult> => {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  // Using Flash for high speed processing of documents
  const modelId = "gemini-2.5-flash"; 
  
  const filePart = await fileToGenerativePart(file);

  const prompt = `
    You are an expert Senior Technical Recruiter. 
    Analyze the provided resume against the Job Description below with extreme scrutiny.

    JOB DESCRIPTION:
    ${jobDescription}

    TASK:
    1. Extract candidate details (Contact, Education, Experience).
    2. Analyze skills and categorize them. Estimate years of experience per skill based on work history context.
    3. Determine a 'matchScore' (0-100). Be strict. 90+ is perfect match, 70+ is good, below 50 is poor.
    4. Identify GAPS (missingSkills).
    5. Provide a specific, no-fluff reasoning for the score.

    OUTPUT:
    Return strictly JSON adhering to the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          filePart,
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            candidateName: { type: Type.STRING },
            yearsOfExperience: { type: Type.NUMBER, description: "Total years of relevant experience" },
            contact: {
              type: Type.OBJECT,
              properties: {
                email: { type: Type.STRING, nullable: true },
                phone: { type: Type.STRING, nullable: true },
                linkedin: { type: Type.STRING, nullable: true },
                location: { type: Type.STRING, nullable: true }
              }
            },
            roleMatch: { type: Type.STRING, description: "The most fitting job title" },
            matchScore: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            skills: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  category: { type: Type.STRING, enum: ["Technical", "Soft", "Domain", "Tool"] },
                  yearsOfExperience: { type: Type.NUMBER, nullable: true },
                  relevance: { type: Type.STRING, enum: ["High", "Medium", "Low"] }
                }
              }
            },
            missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            education: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  degree: { type: Type.STRING },
                  institution: { type: Type.STRING },
                  year: { type: Type.STRING, nullable: true }
                }
              }
            },
            experience: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  role: { type: Type.STRING },
                  company: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  highlights: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            },
            reasoning: { type: Type.STRING }
          },
          required: ["candidateName", "matchScore", "skills", "reasoning", "experience"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Error analyzing resume:", error);
    throw error;
  }
};

export const chatWithCandidate = async (
  resumeResult: AnalysisResult,
  chatHistory: ChatMessage[],
  newMessage: string
): Promise<string> => {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const modelId = "gemini-2.5-flash";

  // Create a context block from the analyzed data
  // Note: In a real app with file persistence, we might pass the filePart again, 
  // but here we use the structured extracted data which is cheaper and faster for Q&A.
  const context = `
    Candidate Data: ${JSON.stringify(resumeResult)}
    
    You are an AI Assistant helping a recruiter interview this candidate virtually.
    Answer questions about the candidate based ONLY on the provided data.
    If the information is not in the data, say "I cannot find that information in the resume."
    Keep answers concise and professional.
  `;

  // Construct history
  // System instruction is not strictly "chat" history, so we prepend it to the first message or use systemInstruction config
  // The SDK chat capabilities handle history if we use ai.chats.create, but for a stateless request pattern (easier here), we format it manually.
  
  const chat = ai.chats.create({
    model: modelId,
    config: {
      systemInstruction: context,
    }
  });

  // Replay history to get state (optimally we would keep the chat object alive in the component, 
  // but for simplicity in this architecture we recreate).
  // Note: This is a simplified approach.
  for (const msg of chatHistory) {
    if (msg.role === 'user') {
      await chat.sendMessage({ message: msg.text });
    }
    // We assume model responses are implicitly handled by the internal history of the 'chat' object 
    // if we were re-hydrating. Since we can't easily rehydrate the internal state of a fresh Chat object 
    // with "Model" turns without a strictly alternating history, we will just send the *last* message 
    // with the Context as system instruction.
    // A better robust way for this specific Stateless UI -> Stateful AI interaction:
  }

  // Actually, for this specific use case, single-turn generation with context is often more robust 
  // than trying to sync client-side state with server-side chat session object if we don't persist the object.
  // Let's use generateContent with the full history as a prompt text.
  
  const historyText = chatHistory.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n');
  const fullPrompt = `
    ${context}

    Current Conversation:
    ${historyText}
    USER: ${newMessage}
    MODEL:
  `;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: fullPrompt
  });

  return response.text || "I couldn't generate a response.";
};