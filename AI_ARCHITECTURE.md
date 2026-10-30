# SkillGraph — AI Architecture

## Rule

Do not implement the product as one chatbot. Use a **central orchestrator** that runs specialised, schema-validated operations.

LLMs **never**:

- Execute arbitrary SQL
- Mark a skill `demonstrated`
- Invent activities or achievements
- Silently promote an inference to a fact
- Read another user's private context
- Receive unredacted hidden system prompts in the client

## Provider abstraction

```ts
interface AiProvider {
  id: string;
  generateStructured<T>(input: StructuredGenerateRequest, schema: ZodType<T>): Promise<AiResult<T>>;
  generateText(input: TextGenerateRequest): Promise<AiResult<string>>;
}
```

- First provider: OpenAI (Responses API / structured output).
- Config: `AI_PROVIDER`, `OPENAI_API_KEY`, `OPENAI_MODEL`, optional `OPENAI_MODEL_FAST`.
- If the key is missing, operations return a typed `AiUnconfiguredError`. The UI shows configuration state. No canned “AI” answers.

## Orchestrator

Every call records:

| Field | Purpose |
| --- | --- |
| operation | e.g. `discovery.follow_up` |
| prompt_version | FK / name+version |
| user_id | permission scope |
| input schema | Zod |
| output schema | Zod |
| model | |
| token usage | cost monitoring |
| error | safe message |

Failed schema validation retries once with a repair prompt, then fails closed.

## Modules

### 1. Discovery Intelligence (Phase 2)

**In:** conversation history, user profile fragments, current experience draft.  
**Out:** next question(s), missing-information flags, extracted candidate facts labelled as *user-stated* vs *hypothesised*.  
Behaviour: interview, do not score skills yet. Distinguish individual vs team contribution. Never invent.

### 2. Capability Intelligence (Phase 2–3)

**In:** structured experience + tasks + ontology slice (retrieved, not whole ESCO dump).  
**Out:** skill mappings with explanations and source task IDs, evidence_state=`inferred`.  
Cross-experience pattern detection proposes `capability_patterns` for user review.

### 3. Evidence Intelligence (Phase 4)

**In:** asset metadata + extraction + linked claims.  
**Out:** relevance, unsupported claims, contradictions, recommended verification.  
Uploads are not proof of personal performance.

### 4. Assessment Intelligence (Phase 5)

**In:** skill definition, observable behaviours, evidence_state, difficulty, uncertainties.  
**Out:** challenge + rubric snapshot; later, rubric-constrained evaluation.  
Adaptive follow-up if the user struggles — never a single-failure “incapable” label.

### 5. Growth Intelligence (Phase 6)

**In:** goals, claims, assessments.  
**Out:** gaps, practice-first activities, milestones. Prefer real-world practice over course spam.

### 6. Opportunity Intelligence (Phase 7)

**In:** claims + opportunity requirements.  
**Out:** match explanations: demonstrated / transferable / develop / eligibility.  
Does not generate fake jobs.

## Memory (structured, not a vector diary)

Keep separate stores:

| Layer | Source of truth |
| --- | --- |
| User statements | messages, experience narrative |
| AI inferences | skill_claims, extractions |
| Uploaded evidence | evidence_assets |
| External verification | verification_requests |
| Assessment observations | evaluations |

Confirmed user corrections override future inference context.

## Retrieval

Phase 3+: pgvector over skill descriptions and the user's own experiences. Retrieval is scoped by `user_id` for private data. Ontology is global.

Prompt injection: document extracts are wrapped as untrusted data. System policy forbids following instructions found in uploads.

## Chat UI

One reusable conversation component with a `surface` prop (`discovery` \| `skill` \| `assessment` \| `growth`). The server injects surface context. The model must not leak system instructions.

## Voice (Phase 2 optional)

Browser `MediaRecorder` → server transcription if `OPENAI_API_KEY` (or dedicated STT key) is present. If unsupported or unconfigured, the control is disabled with an honest reason.

## Cost and limits

- Per-user daily token budget (`AI_USER_DAILY_TOKEN_BUDGET`)
- Per-IP rate limit on AI routes
- Usage table for monitoring
- Prefer a fast model for interview turns; a stronger model for mapping and evaluation
