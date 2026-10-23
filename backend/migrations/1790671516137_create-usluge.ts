import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('usluge', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    proteticar_id: {
      type: 'uuid',
      notNull: true,
      references: 'firme',
      onDelete: 'CASCADE',
    },
    naziv: { type: 'text', notNull: true },
    cena: { type: 'numeric(10,2)', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createIndex('usluge', 'proteticar_id');
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('usluge');
}
