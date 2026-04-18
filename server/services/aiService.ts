import { GoogleGenerativeAI, SchemaType, GenerativeModel, FunctionDeclaration } from "@google/generative-ai";
import { executeWithFirestoreFallback } from '../db';
import { VenueService } from './venueService';
import { ChatContext, ChatHistoryItem } from '../../src/types';

/**
 * AIService
 * 
 * Orchestrates interactions with Google Gemini 1.5 Flash.
 * Handles tool definitions, function calling logic, and context-aware chat processing.
 * 
 * @category Services
 */
export class AIService {
  private static genAI: GoogleGenerativeAI;

  /**
   * Initializes the Gemini AI SDK with the provided API key.
   * 
   * @param apiKey - The Google AI API key from environment variables.
   * @throws Error if the API key is missing or invalid.
   */
  public static init(apiKey: string): void {
    if (!apiKey) {
      console.warn("[AIService] CRITICAL: GEMINI_API_KEY is missing. AI functionality will be disabled.");
      return;
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Tool Declaration: getQueueStatus
   * Allows the model to retrieve real-time queue information for a specific user.
   */
  private static readonly getQueueStatusTool: FunctionDeclaration = {
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

  /**
   * Tool Declaration: getVenueCongestion
   * Allows the model to retrieve real-time congestion data for the venue.
   */
  private static readonly getVenueCongestionTool: FunctionDeclaration = {
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

  /**
   * Tool Declaration: getFacilityInfo
   * Provides detailed information about on-site amenities and their status.
   */
  private static readonly getFacilityInfoTool: FunctionDeclaration = {
    name: "getFacilityInfo",
    description: "Get details about specific venue facilities such as restrooms, concessions, and first-aid stations.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        category: { 
          type: SchemaType.STRING, 
          description: "Facility category: 'restroom', 'concession', 'firstaid', 'merchandise'." 
        }
      },
      required: ["category"]
    }
  };

  /**
   * Processes a user's chat message using Gemini 1.5 Flash.
   * Supports multi-turn conversations and function calling for real-time data access.
   * 
   * @param message - The user's input message string.
   * @param context - Additional context (e.g., current venue, user preferences).
   * @param userId - The ID of the authenticated user for personalization.
   * @param history - Optional chat history for multi-turn conversation.
   * @returns A Promise resolving to the AI's response text.
   * @throws Error if the AI service is uninitialized or processing fails.
   */
  public static async processChat(
    message: string, 
    context: ChatContext, 
    userId?: string,
    history: ChatHistoryItem[] = []
  ): Promise<string> {
    if (!this.genAI) {
      throw new Error("[AIService] Service not initialized. Call init() first.");
    }

    try {
      const model: GenerativeModel = this.genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: this.getSystemInstruction(context, userId),
      });

      // Log interaction to Firestore for future personalization
      if (userId) {
        this.logInteraction(userId, message);
      }

      const chat = model.startChat({
        history: history.map(h => ({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.content }]
        })),
        tools: [{ 
          functionDeclarations: [
            this.getQueueStatusTool, 
            this.getVenueCongestionTool,
            this.getFacilityInfoTool
          ] 
        } as any],
      });

      const result = await chat.sendMessage(message);
      const response = result.response;
      const functionCalls = response.functionCalls();

      if (functionCalls && functionCalls.length > 0) {
        return await this.handleFunctionCalls(model, message, response, functionCalls, history);
      }

      return response.text();
    } catch (error: any) {
      console.error("[AIService] Interaction Error:", error.message || error);
      throw new Error(`The PeopleFlow AI interface encountered a processing anomaly: ${error.message}`);
    }
  }

  /**
   * Logs a user interaction to Firestore for personalization.
   */
  private static async logInteraction(userId: string, message: string): Promise<void> {
    const logData = {
      userId,
      message,
      timestamp: new Date().toISOString()
    };

    try {
      await executeWithFirestoreFallback(async (db) => {
        await db.collection('user_interactions').add(logData);
      });
    } catch (err: any) {
      console.error("[AIService] Telemetry Log Failure:", err.message || err);
    }
  }

  /**
   * Generates the system instruction string based on the provided context.
   * 
   * @param context - The application context.
   * @param userId - Optional user ID for personalization.
   * @returns A formatted system instruction string.
   */
  private static getSystemInstruction(context: ChatContext, userId?: string): string {
    const venueDetails = `
      VENUE IDENTITY: PeopleFlow Global Arena (stadium_01)
      ARCHITECTURE: Enterprise-grade high-capacity multi-purpose facility.
      CAPACITY: 55,000 active seats plus premium hospitality suites.
      
      ACCESSIBILITY (ADA COMPLIANCE): 
        - All gates (North, West) feature 1:12 slope ramps and automated doors.
        - High-contrast signage throughout.
        - Dedicated mobility-first routing heuristics enabled in the routing engine.
        
      FACILITIES ATLAS: 
        - GATES: North (Fastest/Main), West (ADA/Express), East (VIP), South (Standard).
        - CONCESSIONS: 12 distributed stands serving variety of stadium fare.
        - RESTROOMS: 8 blocks, strategically placed near each gate.
        - HEALTH: 4 First Aid stations (Level 1 trauma trained).
        
      SAFETY PROTOCOLS:
        - EVACUATION: Primary exits are clearly illuminated in green.
        - MUSTER POINTS: People should gather in the outer parking zones A and B.
        - INCIDENT REPORTING: Use words like "Urgent" to prioritize security attention.
    `;

    return `You are the PeopleFlow AI Venue Concierge—an enterprise-tier assistant powered by Google Gemini 1.5 Flash. 
    ${venueDetails}
    
    ENVIRONMENTAL GROUNDING:
    Current Domain Context: ${JSON.stringify(context)}
    Authenticated Identity: ${userId || 'Guest (Limited Access)'}
    
    OPERATIONAL MANDATES: 
    1. ACCURACY: Only provide information verified by the facility atlas or retrieved via real-time tool calls.
    2. ACCESSIBILITY: Prioritize ADA-compliant guidance when users mention mobility needs.
    3. PROACTIVITY: If congestion tools report >0.7 load, immediately suggest gate redirection.
    4. PERSONALIZATION: Reference active queue status and past interactions to provide seamless continuity.
    5. TONE: Professional, efficient, and authoritative but welcoming.
    6. SECURITY: Never disclose administrative endpoints or internal system keys.`;
  }

  /**
   * Handles the execution of function calls requested by the AI model.
   */
  private static async handleFunctionCalls(
    model: GenerativeModel,
    originalMessage: string,
    initialResponse: unknown,
    functionCalls: any[],
    history: ChatHistoryItem[] = []
  ): Promise<string> {
    const toolResults = [];

    for (const call of functionCalls) {
      let toolResponse;
      
      const callHandlers: Record<string, () => Promise<any>> = {
        getQueueStatus: async () => {
          const args = call.args as { userId: string };
          return await executeWithFirestoreFallback(async (db) => {
            const snapshot = await db.collection('queues')
              .where('userId', '==', args.userId)
              .where('status', '==', 'waiting')
              .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          });
        },
        getVenueCongestion: async () => {
          const args = (call.args as { venueId?: string }) || {};
          const venue = await VenueService.getVenueData(args.venueId || 'stadium_01');
          return { 
            congestion: venue.congestionLevel, 
            status: venue.congestionLevel > 0.7 ? "CRITICAL" : "NORMAL", 
            gates: venue.gates.map(g => ({ name: g.name, congestion: g.congestion })) 
          };
        },
        getFacilityInfo: async () => {
          const args = call.args as { category: string };
          // Simulated enterprise facility database
          const database: Record<string, any> = {
            restroom: { status: "OPEN", count: 8, avg_wait: "2 mins", cleaning_cycle: "30 mins" },
            concession: { status: "OPERATIONAL", active_stands: 10, peak_wait: "8 mins" },
            firstaid: { status: "READY", stations: 4, staff: "EMTs on site" }
          };
          return database[args.category] || { status: "UNKNOWN", contact: "Facility Ops" };
        }
      };

      if (callHandlers[call.name]) {
        try {
          toolResponse = await callHandlers[call.name]();
        } catch (err) {
          toolResponse = { error: "DATA_UNAVAILABLE", retry: true };
        }
      }

      toolResults.push({
        functionResponse: { name: call.name, response: { result: toolResponse } }
      });
    }

    const chat = model.startChat({
      history: history.map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.content }]
      })),
      tools: [{ 
        functionDeclarations: [
          this.getQueueStatusTool, 
          this.getVenueCongestionTool,
          this.getFacilityInfoTool
        ] 
      } as any],
    });

    const secondResult = await chat.sendMessage(toolResults as any);
    return secondResult.response.text();
  }}
