import fs from "node:fs/promises";
import path from "node:path";

const LIST_PAGE_TITLE = "List_of_parliamentary_constituencies_of_Nepal";
const OUTPUT_CSV = path.join(process.cwd(), "data", "constituency-wards.csv");
const LIST_TXT = path.join(process.cwd(), "prisma", "list.txt");

function normalize(value) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function csvEscape(value) {
  const asText = String(value ?? "");
  if (asText.includes(",") || asText.includes("\"") || asText.includes("\n")) {
    return `"${asText.replace(/"/g, '""')}"`;
  }
  return asText;
}

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index++) {
    const char = line[index];

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

async function readConstituenciesFromList() {
  const text = await fs.readFile(LIST_TXT, "utf8");
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^\d+,/.test(line));

  return lines
    .map(parseCsvLine)
    .filter((cols) => cols.length >= 4)
    .map((cols) => cols[3]);
}

async function wikiParse(params) {
  const query = new URLSearchParams({
    action: "parse",
    format: "json",
    formatversion: "2",
    ...params,
  });

  const url = `https://en.wikipedia.org/w/api.php?${query.toString()}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "service-pulse-constituency-ward-scraper/1.0",
    },
  });

  if (!res.ok) {
    throw new Error(`Wikipedia API request failed (${res.status}) for ${url}`);
  }

  const data = await res.json();
  if (data.error) {
    throw new Error(`Wikipedia API error: ${data.error.info}`);
  }

  if (!data.parse) {
    throw new Error(`Wikipedia parse response missing for ${url}`);
  }

  return data.parse;
}

function cleanWikiText(text) {
  let output = text;

  output = output.replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, " ");
  output = output.replace(/<ref[^/]*\/>/gi, " ");
  output = output.replace(/<!--[^]*?-->/g, " ");

  output = output.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2");
  output = output.replace(/\[\[([^\]]+)\]\]/g, "$1");
  output = output.replace(/\[https?:\/\/[^\s\]]+\s([^\]]+)\]/g, "$1");
  output = output.replace(/\{\{[^{}]*\}\}/g, " ");

  output = output.replace(/\s+/g, " ").trim();
  return output;
}

function expandWardSpec(wardSpec) {
  const values = new Set();
  const normalized = wardSpec
    .replace(/to/gi, "-")
    .replace(/–/g, "-")
    .replace(/and/gi, ",")
    .replace(/\s+/g, "");

  for (const token of normalized.split(",").filter(Boolean)) {
    if (/^\d+-\d+$/.test(token)) {
      const [rawStart, rawEnd] = token.split("-");
      const start = Number(rawStart);
      const end = Number(rawEnd);
      if (Number.isInteger(start) && Number.isInteger(end) && start <= end && end - start <= 50) {
        for (let value = start; value <= end; value++) {
          values.add(String(value));
        }
      }
      continue;
    }

    if (/^\d+$/.test(token)) {
      values.add(token);
    }
  }

  return [...values];
}

function extractWardsAndLocations(wikitext) {
  const text = cleanWikiText(wikitext);
  const rows = [];

  const withLocationPattern = /wards?\s*(?:nos?\.?|numbers?)?\s*([0-9,\-–\sandto]+?)\s+of\s+([^.;\n]+)/gi;
  let match;
  while ((match = withLocationPattern.exec(text)) !== null) {
    const wardSpec = match[1] ?? "";
    const location = (match[2] ?? "").trim();
    const wards = expandWardSpec(wardSpec);

    if (wards.length === 0) {
      rows.push({ ward: "NA", location: location || "NA" });
      continue;
    }

    for (const ward of wards) {
      rows.push({ ward, location: location || "NA" });
    }
  }

  if (rows.length === 0) {
    const noLocationPattern = /wards?\s*(?:nos?\.?|numbers?)?\s*([0-9,\-–\sandto]+)/gi;
    let onlyWardMatch;
    while ((onlyWardMatch = noLocationPattern.exec(text)) !== null) {
      const wards = expandWardSpec(onlyWardMatch[1] ?? "");
      for (const ward of wards) {
        rows.push({ ward, location: "NA" });
      }
    }
  }

  if (rows.length === 0) {
    return [{ ward: "NA", location: "NA" }];
  }

  const dedup = new Map();
  for (const row of rows) {
    const key = `${row.ward}||${row.location}`;
    if (!dedup.has(key)) dedup.set(key, row);
  }

  return [...dedup.values()];
}

function buildTitleCandidates(name) {
  return [
    `${name} (constituency)`,
    `${name}`,
  ];
}

async function resolveConstituencyLinks(constituencyNames) {
  const page = await wikiParse({ page: LIST_PAGE_TITLE, prop: "links" });
  const links = Array.isArray(page.links) ? page.links : [];

  const wantedByNormalized = new Map(
    constituencyNames.map((name) => [normalize(name), name])
  );

  const resolved = new Map();

  for (const link of links) {
    if (!link?.title || link.ns !== 0 || !link.exists) continue;
    const title = link.title;

    const base = title.replace(/\s*\(constituency\)$/i, "");
    const n = normalize(base);
    const targetName = wantedByNormalized.get(n);
    if (!targetName) continue;

    if (!resolved.has(targetName)) {
      resolved.set(targetName, title);
    }
  }

  return resolved;
}

async function main() {
  console.log("Starting constituency ward scrape...");

  const constituencyNames = await readConstituenciesFromList();
  const uniqueNames = [...new Set(constituencyNames)];

  const resolvedFromLinks = await resolveConstituencyLinks(uniqueNames);

  const results = [];
  let fromHyperlinksCount = 0;

  for (const constituencyName of uniqueNames) {
    let pageTitle = resolvedFromLinks.get(constituencyName) ?? null;

    if (pageTitle) {
      fromHyperlinksCount += 1;
    }

    if (!pageTitle) {
      for (const candidate of buildTitleCandidates(constituencyName)) {
        try {
          await wikiParse({ page: candidate, prop: "wikitext" });
          pageTitle = candidate;
          break;
        } catch {
          continue;
        }
      }
    }

    if (!pageTitle) {
      results.push({ constituency: constituencyName, ward: "NA", location: "NA" });
      continue;
    }

    let wikitext = "";
    try {
      const parsed = await wikiParse({ page: pageTitle, prop: "wikitext" });
      wikitext = parsed.wikitext ?? "";
    } catch {
      results.push({ constituency: constituencyName, ward: "NA", location: "NA" });
      continue;
    }

    const rows = extractWardsAndLocations(wikitext);
    for (const row of rows) {
      results.push({
        constituency: constituencyName,
        ward: row.ward,
        location: row.location,
      });
    }
  }

  const header = ["constituency", "ward", "location"];
  const body = results.map((row) =>
    [row.constituency, row.ward, row.location].map(csvEscape).join(",")
  );

  const csv = [header.join(","), ...body].join("\n");

  await fs.mkdir(path.dirname(OUTPUT_CSV), { recursive: true });
  await fs.writeFile(OUTPUT_CSV, csv, "utf8");

  console.log(`Done. Constituencies processed: ${uniqueNames.length}`);
  console.log(`Resolved from list-page hyperlinks: ${fromHyperlinksCount}`);
  console.log(`CSV written: ${OUTPUT_CSV}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
