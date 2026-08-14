# D-144 — Users receive a reauthenticated self-service JSON data export

**Date:** 14-Aug-2026  
**Tier:** 3 — owner-decided privacy, financial-data handling, and MVP capability.  

## Decision

FinTutor will provide **Download my data** as a self-service account action. A fresh password
reauthentication is required before the verified JWT subject's active data is assembled into one documented,
dated JSON file.

The export covers holdings with user-facing names and characteristics, income, discretionary categories,
goals and funding links, normalized onboarding context and progress, streak state, and learning-progression
summary/history. It excludes passwords, authentication/service secrets, internal holding aliases,
request-local privacy-mask mappings, retry/idempotency keys, and internal progression control fields.

Web downloads the file through the browser. iOS and Android write it only to temporary app cache, open the
native share/save sheet, and remove the temporary copy afterward. FinTutor does not choose an external
destination or silently upload the export.

## Why

One ownership-scoped artifact gives users practical access to what FinTutor stores and a concrete way to
retain it before deletion. Reauthentication protects the unusually sensitive consolidated file. A
versioned, described JSON envelope is testable and portable without introducing document-format ambiguity.

## Delivery

BQ-105 shipped the authenticated backend route, complete export registry/coverage guard, browser download,
native file sharing and cleanup, and official Expo FileSystem/Sharing dependencies.
