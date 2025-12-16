import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CharacterDetails } from '../types';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const CACHE_PREFIX = 'hanzi_flow_ai_v1_zh_'; // Changed cache key for Chinese content

const characterSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        character: { type: Type.STRING, description: "The Chinese character itself." },
        pinyin: { type: Type.STRING, description: "The Pinyin pronunciation with tone marks." },
        definition: { type: Type.STRING, description: "Chinese definition of the character." },
        etymology: { type: Type.STRING, description: "A brief, 1-2 sentence explanation of the character's origin or mnemonic in Chinese." },
        examples: {
            type: Type.ARRAY,
            description: "Three common words or phrases using this character.",
            items: {
                type: Type.OBJECT,
                properties: {
                    word: { type: Type.STRING, description: "The word in Chinese." },
                    pinyin: { type: Type.STRING, description: "Pinyin for the word." },
                    meaning: { type: Type.STRING, description: "Chinese meaning/explanation of the word." }
                },
                required: ["word", "pinyin", "meaning"]
            }
        }
    },
    required: ["character", "pinyin", "definition", "etymology", "examples"]
};

export const fetchCharacterDetails = async (char: string): Promise<CharacterDetails> => {
    // 1. Check Local Cache
    const cacheKey = `${CACHE_PREFIX}${char}`;
    const cachedData = localStorage.getItem(cacheKey);
    
    if (cachedData) {
        try {
            return JSON.parse(cachedData);
        } catch (e) {
            localStorage.removeItem(cacheKey);
        }
    }

    // 2. Fetch from API if not in cache
    try {
        const model = "gemini-2.5-flash";
        // Updated prompt for Chinese output
        const prompt = `分析汉字: ${char}。请提供以下信息的 JSON 格式：
        1. pinyin: 拼音。
        2. definition: 该字的中文释义。
        3. etymology: 简短的字源解说或助记（50字以内，中文）。
        4. examples: 3个常用词语（word），包含拼音（pinyin）和中文解释（meaning）。`;

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: characterSchema,
                systemInstruction: "你是一位专业的语文老师。请提供准确、简洁的汉字知识，所有解释均使用简体中文。"
            }
        });

        const text = response.text;
        if (!text) {
            throw new Error("Empty response from Gemini");
        }

        const data = JSON.parse(text) as CharacterDetails;

        // 3. Save to Local Cache
        try {
            localStorage.setItem(cacheKey, JSON.stringify(data));
        } catch (e) {
            console.warn('LocalStorage quota exceeded, could not cache AI response.');
        }

        return data;
    } catch (error) {
        console.error("Error fetching character details:", error);
        throw error;
    }
};

export const prefetchCharacterDetails = async (char: string) => {
    const cacheKey = `${CACHE_PREFIX}${char}`;
    if (localStorage.getItem(cacheKey)) return; // Already cached
    
    // We swallow errors here so we don't break the app logic if prefetch fails
    if (!char || char.length !== 1) return;

    try {
        await fetchCharacterDetails(char);
    } catch (e) {
        // Ignore prefetch errors
    }
};