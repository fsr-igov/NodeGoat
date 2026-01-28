// default app configuration
const port = process.env.PORT || 4000;
let db = process.env.MONGODB_URI || "mongodb://localhost:27017/nodegoat";

module.exports = {
    port,
    db,
    // A5 Fix: Use environment variables for secrets, with dev-only fallbacks
    cookieSecret: process.env.COOKIE_SECRET || "dev_only_insecure_secret_change_in_production",
    cryptoKey: process.env.CRYPTO_KEY || "dev_only_insecure_key_32ch!",
    cryptoAlgo: "aes-256-gcm", // A6 Fix: Use authenticated encryption
    hostName: "localhost",
    environmentalScripts: []
};

