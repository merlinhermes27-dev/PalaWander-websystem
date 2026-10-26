
const destinations = [
    // CORON (walang daan mula Puerto Princesa City)
    { name: "Kayangan Lake", town: "Coron", image: "images/kayangan-lake.jpeg", distanceKm: null, travelNote: "Via flight to Busuanga Airport or 10-12 hr ferry from Puerto Princesa, then 30-45 min boat tour from Coron town" },
    { name: "Twin Lagoon", town: "Coron", image: "images/twin-lagoon.jpg", distanceKm: null, travelNote: "Via flight to Busuanga Airport or 10-12 hr ferry from Puerto Princesa, then 30-45 min boat tour from Coron town" },
    { name: "Barracuda Lake", town: "Coron", image: "images/barracuda-lake.jpg", distanceKm: null, travelNote: "Via flight to Busuanga Airport or 10-12 hr ferry from Puerto Princesa, then 30-45 min boat tour from Coron town" },

    // CUYO (walang daan mula Puerto Princesa City)
    { name: "Manamoc Island", town: "Cuyo", image: "images/manamoc-island.jpg", distanceKm: null, travelNote: "Via small plane or 10-12 hr ferry from Puerto Princesa to Cuyo town, then island-hopping boat" },
    { name: "St. Augustine's Chapel", town: "Cuyo", image: "images/st-augustine.jpg", distanceKm: null, travelNote: "Via small plane or 10-12 hr ferry from Puerto Princesa to Cuyo town" },
    { name: "Amanpulo", town: "Cuyo", image: "images/amanpulo.jpg", distanceKm: null, travelNote: "Private resort island — usually via chartered flight from Manila" },

    // EL NIDO (~266 km, ~5-5.5 hrs by van)
    { name: "Vanilla Beach", town: "El Nido", image: "images/vanilla-beach.jpg", distanceKm: 266, travelNote: "" },
    { name: "Town Square", town: "El Nido", image: "images/townsquare.jpg", distanceKm: 266, travelNote: "" },
    { name: "Big Lagoon", town: "El Nido", image: "images/biglagoon.jpeg", distanceKm: 266, travelNote: "30-45 min boat ride (island hopping Tour A)" },
    { name: "Lio Beach", town: "El Nido", image: "images/lio.jpeg", distanceKm: 266, travelNote: "10 min from El Nido town" },
    { name: "Nacpan Beach", town: "El Nido", image: "images/nacpan.jpg", distanceKm: 266, travelNote: "30-40 min drive from El Nido town" },

    // TAYTAY (~247 km, ~5 hrs by van)
    { name: "Fort Santa Isabel", town: "Taytay", image: "images/fort.webp", distanceKm: 247, travelNote: "" },
    { name: "Paraiso Roberto", town: "Taytay", image: "images/paraiso-roberto.jpg", distanceKm: 247, travelNote: "boat ride from Taytay town" },

    // SAN VICENTE (~190 km, ~4 hrs by van)
    { name: "Long Beach", town: "San Vicente", image: "images/long-beach.jpeg", distanceKm: 190, travelNote: "" },
    { name: "Port Barton", town: "San Vicente", image: "images/port-barton.jpeg", distanceKm: 190, travelNote: "45 min-1 hr from San Vicente town proper" },

    // ROXAS (~157 km, ~3 hrs by van)
    { name: "Johnson Island", town: "Roxas", image: "images/johnson.jpg", distanceKm: 157, travelNote: "30-45 min boat ride from Roxas town proper" },
    { name: "Modessa Island", town: "Roxas", image: "images/modessa.jpg", distanceKm: 157, travelNote: "30-45 min boat ride from Roxas town proper" },
    { name: "Purao Island", town: "Roxas", image: "images/purao.webp", distanceKm: 157, travelNote: "30-45 min boat ride from Roxas town proper" },

    // PUERTO PRINCESA (sarili mismong lungsod)
    { name: "Baker's Hill", town: "Puerto Princesa", image: "images/bakers-hill.jpg", distanceKm: 20, travelNote: "" },
    { name: "Mitra's Ranch", town: "Puerto Princesa", image: "images/mitra.jpg", distanceKm: 12, travelNote: "" },
    { name: "Underground River", town: "Puerto Princesa", image: "images/underground.jpeg", distanceKm: 80, travelNote: "1.5-2 hrs land travel + short boat to cave entrance" },
    { name: "Crocodile Farm", town: "Puerto Princesa", image: "images/crocodile.jpg", distanceKm: 15, travelNote: "" },
    { name: "Cowrie Island", town: "Puerto Princesa", image: "images/cowrie.jpeg", distanceKm: 15, travelNote: "30-40 min boat ride from Honda Bay wharf" },
    { name: "Ugong Rock", town: "Puerto Princesa", image: "images/ugongrock.jpg", distanceKm: 75, travelNote: "" },

    // ABORLAN (~65 km, ~1.5 hrs)
    { name: "Apurawan Beach (Little Siargao)", town: "Aborlan", image: "images/apurawan.webp", distanceKm: 65, travelNote: "short habal-habal or trek" },

    // NARRA (~95 km, ~2 hrs)
    { name: "Estrella Falls", town: "Narra", image: "images/estrella.jpg", distanceKm: 95, travelNote: "short trek to the falls" },

    // CULION (via Coron)
    { name: "Ditaytayan Island", town: "Culion", image: "images/ditaytayan.webp", distanceKm: null, travelNote: "Via Coron, then boat ride to Culion/Ditaytayan Island" },

    // CAGAYANCILLO (malapit sa Tubbataha Reef)
    { name: "Tubbataha Reef", town: "Cagayancillo", image: "images/tubbataha.jpg", distanceKm: null, travelNote: "Liveaboard expedition boat only (10-12 hrs), March-June season only" },

    // BALABAC (~211 km to Rio Tuba, +1-2 hr boat crossing)
    { name: "Onok Island", town: "Balabac", image: "images/onok.jpeg", distanceKm: 211, travelNote: "1-2 hr boat crossing from Rio Tuba/Balabac town" }
];
