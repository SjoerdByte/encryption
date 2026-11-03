const ITERATIONS = 600000;
const SALT_BYTES = 16;
const IV_BYTES = 12;

const el = (id) => document.getElementById(id);
const input = el("input");
const passphrase = el("passphrase");
const output = el("output");
const status = el("status");

async function deriveKey(pass, salt) {
    const baseKey = await crypto.subtle.importKey(
        "raw", new TextEncoder().encode(pass), "PBKDF2", false, ["deriveKey"]
    );
    return crypto.subtle.deriveKey(
        {name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256"},
        baseKey,
        {name: "AES-GCM", length: 256},
        false,
        ["encrypt", "decrypt"]
    );
}

function toBase64(bytes) {
    let binary = "";
    for (const b of bytes) binary += String.fromCharCode(b);
    return btoa(binary);
}

function fromBase64(text) {
    const binary = atob(text.trim());
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

async function encrypt(text, pass) {
    const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
    const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
    const key = await deriveKey(pass, salt);
    const ciphertext = new Uint8Array(
        await crypto.subtle.encrypt({name: "AES-GCM", iv}, key, new TextEncoder().encode(text))
    );
    const payload = new Uint8Array(salt.length + iv.length + ciphertext.length);
    payload.set(salt, 0);
    payload.set(iv, salt.length);
    payload.set(ciphertext, salt.length + iv.length);
    return toBase64(payload);
}

async function decrypt(payloadBase64, pass) {
    const data = fromBase64(payloadBase64);
    const salt = data.subarray(0, SALT_BYTES);
    const iv = data.subarray(SALT_BYTES, SALT_BYTES + IV_BYTES);
    const ciphertext = data.subarray(SALT_BYTES + IV_BYTES);
    const key = await deriveKey(pass, salt);
    const plaintext = await crypto.subtle.decrypt({name: "AES-GCM", iv}, key, ciphertext);
    return new TextDecoder().decode(plaintext);
}

function setStatus(message, isError = false) {
    status.textContent = message;
    status.classList.toggle("text-error", isError);
    status.classList.toggle("text-body", !isError);
}

function validate() {
    if (!input.value.trim()) {
        setStatus("Voer eerst tekst in.", true);
        return false;
    }
    if (!passphrase.value) {
        setStatus("Voer een wachtwoord in.", true);
        return false;
    }
    return true;
}

el("encrypt").addEventListener("click", async () => {
    if (!validate()) return;
    setStatus("Bezig met versleutelen...");
    try {
        output.value = await encrypt(input.value, passphrase.value);
        setStatus("Versleuteld.");
    } catch {
        setStatus("Versleutelen mislukt.", true);
    }
});

el("decrypt").addEventListener("click", async () => {
    if (!validate()) return;
    setStatus("Bezig met ontsleutelen...");
    try {
        output.value = await decrypt(input.value, passphrase.value);
        setStatus("Ontsleuteld.");
    } catch {
        output.value = "";
        setStatus("Ontsleutelen mislukt.", true);
    }
});

el("generate").addEventListener("click", () => {
    const words = crypto.getRandomValues(new Uint32Array(4));
    passphrase.value = Array.from(words, (n) => n.toString(36)).join("-");
    passphrase.type = "text";
    el("toggle").textContent = "Verbergen";
    setStatus("Wachtwoord gegenereerd, bewaar het goed.");
});

el("toggle").addEventListener("click", () => {
    const hidden = passphrase.type === "password";
    passphrase.type = hidden ? "text" : "password";
    el("toggle").textContent = hidden ? "Verbergen" : "Tonen";
});

el("copy").addEventListener("click", async () => {
    if (!output.value) return;
    try {
        await navigator.clipboard.writeText(output.value);
        setStatus("Gekopieerd naar klembord.");
    } catch {
        setStatus("Kopiëren lukte niet", true);
    }
});

el("clear").addEventListener("click", () => {
    input.value = "";
    output.value = "";
    passphrase.value = "";
    setStatus("");
    input.focus();
});
