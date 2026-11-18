// Seeds the ServiceCategory + Skill taxonomy. Idempotent: safe to re-run.
// Usage: npm run db:seed
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

interface SeedSkill {
  name: string;
}

interface SeedCategory {
  name: string;
  slug: string;
  description: string;
  skills: SeedSkill[];
}

const categories: SeedCategory[] = [
  {
    name: "Plumbing",
    slug: "plumbing",
    description:
      "Leaking taps, blocked drains, pipe fitting, water heater installation and repairs.",
    skills: [
      { name: "Tap & faucet repair" },
      { name: "Drain unblocking" },
      { name: "Pipe installation" },
      { name: "Water heater service" },
      { name: "Toilet repair" },
    ],
  },
  {
    name: "Electrical",
    slug: "electrical",
    description:
      "Wiring, switchboard repairs, fan and light installation, inverter setup.",
    skills: [
      { name: "House wiring" },
      { name: "Switchboard repair" },
      { name: "Light & fan installation" },
      { name: "Inverter installation" },
      { name: "Short-circuit diagnosis" },
    ],
  },
  {
    name: "Appliance Repair",
    slug: "appliance-repair",
    description:
      "Repair and servicing of refrigerators, washing machines, microwaves and chimneys.",
    skills: [
      { name: "Refrigerator repair" },
      { name: "Washing machine repair" },
      { name: "Microwave repair" },
      { name: "Chimney service" },
      { name: "Water purifier service" },
    ],
  },
  {
    name: "AC & Refrigeration",
    slug: "ac-refrigeration",
    description:
      "Air conditioner installation, gas refill, servicing and deep cleaning.",
    skills: [
      { name: "AC installation" },
      { name: "AC servicing & cleaning" },
      { name: "Gas refill" },
      { name: "AC gas leak repair" },
    ],
  },
  {
    name: "Carpentry",
    slug: "carpentry",
    description:
      "Furniture repair, door and lock fitting, modular work and woodwork.",
    skills: [
      { name: "Furniture repair" },
      { name: "Door & lock fitting" },
      { name: "Modular kitchen work" },
      { name: "Custom woodwork" },
    ],
  },
  {
    name: "Painting",
    slug: "painting",
    description:
      "Interior and exterior painting, putty work, texture finishes and waterproofing.",
    skills: [
      { name: "Interior painting" },
      { name: "Exterior painting" },
      { name: "Putty & primer work" },
      { name: "Texture finish" },
      { name: "Waterproofing" },
    ],
  },
  {
    name: "Cleaning",
    slug: "cleaning",
    description:
      "Deep home cleaning, bathroom and kitchen cleaning, sofa and carpet cleaning.",
    skills: [
      { name: "Full home deep cleaning" },
      { name: "Bathroom cleaning" },
      { name: "Kitchen cleaning" },
      { name: "Sofa & carpet cleaning" },
      { name: "Water tank cleaning" },
    ],
  },
  {
    name: "Pest Control",
    slug: "pest-control",
    description:
      "Cockroach, termite, mosquito and general pest treatment for homes.",
    skills: [
      { name: "Cockroach treatment" },
      { name: "Termite treatment" },
      { name: "Mosquito treatment" },
      { name: "General pest control" },
    ],
  },
  {
    name: "Home Moving & Packing",
    slug: "home-moving",
    description:
      "House shifting, packing, loading and transport coordination.",
    skills: [
      { name: "House shifting" },
      { name: "Packing & unpacking" },
      { name: "Loading & unloading" },
    ],
  },
  {
    name: "Computer & Network",
    slug: "computer-network",
    description:
      "Laptop and desktop repair, software setup, Wi-Fi and networking support.",
    skills: [
      { name: "Laptop repair" },
      { name: "Desktop assembly & repair" },
      { name: "Software installation" },
      { name: "Wi-Fi setup" },
      { name: "Printer setup" },
    ],
  },
  {
    name: "Tutoring",
    slug: "tutoring",
    description:
      "Home and online tutoring for school subjects, exam prep and languages.",
    skills: [
      { name: "Mathematics" },
      { name: "Science" },
      { name: "English" },
      { name: "Exam preparation" },
    ],
  },
  {
    name: "Beauty & Wellness",
    slug: "beauty-wellness",
    description:
      "At-home salon services for women and men, grooming and wellness treatments.",
    skills: [
      { name: "At-home salon" },
      { name: "Hair styling" },
      { name: "Massage therapy" },
      { name: "Grooming" },
    ],
  },
  {
    name: "General Diagnosis",
    slug: "general-diagnosis",
    description:
      "Unclassified issues that need an on-site diagnosis before a trade can be confirmed.",
    skills: [{ name: "On-site diagnosis" }],
  },
  {
    name: "Vehicle & Roadside Assistance",
    slug: "vehicle-roadside",
    description:
      "Roadside breakdowns, battery, tyre and on-site vehicle repair support.",
    skills: [
      { name: "Battery jump start" },
      { name: "Flat tyre assistance" },
      { name: "Roadside diagnostics" },
    ],
  },
  {
    name: "Commercial Facility Maintenance",
    slug: "commercial-facility",
    description:
      "Scheduled and emergency maintenance for offices, shops and commercial premises.",
    skills: [
      { name: "Facility inspection" },
      { name: "Commercial electrical maintenance" },
      { name: "Commercial plumbing maintenance" },
    ],
  },
];

async function main() {
  console.log("Seeding service categories and skills...");

  for (const category of categories) {
    const record = await prisma.serviceCategory.upsert({
      where: { slug: category.slug },
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description,
      },
      update: {
        name: category.name,
        description: category.description,
        isActive: true,
      },
    });

    for (const skill of category.skills) {
      await prisma.skill.upsert({
        where: {
          categoryId_name: { categoryId: record.id, name: skill.name },
        },
        create: { categoryId: record.id, name: skill.name },
        update: {},
      });
    }

    console.log(`  ✓ ${category.name} (${category.skills.length} skills)`);
  }

  console.log(
    `Done. ${categories.length} categories ensured.`,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Seed failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
