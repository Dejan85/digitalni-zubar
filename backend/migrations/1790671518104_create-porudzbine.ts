import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('porudzbine', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    // RESTRICT na doktor/proteticar/pacijent: istorija porudzbina se ne sme
    // tiho obrisati ako neko obrise firmu ili pacijenta koji su u njoj ucestvovali
    doktor_id: {
      type: 'uuid',
      notNull: true,
      references: 'firme',
      onDelete: 'RESTRICT',
    },
    proteticar_id: {
      type: 'uuid',
      notNull: true,
      references: 'firme',
      onDelete: 'RESTRICT',
    },
    pacijent_id: {
      type: 'uuid',
      notNull: true,
      references: 'pacijenti',
      onDelete: 'RESTRICT',
    },
    status: {
      type: 'text',
      notNull: true,
      default: 'primljena',
      check:
        "status IN ('primljena', 'potvrdjena', 'u_izradi', 'poslata', 'isporucena', 'otkazana', 'odbijena', 'vracena_na_doradu')",
    },
    // upisuje protetičar prilikom potvrđivanja porudžbine — nema ga jos pri kreiranju
    rok_isporuke: { type: 'date' },
    datum_kreiranja: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createIndex('porudzbine', 'doktor_id');
  pgm.createIndex('porudzbine', 'proteticar_id');
  pgm.createIndex('porudzbine', 'pacijent_id');
  pgm.createIndex('porudzbine', 'status');
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('porudzbine');
}
