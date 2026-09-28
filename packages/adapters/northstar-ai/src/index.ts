export const type = "northstar_ai";
export const label = "NorthStar AI";

export const models = [
  {
    id: "openai/gpt-5.6-sol",
    label: "GPT-5.6 Sol",
  },
];

export const agentConfigurationDoc = `# NorthStar AI

Built-in AI runtime for Paperclip agents.

Use this adapter when:
- The agent should run through Vercel AI Gateway
- No local Claude/Codex/Gemini CLI should be required
- Model usage and cost should be reported back to Paperclip

Configuration:
- model: AI Gateway model ID
- systemPrompt: optional extra instructions for this employee
`;

export { createServerAdapter } from "./server/index.js";
