import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const WARDS = [
  {
    municipality: "Dakshinkali Municipality",
    municipalityNp: "दक्षिणकाली नगरपालिका",
    wards: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
  {
    municipality: "Chandragiri Municipality",
    municipalityNp: "चन्द्रागिरि नगरपालिका",
    wards: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  },
  {
    municipality: "Kirtipur Municipality",
    municipalityNp: "कीर्तिपुर नगरपालिका",
    wards: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  },
];

const NP_DIGITS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

function toNepaliDigits(value: number): string {
  return String(value)
    .split("")
    .map((char) => {
      const digit = Number.parseInt(char, 10);
      return Number.isInteger(digit) ? NP_DIGITS[digit] : char;
    })
    .join("");
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  let constituency = await prisma.constituency.findUnique({ where: { id: "const-kathmandu-10" } });
  if (!constituency) {
    constituency = await prisma.constituency.findFirst({
      where: { name: "Kathmandu-10" },
      orderBy: { createdAt: "desc" },
    });
  }

  if (!constituency) throw new Error("Kathmandu-10 constituency not found");

  const governmentOfficeType = await prisma.serviceType.findUnique({
    where: { slug: "government_office" },
    select: { slug: true },
  });

  if (!governmentOfficeType) {
    throw new Error('Service type "government_office" not found. Run the main seed first.');
  }

  let upserted = 0;

  for (const group of WARDS) {
    for (const wardNumber of group.wards) {
      const wardNumberNp = toNepaliDigits(wardNumber);
      const id = `ward-const-kathmandu-10-${slugify(group.municipality)}-${wardNumber}`;

      await prisma.publicService.upsert({
        where: { id },
        update: {
          name: `${group.municipality} Ward ${wardNumber}`,
          nameNp: `${group.municipalityNp} वडा ${wardNumberNp}`,
          type: governmentOfficeType.slug,
          location: `Ward Office, Ward ${wardNumber}, ${group.municipality}, Kathmandu, Nepal`,
          description: `Ward office for ${group.municipality} Ward ${wardNumber}`,
          descriptionNp: `${group.municipalityNp} वडा ${wardNumberNp} को वडा कार्यालय`,
          constituencyId: constituency.id,
        },
        create: {
          id,
          name: `${group.municipality} Ward ${wardNumber}`,
          nameNp: `${group.municipalityNp} वडा ${wardNumberNp}`,
          type: governmentOfficeType.slug,
          location: `Ward Office, Ward ${wardNumber}, ${group.municipality}, Kathmandu, Nepal`,
          description: `Ward office for ${group.municipality} Ward ${wardNumber}`,
          descriptionNp: `${group.municipalityNp} वडा ${wardNumberNp} को वडा कार्यालय`,
          constituencyId: constituency.id,
        },
      });

      upserted += 1;
    }
  }

  console.log(`✅ Kathmandu-10 ward offices seeded (${upserted})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
