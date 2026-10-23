import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('beleske', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    // oba nullable — beleska moze biti vezana za porudzbinu, pacijenta, ili oboje
    porudzbina_id: {
      type: 'uuid',
      references: 'porudzbine',
      onDelete: 'CASCADE',
    },
    pacijent_id: {
      type: 'uuid',
      references: 'pacijenti',
      onDelete: 'CASCADE',
    },
    tip: {
      type: 'text',
      notNull: true,
      check: "tip IN ('rucna', 'automatska')",
    },
    datum: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    tekst: { type: 'text', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // beleska mora biti vezana za bar jedno od dvoje
  pgm.addConstraint(
    'beleske',
    'beleske_porudzbina_ili_pacijent',
    'CHECK (porudzbina_id IS NOT NULL OR pacijent_id IS NOT NULL)',
  );
  pgm.createIndex('beleske', 'porudzbina_id');
  pgm.createIndex('beleske', 'pacijent_id');
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('beleske');
}
