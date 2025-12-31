import { DataManager, DATA_KEYS } from './data.js';

class TeacherManager {
    constructor() {
        this.initEventListeners();
        this.populateCourseDropdown();
    }

    initEventListeners() {
        const addBtn = document.getElementById('add-teacher-btn');
        const form = document.getElementById('teacher-form');
        const modal = document.getElementById('teacher-modal');
        const cancelBtn = document.getElementById('cancel-teacher');

        if (addBtn) addBtn.addEventListener('click', () => this.showModal(modal));
        if (form) form.addEventListener('submit', (e) => this.addTeacher(e));
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.hideModal(modal));
    }

    populateCourseDropdown() {
        const data = DataManager.getAllData();
        const select = document.getElementById('teacher-course');
        if (select) {
            select.innerHTML = '<option value="">Select Course</option>' + 
                data.courses.map(course => 
                    `<option value="${course.code}">${course.name} (${course.code})</option>`
                ).join('');
        }
    }

    showModal(modal) { modal.classList.add('active'); document.body.style.overflow = 'hidden'; }
    hideModal(modal) { modal.classList.remove('active'); document.body.style.overflow = 'auto'; }

    addTeacher(e) {
        e.preventDefault();
        const formData = {
            id: Date.now(),
            teacherId: document.getElementById('teacher-id').value,
            name: document.getElementById('teacher-name').value,
            course: document.getElementById('teacher-course').value,
            batch: document.getElementById('teacher-batch').value,
            year: document.getElementById('teacher-year').value
        };

        const teachers = DataManager.load(DATA_KEYS.TEACHERS);
        teachers.push(formData);
        DataManager.save(DATA_KEYS.TEACHERS, teachers);

        // Update course teacher count
        this.updateCourseTeacherCount(formData.course);

        this.renderTeachersTable();
        document.getElementById('teacher-form').reset();
        document.getElementById('teacher-modal').classList.remove('active');
        document.body.style.overflow = 'auto';

        alert('✅ Teacher added successfully!');
    }

    updateCourseTeacherCount(courseCode) {
        const data = DataManager.getAllData();
        const course = data.courses.find(c => c.code === courseCode);
        if (course) {
            course.teachers = (course.teachers || 0) + 1;
            DataManager.save(DATA_KEYS.COURSES, data.courses);
        }
    }

    renderTeachersTable() {
        const data = DataManager.getAllData();
        const tableBody = document.getElementById('teachers-table');
        
        if (data.teachers.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No teachers added</td></tr>';
            return;
        }

        tableBody.innerHTML = data.teachers.map(teacher => `
            <tr>
                <td>${teacher.teacherId}</td>
                <td>${teacher.name}</td>
                <td>${teacher.course}</td>
                <td>${teacher.batch}</td>
                <td>${teacher.year}</td>
                <td>
                    <button class="action-btn action-edit">Edit</button>
                    <button class="action-btn action-delete">Delete</button>
                </td>
            </tr>
        `).join('');
    }
}

export default TeacherManager;
