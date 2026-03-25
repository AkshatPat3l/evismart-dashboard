import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const mockClients = [
  {
    id: "c1",
    name: "Downtown Dental Studio",
    dentist: "Dr. Michael Chen",
    cases: 24,
    status: "Active",
    location: "New York, NY",
  },
  {
    id: "c2",
    name: "Smile Care Orthodontics",
    dentist: "Dr. Sarah Smith",
    cases: 18,
    status: "Active",
    location: "Brooklyn, NY",
  },
  {
    id: "c3",
    name: "Westside Implant Center",
    dentist: "Dr. James Wilson",
    cases: 12,
    status: "Active",
    location: "Newark, NJ",
  },
];

const mockCases = [
  {
    id: "CAS-10492",
    patient: "John Doe",
    client: mockClients[0],
    type: "Crown & Bridge",
    status: "Processing",
    date: "Oct 24, 2026",
  },
  {
    id: "CAS-10491",
    patient: "Emma Collins",
    client: mockClients[1],
    type: "Aligners",
    status: "Review",
    date: "Oct 23, 2026",
  },
  {
    id: "CAS-10490",
    patient: "Michael Chang",
    client: mockClients[2],
    type: "Implant",
    status: "Completed",
    date: "Oct 22, 2026",
  },
];

import * as bcrypt from "bcryptjs";

async function main() {
  console.log("Seeding database...");

  const hashedPassword = await bcrypt.hash("password123", 10);

  await prisma.user.upsert({
    where: { email: "tester@evismart.com" },
    update: {
      password: hashedPassword,
    },
    create: {
      id: "u1",
      email: "tester@evismart.com",
      password: hashedPassword,
      name: "Dr. Sarah Chen",
      role: "Lab Director",
      labId: "lab-1",
    },
  });

  for (const c of mockClients) {
    await prisma.clientClinic.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        name: c.name,
        dentist: c.dentist,
        cases: c.cases,
        location: c.location,
        status: c.status,
      },
    });
  }

  for (const caseObj of mockCases) {
    await prisma.case.upsert({
      where: { id: caseObj.id },
      update: {},
      create: {
        id: caseObj.id,
        patient: caseObj.patient,
        clientId: caseObj.client.id,
        type: caseObj.type,
        status: caseObj.status,
        date: caseObj.date,
        createdAt: new Date(),
      },
    });
  }

  // Generate 25 random invoices and corresponding payments
  console.log("Generating random invoices and payments...");

  const statuses = ["Draft", "Pending", "Paid", "Overdue"];
  const descriptions = [
    "Crown & Bridge",
    "Aligners treatment",
    "Implant procedure",
    "Monthly retainer",
    "Quarterly supplies",
    "Veneers full arch",
    "Emergency repair",
    "Consultation fee",
    "3D Printing models",
    "Nightguard fabrication",
  ];

  const now = new Date();

  for (let i = 1; i <= 25; i++) {
    const isPaid = Math.random() > 0.4;
    const isOverdue = !isPaid && Math.random() > 0.7;
    const isFailed = !isPaid && !isOverdue && Math.random() > 0.7;

    const status = isPaid
      ? "Paid"
      : isOverdue
        ? "Overdue"
        : isFailed
          ? "Pending"
          : "Pending";

    // Random dates within last 6 months
    const issueDateObj = new Date(
      now.getTime() - Math.random() * 180 * 24 * 60 * 60 * 1000,
    );
    const dueDateObj = new Date(
      issueDateObj.getTime() + 30 * 24 * 60 * 60 * 1000,
    );
    const paidDateObj = isPaid
      ? new Date(
          dueDateObj.getTime() - Math.random() * 20 * 24 * 60 * 60 * 1000,
        )
      : null;

    const client = mockClients[Math.floor(Math.random() * mockClients.length)];
    const caseObj =
      Math.random() > 0.3
        ? mockCases[Math.floor(Math.random() * mockCases.length)]
        : null;

    const amount = Math.floor(Math.random() * 4000) + 500;
    const tax = amount * 0.08;

    const invoiceId = `inv_rand_${i}`;

    const inv = await prisma.invoice.upsert({
      where: { id: invoiceId },
      update: {},
      create: {
        id: invoiceId,
        number: `INV-2026-${String(100 + i).padStart(3, "0")}`,
        caseId: caseObj?.id || null,
        clientId: client.id,
        amount,
        tax,
        total: amount + tax,
        status,
        issueDate: issueDateObj.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        dueDate: dueDateObj.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        paidDate: paidDateObj?.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        description:
          descriptions[Math.floor(Math.random() * descriptions.length)],
        createdAt: issueDateObj,
      },
    });

    // Create corresponding payment logs
    if (isPaid) {
      await prisma.payment.create({
        data: {
          invoiceId: inv.id,
          clientId: client.id,
          caseId: caseObj?.id || null,
          amount: inv.total,
          status: "Succeeded",
          method: Math.random() > 0.2 ? "Card" : "Bank Transfer",
          processedAt: paidDateObj || new Date(),
        },
      });
    } else if (isFailed) {
      // 1-3 failed attempts
      const attempts = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < attempts; j++) {
        await prisma.payment.create({
          data: {
            invoiceId: inv.id,
            clientId: client.id,
            caseId: caseObj?.id || null,
            amount: inv.total,
            status: "Failed",
            method: "Card",
            failureReason: [
              "Insufficient Funds",
              "Card Expired",
              "Bank Declined",
              "Fraud Suspected",
            ][Math.floor(Math.random() * 4)],
            processedAt: new Date(
              dueDateObj.getTime() - j * 2 * 24 * 60 * 60 * 1000,
            ),
          },
        });
      }
    }
  }

  console.log("Database seeded successfully with random data!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
