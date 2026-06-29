# EU Monitoring & Emergency-Response Addendum

> **Record control** — Prepared by: [blank — to be assigned] · Reviewed by: Lin Zou, Chief Architect · Approved by: Wen Han

**Document no.** WR-EU-SUMS-MER-01 · **Revision** 00 (DRAFT) · **Date** 2026-06-29
**Owner** Windrose Technology Antwerp NV — SUMS Owner
**Addendum to** WR-B05-SUMS-002 (after-sales monitoring); WR-SUP-02 (process control)
**Basis** UN R156 §7.1.1 (update safety & integrity), §7.1.2 (records); Reg (EU) 2018/858 Arts. 52–53

---

## 1. Purpose
To define how the Belgian entity monitors the EU software-update fleet and responds to failed, unsafe, or interrupted updates, so that the SUMS obligations of the manufacturer named on the Swedish WVTA are met for EU-registered vehicles.

## 2. Monitoring
| Metric | Target |
|---|---|
| OTA campaign success rate | ≥ 98% of targeted VINs within the campaign window |
| Failed/aborted installs | Triaged within 48 h; root-caused before next wave |
| Rollback events | Logged per VIN; reviewed weekly |
| Fleet on approved RXSWIN | 100% before type-approval-relevant changes are declared complete |

Data sources: OTA backend telemetry, dealer/service feedback, after-sales checklist (WR-B05-SUMS-002-01).

## 3. Emergency response
1. **Detect** — a software update introduces a safety or security regression, or a campaign fails at scale.
2. **Contain** — pause the campaign; trigger A/B-partition rollback to the last approved version where available.
3. **Notify** — inform **Transportstyrelsen within 72 hours** of a safety-relevant event; coordinate with WR-EU-CSMS-RFA-01 if a field action is required.
4. **Remediate** — fix, re-validate (WR-T0106-SUMS-001 dev/test), re-authorise (Form F-01), re-deploy.
5. **Close** — update RXSWIN ledger (F-03) and type-approval ledger (F-04); record lessons learned.

## 4. Interfaces
- Cybersecurity-origin events link to R155 (WR-EU-CSMS-VDP-01 / -RFA-01).
- Release authorisation and rollback decisions are held by the Belgian entity's SUMS Owner.

## 5. Roles
- **SUMS Owner (Antwerp NV)** — monitoring oversight, emergency decisions, authority notification.
- **After-Sales / OTA operations** — execution, telemetry, rollback.

## 6. Records & KPIs
Campaign dashboards, incident timeline, authority notifications — retained ≥ 10 years; KPIs to the SUMS management review (WR-CS&SUP-02 series).

## 7. Approval
| Role | Name | Signature | Date |
|---|---|---|---|
| SUMS Owner (Antwerp NV) | | | |
| After-Sales (Antwerp NV) | | | |

*DRAFT for internal review.*
