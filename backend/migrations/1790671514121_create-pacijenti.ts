import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('pacijenti', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    doktor_id: {
      type: 'uuid',
      notNull: true,
      references: 'firme',
      onDelete: 'CASCADE',
    },
    ime: { type: 'text', notNull: true },
    prezime: { type: 'text', notNull: true },
    datum_rodjenja: { type: 'date', notNull: true },
    pol: {
      type: 'text',
      notNull: true,
      check: "pol IN ('M', 'Z')",
    },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createIndex('pacijenti', 'doktor_id');
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('pacijenti');
}
