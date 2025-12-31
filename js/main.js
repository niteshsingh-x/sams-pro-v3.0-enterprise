// SAMS Pro v3.0 © 2025 Nitesh Singh - Portfolio Project

// SAMS Pro v3.0 Enterprise - Complete Global Functions
// © 2025 Nitesh Singh - Portfolio Project
// https://niteshsingh-x.github.io/sams-pro-v3.0-enterprise

const DataManager = {
    save: (key, data) => localStorage.setItem(key, JSON.stringify(data)),
    load: (key) => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    },
    getAllData: () => ({
        courses: DataManager.load('sams_courses'),
        students: DataManager.load('sams_students'),
        teachers: DataManager.load('sams_teachers'),
        attendance: DataManager.load('sams_attendance')
    }),
    exportData: () => {
        const allData = DataManager.getAllData();
        const exportData = { ...allData, exportDate: new Date().toISOString(), version: 'SAMS Pro v3.0' };
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `sams-pro-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }
};

// Dashboard Functions
const updateDashboardStats = () => {
    const data = DataManager.getAllData();
    const coursesEl = document.getElementById('total-courses');
    const studentsEl = document.getElementById('total-students');
    const teachersEl = document.getElementById('total-teachers');
    
    if (coursesEl) coursesEl.textContent = data.courses.length;
    if (studentsEl) studentsEl.textContent = data.students.length;
    if (teachersEl) teachersEl.textContent = data.teachers.length;
};

const updateTodayAttendanceTable = () => {
    const data = DataManager.getAllData();
    const tableBody = document.getElementById('today-attendance-table');
    
    if (!tableBody) return;
    
    if (data.students.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center">No students enrolled</td></tr>';
        return;
    }

    tableBody.innerHTML = data.students.map(student => {
        const status = ['Present', 'Absent', 'Late'][Math.floor(Math.random()*3)];
        return `
            <tr>
                <td>${student.rollNo}</td>
                <td>${student.name}</td>
                <td>${student.course}</td>
                <td>${student.year}</td>
                <td>${student.batch}</td>
                <td>
                    <select class="status-select" data-rollno="${student.rollNo}">
                        <option value="Present" ${status === 'Present' ? 'selected' : ''}>Present</option>
                        <option value="Absent" ${status === 'Absent' ? 'selected' : ''}>Absent</option>
                        <option value="Late" ${status === 'Late' ? 'selected' : ''}>Late</option>
                    </select>
                </td>
                <td><input type="text" class="remarks-input" value="On time" placeholder="Remarks"></td>
                <td><button class="action-btn action-edit" onclick="saveTodayAttendance()">Save</button></td>
            </tr>`;
    }).join('');
};

const saveTodayAttendance = () => {
    const rows = document.querySelectorAll('#today-attendance-table tr');
    const attendanceData = [];
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 6) {
            attendanceData.push({
                rollNo: cells[0].textContent,
                status: cells[5].querySelector('select')?.value || 'Absent',
                remarks: cells[6].querySelector('input')?.value || ''
            });
        }
    });

    const existing = DataManager.load('sams_attendance');
    const today = new Date().toISOString().split('T')[0];
    existing[today] = attendanceData;
    DataManager.save('sams_attendance', existing);
    
    alert('✅ Today\'s attendance updated successfully!');
};

// Course Management
const initCourseManager = () => {
    const addBtn = document.getElementById('add-course-btn');
    const form = document.getElementById('course-form');
    const modal = document.getElementById('course-modal');
    const cancelBtn = document.getElementById('cancel-course');

    if (addBtn) addBtn.onclick = () => showModal(modal);
    if (form) form.onsubmit = addCourse;
    if (cancelBtn) cancelBtn.onclick = () => hideModal(modal);
};

const showModal = (modal) => {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

const hideModal = (modal) => {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
};

const addCourse = (e) => {
    e.preventDefault();
    const formData = {
        id: Date.now(),
        code: document.getElementById('course-code').value,
        name: document.getElementById('course-name').value,
        years: document.getElementById('course-years').value,
        students: 0,
        teachers: 0
    };

    const courses = DataManager.load('sams_courses');
    courses.push(formData);
    DataManager.save('sams_courses', courses);

    renderCoursesTable();
    document.getElementById('course-form').reset();
    hideModal(document.getElementById('course-modal'));
    updateDashboardStats();

    alert('✅ Course added successfully!');
};

const renderCoursesTable = () => {
    const data = DataManager.getAllData();
    const tableBody = document.getElementById('courses-table');
    
    if (!tableBody) return;
    
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
};

// Student Management
const initStudentManager = () => {
    const addBtn = document.getElementById('add-student-btn');
    const form = document.getElementById('student-form');
    const modal = document.getElementById('student-modal');
    const cancelBtn = document.getElementById('cancel-student');

    if (addBtn) addBtn.onclick = () => showModal(modal);
    if (form) form.onsubmit = addStudent;
    if (cancelBtn) cancelBtn.onclick = () => hideModal(modal);
    
    populateCourseDropdown('student-course');
};

const populateCourseDropdown = (selectId) => {
    const data = DataManager.getAllData();
    const select = document.getElementById(selectId);
    if (select) {
        select.innerHTML = '<option value="">Select Course</option>' + 
            data.courses.map(course => 
                `<option value="${course.code}">${course.name} (${course.code})</option>`
            ).join('');
    }
};

const addStudent = (e) => {
    e.preventDefault();
    const formData = {
        id: Date.now(),
        rollNo: document.getElementById('student-rollno').value,
        name: document.getElementById('student-name').value,
        course: document.getElementById('student-course').value,
        year: document.getElementById('student-year').value,
        batch: document.getElementById('student-batch').value
    };

    const students = DataManager.load('sams_students');
    students.push(formData);
    DataManager.save('sams_students', students);

    updateCourseStudentCount(formData.course);
    renderStudentsTable();
    document.getElementById('student-form').reset();
    hideModal(document.getElementById('student-modal'));
    updateDashboardStats();
    updateTodayAttendanceTable();

    alert('✅ Student added successfully!');
};

const updateCourseStudentCount = (courseCode) => {
    const data = DataManager.getAllData();
    const course = data.courses.find(c => c.code === courseCode);
    if (course) {
        course.students = (course.students || 0) + 1;
        DataManager.save('sams_courses', data.courses);
    }
};

const renderStudentsTable = () => {
    const data = DataManager.getAllData();
    const tableBody = document.getElementById('students-table');
    
    if (!tableBody) return;
    
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
};

// Teacher Management  
const initTeacherManager = () => {
    const addBtn = document.getElementById('add-teacher-btn');
    const form = document.getElementById('teacher-form');
    const modal = document.getElementById('teacher-modal');
    const cancelBtn = document.getElementById('cancel-teacher');

    if (addBtn) addBtn.onclick = () => showModal(modal);
    if (form) form.onsubmit = addTeacher;
    if (cancelBtn) cancelBtn.onclick = () => hideModal(modal);
    
    populateCourseDropdown('teacher-course');
};

const addTeacher = (e) => {
    e.preventDefault();
    const formData = {
        id: Date.now(),
        teacherId: document.getElementById('teacher-id').value,
        name: document.getElementById('teacher-name').value,
        course: document.getElementById('teacher-course').value,
        batch: document.getElementById('teacher-batch').value,
        year: document.getElementById('teacher-year').value
    };

    const teachers = DataManager.load('sams_teachers');
    teachers.push(formData);
    DataManager.save('sams_teachers', teachers);

    updateCourseTeacherCount(formData.course);
    renderTeachersTable();
    document.getElementById('teacher-form').reset();
    hideModal(document.getElementById('teacher-modal'));
    updateDashboardStats();

    alert('✅ Teacher added successfully!');
};

const updateCourseTeacherCount = (courseCode) => {
    const data = DataManager.getAllData();
    const course = data.courses.find(c => c.code === courseCode);
    if (course) {
        course.teachers = (course.teachers || 0) + 1;
        DataManager.save('sams_courses', data.courses);
    }
};

const renderTeachersTable = () => {
    const data = DataManager.getAllData();
    const tableBody = document.getElementById('teachers-table');
    
    if (!tableBody) return;
    
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
};

// Admin - All Users Table
const renderAllUsersTable = () => {
    const data = DataManager.getAllData();
    const allUsers = [
        ...data.students.map(s => ({...s, type: 'Student', userId: s.rollNo})),
        ...data.teachers.map(t => ({...t, type: 'Teacher', userId: t.teacherId}))
    ];
    
    const tableBody = document.getElementById('all-users-table');
    if (!tableBody) return;
    
    if (allUsers.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No users available</td></tr>';
        return;
    }

    tableBody.innerHTML = allUsers.slice(0, 50).map(user => `
        <tr>
            <td>${user.userId || 'N/A'}</td>
            <td>${user.name}</td>
            <td>${user.type}</td>
            <td>${user.course || 'N/A'}</td>
            <td>${user.batch || 'N/A'}</td>
            <td>${user.year || 'N/A'}</td>
            <td><button class="action-btn action-edit">Manage</button></td>
        </tr>
    `).join('');
};

// Initialize Everything
document.addEventListener('DOMContentLoaded', function() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = link.dataset.section;
            
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
            document.getElementById(targetSection).classList.add('active');
            
            // Refresh tables based on section
            setTimeout(() => {
                updateDashboardStats();
                renderCoursesTable();
                renderStudentsTable();
                renderTeachersTable();
                renderAllUsersTable();
            }, 100);
        });
    });

    // Event Listeners
    document.getElementById('export-data')?.addEventListener('click', DataManager.exportData);
    document.getElementById('update-today-attendance')?.addEventListener('click', saveTodayAttendance);

    // Initialize all managers
    initCourseManager();
    initStudentManager();
    initTeacherManager();
    
    // Initial load
    updateDashboardStats();
    updateTodayAttendanceTable();
    renderAllUsersTable();
});
