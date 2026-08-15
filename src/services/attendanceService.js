const prisma = require("../config/db");

// Guru input absensi untuk satu class_subject di tanggal tertentu.
// Dikirim sekaligus per kelas (array siswa), bukan satu-satu, biar hemat request dari Flutter.
async function bulkCreate(classSubjectId, date, records) {
  if (!records || records.length === 0) {
    const err = new Error("Data absensi tidak boleh kosong");
    err.statusCode = 400;
    throw err;
  }

  const classSubject = await prisma.classSubject.findUnique({
    where: { id: classSubjectId },
    include: { academicYear: true },
  });

  if (!classSubject) {
    const err = new Error("Kelas/mapel tidak ditemukan");
    err.statusCode = 404;
    throw err;
  }

  if (classSubject.academicYear.isLocked) {
    const err = new Error("Semester ini sudah dikunci, tidak bisa input absensi baru");
    err.statusCode = 403;
    throw err;
  }

  // Validasi siswa
  const validStudents = await prisma.student.findMany({
    where: { classId: classSubject.classId },
    select: { id: true },
  });
  const validStudentIds = new Set(validStudents.map((s) => s.id));

  const invalidIds = records
    .map((r) => r.studentId)
    .filter((id) => !validStudentIds.has(id));

  if (invalidIds.length > 0) {
    const err = new Error(
      `Siswa dengan ID ${invalidIds.join(", ")} bukan bagian dari kelas ini`
    );
    err.statusCode = 422;
    throw err;
  }

  // Bikin ISO Date konsisten tanpa pergeseran Timezone
  const attendanceDate = new Date(`${date}T00:00:00.000Z`);

  // Upsert dengan $transaction
  const results = await prisma.$transaction(
    records.map((r) =>
      prisma.attendance.upsert({
        where: {
          unique_attendance_per_day: {
            studentId: r.studentId,
            classSubjectId,
            date: attendanceDate,
          },
        },
        update: {
          status: r.status,
          note: r.note || null,
          proofUrl: r.proofUrl || null,
        },
        create: {
          studentId: r.studentId,
          classSubjectId,
          date: attendanceDate,
          status: r.status,
          note: r.note || null,
          proofUrl: r.proofUrl || null,
        },
      })
    )
  );

  return results;
}

// Dipakai siswa: lihat absensi diri sendiri
async function findByStudent(studentId, academicYearId) {
  return prisma.attendance.findMany({
    where: {
      studentId,
      classSubject: { academicYearId },
    },
    include: {
      classSubject: { include: { subject: true } },
    },
    orderBy: { date: "desc" },
  });
}

// Dipakai wali murid: lihat absensi anak (cek dulu relasi parent_students di controller)
async function findByStudentForParent(studentId, academicYearId) {
  return findByStudent(studentId, academicYearId);
}

// Dipakai guru: lihat rekap absensi kelas yang diajar pada tanggal tertentu
async function findByClassSubjectAndDate(classSubjectId, date) {
  return prisma.attendance.findMany({
    where: {
      classSubjectId,
      date: new Date(date),
    },
    include: {
      student: { include: { user: true } },
    },
  });
}

// Dipakai kepala sekolah: rekap persentase kehadiran per kelas untuk monitoring
async function summaryByClass(classId, academicYearId) {
  const attendances = await prisma.attendance.findMany({
    where: {
      classSubject: { classId, academicYearId },
    },
    select: { status: true },
  });

  const total = attendances.length;
  const counts = { hadir: 0, sakit: 0, izin: 0, alpha: 0 };
  attendances.forEach((a) => counts[a.status]++);

  return {
    total,
    ...counts,
    persentaseHadir: total > 0 ? ((counts.hadir / total) * 100).toFixed(2) : "0.00",
  };
}

module.exports = {
  bulkCreate,
  findByStudent,
  findByStudentForParent,
  findByClassSubjectAndDate,
  summaryByClass,
};
