import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

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
      update: {},
      create: {
        id: "badge-first",
        name: "First Report",
        nameNp: "पहिलो रिपोर्ट",
        description: "Submitted your first report",
        icon: "🏅",
        condition: "Submit 1 report",
      },
    }),
    prisma.badge.upsert({
      where: { id: "badge-5" },
      update: {},
      create: {
        id: "badge-5",
        name: "5 Reports",
        nameNp: "५ रिपोर्ट",
        description: "Submitted 5 reports",
        icon: "🥈",
        condition: "Submit 5 reports",
      },
    }),
    prisma.badge.upsert({
      where: { id: "badge-10" },
      update: {},
      create: {
        id: "badge-10",
        name: "10 Reports",
        nameNp: "१० रिपोर्ट",
        description: "Submitted 10 reports",
        icon: "🥇",
        condition: "Submit 10 reports",
      },
    }),
    prisma.badge.upsert({
      where: { id: "badge-25" },
      update: {},
      create: {
        id: "badge-25",
        name: "25 Reports",
        nameNp: "२५ रिपोर्ट",
        description: "Submitted 25 reports",
        icon: "🏆",
        condition: "Submit 25 reports",
      },
    }),
    prisma.badge.upsert({
      where: { id: "badge-slow" },
      update: {},
      create: {
        id: "badge-slow",
        name: "Slow Spotter",
        nameNp: "ढिलो पहिचानकर्ता",
        description: "Reported 3+ services taking over 60 minutes",
        icon: "🐢",
        condition: "Report 3 services with > 60 min wait time",
      },
    }),
  ]);
  console.log("✅ Badges created:", badges.length);

  // Constituencies
  const constituencies = await Promise.all([
    prisma.constituency.upsert({
      where: { id: "const-kathmandu-1" },
      update: {},
      create: {
        id: "const-kathmandu-1",
        name: "Kathmandu-1",
        nameNp: "काठमाडौं-१",
        province: "Bagmati Province",
        description: "Central Kathmandu constituency",
        imageUrl: "https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=400",
      },
    }),
    prisma.constituency.upsert({
      where: { id: "const-lalitpur-1" },
      update: {},
      create: {
        id: "const-lalitpur-1",
        name: "Lalitpur-1",
        nameNp: "ललितपुर-१",
        province: "Bagmati Province",
        description: "Lalitpur Metropolitan City constituency",
        imageUrl: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400",
      },
    }),
    prisma.constituency.upsert({
      where: { id: "const-pokhara-1" },
      update: {},
      create: {
        id: "const-pokhara-1",
        name: "Pokhara-1",
        nameNp: "पोखरा-१",
        province: "Gandaki Province",
        description: "Pokhara Metropolitan City constituency",
        imageUrl: "https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=400",
      },
    }),
    prisma.constituency.upsert({
      where: { id: "const-biratnagar-1" },
      update: {},
      create: {
        id: "const-biratnagar-1",
        name: "Biratnagar-1",
        nameNp: "विराटनगर-१",
        province: "Koshi Province",
        description: "Biratnagar Metropolitan City constituency",
        imageUrl: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400",
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
    { publicServiceId: "svc-bir", constituencyId: "const-kathmandu-1", serviceTimeMinutes: 45, rating: 3, comment: "Average experience.", userId: citizen.id },
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
