import { PrismaClient } from "@prisma/client";
import fs from "node:fs/promises";
import path from "node:path";

const prisma = new PrismaClient();

type ConstituencyRow = {
  province: string;
  district: string;
  constituency: string;
};

const DISTRICT_NAME_ALIASES: Record<string, string> = {
  nawalparasi: "nawalparasiwest",
};

function normalizeName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
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

async function loadRowsFromList(): Promise<ConstituencyRow[]> {
  const filePath = path.join(process.cwd(), "prisma", "list.txt");
  const content = await fs.readFile(filePath, "utf8");

  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^\d+,/.test(line));

  return lines
    .map(parseCsvLine)
    .filter((columns) => columns.length >= 4)
    .map((columns) => ({
      province: columns[1],
      district: columns[2],
      constituency: columns[3],
    }));
}

async function main() {
  console.log("🌱 Seeding constituencies from list (excluding Kathmandu district)...");

  const rows = await loadRowsFromList();
  const districts = await prisma.district.findMany({
    select: { id: true, name: true },
  });

  const districtByNormalizedName = new Map<string, { id: string; name: string }>();
  for (const district of districts) {
    districtByNormalizedName.set(normalizeName(district.name), district);
  }

  const toSeed = rows.filter(
    (row) => normalizeName(row.district) !== normalizeName("Kathmandu")
  );

  const missingDistricts = new Set<string>();
  const usedIds = new Set<string>();
  let createdOrUpdated = 0;

  for (const row of toSeed) {
    const normalizedDistrict = normalizeName(row.district);
    const mappedDistrict =
      DISTRICT_NAME_ALIASES[normalizedDistrict] ?? normalizedDistrict;
    const district = districtByNormalizedName.get(mappedDistrict);

    if (!district) {
      missingDistricts.add(row.district);
      continue;
    }

    const resolvedConstituencyName = row.constituency;

    let constituencyId = `const-${slugify(resolvedConstituencyName)}`;
    if (usedIds.has(constituencyId)) {
      constituencyId = `${constituencyId}-${slugify(row.district)}`;
    }
    usedIds.add(constituencyId);

    await prisma.constituency.upsert({
      where: { id: constituencyId },
      update: {
        name: resolvedConstituencyName,
        nameNp: resolvedConstituencyName,
        districtId: district.id,
        province: row.province,
      },
      create: {
        id: constituencyId,
        name: resolvedConstituencyName,
        nameNp: resolvedConstituencyName,
        districtId: district.id,
        province: row.province,
      },
    });

    createdOrUpdated += 1;
  }

  if (missingDistricts.size > 0) {
    throw new Error(
      `Could not match these districts from list.txt: ${Array.from(missingDistricts).sort().join(", ")}`
    );
  }

  console.log(`✅ Constituencies created/updated: ${createdOrUpdated}`);
  console.log("✅ Kathmandu district rows were skipped");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
