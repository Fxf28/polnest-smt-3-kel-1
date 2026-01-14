import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import { Role, SubmissionStatus } from "../generated/prisma/client";

async function main() {
  console.log("🌱 Seeding database...");

  // =========================
  // CLEAN DATABASE (DEV ONLY)
  // =========================
  await prisma.attachment.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.newsItem.deleteMany();
  await prisma.user.deleteMany();

  // =========================
  // CREATE USERS
  // =========================
  const adminPassword = await bcrypt.hash("admin123", 10);
  const userPassword = await bcrypt.hash("user123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Admin Kelurahan",
      email: "admin@kelurahan.id",
      password: adminPassword,
      phone: "081234567890",
      address: "Kantor Kelurahan",
      role: Role.ADMIN,
    },
  });

  const user = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "john@example.com",
      password: userPassword,
      phone: "081234567891",
      address: "Jl. Contoh No. 123",
      role: Role.USER,
    },
  });

  console.log("✅ Users created:", {
    adminId: admin.id,
    userId: user.id,
  });

  // =========================
  // CREATE SUBMISSIONS
  // =========================
  const submission1 = await prisma.submission.create({
    data: {
      userId: user.id,
      serviceType: "KTP",
      description: "Pembuatan KTP Baru",
      status: SubmissionStatus.APPROVED,
      submittedAt: new Date("2025-12-20"),
      completedAt: new Date("2025-12-25"),
      documentUrl: "https://example.com/ktp-john.pdf",
      attachments: {
        create: [{ url: "https://example.com/attachments/ktp-front.jpg" }, { url: "https://example.com/attachments/ktp-back.jpg" }],
      },
    },
  });

  const submission2 = await prisma.submission.create({
    data: {
      userId: user.id,
      serviceType: "KK",
      description: "Perubahan Data Kartu Keluarga",
      status: SubmissionStatus.PROCESSING,
      submittedAt: new Date("2026-01-02"),
    },
  });

  console.log("✅ Submissions created:", [submission1.id, submission2.id]);

  // =========================
  // CREATE NEWS
  // =========================
  const news = await prisma.newsItem.createMany({
    data: [
      {
        title: "Pelayanan Administrasi Kini Lebih Cepat",
        image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
        description: "Proses administrasi kini dipercepat dengan sistem digital.",
        date: new Date("2026-01-03"),
      },
      {
        title: "Pendaftaran Online Sudah Dibuka",
        image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800",
        description: "Masyarakat dapat mengajukan permohonan secara online.",
        date: new Date("2026-01-02"),
      },
      {
        title: "Jam Operasional Baru Kelurahan",
        image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800",
        description: "Kelurahan kini buka Senin–Jumat pukul 08:00–16:00.",
        date: new Date("2026-01-01"),
      },
    ],
  });

  console.log("✅ News items created:", news.count);

  console.log("🎉 Seeding finished successfully!");
}

main()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
