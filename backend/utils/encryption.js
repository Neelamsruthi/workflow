const crypto = require("crypto");

const ALGORITHM = "aes-256-gcm";

const getEncryptionKey = () => {
    const key = process.env.ENCRYPTION_KEY;

    if (!key) {
        throw new Error(
            "ENCRYPTION_KEY is not configured"
        );
    }

    const buffer = Buffer.from(key, "hex");

    if (buffer.length !== 32) {
        throw new Error(
            "ENCRYPTION_KEY must be a 32-byte hexadecimal key"
        );
    }

    return buffer;
};

const encrypt = (text) => {
    const key = getEncryptionKey();

    const iv = crypto.randomBytes(12);

    const cipher = crypto.createCipheriv(
        ALGORITHM,
        key,
        iv
    );

    let encrypted = cipher.update(
        text,
        "utf8",
        "hex"
    );

    encrypted += cipher.final("hex");

    const authTag =
        cipher.getAuthTag().toString("hex");

    return [
        iv.toString("hex"),
        authTag,
        encrypted
    ].join(":");
};

const decrypt = (encryptedText) => {
    const key = getEncryptionKey();

    const [
        ivHex,
        authTagHex,
        encryptedHex
    ] = encryptedText.split(":");

    const decipher = crypto.createDecipheriv(
        ALGORITHM,
        key,
        Buffer.from(ivHex, "hex")
    );

    decipher.setAuthTag(
        Buffer.from(authTagHex, "hex")
    );

    let decrypted = decipher.update(
        encryptedHex,
        "hex",
        "utf8"
    );

    decrypted += decipher.final("utf8");

    return decrypted;
};

module.exports = {
    encrypt,
    decrypt
};