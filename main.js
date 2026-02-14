// ==========================================
// MAIN PORTFOLIO JAVASCRIPT (SUPABASE)
// ==========================================

document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initThemeToggle();
    initAnimations();
    loadProjects();
    loadSiteContent();
    loadSkills();
    initContactForm();
});

// ==========================================
// NAVIGATION
// ==========================================

function initNavigation() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    hamburger?.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close menu when clicking nav link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger?.classList.remove('active');

            // Update active state
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Update active link on scroll
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// ==========================================
// THEME TOGGLE
// ==========================================

function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;

    // Check for saved theme preference or default to light mode
    const currentTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);

    themeToggle?.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

function updateThemeIcon(theme) {
    const themeToggle = document.getElementById('themeToggle');
    const icon = themeToggle?.querySelector('i');
    if (icon) {
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
}

// ==========================================
// ANIMATIONS
// ==========================================

function initAnimations() {
    // Animate stats counter
    const statNumbers = document.querySelectorAll('.stat-number');

    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    statNumbers.forEach(stat => observer.observe(stat));

    // Animate sections on scroll
    const sections = document.querySelectorAll('section');
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        sectionObserver.observe(section);
    });
}

function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;

    const updateCounter = () => {
        current += increment;
        if (current < target) {
            element.textContent = Math.floor(current);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    };

    updateCounter();
}

// ==========================================
// LOAD PROJECTS FROM SUPABASE
// ==========================================

async function loadProjects() {
    const projectsGrid = document.getElementById('projectsGrid');

    try {
        // Get projects from Supabase, ordered by creation date
        const { data: projects, error } = await supabaseClient
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Clear loading skeletons
        projectsGrid.innerHTML = '';

        if (!projects || projects.length === 0) {
            projectsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                    <i class="fas fa-folder-open" style="font-size: 4rem; color: var(--text-tertiary); margin-bottom: 1rem;"></i>
                    <p style="color: var(--text-secondary); font-size: 1.125rem;">No projects yet. Check back soon!</p>
                </div>
            `;
            return;
        }

        // Create project cards
        projects.forEach(project => {
            const projectCard = createProjectCard(project);
            projectsGrid.appendChild(projectCard);
        });

    } catch (error) {
        console.error('🔥 CRITICAL SUPABASE ERROR:', error);
        console.error('Error Details:', error.message, error.hint, error.details);

        // Show visible error on screen for easier debugging
        projectsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #ef4444;">
                <i class="fas fa-exclamation-circle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <h3>Failed to load projects</h3>
                <p style="font-family: monospace; background: #fef2f2; padding: 1rem; border-radius: 4px; margin-top: 1rem; display: inline-block; text-align: left;">
                    Error: ${error.message}<br>
                    <small>Check console (F12) for more details</small>
                </p>
            </div>
        `;
    }
}

function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';

    // Parse tech stack
    const techArray = project.tech.split(',').map(t => t.trim());
    const techTags = techArray.map(tech =>
        `<span class="tech-tag">${tech}</span>`
    ).join('');

    card.innerHTML = `
        <img src="${project.image}" alt="${project.title}" class="project-image" onerror="this.src='https://via.placeholder.com/400x250?text=Project+Image'">
        <div class="project-content">
            <h3 class="project-title">${project.title}</h3>
            <p class="project-description">${project.description}</p>
            <div class="project-tech">
                ${techTags}
            </div>
            <a href="${project.link}" target="_blank" rel="noopener noreferrer" class="project-link">
                View Project
                <i class="fas fa-arrow-right"></i>
            </a>
        </div>
    `;

    return card;
}

// ==========================================
// CONTACT FORM
// ==========================================

function initContactForm() {
    const contactForm = document.getElementById('contactForm');

    contactForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);

        // Show success message
        alert('Message sent successfully! I\'ll get back to you soon.');

        // Reset form
        contactForm.reset();

        // In a real application, you would send this data to a backend service
        // or save it to Supabase
        console.log('Contact form data:', data);
    });
}

// ==========================================
// LOAD SITE CONTENT
// ==========================================

async function loadSiteContent() {
    try {
        const { data, error } = await supabaseClient
            .from('site_content')
            .select('*')
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (data) {
            // Hero Section
            if (data.hero_name) document.getElementById('heroName').textContent = data.hero_name;
            if (data.hero_title) document.getElementById('heroTitle').textContent = data.hero_title;
            if (data.hero_description) document.getElementById('heroDescription').textContent = data.hero_description;

            // Contact Section
            if (data.email) {
                const mailLink = document.getElementById('contactEmail');
                if (mailLink) {
                    mailLink.textContent = data.email;
                    mailLink.href = `mailto:${data.email}`;
                }
            }
            if (data.phone) {
                const phoneLink = document.getElementById('contactPhone');
                if (phoneLink) {
                    phoneLink.textContent = data.phone;
                    phoneLink.href = `tel:${data.phone}`;
                }
            }
            if (data.location) {
                document.getElementById('contactLocation').textContent = data.location;
            }

            // Social Links
            updateSocialLink('socialGithub', data.github_link);
            updateSocialLink('socialLinkedin', data.linkedin_link);
            updateSocialLink('socialTwitter', data.twitter_link);
        }
    } catch (error) {
        console.error('Error loading site content:', error);
    }
}

function updateSocialLink(id, url) {
    const link = document.getElementById(id);
    if (!link) return;

    if (url) {
        link.href = url;
        link.style.display = 'inline-flex';
    } else {
        link.style.display = 'none';
    }
}

// ==========================================
// LOAD SKILLS
// ==========================================

async function loadSkills() {
    const skillsGrid = document.getElementById('skillsGrid');

    try {
        const { data: skills, error } = await supabaseClient
            .from('skills')
            .select('*')
            .order('id', { ascending: true });

        if (error) throw error;

        skillsGrid.innerHTML = '';

        if (!skills || skills.length === 0) {
            skillsGrid.innerHTML = '<p class="text-center" style="grid-column: 1/-1;">No skills added yet.</p>';
            return;
        }

        skills.forEach(skill => {
            const card = document.createElement('div');
            card.className = 'skill-card';
            card.innerHTML = `
                <div class="skill-icon">
                    <i class="${skill.icon_class}"></i>
                </div>
                <h3 class="skill-title">${skill.name}</h3>
                <p class="skill-description">${skill.description || ''}</p>
            `;
            skillsGrid.appendChild(card);
        });

    } catch (error) {
        console.error('Error loading skills:', error);
        skillsGrid.innerHTML = '<p class="text-center" style="grid-column: 1/-1; color: red;">Failed to load skills.</p>';
    }
}

// Export for use in other files
window.loadProjects = loadProjects;
