# 🔐 SOC Lab 1 — Brute Force Attack Detection Using Splunk SIEM

![Status](https://img.shields.io/badge/Status-Complete-brightgreen)
![SIEM](https://img.shields.io/badge/SIEM-Splunk%20Enterprise-orange)
![Platform](https://img.shields.io/badge/Platform-Windows%2011-blue)
![Attack](https://img.shields.io/badge/Attack-Brute%20Force-red)
![Level](https://img.shields.io/badge/Level-Junior%20SOC%20Analyst-purple)
![MITRE](https://img.shields.io/badge/MITRE-T1110.001-darkred)

---

## 📌 Overview

This lab simulates a real-world Security Operations Center (SOC) environment where a brute-force authentication attack is launched against a Windows 11 host and detected using Splunk Enterprise as the SIEM platform.

**Results:** 80 failed logon attempts generated, detected in under 2 minutes, zero compromise confirmed.

> *"I didn't just learn Splunk — I built a detection pipeline, simulated a brute-force attack, caught it live, confirmed no compromise, and documented the full incident response."*

---

## 🏗️ Lab Architecture

```
┌─────────────────────────────────────────────────────────┐
│              ATTACK SIMULATION                           │
│         PowerShell Credential Test Script                │
│         80 password attempts against labuser            │
└──────────────────────┬──────────────────────────────────┘
                       │ 80 × Failed Auth Attempts
                       ▼
┌─────────────────────────────────────────────────────────┐
│                TARGET / SIEM HOST                        │
│           Windows 11 — IP: 10.0.0.110                   │
│                                                          │
│  [Windows Security Event Log]                            │
│       ↓ EventCode 4625 (Failed Logon) ×80               │
│  [Splunk Universal Forwarder] ──► Port 9997              │
│       ↓                                                  │
│  [Splunk Enterprise SIEM]                                │
│       ↓                                                  │
│  [Detection Queries + Dashboard + Alert Rules]           │
└─────────────────────────────────────────────────────────┘
```

---

## ⚙️ Environment

| Component | Details |
|-----------|---------|
| **SIEM** | Splunk Enterprise 10.2.1 |
| **Log Agent** | Splunk Universal Forwarder 10.2.2 |
| **Target OS** | Windows 11 Build 26200.8117 |
| **Attack Method** | PowerShell credential test script (80 attempts) |
| **Detection** | SPL queries + Splunk Dashboard + Alert Rules |

---

## 🔴 Attack Simulation

A PowerShell script simulated brute-force authentication by generating 80 failed logon attempts against the `labuser` account using a common password wordlist.

**Attack characteristics detected:**
- 14 failed attempts in a single 60-second window (automated signature)
- Concentrated burst: 09:52–09:53 AM (2-minute window)
- Failure reason: "Unknown user name or bad password" across all 80 attempts

---

## 🔍 Detection — Key Event Codes

| Event Code | Description | Observed Count |
|------------|-------------|---------------|
| `4625` | Failed logon attempt | **80 — primary attack evidence** |
| `4624` | Successful logon | 0 for labuser — no compromise |
| `4648` | Logon with explicit credentials | Monitored |
| `4719` | Audit policy changed | Monitored |

---

## 📊 Splunk Detection Queries (SPL)

### Primary Detection
```spl
index=main EventCode=4625 LogName=Security
| stats count by Account_Name, Failure_Reason
| sort -count
```

### Spike Analysis (Proved Automation)
```spl
index=main EventCode=4625 LogName=Security
| bucket _time span=1m
| stats count by _time, src_ip
| sort -_time
```

### Compromise Check
```spl
index=main (EventCode=4624 OR EventCode=4625) LogName=Security Account_Name=labuser
| eval Result=if(EventCode=4624,"SUCCESS - COMPROMISED","FAILED - Blocked")
| stats count by Result
```

### SOC Alert Rule (Fires if >10 failures in 5 min)
```spl
index=main EventCode=4625 LogName=Security earliest=-5m
| stats count by Account_Name
| where count > 10
```

---

## 📸 Screenshots

### Day 1 — Lab Setup & Pipeline Validation
| Screenshot | Description |
|------------|-------------|
| `screenshots/screenshot1_logs_flowing.png` | 592 events confirmed flowing into Splunk |
| `screenshots/screenshot2_eventcodes.png` | EventCode field — log structure confirmed |
| `screenshots/screenshot3_4625_detection.png` | First EventCode 4625 events detected |
| `screenshots/screenshot4_stats_table.png` | SPL aggregation table |
| `screenshots/screenshot5_forensics_timeline.png` | 1,216 event forensics timeline |

### Day 2 — Attack Simulation & Detection
| Screenshot | Description |
|------------|-------------|
| `screenshots/screenshot6_attack_detected.png` | labuser 80 attempts — attack confirmed |
| `screenshots/screenshot7_spike_chart.png` | Line chart — spike proves automation |
| `screenshots/screenshot8_attack_timeline.png` | 80 events chronologically |
| `screenshots/screenshot9_no_compromise.png` | FAILED×80, SUCCESS×0 — not compromised |
| `screenshots/screenshot_day2_Dashboard.png` | Named Splunk dashboard built |
| `screenshots/Screenshot_day2_Visualization.png` | Column chart — attack window |
| `screenshots/screenshot4_day2_triggers_a_real_alert.png` | SOC alert rule triggered |
| `screenshots/screenshot3_day2_attack_timeline.png` | Minute-by-minute spike: 2→14→6 |
| `screenshots/screenshot_day2_statistics.png` | Second attack run detected |
| `screenshots/screenshot_day2_attack_detected.png` | 31 live events real-time |

---

## 📝 Key Findings

| Finding | Detail |
|---------|--------|
| Target account | labuser |
| Failed attempts | 80 × EventCode 4625 |
| Attack window | ~2 minutes |
| Peak spike | 14 failures in 60 seconds |
| Compromise | ✅ NOT compromised — 0 × EventCode 4624 |
| Alert triggered | Yes — 20 attempts in 5 minutes exceeded threshold |
| Detection time | Under 2 minutes |

---

## 🧠 Analyst Response — NIST IR Framework

```
1. DETECTION
   └── EventCode 4625 spike detected — 14 failures in 60 seconds
   └── SOC alert rule triggered at >10 failures in 5 minutes

2. ANALYSIS
   └── labuser targeted — 80 total attempts
   └── Failure_Reason: Unknown user name or bad password
   └── Automated attack confirmed via time-based spike analysis
   └── MITRE ATT&CK: T1110.001 — Password Guessing

3. CONTAINMENT
   └── Account NOT compromised — EventCode 4624 count = 0
   └── Recommended: Account lockout policy (5 attempts / 15 min)
   └── Recommended: MFA enforcement on all accounts

4. RECOMMENDATION
   └── Enable Splunk scheduled alert for >5 failures in 1 minute
   └── Restrict authentication to VPN-only access
   └── Regular baseline review of EventCode 4625 volume
   └── Disable/rename default accounts (labuser, Administrator)
```

---

## 📁 Repository Structure

```
Lab1-SOC-BruteForce-Detection/
│
├── README.md                                    ← You are here
├── SOC_Lab1_Report_EriaMutasa.docx              ← Day 1 setup report
├── SOC_Lab1_IncidentReport_Day2_EriaMutasa.docx ← Full incident report
│
├── screenshots/
│   ├── Day 1 (5 screenshots — pipeline setup)
│   └── Day 2 (10 screenshots — attack & detection)
│
└── splunk-queries/
    └── detection_queries.spl                    ← All 12 SPL queries
```

---

## 🧰 Skills Demonstrated

| Skill | Evidence |
|-------|----------|
| SIEM Configuration | Splunk Enterprise — configured from scratch |
| Log Ingestion | Splunk Universal Forwarder — 3 channels active |
| Threat Detection | EventCode 4625 spike — caught in <2 minutes |
| SPL Query Writing | 12 queries across detection, analysis, alerting |
| Dashboard Building | Named Splunk dashboard created |
| Alert Engineering | Threshold-based SOC rule written and triggered |
| Incident Response | Full NIST IR framework applied |
| MITRE ATT&CK | T1110, T1110.001 mapped |
| Documentation | 2 professional reports + 15 screenshots |

---

## 🗺️ Portfolio Series

- ✅ **Lab 1** — SOC: Brute Force Detection with Splunk *(complete)*
- 🔜 **Lab 2** — Vulnerability Assessment with Nmap & OpenVAS
- 🔜 **Lab 3** — Web Application Testing with Burp Suite & DVWA
- 🔜 **Lab 4** — Incident Response Simulation
- 🔜 **Lab 5** — Cloud Security on AWS (S3 Misconfiguration)

---

## 👤 About

**Eria Mutasa** — Aspiring Junior Cybersecurity Analyst

Building hands-on SOC, vulnerability assessment, and web security labs using industry-standard tools to develop real-world detection and response skills.

📧 eriamutasa27@gmail.com
🔗 [LinkedIn](https://www.linkedin.com/in/eria-mutasa-547929193) | [GitHub](https://github.com/eriamutasa/eria-mutasa-portfolio)

---

*This lab was conducted in a controlled, isolated home lab environment for educational and portfolio purposes only.*
