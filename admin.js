// ==========================================
// ADMIN DASHBOARD (SUPABASE)
// ==========================================

let currentProjectId = null;

document.addEventListener('DOMContentLoaded', function () {
    checkAuth();
    initSidebar();
    initNavigation();
    loadDashboardStats();
    loadProjectsTable();
    initContentForm();
    initSkills();
    initProjectForm();
    initDeleteModal();
});

// ==========================================
// AUTHENTICATION CHECK
// ==========================================

async function checkAuth() {
    const { data: { session }, error } = await supabaseClient.auth.getSession();

    if (error || !session) {
        // Not logged in, redirect to login
        window.location.href = 'login.html';
    } else {
        // User is logged in
        const userName = document.getElementById('userName');
        if (userName) {
            userName.textContent = session.user.email.split('@')[0];
        }
    }
}

// ==========================================
// SIDEBAR & NAVIGATION
// ==========================================

function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    // Mobile menu toggle
    mobileMenuBtn?.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    // Sidebar close button
    sidebarToggle?.addEventListener('click', () => {
        sidebar.classList.remove('active');
    });

    // Logout
    logoutBtn?.addEventListener('click', async () => {
        try {
            const { error } = await supabaseClient.auth.signOut();
            if (error) throw error;

            showToast('Logged out successfully', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        } catch (error) {
            console.error('Logout error:', error);
            showToast('Logout failed. Please try again.', 'error');
        }
    });
}

// Make switchSection globally available
window.switchSection = switchSection;

function switchSection(sectionId) {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const sections = document.querySelectorAll('.admin-section');
    const pageTitle = document.getElementById('pageTitle');

    // Update active link
    sidebarLinks.forEach(l => l.classList.remove('active'));

    // Find link by data-section or href
    const activeLink = document.querySelector(`.sidebar-link[data-section="${sectionId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }

    // Update sections
    sections.forEach(s => s.classList.remove('active'));
    const targetSection = document.getElementById(`${sectionId}Section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Update page title
    const titles = {
        'dashboard': 'Dashboard',
        'content': 'Manage Profile Content',
        'skills': 'Manage Skills',
        'projects': 'Manage Projects',
        'add-project': 'Add New Project'
    };
    if (pageTitle) pageTitle.textContent = titles[sectionId] || 'Dashboard';

    // Reset form when switching to add project
    if (sectionId === 'add-project') {
        if (typeof resetProjectForm === 'function') resetProjectForm();
    }

    // Close mobile sidebar
    document.getElementById('sidebar')?.classList.remove('active');
}

function initNavigation() {
    const navElements = document.querySelectorAll('[data-section]');

    // Navigation logic
    navElements.forEach(element => {
        element.addEventListener('click', (e) => {
            // Only prevent default if it's an anchor tag
            if (element.tagName === 'A') e.preventDefault();

            const sectionId = element.getAttribute('data-section');
            if (sectionId) switchSection(sectionId);
        });
    });
}

// ==========================================
// DASHBOARD STATS
// ==========================================

async function loadDashboardStats() {
    try {
        const { count, error } = await supabaseClient
            .from('projects')
            .select('*', { count: 'exact', head: true });

        if (error) throw error;

        const totalProjects = document.getElementById('totalProjects');
        if (totalProjects) {
            totalProjects.textContent = count;
        }

        // Update last updated (get the latest created_at)
        const { data: latestProjects } = await supabaseClient
            .from('projects')
            .select('created_at')
            .order('created_at', { ascending: false })
            .limit(1);

        const lastUpdated = document.getElementById('lastUpdated');
        if (lastUpdated && latestProjects && latestProjects.length > 0) {
            const latest = new Date(latestProjects[0].created_at);
            lastUpdated.textContent = formatDate(latest);
        }

    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

function formatDate(date) {
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;

    return date.toLocaleDateString();
}

// ==========================================
// PROJECTS TABLE
// ==========================================

async function loadProjectsTable() {
    const tableBody = document.getElementById('projectsTableBody');

    try {
        const { data: projects, error } = await supabaseClient
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        tableBody.innerHTML = '';

        if (!projects || projects.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                        <i class="fas fa-folder-open" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                        <p>No projects yet.</p>
                        <button class="btn btn-primary" onclick="switchSection('add-project')" style="margin-top: 1rem;">
                            <i class="fas fa-plus"></i> Create Project
                        </button>
                    </td>
                </tr>
            `;
            return;
        }

        projects.forEach(project => {
            const row = createProjectRow(project.id, project);
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error('Error loading projects:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 2rem; color: #ef4444;">
                    Failed to load projects. Please refresh the page.
                </td>
            </tr>
        `;
    }
}

function createProjectRow(id, project) {
    const row = document.createElement('tr');

    row.innerHTML = `
        <td>
            <img src="${project.image}" alt="${project.title}" class="project-thumbnail" onerror="this.src='https://via.placeholder.com/80x60?text=No+Image'">
        </td>
        <td class="project-title-cell">${project.title}</td>
        <td class="project-description-cell">${project.description}</td>
        <td>${project.tech}</td>
        <td>
            <div class="action-buttons">
                <button class="btn btn-icon btn-edit" onclick="editProject('${id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-icon btn-danger" onclick="confirmDeleteProject('${id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </td>
    `;

    return row;
}

// ==========================================
// PROJECT FORM
// ==========================================

function initProjectForm() {
    const projectForm = document.getElementById('projectForm');
    const cancelBtn = document.getElementById('cancelBtn');

    projectForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveProject();
    });

    cancelBtn?.addEventListener('click', () => {
        resetProjectForm();
        // Switch to projects section
        document.querySelector('[data-section="projects"]')?.click();
    });
}

async function saveProject() {
    const submitBtn = document.getElementById('submitBtn');
    const loadingOverlay = document.getElementById('loadingOverlay');

    const projectData = {
        title: document.getElementById('projectTitle').value,
        description: document.getElementById('projectDescription').value,
        image: document.getElementById('projectImage').value,
        tech: document.getElementById('projectTech').value,
        link: document.getElementById('projectLink').value
        // created_at is handled automatically by Supabase or we can pass it if we want custom timestamp
    };

    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Saving...</span>';
        loadingOverlay.classList.add('active');

        let error;

        if (currentProjectId) {
            // Update existing project
            const { error: err } = await supabaseClient
                .from('projects')
                .update(projectData)
                .eq('id', currentProjectId);
            error = err;
        } else {
            // Add new project
            const { error: err } = await supabaseClient
                .from('projects')
                .insert([projectData]);
            error = err;
        }

        if (error) {
            console.error('Save error:', error);
            alert(`Error saving project: ${error.message} (Code: ${error.code || 'UNKNOWN'})`);
            throw error;
        }

        showToast(currentProjectId ? 'Project updated!' : 'Project added!', 'success');

        // Reload data
        await loadProjectsTable();
        await loadDashboardStats();

        // Reset form and switch to projects view
        resetProjectForm();
        setTimeout(() => {
            document.querySelector('[data-section="projects"]')?.click();
        }, 1000);

    } catch (error) {
        console.error('Error saving project:', error);
        showToast('Failed to save project. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-save"></i><span>Save Project</span>';
        loadingOverlay.classList.remove('active');
    }
}

async function editProject(projectId) {
    try {
        const { data: project, error } = await supabaseClient
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .single();

        if (error) throw error;

        currentProjectId = projectId;

        // Fill form
        document.getElementById('projectTitle').value = project.title;
        document.getElementById('projectDescription').value = project.description;
        document.getElementById('projectImage').value = project.image;
        document.getElementById('projectTech').value = project.tech;
        document.getElementById('projectLink').value = project.link;

        // Update form title
        document.getElementById('formTitle').textContent = 'Edit Project';

        // Switch to add-project section
        document.querySelector('[data-section="add-project"]')?.click();

    } catch (error) {
        console.error('Error loading project:', error);
        showToast('Failed to load project data', 'error');
    }
}

function resetProjectForm() {
    document.getElementById('projectForm')?.reset();
    currentProjectId = null;
    document.getElementById('formTitle').textContent = 'Add New Project';
}

// Make functions globally accessible
window.editProject = editProject;

// ==========================================
// DELETE PROJECT
// ==========================================

function initDeleteModal() {
    const deleteModal = document.getElementById('deleteModal');
    const closeModal = document.getElementById('closeModal');
    const cancelDelete = document.getElementById('cancelDelete');
    const confirmDelete = document.getElementById('confirmDelete');

    closeModal?.addEventListener('click', () => {
        deleteModal.classList.remove('active');
    });

    cancelDelete?.addEventListener('click', () => {
        deleteModal.classList.remove('active');
    });

    confirmDelete?.addEventListener('click', async () => {
        await deleteProject();
    });

    // Close on overlay click
    deleteModal?.querySelector('.modal-overlay')?.addEventListener('click', () => {
        deleteModal.classList.remove('active');
    });
}

function confirmDeleteProject(projectId) {
    currentProjectId = projectId;
    document.getElementById('deleteModal')?.classList.add('active');
}

async function deleteProject() {
    const deleteModal = document.getElementById('deleteModal');
    const loadingOverlay = document.getElementById('loadingOverlay');

    try {
        loadingOverlay.classList.add('active');

        const { error } = await supabaseClient
            .from('projects')
            .delete()
            .eq('id', currentProjectId);

        if (error) throw error;

        showToast('Project deleted successfully!', 'success');

        // Reload data
        await loadProjectsTable();
        await loadDashboardStats();

        deleteModal.classList.remove('active');
        currentProjectId = null;

    } catch (error) {
        console.error('Error deleting project:', error);
        showToast('Failed to delete project. Please try again.', 'error');
    } finally {
        loadingOverlay.classList.remove('active');
    }
}

// Make function globally accessible
window.confirmDeleteProject = confirmDeleteProject;

// ==========================================
// TOAST NOTIFICATION
// ==========================================

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const icon = toast.querySelector('i');

    toastMessage.textContent = message;

    toast.className = 'toast';
    if (type === 'success') {
        icon.className = 'fas fa-check-circle';
        toast.classList.add('success');
    } else if (type === 'error') {
        icon.className = 'fas fa-exclamation-circle';
        toast.classList.add('error');
    } else if (type === 'warning') {
        icon.className = 'fas fa-exclamation-triangle';
        toast.classList.add('warning');
    }

    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ==========================================
// CONTENT MANAGEMENT
// ==========================================

async function initContentForm() {
    const contentForm = document.getElementById('contentForm');

    // Load initial data
    await loadContent();

    contentForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveContent();
    });
}

async function loadContent() {
    try {
        const { data, error } = await supabaseClient
            .from('site_content')
            .select('*')
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is 'not found'
            throw error;
        }

        if (data) {
            document.getElementById('heroNameInput').value = data.hero_name || '';
            document.getElementById('heroTitleInput').value = data.hero_title || '';
            document.getElementById('heroDescInput').value = data.hero_description || '';
            document.getElementById('emailInput').value = data.email || '';
            document.getElementById('phoneInput').value = data.phone || '';
            document.getElementById('locationInput').value = data.location || '';
            document.getElementById('githubInput').value = data.github_link || '';
            document.getElementById('linkedinInput').value = data.linkedin_link || '';
            document.getElementById('twitterInput').value = data.twitter_link || '';
        }
    } catch (error) {
        console.error('Error loading content:', error);
        // showToast('Failed to load profile content', 'error');
    }
}

async function saveContent() {
    const saveBtn = document.getElementById('saveContentBtn');

    const contentData = {
        hero_name: document.getElementById('heroNameInput').value,
        hero_title: document.getElementById('heroTitleInput').value,
        hero_description: document.getElementById('heroDescInput').value,
        email: document.getElementById('emailInput').value,
        phone: document.getElementById('phoneInput').value,
        location: document.getElementById('locationInput').value,
        github_link: document.getElementById('githubInput').value,
        linkedin_link: document.getElementById('linkedinInput').value,
        twitter_link: document.getElementById('twitterInput').value,
        id: 1 // Always utilize ID 1
    };

    try {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Saving...</span>';

        const { error } = await supabaseClient
            .from('site_content')
            .upsert(contentData); // Upsert handles insert or update

        if (error) throw error;

        showToast('Profile content updated!', 'success');
    } catch (error) {
        console.error('Error saving content:', error);
        showToast('Failed to save content.', 'error');
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-save"></i><span>Save Changes</span>';
    }
}

// ==========================================
// SKILLS MANAGEMENT
// ==========================================

let currentSkillId = null;

function initSkills() {
    loadSkills();

    // Modal events
    const modal = document.getElementById('skillModal');
    const closeBtn = document.getElementById('closeSkillModal');
    const addBtn = document.getElementById('addSkillBtn');
    const form = document.getElementById('skillForm');

    addBtn?.addEventListener('click', () => {
        resetSkillForm();
        modal.classList.add('active');
    });

    closeBtn?.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveSkill(modal);
    });

    // Make deleteSkill global
    window.deleteSkill = deleteSkill;
}

async function loadSkills() {
    const tbody = document.getElementById('skillsTableBody');
    try {
        const { data: skills, error } = await supabaseClient
            .from('skills')
            .select('*')
            .order('id', { ascending: true });

        if (error) throw error;

        tbody.innerHTML = '';
        if (!skills || skills.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No skills found. Add one!</td></tr>';
            return;
        }

        skills.forEach(skill => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-size: 1.5rem;"><i class="${skill.icon_class}"></i></td>
                <td>${skill.name}</td>
                <td>${skill.description || '-'}</td>
                <td>
                    <button class="btn btn-icon btn-danger" onclick="deleteSkill(${skill.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error('Error loading skills:', error);
        tbody.innerHTML = '<tr><td colspan="4" style="color:red; text-align:center;">Error loading skills</td></tr>';
    }
}

async function saveSkill(modal) {
    const skillData = {
        name: document.getElementById('skillName').value,
        icon_class: document.getElementById('skillIcon').value,
        description: document.getElementById('skillDesc').value
    };

    try {
        const { error } = await supabaseClient
            .from('skills')
            .insert([skillData]);

        if (error) throw error;

        showToast('Skill added!', 'success');
        modal.classList.remove('active');
        loadSkills();

    } catch (error) {
        console.error('Error saving skill:', error);
        showToast('Failed to save skill', 'error');
    }
}

async function deleteSkill(id) {
    if (!confirm('Area you sure you want to delete this skill?')) return;

    try {
        const { error } = await supabaseClient
            .from('skills')
            .delete()
            .eq('id', id);

        if (error) throw error;
        showToast('Skill deleted', 'success');
        loadSkills();
    } catch (error) {
        console.error('Error deleting skill', error);
        showToast('Failed to delete skill', 'error');
    }
}

function resetSkillForm() {
    document.getElementById('skillForm').reset();
    document.getElementById('skillModalTitle').textContent = 'Add New Skill';
}
