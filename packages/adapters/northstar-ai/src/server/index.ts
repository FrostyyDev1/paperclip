import type {
  AdapterConfigSchema,
  ServerAdapterModule,
} from "@paperclipai/adapter-utils";

import {
  agentConfigurationDoc,
  models,
  type,
} from "../index.js";

import { execute } from "./execute.js";
import { testEnvironment } from "./test.js";

export function getConfigSchema(): AdapterConfigSchema {
  return {
    fields: [
      {
        key: "model",
        label: "AI Model",
        type: "text",
        default: "openai/gpt-5.6-sol",
        required: true,
        hint: "Vercel AI Gateway model ID, for example openai/gpt-5.6-sol.",
      },
      {
        key: "systemPrompt",
        label: "Employee Instructions",
        type: "textarea",
        hint: "Optional role-specific instructions for this AI employee.",
      },
    ],
  };
}

export function createServerAdapter(): ServerAdapterModule {
  return {
    type,
    execute,
    testEnvironment,
    models,
    getConfigSchema,
    agentConfigurationDoc,
  };
}
