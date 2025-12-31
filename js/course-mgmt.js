import { DataManager, DATA_KEYS } from './data.js';

class CourseManager {
    constructor() {
        this.initEventListeners();
    }

    initEventListeners() {
        const addBtn = document.getElementById('add-course-btn');
        const form = document.getElementById('course-form');
        const modal = document.getElementById('course-modal');
        const cancelBtn = document.getElementById('cancel-course');

        if (addBtn) addBtn.addEventListener('click', () => this.showModal(modal));
        if (form) form.addEventListener('submit', (e) => this.addCourse(e));
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.hideModal(modal));
    }

    showModal(modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    hideModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    async addCourse(e) {
        e.preventDefault();
        const formData = {
            id: Date.now(),
            code: document.getElementById('course-code').value,
            name: document.getElementById('course-name').value,
            years: document.getElementById('course-years').value,
            students: 0,
            teachers: 0
        };

        const courses = DataManager.load(DATA_KEYS.COURSES);
        courses.push(formData);
        DataManager.save(DATA_KEYS.COURSES, courses);

        this.renderCoursesTable();
        document.getElementById('course-form').reset();
        document.getElementById('course-modal').classList.remove('active');
        document.body.style.overflow = 'auto';

        alert('✅ Course added successfully!');
    }

    renderCoursesTable() {
        const data = DataManager.getAllData();
        const tableBody = document.getElementById('courses-table');
        
        if (data.courses.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No courses added</td></tr>';
            return;
        }

        tableBody.innerHTML = data.courses.map(course => `
            <tr>
                <td>${course.code}</td>
                <td>${course.name}</td>
                <td>${course.years}</td>
                <td>${course.students || 0}</td>
                <td>${course.teachers || 0}</td>
                <td>
                    <button class="action-btn action-edit">Edit</button>
                    <button class="action-btn action-delete">Delete</button>
                </td>
            </tr>
        `).join('');
    }
}

export default CourseManager;
