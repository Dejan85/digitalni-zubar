import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  // super admin (vlasnik aplikacije) cita podatke svih firmi; flag se postavlja iskljucivo van API-ja
  // (npm run make-admin -- <email>), nikad kroz register/PATCH rute, pa podrazumevano nije niko
  pgm.addColumn('korisnici', {
    is_super_admin: { type: 'boolean', notNull: true, default: false },
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropColumn('korisnici', 'is_super_admin');
}
