document.addEventListener('DOMContentLoaded', function() {

    const repulsionSound = new Audio('space_sound.mp3');
let lastSoundMouseX = -1; // Initialize with a value unlikely to be a valid coordinate
let lastSoundMouseY = -1; // Initialize with a value unlikely to be a valid coordinate
let canPlaySound = true; // Flag to control sound playback

    // --- Codice esistente per animazioni allo scroll e nav links ---
    const animatedElements = document.querySelectorAll('.service-card, #about .container, #contact .container');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    animatedElements.forEach(element => {
        observer.observe(element);
    });

    document.querySelectorAll('a.nav-link').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 56, // Adjust for fixed navbar height
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- Codice per l'animazione "Starfield" con effetto buco nero e sfondo trasparente ---
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let stars = [];
        let mouse = { x: undefined, y: undefined };

        const setupCanvas = () => {
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
        };

        class Star {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.z = Math.random() * canvas.width;
                this.pz = this.z;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
            }

            update(mouse) {
                // Mouse repulsion
                if (mouse.x !== undefined && mouse.y !== undefined) {
                    const dx = this.x - mouse.x;
                    const dy = this.y - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const repulsionRadius = 150; // Increased radius
                    const force = Math.max(0, (repulsionRadius - dist) / repulsionRadius);

                    if (dist < repulsionRadius) {
                        this.x += (dx / dist) * force * 7; // Increased force
                        this.y += (dy / dist) * force * 7; // Increased force
                        if (canPlaySound && (repulsionSound.paused || repulsionSound.ended) && (mouse.x !== lastSoundMouseX || mouse.y !== lastSoundMouseY)) { // Check if sound can play, is not playing, AND mouse moved
                            canPlaySound = false; // Prevent immediate re-play
                            repulsionSound.currentTime = 0; // Rewind to start
                            repulsionSound.play();
                                canPlaySound = true; // Allow sound to play again after 500ms
                            lastSoundMouseX = mouse.x; // Update last played mouse coordinates
                            lastSoundMouseY = mouse.y; // Update last played mouse coordinates
                        }
                    }
                }
                
                // Add original velocity
                this.x += this.vx;
                this.y += this.vy;

                // Z-axis movement (depth)
                this.z -= 1;
                if (this.z < 1) {
                    this.z = canvas.width;
                    this.x = Math.random() * canvas.width;
                    this.y = Math.random() * canvas.height;
                    this.pz = this.z;
                    this.vx = (Math.random() - 0.5) * 0.5;
                    this.vy = (Math.random() - 0.5) * 0.5;
                }

                // Wall bouncing
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            }

            draw() {
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;

                const sx = ((this.x - centerX) * (canvas.width / this.z)) + centerX;
                const sy = ((this.y - centerY) * (canvas.width / this.z)) + centerY;

                const r = Math.max(0.1, (1 - this.z / canvas.width) * 2.5);

                ctx.beginPath();
                ctx.arc(sx, sy, r, 0, Math.PI * 2);
                ctx.fillStyle = 'white';
                ctx.fill();

                const prev_sx = ((this.x - this.vx - centerX) * (canvas.width / this.pz)) + centerX;
                const prev_sy = ((this.y - this.vy - centerY) * (canvas.width / this.pz)) + centerY;

                ctx.beginPath();
                ctx.moveTo(prev_sx, prev_sy);
                ctx.lineTo(sx, sy);
                ctx.strokeStyle = 'white';
                ctx.lineWidth = r;
                ctx.stroke();

                this.pz = this.z;
            }
        }

        const createStars = () => {
            stars = [];
            let numberOfStars = 1000; // The denser version
            for (let i = 0; i < numberOfStars; i++) {
                stars.push(new Star());
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Transparent background

            stars.forEach(star => {
                star.update(mouse);
                star.draw();
            });

            requestAnimationFrame(animate);
        };

        window.addEventListener('resize', () => {
            setupCanvas();
            createStars();
        });

        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });

        canvas.addEventListener('mouseleave', () => {
            mouse.x = undefined;
            mouse.y = undefined;
        });

        // Inizializzazione
        setupCanvas();
        createStars();
        animate();
    }
});