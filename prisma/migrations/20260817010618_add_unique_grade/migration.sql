/*
  Warnings:

  - A unique constraint covering the columns `[student_id,class_subject_id,score_type,assignment_id]` on the table `grades` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `grades_student_id_class_subject_id_score_type_assignment_id_key` ON `grades`(`student_id`, `class_subject_id`, `score_type`, `assignment_id`);
