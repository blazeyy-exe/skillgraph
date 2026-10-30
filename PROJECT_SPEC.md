# SkillGraph — Product Specification

**Status:** Phase 0 complete. Phase 1 in progress.  
**Category:** AI-powered capability intelligence platform  
**Promise:** Discover what you can do. Prove what you're capable of. Find where it can take you.  
**Belief:** Your abilities go beyond your qualifications.

## Problem

Traditional CVs, degrees, and job titles hide most of what people can actually do. Informal work, volunteering, self-teaching, caregiving, community organising, and independent building produce real capability — and almost none of it is structured, evidenced, or portable.

## What SkillGraph is

SkillGraph discovers abilities from real experiences, maps them into a living capability graph, attaches evidence, verifies through practical assessment, and matches people to opportunities based on demonstrated ability rather than credentials.

It is **not**:

- An AI CV generator
- A generic chatbot
- A personality test
- A course marketplace
- A conventional job board
- A generic skills-recommendation widget

The product is defined by the chain:

**experience → tasks → inferred capabilities → evidence → practical verification → opportunities**

## Audience

Students, self-taught people, informal workers, volunteers, independent creators, entrepreneurs, career changers, people with disabilities, and anyone without conventional professional qualifications.

The product must never require a university degree, job title, or certificate to demonstrate capability.

## Core user journey

1. Create an account and complete optional onboarding.
2. Describe real experiences (conversation, documents, links, or manual records).
3. AI investigates those experiences and decomposes them into tasks — it does not invent achievements.
4. The capability engine maps tasks to a skill ontology (ESCO / O\*NET first) with explanations.
5. The user reviews, accepts, rejects, or corrects inferences.
6. Evidence is attached; states remain Unexplored / Inferred / Developing / Demonstrated.
7. Challenge Lab assessments verify skills against rubrics.
8. Growth Intelligence proposes practice-first development paths.
9. Opportunity Engine matches demonstrated and transferable capabilities to real listings.
10. The user shares a selective, portable capability passport.

## Evidence states

| State | Meaning |
| --- | --- |
| Unexplored | No meaningful signal yet |
| Inferred | Model mapped experience/tasks to a skill; not proven |
| Developing | Practice, partial evidence, or incomplete assessment |
| Demonstrated | Policy-satisfied evidence and/or assessment — **never** set by an LLM alone |

Measurement dimensions stay separate:

1. Evidence confidence
2. Demonstrated proficiency
3. Evidence coverage

Do not collapse these into one score. Do not claim scientific calibration without validation data.

## Product surfaces

### Public

`/`, `/how-it-works`, `/about`, `/privacy`, `/terms`, `/login`, `/signup`, plus password recovery and email verification.

### Authenticated

`/app` overview, discover, experiences, graph, evidence, challenges, assessments, growth, opportunities, profile, settings. Protected by session. Onboarding may be completed progressively.

### Public sharing (Phase 8)

Opt-in public profile URLs showing only explicitly shared items.

## Success definition

A feature is done only when UI, server logic, database, permissions, validation, loading/error states, responsive behaviour, and tests all work. Pages that merely render are not complete.

## Out of scope until later phases

- External job-board scraping
- Training models on private user evidence
- Python microservices (added only when document/assessment pipelines need them)
- Claiming a generated listing is a real opportunity
