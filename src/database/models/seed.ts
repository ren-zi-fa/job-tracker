import { sql } from "drizzle-orm";
import { seed } from "drizzle-seed";
import db from "../db";
import * as schema from "./schema";

const sources = ["LinkedIn", "Jobstreet", "Kalibrr", "Indeed"];

// 3 perusahaan wajib + 90 nama riset internet (Fortune Indonesia 100 2026
// & startup top Indonesia). Semua sudah diawali "PT " agar konsisten.
const baseCompanies = [
  "PT Google Indonesia",
  "PT Gojek",
  "PT Tokopedia",
  "PT Pertamina (Persero)",
  "PT Perusahaan Listrik Negara",
  "PT Bank Rakyat Indonesia",
  "PT Astra International",
  "PT Bank Mandiri",
  "PT MIND ID",
  "PT Telkom Indonesia",
  "PT Barito Pacific",
  "PT Sumber Alfaria Trijaya",
  "PT Bank Central Asia",
  "PT Indofood Sukses Makmur",
  "PT HM Sampoerna",
  "PT Bank Negara Indonesia",
  "PT Pupuk Indonesia",
  "PT Gudang Garam",
  "PT Sinar Mas Agro Resources & Technology",
  "PT Adaro Andalan Indonesia",
  "PT Erajaya Swasembada",
  "PT Charoen Pokphand Indonesia",
  "PT Japfa Comfeed Indonesia",
  "PT Bayan Resources",
  "PT Indosat Ooredoo Hutchison",
  "PT Garuda Indonesia",
  "PT Indah Kiat Pulp & Paper",
  "PT Dian Swastatika Sentosa",
  "PT AKR Corporindo",
  "PT Hartadinata Abadi",
  "PT Mitra Adiperkasa",
  "PT XLSMART Telecom Sejahtera",
  "PT Bank Tabungan Negara",
  "PT Medco Energi Internasional",
  "PT Mayora Indah",
  "PT Pindo Deli Pulp and Paper Mills",
  "PT Pelindo",
  "PT Sinar Mas Multiartha",
  "PT Kereta Api Indonesia",
  "PT Kalbe Farma",
  "PT Semen Indonesia",
  "PT Indika Energy",
  "PT Unilever Indonesia",
  "PT Merdeka Copper Gold",
  "PT Indo Tambangraya Megah",
  "PT Alamtri Resources Indonesia",
  "PT Bank Danamon Indonesia",
  "PT Amman Mineral Internasional",
  "PT Indomobil Sukses Internasional",
  "PT Jasa Marga",
  "PT Trimegah Bangun Persada",
  "PT InJourney",
  "PT Bank CIMB Niaga",
  "PT Bank SMBC Indonesia",
  "PT Metrodata Electronics",
  "PT Prudential Life Assurance",
  "PT Hutama Karya",
  "PT Buma International Group",
  "PT Bumi Resources",
  "PT Tunas Baru Lampung",
  "PT Harum Energy",
  "PT Global Digital Niaga",
  "PT Bank OCBC Indonesia",
  "PT Petrindo Jaya Kreasi",
  "PT Bank BJB",
  "PT Asuransi Allianz Life Indonesia",
  "PT FKS Multi Agro",
  "PT Elang Mahkota Teknologi",
  "PT Bank Permata",
  "PT Paninvest",
  "PT Indo-Rama Synthetics",
  "PT Indocement Tunggal Prakarsa",
  "PT Gajah Tunggal",
  "PT Catur Sentosa Adiprana",
  "PT ABM Investama",
  "PT Indolife Pensiontama",
  "PT Vale Indonesia",
  "PT Pabrik Kertas Tjiwi Kimia",
  "PT PP",
  "PT Mitra Pinasthika Mustika",
  "PT Krakatau Steel",
  "PT Asuransi Jiwa Manulife Indonesia",
  "PT Bank Maybank Indonesia",
  "PT Tembaga Mulia Semanan",
  "PT Medela Potentia",
  "PT Sawit Sumbermas Sarana",
  "PT MNC Asia Holding",
  "PT Tempo Scan Pacific",
  "PT Samudera Indonesia",
  "PT Daaz Bara Lestari",
  "PT Sarana Menara Nusantara",
  "PT Wijaya Karya",
  "PT Garudafood Putra Putri Jaya",
];

// Jaminan tidak ada nama duplikat (Set membuang duplikat bila ada).
const companies = [...new Set(baseCompanies)];

const positions = [
  "Software Engineer",
  "Product Manager",
  "Data Analyst",
  "UX Designer",
];
const locations = ["Jakarta", "Bandung", "Surabaya", "Remote"];
const statuses = ["Applied", "Interview", "Rejected"];

async function main() {
  if (companies.length !== 93) {
    throw new Error(`Expected 93 unique companies, got ${companies.length}`);
  }

  await seed(db, schema, { seed: 1 }).refine((f) => ({
    sourceTable: {
      count: sources.length,
      columns: {
        sourceName: f.valuesFromArray({ values: sources, isUnique: true }),
      },
      with: {
        jobListingsTable: 30,
      },
    },
    jobListingsTable: {
      columns: {
        company: f.valuesFromArray({ values: companies }),
        position: f.valuesFromArray({ values: positions }),
        companyLocation: f.valuesFromArray({ values: locations }),
        status: f.valuesFromArray({ values: statuses }),
        applicationDate: f.date({
          minDate: "2026-01-01",
          maxDate: "2026-09-28",
        }),
      },
    },
  }));

  // drizzle-seed menulis ID eksplisit sehingga sequence IDENTITY tertinggal
  // dari MAX(id) dan insert berikutnya gagal duplikat primary key. Resync.
  await db.execute(
    sql`SELECT setval('job_listings_id_seq', (SELECT COALESCE(MAX(id), 1) FROM job_listings))`,
  );
  await db.execute(
    sql`SELECT setval('source_id_seq', (SELECT COALESCE(MAX(id), 1) FROM source))`,
  );

  console.log("Seed data inserted successfully!");
}

main().catch(console.error);
