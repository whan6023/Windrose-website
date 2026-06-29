# EU Threat-Intelligence Monitoring Addendum

> **Record control** — Prepared by: [blank — to be assigned] · Reviewed by: Lin Zou, Chief Architect · Approved by: Wen Han

**Document no.** WR-T0104-CSMS-007-EU · **Revision** 00 (DRAFT) · **Date** 2026-06-29
**Owner** Windrose Technology Antwerp NV — CISO / CSMS Owner
**Addendum to** WR-T0104-CSMS-007 Information Monitoring Procedure
**Basis** UN R155 §7.2.2.2 (monitoring of cyber-threats and vulnerabilities)

---

## 1. Purpose
To extend the existing Information Monitoring Procedure (WR-T0104-CSMS-007) so that, under Windrose Technology Antwerp NV, the CSMS continuously monitors **EU-relevant** cyber-threat and vulnerability sources for the WH13/R700 fleet placed on the EU/EEA market.

## 2. EU monitoring sources (added to WR-T0104-CSMS-007-01)
| Category | Source |
|---|---|
| EU CSIRT network | ENISA advisories; national CSIRTs of EU markets (incl. CCB / CERT.be for Belgium) |
| Sectoral | Auto-ISAC advisories; UNECE WP.29 GRVA cyber items |
| Vulnerability feeds | CVE / NVD; vendor PSIRT bulletins for in-vehicle components (telematics, gateway, ECUs) |
| Supplier intelligence | Tier-1 PSIRT notifications under the Cybersecurity Interface Agreement |
| Regulatory | Transportstyrelsen and EU member-state market-surveillance notices |

## 3. Cadence and triage
- **Continuous** automated feed ingestion; **weekly** triage by the EU CSMS coordinator.
- New items scored for applicability to WH13 systems using the asset/threat mapping in TARA (WR-T0104-CSMS-010).
- Applicable items raised as a vulnerability record in WR-T0104-CSMS-008 within **5 working days**; critical items within **24 hours**.

## 4. Escalation & interfaces
- Confirmed exploitable vulnerabilities → WR-EU-CSMS-VDP-01 (disclosure) and, where a field action is required, WR-EU-CSMS-RFA-01 (recall & field-action).
- Monitoring KPIs (feeds covered, mean time to triage, open/closed counts) reported into the annual CSMS management review (WR-CS&SUP-02).

## 5. Records
- EU monitoring-sources register (extension of WR-T0104-CSMS-007-01)
- Weekly triage log; applicability decisions retained ≥ vehicle lifecycle + 10 years.

## 6. Approval
| Role | Name | Signature | Date |
|---|---|---|---|
| CISO / CSMS Owner | | | |
| EU CSMS Coordinator | | | |

*DRAFT for internal review.*
