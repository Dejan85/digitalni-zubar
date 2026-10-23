import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('doktor_specijalizacije', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    // jedan-na-jedan sa firmom (unique ispod) — cisto informativno polje, ne utice na logiku
    firma_id: {
      type: 'uuid',
      notNull: true,
      references: 'firme',
      onDelete: 'CASCADE',
    },
    naziv: { type: 'text', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.addConstraint('doktor_specijalizacije', 'doktor_specijalizacije_firma_id_unique', 'UNIQUE(firma_id)');
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('doktor_specijalizacije');
}
