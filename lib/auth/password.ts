import crypto from "crypto";

const SCRYPT_PARAMS = {
    N: 16384, // CPU/memory cost parameter
    r: 8,     // block size parameter
    p: 1,     // parallelization parameter
    keyLen: 64
};

/**
 * Hashes a plaintext password using Node's cryptographic scrypt algorithm.
 * Returns format: scrypt$salt$derivedKey
 */
export async function hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const salt = crypto.randomBytes(16).toString("hex");
        crypto.scrypt(
            password,
            salt,
            SCRYPT_PARAMS.keyLen,
            { N: SCRYPT_PARAMS.N, r: SCRYPT_PARAMS.r, p: SCRYPT_PARAMS.p },
            (err, derivedKey) => {
                if (err) return reject(err);
                resolve(`scrypt$${salt}$${derivedKey.toString("hex")}`);
            }
        );
    });
}

/**
 * Constant-time verification of a plaintext password against a stored hash or legacy credentials.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<{ verified: boolean; needsRehash: boolean }> {
    if (!storedHash || !password) {
        return { verified: false, needsRehash: false };
    }

    // Modern scrypt hash format: scrypt$salt$hash
    if (storedHash.startsWith("scrypt$")) {
        const parts = storedHash.split("$");
        if (parts.length !== 3) {
            return { verified: false, needsRehash: false };
        }

        const salt = parts[1];
        const hash = parts[2];
        const hashBuffer = Buffer.from(hash, "hex");

        return new Promise((resolve) => {
            crypto.scrypt(
                password,
                salt,
                hashBuffer.length,
                { N: SCRYPT_PARAMS.N, r: SCRYPT_PARAMS.r, p: SCRYPT_PARAMS.p },
                (err, derivedKey) => {
                    if (err) return resolve({ verified: false, needsRehash: false });
                    
                    try {
                        const match = crypto.timingSafeEqual(hashBuffer, derivedKey);
                        resolve({ verified: match, needsRehash: false });
                    } catch {
                        resolve({ verified: false, needsRehash: false });
                    }
                }
            );
        });
    }

    // Backward compatibility: Support legacy plain text credentials (e.g. initial 'admin123')
    // If matched, signals needsRehash: true to immediately upgrade to scrypt
    const plainMatch = password === storedHash;
    return { verified: plainMatch, needsRehash: plainMatch };
}
