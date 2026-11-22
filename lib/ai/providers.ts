/**
 * High-Reliability AI Provider Abstraction Layer for Code Generation & Planning
 * Automatically cascades across prioritized coding models when rate limits or quotas are exceeded.
 */

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface CallOptions {
  jsonMode?: boolean;
  temperature?: number;
  maxTokens?: number;
  model?: string;
  onModelSwitch?: (fromModel: string, toModel: string, reason: string) => void;
}

export class ProviderError extends Error {
  provider: "openrouter" | "mistral";
  statusCode?: number;
  model?: string;

  constructor(provider: "openrouter" | "mistral", message: string, statusCode?: number, model?: string) {
    super(`[${provider.toUpperCase()}${model ? `:${model}` : ""}] ${message}${statusCode ? ` (Status: ${statusCode})` : ""}`);
    this.name = "ProviderError";
    this.provider = provider;
    this.statusCode = statusCode;
    this.model = model;
  }
}

/** Helper sleep function for exponential backoff */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Prioritized list of best free OpenRouter coding & reasoning models
 */
export const BEST_FREE_CODING_MODELS = [
  "nvidia/nemotron-3-super-120b-a12b:free", // 120B High-intelligence general reasoning & UI code
  "cohere/north-mini-code:free",           // Specialized high-speed code generation
  "google/gemma-4-31b-it:free",            // Google 31B instruction-tuned model
  "minimax/minimax-m2.7:free",             // High-throughput reasoning
  "z-ai/glm-5.2:free",                     // GLM reasoning model
];

/**
 * Call OpenRouter API with automated smart fallback across top free coding models.
 */
export async function callOpenRouter(
  messages: Message[],
  options: CallOptions = {}
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new ProviderError("openrouter", "OPENROUTER_API_KEY is not configured in .env.local", 401);
  }

  const modelsToTry = options.model ? [options.model, ...BEST_FREE_CODING_MODELS.filter(m => m !== options.model)] : BEST_FREE_CODING_MODELS;
  let lastError: ProviderError | null = null;

  for (let i = 0; i < modelsToTry.length; i++) {
    const model = modelsToTry[i];
    const backoffDelays = [400, 1200];

    for (let attempt = 0; attempt <= backoffDelays.length; attempt++) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": "https://byt-ai.vercel.app",
            "X-Title": "BYT AI Builder",
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: options.temperature ?? 0.15,
            max_tokens: options.maxTokens ?? 4000,
            response_format: options.jsonMode ? { type: "json_object" } : undefined,
          }),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          const statusCode = response.status;

          // If rate limited or model quota exceeded (429 or 404 or 503)
          if (statusCode === 429 || statusCode === 404 || statusCode === 503) {
            const nextModel = modelsToTry[i + 1];
            if (nextModel && options.onModelSwitch) {
              options.onModelSwitch(model, nextModel, `Rate limit or quota reached on ${model}`);
            }
            lastError = new ProviderError("openrouter", `Model ${model} limit reached: ${errorBody}`, statusCode, model);
            break; // Break attempt loop to move to the next model in the cascade
          }

          if (statusCode >= 500 && attempt < backoffDelays.length) {
            await delay(backoffDelays[attempt]);
            continue;
          }

          lastError = new ProviderError("openrouter", `API failed on ${model}: ${errorBody}`, statusCode, model);
          break;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (typeof content !== "string" || !content.trim()) {
          lastError = new ProviderError("openrouter", `Empty response from ${model}`, 502, model);
          break;
        }

        return content;
      } catch (err: any) {
        if (err instanceof ProviderError) {
          lastError = err;
        } else {
          lastError = new ProviderError("openrouter", err?.message || "Network error", 500, model);
        }

        if (attempt < backoffDelays.length) {
          await delay(backoffDelays[attempt]);
          continue;
        }
      }
    }
  }

  throw lastError || new ProviderError("openrouter", "All available coding models exhausted", 504);
}

/**
 * Call Mistral API with codestral-2508 / mistral-small fallback
 */
export async function callMistral(
  messages: Message[],
  options: CallOptions = {}
): Promise<string> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    throw new ProviderError("mistral", "MISTRAL_API_KEY is not configured in .env.local", 401);
  }

  const mistralModels = [options.model || "codestral-2508", "mistral-small-latest"];
  let lastError: ProviderError | null = null;

  for (const model of mistralModels) {
    const backoffDelays = [400, 1200];

    for (let attempt = 0; attempt <= backoffDelays.length; attempt++) {
      try {
        const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: options.temperature ?? 0.1,
            max_tokens: options.maxTokens ?? 8000,
            response_format: options.jsonMode ? { type: "json_object" } : undefined,
          }),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          const statusCode = response.status;

          if (statusCode === 429 || statusCode === 404) {
            lastError = new ProviderError("mistral", `Mistral ${model} quota/rate limit: ${errorBody}`, statusCode, model);
            break; // Try next Mistral model
          }

          if (statusCode >= 500 && attempt < backoffDelays.length) {
            await delay(backoffDelays[attempt]);
            continue;
          }

          lastError = new ProviderError("mistral", `API failed on ${model}: ${errorBody}`, statusCode, model);
          break;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (typeof content !== "string" || !content.trim()) {
          lastError = new ProviderError("mistral", `Empty response from ${model}`, 502, model);
          break;
        }

        return content;
      } catch (err: any) {
        if (err instanceof ProviderError) {
          lastError = err;
        } else {
          lastError = new ProviderError("mistral", err?.message || "Network error", 500, model);
        }

        if (attempt < backoffDelays.length) {
          await delay(backoffDelays[attempt]);
          continue;
        }
      }
    }
  }

  throw lastError || new ProviderError("mistral", "All Mistral models failed", 504);
}
