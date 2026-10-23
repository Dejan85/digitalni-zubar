import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('korisnici', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    firma_id: {
      type: 'uuid',
      notNull: true,
      references: 'firme',
      onDelete: 'CASCADE',
    },
    email: { type: 'text', notNull: true },
    password_hash: { type: 'text', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // email je login identifikator, mora biti jedinstven u celoj aplikaciji
  pgm.addConstraint('korisnici', 'korisnici_email_unique', 'UNIQUE(email)');
  pgm.createIndex('korisnici', 'firma_id');
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('korisnici');
}
