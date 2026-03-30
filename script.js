document.addEventListener("DOMContentLoaded", () => {
    // =========================================================
    // 1. Network Node Canvas Background
    // =========================================================
    const canvas = document.getElementById("network-canvas");
    const ctx = canvas.getContext("2d");
    let particlesArray = [];
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let mouse = {
        x: null,
        y: null,
        radius: (canvas.height/80) * (canvas.width/80)
    };

    window.addEventListener('mousemove', function(event) {
        mouse.x = event.x;
        mouse.y = event.y;
    });

    class Particle {
        constructor(x, y, directionX, directionY, size, color) {
            this.x = x; this.y = y;
            this.directionX = directionX; this.directionY = directionY;
            this.size = size; this.color = color;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = '#00f0ff';
            ctx.fill();
        }
        update() {
            if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX;
            if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY;
            
            // Collision detection - mouse position / particle position
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx*dx + dy*dy);
            if (distance < mouse.radius + this.size){
                if (mouse.x < this.x && this.x < canvas.width - this.size * 10) this.x += 10;
                if (mouse.x > this.x && this.x > this.size * 10) this.x -= 10;
                if (mouse.y < this.y && this.y < canvas.height - this.size * 10) this.y += 10;
                if (mouse.y > this.y && this.y > this.size * 10) this.y -= 10;
            }
            this.x += this.directionX;
            this.y += this.directionY;
            this.draw();
        }
    }

    function initParticles() {
        particlesArray = [];
        let numberOfParticles = (canvas.height * canvas.width) / 12000;
        for (let i = 0; i < numberOfParticles; i++) {
            let size = (Math.random() * 2) + 1;
            let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
            let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
            let directionX = (Math.random() * 1) - 0.5;
            let directionY = (Math.random() * 1) - 0.5;
            let color = '#00f0ff';
            particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
        }
    }

    function animateParticles() {
        requestAnimationFrame(animateParticles);
        ctx.clearRect(0,0,innerWidth, innerHeight);
        
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }
        connectParticles();
    }

    function connectParticles() {
        let opacityValue = 1;
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x)) + 
                               ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
                if (distance < (canvas.width/7) * (canvas.height/7)) {
                    opacityValue = 1 - (distance/20000);
                    ctx.strokeStyle = 'rgba(0, 240, 255,' + opacityValue + ')';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    window.addEventListener('resize', () => {
        canvas.width = innerWidth;
        canvas.height = innerHeight;
        mouse.radius = ((innerHeight/80) * (innerWidth/80));
        initParticles();
    });

    initParticles();
    animateParticles();

    // =========================================================
    // 2. 3D Tilt & Glow Effect on Bento Cards
    // =========================================================
    const cards = document.querySelectorAll(".interactive-card");

    cards.forEach(card => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty("--mouse-x", `${x}px`);
            card.style.setProperty("--mouse-y", `${y}px`);
            
            // 3D Tilt calculation
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -5; // max 5 deg rotation
            const rotateY = ((x - centerX) / centerX) * 5;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
        });

        card.addEventListener("mouseleave", () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)`;
        });
    });

    // =========================================================
    // 3. Typewriter Effect for Hero
    // =========================================================
    const typeWriterElement = document.getElementById("typewriter");
    const dynamicSubtitle = document.getElementById("dynamic-subtitle");
    
    const phrases = [
        "Eria Mutasa", 
        "Junior SOC Analyst", 
        "Network Defender", 
        "Information Assurance"
    ];
    
    // Mapped 1:1 with phrases array
    const descriptions = [
        "M.S. Cybersecurity • B.Sc. IT • CompTIA Security+ • Targeting US enterprise defense roles.",
        "<span class=\"highlight\">Securing Infrastructure • Hardening Architectures • Proven Day 1 Impact</span>",
        "Hardened ZETDC infrastructure, resolving 50+ critical vulnerability points.",
        "Aligning enterprise technical controls with strict audit and compliance baselines."
    ];
    
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 120;

    if (dynamicSubtitle) {
        dynamicSubtitle.style.transition = "opacity 0.8s ease"; // Slower, softer fade
        dynamicSubtitle.innerHTML = descriptions[0];
    }

    function type() {
        if (!typeWriterElement) return;
        const currentPhrase = phrases[phraseIndex];
        
        if (isDeleting) {
            typeWriterElement.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 50;  // Slightly slower delete
            
            // Fade out the subtitle once backspacing actually starts
            if (dynamicSubtitle && charIndex === currentPhrase.length - 1) {
                dynamicSubtitle.style.opacity = '0';
            }
        } else {
            typeWriterElement.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 100; // Slightly slower typing
        }

        if (!isDeleting && charIndex === currentPhrase.length) {
            // Reached end of phrase, prepare to delete
            typeSpeed = 5500; // Hold the text for 5.5 seconds (Visible)
            isDeleting = true;
            // Removed opacity=0 here so it STAYS VISIBLE while holding
        } else if (isDeleting && charIndex === 0) {
            // Reached beginning of phrase, prepare next one
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typeSpeed = 400; 
            
            // Fade in the new subtitle synchronously
            if (dynamicSubtitle) {
                dynamicSubtitle.innerHTML = descriptions[phraseIndex];
                dynamicSubtitle.style.opacity = '1';
            }
        }
        setTimeout(type, typeSpeed);
    }
    setTimeout(type, 1000);

    // =========================================================
    // 4. Scroll Reveal Animations
    // =========================================================
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target); 
            }
        });
    }, { root: null, rootMargin: "0px", threshold: 0.1 });

    document.querySelectorAll(".fade-up").forEach(el => observer.observe(el));

    // =========================================================
    // 5. Intelligence Modal Logic (Upgraded with Learning Challenges)
    // =========================================================
    const intelData = {
        "risk-modeling": {
            text: "INITIALIZING AWS CLOUD SCANNER... 100%\n\n> Executive Summary: Detecting risky AWS IAM & S3 misconfigurations.\n> Threat Intel: Mapping vulnerabilities to CIS Benchmark v1.5 controls.\n> Value Add: Simulated against capital breach scenarios (Capital One 2019) to analyze Time-to-Compromise.\n\n[>>] LEARNING CHALLENGE: \nBuilding a robust boto3 scanner that could handle cross-region AWS environments without triggering rate limits.\n\n[>>] WHAT I LEARNED:\nDeepened my understanding of AWS IAM policies, the principle of least privilege, and how to programmatically assess cloud infrastructure against CIS controls.\n\nSYSTEM STATUS: Complete.",
            actionHtml: `<a href="https://github.com/eriamutasa" target="_blank" class="btn-primary glow-btn"><i class="fa-brands fa-github"></i> Inspect Source Code</a>`
        },
        "cyberprophet": {
            text: "ACCESSING E-MOMBE IoT ARCHITECTURE... GRANTED.\n\n> Executive Summary: Intelligent health monitoring for livestock endpoints.\n> Security Integration: Implemented encrypted data transmission protocols.\n> Action: Built real-time alerting for anomaly isolation to stop disease spread.\n\n[>>] LEARNING CHALLENGE: \nSecuring the data transmission between low-power IoT sensors and the central cloud without causing excessive latency.\n\n[>>] WHAT I LEARNED:\nMastered implementing lightweight cryptography protocols for IoT devices and designing role-based access configurations for non-traditional endpoints.\n\nSYSTEM STATUS: Secure Operational State.",
            actionHtml: `<a href="mailto:eriamutasa27@gmail.com?subject=IoT%20Smart%20Cattle%20Architecture%20Inquiry" class="btn-primary glow-btn" style="border-color:#ffbd2e; color:#ffbd2e;"><i class="fa-solid fa-lock"></i> Architecture Archived (Request Details)</a>`
        },
        "dudzai": {
            text: "CALCULATING PASS-HASH AUTOMATION... DONE.\n\n> Action Log: Automated secure password verification using SHA-256 algorithms.\n> Defense: Hardened mock application state against brute-force attacks.\n> Value Add: Prevented identity compromise vectors with modern cryptography.\n\n[>>] LEARNING CHALLENGE: \nDesigning a completely automated script that could autonomously test and log brute-force attempts without corrupting the local environment.\n\n[>>] WHAT I LEARNED:\nAdvanced Python scripting techniques with the Hashlib library, incident logging mechanisms, and practical defenses against credential stuffing.\n\nSYSTEM STATUS: Secure Cryptography Standard Running.",
            actionHtml: `<a href="https://github.com/eriamutasa" target="_blank" class="btn-primary glow-btn"><i class="fa-brands fa-github"></i> Inspect Source Code</a>`
        }
    };

    const modal = document.getElementById('intel-modal');
    const closeBtn = document.getElementById('close-modal');
    const intelOutput = document.getElementById('intel-output');
    const modalActions = document.getElementById('modal-actions');
    const openBtns = document.querySelectorAll('.open-modal-btn');
    
    let typeWriterInterval;

    openBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const projectKey = btn.getAttribute('data-project');
            openIntelModal(projectKey);
        });
    });

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    function openIntelModal(key) {
        clearInterval(typeWriterInterval);
        intelOutput.innerHTML = '';
        modalActions.innerHTML = '';
        modal.classList.remove('hidden');
        
        const data = intelData[key];
        let i = 0;
        const text = data.text;
        
        typeWriterInterval = setInterval(() => {
            intelOutput.innerHTML = text.substring(0, i).replace(/\n/g, '<br>');
            i++;
            if (i > text.length) {
                clearInterval(typeWriterInterval);
                modalActions.innerHTML = data.actionHtml;
            }
        }, 12); 
    }

    function closeModal() {
        modal.classList.add('hidden');
        clearInterval(typeWriterInterval);
    }

    // =========================================================
    // 6. Home Lab Mega-Modal Logic
    // =========================================================
    const homelabModal = document.getElementById('homelab-modal');
    const openHomelabBtn = document.getElementById('open-homelab-btn');
    const closeHomelabBtn = document.getElementById('close-homelab-modal');

    if (openHomelabBtn) {
        openHomelabBtn.addEventListener('click', (e) => {
            e.preventDefault();
            homelabModal.classList.remove('hidden');
        });
    }

    if (closeHomelabBtn) {
        closeHomelabBtn.addEventListener('click', () => {
            homelabModal.classList.add('hidden');
        });
    }

    if (homelabModal) {
        homelabModal.addEventListener('click', (e) => {
            if (e.target === homelabModal) homelabModal.classList.add('hidden');
        });
    }

    // =========================================================
    // 7. Intel Vault Auto-Scroll Logic
    // =========================================================
    const intelVault = document.querySelector('.intel-vault');
    if (intelVault) {
        let isHovered = false;
        
        intelVault.addEventListener('mouseenter', () => isHovered = true);
        intelVault.addEventListener('mouseleave', () => isHovered = false);

        setInterval(() => {
            if (!isHovered) {
                intelVault.scrollTop += 1;
                
                // If it hits the absolute bottom, silently reset to top for a continuous loop
                if (Math.ceil(intelVault.scrollTop + intelVault.clientHeight) >= intelVault.scrollHeight) {
                    intelVault.scrollTop = 0;
                }
            }
        }, 40); // 40ms interval for smooth, readable real-time sliding
    }
});
