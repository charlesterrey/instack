/**
 * 10 varied Excel test fixtures for schema inference validation.
 * @CONDUIT — each fixture represents a realistic enterprise dataset.
 *
 * Format: JSON representation of ExcelSheet (headers + rows).
 * Used by infer-schema integration tests to validate >90% accuracy.
 */

import type { ExcelSheet } from '@instack/ai-pipeline';

/** Fixture 1: French contacts (Nom, Prenom, Email, Telephone) */
export const FIXTURE_FR_CONTACTS: ExcelSheet = {
  sheetName: 'Contacts',
  headers: ['Nom', 'Prenom', 'Email', 'Telephone', 'Date Naissance', 'Ville'],
  rows: [
    { Nom: 'Dupont', Prenom: 'Marie', Email: 'marie.dupont@leroymerlin.fr', Telephone: '06 12 34 56 78', 'Date Naissance': '15/03/1985', Ville: 'Paris' },
    { Nom: 'Martin', Prenom: 'Pierre', Email: 'pierre.martin@bonduelle.com', Telephone: '+33 6 98 76 54 32', 'Date Naissance': '22/11/1990', Ville: 'Lyon' },
    { Nom: 'Rousseau', Prenom: 'Clara', Email: 'clara.rousseau@descamps.fr', Telephone: '07 45 67 89 01', 'Date Naissance': '08/07/1978', Ville: 'Lille' },
    { Nom: 'Benali', Prenom: 'Mehdi', Email: 'mehdi.benali@bonduelle.com', Telephone: '06 23 45 67 89', 'Date Naissance': '01/12/1988', Ville: 'Marseille' },
    { Nom: 'Garnier', Prenom: 'Philippe', Email: 'philippe.garnier@fournier.fr', Telephone: '+33 6 11 22 33 44', 'Date Naissance': '30/06/1972', Ville: 'Bordeaux' },
  ],
  totalRows: 5,
};
export const FIXTURE_FR_CONTACTS_EXPECTED = {
  email: ['email'],
  telephone: ['phone'],
  date_naissance: ['date'],
  nom: ['text'],
  prenom: ['text'],
  ville: ['text'],
};

/** Fixture 2: Sales data with currency */
export const FIXTURE_SALES: ExcelSheet = {
  sheetName: 'Ventes',
  headers: ['Date', 'Commercial', 'Client', 'Montant HT', 'TVA', 'Montant TTC', 'Statut', 'Region'],
  rows: [
    { Date: '2024-01-15', Commercial: 'Alice Durand', Client: 'Acme Corp', 'Montant HT': 15000, TVA: 3000, 'Montant TTC': 18000, Statut: 'Facture', Region: 'IDF' },
    { Date: '2024-01-18', Commercial: 'Bob Martin', Client: 'Beta SA', 'Montant HT': 8500, TVA: 1700, 'Montant TTC': 10200, Statut: 'Devis', Region: 'PACA' },
    { Date: '2024-02-03', Commercial: 'Alice Durand', Client: 'Gamma SAS', 'Montant HT': 22000, TVA: 4400, 'Montant TTC': 26400, Statut: 'Facture', Region: 'IDF' },
    { Date: '2024-02-10', Commercial: 'Claire Petit', Client: 'Delta SARL', 'Montant HT': 5000, TVA: 1000, 'Montant TTC': 6000, Statut: 'Devis', Region: 'Bretagne' },
    { Date: '2024-03-01', Commercial: 'Bob Martin', Client: 'Acme Corp', 'Montant HT': 12000, TVA: 2400, 'Montant TTC': 14400, Statut: 'Paye', Region: 'PACA' },
    { Date: '2024-03-10', Commercial: 'Alice Durand', Client: 'Epsilon SAS', 'Montant HT': 9500, TVA: 1900, 'Montant TTC': 11400, Statut: 'Facture', Region: 'IDF' },
    { Date: '2024-03-15', Commercial: 'Claire Petit', Client: 'Zeta SARL', 'Montant HT': 7200, TVA: 1440, 'Montant TTC': 8640, Statut: 'Devis', Region: 'Bretagne' },
    { Date: '2024-04-01', Commercial: 'Bob Martin', Client: 'Eta SA', 'Montant HT': 18000, TVA: 3600, 'Montant TTC': 21600, Statut: 'Facture', Region: 'PACA' },
    { Date: '2024-04-08', Commercial: 'Alice Durand', Client: 'Theta SAS', 'Montant HT': 6000, TVA: 1200, 'Montant TTC': 7200, Statut: 'Paye', Region: 'IDF' },
    { Date: '2024-04-15', Commercial: 'Claire Petit', Client: 'Iota SARL', 'Montant HT': 11000, TVA: 2200, 'Montant TTC': 13200, Statut: 'Devis', Region: 'Bretagne' },
    { Date: '2024-05-01', Commercial: 'Bob Martin', Client: 'Kappa SA', 'Montant HT': 14500, TVA: 2900, 'Montant TTC': 17400, Statut: 'Facture', Region: 'PACA' },
    { Date: '2024-05-10', Commercial: 'Alice Durand', Client: 'Lambda SAS', 'Montant HT': 8800, TVA: 1760, 'Montant TTC': 10560, Statut: 'Paye', Region: 'IDF' },
    { Date: '2024-05-20', Commercial: 'Claire Petit', Client: 'Mu SARL', 'Montant HT': 3200, TVA: 640, 'Montant TTC': 3840, Statut: 'Devis', Region: 'Bretagne' },
    { Date: '2024-06-01', Commercial: 'Bob Martin', Client: 'Nu SA', 'Montant HT': 20000, TVA: 4000, 'Montant TTC': 24000, Statut: 'Facture', Region: 'PACA' },
  ],
  totalRows: 14,
};
export const FIXTURE_SALES_EXPECTED = {
  date: ['date'],
  montant_ht: ['currency', 'number'],
  tva: ['number'],
  montant_ttc: ['currency', 'number'],
  statut: ['enum'],
  region: ['enum'],
};

/** Fixture 3: Inventory with booleans and percentages */
export const FIXTURE_INVENTORY: ExcelSheet = {
  sheetName: 'Inventaire',
  headers: ['Reference', 'Produit', 'Prix Unitaire', 'Stock', 'Disponible', 'Taux Remise %', 'URL Fiche'],
  rows: [
    { Reference: 'REF-001', Produit: 'Tournevis', 'Prix Unitaire': 12.50, Stock: 150, Disponible: 'oui', 'Taux Remise %': '10%', 'URL Fiche': 'https://catalog.leroymerlin.fr/tournevis' },
    { Reference: 'REF-002', Produit: 'Marteau', 'Prix Unitaire': 18.90, Stock: 80, Disponible: 'oui', 'Taux Remise %': '5%', 'URL Fiche': 'https://catalog.leroymerlin.fr/marteau' },
    { Reference: 'REF-003', Produit: 'Perceuse', 'Prix Unitaire': 89.99, Stock: 0, Disponible: 'non', 'Taux Remise %': '15%', 'URL Fiche': 'https://catalog.leroymerlin.fr/perceuse' },
    { Reference: 'REF-004', Produit: 'Vis (x100)', 'Prix Unitaire': 5.99, Stock: 500, Disponible: 'oui', 'Taux Remise %': '0%', 'URL Fiche': 'https://catalog.leroymerlin.fr/vis' },
    { Reference: 'REF-005', Produit: 'Niveau laser', 'Prix Unitaire': 149.00, Stock: 12, Disponible: 'oui', 'Taux Remise %': '20%', 'URL Fiche': 'https://catalog.leroymerlin.fr/niveau' },
  ],
  totalRows: 5,
};
export const FIXTURE_INVENTORY_EXPECTED = {
  prix_unitaire: ['currency', 'number'],
  disponible: ['boolean'],
  taux_remise: ['percentage'],
  url_fiche: ['url'],
  stock: ['number'],
};

/** Fixture 4: Project tracker with statuses */
export const FIXTURE_PROJECTS: ExcelSheet = {
  sheetName: 'Projets',
  headers: ['Projet', 'Responsable', 'Date Debut', 'Date Fin', 'Priorite', 'Statut', 'Budget', 'Avancement'],
  rows: [
    { Projet: 'Migration CRM', Responsable: 'Alice', 'Date Debut': '2024-01-01', 'Date Fin': '2024-06-30', Priorite: 'Haute', Statut: 'En cours', Budget: 50000, Avancement: '45%' },
    { Projet: 'Refonte site web', Responsable: 'Bob', 'Date Debut': '2024-02-15', 'Date Fin': '2024-09-30', Priorite: 'Moyenne', Statut: 'En cours', Budget: 35000, Avancement: '20%' },
    { Projet: 'Formation equipe', Responsable: 'Claire', 'Date Debut': '2024-03-01', 'Date Fin': '2024-04-30', Priorite: 'Basse', Statut: 'Termine', Budget: 8000, Avancement: '100%' },
    { Projet: 'Audit securite', Responsable: 'David', 'Date Debut': '2024-04-01', 'Date Fin': '2024-05-15', Priorite: 'Haute', Statut: 'Planifie', Budget: 15000, Avancement: '0%' },
    { Projet: 'App mobile', Responsable: 'Alice', 'Date Debut': '2024-06-01', 'Date Fin': '2024-12-31', Priorite: 'Haute', Statut: 'Planifie', Budget: 80000, Avancement: '0%' },
    { Projet: 'Nouveau CRM', Responsable: 'Eric', 'Date Debut': '2024-05-01', 'Date Fin': '2024-10-30', Priorite: 'Moyenne', Statut: 'En cours', Budget: 42000, Avancement: '35%' },
    { Projet: 'Intranet V2', Responsable: 'Claire', 'Date Debut': '2024-01-15', 'Date Fin': '2024-07-15', Priorite: 'Basse', Statut: 'En cours', Budget: 25000, Avancement: '60%' },
    { Projet: 'Data warehouse', Responsable: 'David', 'Date Debut': '2024-03-15', 'Date Fin': '2024-09-30', Priorite: 'Haute', Statut: 'En cours', Budget: 65000, Avancement: '15%' },
    { Projet: 'Chatbot support', Responsable: 'Eric', 'Date Debut': '2024-07-01', 'Date Fin': '2024-10-31', Priorite: 'Moyenne', Statut: 'Planifie', Budget: 20000, Avancement: '0%' },
    { Projet: 'Migration cloud', Responsable: 'Bob', 'Date Debut': '2024-02-01', 'Date Fin': '2024-08-31', Priorite: 'Haute', Statut: 'En cours', Budget: 90000, Avancement: '50%' },
    { Projet: 'ERP integration', Responsable: 'Alice', 'Date Debut': '2024-04-15', 'Date Fin': '2024-11-30', Priorite: 'Haute', Statut: 'En cours', Budget: 70000, Avancement: '25%' },
    { Projet: 'ISO 27001', Responsable: 'David', 'Date Debut': '2024-06-01', 'Date Fin': '2024-12-15', Priorite: 'Moyenne', Statut: 'Planifie', Budget: 30000, Avancement: '0%' },
    { Projet: 'API partners', Responsable: 'Claire', 'Date Debut': '2024-05-15', 'Date Fin': '2024-08-15', Priorite: 'Basse', Statut: 'En cours', Budget: 15000, Avancement: '70%' },
    { Projet: 'Dashboard RH', Responsable: 'Eric', 'Date Debut': '2024-03-01', 'Date Fin': '2024-05-31', Priorite: 'Basse', Statut: 'Termine', Budget: 12000, Avancement: '100%' },
  ],
  totalRows: 14,
};
export const FIXTURE_PROJECTS_EXPECTED = {
  date_debut: ['date'],
  date_fin: ['date'],
  priorite: ['enum'],
  statut: ['enum'],
  avancement: ['percentage'],
  budget: ['number'],
};

/** Fixture 5: Employee list with mixed nulls */
export const FIXTURE_EMPLOYEES: ExcelSheet = {
  sheetName: 'Employes',
  headers: ['Matricule', 'Nom', 'Email', 'Telephone', 'Service', 'Manager', 'Date Entree'],
  rows: [
    { Matricule: 'EMP001', Nom: 'Jean Dupont', Email: 'jean.dupont@acme.fr', Telephone: '01 23 45 67 89', Service: 'IT', Manager: 'Sophie Martin', 'Date Entree': '15/01/2020' },
    { Matricule: 'EMP002', Nom: 'Sophie Martin', Email: 'sophie.martin@acme.fr', Telephone: '', Service: 'IT', Manager: '', 'Date Entree': '03/06/2018' },
    { Matricule: 'EMP003', Nom: 'Pierre Leroy', Email: 'pierre.leroy@acme.fr', Telephone: '06 98 76 54 32', Service: 'RH', Manager: 'Marie Blanc', 'Date Entree': '22/09/2021' },
    { Matricule: 'EMP004', Nom: 'Marie Blanc', Email: 'marie.blanc@acme.fr', Telephone: null, Service: 'RH', Manager: '', 'Date Entree': '10/03/2017' },
    { Matricule: 'EMP005', Nom: 'Ahmed Benali', Email: 'ahmed.benali@acme.fr', Telephone: '07 11 22 33 44', Service: 'Commercial', Manager: 'Jean Dupont', 'Date Entree': '05/11/2022' },
  ],
  totalRows: 5,
};
export const FIXTURE_EMPLOYEES_EXPECTED = {
  email: ['email'],
  telephone: ['phone'],
  date_entree: ['date'],
  service: ['enum'],
};

/** Fixture 6: Approval workflow */
export const FIXTURE_APPROVALS: ExcelSheet = {
  sheetName: 'Demandes',
  headers: ['ID', 'Demandeur', 'Type', 'Date Demande', 'Montant', 'Validateur', 'Decision', 'Date Decision'],
  rows: [
    { ID: 'DEM-001', Demandeur: 'Alice', Type: 'Achat', 'Date Demande': '2024-01-10', Montant: 2500, Validateur: 'Bob', Decision: 'Approuve', 'Date Decision': '2024-01-12' },
    { ID: 'DEM-002', Demandeur: 'Claire', Type: 'Conge', 'Date Demande': '2024-01-15', Montant: 0, Validateur: 'David', Decision: 'En attente', 'Date Decision': '' },
    { ID: 'DEM-003', Demandeur: 'Eric', Type: 'Achat', 'Date Demande': '2024-02-01', Montant: 8900, Validateur: 'Bob', Decision: 'Refuse', 'Date Decision': '2024-02-03' },
    { ID: 'DEM-004', Demandeur: 'Alice', Type: 'Formation', 'Date Demande': '2024-02-10', Montant: 1500, Validateur: 'David', Decision: 'Approuve', 'Date Decision': '2024-02-11' },
    { ID: 'DEM-005', Demandeur: 'Frank', Type: 'Conge', 'Date Demande': '2024-03-01', Montant: 0, Validateur: 'Bob', Decision: 'En attente', 'Date Decision': '' },
  ],
  totalRows: 5,
};

/** Fixture 7: Checklist inspection */
export const FIXTURE_CHECKLIST: ExcelSheet = {
  sheetName: 'Inspection',
  headers: ['Point Controle', 'Conforme', 'Commentaire', 'Date Verification', 'Inspecteur'],
  rows: [
    { 'Point Controle': 'Extincteur present', Conforme: 'oui', Commentaire: '', 'Date Verification': '2024-03-15', Inspecteur: 'Martin' },
    { 'Point Controle': 'Issue de secours degagee', Conforme: 'oui', Commentaire: '', 'Date Verification': '2024-03-15', Inspecteur: 'Martin' },
    { 'Point Controle': 'Alarme fonctionnelle', Conforme: 'non', Commentaire: 'Batterie faible', 'Date Verification': '2024-03-15', Inspecteur: 'Martin' },
    { 'Point Controle': 'Eclairage secours', Conforme: 'oui', Commentaire: '', 'Date Verification': '2024-03-15', Inspecteur: 'Martin' },
    { 'Point Controle': 'Plan evacuation affiche', Conforme: 'oui', Commentaire: 'A mettre a jour', 'Date Verification': '2024-03-15', Inspecteur: 'Martin' },
  ],
  totalRows: 5,
};

/** Fixture 8: Empty dataset */
export const FIXTURE_EMPTY: ExcelSheet = {
  sheetName: 'Vide',
  headers: ['Col A', 'Col B'],
  rows: [],
  totalRows: 0,
};

/** Fixture 9: Single column, many rows */
export const FIXTURE_SINGLE_COL: ExcelSheet = {
  sheetName: 'Notes',
  headers: ['Commentaire'],
  rows: Array.from({ length: 100 }, (_, i) => ({ Commentaire: `Note numero ${i + 1}` })),
  totalRows: 100,
};

/** Fixture 10: Wide table (many columns) */
export const FIXTURE_WIDE: ExcelSheet = {
  sheetName: 'Large',
  headers: Array.from({ length: 50 }, (_, i) => `Colonne_${i + 1}`),
  rows: [
    Object.fromEntries(Array.from({ length: 50 }, (_, i) => [`Colonne_${i + 1}`, `Valeur_${i + 1}`])),
    Object.fromEntries(Array.from({ length: 50 }, (_, i) => [`Colonne_${i + 1}`, `Donnee_${i + 1}`])),
  ],
  totalRows: 2,
};

/** All fixtures for batch testing */
export const ALL_FIXTURES = [
  { name: 'FR Contacts', data: FIXTURE_FR_CONTACTS, expected: FIXTURE_FR_CONTACTS_EXPECTED },
  { name: 'Sales', data: FIXTURE_SALES, expected: FIXTURE_SALES_EXPECTED },
  { name: 'Inventory', data: FIXTURE_INVENTORY, expected: FIXTURE_INVENTORY_EXPECTED },
  { name: 'Projects', data: FIXTURE_PROJECTS, expected: FIXTURE_PROJECTS_EXPECTED },
  { name: 'Employees', data: FIXTURE_EMPLOYEES, expected: FIXTURE_EMPLOYEES_EXPECTED },
  { name: 'Approvals', data: FIXTURE_APPROVALS, expected: null },
  { name: 'Checklist', data: FIXTURE_CHECKLIST, expected: null },
  { name: 'Empty', data: FIXTURE_EMPTY, expected: null },
  { name: 'Single Column', data: FIXTURE_SINGLE_COL, expected: null },
  { name: 'Wide Table', data: FIXTURE_WIDE, expected: null },
];
