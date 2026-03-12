import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { seedServiceTypes } from "./seed.service-types.js";

const prisma = new PrismaClient();

// ── Province + District data ─────────────────────────────────────────────────
const PROVINCES: { id: string; name: string; nameNp: string; districts: { id: string; name: string; nameNp: string }[] }[] = [
  {
    id: "prov-koshi", name: "Koshi", nameNp: "कोशी",
    districts: [
      { id: "dist-taplejung",      name: "Taplejung",     nameNp: "ताप्लेजुङ" },
      { id: "dist-panchthar",      name: "Panchthar",     nameNp: "पाँचथर" },
      { id: "dist-ilam",           name: "Ilam",          nameNp: "इलाम" },
      { id: "dist-jhapa",          name: "Jhapa",         nameNp: "झापा" },
      { id: "dist-sankhuwasabha",  name: "Sankhuwasabha", nameNp: "संखुवासभा" },
      { id: "dist-tehrathum",      name: "Tehrathum",     nameNp: "तेह्रथुम" },
      { id: "dist-bhojpur",        name: "Bhojpur",       nameNp: "भोजपुर" },
      { id: "dist-dhankuta",       name: "Dhankuta",      nameNp: "धनकुटा" },
      { id: "dist-morang",         name: "Morang",        nameNp: "मोरङ" },
      { id: "dist-sunsari",        name: "Sunsari",       nameNp: "सुनसरी" },
      { id: "dist-solukhumbu",     name: "Solukhumbu",    nameNp: "सोलुखुम्बु" },
      { id: "dist-khotang",        name: "Khotang",       nameNp: "खोटाङ" },
      { id: "dist-okhaldhunga",    name: "Okhaldhunga",   nameNp: "ओखलढुङ्गा" },
      { id: "dist-udayapur",       name: "Udayapur",      nameNp: "उदयपुर" },
    ],
  },
  {
    id: "prov-madhesh", name: "Madhesh", nameNp: "मधेश",
    districts: [
      { id: "dist-saptari",    name: "Saptari",    nameNp: "सप्तरी" },
      { id: "dist-siraha",     name: "Siraha",     nameNp: "सिराहा" },
      { id: "dist-dhanusha",   name: "Dhanusha",   nameNp: "धनुषा" },
      { id: "dist-mahottari",  name: "Mahottari",  nameNp: "महोत्तरी" },
      { id: "dist-sarlahi",    name: "Sarlahi",    nameNp: "सर्लाही" },
      { id: "dist-rautahat",   name: "Rautahat",   nameNp: "रौतहट" },
      { id: "dist-bara",       name: "Bara",       nameNp: "बारा" },
      { id: "dist-parsa",      name: "Parsa",      nameNp: "पर्सा" },
    ],
  },
  {
    id: "prov-bagmati", name: "Bagmati", nameNp: "बागमती",
    districts: [
      { id: "dist-dolakha",       name: "Dolakha",       nameNp: "दोलखा" },
      { id: "dist-ramechhap",     name: "Ramechhap",     nameNp: "रामेछाप" },
      { id: "dist-sindhuli",      name: "Sindhuli",      nameNp: "सिन्धुली" },
      { id: "dist-rasuwa",        name: "Rasuwa",        nameNp: "रसुवा" },
      { id: "dist-dhading",       name: "Dhading",       nameNp: "धादिङ" },
      { id: "dist-nuwakot",       name: "Nuwakot",       nameNp: "नुवाकोट" },
      { id: "dist-kathmandu",     name: "Kathmandu",     nameNp: "काठमाडौँ" },
      { id: "dist-bhaktapur",     name: "Bhaktapur",     nameNp: "भक्तपुर" },
      { id: "dist-lalitpur",      name: "Lalitpur",      nameNp: "ललितपुर" },
      { id: "dist-kavrepalanchok",name: "Kavrepalanchok",nameNp: "काभ्रेपलाञ्चोक" },
      { id: "dist-sindhupalchok", name: "Sindhupalchok", nameNp: "सिन्धुपाल्चोक" },
      { id: "dist-makwanpur",     name: "Makwanpur",     nameNp: "मकवानपुर" },
      { id: "dist-chitwan",       name: "Chitwan",       nameNp: "चितवन" },
    ],
  },
  {
    id: "prov-gandaki", name: "Gandaki", nameNp: "गण्डकी",
    districts: [
      { id: "dist-gorkha",     name: "Gorkha",     nameNp: "गोर्खा" },
      { id: "dist-manang",     name: "Manang",     nameNp: "मनाङ" },
      { id: "dist-lamjung",    name: "Lamjung",    nameNp: "लमजुङ" },
      { id: "dist-kaski",      name: "Kaski",      nameNp: "कास्की" },
      { id: "dist-tanahun",    name: "Tanahun",    nameNp: "तनहुँ" },
      { id: "dist-syangja",    name: "Syangja",    nameNp: "स्याङजा" },
      { id: "dist-nawalpur",   name: "Nawalpur",   nameNp: "नवलपुर" },
      { id: "dist-mustang",    name: "Mustang",    nameNp: "मुस्ताङ" },
      { id: "dist-myagdi",     name: "Myagdi",     nameNp: "म्याग्दी" },
      { id: "dist-baglung",    name: "Baglung",    nameNp: "बाग्लुङ" },
      { id: "dist-parbat",     name: "Parbat",     nameNp: "पर्वत" },
    ],
  },
  {
    id: "prov-lumbini", name: "Lumbini", nameNp: "लुम्बिनी",
    districts: [
      { id: "dist-gulmi",          name: "Gulmi",                    nameNp: "गुल्मी" },
      { id: "dist-palpa",          name: "Palpa",                    nameNp: "पाल्पा" },
      { id: "dist-arghakhanchi",   name: "Arghakhanchi",             nameNp: "अर्घाखाँची" },
      { id: "dist-nawalparasi-w",  name: "Nawalparasi (West)",       nameNp: "नवलपरासी (पश्चिम)" },
      { id: "dist-rupandehi",      name: "Rupandehi",                nameNp: "रुपन्देही" },
      { id: "dist-kapilvastu",     name: "Kapilvastu",               nameNp: "कपिलवस्तु" },
      { id: "dist-eastern-rukum",  name: "Eastern Rukum",            nameNp: "रुकुम पूर्व" },
      { id: "dist-rolpa",          name: "Rolpa",                    nameNp: "रोल्पा" },
      { id: "dist-pyuthan",        name: "Pyuthan",                  nameNp: "प्युठान" },
      { id: "dist-dang",           name: "Dang",                     nameNp: "दाङ" },
      { id: "dist-banke",          name: "Banke",                    nameNp: "बाँके" },
      { id: "dist-bardiya",        name: "Bardiya",                  nameNp: "बर्दिया" },
    ],
  },
  {
    id: "prov-karnali", name: "Karnali", nameNp: "कर्णाली",
    districts: [
      { id: "dist-salyan",        name: "Salyan",        nameNp: "सल्यान" },
      { id: "dist-dolpa",         name: "Dolpa",         nameNp: "डोल्पा" },
      { id: "dist-mugu",          name: "Mugu",          nameNp: "मुगु" },
      { id: "dist-jumla",         name: "Jumla",         nameNp: "जुम्ला" },
      { id: "dist-kalikot",       name: "Kalikot",       nameNp: "कालिकोट" },
      { id: "dist-humla",         name: "Humla",         nameNp: "हुम्ला" },
      { id: "dist-jajarkot",      name: "Jajarkot",      nameNp: "जाजरकोट" },
      { id: "dist-dailekh",       name: "Dailekh",       nameNp: "दैलेख" },
      { id: "dist-surkhet",       name: "Surkhet",       nameNp: "सुर्खेत" },
      { id: "dist-western-rukum", name: "Western Rukum", nameNp: "रुकुम पश्चिम" },
    ],
  },
  {
    id: "prov-sudurpaschim", name: "Sudurpaschim", nameNp: "सुदूरपश्चिम",
    districts: [
      { id: "dist-bajura",      name: "Bajura",      nameNp: "बाजुरा" },
      { id: "dist-achham",      name: "Achham",      nameNp: "अछाम" },
      { id: "dist-bajhang",     name: "Bajhang",     nameNp: "बझाङ" },
      { id: "dist-doti",        name: "Doti",        nameNp: "डोटी" },
      { id: "dist-kailali",     name: "Kailali",     nameNp: "कैलाली" },
      { id: "dist-darchula",    name: "Darchula",    nameNp: "दार्चुला" },
      { id: "dist-baitadi",     name: "Baitadi",     nameNp: "बैतडी" },
      { id: "dist-dadeldhura",  name: "Dadeldhura",  nameNp: "डडेलधुरा" },
      { id: "dist-kanchanpur",  name: "Kanchanpur",  nameNp: "कञ्चनपुर" },
    ],
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  await seedServiceTypes(prisma);

  // ── Provinces + Districts ──────────────────────────────────────────────────
  for (const prov of PROVINCES) {
    await prisma.province.upsert({
      where: { id: prov.id },
      update: { name: prov.name, nameNp: prov.nameNp },
      create: { id: prov.id, name: prov.name, nameNp: prov.nameNp },
    });
    for (const dist of prov.districts) {
      await prisma.district.upsert({
        where: { id: dist.id },
        update: { name: dist.name, nameNp: dist.nameNp, provinceId: prov.id },
        create: { id: dist.id, name: dist.name, nameNp: dist.nameNp, provinceId: prov.id },
      });
    }
  }
  const totalDistricts = PROVINCES.reduce((n, p) => n + p.districts.length, 0);
  console.log(`✅ Provinces (${PROVINCES.length}) + Districts (${totalDistricts}) created`);

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@servicepulse.np" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@servicepulse.np",
      password: adminPassword,
      role: "admin",
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // Create test citizen
  const citizenPassword = await bcrypt.hash("citizen123", 12);
  const citizen = await prisma.user.upsert({
    where: { email: "ram@example.com" },
    update: {},
    create: {
      name: "Ram Bahadur",
      email: "ram@example.com",
      password: citizenPassword,
      role: "citizen",
    },
  });
  console.log("✅ Citizen user created:", citizen.email);

  // Badges
  const badges = await Promise.all([
    prisma.badge.upsert({
      where: { id: "badge-first" },
      update: { conditionNp: "१ रिपोर्ट पेश गर्नुहोस्" },
      create: {
        id: "badge-first",
        name: "First Report",
        nameNp: "पहिलो रिपोर्ट",
        description: "Submitted your first report",
        icon: "🏅",
        condition: "Submit 1 report",
        conditionNp: "१ रिपोर्ट पेश गर्नुहोस्",
      },
    }),
    prisma.badge.upsert({
      where: { id: "badge-5" },
      update: { conditionNp: "५ रिपोर्ट पेश गर्नुहोस्" },
      create: {
        id: "badge-5",
        name: "5 Reports",
        nameNp: "५ रिपोर्ट",
        description: "Submitted 5 reports",
        icon: "🥈",
        condition: "Submit 5 reports",
        conditionNp: "५ रिपोर्ट पेश गर्नुहोस्",
      },
    }),
    prisma.badge.upsert({
      where: { id: "badge-10" },
      update: { conditionNp: "१० रिपोर्ट पेश गर्नुहोस्" },
      create: {
        id: "badge-10",
        name: "10 Reports",
        nameNp: "१० रिपोर्ट",
        description: "Submitted 10 reports",
        icon: "🥇",
        condition: "Submit 10 reports",
        conditionNp: "१० रिपोर्ट पेश गर्नुहोस्",
      },
    }),
    prisma.badge.upsert({
      where: { id: "badge-25" },
      update: { conditionNp: "२५ रिपोर्ट पेश गर्नुहोस्" },
      create: {
        id: "badge-25",
        name: "25 Reports",
        nameNp: "२५ रिपोर्ट",
        description: "Submitted 25 reports",
        icon: "🏆",
        condition: "Submit 25 reports",
        conditionNp: "२५ रिपोर्ट पेश गर्नुहोस्",
      },
    }),
    prisma.badge.upsert({
      where: { id: "badge-slow" },
      update: { conditionNp: "६०+ मिनेट प्रतीक्षा भएका ३ सेवाहरू रिपोर्ट गर्नुहोस्" },
      create: {
        id: "badge-slow",
        name: "Slow Spotter",
        nameNp: "ढिलो पहिचानकर्ता",
        description: "Reported 3+ services taking over 60 minutes",
        icon: "🐢",
        condition: "Report 3 services with > 60 min wait time",
        conditionNp: "६०+ मिनेट प्रतीक्षा भएका ३ सेवाहरू रिपोर्ट गर्नुहोस्",
      },
    }),
  ]);
  console.log("✅ Badges created:", badges.length);

  // Constituencies
  const constituencies = await Promise.all([
    prisma.constituency.upsert({
      where: { id: "const-kathmandu-1" },
      update: { districtId: "dist-kathmandu" },
      create: {
        id: "const-kathmandu-1",
        name: "Kathmandu-1",
        nameNp: "काठमाडौं-१",
        province: "Bagmati Province",
        districtId: "dist-kathmandu",
        description: "Central Kathmandu constituency",
        imageUrl: "https://drive.google.com/file/d/1LwqZBxuDJbXkqyCrdICft2wg74ueDld6/view?usp=drive_link",
      },
    }),
    prisma.constituency.upsert({
      where: { id: "const-lalitpur-1" },
      update: { districtId: "dist-lalitpur" },
      create: {
        id: "const-lalitpur-1",
        name: "Lalitpur-1",
        nameNp: "ललितपुर-१",
        province: "Bagmati Province",
        districtId: "dist-lalitpur",
        description: "Lalitpur Metropolitan City constituency",
        imageUrl: "https://drive.google.com/file/d/1FHwEj_a6JycbjEgLDkJAF2FjPd66_mVr/view?usp=drive_link",
      },
    }),
    prisma.constituency.upsert({
      where: { id: "const-pokhara-1" },
      update: { districtId: "dist-kaski" },
      create: {
        id: "const-pokhara-1",
        name: "Pokhara-1",
        nameNp: "पोखरा-१",
        province: "Gandaki Province",
        districtId: "dist-kaski",
        description: "Pokhara Metropolitan City constituency",
        imageUrl: "https://drive.google.com/file/d/1O9udqFpiIhbpPpO38JaiRXljzgOG7-4D/view?usp=drive_link",
      },
    }),
    prisma.constituency.upsert({
      where: { id: "const-biratnagar-1" },
      update: { districtId: "dist-morang" },
      create: {
        id: "const-biratnagar-1",
        name: "Biratnagar-1",
        nameNp: "विराटनगर-१",
        province: "Koshi Province",
        districtId: "dist-morang",
        description: "Biratnagar Metropolitan City constituency",
        imageUrl: "https://drive.google.com/file/d/1uBuEueh3J3eH6PiL8636Pt5FHszbpwFR/view?usp=drive_link",
      },
    }),
  ]);
  console.log("✅ Constituencies created:", constituencies.length);

  // Public Services
  const services = await Promise.all([
    // Kathmandu-1
    prisma.publicService.upsert({
      where: { id: "svc-bir" },
      update: {},
      create: {
        id: "svc-bir",
        name: "Bir Hospital",
        nameNp: "वीर अस्पताल",
        type: "hospital",
        location: "Mahaboudha, Kathmandu",
        description: "Nepal's largest public hospital",
        descriptionNp: "नेपालको सबैभन्दा ठूलो सार्वजनिक अस्पताल",
        constituencyId: "const-kathmandu-1",
      },
    }),
    prisma.publicService.upsert({
      where: { id: "svc-cdo-ktm" },
      update: {},
      create: {
        id: "svc-cdo-ktm",
        name: "CDO Office Kathmandu",
        nameNp: "मुख्य जिल्ला अधिकारी कार्यालय काठमाडौं",
        type: "government_office",
        location: "Bahadurbhawan, Kathmandu",
        description: "Chief District Officer Office",
        descriptionNp: "मुख्य जिल्ला अधिकारी कार्यालय",
        constituencyId: "const-kathmandu-1",
      },
    }),
    prisma.publicService.upsert({
      where: { id: "svc-passport-ktm" },
      update: {},
      create: {
        id: "svc-passport-ktm",
        name: "Department of Passports",
        nameNp: "राहदानी विभाग",
        type: "government_office",
        location: "Narayanhiti, Kathmandu",
        description: "Passport issuance and renewal",
        descriptionNp: "राहदानी जारी र नवीकरण",
        constituencyId: "const-kathmandu-1",
      },
    }),
    // Lalitpur-1
    prisma.publicService.upsert({
      where: { id: "svc-patan-hosp" },
      update: {},
      create: {
        id: "svc-patan-hosp",
        name: "Patan Hospital",
        nameNp: "पाटन अस्पताल",
        type: "hospital",
        location: "Lagankhel, Lalitpur",
        description: "Major public hospital in Lalitpur",
        descriptionNp: "ललितपुरको प्रमुख सार्वजनिक अस्पताल",
        constituencyId: "const-lalitpur-1",
      },
    }),
    prisma.publicService.upsert({
      where: { id: "svc-lmc" },
      update: {},
      create: {
        id: "svc-lmc",
        name: "Lalitpur Metro City Hall",
        nameNp: "ललितपुर महानगरपालिका",
        type: "government_office",
        location: "Mangalbazar, Lalitpur",
        description: "Municipal services for Lalitpur",
        descriptionNp: "ललितपुरका नगरपालिका सेवाहरू",
        constituencyId: "const-lalitpur-1",
      },
    }),
    // Pokhara-1
    prisma.publicService.upsert({
      where: { id: "svc-gandaki-hosp" },
      update: {},
      create: {
        id: "svc-gandaki-hosp",
        name: "Gandaki Hospital",
        nameNp: "गण्डकी अस्पताल",
        type: "hospital",
        location: "Pokhara",
        description: "Provincial hospital of Gandaki Province",
        descriptionNp: "गण्डकी प्रदेशको प्रादेशिक अस्पताल",
        constituencyId: "const-pokhara-1",
      },
    }),
    prisma.publicService.upsert({
      where: { id: "svc-pokhara-cdo" },
      update: {},
      create: {
        id: "svc-pokhara-cdo",
        name: "CDO Office Kaski",
        nameNp: "मुख्य जिल्ला अधिकारी कार्यालय कास्की",
        type: "government_office",
        location: "Pokhara",
        description: "Chief District Officer Office for Kaski District",
        descriptionNp: "कास्की जिल्लाको मुख्य जिल्ला अधिकारी कार्यालय",
        constituencyId: "const-pokhara-1",
      },
    }),
  ]);
  console.log("✅ Public services created:", services.length);

  // Sample Reports
  const reportData = [
    { publicServiceId: "svc-bir", constituencyId: "const-kathmandu-1", serviceTimeMinutes: 90, rating: 2, comment: "Very long wait time. Need better management.", userId: citizen.id },
    { publicServiceId: "svc-bir", constituencyId: "const-kathmandu-1", serviceTimeMinutes: 120, rating: 2, comment: "Overcrowded. Waited 2 hours.", userId: null },
    { publicServiceId: "svc-bir", constituencyId: "const-kathmandu-1", serviceTimeMinutes: 45, rating: 3, comment: "Average experience.", userId: null },
    { publicServiceId: "svc-cdo-ktm", constituencyId: "const-kathmandu-1", serviceTimeMinutes: 30, rating: 3, comment: "Staff were helpful but slow.", userId: citizen.id },
    { publicServiceId: "svc-cdo-ktm", constituencyId: "const-kathmandu-1", serviceTimeMinutes: 20, rating: 4, comment: "Reasonably fast service today.", userId: null },
    { publicServiceId: "svc-passport-ktm", constituencyId: "const-kathmandu-1", serviceTimeMinutes: 180, rating: 1, comment: "Terrible! Waited 3 hours. System was down.", userId: citizen.id },
    { publicServiceId: "svc-passport-ktm", constituencyId: "const-kathmandu-1", serviceTimeMinutes: 60, rating: 3, comment: "Long but expected.", userId: null },
    { publicServiceId: "svc-patan-hosp", constituencyId: "const-lalitpur-1", serviceTimeMinutes: 25, rating: 5, comment: "Excellent service! Very clean and fast.", userId: citizen.id },
    { publicServiceId: "svc-patan-hosp", constituencyId: "const-lalitpur-1", serviceTimeMinutes: 35, rating: 4, comment: "Good hospital, friendly staff.", userId: null },
    { publicServiceId: "svc-lmc", constituencyId: "const-lalitpur-1", serviceTimeMinutes: 15, rating: 5, comment: "Super fast! Got my citizenship copy in 15 mins.", userId: citizen.id },
    { publicServiceId: "svc-gandaki-hosp", constituencyId: "const-pokhara-1", serviceTimeMinutes: 40, rating: 4, comment: "Good experience overall.", userId: null },
    { publicServiceId: "svc-pokhara-cdo", constituencyId: "const-pokhara-1", serviceTimeMinutes: 25, rating: 4, comment: "Efficient service.", userId: citizen.id },
  ];

  for (const report of reportData) {
    await prisma.report.create({ data: report });
  }
  console.log("✅ Sample reports created:", reportData.length);

  console.log("\n🎉 Seed complete!");
  console.log("Admin login: admin@servicepulse.np / admin123");
  console.log("Citizen login: ram@example.com / citizen123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
