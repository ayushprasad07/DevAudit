# 🚀 DevAudit AI

### Your dependencies are lying to you. Let's fix that.

**DevAudit AI** is the open-source dependency auditor that doesn't just tell you *what's* outdated — it tells you *how to fix it*. Point it at a GitHub repo and get license risk, dependency health, and AI-generated migration guides written for **your actual code**, not generic docs.

Static analysis + RAG + LLMs, working together so you spend less time reading changelogs and more time shipping.

---

## 😤 The Problem

Keeping dependencies up to date shouldn't feel like archaeology.

* Breaking changes are scattered across GitHub Releases, blogs, and half-updated docs.
* Developers burn hours manually hunting for migration guides.
* License compliance is a minefield nobody has time to map.
* Every existing tool stops at *"this package is outdated"* — none of them tell you what to actually change.

**DevAudit closes that gap.**

---

## ✨ The Vision

```
Connect GitHub  →  Pick a repo  →  Scan dependencies  →  Get answers
```

In four steps, a developer should be able to:

1. 🔗 Connect their GitHub account
2. 📂 Select a repository
3. 🔍 Scan every dependency
4. 🎯 See outdated packages, license risks, and breaking changes
5. 🤖 Get AI-generated migration guidance based on their **own codebase**

---

## 🏗️ How It Works

```text
GitHub Repository
        │
        ▼
Repository Manager
        │
        ▼
Project Detector          →  "this is a Node project"
        │
        ▼
Dependency Scanner        →  reads package.json, requirements.txt, etc.
        │
        ▼
Scan Result
        │
        ▼
Package Intelligence      →  enriches with live registry data
        │
        ▼
Dependency Report
        │
        ▼
RAG Engine (Planned)      →  ingests changelogs & docs
        │
        ▼
Migration Generator (Planned)  →  writes the fix for you
```

---

## 🛠️ Tech Stack

| Layer | Tools |
|---|---|
| **Backend** | Python · Flask · MongoDB · PyMongo · JWT Auth · GitHub OAuth · GitPython |
| **Frontend** | Next.js · TypeScript · Tailwind CSS |
| **AI / RAG** *(planned)* | Pinecone · Hugging Face Sentence Transformers · LLMs · GitHub Releases · Changelog Retrieval |

---

## 📁 Backend Structure

```text
backend/
│
├── app/
│   ├── auth/          ├── database/       ├── github/
│   ├── clients/        ├── detectors/      ├── handlers/
│   ├── entities/        ├── factories/      ├── intelligence/
│   ├── models/           ├── repository/     ├── routes/
│   ├── scanners/          ├── services/        └── utils/
│
├── run.py
└── requirements.txt
```

---

## ✅ What's Already Built

**🔐 Auth & Users** — GitHub OAuth, JWT generation/verification, login tracking, token storage
**📦 Repository Management** — cloning, local path management, cleanup, existence checks
**🕵️ Project Detection** — auto-detects Node, Python, Java, Dart, Go, Rust projects from their manifest files
**🔎 Dependency Scanning** — pluggable scanner architecture (one scanner per ecosystem)
**🧠 Package Intelligence** — enriches raw dependencies with live registry data: latest version, license, homepage, repo URL
**⚠️ Error Handling** — global exception handling, custom exception hierarchy, consistent API responses

---

## 🧬 Domain Model

`User` · `Dependency` · `PackageInfo` · `DependencyReport` · `RepositoryReport` · `ScanResult`

*(Migration-specific entities land once the AI pipeline ships.)*

---

## 📌 What's Coming Next

**🌍 Every registry that matters**
npm · PyPI · Maven Central · crates.io · pub.dev · Go Modules · Packagist · RubyGems

**📊 Real analysis**
Version comparison · license risk detection · vulnerability scanning · upgrade recommendations

**🧠 The RAG pipeline**
GitHub Releases + CHANGELOGs + docs → chunked, embedded, indexed in Pinecone → retrieved on demand

**🎯 A scanner that reads smart, not everything**
Instead of dumping your whole repo into an LLM: find the outdated dependency → find the files that actually import it → send *only those* for analysis. Faster, cheaper, more accurate.

**🤖 AI-powered migration guidance**

```text
📦 next-auth v4 → v5

📄 File: app/api/auth/[...nextauth]/route.ts

❌ Before                              ✅ After
import { getServerSession }            import { auth } from "@/auth"
  from "next-auth"
const session =                        const session = await auth()
  await getServerSession(authOptions)

📖 next-auth v5 replaces getServerSession() with auth().
```

---

## 🎯 The Long Game

A language-agnostic platform that audits your dependencies, catches breaking changes before they break you, understands your actual source code, and hands you a migration plan instead of just a warning label.

---

## 🚧 Status

Backend foundation is live: auth, repository management, project detection, and the core analysis pipeline are working. Next up: package intelligence at scale, dependency risk analysis, the RAG knowledge base, and AI-generated migrations.

---

## 📜 License

Under active development — license TBD.