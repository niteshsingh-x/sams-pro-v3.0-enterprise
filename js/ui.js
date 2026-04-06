// ui.js
// Handles all UI interactions, modals, toast, and navigation

// Show modal
function showModal(modal) {
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Hide modal
function hideModal(modal) {
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Toast notification
function showToast(message) {
    let toast = document.getElementById('toast-notification');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-notification';
        toast.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 1rem 2rem;
            border-radius: 50px;
            font-weight: 600;
            z-index: 9999;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            transition: all 0.3s ease;
            opacity: 0;
        `;
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
    }, 3000);
}

// Navigation
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = link.dataset.section;
            currentSection = targetSection;

            // Check permissions
            if (targetSection === 'admin' && !hasPermission('admin')) {
                showToast('❌ You don\'t have permission to access Admin section!');
                return;
            }

            // Update active state
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Show/hide sections
            document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
            const targetElement = document.getElementById(targetSection);
            if (targetElement) {
                targetElement.classList.add('active');
            }

            // Refresh data for the section
            setTimeout(() => {
                updateDashboardStats();
                renderCoursesTable();
                renderStudentsTable();
                renderTeachersTable();
                renderAllUsersTable();
                initMarkAttendance();
                if (targetSection === 'attendance') {
                    populateAttendanceCourses();
                }
            }, 100);
        });
    });
}

// Initialize UI
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
});