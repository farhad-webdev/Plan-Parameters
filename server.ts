import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();
  app.use(express.json());

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // AI Financial Advisor endpoint
  app.post('/api/ai-advice', async (req, res) => {
    try {
      const { 
        currentAge, 
        retirementAge, 
        currentSavings, 
        monthlyContribution, 
        annualReturnRate, 
        inflationRate, 
        goalName, 
        nominalFutureValue, 
        realFutureValue 
      } = req.body;

      const prompt = `As an expert personal finance advisor specializing in the Bangladeshi economy (BDT, inflation around 7.5%, DPS, Sanchayapatra, DSE stocks, and real estate in Dhaka), please review the following wealth plan and provide actionable, structured advice in 4 clear sections:
1. Plan Evaluation & Realistic Outlook (Is the growth realistic given Bangladeshi inflation and interest rates?)
2. Recommended Asset Allocation in Bangladesh (e.g., Sanchayapatra, DPS, Mutual Funds, Gold, Real Estate)
3. Tax & Zakat Considerations (Source tax on interest, Nisab thresholds)
4. Three Actionable Steps to Optimize Wealth

User Plan details:
- Current Age: ${currentAge}
- Retirement Age: ${retirementAge}
- Current Savings: BDT ${currentSavings?.toLocaleString('en-BD')}
- Monthly Contribution: BDT ${monthlyContribution?.toLocaleString('en-BD')}
- Expected Annual Return: ${annualReturnRate}%
- Assumed Inflation: ${inflationRate}%
- Target Goal: ${goalName || 'Retirement'}
- Projected Nominal Future Value: BDT ${nominalFutureValue?.toLocaleString('en-BD')}
- Projected Inflation-Adjusted Future Value (Purchasing Power): BDT ${realFutureValue?.toLocaleString('en-BD')}

Keep your response professional, encouraging, practical, and formatted cleanly in Markdown.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are a certified senior financial planner and wealth management expert in Bangladesh. Give realistic, localized advice in Bangladeshi Taka context.'
        }
      });

      res.json({ advice: response.text || 'No advice generated.' });
    } catch (error: any) {
      console.error('AI Advice Error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate AI advice.' });
    }
  });

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  const port = process.env.PORT || 3000;
  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

startServer();
