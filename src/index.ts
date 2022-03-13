import { readFileSync } from "node:fs";

const TABLE_FILEPATH = new URL("../data/core.json", import.meta.url);

function specifierIncluded(current: string, specifier: string): boolean {
  const nodeParts = current.split(".");
  const parts = specifier.split(" ");
  const op = parts.length > 1 ? parts[0] : "=";
  const versionParts = (parts.length > 1 ? parts[1] : parts[0]).split(".");

  for (let i = 0; i < 3; ++i) {
    const cur = parseInt(nodeParts[i] || "0", 10);
    const ver = parseInt(versionParts[i] || "0", 10);
    if (cur === ver) {
      continue;
    }
    if (op === "<") {
      return cur < ver;
    }
    if (op === ">=") {
      return cur >= ver;
    }
    return false;
  }
  return op === ">=";
}

function matchesRange(current: string, range: string): boolean {
  if (typeof range !== "string") return false;
  const specifiers = range.split(/ ?&& ?/);
  if (specifiers.length === 0) {
    return false;
  }
  return specifiers.every((s) => specifierIncluded(current, s));
}

function versionIncluded(
  nodeVersion: string | undefined,
  specifierValue: boolean | string | string[]
): boolean {
  if (typeof specifierValue === "boolean") {
    return specifierValue;
  }

  const current =
    typeof nodeVersion === "undefined"
      ? process.versions && process.versions.node
      : nodeVersion;

  if (!current) {
    throw new TypeError(
      typeof nodeVersion === "undefined"
        ? "Unable to determine current node version"
        : "If provided, a valid node version is required"
    );
  }

  if (Array.isArray(specifierValue)) {
    return specifierValue.some((specifier) => {
      return matchesRange(current, specifier);
    });
  }
  return matchesRange(current, specifierValue);
}

let data: any;
function init(): void {
  if (!data) {
    data = JSON.parse(readFileSync(TABLE_FILEPATH.pathname, "utf8"));
  }
}

export function isCore(module: string, nodeVersion?: string): boolean {
  init();
  return (
    data.hasOwnProperty(module) && versionIncluded(nodeVersion, data[module])
  );
}
