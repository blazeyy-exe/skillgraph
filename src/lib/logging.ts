type LogFields = Record<string, unknown>;

function emit(level: "info" | "warn" | "error", message: string, fields?: LogFields) {
  const payload = {
    ts: new Date().toISOString(),
    level,
    message,
    ...fields,
  };
  const line = JSON.stringify(payload);
  if (level === "error") {
    console.error(line);
    return;
  }
  if (level === "warn") {
    console.warn(line);
    return;
  }
  console.info(line);
}

export const log = {
  info: (message: string, fields?: LogFields) => emit("info", message, fields),
  warn: (message: string, fields?: LogFields) => emit("warn", message, fields),
  error: (message: string, fields?: LogFields) => emit("error", message, fields),
};
