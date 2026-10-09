// Inspection entry point: inherited environment cannot enable writes or eval.
process.env.AE_MCP_READONLY = "1";
process.env.AE_MCP_ENABLE_EVAL = "0";
process.env.AE_MCP_INSPECT_ONLY = "1";
await import("../dist/index.js");
