# 🔐 SOC Lab 1 — Brute Force Attack Detection Using Splunk SIEM

![Status](https://img.shields.io/badge/Status-Complete-brightgreen)
![SIEM](https://img.shields.io/badge/SIEM-Splunk%20Enterprise-orange)
![Platform](https://img.shields.io/badge/Platform-Windows%2011-blue)
![Attack](https://img.shields.io/badge/Attack-Brute%20Force%20RDP-red)
![Level](https://img.shields.io/badge/Level-Junior%20SOC%20Analyst-purple)

---

## 📌 Overview

This lab simulates a real-world Security Operations Center (SOC) environment where a brute-force authentication attack is launched against a Windows 11 host and detected using Splunk Enterprise as the SIEM platform.

The goal is to demonstrate core SOC analyst skills:
- Log ingestion pipeline configuration
- Windows event log monitoring
- Threat detection using SPL (Splunk Processing Language)
- Incident documentation and reporting

> **"I didn't just learn Splunk — I built a detection pipeline, simulated an attack, and caught it."**

---

## 🏗️ Lab Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    ATTACKER MACHINE                      │
│              Kali Linux VM (Same Physical PC)            │
│                   Tool: Hydra (RDP)                      │
└──────────────────────┬──────────────────────────────────┘
                       │ Brute Force RDP Attack
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  TARGET / SIEM HOST                      │
│              Windows 11 — IP: 10.0.0.110                │
│                                                          │
│  [Windows Event Logs]                                    │
│       ↓ Security / System / Application                  │
│  [Splunk Universal Forwarder] ──► Port 9997              │
│       ↓                                                  │
│  [Splunk Enterprise SIEM]                                │
│       ↓                                                  │
│  [Detection Queries + Dashboard]                         │
└─────────────────────────────────────────────────────────┘
```

---

## ⚙️ Environment

| Component | Details |
|-----------|---------|
| **SIEM** | Splunk Enterprise 10.2.1 |
| **Log Agent** | Splunk Universal Forwarder 10.2.2 |
| **Target OS** | Windows 11 Build 26200.8117 |
| **Attacker** | Kali Linux (VM) |
| **Attack Tool** | Hydra |
| **Target Service** | RDP (Remote Desktop Protocol) |

---

## 🔴 Attack Simulation

The attack was performed from Kali Linux using Hydra to simulate a brute-force login attempt over RDP against the Windows 11 host.

```bash
hydra -l Administrator -P /usr/share/wordlists/rockyou.txt rdp://10.0.0.110
```

This generated a high volume of failed authentication attempts, creating detectable patterns in the Windows Security Event Log.

---

## 🔍 Detection — Key Event Codes

| Event Code | Description | Use |
|------------|-------------|-----|
| `4625` | Failed logon attempt | **Primary brute-force indicator** |
| `4624` | Successful logon | Detect success after failures |
| `4648` | Logon with explicit credentials | Lateral movement indicator |
| `4719` | Audit policy changed | Attacker covering tracks |

---

## 📊 Splunk Detection Queries (SPL)

### 1. Find All Failed Logins
```spl
index=main EventCode=4625
```

### 2. Count Failed Logins Per Source IP (Brute Force Pattern)
```spl
index=main EventCode=4625
| stats count by src_ip
| sort -count
```

### 3. Time-Based Spike Detection
```spl
index=main EventCode=4625
| bucket _time span=1m
| stats count by _time, src_ip
```

### 4. Detect Success After Failures (Successful Compromise)
```spl
index=main (EventCode=4625 OR EventCode=4624)
| stats count by EventCode, src_ip
| sort -count
```

---

## 📸 Screenshots

| Screenshot | Description |
|------------|-------------|
| `screenshots/01_logs_flowing.png` | 592 events confirmed in Splunk |
| `screenshots/02_eventcodes.png` | EventCode field visible in left panel |
| `screenshots/03_4625_detection.png` | Failed login events detected |
| `screenshots/04_brute_force_spike.png` | Attack spike visible in timeline |
| `screenshots/05_dashboard.png` | Detection dashboard |

---

## 📝 Findings

After executing the brute-force attack, the following was observed in Splunk:

- **Source IP:** 10.0.0.X (Kali Linux VM)
- **Failed attempts:** Multiple EventCode 4625 entries
- **Time pattern:** High-frequency failures within a 1-minute window — consistent with automated brute-force tooling
- **Detection time:** Under 2 minutes using prepared SPL queries

---

## 🧠 Analyst Thinking — SOC Response

Following the NIST Incident Response Framework:

```
1. DETECTION
   └── EventCode 4625 spike detected via Splunk SPL query

2. ANALYSIS
   └── Source IP identified, attempt count confirmed
   └── Time-based correlation shows automated tooling pattern

3. CONTAINMENT
   └── Block source IP at firewall / Windows Defender
   └── Enforce account lockout policy (5 attempts / 15 min)

4. RECOMMENDATION
   └── Enable MFA on all RDP access
   └── Restrict RDP to VPN-only access
   └── Deploy Splunk alert for >5 failures in 1 minute
   └── Monitor EventCode 4624 post-attack for compromise confirmation
```

---

## 📁 Repository Structure

```
Lab1-SOC-BruteForce-Detection/
│
├── README.md                          ← You are here
├── SOC_Lab1_Report_EriaMutasa.docx    ← Full analyst report
│
├── screenshots/
│   ├── 01_logs_flowing.png
│   ├── 02_eventcodes.png
│   ├── 03_4625_detection.png
│   ├── 04_brute_force_spike.png
│   └── 05_dashboard.png
│
└── splunk-queries/
    └── detection_queries.spl          ← All SPL queries used
```

---

## 🧰 Skills Demonstrated

| Skill | Tool |
|-------|------|
| SIEM Configuration | Splunk Enterprise |
| Log Ingestion Pipeline | Splunk Universal Forwarder |
| Windows Event Log Monitoring | Security / System / App logs |
| Threat Detection | SPL Queries |
| Brute Force Attack Simulation | Hydra on Kali Linux |
| Incident Response Documentation | NIST Framework |

---

## 🗺️ What's Next

This lab is part of a larger cybersecurity portfolio series:

- ✅ **Lab 1** — SOC: Brute Force Detection with Splunk *(this lab)*
- 🔜 **Lab 2** — Vulnerability Assessment with Nmap & OpenVAS
- 🔜 **Lab 3** — Web Application Testing with Burp Suite & DVWA
- 🔜 **Lab 4** — Incident Response Simulation
- 🔜 **Lab 5** — Cloud Security on AWS (S3 Misconfiguration)

---

## 👤 About

**Eria Mutasa** — Aspiring Junior Cybersecurity Analyst

Building hands-on SOC, vulnerability assessment, and web security labs to develop real-world detection and response skills using industry-standard tools.

📧 eriamutasa27@gmail.com
🔗 [LinkedIn](https://www.linkedin.com/in/eria-mutasa-547929193) | [GitHub](https://github.com/eriamutasa/eria-mutasa-portfolio)

---

*This lab was conducted in a controlled, isolated home lab environment for educational purposes only.*
