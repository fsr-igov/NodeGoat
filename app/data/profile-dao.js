// A6 Fix: Use crypto module for encrypting sensitive data
const crypto = require("crypto");
const config = require("../../config/config");

/* The ProfileDAO must be constructed with a connected database object */
function ProfileDAO(db) {

    "use strict";

    /* If this constructor is called without the "new" operator, "this" points
     * to the global object. Log a warning and call it correctly. */
    if (false === (this instanceof ProfileDAO)) {
        console.log("Warning: ProfileDAO constructor called without 'new' operator");
        return new ProfileDAO(db);
    }

    const users = db.collection("users");

    // A6 Fix: Encryption configuration using AES-256-GCM (authenticated encryption)
    const ALGORITHM = "aes-256-gcm";
    // Ensure key is exactly 32 bytes for AES-256
    const getKey = () => {
        const key = config.cryptoKey || "default_dev_key_change_me_now!!!";
        return Buffer.from(key.padEnd(32, "0").slice(0, 32));
    };

    // A6 Fix: Encrypt sensitive data with random IV and auth tag
    const encrypt = (text) => {
        if (!text) return null;
        try {
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
            let encrypted = cipher.update(text, "utf8", "hex");
            encrypted += cipher.final("hex");
            const authTag = cipher.getAuthTag().toString("hex");
            // Store IV:AuthTag:EncryptedData
            return `${iv.toString("hex")}:${authTag}:${encrypted}`;
        } catch (err) {
            console.error("Encryption error:", err.message);
            return null;
        }
    };

    // A6 Fix: Decrypt sensitive data
    const decrypt = (encryptedData) => {
        if (!encryptedData || !encryptedData.includes(":")) return "";
        try {
            const [ivHex, authTagHex, encrypted] = encryptedData.split(":");
            const iv = Buffer.from(ivHex, "hex");
            const authTag = Buffer.from(authTagHex, "hex");
            const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
            decipher.setAuthTag(authTag);
            let decrypted = decipher.update(encrypted, "hex", "utf8");
            decrypted += decipher.final("utf8");
            return decrypted;
        } catch (err) {
            console.error("Decryption error:", err.message);
            return "[encrypted]";
        }
    };

    this.updateUser = (userId, firstName, lastName, ssn, dob, address, bankAcc, bankRouting, callback) => {

        // Create user document
        const user = {};
        if (firstName) {
            user.firstName = firstName;
        }
        if (lastName) {
            user.lastName = lastName;
        }
        if (address) {
            user.address = address;
        }
        // A6 Fix: Encrypt sensitive financial and personal data
        if (bankAcc) {
            user.bankAcc = encrypt(bankAcc);
        }
        if (bankRouting) {
            user.bankRouting = encrypt(bankRouting);
        }
        if (ssn) {
            user.ssn = encrypt(ssn);
        }
        if (dob) {
            user.dob = encrypt(dob);
        }

        users.update({
                _id: parseInt(userId)
            }, {
                $set: user
            },
            err => {
                if (!err) {
                    console.log("Updated user profile");
                    return callback(null, user);
                }

                return callback(err, null);
            }
        );
    };

    this.getByUserId = (userId, callback) => {
        users.findOne({
                _id: parseInt(userId)
            },
            (err, user) => {
                if (err) return callback(err, null);

                // A6 Fix: Decrypt sensitive data for display to authorized user
                if (user) {
                    user.ssn = user.ssn ? decrypt(user.ssn) : "";
                    user.dob = user.dob ? decrypt(user.dob) : "";
                    user.bankAcc = user.bankAcc ? decrypt(user.bankAcc) : "";
                    user.bankRouting = user.bankRouting ? decrypt(user.bankRouting) : "";
                }

                callback(null, user);
            }
        );
    };
}

module.exports = { ProfileDAO };
