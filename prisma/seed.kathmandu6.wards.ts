import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Kathmandu-6 wards and their respective municipalities
const WARDS = [
  // Kathmandu Metropolitan City
  {
    name: "Kathmandu Metropolitan City Ward 26",
    nameNp: "काठमाडौँ महानगरपालिका वडा २६",
    municipality: "Kathmandu Metropolitan City",
    ward: 26,
    location: "Ward Office, Kathmandu-26, Kathmandu Metropolitan City, Kathmandu, Nepal",
    locationNp: "वडा कार्यालय, काठमाडौँ-२६, काठमाडौँ महानगरपालिका, काठमाडौँ, नेपाल"
  },
  {
    name: "Kathmandu Metropolitan City Ward 27",
    nameNp: "काठमाडौँ महानगरपालिका वडा २७",
    municipality: "Kathmandu Metropolitan City",
    ward: 27,
    location: "Ward Office, Kathmandu-27, Kathmandu Metropolitan City, Kathmandu, Nepal",
    locationNp: "वडा कार्यालय, काठमाडौँ-२७, काठमाडौँ महानगरपालिका, काठमाडौँ, नेपाल"
  },
  {
    name: "Kathmandu Metropolitan City Ward 28",
    nameNp: "काठमाडौँ महानगरपालिका वडा २८",
    municipality: "Kathmandu Metropolitan City",
    ward: 28,
    location: "Ward Office, Kathmandu-28, Kathmandu Metropolitan City, Kathmandu, Nepal",
    locationNp: "वडा कार्यालय, काठमाडौँ-२८, काठमाडौँ महानगरपालिका, काठमाडौँ, नेपाल"
  },
  // Tokha Municipality
  {
    name: "Tokha Municipality Ward 1",
    nameNp: "टोखा नगरपालिका वडा १",
    municipality: "Tokha Municipality",
    ward: 1,
    location: "Ward Office, Ward 1, Tokha Municipality, Kathmandu, Nepal",
    locationNp: "वडा कार्यालय, वडा १, टोखा नगरपालिका, काठमाडौँ, नेपाल"
  },
  {
    name: "Tokha Municipality Ward 8",
    nameNp: "टोखा नगरपालिका वडा ८",
    municipality: "Tokha Municipality",
    ward: 8,
    location: "Ward Office, Ward 8, Tokha Municipality, Kathmandu, Nepal",
    locationNp: "वडा कार्यालय, वडा ८, टोखा नगरपालिका, काठमाडौँ, नेपाल"
  },
  {
    name: "Tokha Municipality Ward 9",
    nameNp: "टोखा नगरपालिका वडा ९",
    municipality: "Tokha Municipality",
    ward: 9,
    location: "Ward Office, Ward 9, Tokha Municipality, Kathmandu, Nepal",
    locationNp: "वडा कार्यालय, वडा ९, टोखा नगरपालिका, काठमाडौँ, नेपाल"
  },
  {
    name: "Tokha Municipality Ward 10",
    nameNp: "टोखा नगरपालिका वडा १०",
    municipality: "Tokha Municipality",
    ward: 10,
    location: "Ward Office, Ward 10, Tokha Municipality, Kathmandu, Nepal",
    locationNp: "वडा कार्यालय, वडा १०, टोखा नगरपालिका, काठमाडौँ, नेपाल"
  },
  {
    name: "Tokha Municipality Ward 11",
    nameNp: "टोखा नगरपालिका वडा ११",
    municipality: "Tokha Municipality",
    ward: 11,
    location: "Ward Office, Ward 11, Tokha Municipality, Kathmandu, Nepal",
    locationNp: "वडा कार्यालय, वडा ११, टोखा नगरपालिका, काठमाडौँ, नेपाल"
  },
  // Tarakeshwar Municipality
  {
    name: "Tarakeshwar Municipality Ward 1",
    nameNp: "तारकेश्वर नगरपालिका वडा १",
    municipality: "Tarakeshwar Municipality",
    ward: 1,
    location: "Ward Office, Ward 1, Tarakeshwar Municipality, Kathmandu, Nepal",
    locationNp: "वडा कार्यालय, वडा १, तारकेश्वर नगरपालिका, काठमाडौँ, नेपाल"
  },
  {
    name: "Tarakeshwar Municipality Ward 2",
    nameNp: "तारकेश्वर नगरपालिका वडा २",
    municipality: "Tarakeshwar Municipality",
    ward: 2,
    location: "Ward Office, Ward 2, Tarakeshwar Municipality, Kathmandu, Nepal",
    locationNp: "वडा कार्यालय, वडा २, तारकेश्वर नगरपालिका, काठमाडौँ, नेपाल"
  },
  {
    name: "Tarakeshwar Municipality Ward 6",
    nameNp: "तारकेश्वर नगरपालिका वडा ६",
    municipality: "Tarakeshwar Municipality",
    ward: 6,
    location: "Ward Office, Ward 6, Tarakeshwar Municipality, Kathmandu, Nepal",
    locationNp: "वडा कार्यालय, वडा ६, तारकेश्वर नगरपालिका, काठमाडौँ, नेपाल"
  },
  {
    name: "Tarakeshwar Municipality Ward 7",
    nameNp: "तारकेश्वर नगरपालिका वडा ७",
    municipality: "Tarakeshwar Municipality",
    ward: 7,
    location: "Ward Office, Ward 7, Tarakeshwar Municipality, Kathmandu, Nepal",
    locationNp: "वडा कार्यालय, वडा ७, तारकेश्वर नगरपालिका, काठमाडौँ, नेपाल"
  },
  {
    name: "Tarakeshwar Municipality Ward 8",
    nameNp: "तारकेश्वर नगरपालिका वडा ८",
    municipality: "Tarakeshwar Municipality",
    ward: 8,
    location: "Ward Office, Ward 8, Tarakeshwar Municipality, Kathmandu, Nepal",
    locationNp: "वडा कार्यालय, वडा ८, तारकेश्वर नगरपालिका, काठमाडौँ, नेपाल"
  },
  {
    name: "Tarakeshwar Municipality Ward 9",
    nameNp: "तारकेश्वर नगरपालिका वडा ९",
    municipality: "Tarakeshwar Municipality",
    ward: 9,
    location: "Ward Office, Ward 9, Tarakeshwar Municipality, Kathmandu, Nepal",
    locationNp: "वडा कार्यालय, वडा ९, तारकेश्वर नगरपालिका, काठमाडौँ, नेपाल"
  },
  {
    name: "Tarakeshwar Municipality Ward 10",
    nameNp: "तारकेश्वर नगरपालिका वडा १०",
    municipality: "Tarakeshwar Municipality",
    ward: 10,
    location: "Ward Office, Ward 10, Tarakeshwar Municipality, Kathmandu, Nepal",
    locationNp: "वडा कार्यालय, वडा १०, तारकेश्वर नगरपालिका, काठमाडौँ, नेपाल"
  },
  {
    name: "Tarakeshwar Municipality Ward 11",
    nameNp: "तारकेश्वर नगरपालिका वडा ११",
    municipality: "Tarakeshwar Municipality",
    ward: 11,
    location: "Ward Office, Ward 11, Tarakeshwar Municipality, Kathmandu, Nepal",
    locationNp: "वडा कार्यालय, वडा ११, तारकेश्वर नगरपालिका, काठमाडौँ, नेपाल"
  },
];

async function main() {
  const constituency = await prisma.constituency.findUnique({ where: { id: "const-kathmandu-6" } });
  if (!constituency) throw new Error("Kathmandu-6 constituency not found");

  const governmentOfficeType = await prisma.serviceType.findUnique({
    where: { slug: "government_office" },
    select: { slug: true },
  });

  if (!governmentOfficeType) {
    throw new Error('Service type "government_office" not found. Run the main seed first.');
  }

  for (const ward of WARDS) {
    const id = `ward-${ward.municipality.replace(/\s+/g, "-").toLowerCase()}-${ward.ward}`;
    await prisma.publicService.upsert({
      where: { id },
      update: {
        name: ward.name,
        nameNp: ward.nameNp,
        type: governmentOfficeType.slug,
        location: ward.location,
        description: `Ward office for ${ward.municipality} Ward ${ward.ward}`,
        descriptionNp: `${ward.municipality} वडा ${ward.ward} को वडा कार्यालय`,
        constituencyId: constituency.id,
      },
      create: {
        id,
        name: ward.name,
        nameNp: ward.nameNp,
        type: governmentOfficeType.slug,
        location: ward.location,
        description: `Ward office for ${ward.municipality} Ward ${ward.ward}`,
        descriptionNp: `${ward.municipality} वडा ${ward.ward} को वडा कार्यालय`,
        constituencyId: constituency.id,
      },
    });
  }
  console.log(`✅ Kathmandu-6 ward offices seeded (${WARDS.length})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
