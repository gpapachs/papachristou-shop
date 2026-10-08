// Η έκδοση διαβάζεται από το package.json (η ΜΟΝΗ γραμμή που αλλάζεις όταν βγάζεις νέα έκδοση).
// Το Vercel δίνει αυτόματα τον κωδικό του commit που χτίστηκε, ώστε να βλέπεις
// ακριβώς ποια έκδοση τρέχει live και να τον ταιριάζεις με τη λίστα Deployments.
const pkg = require("./package.json");

module.exports = {
  env: {
    NEXT_PUBLIC_APP_VERSION: pkg.version,
    NEXT_PUBLIC_APP_COMMIT: (process.env.VERCEL_GIT_COMMIT_SHA || "").slice(0, 7),
  },
};
