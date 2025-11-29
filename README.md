VerifAI – AI + Blockchain Credential Verification

VerifAI is a tamper-proof academic credentialing system that uses AI to extract certificate data and blockchain to store an immutable fingerprint of each credential.

Built using:

⚡ Vite

⚛️ React + TypeScript

🎨 TailwindCSS + shadcn-ui

🔗 Smart Contracts (Hardhat + Solidity)

🤖 Gemini 1.5 Flash (AI Extraction + NL Querying)

🚀 Core Idea

Traditional degree certificates (PDF/JPEG) can be modified easily.

VerifAI fixes this by combining three systems:

1️⃣ AI Extraction (Gemini)

Admin uploads a certificate

Gemini reads it and extracts:

Student Name

University

Degree Type

GPA

Major

Graduation Date

2️⃣ Blockchain Anchoring

After extraction, the admin clicks "Issue Credential", and the system:

Computes a SHA-256 hash of the extracted JSON

Calls a smart contract function issue(hash)

The hash is stored permanently on-chain

No personal data is stored on-chain — just the fingerprint

This creates a tamper-proof record.

3️⃣ Verification Engine

When a student or employer verifies:

They upload or paste the JSON credential

The app re-hashes it

Compares the hash with the blockchain

If match → VALID

If mismatch → FAKE

Even a 1-character change (GPA 3.2 → 3.9) produces a different hash.

🧠 Why This Works

AI = Extracts clean, structured data
DB = Enables fast search for recruiters
Blockchain = Ensures authenticity and prevents forgery

All three combined = A secure, searchable, trustable credential network.

🧩 Features
✅ AI Certificate Extraction

Upload any PDF/JPEG degree and Gemini returns structured JSON.

✅ Blockchain Anchoring

SHA-256 hash stored on Ethereum (local or Sepolia).

✅ Verifiable Credentials

Re-hash uploaded credential → check with contract.

✅ AI Recruiter Agent

Ask:

"Find CS majors with GPA above 3.5"
AI → Generates a filter → Returns matching verified credentials.

✅ UI

Built with shadcn, TailwindCSS, clean components.
