
import { GoogleGenAI, Type } from "@google/genai";
import { Indicator } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeIndicator = async (indicator: Indicator) => {
  const dataSummary = indicator.data.map(d => `Mês ${d.month}/${d.year}: ${d.result}${indicator.unit === 'PERCENTUAL' ? '%' : ''}`).join(', ');
  
  const prompt = `Analise o seguinte indicador de performance:
  Nome: ${indicator.name}
  Meta: ${indicator.goal}${indicator.unit === 'PERCENTUAL' ? '%' : ''}
  Formato da Meta: ${indicator.goalFormat}
  Histórico: ${dataSummary}
  
  Por favor, forneça uma análise curta (máximo 3 frases) sobre a tendência atual e se o objetivo está sendo atingido. Use um tom profissional.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Erro ao analisar com Gemini:", error);
    return "Não foi possível gerar a análise no momento.";
  }
};

export const parsePastedData = async (text: string, indicators: Indicator[]) => {
  const indicatorsList = indicators.map(i => `ID: ${i.id}, Nome: ${i.name}, Numerador: ${i.numeratorLabel}, Denominador: ${i.denominatorLabel}`).join(' | ');
  
  const prompt = `O usuário copiou dados de uma planilha e colou aqui: 
  "${text}"
  
  Baseado nestes indicadores existentes: [${indicatorsList}]
  
  Extraia os dados de lançamentos mensais no formato JSON.
  Retorne um ARRAY de objetos com: { indicatorId: string, month: number, year: number, numeratorValue: number, denominatorValue: number }.
  Identifique o indicador pelo nome ou contexto. Se o ano não for mencionado, use 2026. Mês deve ser número (1-12).`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              indicatorId: { type: Type.STRING },
              month: { type: Type.NUMBER },
              year: { type: Type.NUMBER },
              numeratorValue: { type: Type.NUMBER },
              denominatorValue: { type: Type.NUMBER }
            },
            required: ["indicatorId", "month", "year", "numeratorValue", "denominatorValue"]
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Erro ao processar dados com IA:", error);
    throw new Error("Não foi possível interpretar os dados colados. Tente colar um formato mais claro.");
  }
};
