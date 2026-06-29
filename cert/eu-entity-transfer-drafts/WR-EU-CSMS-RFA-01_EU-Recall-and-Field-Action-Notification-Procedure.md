# EU Recall & Field-Action Notification Procedure

> **Record control** — Prepared by: [blank — to be assigned] · Reviewed by: Lin Zou, Chief Architect · Approved by: Wen Han

**Document no.** WR-EU-CSMS-RFA-01 · **Revision** 00 (DRAFT) · **Date** 2026-06-29
**Owner** Windrose Technology Antwerp NV — Quality / Regulatory (with CISO for cyber cases)
**Basis** Regulation (EU) 2018/858 Arts. 52–53 (non-compliance, safety/cyber field actions); UN R155 §7.3
**Extends / EU-isation of** WR-P0101-MS-011 Quality-Defect Recall Management Procedure

---

## 1. Purpose
To define how Windrose Technology Antwerp NV, as the manufacturer named on WVTA `e5*2018/858*00525`, notifies authorities and executes recalls / field actions for the EU/EEA fleet — including cybersecurity-driven actions arising from R155 monitoring and disclosure.

## 2. When this applies
- A safety or cybersecurity risk is identified in vehicles in service (via WR-T0104-CSMS-007-EU monitoring, WR-EU-CSMS-VDP-01 disclosure, or field reports).
- A non-conformity to the type approval is discovered.

## 3. Notification
| Recipient | Trigger | Deadline |
|---|---|---|
| **Transportstyrelsen** (approval authority) | Any safety/cyber field action or serious non-compliance affecting approved vehicles | Without undue delay; **within 72 h** of decision to act |
| **Affected EU member-state authorities** | Vehicles registered in those markets | In parallel with the above |
| **Operators / owners** | All affected VINs | Per the campaign plan (see §4) |

Notification package: affected VIN range (YCB WMI), description of risk, root cause, remedy, rollout plan and timeline.

## 4. Field-action execution
1. Define scope from build records and the HW/SW version ledger (Form F-05, WR-T0108-SUMS-002-01).
2. Choose remedy: software update (route via SUMS / R156, RXSWIN updated) or physical action.
3. Run the campaign; track completion rate; escalate non-responders.
4. Close out with evidence to the authority.

## 5. Interfaces
- Cyber cases originate from WR-EU-CSMS-VDP-01; software remedies execute under R156 SUMS (WR-SUP-02 / Form F-01 campaign).
- Recall outcomes feed TARA and monitoring lessons-learned.

## 6. Roles
- **Quality / Regulatory (Antwerp NV)** — owns authority notification and campaign closure.
- **CISO / CSMS Owner** — owns cyber risk assessment and remedy adequacy.

## 7. Records
Notification log, campaign records, completion evidence — retained ≥ 10 years. KPIs to annual management review.

## 8. Approval
| Role | Name | Signature | Date |
|---|---|---|---|
| Quality / Regulatory (Antwerp NV) | | | |
| CISO / CSMS Owner | | | |

*DRAFT for internal review.*
