import path from "node:path";
import { MCP_CONFIG_JSON, render } from "@claude-bootstrap/templates";
import { writeFileSafe, type McpChoice, type WriteOptions } from "../util.js";

/**
 * MCP server configurations. Secrets are written as `${ENV_NAME}` placeholders
 * — the user wires the real values into their own env / secret manager.
 */
const SERVERS: Record<McpChoice, Record<string, unknown>> = {
  filesystem: {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-filesystem", "${PROJECT_ROOT}"],
  },
  github: {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-github"],
    env: { GITHUB_PERSONAL_ACCESS_TOKEN: "${GITHUB_TOKEN}" },
  },
  postgres: {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-postgres", "${DATABASE_URL}"],
  },
  playwright: { command: "npx", args: ["-y", "@playwright/mcp"] },
  slack: {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-slack"],
    env: { SLACK_BOT_TOKEN: "${SLACK_BOT_TOKEN}" },
  },
  jira: {
    command: "npx",
    args: ["-y", "mcp-atlassian"],
    env: {
      JIRA_HOST: "${JIRA_HOST}",
      JIRA_EMAIL: "${JIRA_EMAIL}",
      JIRA_API_TOKEN: "${JIRA_API_TOKEN}",
    },
  },
  redis: {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-redis"],
    env: { REDIS_URL: "${REDIS_URL}" },
  },
  kafka: {
    command: "npx",
    args: ["-y", "mcp-kafka"],
    env: { KAFKA_BROKERS: "${KAFKA_BROKERS}" },
  },
};

export async function generateMcp(
  root: string,
  picks: McpChoice[],
  opts: WriteOptions = {},
): Promise<string> {
  const servers: Record<string, unknown> = {};
  for (const id of picks) servers[id] = SERVERS[id];
  const json = render(MCP_CONFIG_JSON, { servers: JSON.stringify(servers, null, 2) });
  const file = path.join(root, ".claude", "mcp", "config.json");
  await writeFileSafe(file, json, opts);
  return file;
}
