// SAMS Pro v3.0 © 2025 Nitesh Singh - Portfolio Project

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
        link.download = `sams-pro-backup-${new Date().toISOString().split('T')}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }
};

// Global State
let currentSection = 'dashboard';

// ==================== DASHBOARD ====================

const updateDashboardStats = () => {
    const data = DataManager.getAllData();
    const coursesEl = document.getElementById('total-courses');
    const studentsEl = document.getElementById('total-students');
    const teachersEl = document.getElementById('total-teachers');

    if (coursesEl) coursesEl.textContent = data.courses.length;
    if (studentsEl) studentsEl.textContent = data.students.length;
    if (teachersEl) teachersEl.textContent = data.teachers.length;

    updateAttendanceTable(data);
};

const updateAttendanceTable = (data) => {
    const tableBody = document.getElementById('attendance-table');
    if (!tableBody) return;

    if (data.courses.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No data available</td></tr>';
        return;
    }

    tableBody.innerHTML = data.courses.map(course => {
        const courseStudents = data.students.filter(s => s.course === course.code);
        const present = Math.floor(Math.random() * courseStudents.length);
        const percentage = courseStudents.length > 0
            ? ((present / courseStudents.length) * 100).toFixed(1)
            : '0.0';
        return `
            <tr>
                <td>${course.name}</td>
                <td>${course.years}</td>
                <td>${courseStudents.length}</td>
                <td>${present}</td>
                <td>${percentage}%</td>
            </tr>`;
    }).join('');
};

const updateTodayAttendanceTable = () => {
    const data = DataManager.getAllData();
    const tableBody = document.getElementById('today-attendance-table');

    if (!tableBody) return;

    if (data.students.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center">No students enrolled</td></tr>';
        return;
    }

    const today = new Date().toISOString().split('T');
    const todayAttendance = data.attendance[today] || [];

    tableBody.innerHTML = data.students.map(student => {
        const record = todayAttendance.find(a => a.rollNo === student.rollNo);
        const status = record ? record.status : 'Present';
        const remarks = record ? record.remarks : '';

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
                <td><input type="text" class="remarks-input" value="${remarks}" placeholder="Remarks"></td>
                <td><button class="action-btn action-edit" onclick="saveSingleAttendance(this, '${student.rollNo}')">Save</button></td>
            </tr>`;
    }).join('');
};

const saveSingleAttendance = (btn, rollNo) => {
    const row = btn.closest('tr');
    const status = row.querySelector('.status-select').value;
    const remarks = row.querySelector('.remarks-input').value;

    const existing = DataManager.load('sams_attendance');
    const today = new Date().toISOString().split('T');
    if (!existing[today]) existing[today] = [];

    const index = existing[today].findIndex(a => a.rollNo === rollNo);
    if (index >= 0) {
        existing[today] [index] = { rollNo, status, remarks };
    } else {
        existing[today].push({ rollNo, status, remarks });
    }

    DataManager.save('sams_attendance', existing);
    showToast(`✅ Attendance saved for ${rollNo}`);
};

// ==================== MARK ATTENDANCE ====================

const initMarkAttendance = () => {
    const tableBody = document.getElementById('mark-attendance-table');
    if (!tableBody) return;

    const data = DataManager.getAllData();
    if (data.students.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No students available</td></tr>';
        return;
    }

    const today = new Date().toISOString().split('T');
    const todayAttendance = data.attendance[today] || [];

    tableBody.innerHTML = data.students.map(student => {
        const record = todayAttendance.find(a => a.rollNo === student.rollNo);
        const status = record ? record.status : 'Present';
        const remarks = record ? record.remarks : '';

        return `
            <tr>
                <td>${student.rollNo}</td>
                <td>${student.name}</td>
                <td>
                    <select class="status-select" data-rollno="${student.rollNo}">
                        <option value="Present" ${status === 'Present' ? 'selected' : ''}>Present</option>
                        <option value="Absent" ${status === 'Absent' ? 'selected' : ''}>Absent</option>
                        <option value="Late" ${status === 'Late' ? 'selected' : ''}>Late</option>
                    </select>
                </td>
                <td><input type="text" class="remarks-input" value="${remarks}" placeholder="Remarks"></td>
                <td><button class="action-btn action-edit" onclick="saveAttendanceRecord(this, '${student.rollNo}')">Save</button></td>
            </tr>`;
    }).join('');
};

const saveAttendanceRecord = (btn, rollNo) => {
    const row = btn.closest('tr');
    const status = row.querySelector('.status-select').value;
    const remarks = row.querySelector('.remarks-input').value;

    const existing = DataManager.load('sams_attendance');
    const today = new Date().toISOString().split('T');
    if (!existing[today]) existing[today] = [];

    const index = existing[today].findIndex(a => a.rollNo === rollNo);
    if (index >= 0) {
        existing[today] [index] = { rollNo, status, remarks };
    } else {
        existing[today].push({ rollNo, status, remarks });
    }

    DataManager.save('sams_attendance', existing);
    showToast(`✅ Attendance saved for ${rollNo}`);
};

// ==================== MODAL HELPERS ====================

const showModal = (modal) => {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

const hideModal = (modal) => {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
};

// ==================== TOAST NOTIFICATION ====================

const showToast = (message) => {
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
};

// ==================== COURSE MANAGEMENT ====================

const initCourseManager = () => {
    const addBtn = document.getElementById('add-course-btn');
    const form = document.getElementById('course-form');
    const modal = document.getElementById('course-modal');
    const cancelBtn = document.getElementById('cancel-course');

    if (addBtn) addBtn.onclick = () => {
        document.getElementById('course-form').reset();
        document.getElementById('course-form').onsubmit = addCourse;
        showModal(modal);
    };
    if (cancelBtn) cancelBtn.onclick = () => hideModal(modal);
};

const addCourse = (e) => {
    e.preventDefault();
    const formData = {
        id: Date.now(),
        code: document.getElementById('course-code').value.trim(),
        name: document.getElementById('course-name').value.trim(),
        years: document.getElementById('course-years').value,
        students: 0,
        teachers: 0
    };

    const courses = DataManager.load('sams_courses');

    // Check for duplicate course code
    if (courses.find(c => c.code === formData.code)) {
        showToast('❌ Course code already exists!');
        return;
    }

    courses.push(formData);
    DataManager.save('sams_courses', courses);

    renderCoursesTable();
    populateCourseDropdown('student-course');
    populateCourseDropdown('teacher-course');
    document.getElementById('course-form').reset();
    hideModal(document.getElementById('course-modal'));
    updateDashboardStats();

    showToast('✅ Course added successfully!');
};

const editCourse = (courseId) => {
    const courses = DataManager.load('sams_courses');
    const course = courses.find(c => c.id === courseId);

    if (course) {
        document.getElementById('course-code').value = course.code;
        document.getElementById('course-name').value = course.name;
        document.getElementById('course-years').value = course.years;

        showModal(document.getElementById('course-modal'));

        document.getElementById('course-form').onsubmit = (e) => {
            e.preventDefault();
            course.code = document.getElementById('course-code').value.trim();
            course.name = document.getElementById('course-name').value.trim();
            course.years = document.getElementById('course-years').value;

            DataManager.save('sams_courses', courses);

            renderCoursesTable();
            populateCourseDropdown('student-course');
            populateCourseDropdown('teacher-course');
            updateDashboardStats();

            document.getElementById('course-form').reset();
            document.getElementById('course-form').onsubmit = addCourse;
            hideModal(document.getElementById('course-modal'));

            showToast('✅ Course updated successfully!');
        };
    }
};

const deleteCourse = (courseId) => {
    if (confirm('Are you sure you want to delete this course?')) {
        const courses = DataManager.load('sams_courses');
        const filtered = courses.filter(c => c.id !== courseId);
        DataManager.save('sams_courses', filtered);

        renderCoursesTable();
        populateCourseDropdown('student-course');
        populateCourseDropdown('teacher-course');
        updateDashboardStats();

        showToast('✅ Course deleted successfully!');
    }
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
                <button class="action-btn action-edit" onclick="editCourse(${course.id})">Edit</button>
                <button class="action-btn action-delete" onclick="deleteCourse(${course.id})">Delete</button>
            </td>
        </tr>
    `).join('');
};

// ==================== STUDENT MANAGEMENT ====================

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

const initStudentManager = () => {
    const addBtn = document.getElementById('add-student-btn');
    const modal = document.getElementById('student-modal');
    const cancelBtn = document.getElementById('cancel-student');

    if (addBtn) addBtn.onclick = () => {
        document.getElementById('student-form').reset();
        document.getElementById('student-form').onsubmit = addStudent;
        populateCourseDropdown('student-course');
        showModal(modal);
    };
    if (cancelBtn) cancelBtn.onclick = () => hideModal(modal);

    document.getElementById('student-form').onsubmit = addStudent;
    populateCourseDropdown('student-course');
};

const addStudent = (e) => {
    e.preventDefault();
    const formData = {
        id: Date.now(),
        rollNo: document.getElementById('student-rollno').value.trim(),
        name: document.getElementById('student-name').value.trim(),
        course: document.getElementById('student-course').value,
        year: document.getElementById('student-year').value,
        batch: document.getElementById('student-batch').value.trim()
    };

    const students = DataManager.load('sams_students');

    // Check for duplicate roll number
    if (students.find(s => s.rollNo === formData.rollNo)) {
        showToast('❌ Roll number already exists!');
        return;
    }

    students.push(formData);
    DataManager.save('sams_students', students);

    updateCourseStudentCount(formData.course);
    renderStudentsTable();
    document.getElementById('student-form').reset();
    hideModal(document.getElementById('student-modal'));
    updateDashboardStats();
    updateTodayAttendanceTable();
    initMarkAttendance();

    showToast('✅ Student added successfully!');
};

const editStudent = (studentId) => {
    const students = DataManager.load('sams_students');
    const student = students.find(s => s.id === studentId);

    if (student) {
        document.getElementById('student-rollno').value = student.rollNo;
        document.getElementById('student-name').value = student.name;
        document.getElementById('student-course').value = student.course;
        document.getElementById('student-year').value = student.year;
        document.getElementById('student-batch').value = student.batch;

        showModal(document.getElementById('student-modal'));

        document.getElementById('student-form').onsubmit = (e) => {
            e.preventDefault();
            student.rollNo = document.getElementById('student-rollno').value.trim();
            student.name = document.getElementById('student-name').value.trim();
            student.course = document.getElementById('student-course').value;
            student.year = document.getElementById('student-year').value;
            student.batch = document.getElementById('student-batch').value.trim();

            DataManager.save('sams_students', students);

            renderStudentsTable();
            updateDashboardStats();
            updateTodayAttendanceTable();
            initMarkAttendance();

            document.getElementById('student-form').reset();
            document.getElementById('student-form').onsubmit = addStudent;
            hideModal(document.getElementById('student-modal'));

            showToast('✅ Student updated successfully!');
        };
    }
};

const deleteStudent = (studentId) => {
    if (confirm('Are you sure you want to delete this student?')) {
        const students = DataManager.load('sams_students');
        const filtered = students.filter(s => s.id !== studentId);
        DataManager.save('sams_students', filtered);

        renderStudentsTable();
        updateDashboardStats();
        updateTodayAttendanceTable();
        initMarkAttendance();

        showToast('✅ Student deleted successfully!');
    }
};

const updateCourseStudentCount = (courseCode) => {
    const data = DataManager.getAllData();
    const course = data.courses.find(c => c.code === courseCode);
    if (course) {
        course.students = (course.students || 0) + 1;
        DataManager.save('sams_courses', data.courses);
        renderCoursesTable();
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
                <button class="action-btn action-edit" onclick="editStudent(${student.id})">Edit</button>
                <button class="action-btn action-delete" onclick="deleteStudent(${student.id})">Delete</button>
            </td>
        </tr>
    `).join('');
};

// ==================== TEACHER MANAGEMENT ====================

const initTeacherManager = () => {
    const addBtn = document.getElementById('add-teacher-btn');
    const modal = document.getElementById('teacher-modal');
    const cancelBtn = document.getElementById('cancel-teacher');

    if (addBtn) addBtn.onclick = () => {
        document.getElementById('teacher-form').reset();
        document.getElementById('teacher-form').onsubmit = addTeacher;
        populateCourseDropdown('teacher-course');
        showModal(modal);
    };
    if (cancelBtn) cancelBtn.onclick = () => hideModal(modal);

    document.getElementById('teacher-form').onsubmit = addTeacher;
    populateCourseDropdown('teacher-course');
};

const addTeacher = (e) => {
    e.preventDefault();
    const formData = {
        id: Date.now(),
        teacherId: document.getElementById('teacher-id').value.trim(),
        name: document.getElementById('teacher-name').value.trim(),
        course: document.getElementById('teacher-course').value,
        batch: document.getElementById('teacher-batch').value.trim(),
        year: document.getElementById('teacher-year').value
    };

    const teachers = DataManager.load('sams_teachers');

    // Check for duplicate teacher ID
    if (teachers.find(t => t.teacherId === formData.teacherId)) {
        showToast('❌ Teacher ID already exists!');
        return;
    }

    teachers.push(formData);
    DataManager.save('sams_teachers', teachers);

    updateCourseTeacherCount(formData.course);
    renderTeachersTable();
    document.getElementById('teacher-form').reset();
    hideModal(document.getElementById('teacher-modal'));
    updateDashboardStats();

    showToast('✅ Teacher added successfully!');
};

const editTeacher = (teacherId) => {
    const teachers = DataManager.load('sams_teachers');
    const teacher = teachers.find(t => t.id === teacherId);

    if (teacher) {
        document.getElementById('teacher-id').value = teacher.teacherId;
        document.getElementById('teacher-name').value = teacher.name;
        document.getElementById('teacher-course').value = teacher.course;
        document.getElementById('teacher-batch').value = teacher.batch;
        document.getElementById('teacher-year').value = teacher.year;

        showModal(document.getElementById('teacher-modal'));

        document.getElementById('teacher-form').onsubmit = (e) => {
            e.preventDefault();
            teacher.teacherId = document.getElementById('teacher-id').value.trim();
            teacher.name = document.getElementById('teacher-name').value.trim();
            teacher.course = document.getElementById('teacher-course').value;
            teacher.batch = document.getElementById('teacher-batch').value.trim();
            teacher.year = document.getElementById('teacher-year').value;

            DataManager.save('sams_teachers', teachers);

            renderTeachersTable();
            updateDashboardStats();

            document.getElementById('teacher-form').reset();
            document.getElementById('teacher-form').onsubmit = addTeacher;
            hideModal(document.getElementById('teacher-modal'));

            showToast('✅ Teacher updated successfully!');
        };
    }
};

const deleteTeacher = (teacherId) => {
    if (confirm('Are you sure you want to delete this teacher?')) {
        const teachers = DataManager.load('sams_teachers');
        const filtered = teachers.filter(t => t.id !== teacherId);
        DataManager.save('sams_teachers', filtered);

        renderTeachersTable();
        updateDashboardStats();

        showToast('✅ Teacher deleted successfully!');
    }
};

const updateCourseTeacherCount = (courseCode) => {
    const data = DataManager.getAllData();
    const course = data.courses.find(c => c.code === courseCode);
    if (course) {
        course.teachers = (course.teachers || 0) + 1;
        DataManager.save('sams_courses', data.courses);
        renderCoursesTable();
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
                <button class="action-btn action-edit" onclick="editTeacher(${teacher.id})">Edit</button>
                <button class="action-btn action-delete" onclick="deleteTeacher(${teacher.id})">Delete</button>
            </td>
        </tr>
    `).join('');
};

// ==================== ADMIN - ALL USERS TABLE ====================

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
            <td><button class="action-btn action-edit" onclick="manageUser('${user.userId}', '${user.type}')">Manage</button></td>
        </tr>
    `).join('');
};

const manageUser = (userId, userType) => {
    showToast(`Managing ${userType}: ${userId}`);
};

// ==================== INITIALIZE EVERYTHING ====================

document.addEventListener('DOMContentLoaded', function() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = link.dataset.section;
            currentSection = targetSection;

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
                initMarkAttendance();
                updateTodayAttendanceTable();
            }, 100);
        });
    });

    // Event Listeners
    document.getElementById('export-data')?.addEventListener('click', DataManager.exportData);
    document.getElementById('update-today-attendance')?.addEventListener('click', () => {
        updateTodayAttendanceTable();
        showToast('✅ Today\'s attendance table refreshed!');
    });

    // Initialize all managers
    initCourseManager();
    initStudentManager();
    initTeacherManager();

    // Initial load
    updateDashboardStats();
    updateTodayAttendanceTable();
    initMarkAttendance();
    renderAllUsersTable();
    renderCoursesTable();
    renderStudentsTable();
    renderTeachersTable();
});
