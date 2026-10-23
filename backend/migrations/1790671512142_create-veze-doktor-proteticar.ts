import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('veze_doktor_proteticar', {
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
    proteticar_id: {
      type: 'uuid',
      notNull: true,
      references: 'firme',
      onDelete: 'CASCADE',
    },
    status: {
      type: 'text',
      notNull: true,
      default: 'na_cekanju',
      check: "status IN ('na_cekanju', 'prihvaceno', 'odbijeno')",
    },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // isti par doktor/protetičar ne moze imati vise od jednog zahteva/veze
  pgm.addConstraint(
    'veze_doktor_proteticar',
    'veze_doktor_proteticar_par_unique',
    'UNIQUE(doktor_id, proteticar_id)',
  );
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('veze_doktor_proteticar');
}
