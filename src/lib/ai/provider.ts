import { z, type ZodType } from "zod";

export class AiUnconfiguredError extends Error {
  constructor(message = "The AI provider is not configured.") {
    super(message);
    this.name = "AiUnconfiguredError";
  }
}

export type StructuredGenerateRequest = {
  operation: string;
  promptVersion: string;
  system: string;
  user: string;
  userId: string;
};

export type AiResult<T> = {
  data: T;
  model: string;
  promptTokens: number;
  completionTokens: number;
};

export interface AiProvider {
  id: string;
  generateStructured<T>(
    input: StructuredGenerateRequest,
    schema: ZodType<T>,
  ): Promise<AiResult<T>>;
}

export class UnconfiguredAiProvider implements AiProvider {
  id = "unconfigured";

  async generateStructured<T>(
    input: StructuredGenerateRequest,
    schema: ZodType<T>,
  ): Promise<AiResult<T>> {
    void input;
    void schema;
    throw new AiUnconfiguredError(
      "Set OPENAI_API_KEY to enable SkillGraph intelligence. No simulated answers are returned.",
    );
  }
}

export function getAiProvider(): AiProvider {
  if (!process.env.OPENAI_API_KEY) {
    return new UnconfiguredAiProvider();
  }
  // OpenAI adapter lands in Phase 2 with the discovery pipeline.
  return new UnconfiguredAiProvider();
}

export const unusedSchema = z.never();
