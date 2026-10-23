import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  // omogucava gen_random_uuid() za UUID primarne kljuceve u kasnijim migracijama
  pgm.createExtension("pgcrypto", { ifNotExists: true });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropExtension("pgcrypto");
}
