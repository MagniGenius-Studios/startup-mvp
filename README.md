# Code Feedback Platform (MVP) - AI-Guided Logic Learning

An EdTech coding platform that helps beginners build **core programming logic** by giving **human-friendly feedback** on their code-without relying on traditional compiler error dumps or “DSA-only” practice.

Instead of confusing errors, the platform analyzes what the student wrote, explains **what’s wrong in simple language**, and guides them toward the correct logic.

---

## Why this exists

Most beginner coding experiences fail at the same point:

- Students write code → compiler throws cryptic errors → student gets stuck
- They copy-paste errors into LLMs → they “fix” code without understanding
- Platforms focus heavily on DSA + testcases, not logic thinking

This project focuses on **learning-by-reasoning**:
- What was the student trying to do?
- What did they miss?
- How can we explain the mistake in beginner language?

---

## MVP Scope (Current)

### ✅ What the MVP does
- Accepts student code (and optionally: question prompt + expected approach)
- Uses AI to analyze code logic and common mistakes
- Returns feedback in **simple language**:
  - what’s wrong
  - why it’s wrong
  - what to change next
  - examples / hints (without full spoon-feeding)

### 🚫 What the MVP does NOT do (yet)
- No full compiler + runtime evaluation with 100–1000 test cases
- No heavy judge system like typical coding platforms
- No fully trained in-house model (we use external LLMs initially)

---

## Product Vision (Where this goes)

The long-term platform builds a learning loop:

1. Student writes code  
2. AI gives beginner-friendly feedback  
3. We collect anonymized improvement data (with consent)  
4. We use those patterns to train/fine-tune our own model  
5. Over time, we move from external LLM dependency → to our own specialized model

The goal is a model that’s excellent at:
- beginner mistakes
- reasoning gaps
- logic correction
- “explain like I’m new” feedback

---

## Architecture (High Level)

**Frontend**
- Code editor experience (input + feedback view)
- Lesson/task UI (prompt, hints, attempts, progress)

**Backend / API**
- Auth + user progress (MVP can start lightweight)
- Stores attempts, feedback, and lesson state
- Calls AI analysis service

**AI Feedback Service**
- Prompting + guardrails for safe, helpful feedback
- Output formatting (structured JSON or markdown)
- Feedback quality checks (avoid hallucinations, keep it beginner-friendly)
