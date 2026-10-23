import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('stavke_porudzbine', {
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
    // nullable: stavka moze biti iz kataloga (usluga_id) ILI slobodan opis, vidi check ispod
    usluga_id: {
      type: 'uuid',
      references: 'usluge',
      onDelete: 'SET NULL',
    },
    slobodan_opis: { type: 'text' },
    kolicina: { type: 'integer', notNull: true, default: 1 },
    // cena zabelezena u trenutku narucivanja — ne prati kasnije izmene cenovnika usluge
    cena_u_trenutku: { type: 'numeric(10,2)', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // stavka mora imati bar jedno od dvoje: referencu na katalog ili slobodan opis
  pgm.addConstraint(
    'stavke_porudzbine',
    'stavke_porudzbine_usluga_ili_opis',
    'CHECK (usluga_id IS NOT NULL OR slobodan_opis IS NOT NULL)',
  );
  pgm.createIndex('stavke_porudzbine', 'porudzbina_id');
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('stavke_porudzbine');
}
