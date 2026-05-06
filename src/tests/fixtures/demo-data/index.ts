/**
 * Demo datasets for sandbox mode — @FORGE
 *
 * 5 realistic French enterprise datasets used in the sandbox experience.
 * Each dataset simulates a real Excel file that would be connected via M365.
 */

import type { ExcelSheet } from '@instack/ai-pipeline';

export interface DemoDataset {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly persona: string;
  readonly suggestedPrompt: string;
  readonly data: ExcelSheet;
}

// ---------------------------------------------------------------------------
// 1. Interventions — Suivi Interventions Terrain
// ---------------------------------------------------------------------------
const interventionsData: ExcelSheet = {
  sheetName: 'Interventions',
  headers: [
    'Technicien', 'Site', 'Date', 'Statut', 'Priorite', 'Duree_h', 'Type',
    'Description', 'Materiel', 'Cout_EUR', 'Region', 'Client', 'Urgence',
    'Photos', 'Notes',
  ],
  totalRows: 30,
  rows: [
    { Technicien: 'Marc Dupont', Site: '12 Rue de la Paix, Lyon', Date: '2026-04-28', Statut: 'Termine', Priorite: 'Haute', Duree_h: 3.5, Type: 'Maintenance', Description: 'Remplacement compresseur', Materiel: 'Compresseur XR-200', Cout_EUR: 450, Region: 'Rhone-Alpes', Client: 'Carrefour Lyon Part-Dieu', Urgence: 'Oui', Photos: 2, Notes: 'Piece commandee en avance' },
    { Technicien: 'Sophie Laurent', Site: '8 Avenue Foch, Paris', Date: '2026-04-28', Statut: 'En cours', Priorite: 'Critique', Duree_h: 2, Type: 'Depannage', Description: 'Fuite circuit frigorifique', Materiel: 'Kit soudure', Cout_EUR: 280, Region: 'Ile-de-France', Client: 'Auchan Paris Nord', Urgence: 'Oui', Photos: 4, Notes: 'Intervention urgente nuit' },
    { Technicien: 'Pierre Martin', Site: '45 Bd Gambetta, Marseille', Date: '2026-04-27', Statut: 'Planifie', Priorite: 'Moyenne', Duree_h: 4, Type: 'Installation', Description: 'Installation vitrine refrigeree', Materiel: 'Vitrine VR-500', Cout_EUR: 1200, Region: 'PACA', Client: 'Intermarche Marseille Prado', Urgence: 'Non', Photos: 0, Notes: 'Livraison confirmee pour le 27' },
    { Technicien: 'Marc Dupont', Site: '3 Place Bellecour, Lyon', Date: '2026-04-27', Statut: 'Termine', Priorite: 'Basse', Duree_h: 1.5, Type: 'Controle', Description: 'Controle annuel climatisation', Materiel: 'Kit mesure', Cout_EUR: 120, Region: 'Rhone-Alpes', Client: 'Leclerc Lyon Centre', Urgence: 'Non', Photos: 1, Notes: 'RAS - conforme' },
    { Technicien: 'Julie Moreau', Site: '22 Rue Nationale, Lille', Date: '2026-04-26', Statut: 'Termine', Priorite: 'Haute', Duree_h: 5, Type: 'Reparation', Description: 'Reparation chambre froide', Materiel: 'Thermostat TH-300', Cout_EUR: 680, Region: 'Hauts-de-France', Client: 'Metro Lille', Urgence: 'Oui', Photos: 3, Notes: 'Thermostat defaillant remplace' },
    { Technicien: 'Thomas Bernard', Site: '15 Cours Mirabeau, Aix', Date: '2026-04-26', Statut: 'En cours', Priorite: 'Moyenne', Duree_h: 3, Type: 'Maintenance', Description: 'Nettoyage condenseurs', Materiel: 'Nettoyeur haute pression', Cout_EUR: 180, Region: 'PACA', Client: 'Casino Aix Centre', Urgence: 'Non', Photos: 1, Notes: 'Acces toit necessaire' },
    { Technicien: 'Sophie Laurent', Site: '7 Rue de Rivoli, Paris', Date: '2026-04-25', Statut: 'Annule', Priorite: 'Basse', Duree_h: 0, Type: 'Controle', Description: 'Controle semestriel annule', Materiel: '', Cout_EUR: 0, Region: 'Ile-de-France', Client: 'Monoprix Rivoli', Urgence: 'Non', Photos: 0, Notes: 'Client a reporte au mois prochain' },
    { Technicien: 'Pierre Martin', Site: '30 Av de la Republique, Marseille', Date: '2026-04-25', Statut: 'Termine', Priorite: 'Critique', Duree_h: 6, Type: 'Depannage', Description: 'Panne groupe froid central', Materiel: 'Compresseur GF-400', Cout_EUR: 2100, Region: 'PACA', Client: 'Leclerc Marseille La Valentine', Urgence: 'Oui', Photos: 5, Notes: 'Compresseur remplace en urgence' },
    { Technicien: 'Julie Moreau', Site: '11 Grand Place, Lille', Date: '2026-04-24', Statut: 'Termine', Priorite: 'Moyenne', Duree_h: 2.5, Type: 'Installation', Description: 'Pose capteurs temperature IoT', Materiel: 'Capteurs IoT x8', Cout_EUR: 960, Region: 'Hauts-de-France', Client: 'Auchan Lille Flandres', Urgence: 'Non', Photos: 2, Notes: '8 capteurs installes zone frais' },
    { Technicien: 'Thomas Bernard', Site: '5 Rue Sainte-Catherine, Bordeaux', Date: '2026-04-24', Statut: 'Planifie', Priorite: 'Haute', Duree_h: 4, Type: 'Reparation', Description: 'Reparation evaporateur', Materiel: 'Evaporateur EV-150', Cout_EUR: 850, Region: 'Nouvelle-Aquitaine', Client: 'Carrefour Bordeaux Lac', Urgence: 'Oui', Photos: 0, Notes: 'Piece en stock depot Bordeaux' },
    { Technicien: 'Marc Dupont', Site: '18 Place des Terreaux, Lyon', Date: '2026-04-23', Statut: 'Termine', Priorite: 'Haute', Duree_h: 4.5, Type: 'Depannage', Description: 'Defaut ventilateur evaporateur', Materiel: 'Ventilateur EC-250', Cout_EUR: 520, Region: 'Rhone-Alpes', Client: 'Picard Lyon 2eme', Urgence: 'Oui', Photos: 2, Notes: 'Ventilateur EC remplace' },
    { Technicien: 'Sophie Laurent', Site: '25 Bd Haussmann, Paris', Date: '2026-04-23', Statut: 'Termine', Priorite: 'Basse', Duree_h: 1, Type: 'Controle', Description: 'Releve temperatures reglementaire', Materiel: 'Thermometre IR', Cout_EUR: 90, Region: 'Ile-de-France', Client: 'Franprix Haussmann', Urgence: 'Non', Photos: 1, Notes: 'Toutes zones conformes' },
    { Technicien: 'Pierre Martin', Site: '9 Quai de la Joliette, Marseille', Date: '2026-04-22', Statut: 'Termine', Priorite: 'Moyenne', Duree_h: 3, Type: 'Maintenance', Description: 'Recharge gaz R-449A', Materiel: 'Bouteille R-449A', Cout_EUR: 340, Region: 'PACA', Client: 'Grand Frais Marseille', Urgence: 'Non', Photos: 1, Notes: 'Recharge 4kg effectuee' },
    { Technicien: 'Julie Moreau', Site: '40 Rue Esquermoise, Lille', Date: '2026-04-22', Statut: 'En cours', Priorite: 'Critique', Duree_h: 5, Type: 'Depannage', Description: 'Alarme temperature haute', Materiel: 'Vanne expansion TX-100', Cout_EUR: 750, Region: 'Hauts-de-France', Client: 'Lidl Lille Wazemmes', Urgence: 'Oui', Photos: 3, Notes: 'Vanne expansion a remplacer' },
    { Technicien: 'Thomas Bernard', Site: '14 Allee de Tourny, Bordeaux', Date: '2026-04-21', Statut: 'Termine', Priorite: 'Moyenne', Duree_h: 2, Type: 'Installation', Description: 'Mise en service nouveau meuble', Materiel: 'Meuble MF-800', Cout_EUR: 1800, Region: 'Nouvelle-Aquitaine', Client: 'Intermarche Bordeaux Bastide', Urgence: 'Non', Photos: 2, Notes: 'Meuble froid positif installe' },
    { Technicien: 'Marc Dupont', Site: '6 Rue du President Herriot, Lyon', Date: '2026-04-21', Statut: 'Planifie', Priorite: 'Basse', Duree_h: 2, Type: 'Controle', Description: 'Audit energetique annuel', Materiel: 'Analyseur energie', Cout_EUR: 200, Region: 'Rhone-Alpes', Client: 'Monoprix Lyon Bellecour', Urgence: 'Non', Photos: 0, Notes: 'Planifie avec le responsable site' },
    { Technicien: 'Sophie Laurent', Site: '33 Rue de Rennes, Paris', Date: '2026-04-20', Statut: 'Termine', Priorite: 'Haute', Duree_h: 3.5, Type: 'Reparation', Description: 'Fuite detendeur electronique', Materiel: 'Detendeur EEV-200', Cout_EUR: 620, Region: 'Ile-de-France', Client: 'Naturalia Rennes', Urgence: 'Oui', Photos: 2, Notes: 'Detendeur remplace sous garantie' },
    { Technicien: 'Pierre Martin', Site: '20 La Canebiere, Marseille', Date: '2026-04-20', Statut: 'Termine', Priorite: 'Moyenne', Duree_h: 2.5, Type: 'Maintenance', Description: 'Remplacement filtre deshydrateur', Materiel: 'Filtre FD-50', Cout_EUR: 160, Region: 'PACA', Client: 'Carrefour City Canebiere', Urgence: 'Non', Photos: 1, Notes: 'Filtre sature remplace' },
    { Technicien: 'Julie Moreau', Site: '28 Rue de Bethune, Lille', Date: '2026-04-19', Statut: 'Termine', Priorite: 'Haute', Duree_h: 4, Type: 'Depannage', Description: 'Court-circuit tableau electrique', Materiel: 'Disjoncteur 40A', Cout_EUR: 380, Region: 'Hauts-de-France', Client: 'Picard Lille Centre', Urgence: 'Oui', Photos: 3, Notes: 'Disjoncteur et cablage remplaces' },
    { Technicien: 'Thomas Bernard', Site: '10 Place de la Bourse, Bordeaux', Date: '2026-04-19', Statut: 'Termine', Priorite: 'Basse', Duree_h: 1.5, Type: 'Controle', Description: 'Verification etancheite circuit', Materiel: 'Detecteur fuite', Cout_EUR: 110, Region: 'Nouvelle-Aquitaine', Client: 'Casino Bordeaux Centre', Urgence: 'Non', Photos: 1, Notes: 'Aucune fuite detectee' },
    { Technicien: 'Marc Dupont', Site: '2 Rue de la Republique, Lyon', Date: '2026-04-18', Statut: 'Termine', Priorite: 'Critique', Duree_h: 7, Type: 'Depannage', Description: 'Panne totale installation', Materiel: 'Automate programmable', Cout_EUR: 1500, Region: 'Rhone-Alpes', Client: 'Metro Lyon Vaise', Urgence: 'Oui', Photos: 6, Notes: 'Automate et carte puissance remplaces' },
    { Technicien: 'Sophie Laurent', Site: '17 Rue du Commerce, Paris', Date: '2026-04-18', Statut: 'Termine', Priorite: 'Moyenne', Duree_h: 2, Type: 'Installation', Description: 'Installation rideau air chaud', Materiel: 'Rideau air RA-120', Cout_EUR: 890, Region: 'Ile-de-France', Client: 'Auchan Paris Commerce', Urgence: 'Non', Photos: 2, Notes: 'Rideau installe entree principale' },
    { Technicien: 'Pierre Martin', Site: '35 Cours Julien, Marseille', Date: '2026-04-17', Statut: 'Annule', Priorite: 'Basse', Duree_h: 0, Type: 'Maintenance', Description: 'Maintenance preventive reportee', Materiel: '', Cout_EUR: 0, Region: 'PACA', Client: 'Bio c Bon Cours Julien', Urgence: 'Non', Photos: 0, Notes: 'Magasin ferme exceptionnellement' },
    { Technicien: 'Julie Moreau', Site: '19 Rue Faidherbe, Lille', Date: '2026-04-17', Statut: 'Termine', Priorite: 'Haute', Duree_h: 3, Type: 'Reparation', Description: 'Reparation porte chambre froide', Materiel: 'Joint porte CF', Cout_EUR: 290, Region: 'Hauts-de-France', Client: 'Leclerc Lille Fives', Urgence: 'Oui', Photos: 2, Notes: 'Joint et charniere remplaces' },
    { Technicien: 'Thomas Bernard', Site: '8 Rue Vital Carles, Bordeaux', Date: '2026-04-16', Statut: 'Termine', Priorite: 'Moyenne', Duree_h: 3.5, Type: 'Maintenance', Description: 'Revision groupe condensation', Materiel: 'Kit revision GC', Cout_EUR: 420, Region: 'Nouvelle-Aquitaine', Client: 'Lidl Bordeaux Chartrons', Urgence: 'Non', Photos: 1, Notes: 'Revision complete effectuee' },
    { Technicien: 'Marc Dupont', Site: '21 Quai Saint-Antoine, Lyon', Date: '2026-04-16', Statut: 'Termine', Priorite: 'Haute', Duree_h: 2.5, Type: 'Depannage', Description: 'Defaut sonde temperature', Materiel: 'Sonde PT1000', Cout_EUR: 180, Region: 'Rhone-Alpes', Client: 'Halles de Lyon', Urgence: 'Oui', Photos: 1, Notes: 'Sonde PT1000 remplacee' },
    { Technicien: 'Sophie Laurent', Site: '42 Rue de Turbigo, Paris', Date: '2026-04-15', Statut: 'Termine', Priorite: 'Moyenne', Duree_h: 4, Type: 'Installation', Description: 'Installation monitoring a distance', Materiel: 'Gateway IoT GW-10', Cout_EUR: 1100, Region: 'Ile-de-France', Client: 'Franprix Turbigo', Urgence: 'Non', Photos: 3, Notes: 'Gateway + 12 capteurs connectes' },
    { Technicien: 'Pierre Martin', Site: '13 Rue Paradis, Marseille', Date: '2026-04-15', Statut: 'Planifie', Priorite: 'Haute', Duree_h: 5, Type: 'Reparation', Description: 'Remplacement compresseur scroll', Materiel: 'Compresseur SC-350', Cout_EUR: 1900, Region: 'PACA', Client: 'Monoprix Marseille Paradis', Urgence: 'Oui', Photos: 0, Notes: 'Piece en commande livraison J+2' },
    { Technicien: 'Julie Moreau', Site: '6 Place du General de Gaulle, Lille', Date: '2026-04-14', Statut: 'Termine', Priorite: 'Basse', Duree_h: 1, Type: 'Controle', Description: 'Controle conformite HACCP', Materiel: 'Kit controle HACCP', Cout_EUR: 95, Region: 'Hauts-de-France', Client: 'Carrefour Contact Lille', Urgence: 'Non', Photos: 1, Notes: 'Conforme aux normes HACCP' },
    { Technicien: 'Thomas Bernard', Site: '27 Cours de lIntendance, Bordeaux', Date: '2026-04-14', Statut: 'Termine', Priorite: 'Haute', Duree_h: 4.5, Type: 'Depannage', Description: 'Fuite fluide frigorigene', Materiel: 'Kit brasure + R-449A', Cout_EUR: 580, Region: 'Nouvelle-Aquitaine', Client: 'Grand Frais Bordeaux', Urgence: 'Oui', Photos: 4, Notes: 'Fuite colmatee, recharge effectuee' },
  ],
};

const interventions: DemoDataset = {
  id: 'interventions',
  name: 'Suivi Interventions Terrain',
  description: 'Suivi des interventions techniques sur site : maintenance, depannage, controles. Ideal pour les equipes terrain.',
  persona: 'Sandrine, Ops Manager',
  suggestedPrompt: 'Je veux une app pour suivre les interventions de mes techniciens sur le terrain avec le statut, la priorite et les couts.',
  data: interventionsData,
};

// ---------------------------------------------------------------------------
// 2. Projets — Dashboard Projet Amelioration Continue
// ---------------------------------------------------------------------------
const projetsData: ExcelSheet = {
  sheetName: 'Projets',
  headers: [
    'Projet', 'Responsable', 'Budget_EUR', 'Avancement_pct', 'Echeance',
    'Departement', 'Statut', 'Priorite', 'Date_debut', 'Categorie', 'Risque', 'Notes',
  ],
  totalRows: 15,
  rows: [
    { Projet: 'Optimisation ligne conditionnement', Responsable: 'Mehdi Benali', Budget_EUR: 45000, Avancement_pct: 72, Echeance: '2026-06-30', Departement: 'Production', Statut: 'En cours', Priorite: 'Haute', Date_debut: '2026-01-15', Categorie: 'Productivite', Risque: 'Moyen', Notes: 'Retard fournisseur convoyeur' },
    { Projet: 'Certification ISO 22000 v2', Responsable: 'Claire Fontaine', Budget_EUR: 28000, Avancement_pct: 45, Echeance: '2026-09-15', Departement: 'Qualite', Statut: 'En cours', Priorite: 'Critique', Date_debut: '2026-02-01', Categorie: 'Conformite', Risque: 'Eleve', Notes: 'Audit blanc planifie mai 2026' },
    { Projet: 'Reduction dechets emballage 20%', Responsable: 'Antoine Lefevre', Budget_EUR: 15000, Avancement_pct: 88, Echeance: '2026-05-31', Departement: 'RSE', Statut: 'En cours', Priorite: 'Haute', Date_debut: '2025-11-01', Categorie: 'Environnement', Risque: 'Faible', Notes: 'Objectif quasi atteint -18% actuel' },
    { Projet: 'Digitalisation fiches de poste', Responsable: 'Sarah Morel', Budget_EUR: 12000, Avancement_pct: 30, Echeance: '2026-07-31', Departement: 'RH', Statut: 'En cours', Priorite: 'Moyenne', Date_debut: '2026-03-01', Categorie: 'Digital', Risque: 'Faible', Notes: 'Phase de collecte en cours' },
    { Projet: 'Nouveau ERP module achats', Responsable: 'Vincent Garnier', Budget_EUR: 85000, Avancement_pct: 15, Echeance: '2026-12-31', Departement: 'IT', Statut: 'En cours', Priorite: 'Critique', Date_debut: '2026-04-01', Categorie: 'Digital', Risque: 'Eleve', Notes: 'Selection integrator en cours' },
    { Projet: 'Formation securite alimentaire', Responsable: 'Claire Fontaine', Budget_EUR: 8000, Avancement_pct: 100, Echeance: '2026-03-31', Departement: 'Qualite', Statut: 'Termine', Priorite: 'Haute', Date_debut: '2026-01-10', Categorie: 'Formation', Risque: 'Faible', Notes: '120 collaborateurs formes' },
    { Projet: 'Installation panneaux solaires', Responsable: 'Antoine Lefevre', Budget_EUR: 120000, Avancement_pct: 5, Echeance: '2027-03-31', Departement: 'RSE', Statut: 'Planifie', Priorite: 'Moyenne', Date_debut: '2026-06-01', Categorie: 'Environnement', Risque: 'Moyen', Notes: 'Etude faisabilite en cours' },
    { Projet: 'Amelioration TRS ligne 3', Responsable: 'Mehdi Benali', Budget_EUR: 32000, Avancement_pct: 60, Echeance: '2026-06-15', Departement: 'Production', Statut: 'En cours', Priorite: 'Haute', Date_debut: '2026-02-15', Categorie: 'Productivite', Risque: 'Moyen', Notes: 'TRS passe de 65% a 78%' },
    { Projet: 'Mise en conformite RGPD clients', Responsable: 'Sarah Morel', Budget_EUR: 18000, Avancement_pct: 100, Echeance: '2026-04-15', Departement: 'Juridique', Statut: 'Termine', Priorite: 'Critique', Date_debut: '2025-12-01', Categorie: 'Conformite', Risque: 'Faible', Notes: 'Audit DPO valide' },
    { Projet: 'Lancement gamme bio premium', Responsable: 'Nadia Rousseau', Budget_EUR: 55000, Avancement_pct: 40, Echeance: '2026-09-01', Departement: 'R&D', Statut: 'En cours', Priorite: 'Haute', Date_debut: '2026-01-20', Categorie: 'Innovation', Risque: 'Moyen', Notes: 'Phase de tests consommateurs' },
    { Projet: 'Automatisation palettisation', Responsable: 'Mehdi Benali', Budget_EUR: 95000, Avancement_pct: 20, Echeance: '2026-11-30', Departement: 'Production', Statut: 'En cours', Priorite: 'Haute', Date_debut: '2026-03-15', Categorie: 'Productivite', Risque: 'Eleve', Notes: 'Robot cobot en phase de test' },
    { Projet: 'Plan de sobriete energetique', Responsable: 'Antoine Lefevre', Budget_EUR: 25000, Avancement_pct: 55, Echeance: '2026-08-31', Departement: 'RSE', Statut: 'En cours', Priorite: 'Moyenne', Date_debut: '2026-01-05', Categorie: 'Environnement', Risque: 'Faible', Notes: 'LED installe, isolation en cours' },
    { Projet: 'Refonte site e-commerce B2B', Responsable: 'Vincent Garnier', Budget_EUR: 42000, Avancement_pct: 65, Echeance: '2026-07-15', Departement: 'IT', Statut: 'En cours', Priorite: 'Haute', Date_debut: '2026-02-01', Categorie: 'Digital', Risque: 'Moyen', Notes: 'Maquettes validees, dev en cours' },
    { Projet: 'Enquete satisfaction salaries', Responsable: 'Sarah Morel', Budget_EUR: 5000, Avancement_pct: 90, Echeance: '2026-05-15', Departement: 'RH', Statut: 'En cours', Priorite: 'Moyenne', Date_debut: '2026-03-20', Categorie: 'RH', Risque: 'Faible', Notes: 'Analyse resultats en cours' },
    { Projet: 'Tracabilite blockchain fournisseurs', Responsable: 'Nadia Rousseau', Budget_EUR: 60000, Avancement_pct: 10, Echeance: '2027-01-31', Departement: 'R&D', Statut: 'Planifie', Priorite: 'Moyenne', Date_debut: '2026-07-01', Categorie: 'Innovation', Risque: 'Eleve', Notes: 'POC en discussion avec partenaire' },
  ],
};

const projets: DemoDataset = {
  id: 'projets',
  name: 'Dashboard Projet Amelioration Continue',
  description: 'Tableau de bord des projets d\'amelioration continue dans l\'agroalimentaire. Suivi budget, avancement et risques.',
  persona: 'Mehdi, Chef de Projet',
  suggestedPrompt: 'Je veux un dashboard pour suivre l\'avancement de mes projets avec le budget, les risques et les echeances.',
  data: projetsData,
};

// ---------------------------------------------------------------------------
// 3. Visites — Visites Clients
// ---------------------------------------------------------------------------
const visitesData: ExcelSheet = {
  sheetName: 'Visites',
  headers: [
    'Client', 'Date', 'Contact', 'Produits', 'Montant_EUR', 'Suite',
    'Resultat', 'Region', 'Secteur', 'Commercial',
  ],
  totalRows: 20,
  rows: [
    { Client: 'Maison Dupont Textiles', Date: '2026-04-28', Contact: 'Marie Dupont', Produits: 'Collection ete 2026', Montant_EUR: 12500, Suite: 'Devis envoye', Resultat: 'Positif', Region: 'Ile-de-France', Secteur: 'Pret-a-porter', Commercial: 'Clara Petit' },
    { Client: 'Boutique Elegance', Date: '2026-04-27', Contact: 'Jean-Marc Vidal', Produits: 'Accessoires cuir', Montant_EUR: 4800, Suite: 'Commande confirmee', Resultat: 'Gagne', Region: 'Rhone-Alpes', Secteur: 'Accessoires', Commercial: 'Clara Petit' },
    { Client: 'Mode & Style SARL', Date: '2026-04-27', Contact: 'Isabelle Chen', Produits: 'Robes ceremonie', Montant_EUR: 18000, Suite: 'Second RDV planifie', Resultat: 'En attente', Region: 'PACA', Secteur: 'Ceremonie', Commercial: 'Julien Roche' },
    { Client: 'Les Tissus de Provence', Date: '2026-04-26', Contact: 'Paul Mercier', Produits: 'Tissus ameublement', Montant_EUR: 7200, Suite: 'Echantillons envoyes', Resultat: 'Positif', Region: 'PACA', Secteur: 'Ameublement', Commercial: 'Julien Roche' },
    { Client: 'Galeries du Nord', Date: '2026-04-25', Contact: 'Sophie Lemoine', Produits: 'Collection automne 2026', Montant_EUR: 32000, Suite: 'Negociation prix', Resultat: 'En attente', Region: 'Hauts-de-France', Secteur: 'Grand magasin', Commercial: 'Clara Petit' },
    { Client: 'Atelier Couture Paris', Date: '2026-04-25', Contact: 'Luc Bertrand', Produits: 'Fournitures couture', Montant_EUR: 2800, Suite: 'Commande confirmee', Resultat: 'Gagne', Region: 'Ile-de-France', Secteur: 'Fournitures', Commercial: 'Julien Roche' },
    { Client: 'Chic & Tendance', Date: '2026-04-24', Contact: 'Nathalie Faure', Produits: 'Vetements sport', Montant_EUR: 15600, Suite: 'Devis envoye', Resultat: 'Positif', Region: 'Nouvelle-Aquitaine', Secteur: 'Sportswear', Commercial: 'Clara Petit' },
    { Client: 'Draperie Moderne', Date: '2026-04-24', Contact: 'Henri Blanc', Produits: 'Rideaux sur mesure', Montant_EUR: 9400, Suite: 'Visite atelier planifiee', Resultat: 'Positif', Region: 'Rhone-Alpes', Secteur: 'Ameublement', Commercial: 'Julien Roche' },
    { Client: 'Fashion Corner Marseille', Date: '2026-04-23', Contact: 'Camille Durand', Produits: 'Maillots de bain', Montant_EUR: 8500, Suite: 'Commande confirmee', Resultat: 'Gagne', Region: 'PACA', Secteur: 'Beachwear', Commercial: 'Clara Petit' },
    { Client: 'Les Createurs Reunis', Date: '2026-04-23', Contact: 'Thomas Girard', Produits: 'Tissus techniques', Montant_EUR: 21000, Suite: 'Tests en cours', Resultat: 'En attente', Region: 'Ile-de-France', Secteur: 'Technique', Commercial: 'Julien Roche' },
    { Client: 'Bebe Chic', Date: '2026-04-22', Contact: 'Anne-Sophie Martin', Produits: 'Collection bebe bio', Montant_EUR: 6200, Suite: 'Devis envoye', Resultat: 'Positif', Region: 'Hauts-de-France', Secteur: 'Puericulture', Commercial: 'Clara Petit' },
    { Client: 'Uniforme Pro France', Date: '2026-04-22', Contact: 'Patrick Leroy', Produits: 'Vetements travail', Montant_EUR: 45000, Suite: 'Appel offres soumis', Resultat: 'En attente', Region: 'Ile-de-France', Secteur: 'Professionnel', Commercial: 'Julien Roche' },
    { Client: 'Maroquinerie Saint-Germain', Date: '2026-04-21', Contact: 'Cecile Moreau', Produits: 'Sacs et ceintures', Montant_EUR: 11200, Suite: 'Commande confirmee', Resultat: 'Gagne', Region: 'Ile-de-France', Secteur: 'Maroquinerie', Commercial: 'Clara Petit' },
    { Client: 'Tricots des Alpes', Date: '2026-04-21', Contact: 'Bernard Jacquet', Produits: 'Pulls laine merinos', Montant_EUR: 14800, Suite: 'Negociation volumes', Resultat: 'Positif', Region: 'Rhone-Alpes', Secteur: 'Maille', Commercial: 'Julien Roche' },
    { Client: 'Concept Store Bordeaux', Date: '2026-04-20', Contact: 'Laura Desjardins', Produits: 'Marques emergentes', Montant_EUR: 5600, Suite: 'Perdu - budget', Resultat: 'Perdu', Region: 'Nouvelle-Aquitaine', Secteur: 'Concept store', Commercial: 'Clara Petit' },
    { Client: 'Lingerie Delice', Date: '2026-04-19', Contact: 'Frederique Langlois', Produits: 'Collection lingerie', Montant_EUR: 19500, Suite: 'Second RDV planifie', Resultat: 'En attente', Region: 'PACA', Secteur: 'Lingerie', Commercial: 'Julien Roche' },
    { Client: 'Sport Montagne Plus', Date: '2026-04-18', Contact: 'Romain Peyrat', Produits: 'Vetements techniques ski', Montant_EUR: 28000, Suite: 'Devis envoye', Resultat: 'Positif', Region: 'Rhone-Alpes', Secteur: 'Sportswear', Commercial: 'Clara Petit' },
    { Client: 'Boutique Vintage Paris', Date: '2026-04-17', Contact: 'Amelie Bonnet', Produits: 'Tissus vintage', Montant_EUR: 3200, Suite: 'Perdu - delai', Resultat: 'Perdu', Region: 'Ile-de-France', Secteur: 'Vintage', Commercial: 'Julien Roche' },
    { Client: 'Groupe Textile Ouest', Date: '2026-04-16', Contact: 'Marc-Antoine Renaud', Produits: 'Contrat annuel fournitures', Montant_EUR: 78000, Suite: 'Negociation finale', Resultat: 'En attente', Region: 'Bretagne', Secteur: 'Industriel', Commercial: 'Clara Petit' },
    { Client: 'Eco Fibres France', Date: '2026-04-15', Contact: 'Sandrine Mathieu', Produits: 'Fibres recyclees', Montant_EUR: 16500, Suite: 'Commande confirmee', Resultat: 'Gagne', Region: 'Nouvelle-Aquitaine', Secteur: 'Eco-responsable', Commercial: 'Julien Roche' },
  ],
};

const visites: DemoDataset = {
  id: 'visites',
  name: 'Visites Clients',
  description: 'Suivi des visites commerciales : clients, montants, resultats. Pour les equipes commerciales terrain.',
  persona: 'Clara, Commerciale',
  suggestedPrompt: 'Je veux une app pour suivre mes visites clients avec les montants, les resultats et les prochaines actions.',
  data: visitesData,
};

// ---------------------------------------------------------------------------
// 4. Audits — Audit Magasins
// ---------------------------------------------------------------------------
const auditsData: ExcelSheet = {
  sheetName: 'Audits',
  headers: [
    'Magasin', 'Date_audit', 'Proprete', 'Signaletique', 'Stock', 'Securite',
    'Accueil', 'Conformite', 'Score', 'Auditeur', 'Region', 'Actions',
  ],
  totalRows: 20,
  rows: [
    { Magasin: 'Magasin Lyon Part-Dieu', Date_audit: '2026-04-28', Proprete: 'Oui', Signaletique: 'Oui', Stock: 'Oui', Securite: 'Oui', Accueil: 'Oui', Conformite: 'Oui', Score: 95, Auditeur: 'Sandrine Delmas', Region: 'Rhone-Alpes', Actions: 'RAS' },
    { Magasin: 'Magasin Paris Rivoli', Date_audit: '2026-04-28', Proprete: 'Oui', Signaletique: 'Non', Stock: 'Oui', Securite: 'Oui', Accueil: 'Oui', Conformite: 'Non', Score: 72, Auditeur: 'Sandrine Delmas', Region: 'Ile-de-France', Actions: 'Refaire signaletique entree, mettre a jour affichage legal' },
    { Magasin: 'Magasin Marseille Prado', Date_audit: '2026-04-27', Proprete: 'Non', Signaletique: 'Oui', Stock: 'Oui', Securite: 'Oui', Accueil: 'Oui', Conformite: 'Oui', Score: 78, Auditeur: 'Marc Olivier', Region: 'PACA', Actions: 'Nettoyage approfondi reserve et sanitaires' },
    { Magasin: 'Magasin Lille Centre', Date_audit: '2026-04-27', Proprete: 'Oui', Signaletique: 'Oui', Stock: 'Non', Securite: 'Oui', Accueil: 'Oui', Conformite: 'Oui', Score: 82, Auditeur: 'Marc Olivier', Region: 'Hauts-de-France', Actions: 'Reappro rayon frais, revoir planning livraisons' },
    { Magasin: 'Magasin Bordeaux Chartrons', Date_audit: '2026-04-26', Proprete: 'Oui', Signaletique: 'Oui', Stock: 'Oui', Securite: 'Oui', Accueil: 'Oui', Conformite: 'Oui', Score: 98, Auditeur: 'Sandrine Delmas', Region: 'Nouvelle-Aquitaine', Actions: 'RAS - exemplaire' },
    { Magasin: 'Magasin Nantes Graslin', Date_audit: '2026-04-26', Proprete: 'Oui', Signaletique: 'Oui', Stock: 'Oui', Securite: 'Non', Accueil: 'Oui', Conformite: 'Non', Score: 65, Auditeur: 'Marc Olivier', Region: 'Pays de la Loire', Actions: 'Extincteur perime a remplacer, issue secours obstruee' },
    { Magasin: 'Magasin Toulouse Capitole', Date_audit: '2026-04-25', Proprete: 'Oui', Signaletique: 'Oui', Stock: 'Oui', Securite: 'Oui', Accueil: 'Non', Conformite: 'Oui', Score: 80, Auditeur: 'Sandrine Delmas', Region: 'Occitanie', Actions: 'Former nouveau personnel accueil' },
    { Magasin: 'Magasin Strasbourg Kleber', Date_audit: '2026-04-25', Proprete: 'Oui', Signaletique: 'Oui', Stock: 'Oui', Securite: 'Oui', Accueil: 'Oui', Conformite: 'Oui', Score: 92, Auditeur: 'Marc Olivier', Region: 'Grand Est', Actions: 'RAS' },
    { Magasin: 'Magasin Nice Massena', Date_audit: '2026-04-24', Proprete: 'Non', Signaletique: 'Non', Stock: 'Oui', Securite: 'Oui', Accueil: 'Oui', Conformite: 'Non', Score: 58, Auditeur: 'Sandrine Delmas', Region: 'PACA', Actions: 'Nettoyage urgent, refaire signaletique, affichage legal manquant' },
    { Magasin: 'Magasin Rennes Republic', Date_audit: '2026-04-24', Proprete: 'Oui', Signaletique: 'Oui', Stock: 'Oui', Securite: 'Oui', Accueil: 'Oui', Conformite: 'Oui', Score: 90, Auditeur: 'Marc Olivier', Region: 'Bretagne', Actions: 'RAS' },
    { Magasin: 'Magasin Montpellier Comedie', Date_audit: '2026-04-23', Proprete: 'Oui', Signaletique: 'Oui', Stock: 'Non', Securite: 'Oui', Accueil: 'Oui', Conformite: 'Oui', Score: 84, Auditeur: 'Sandrine Delmas', Region: 'Occitanie', Actions: 'Ruptures repetees rayon epicerie, revoir contrat fournisseur' },
    { Magasin: 'Magasin Dijon Liberte', Date_audit: '2026-04-23', Proprete: 'Oui', Signaletique: 'Oui', Stock: 'Oui', Securite: 'Oui', Accueil: 'Oui', Conformite: 'Oui', Score: 96, Auditeur: 'Marc Olivier', Region: 'Bourgogne', Actions: 'RAS' },
    { Magasin: 'Magasin Grenoble Alsace', Date_audit: '2026-04-22', Proprete: 'Oui', Signaletique: 'Oui', Stock: 'Oui', Securite: 'Non', Accueil: 'Oui', Conformite: 'Oui', Score: 76, Auditeur: 'Sandrine Delmas', Region: 'Rhone-Alpes', Actions: 'Alarme incendie defectueuse, reparation urgente' },
    { Magasin: 'Magasin Clermont Jaude', Date_audit: '2026-04-22', Proprete: 'Oui', Signaletique: 'Oui', Stock: 'Oui', Securite: 'Oui', Accueil: 'Oui', Conformite: 'Oui', Score: 91, Auditeur: 'Marc Olivier', Region: 'Auvergne', Actions: 'RAS' },
    { Magasin: 'Magasin Angers Ralliement', Date_audit: '2026-04-21', Proprete: 'Non', Signaletique: 'Oui', Stock: 'Oui', Securite: 'Oui', Accueil: 'Non', Conformite: 'Oui', Score: 68, Auditeur: 'Sandrine Delmas', Region: 'Pays de la Loire', Actions: 'Nettoyage sol et vitrines, formation equipe accueil' },
    { Magasin: 'Magasin Tours Grammont', Date_audit: '2026-04-21', Proprete: 'Oui', Signaletique: 'Oui', Stock: 'Oui', Securite: 'Oui', Accueil: 'Oui', Conformite: 'Oui', Score: 94, Auditeur: 'Marc Olivier', Region: 'Centre', Actions: 'RAS' },
    { Magasin: 'Magasin Rouen Gros-Horloge', Date_audit: '2026-04-20', Proprete: 'Oui', Signaletique: 'Non', Stock: 'Non', Securite: 'Oui', Accueil: 'Oui', Conformite: 'Oui', Score: 70, Auditeur: 'Sandrine Delmas', Region: 'Normandie', Actions: 'Mise a jour PLV, reappro urgente zone promo' },
    { Magasin: 'Magasin Metz Saint-Jacques', Date_audit: '2026-04-20', Proprete: 'Oui', Signaletique: 'Oui', Stock: 'Oui', Securite: 'Oui', Accueil: 'Oui', Conformite: 'Oui', Score: 88, Auditeur: 'Marc Olivier', Region: 'Grand Est', Actions: 'RAS' },
    { Magasin: 'Magasin Caen Vaugueux', Date_audit: '2026-04-19', Proprete: 'Oui', Signaletique: 'Oui', Stock: 'Oui', Securite: 'Non', Accueil: 'Oui', Conformite: 'Non', Score: 62, Auditeur: 'Sandrine Delmas', Region: 'Normandie', Actions: 'Camera surveillance HS, registre securite non a jour' },
    { Magasin: 'Magasin Perpignan Castillet', Date_audit: '2026-04-19', Proprete: 'Oui', Signaletique: 'Oui', Stock: 'Oui', Securite: 'Oui', Accueil: 'Oui', Conformite: 'Oui', Score: 93, Auditeur: 'Marc Olivier', Region: 'Occitanie', Actions: 'RAS' },
  ],
};

const audits: DemoDataset = {
  id: 'audits',
  name: 'Audit Magasins',
  description: 'Checklist d\'audit magasins : proprete, securite, conformite. Pour les equipes qualite retail.',
  persona: 'Sandrine, Ops Manager',
  suggestedPrompt: 'Je veux une app checklist pour auditer mes magasins avec un score et des actions correctives.',
  data: auditsData,
};

// ---------------------------------------------------------------------------
// 5. Budgets — Suivi Budget Departements
// ---------------------------------------------------------------------------
const budgetsData: ExcelSheet = {
  sheetName: 'Budgets',
  headers: [
    'Departement', 'Budget_EUR', 'Depenses_EUR', 'Reste_EUR', 'Trimestre',
    'Annee', 'Responsable', 'Statut',
  ],
  totalRows: 20,
  rows: [
    { Departement: 'Marketing', Budget_EUR: 120000, Depenses_EUR: 28500, Reste_EUR: 91500, Trimestre: 'T1', Annee: 2026, Responsable: 'Nathalie Perrin', Statut: 'Sous budget' },
    { Departement: 'R&D', Budget_EUR: 200000, Depenses_EUR: 52000, Reste_EUR: 148000, Trimestre: 'T1', Annee: 2026, Responsable: 'Philippe Marchand', Statut: 'Sous budget' },
    { Departement: 'Production', Budget_EUR: 350000, Depenses_EUR: 95000, Reste_EUR: 255000, Trimestre: 'T1', Annee: 2026, Responsable: 'Mehdi Benali', Statut: 'Conforme' },
    { Departement: 'RH', Budget_EUR: 80000, Depenses_EUR: 22000, Reste_EUR: 58000, Trimestre: 'T1', Annee: 2026, Responsable: 'Sarah Morel', Statut: 'Conforme' },
    { Departement: 'IT', Budget_EUR: 150000, Depenses_EUR: 48000, Reste_EUR: 102000, Trimestre: 'T1', Annee: 2026, Responsable: 'Vincent Garnier', Statut: 'Attention' },
    { Departement: 'Marketing', Budget_EUR: 120000, Depenses_EUR: 65000, Reste_EUR: 55000, Trimestre: 'T2', Annee: 2026, Responsable: 'Nathalie Perrin', Statut: 'Attention' },
    { Departement: 'R&D', Budget_EUR: 200000, Depenses_EUR: 98000, Reste_EUR: 102000, Trimestre: 'T2', Annee: 2026, Responsable: 'Philippe Marchand', Statut: 'Conforme' },
    { Departement: 'Production', Budget_EUR: 350000, Depenses_EUR: 180000, Reste_EUR: 170000, Trimestre: 'T2', Annee: 2026, Responsable: 'Mehdi Benali', Statut: 'Conforme' },
    { Departement: 'RH', Budget_EUR: 80000, Depenses_EUR: 41000, Reste_EUR: 39000, Trimestre: 'T2', Annee: 2026, Responsable: 'Sarah Morel', Statut: 'Conforme' },
    { Departement: 'IT', Budget_EUR: 150000, Depenses_EUR: 112000, Reste_EUR: 38000, Trimestre: 'T2', Annee: 2026, Responsable: 'Vincent Garnier', Statut: 'Depassement' },
    { Departement: 'Marketing', Budget_EUR: 130000, Depenses_EUR: 31000, Reste_EUR: 99000, Trimestre: 'T3', Annee: 2026, Responsable: 'Nathalie Perrin', Statut: 'Sous budget' },
    { Departement: 'R&D', Budget_EUR: 210000, Depenses_EUR: 45000, Reste_EUR: 165000, Trimestre: 'T3', Annee: 2026, Responsable: 'Philippe Marchand', Statut: 'Sous budget' },
    { Departement: 'Production', Budget_EUR: 360000, Depenses_EUR: 88000, Reste_EUR: 272000, Trimestre: 'T3', Annee: 2026, Responsable: 'Mehdi Benali', Statut: 'Conforme' },
    { Departement: 'RH', Budget_EUR: 85000, Depenses_EUR: 19000, Reste_EUR: 66000, Trimestre: 'T3', Annee: 2026, Responsable: 'Sarah Morel', Statut: 'Sous budget' },
    { Departement: 'IT', Budget_EUR: 160000, Depenses_EUR: 42000, Reste_EUR: 118000, Trimestre: 'T3', Annee: 2026, Responsable: 'Vincent Garnier', Statut: 'Conforme' },
    { Departement: 'Marketing', Budget_EUR: 130000, Depenses_EUR: 15000, Reste_EUR: 115000, Trimestre: 'T4', Annee: 2026, Responsable: 'Nathalie Perrin', Statut: 'Sous budget' },
    { Departement: 'R&D', Budget_EUR: 210000, Depenses_EUR: 22000, Reste_EUR: 188000, Trimestre: 'T4', Annee: 2026, Responsable: 'Philippe Marchand', Statut: 'Sous budget' },
    { Departement: 'Production', Budget_EUR: 360000, Depenses_EUR: 35000, Reste_EUR: 325000, Trimestre: 'T4', Annee: 2026, Responsable: 'Mehdi Benali', Statut: 'Sous budget' },
    { Departement: 'RH', Budget_EUR: 85000, Depenses_EUR: 8000, Reste_EUR: 77000, Trimestre: 'T4', Annee: 2026, Responsable: 'Sarah Morel', Statut: 'Sous budget' },
    { Departement: 'IT', Budget_EUR: 160000, Depenses_EUR: 18000, Reste_EUR: 142000, Trimestre: 'T4', Annee: 2026, Responsable: 'Vincent Garnier', Statut: 'Sous budget' },
  ],
};

const budgets: DemoDataset = {
  id: 'budgets',
  name: 'Suivi Budget Departements',
  description: 'Suivi budgetaire trimestriel par departement. Pour les DG et DAF.',
  persona: 'Vincent, DG',
  suggestedPrompt: 'Je veux un dashboard pour suivre les budgets de mes departements par trimestre avec les depassements.',
  data: budgetsData,
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const DEMO_DATASETS: readonly DemoDataset[] = [
  interventions,
  projets,
  visites,
  audits,
  budgets,
] as const;

export function getDemoDatasetById(id: string): DemoDataset | undefined {
  return DEMO_DATASETS.find((ds) => ds.id === id);
}
