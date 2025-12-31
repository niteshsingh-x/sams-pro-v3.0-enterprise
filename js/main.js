import Dashboard from './dashboard.js';
import AttendanceManager from './attendance.js';
import CourseManager from './course-mgmt.js';
import StudentManager from './student-mgmt.js';
import TeacherManager from './teacher-mgmt.js';
import { DataManager } from './data.js';

class SAMSApp {
    constructor() {
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupAdminFeatures();
        new Dashboard();
        new AttendanceManager();
        new CourseManager();
        new StudentManager();
        new TeacherManager();
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('.page-section');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSection = link.dataset.section;
                
                // Update active nav
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Show target section
                sections.forEach(s => s.classList.remove('active'));
                document.getElementById(targetSection).classList.add('active');
                
                // Refresh data for active section
                this.refreshSectionData(targetSection);
            });
        });
    }

    refreshSectionData(section) {
        switch(section) {
            case 'dashboard':
                // Dashboard auto-refreshes
                break;
            case 'attendance':
                document.querySelector('attendance.js')?.updateMarkAttendanceTable();
                break;
            case 'courses':
                document.querySelector('course-mgmt.js')?.renderCoursesTable();
                break;
            case 'students':
                document.querySelector('student-mgmt.js')?.renderStudentsTable();
                break;
            case 'teachers':
                document.querySelector('teacher-mgmt.js')?.renderTeachersTable();
                break;
        }
    }

    setupAdminFeatures() {
        const exportBtn = document.getElementById('export-data');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                DataManager.exportData();
            });
        }

        // Populate All Users table
        this.renderAllUsersTable();
    }

    renderAllUsersTable() {
        const data = DataManager.getAllData();
        const allUsers = [
            ...data.students.map(s => ({...s, type: 'Student'})),
            ...data.teachers.map(t => ({...t, type: 'Teacher', name: t.name, userId: t.teacherId}))
        ];
        
        const tableBody = document.getElementById('all-users-table');
        if (allUsers.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No users available</td></tr>';
            return;
        }

        tableBody.innerHTML = allUsers.slice(0, 50).map(user => `
            <tr>
                <td>${user.rollNo || user.userId || 'N/A'}</td>
                <td>${user.name}</td>
                <td>${user.type}</td>
                <td>${user.course || 'N/A'}</td>
                <td>${user.batch || 'N/A'}</td>
                <td>${user.year || 'N/A'}</td>
                <td><button class="action-btn action-edit">Manage</button></td>
            </tr>
        `).join('');
    }
}

// Initialize SAMS Pro v3.0 when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SAMSApp();
});
