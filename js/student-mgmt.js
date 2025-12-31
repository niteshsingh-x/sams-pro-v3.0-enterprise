import { DataManager, DATA_KEYS } from './data.js';

class StudentManager {
    constructor() {
        this.initEventListeners();
        this.populateCourseDropdown();
    }

    initEventListeners() {
        const addBtn = document.getElementById('add-student-btn');
        const form = document.getElementById('student-form');
        const modal = document.getElementById('student-modal');
        const cancelBtn = document.getElementById('cancel-student');

        if (addBtn) addBtn.addEventListener('click', () => this.showModal(modal));
        if (form) form.addEventListener('submit', (e) => this.addStudent(e));
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.hideModal(modal));
    }

    populateCourseDropdown() {
        const data = DataManager.getAllData();
        const select = document.getElementById('student-course');
        if (select) {
            select.innerHTML = '<option value="">Select Course</option>' + 
                data.courses.map(course => 
                    `<option value="${course.code}">${course.name} (${course.code})</option>`
                ).join('');
        }
    }

    showModal(modal) { modal.classList.add('active'); document.body.style.overflow = 'hidden'; }
    hideModal(modal) { modal.classList.remove('active'); document.body.style.overflow = 'auto'; }

    addStudent(e) {
        e.preventDefault();
        const formData = {
            id: Date.now(),
            rollNo: document.getElementById('student-rollno').value,
            name: document.getElementById('student-name').value,
            course: document.getElementById('student-course').value,
            year: document.getElementById('student-year').value,
            batch: document.getElementById('student-batch').value
        };

        const students = DataManager.load(DATA_KEYS.STUDENTS);
        students.push(formData);
        DataManager.save(DATA_KEYS.STUDENTS, students);

        // Update course student count
        this.updateCourseStudentCount(formData.course);

        this.renderStudentsTable();
        document.getElementById('student-form').reset();
        document.getElementById('student-modal').classList.remove('active');
        document.body.style.overflow = 'auto';

        alert('✅ Student added successfully!');
    }

    updateCourseStudentCount(courseCode) {
        const data = DataManager.getAllData();
        const course = data.courses.find(c => c.code === courseCode);
        if (course) {
            course.students = (course.students || 0) + 1;
            DataManager.save(DATA_KEYS.COURSES, data.courses);
        }
    }

    renderStudentsTable() {
        const data = DataManager.getAllData();
        const tableBody = document.getElementById('students-table');
        
        if (data.students.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No students added</td></tr>';
            return;
        }

        tableBody.innerHTML = data.students.map(student => `
            <tr>
                <td>${student.rollNo}</td>
                <td>${student.name}</td>
                <td>${student.course}</td>
                <td>${student.year}</td>
                <td>${student.batch}</td>
                <td>
                    <button class="action-btn action-edit">Edit</button>
                    <button class="action-btn action-delete">Delete</button>
                </td>
            </tr>
        `).join('');
    }
}

export default StudentManager;
