import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { message, lang } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Select the model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Define the system instruction to guide the chatbot's behavior
    const isAr = lang === 'ar';
    const systemInstruction = isAr 
      ? 'أنت المساعد الذكي لمتجر "بسطة" الإلكتروني. اسمك "بسطة AI". دورك هو مساعدة الزبائن في العثور على المنتجات، الإجابة على استفساراتهم حول المتجر والتوصيل بأسلوب ودود ومختصر.'
      : 'You are the smart assistant for "Bastha" e-commerce store. Your name is "Bastha AI". Your role is to help customers find products, answer their queries about the store and delivery in a friendly and concise manner.';

    const prompt = `${systemInstruction}\n\nUser: ${message}\nAssistant:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
