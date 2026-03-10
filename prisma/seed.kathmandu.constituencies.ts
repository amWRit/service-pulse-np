import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// List of Kathmandu constituencies except Kathmandu 1
const KATHMANDU_CONSTITUENCIES = [
  { id: "const-kathmandu-2", name: "Kathmandu-2", nameNp: "काठमाडौं-२" },
  { id: "const-kathmandu-3", name: "Kathmandu-3", nameNp: "काठमाडौं-३" },
  { id: "const-kathmandu-4", name: "Kathmandu-4", nameNp: "काठमाडौं-४" },
  { id: "const-kathmandu-5", name: "Kathmandu-5", nameNp: "काठमाडौं-५" },
  { id: "const-kathmandu-6", name: "Kathmandu-6", nameNp: "काठमाडौं-६" },
  { id: "const-kathmandu-7", name: "Kathmandu-7", nameNp: "काठमाडौं-७" },
  { id: "const-kathmandu-8", name: "Kathmandu-8", nameNp: "काठमाडौं-८" },
  { id: "const-kathmandu-9", name: "Kathmandu-9", nameNp: "काठमाडौं-९" }
];

async function main() {
  const district = await prisma.district.findUnique({ where: { id: "dist-kathmandu" } });
  if (!district) throw new Error("Kathmandu district not found");

  for (const c of KATHMANDU_CONSTITUENCIES) {
    await prisma.constituency.upsert({
      where: { id: c.id },
      update: { name: c.name, nameNp: c.nameNp, districtId: district.id },
      create: {
        id: c.id,
        name: c.name,
        nameNp: c.nameNp,
        districtId: district.id,
        province: "Bagmati Province",
      },
    });
  }
  console.log(`✅ Kathmandu constituencies seeded (${KATHMANDU_CONSTITUENCIES.length})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
