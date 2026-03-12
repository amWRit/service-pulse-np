const SERVICE_TYPE_DATA = [
  { id: "st-hospital", slug: "hospital", name: "Hospital", nameNp: "अस्पताल", icon: "🏥" },
  { id: "st-govt", slug: "government_office", name: "Government Office", nameNp: "सरकारी कार्यालय", icon: "🏛️" },
  { id: "st-transport", slug: "transport", name: "Transport", nameNp: "यातायात", icon: "🚌" },
  { id: "st-education", slug: "education", name: "Education", nameNp: "शिक्षा", icon: "🎓" },
  { id: "st-utility", slug: "utility", name: "Utility", nameNp: "उपयोगिता", icon: "⚡" },
  { id: "st-police", slug: "police", name: "Police", nameNp: "प्रहरी", icon: "👮" },
  { id: "st-bank", slug: "bank", name: "Bank", nameNp: "बैंक", icon: "🏦" },
  { id: "st-other", slug: "other", name: "Other", nameNp: "अन्य", icon: "🏢" },
];

export async function seedServiceTypes(prisma) {
  for (const serviceType of SERVICE_TYPE_DATA) {
    await prisma.serviceType.upsert({
      where: { slug: serviceType.slug },
      update: { name: serviceType.name, nameNp: serviceType.nameNp, icon: serviceType.icon },
      create: serviceType,
    });
  }

  console.log(`✅ Service types (${SERVICE_TYPE_DATA.length}) created`);
}
