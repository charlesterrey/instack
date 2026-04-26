---
title: "Instack Strategic Assessment"
author: "Un-named"
created: "2026-04-24 20:00:41+00:00"
modified: "2026-04-24 20:00:41+00:00"
extracted: "2026-04-26T08:02:39.723082"
source_format: "docx"
---


# instack -- Market Opportunity & Strategic Assessment

**STRATEGIC ADVISORY**

La plateforme d’apps jetables pour entreprises
Analyse multi-agents -- 5 perspectives strategiques, 12 dimensions d’analyse

Avril 2026 -- Confidentiel
Prepare pour : Charles Terrey
5 agents strategiques : Market Sizing - Devil’s Advocate - GTM Strategy - Tech Risk - VC Lens


## EXECUTIVE SUMMARY


> **Verdict : GO CONDITIONNEL**
> L’opportunite est reelle et le timing est favorable. Le marche des apps enterprise jetables n’existe pas encore en tant que categorie -- c’est le plus grand risque et le plus grand avantage d’instack. Recommandation : lancer avec un scope reduit (Microsoft 365 uniquement, verticale industrie/retail), valider le PMF en 6 mois, puis lever en Seed.



| TAM Global<br>$13.4B<br>Segment citizen dev (2026) | SAM Europe<br>€630M<br>115K entreprises cibles EU | SOM 5 ans<br>$9-14M<br>ARR cible 2030 | Fenetre de tir<br>18-24<br>mois avant réaction Microsoft |
| --- | --- | --- | --- |


Cette analyse a été conduite par cinq agents stratégiques indépendants, chacun examinant instack sous un angle différent : dimensionnement de marché, stress-test des failles (Devil’s Advocate), stratégie go-to-market, risque technique, et investissabilité VC. Leurs conclusions convergent vers un consensus nuancé.

**L’opportunité est réelle. **Aucun acteur ne combine aujourd’hui génération IA + données in-situ (SharePoint/GDrive) + paradigme jetable + agnosticisme Google/Microsoft. Le SaaS sprawl coûte $20B+ par an en licences inutilisées, le shadow IT représente 56% des achats logiciels, et Power Apps frustre ses utilisateurs par sa complexité. Le terrain est fertile.
**Le risque principal est Microsoft. **Avec 20M d’utilisateurs Power Apps et Copilot Studio en pleine expansion, Microsoft peut intégrer nativement ce type de fonctionnalité en 18-24 mois. L’avantage d’instack repose sur la vitesse d’exécution, l’UX, l’agnosticisme multi-écosystème, et la souveraineté européenne.
**Trois conditions non-négociables : **(1) Équipe fondatrice technique senior avec expertise Microsoft Graph API et IA générative, (2) scope réduit au lancement (5 types d’apps, M365 uniquement, verticale retail/industrie France), (3) MVP en 4 mois, 20 bêta-testeurs en 6 mois, première levée en 9-12 mois.

## 01 - DIMENSIONNEMENT DE MARCHE

### Cadre d’analyse : TAM / SAM / SOM
Le marché low-code/no-code global atteint $44.5 milliards en 2026 selon Gartner, avec un CAGR de 19% et une trajectoire vers $81.35B en 2030. instack cible le segment « citizen developer et collaborative tooling », estimé à environ 30% du marché total (excluant RPA, outils purement développeurs, automatisation de process).


| Marché low-code global<br>$44.5B<br>Gartner 2026, CAGR 19% | Projection 2030<br>$81.3B<br>Poussé par l’IA générative | Citizen devs 2026<br>80%<br>Utiliseront du low-code (Gartner) |
| --- | --- | --- |


### TAM -- Total Addressable Market : $13.4B
Le TAM correspond au segment des outils de création d’apps collaboratives par des utilisateurs non-techniques. En appliquant un filtre de 30% au marché low-code global, le TAM s’établit à $13.4B en 2026, avec une trajectoire vers $24.4B en 2030.
### SAM -- Serviceable Addressable Market : EUR 630M (EU) / $2.5B (global)
Le SAM filtre par géographie (Europe), taille d’entreprise (100-2 000 employés), équipement Microsoft 365 ou Google Workspace (75% de pénétration), et secteurs opérationnels (70%). Ce croisement identifie environ 115 000 entreprises cibles en Europe. À un ARPA moyen de €5 500/an (benchmarké sur Glide/Softr), le SAM européen s’établit à ~€630M. L’Europe représentant environ 25% du marché adressable global, le SAM mondial atteint ~$2.5B.
### SOM -- Serviceable Obtainable Market : $9-14M ARR en 5 ans
Avec un taux de pénétration réaliste de 0.4-0.5% du SAM européen en 3 ans, puis 1.5-2% en 5 ans avec début d’expansion internationale :


| Scénario | Clients | ARPA | ARR | Horizon |
| --- | --- | --- | --- | --- |
| Conservateur | 400 | €4 200/an | €1.7M | Année 3 |
| Base | 1 800 | €5 000/an | €9.0M | Année 5 |
| Agressif | 2 500 | €5 500/an | €13.8M | Année 5 |

### Modele de revenus recommande : Hybride
Socle par entreprise (€299/mois) + tarif par créateur actif (€5/utilisateur/mois). Ce modèle aligne le revenu sur la valeur délivrée et facilite le land-and-expand : les viewers sont gratuits, seuls les créateurs paient. À 1 800 entreprises avec 15 créateurs actifs en moyenne, l’ARPA atteint €4 488/an pour un ARR d’environ €9M.
### Signaux de marche cles
- **$20B+ gaspillés annuellement **en licences SaaS inutilisées — signal d’achat direct pour une solution légère et jetable.
- **56% des apps SaaS **achetées hors visibilité IT. Le shadow IT est le buyer signal : les employés bricolent parce qu’ils n’ont pas d’alternative légitime.
- **€80B de dépense sovereign cloud en 2026, **EU en croissance de 83% YoY. La souveraineté est un tailwind structurel pour un acteur européen.
- **Entreprise moyenne : 650+ apps SaaS. **Mid-market : 100-300. La complexité applicative est un problème universel.

## 02 - PAYSAGE CONCURRENTIEL

### Matrice concurrentielle
L’analyse couvre les concurrents directs (plateformes low-code), les concurrents indirects (spreadsheet-app builders), et les menaces de substitution (Microsoft Copilot, Google Gemini).


| Plateforme | Cible | Pricing | Backend | IA Générative | Jetable | Souverain |
| --- | --- | --- | --- | --- | --- | --- |
| Power Apps | Enterprise MS | $20/user/mo | Dataverse | Copilot | Non | Partiel |
| Retool | Développeurs | $10-50/user | DB propre | Basique | Non | Non |
| Appsmith | Devs OSS | Gratuit-$25 | DB propre | Basique | Non | Self-host |
| Budibase | PME/SMB | $5-15/user | DB propre | Basique | Non | Self-host |
| Glide | Citizen devs | $249-750/mo | Sheets | Oui | Non | Non |
| Softr | Non-tech | $139-269/mo | Airtable | Basique | Non | Non |
| AppSheet | Google users | $5-10/user | Sheets/SQL | Gemini | Non | Non |
| instack | Tous employés | €299+€5/créat. | Excel SP/GD | CORE | OUI | EU Souv. |



> **L’espace blanc d’instack**
> Aucun concurrent ne combine ces trois dimensions : (1) apps generees par IA pour non-techniciens, (2) donnees qui restent dans l’ecosysteme existant (SharePoint/Google Drive), (3) paradigme d’apps jetables avec expiration automatique. Glide s’approche du (1) mais stocke les donnees. Power Apps fait le (2) mais est trop complexe. Personne ne fait le (3). C’est un white space verifie.


### Analyse des plaintes Power Apps (signal fort)
Les retours utilisateurs sur Power Apps révèlent un problème systémique qui valide directement la proposition de valeur d’instack :
- Courbe d’apprentissage trop raide pour les utilisateurs non-techniques, même avec Copilot.
- Performance effondree avec gros volumes SharePoint — les connecteurs ralentissent dès quelques milliers de lignes.
- Copilot génère des apps trop complexes que les utilisateurs ne savent pas maintenir, créant une dette technique invisible.
- 47% des organisations craignent le manque de scalabilité, 37% le vendor lock-in (enquête 2025).
### Differenciateurs cles d’instack
- **Zéro friction : **10 minutes pour une app fonctionnelle vs heures sur Power Apps.
- **Zéro dette technique : **l’app expire, la donnée survit. Pas de maintenance, pas de legacy.
- **Agnostique : **Microsoft ET Google — unicité sur le marché. Les entreprises multi-écosystèmes n’ont aucune alternative.
- **Souverain : **self-host EU sur OVH, Scaleway, Outscale — argument massif post-EU Data Act et CLOUD Act.
- **DSI-friendly : **1 plateforme à auditer au lieu de 30 SaaS shadow. Zéro donnée métier stockée.

## 03 - DEVIL’S ADVOCATE -- LES 5 KILL RISKS

L’agent Devil’s Advocate a pour mission de détruire la thèse d’instack en identifiant chaque faille fatale potentielle. Voici les 5 risques majeurs, classés par sévérité, avec contre-arguments et évaluation de leur solidité.

### Kill Risk #1 -- Microsoft Kill Zone (Severite : 9/10)
**La menace : **Microsoft dispose de 20 millions d’utilisateurs Power Apps, Copilot Studio en pleine expansion, et a intégré en avril 2026 un MCP server natif dans Power Apps. Rien n’empêche Microsoft de lancer des « Copilot Quick Apps » — des mini-apps jetables générées directement dans Teams ou SharePoint. Si cela arrive, le SAM d’instack est divisé par 5 en 12 mois.
**Contre-argument : **Microsoft exécute lentement sur l’UX consumer-grade. Power Apps reste complexe malgré 6 ans d’investissement. L’histoire montre que les startups rapides battent les incumbents lents (Slack vs Teams initialement, Notion vs SharePoint). L’agnosticisme Google+Microsoft est un différenciateur structurel que Microsoft ne peut pas répliquer. Le contre tient partiellement — mais c’est une course contre la montre. Fenêtre de 18-24 mois.

### Kill Risk #2 -- Excel-as-Database est un jouet (Severite : 7/10)
**La menace : **Excel a des limites dures : ~1M lignes, concurrence d’écriture quasi-impossible via Graph API, rate limiting à 10K requêtes/10min par tenant. Pour 5 commerciaux, ça fonctionne. Pour 200 utilisateurs simultanés sur un même fichier, c’est la catastrophe.
**Contre-argument : **Le pitch n’est pas « Excel remplace PostgreSQL » mais « vos données restent là où elles sont déjà ». La plateforme doit proposer une migration fluide vers un backend plus robuste (PostgreSQL managé) quand les limites sont atteintes. Si cette migration est transparente, la limite Excel devient un feature d’entrée, pas un plafond. Le contre tient si l’upgrade path est impécable.

### Kill Risk #3 -- Qualite IA = coeur fragile (Severite : 8/10)
**La menace : **Toute la proposition de valeur repose sur « l’IA génère une app fonctionnelle en 10 minutes ». Si l’app générée est médiocre (bugs, UX bancale, mauvais mapping), l’utilisateur passe 2h à débugger et l’illusion du « jetable » s’effondre.
**Contre-argument : **L’état de l’art (v0, bolt.new, Lovable) prouve que les LLMs génèrent déjà des apps web fonctionnelles. La clé est de contraindre la génération à un design system fixe et un nombre limité de patterns (formulaire, dashboard, CRUD, kanban). Moins de liberté = plus de fiabilité. Le contre tient si le scope est volontairement restreint.

### Kill Risk #4 -- Zero moat = zero defensibilite (Severite : 6/10)
**La menace : **Le paradoxe jetable : si les apps sont disposables et les données ne sont pas sur la plateforme, les coûts de switching sont nuls. Aucun effet de réseau, aucun data moat.
**Contre-argument : **Le moat est dans l’adoption organisationnelle. Quand 200 employés utilisent 50 apps, le réflexe est créé. Les templates partagés créent un effet de réseau interne. La marketplace inter-entreprises (vision long terme) crée un vrai réseau. L’intégration profonde avec le tenant M365/Google crée de la friction au switch. Le contre tient moyennement.

### Kill Risk #5 -- Adoption DSI = mur de verre (Severite : 5/10)
**La menace : **Convaincre un DSI de donner accès OAuth à son tenant Microsoft 365 à « encore une plateforme » est difficile. Les DSI sont traumatisés par le shadow IT.
**Contre-argument : **Le pitch DSI n’est pas « ajoutez un outil de plus » mais « remplacez 30 SaaS sauvages par un cockpit central ». Le dashboard avec visibilité sur toutes les apps, les données touchées, les expirations est exactement ce que les DSI veulent. Le fait de ne stocker aucune donnée métier est un argument massif. Le contre tient bien.


> **Verdict Devil’s Advocate**
> Les risques sont reels mais aucun n’est individuellement fatal SI l’execution est excellente. Le risque #1 (Microsoft) est le plus dangereux -- c’est une course contre la montre. Le risque #3 (qualite IA) est le plus controlable -- il depend de l’equipe technique. La these survit au stress-test, mais avec des conditions strictes.


## 04 - ANALYSE DE RISQUE TECHNIQUE

### Matrice de risque technique
Chaque dimension technique est évaluée sur une échelle de 1 à 10 (10 = risque maximal) :


| Dimension technique | Score |
| --- | --- |
| Dependance APIs Microsoft/Google | 8/10 |
| Excel-as-Database | 7/10 |
| Fiabilite generation IA | 6/10 |
| Sandboxing & Securite | 5/10 |
| Architecture de scaling | 4/10 |


### Excel-as-Database : limites et mitigations
- **Concurrence d’écriture : **Graph API ne supporte pas le write-locking. Deux écritures simultanées = la dernière gagne. Mitigation : queue d’écriture côté instack avec retry et conflict resolution.
- **Volume : **Excel max ~1M lignes, mais performance dégradée au-delà de 5K-10K lignes via API. Suffisant pour 90% des use cases PME/mid-market.
- **Rate limits : **Graph API = 10 000 requêtes/10min/app. Google Sheets = 300 req/min/project. Nécessite un middleware de caching intelligent.
- **Migration path (CRITIQUE) : **Prévoir PostgreSQL managé (Supabase, Neon) dès le Day 1 comme upgrade path. La transition doit être transparente pour l’utilisateur.
### Generation IA : etat de l’art 2026
L’écosystème de génération d’apps par IA a considérablement muri. v0 (Vercel) génère des UI React de qualité. bolt.new et Lovable produisent des apps full-stack depuis des prompts. Emergent a atteint $50M ARR en 7 mois avec des apps générées. La stratégie technique recommandée pour instack est de ne PAS générer du code libre, mais d’utiliser un design system fixe avec ~20 templates de composants pré-sécurisés que l’IA assemble. Cela divise le risque par 5.
### Sandboxing : technologies recommandees
- **V8 Isolates (Cloudflare Workers) : **isolation par app, démarrage <5ms, coût négligeable. Meilleur candidat pour la V1.
- **Firecracker (AWS Lambda) : **micro-VMs, isolation totale. Migration si exigences sécurité grand compte.
- **WebAssembly : **sandbox natif et portable, mais écosystème encore immature pour du full-stack.
### Dependance API : le risque existentiel
La dépendance aux APIs Microsoft Graph et Google Workspace est le risque technique le plus sévère (8/10). Microsoft peut durcir les politiques de consentement OAuth, augmenter les tarifs des metered APIs, ou déprécier des endpoints. Google a un historique de déprécations (Google+, Hangouts API). La mitigation recommandée est une couche d’abstraction (adapter pattern) dès le Day 1, avec un backend PostgreSQL en fallback permanent.


> **Score technique global : 6/10 (risque modere-eleve)**
> L’architecture est viable pour un MVP et les 2 premieres annees. Le goulot d’etranglement est la dependance API (8/10). Recommandation : lancer avec Microsoft 365 uniquement, implementer le backend PostgreSQL en parallele des le mois 6, et toujours maintenir un Plan B independant d’Excel.


## 05 - STRATEGIE GO-TO-MARKET

### Strategie d’entree : Product-Led Growth avec conversion top-down
La stratégie optimale est bottom-up entry, top-down expansion. Un employé opérationnel découvre instack, crée une app, la partage à son équipe. L’usage se propage. Quand 3-5 équipes l’utilisent, la DSI reçoit la proposition cockpit de gouvernance. Ce schéma réplique l’adoption de Slack, Notion et Figma en entreprise. Le trigger de conversion free → payant est double : le nombre d’apps actives (au-delà de 3) et le nombre de créateurs (au-delà de 10).
### Segment beachhead

| Dimension | Choix | Justification |
| --- | --- | --- |
| Verticale | Retail multi-sites + Industrie | Besoins ponctuels terrain, équipes non-tech, déjà sur M365 |
| Taille | 200-1 000 employés | Justifie €299/mois, pas d’équipe dev interne |
| Géographie | France + Benelux | Proximité, RGPD avantage, cloud souverain OVH/Scaleway |
| Persona entrée | Responsable Ops / Chef de projet | Bricole sur Excel depuis 5 ans, frustré par Power Apps |

### Positionnement concurrentiel
***« Vos employés créent des apps en 10 minutes. Vos données ne quittent jamais votre SharePoint. »***
- **vs Power Apps : **« 10 minutes au lieu de 10 jours. Sans formation. »
- **vs Retool : **« Pour les métiers, pas pour les devs. Zéro dette technique. »
- **vs Glide/Softr : **« Vos données restent dans votre Microsoft 365, pas dans un cloud américain. »
- **vs Shadow IT : **« Donnez à vos équipes un terrain de jeu sécurisé au lieu de leur interdire de jouer. »
### Canaux de distribution

| Canal | Priorité | Timing | Justification |
| --- | --- | --- | --- |
| Microsoft AppSource | P0 | Mois 3-6 | Visibilité auprès de tous les admins M365. Zéro CAC. |
| Content SEO | P0 | Mois 1+ | Niches « Alternative Power Apps » + « Shadow IT solution » |
| LinkedIn Ads FR/Benelux | P1 | Mois 6+ | Ciblage Ops Managers, DSI. Budget €3-5K/mois max. |
| Partenaires MSP/intégrateurs | P1 | Mois 9+ | Partenaires Microsoft cherchent produits à revendre. |
| Google Workspace Marketplace | P2 | Mois 12+ | Second écosystème. Permet le pitch « agnostique ». |

### L’arme europeenne : souverainete
Le contexte réglementaire européen est un avantage structurel massif en 2026. L’EU Data Act (en vigueur depuis septembre 2025) interdit le vendor lock-in cloud — instack est nativement anti-lock-in. Le CLOUD Act US oblige les fournisseurs américains à fournir des données EU aux autorités US — instack en self-host EU élimine ce risque. Les amendes RGPD cumulées atteignent €7.1B en janvier 2026, terrorisant les DSI. Et 46% des organisations citent la conformité réglementaire comme facteur numéro un de choix cloud. Le marché va vers instack, pas l’inverse.

## 06 - INVESTISSABILITE -- VC LENS

### These d’investissement
L’opportunité est de taille venture. Le low-code est à $44.5B et croissant, mais instack ne joue pas dans le low-code classique — il crée une nouvelle catégorie : les « consumable enterprise apps ». Le précédent est Notion, qui a créé la catégorie « connected workspace » là où Confluence existait déjà. Le timing est presque parfait : l’IA générative est assez mature, les entreprises sont exaspérées par le SaaS sprawl, et le RGPD/CLOUD Act pousse l’Europe vers la souveraineté.
### Analyse du moat
- **Effets de réseau internes : **faibles au début, forts quand l’App Store interne compte 50+ apps partagées.
- **Template marketplace : **inter-entreprises à terme. Si 500 templates sont partagés et clonés, effet Figma Community. Moat fort.
- **Intégration profonde : **le mapping des permissions SharePoint/GDrive, la compréhension de la structure de fichiers — crée de la friction au switch même si les apps sont jetables.
- **Brand/catégorie : **premier à créer la catégorie « disposable enterprise apps » = avantage de naming durable.
### Chemin vers $10M ARR

| Scénario | Clients | ARPA | ARR | Horizon |
| --- | --- | --- | --- | --- |
| Conservateur | 500 | €4 500/an | €2.25M | Année 3 |
| Base | 1 200 | €5 000/an | €6M | Année 4 |
| Agressif | 2 000 | €5 500/an | €11M | Année 4-5 |


Pour référence : Glide est à ~$20M ARR estimés, Retool est valorisée à $3.2B. Le segment est prouvé à grande échelle.
### Plan de financement

| Étape | Montant | Timeline | Milestones |
| --- | --- | --- | --- |
| Pre-Seed | €300-500K | Mois 0-9 | MVP, connexion SharePoint, SSO, 20 bêta-testeurs, 50 apps créées |
| Seed | €1.5-2.5M | Mois 9-12 | 50 entreprises payantes, €200K ARR, NPS>40, équipe 6-8 pers. |
| Séries A | €8-15M | Mois 24-30 | 500+ entreprises, €2M+ ARR, expansion Benelux+DACH, self-hosting |

### Equipe fondatrice requise
- **CTO/Co-fondateur technique (NON NÉGOCIABLE) : **senior, expérience Microsoft Graph API, IA générative, infra cloud. C’est un produit AI-first.
- **CEO/Co-fondateur produit : **expérience B2B SaaS, idéalement ex-entreprise mid-market. Comprend le buyer (DSI + Ops Manager).
- **3ème fondateur idéal : **background enterprise sales ou channel partnerships Microsoft. Ouvre les portes.
### Deal breakers
- Pas de CTO technique senior dans l’équipe fondatrice.
- Pas de différenciation claire vs « Power Apps + Copilot » dans le pitch.
- Architecture MVP qui ne prévoit pas de backend alternatif à Excel.
- Pas de validation terrain avant la levée (minimum 20 bêta-testeurs).
- Go-to-market US-first — le edge est européen, pas américain.


> **Verdict VC : INVEST (conditionnel)**
> Deal Seed attractif sous 3 conditions : (1) equipe fondatrice technique de haut niveau, (2) PMF valide avec 20+ beta-testeurs avant levee, (3) roadmap technique integrant PostgreSQL des le mois 6. Multiple de sortie potentiel : 20-50x sur un Seed a EUR 2M si instack atteint EUR 10M+ ARR. Comparables : Retool ($3.2B), Glide (~$1B), Notion ($10B).


## 07 - SYNTHESE STRATEGIQUE FINALE

Le débat entre les cinq agents stratégiques converge vers un consensus nuancé : instack adresse un problème réel (SaaS sprawl + shadow IT + friction low-code), dans un marché massif ($44.5B low-code, $80B sovereign cloud), avec un angle de différenciation unique (apps jetables + données in-situ + souveraineté européenne).

### L’opportunite est reelle
Aucun acteur ne combine aujourd’hui génération IA + données in-situ + paradigme jetable + agnosticisme Google/Microsoft. C’est un white space vérifié par l’analyse concurrentielle. La question n’est pas « y a-t-il un play ? » mais « la fenêtre de tir est-elle assez large pour s’établir avant que Microsoft ne réagisse ? »
### La taille du play
SAM européen de ~€630M, global de ~$2.5B. Trajectoire vers $9-14M ARR en 5 ans dans le scénario base. Potentiel de sortie (M&A ou Series B+) dans la fourchette €100-500M si la catégorie s’installe — comparable à Glide ou Budibase en phase de croissance.
### Les trois conditions non-negociables


| Condition | Détail | Conséquence si absente |
| --- | --- | --- |
| 1. Équipe technique senior | CTO ayant déjà construit sur Microsoft Graph API et maîtrisant l’IA générative | C’est un PowerPoint, pas un produit |
| 2. Scope réduit au lancement | M365 only, 5 types d’apps max, verticale retail/industrie France | Dispersion des ressources, pas de PMF en 6 mois |
| 3. Vitesse d’exécution | MVP en 4 mois, 20 bêta-testeurs en 6 mois, levée en 9-12 mois | Fenêtre de tir fermée par Microsoft |



> **RECOMMANDATION FINALE**
> GO -- avec une urgence d’execution de niveau guerre.
> Le marche existe, le timing est bon, le white space est verifie. Chaque mois de retard est un risque existentiel.


Analyse produite par 5 agents stratégiques
Market Sizing • Devil’s Advocate • GTM Strategy • Tech Risk • VC Lens
**instack Strategic Assessment — Avril 2026 — Confidentiel**