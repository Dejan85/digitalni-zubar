import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  // bez ove kolone ne bi moglo da se razlikuje ko je poslao zahtev (i sme da ga otkaze)
  // od onoga ko treba da odgovori (i sme da prihvati/odbije) — obe strane su vec u
  // doktor_id/proteticar_id, ali ne znamo koja je koja ulogu odigrala pri kreiranju
  pgm.addColumn('veze_doktor_proteticar', {
    posiljalac_id: {
      type: 'uuid',
      references: 'firme',
      onDelete: 'CASCADE',
    },
  });

  // postojece redove (ako ih ima) tretiramo kao da je doktor poslao zahtev — razumna
  // podrazumevana vrednost dok kolona postane NOT NULL
  pgm.sql('UPDATE veze_doktor_proteticar SET posiljalac_id = doktor_id WHERE posiljalac_id IS NULL');

  pgm.alterColumn('veze_doktor_proteticar', 'posiljalac_id', { notNull: true });

  // posiljalac mora biti jedna od dve strane veze — sprecava nekonzistentne podatke
  pgm.addConstraint(
    'veze_doktor_proteticar',
    'veze_doktor_proteticar_posiljalac_ucesnik',
    'CHECK (posiljalac_id = doktor_id OR posiljalac_id = proteticar_id)',
  );
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropConstraint('veze_doktor_proteticar', 'veze_doktor_proteticar_posiljalac_ucesnik');
  pgm.dropColumn('veze_doktor_proteticar', 'posiljalac_id');
}
