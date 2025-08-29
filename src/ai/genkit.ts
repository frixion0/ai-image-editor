import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// WARNING: This is not a recommended practice for production applications.
// For personal or internal projects, this can simplify deployment.
// You should replace "YOUR_API_KEY_HERE" with your actual Gemini API key.
// To get a key, visit https://makersuite.google.com/
const GEMINI_API_KEY = "YOUR_API_KEY_HERE";

if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_API_KEY_HERE") {
  console.warn("Gemini API key is not configured. Please add it to src/ai/genkit.ts");
}

export const ai = genkit({
  plugins: [googleAI({apiKey: GEMINI_API_KEY})],
  model: 'googleai/gemini-2.0-flash',
});
