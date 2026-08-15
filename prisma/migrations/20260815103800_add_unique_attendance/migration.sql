/*
  Warnings:

  - A unique constraint covering the columns `[student_id,class_subject_id,date]` on the table `attendances` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `attendances_student_id_class_subject_id_date_key` ON `attendances`(`student_id`, `class_subject_id`, `date`);
