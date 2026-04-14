-- Align student_transport_enrollments.student_id to students.id
--
-- This project does not currently use Alembic, so this SQL script is intended
-- to be run manually against existing PostgreSQL databases.
--
-- Safety behavior:
-- - The script aborts if student_transport_enrollments contains student_id values
--   that do not exist in students.id, because those rows cannot be mapped safely.
-- - It then replaces any existing FK(s) on student_transport_enrollments.student_id
--   with a single FK to students(id).

BEGIN;

DO $$
DECLARE
    invalid_count integer;
    fk record;
BEGIN
    -- Abort if enrollment rows reference IDs that are not present in students.
    SELECT COUNT(*)
    INTO invalid_count
    FROM student_transport_enrollments ste
    LEFT JOIN students s ON s.id = ste.student_id
    WHERE s.id IS NULL;

    IF invalid_count > 0 THEN
        RAISE EXCEPTION USING
            MESSAGE = format(
                'Migration aborted: %s student_transport_enrollments row(s) reference non-existent students.id values.',
                invalid_count
            ),
            HINT = 'Backfill/migrate student IDs before running this script.';
    END IF;

    -- Drop all FK constraints currently attached to student_id on this table.
    FOR fk IN
        SELECT c.conname
        FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        JOIN pg_namespace n ON n.oid = t.relnamespace
        JOIN unnest(c.conkey) WITH ORDINALITY AS ck(attnum, ord) ON TRUE
        JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ck.attnum
        WHERE c.contype = 'f'
          AND n.nspname = current_schema()
          AND t.relname = 'student_transport_enrollments'
          AND a.attname = 'student_id'
    LOOP
        EXECUTE format(
            'ALTER TABLE student_transport_enrollments DROP CONSTRAINT %I',
            fk.conname
        );
    END LOOP;
END $$;

ALTER TABLE student_transport_enrollments
    ADD CONSTRAINT fk_student_transport_enrollments_student_id_students
    FOREIGN KEY (student_id)
    REFERENCES students(id)
    ON DELETE CASCADE;

COMMIT;
