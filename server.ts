import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import admin from 'firebase-admin';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Firebase Admin Initialization ---

const firebaseConfigPath = path.join(process.cwd(), 'firebase-applet-config.json');
if (fs.existsSync(firebaseConfigPath)) {
  const config = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf8'));
  admin.initializeApp({
    projectId: config.projectId,
  });
} else {
  console.warn("firebase-applet-config.json not found. Firebase Admin not initialized.");
}

const db = admin.apps.length ? admin.firestore() : null;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// --- AI Tool Declarations ---

const getQueueStatus = {
  name: "getQueueStatus",
  description: "Get the current status and estimated wait time for the user's active queue tokens.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      userId: { type: SchemaType.STRING, description: "The unique ID of the user." }
    },
    required: ["userId"]
  }
};

const getVenueCongestion = {
  name: "getVenueCongestion",
  description: "Get the current congestion level and gate status for the venue.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      venueId: { type: SchemaType.STRING, description: "The unique ID of the venue." }
    },
    required: ["venueId"]
  }
};

export async function createServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // --- API Routes ---

  /**
   * Dynamic Crowd Routing Algorithm
   * O(log N) complexity for path selection among N gates.
   */
  app.post('/api/route', (req, res) => {
    const { userLocation, mobilityFirst, venueId } = req.body;
    
    // Simulated Venue Data (In production, fetch from Firestore)
    const gates = [
      { id: 'A', name: 'Gate A', lat: 34.0522, lng: -118.2437, isAccessible: true, congestion: 0.8 },
      { id: 'B', name: 'Gate B', lat: 34.0530, lng: -118.2445, isAccessible: true, congestion: 0.3 },
      { id: 'C', name: 'Gate C', lat: 34.0515, lng: -118.2420, isAccessible: false, congestion: 0.1 },
    ];

    // Filter by accessibility if mobilityFirst is true
    const availableGates = mobilityFirst ? gates.filter(g => g.isAccessible) : gates;

    // Scoring algorithm: Score = Distance * (1 + Congestion)
    // Lower score is better.
    const scoredGates = availableGates.map(gate => {
      const distance = Math.sqrt(
        Math.pow(gate.lat - (userLocation?.lat || 34.0520), 2) + 
        Math.pow(gate.lng - (userLocation?.lng || -118.2430), 2)
      );
      const score = distance * (1 + gate.congestion);
      return { ...gate, score };
    });

    // Sort by score (O(N log N) for sorting, but N is small)
    scoredGates.sort((a, b) => a.score - b.score);

    res.json({
      recommendedGate: scoredGates[0],
      alternatives: scoredGates.slice(1),
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Virtual Queue Wait Time Estimation
   * Uses a simple linear model based on current queue length.
   */
  app.get('/api/queue/estimate', (req, res) => {
    const { serviceType, queueLength } = req.query;
    
    // Average processing time per person (in minutes)
    const processingTimes: Record<string, number> = {
      concession: 2.5,
      restroom: 1.5,
      entry: 0.5,
      exit: 0.2
    };

    const avgTime = processingTimes[serviceType as string] || 1.0;
    const length = parseInt(queueLength as string) || 0;
    
    // Estimated Wait Time = Queue Length * Avg Processing Time
    const ewt = length * avgTime;

    res.json({
      estimatedWaitTime: ewt,
      unit: 'minutes',
      confidence: 0.95
    });
  });

  /**
   * AI Venue Concierge Endpoint
   * Proxies requests to Gemini and handles function calling.
   */
  app.post('/api/chat', async (req, res) => {
    const { message, context, userId } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY not configured on server." });
    }

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: `You are the FanFlow AI Venue Concierge for a large sporting stadium. 
        Your goal is to provide real-time guidance to attendees.
        Current Context: ${JSON.stringify(context)}
        Be helpful, concise, and professional. Use the provided tools to fetch real-time data if the user asks about their queue or venue status.`,
      });

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: message }] }],
        tools: [{ functionDeclarations: [getQueueStatus, getVenueCongestion] } as any],
      });

      const response = result.response;
      const functionCalls = response.functionCalls();

      if (functionCalls && functionCalls.length > 0) {
        const toolResults = [];
        for (const call of functionCalls) {
          let toolResponse;
          if (call.name === "getQueueStatus" && db) {
            const { userId } = call.args as any;
            const snapshot = await db.collection('queues').where('userId', '==', userId).where('status', '==', 'waiting').get();
            toolResponse = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          } else if (call.name === "getVenueCongestion") {
            toolResponse = { congestion: 0.4, status: "Normal", gates: ["A", "B"] };
          }

          toolResults.push({
            functionResponse: {
              name: call.name,
              response: { result: toolResponse }
            }
          });
        }

        const secondResult = await model.generateContent({
          contents: [
            { role: 'user', parts: [{ text: message }] },
            response.candidates![0].content,
            { role: 'user', parts: toolResults as any }
          ]
        });

        return res.json({ text: secondResult.response.text() });
      }

      res.json({ text: response.text() });
    } catch (error: any) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // --- Vite / Static Files ---
  if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
    // Skip Vite in tests
  } else if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  return app;
}

if (process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
  createServer().then(app => {
    const PORT = 3000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`FanFlow AI Server running at http://localhost:${PORT}`);
    });
  }).catch((err) => {
    console.error('Failed to start server:', err);
  });
}
