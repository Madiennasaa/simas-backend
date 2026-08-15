const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seeding database...');

  // 1. Hash Password Default (misal: "password123")
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 2. Seed Academic Year
  const academicYear = await prisma.academicYear.create({
    data: {
      year: '2025/2026',
      semester: 'odd',
      isActive: true,
    },
  });
  console.log('✅ Academic Year created');

  // 3. Seed Admin
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      password: hashedPassword,
      name: 'Administrator Utama',
      role: 'admin',
      phoneNumber: '081234567890',
    },
  });
  console.log('✅ Admin user created (username: admin, pass: password123)');

  // 4. Seed Teacher
  const teacherUser = await prisma.user.create({
    data: {
      username: 'guru1',
      password: hashedPassword,
      name: 'Budi Santoso, S.Pd.',
      role: 'teacher',
      phoneNumber: '081299998888',
      teacher: {
        create: {
          nip: '198501012010011001',
          teacherType: 'homeroom',
        },
      },
    },
  });
  console.log('✅ Teacher user created (username: guru1, pass: password123)');

  // 5. Seed Class (Kelas 1-A dengan Wali Kelas Pak Budi)
  const teacherDetail = await prisma.teacher.findUnique({
    where: { userId: teacherUser.id },
  });

  const class1A = await prisma.class.create({
    data: {
      className: '1-A',
      gradeLevel: 1,
      phase: 'A',
      homeroomTeacherId: teacherDetail.id,
    },
  });
  console.log('✅ Class 1-A created');

  // 6. Seed Student
  const studentUser = await prisma.user.create({
    data: {
      username: 'siswa1',
      password: hashedPassword,
      name: 'Ahmad Sukorame',
      role: 'student',
      phoneNumber: '081377776666',
      student: {
        create: {
          nisn: '0012345678',
          classId: class1A.id,
        },
      },
    },
  });
  console.log('✅ Student user created (username: siswa1, pass: password123)');

  console.log('🎉 Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });