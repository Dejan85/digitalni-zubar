import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('otisci', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    porudzbina_id: {
      type: 'uuid',
      notNull: true,
      references: 'porudzbine',
      onDelete: 'CASCADE',
    },
    tip: {
      type: 'text',
      notNull: true,
      check: "tip IN ('digitalni', 'analogni')",
    },
    // fajl_path samo za digitalni otisak (upload), napomena uglavnom za analogni
    fajl_path: { type: 'text' },
    napomena: { type: 'text' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createIndex('otisci', 'porudzbina_id');
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('otisci');
}
