// category: {id: name}
// when voting, the subcategories are flattened
let voteCategories = {
    "Qualité de l'enseignement": {
        "answers": "Capable de répondre à une question",
        "correction": "Qualité des corrections des exos",
        "readable": "Ecriture lisible",
        "explanation": "Explication du cours en général",
        "interest": "Sait intéresser la classe",
        "overallTeaching": "Impression générale"
    },
    "Rythme du cours": {
        "speed": "Vitesse et rythme d'un cours",
        "tutorials": "Capable d'avancer dans les TD",
        "organization": "Organisation",
        "skill": "Connaissance de la matière, des cours",
        "speech": "Qualité et vitesse de parole",
        "overallRythm": "Impression générale",
    },
    "Qualités humaines": {
        "passion": "Passion pour son travail",
        "class": "Qualité de la relation avec la classe",
        "open": "A l'écoute en général",
        "authority": "Autorité convenable",
        "overallPerson": "Impression générale"
    }
};

let voteKeys = [];
Object.values(voteCategories).forEach(category => {
    voteKeys.push(...Object.keys(category))
});

// module is manually set to null on the client
// so that this file can be imported both by the server and the clients
if (module != null) module.exports = voteKeys;
