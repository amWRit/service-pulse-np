import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type WardCsvRow = {
  constituency: string;
  municipality: string;
  wards: number[];
};

const CSV_FILE = path.join(process.cwd(), "prisma/data/const-ward.csv");
const SKIP_CONSTITUENCY = "Kathmandu-6";
const MAX_WARD_NUMBER = 50;

const MUNICIPALITY_NP_MAP: Record<string, string> = {
  "Kathmandu Metropolitan City": "काठमाडौँ महानगरपालिका",
  "Shankharapur Municipality": "शंखरापुर नगरपालिका",
  "Kageshwari-Manohara Municipality": "कागेश्वरी मनोहरा नगरपालिका",
  "Gokarneshwar Municipality": "गोकर्णेश्वर नगरपालिका",
  "Budhanilkantha Municipality": "बुढानीलकण्ठ नगरपालिका",
  "Tokha Municipality": "टोखा नगरपालिका",
  "Tarakeshwar Municipality": "तारकेश्वर नगरपालिका",
  "Nagarjun Municipality": "नागार्जुन नगरपालिका",
  "Chandragiri Municipality": "चन्द्रागिरि नगरपालिका",
  "Dakshinkali Municipality": "दक्षिणकाली नगरपालिका",
  "Kirtipur Municipality": "कीर्तिपुर नगरपालिका",
};

const NP_DIGITS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

function splitCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
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

function parseWardList(input: string): number[] {
  return input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((value) => Number.parseInt(value, 10))
    .filter((value) => Number.isInteger(value) && value > 0 && value <= MAX_WARD_NUMBER);
}

function parseWardCsv(contents: string): WardCsvRow[] {
  const lines = contents
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length <= 1) return [];

  const dataLines = lines.slice(1);

  return dataLines
    .map((line) => splitCsvLine(line))
    .filter((parts) => parts.length >= 3)
    .map((parts) => {
      const constituency = parts[0];
      const municipality = parts[1];
      const wardList = parts.slice(2).join(",");

      return {
        constituency,
        municipality,
        wards: parseWardList(wardList),
      };
    })
    .filter((row) => row.constituency && row.municipality && row.wards.length > 0);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toNepaliDigits(value: number): string {
  return String(value)
    .split("")
    .map((char) => {
      const digit = Number.parseInt(char, 10);
      return Number.isInteger(digit) ? NP_DIGITS[digit] : char;
    })
    .join("");
}

function municipalityToNepaliName(municipality: string): string {
  return MUNICIPALITY_NP_MAP[municipality] ?? municipality;
}

async function main() {
  if (!fs.existsSync(CSV_FILE)) {
    throw new Error(`CSV file not found: ${CSV_FILE}`);
  }

  const csvRaw = fs.readFileSync(CSV_FILE, "utf-8");
  const rows = parseWardCsv(csvRaw);

  if (rows.length === 0) {
    throw new Error("No valid rows found in CSV");
  }

  const governmentOfficeType = await prisma.serviceType.findUnique({
    where: { slug: "government_office" },
    select: { slug: true },
  });

  if (!governmentOfficeType) {
    throw new Error('Service type "government_office" not found. Run the main seed first.');
  }

  const constituencyRecords = await prisma.constituency.findMany({
    where: { districtId: "dist-kathmandu" },
    select: { id: true, name: true },
  });

  const constituencyByName = new Map(constituencyRecords.map((item) => [item.name, item.id]));

  let upserted = 0;
  let skippedKathmandu6 = 0;
  let skippedMissingConstituency = 0;

  for (const row of rows) {
    if (row.constituency === SKIP_CONSTITUENCY) {
      skippedKathmandu6 += row.wards.length;
      continue;
    }

    const constituencyId = constituencyByName.get(row.constituency);

    if (!constituencyId) {
      skippedMissingConstituency += row.wards.length;
      console.warn(`⚠️ Constituency not found for row: ${row.constituency}`);
      continue;
    }

    for (const wardNumber of row.wards) {
      const id = `ward-${slugify(row.municipality)}-${wardNumber}`;
      const name = `${row.municipality} Ward ${wardNumber}`;
      const municipalityNp = municipalityToNepaliName(row.municipality);
      const wardNumberNp = toNepaliDigits(wardNumber);

      await prisma.publicService.upsert({
        where: { id },
        update: {
          name,
          nameNp: `${municipalityNp} वडा ${wardNumberNp}`,
          type: governmentOfficeType.slug,
          location: `Ward Office, Ward ${wardNumber}, ${row.municipality}, Kathmandu, Nepal`,
          description: `Ward office for ${row.municipality} Ward ${wardNumber}`,
          descriptionNp: `${municipalityNp} वडा ${wardNumberNp} को वडा कार्यालय`,
          constituencyId,
        },
        create: {
          id,
          name,
          nameNp: `${municipalityNp} वडा ${wardNumberNp}`,
          type: governmentOfficeType.slug,
          location: `Ward Office, Ward ${wardNumber}, ${row.municipality}, Kathmandu, Nepal`,
          description: `Ward office for ${row.municipality} Ward ${wardNumber}`,
          descriptionNp: `${municipalityNp} वडा ${wardNumberNp} को वडा कार्यालय`,
          constituencyId,
        },
      });

      upserted += 1;
    }
  }

  console.log(`✅ Kathmandu ward offices seeded (excluding Kathmandu-6): ${upserted}`);
  console.log(`ℹ️ Skipped Kathmandu-6 ward rows: ${skippedKathmandu6}`);
  if (skippedMissingConstituency > 0) {
    console.log(`ℹ️ Skipped rows due to missing constituency: ${skippedMissingConstituency}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
