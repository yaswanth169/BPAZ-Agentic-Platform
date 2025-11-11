# Create a Markdown interview prep pack for download
content = r"""
# AI Systems Engineer (No-Code + Agents + Automation) — Interview Package (kitUP)

**Prepared by:** Quick study set customized according to your experiences  
**Scope:** 20 technical Q&A + 10 scenarios + 10 culture/soft-skill + opening speech, demo plan, metrics, checklist  
**Note:** Answers are written in first person so you can read/tell them directly in the interview. Update the bracketed places with your own numbers.

---

## 0) 120-second opening speech (script)
"Hello, I'm Baha. I'm currently working as an AI Engineer intern at Kafein Technology; I develop **agents and automation** with **LangChain/LangGraph, FastMCP, n8n**, Zapier/Make and **Supabase PGVector** based RAG systems. Most recently, I built a CV search assistant based on **vector search + reranking** for HR and several **async agents** working in Slack. I love transforming difficult problems into quick MVPs, moving them to production in the shortest way by **blending no-code with code**.  
What interests me at kitUP is the freedom to **map operational problems** and design end-to-end solutions: APIs, webhooks, data model, automation flow, observability and iteration. My approach: **impact-focused**, measurable and simple solutions; avoiding unnecessary complexity. In short, I don't just write 'chat' and leave; I build **systems that work**."

---

## 1) STAR stories (3 items, short narrative template)

### Story 1 — HR Semantic Search & Assistant (RAG + PGVector + Slack)
- **S**: HR team was struggling to find the skills they were looking for in CVs, manual search was taking too much time.
- **T**: Build a system that quickly indexes CVs and brings **the best candidates** with semantic search + keyword match + scoring.
- **A**: LangChain + OpenAI embeddings, **Supabase PGVector**, metadata filtering; fast query agent in Slack; basic metrics for **eval & logging**.
- **R**: Search time decreased by **[X%]**, correct candidate hit rate increased by **[Y%]**; HR gained **[Z]** hours per week.

### Story 2 — Slack Triage & Async Agents (n8n/FastMCP + Webhooks)
- **S**: Bottleneck was occurring in repetitive Slack requests.
- **T**: **Triage bot** that classifies messages and routes them to the relevant system, prepares summary/answer when needed.
- **A**: n8n + FastMCP; Slack webhook; classification → relevant tool calls → result and logging; **idempotent** design and retry.
- **R**: First response time improved by **[X%]**, manual workload decreased by **[Y hours/week]**.

### Story 3 — Report Automation (Zapier/Make + Looker Studio)
- **S**: Manual reporting was being done from scattered sources.
- **T**: Consolidate Stripe/Notion/Airtable/Google Sheets data **daily automatically**.
- **A**: ETL flows with Make/Zapier; error-catching, Slack alerts; feeding to Looker Studio; versioning.
- **R**: Report preparation time decreased from **[X hours → Y minutes]**, error rate decreased by **[Z%]**.

---

## 2) 20 Technical Questions & Short, Clear Answers

1) **How do you set up an LLM agent architecture?**  
**Answer:** Input → **Prompt template** → **LLM** → **Tool calling** (API/DB/Function) → **Memory** (short/long-term) → Output. I manage steps with **Controller/Planner** (LangGraph); I add **guardrails** and **observability** (trace, cost, latency).

2) **How do you design a tool calling schema?**  
**Answer:** **Required/minimum** parameters, types and constraints with JSON-schema; **idempotency key**, **timeout** and **retry policy**. I validate responses with **pydantic**-like validation, classify errors (user/input, network, provider).

3) **RAG pipeline steps and critical settings?**  
**Answer:** Loader → Splitter (token/semantic) → Embeddings → **Vector store** → Retrieval (k-NN + MMR) → Context assembly → LLM. **Chunk size/overlap**, **metadata** and **filters** (e.g., department, date) are critical; I measure quality with **eval** (hit rate, answer faithfulness).

4) **PGVector vs Pinecone/Weaviate?**  
**Answer:** PGVector: ACID + vector in **single DB**; cost/operation simple. Pinecone/Weaviate: **high scale** and advanced **ANN** features. I choose according to traffic and SLOs; start with PGVector, separate if needed.

5) **LangChain vs LangGraph difference?**  
**Answer:** LangChain is chain and component set; **LangGraph** manages **multi-step flows deterministically** with **state-machine/graph** (retries, branches). I prefer LangGraph for multi-step agents.

6) **Memory strategies?**  
**Answer:** **Short-term** (conversation buffer/summary) + **long-term** (vector DB profile). **Episodic** (session-based) + **semantic memory** (conceptual). I implement **TTL** and PII cleanup.

7) **Prompt robustness and guardrails?**  
**Answer:** **System prompt policy**, **negative constraints**, **tool-first** approach, **output schema validation**, **test prompts** and **adversarial cases**. Track **golden set** and **regression** with LangSmith.

8) **Benefit of orchestration with MCP/FastMCP?**  
**Answer:** Exposes tools with **standard interface**, different agents/applications **reuse** the same tools. Isolation, authorization and observability become easier.

9) **Security and idempotency in webhooks?**  
**Answer:** **Signature verify**, **replay protection**, **idempotency key** (store & check), **at-least-once** instead of **exactly-once** + **safe retry**; **dead-letter queue**.

10) **Rate limit and backoff?**  
**Answer:** **Exponential backoff + jitter**, **token bucket**; **cache** cached/determined results; **batching** at high volume.

11) **Zapier/Make error management?**  
**Answer:** **Error handler branch**, **retry steps**, offset/checkpoint with **storage**, **alerting** (Slack/Email). Automatic recovery according to error class and **manual override**.

12) **Auth patterns (API key/OAuth2)?**  
**Answer:** **Secrets vault**, **scopes**, **least privilege**. **Graceful refresh & retry** on OAuth2 refresh; special logs for authentication errors.

13) **PII and security?**  
**Answer:** **Masking/pseudonymization**, **data retention** policy, **role-based access**, **audit logs**. Don't put PII in prompts, **redaction** layer if needed.

14) **Async agents and queues?**  
**Answer:** **Delayed jobs** and scheduler on no-code side; **Celery/RQ + Redis** or cloud queues on code side. I complete long processes with **callback** or **webhook**.

15) **Test strategy (LLM & automation)?**  
**Answer:** **Unit** (tool adapters), **contract tests** (API), **golden prompts**, **offline eval** (faithfulness/recall), **canary release** and **A/B**.

16) **Observability (no-code + code)**  
**Answer:** **Trace id** end-to-end; central log (JSON), **metrics** (latency, cost, success rate), **structured events**. I log context that shows the **root cause** of errors.

17) **Cost optimization?**  
**Answer:** **Context shortening**, **cache** (semantic/embedding), **distilled models**, short answer with **function calling**; long jobs **batch & async**. **Token budget**/per-user limit.

18) **Versioning and rollback?**  
**Answer:** **Version number** for flows, **feature flags**, **rollback**. **Git-versioned** files and **release notes** for prompts.

19) **No-code vs code selection criteria?**  
**Answer:** **Time-impact** priority; simple CRUD/integration → no-code; custom logic/performance/scale → code. **Observability** and **tests** are essential on both sides.

20) **Going to prod and change management?**  
**Answer:** **Staging → canary → prod**, **migration plan**, **runbook**, **SLA/SLO**; **post-deployment checks** and **error budget** tracking.

---

## 3) 10 Scenario Tasks & Approach Outline

1) **Daily Revenue Report (Stripe → Sheets → Looker)**  
**Approach:** Scheduler in Make → payments from last 24 hours from Stripe API → normalize → Google Sheets → Looker datasource → "done + link" to Slack. Retry + alert on errors.

2) **Slack Support Triage**  
**Approach:** Slack event → classification (routing labels) → FAQ RAG → Jira ticket if needed → summary + suggested answer. "Low-risk auto-reply", "needs-human" flags.

3) **Meta Ads Anomaly Alert**  
**Approach:** Daily fetch → baseline/MA → Slack + Notion incident when threshold exceeded. Root-cause checklist (creative, audience, budget).

4) **Webflow Form → CRM Enrichment**  
**Approach:** Webhook → email domain → company information enrichment → lead + score to CRM → Slack DM to SDR.

5) **Notion → Airtable Calendar Sync**  
**Approach:** Change trigger → mapping table → rule-based field filling → conflict/duplicate record prevention.

6) **Internal Knowledge Assistant (Docs RAG)**  
**Approach:** Document ingest from Git/Notion → splitter/embeddings → PGVector → Q&A with Slack command + source links → feedback loop (helpful/not).

7) **Finance Approval Flow**  
**Approach:** Typeform/Forms → rule-based check → approval hierarchy → ERP/API record after signature → PDF archive; audit log + immutable id.

8) **Email Drafting Assistant**  
**Approach:** Brief → prompt theme + customer history (RAG) → draft → approval mechanism → logging to CRM.

9) **Lead Scoring**  
**Approach:** Behavioral signals + firmographics → scoring → automatic outreach to leads above threshold → feedback of results.

10) **Hiring CV Triage (Your HR project)**  
**Approach:** CV ingest → embedding + metadata → position-based filter → %match score + explanation + source sentences → one-click shortlist for HR.

---

## 4) 10 Culture/Soft-Skill Questions & Sample Answer

1) **Can you learn a new tool in 1 day?**  
Yes. I quickly scan the documentation, clone an example flow, produce a minimal PoC. Last month I produced an MVP with **[Tool X]** the same day and moved it to prod the next day.

2) **How do you deal with uncertainty?**  
I break the problem into parts: "knowns, unknowns, assumptions". I set up a small experiment flow with 1-2 measurable hypotheses.

3) **Speed vs quality?**  
First **working skeleton** (coverage 60–70%), I close risky points with feature flags. Once the impact is proven, I make quality investment.

4) **Stakeholder management?**  
Clear goal, clear metric, short cycle. Weekly 10 min demo + risk list + next steps.

5) **Feedback/pushback**  
I speak with business impact and data. "Solving this request takes 3 days, that alternative takes 1 day and 80% impact."

6) **Privacy/Security**  
PII redaction, access roles, log sanitization; I try to keep sensitive data without prompts.

7) **Failure example**  
I started with wrong data source; observability was weak. Then I added trace id, structured logs; it didn't repeat.

8) **Documentation**  
Runbook, env variables, secrets, rate limit, trigger conditions — all in a single-page "how-to" and diagram.

9) **Remote/async work**  
Standard rituals: daily short status, weekly demo, open kanban, acceptance criteria in every task.

10) **Prioritization**  
I look at ICE/RICE balance; the smallest flow that makes the fastest impact comes first.

---

## 5) Simple ASCII Architecture Diagrams

### A) Slack RAG Assistant
[Slack] → (Event) → [Router] → [RAG: PGVector] → [Tools/API] → [Answer + Sources] → [Slack]

### B) Stripe Daily Report
[Scheduler] → [Stripe API] → [Normalize] → [Google Sheets] → [Looker] → [Slack Notify]

### C) CV Triage
[CV Store] → [Embeddings] → [PGVector] → [Retriever + Filters] → [LLM] → [Shortlist + Rationale]

### D) Triage Bot
[Slack] → [Classifier] → [Route: FAQ/Jira/Owner] → [Log/Trace] → [Feedback Loop]

### E) Anomaly Alert
[Cron] → [Ads API] → [Baseline/MA] → [Threshold] → [Incident + Playbook]

---

## 6) KPI / Metric Examples (update placeholders with your own numbers)

- **Time-to-first-value:** MVP duration **[days]**
- **Manual hours saved:** **[hours/week]**
- **Resolution time:** **[X%]** improvement
- **Accuracy/Precision:** **[X%]**
- **Cost per query:** **[$/request]**, total **[$/month]**
- **Adoption:** active users **[n]**, repeat usage rate **[X%]**

---

## 7) 15-Minute Live Demo Plan

1) **3 min** — Problem & goal (e.g., "speed + accuracy in CV search")  
2) **4 min** — Architecture flow: ingest → vector → retrieval → Slack command  
3) **5 min** — Live demonstration: 2 queries (one edge-case) + source links  
4) **3 min** — Metrics, limits, next steps (eval set, cache, cost)

**Demo content:** A small Supabase table, 30–50 documents, simple Slack slash-command.

---

## 8) 8 Questions You Can Ask at the End of the Interview (short and good)

1) What are the **3 concrete outputs** you expect this role to achieve in the first 90 days?  
2) What **stack** do you currently use for agent/automation and what is the biggest **obstacle**?  
3) How is **versioning and observability** managed when going to production?  
4) What strategies do you adopt for **LLM cost**?  
5) How do you balance "quick experiment + safe prod"?  
6) What are the team's **async rituals** and decision-making mechanism?  
7) Is there a successful **internal automation example** you've seen?  
8) Which area from my background would create the **fastest impact**?

---

## 9) Last-Minute Checklist

- [ ] 3 STAR stories, **numbers updated**  
- [ ] I can draw 5 diagrams in **30 seconds**  
- [ ] Live demo opens with **one command**, fake data ready  
- [ ] Prompt & tool **schemas** at hand (copy-paste)  
- [ ] Token/cost and latency **visible** (log + example)  
- [ ] At least **1 failure** story and inference ready  
- [ ] Memorized **2 original sentences** for "Why kitUP?"

---

## 10) Addendum: Quick Answer Cards (single-line punchlines)

- "I optimize **business impact, not technology**."  
- "**No-code + code** hybrid; right tool for fastest impact."  
- "**Trace id** end-to-end, we find errors in minutes."  
- "**Idempotent & retry-safe** flow; data consistency is essential."  
- "First **MVP**, then **safe scale**."

---

### Quick Practice: 60-second **'Why me?'**
"I put agents and automations into real use by **embedding them in business workflows**. I set up jobs like RAG + PGVector, Slack triage, Stripe reports **within the day** and make them measurable within a week. Documentation, observability and auditability are standard for me. That's why I deliver **[target X]** in the first 30 days, **[target Y]** in 90 days."

"""
with open("/mnt/data/kitup_interview_prep.md", "w", encoding="utf-8") as f:
    f.write(content)

"/mnt/data/kitup_interview_prep.md"
