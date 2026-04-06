// main.js
// Core logic, DOM events, and initialization for SAMS Pro v3.0

// Get current user
const getCurrentUser = () => {
    const user = JSON.parse(localStorage.getItem('sams_user'));
    return user || { id: 'guest', role: 'guest' };
};

// Check if user has permission
const hasPermission = (requiredRole) => {
    const user = getCurrentUser();
    const roles = ['guest', 'teacher', 'admin', 'superadmin'];
    return roles.indexOf(user.role) >= roles.indexOf(requiredRole);
};

// Global State
let currentSection = 'dashboard';

// ==================== DASHBOARD ====================

const updateDashboardStats = () => {
    getAllData().then(data => {
        const coursesEl = document.getElementById('total-courses');
        const studentsEl = document.getElementById('total-students');
        const teachersEl = document.getElementById('total-teachers');

        if (coursesEl) coursesEl.textContent = data.courses.length;
        if (studentsEl) studentsEl.textContent = data.students.length;
        if (teachersEl) teachersEl.textContent = data.teachers.length;

        updateAttendanceTable(data);
    });
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

// ==================== MARK ATTENDANCE ====================

const initMarkAttendance = () => {
    const tableBody = document.getElementById('mark-attendance-table');
    if (!tableBody) return;

    getAllData().then(data => {
        if (data.students.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" class="text-center">Select course and batch to view students</td></tr>';
            return;
        }
        updateAttendanceStudents();
    });
};

// ==================== ATTENDANCE FILTERING ====================

const initAttendanceFilters = () => {
    const today = new Date();
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    const formattedDate = today.toLocaleDateString('en-US', options);
    const dateInput = document.getElementById('attendance-date');
    if (dateInput) dateInput.value = formattedDate;
    populateAttendanceCourses();
};

const populateAttendanceCourses = () => {
    getAllData().then(data => {
        const select = document.getElementById('attendance-course');
        
        if (select) {
            select.innerHTML = '<option value="">-- Select Course --</option>' +
                data.courses.map(course =>
                    `<option value="${course.code}">${course.name} (${course.code})</option>`
                ).join('');
        }
        
        const batchSelect = document.getElementById('attendance-batch');
        if (batchSelect) batchSelect.innerHTML = '<option value="">-- Select Batch --</option>';
        
        const tableBody = document.getElementById('mark-attendance-table');
        if (tableBody) tableBody.innerHTML = '<tr><td colspan="4" class="text-center">Select course and batch to view students</td></tr>';
        
        hideAttendanceSaveButton();
    });
};

const updateAttendanceBatches = () => {
    const courseCode = document.getElementById('attendance-course').value;
    
    if (!courseCode) {
        const batchSelect = document.getElementById('attendance-batch');
        if (batchSelect) batchSelect.innerHTML = '<option value="">-- Select Batch --</option>';
        const tableBody = document.getElementById('mark-attendance-table');
        if (tableBody) tableBody.innerHTML = '<tr><td colspan="4" class="text-center">Select course and batch to view students</td></tr>';
        hideAttendanceSaveButton();
        return;
    }
    
    getAllData().then(data => {
        const courseStudents = data.students.filter(s => s.course === courseCode);
        const batches = [...new Set(courseStudents.map(s => s.batch))];
        
        const select = document.getElementById('attendance-batch');
        if (select) {
            select.innerHTML = '<option value="">-- Select Batch --</option>' +
                batches.map(batch =>
                    `<option value="${batch}">${batch}</option>`
                ).join('');
        }
        
        const tableBody = document.getElementById('mark-attendance-table');
        if (tableBody) tableBody.innerHTML = '<tr><td colspan="4" class="text-center">Select a batch to view students</td></tr>';
        
        hideAttendanceSaveButton();
    });
};

const getDateKey = (date = new Date()) => {
    return typeof date === 'string' ? date : date.toISOString().split('T')[0];
};

const updateAttendanceStudents = () => {
    const courseCode = document.getElementById('attendance-course').value;
    const batch = document.getElementById('attendance-batch').value;
    const today = getDateKey();
    
    if (!courseCode || !batch) {
        const tableBody = document.getElementById('mark-attendance-table');
        if (tableBody) tableBody.innerHTML = '<tr><td colspan="4" class="text-center">Select course and batch to view students</td></tr>';
        hideAttendanceSaveButton();
        return;
    }
    
    getAllData().then(data => {
        const filteredStudents = data.students.filter(s => s.course === courseCode && s.batch === batch);
        
        if (filteredStudents.length === 0) {
            const tableBody = document.getElementById('mark-attendance-table');
            if (tableBody) tableBody.innerHTML = '<tr><td colspan="4" class="text-center">No students in this batch</td></tr>';
            hideAttendanceSaveButton();
            return;
        }
        
        const attendanceData = data.attendance.filter(a => a.date === today);
        
        const tableBody = document.getElementById('mark-attendance-table');
        if (tableBody) {
            tableBody.innerHTML = filteredStudents.map((student, index) => {
                const record = attendanceData.find(a => a.rollNo === student.rollNo);
                const status = record ? record.status : 'Present';
                
                return `
                    <tr>
                        <td><input type="checkbox" class="student-checkbox" data-index="${index}" data-rollno="${student.rollNo}"></td>
                        <td>${student.rollNo}</td>
                        <td>${student.name}</td>
                        <td>
                            <select class="status-select" onchange="setStudentStatus('${student.rollNo}', this.value)">
                                <option value="Present" ${status === 'Present' ? 'selected' : ''}>Present</option>
                                <option value="Absent" ${status === 'Absent' ? 'selected' : ''}>Absent</option>
                            </select>
                        </td>
                    </tr>`;
            }).join('');
        }
        
        showAttendanceSaveButton();
        const selectAllCheckbox = document.getElementById('select-all-students');
        if (selectAllCheckbox) selectAllCheckbox.checked = false;
    });
};

const toggleAllStudents = () => {
    const checkboxes = document.querySelectorAll('.student-checkbox');
    const selectAllCheckbox = document.getElementById('select-all-students');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
};

const markAllPresent = () => {
    const selects = document.querySelectorAll('.status-select');
    selects.forEach(select => {
        select.value = 'Present';
        const row = select.closest('tr');
        if (row) {
            row.style.backgroundColor = 'rgba(72, 187, 120, 0.1)';
            setTimeout(() => {
                row.style.backgroundColor = '';
            }, 300);
        }
    });
    showToast('✅ All students marked as Present');
};

const saveAllAttendance = () => {
    const today = getDateKey();
    const rows = document.querySelectorAll('#mark-attendance-table tr');
    
    if (rows.length === 0) {
        showToast('❌ No students to save');
        return;
    }
    
    let saved = 0;
    rows.forEach(row => {
        const rollNoCell = row.querySelector('td:nth-child(2)');
        const statusSelect = row.querySelector('.status-select');
        
        if (rollNoCell && statusSelect) {
            const rollNo = rollNoCell.textContent.trim();
            const status = statusSelect.value;
            
            updateAttendanceRecord(today, rollNo, status, '');
            saved++;
        }
    });
    
    showToast(`✅ Attendance saved for ${saved} students!`);
};

const setStudentStatus = (rollNo, status) => {
    const today = getDateKey();
    updateAttendanceRecord(today, rollNo, status, '');
    showToast(`✅ ${status} marked for ${rollNo}`);
};

const showAttendanceSaveButton = () => {
    const btn = document.getElementById('save-all-attendance');
    if (btn) btn.style.display = 'flex';
};

const hideAttendanceSaveButton = () => {
    const btn = document.getElementById('save-all-attendance');
    if (btn) btn.style.display = 'none';
};

let currentEditAttendanceContext = null;

const promptAttendanceContext = (action) => {
    const currentCourse = document.getElementById('attendance-course').value;
    const currentBatch = document.getElementById('attendance-batch').value;
    const courseCode = currentCourse || prompt(`Enter course code to ${action} attendance (e.g. CSE101):`);
    if (!courseCode) return null;
    const batch = currentBatch || prompt('Enter batch to review/edit attendance:');
    if (!batch) return null;
    const dateInput = prompt('Enter attendance date (YYYY-MM-DD):', getDateKey());
    if (!dateInput) return null;
    return { courseCode: courseCode.trim(), batch: batch.trim(), date: dateInput.trim() };
};

const renderAttendanceHistory = (students, attendanceData, editable = false) => {
    const historyPanel = document.getElementById('attendance-history-panel');
    const historyBody = document.getElementById('attendance-history-table');
    if (!historyBody || !historyPanel) return;

    if (students.length === 0) {
        historyBody.innerHTML = '<tr><td colspan="3" class="text-center">No students found for this course and batch</td></tr>';
        historyPanel.style.display = 'block';
        return;
    }

    historyBody.innerHTML = students.map(student => {
        const record = attendanceData.find(a => a.rollNo === student.rollNo);
        const status = record ? record.status : 'Not Recorded';

        if (editable) {
            return `
                <tr>
                    <td>${student.rollNo}</td>
                    <td>${student.name}</td>
                    <td>
                        <select class="status-select">
                            <option value="Present" ${status === 'Present' ? 'selected' : ''}>Present</option>
                            <option value="Absent" ${status === 'Absent' ? 'selected' : ''}>Absent</option>
                            <option value="Not Recorded" ${status === 'Not Recorded' ? 'selected' : ''}>Not Recorded</option>
                        </select>
                    </td>
                </tr>`;
        }

        return `
            <tr>
                <td>${student.rollNo}</td>
                <td>${student.name}</td>
                <td>${status}</td>
            </tr>`;
    }).join('');

    historyPanel.style.display = 'block';
};

const getAttendanceContext = (date, courseCode, batch) => {
    return getAllData().then(data => {
        const students = data.students.filter(s => s.course === courseCode && s.batch === batch);
        const attendanceData = data.attendance.filter(a => a.date === date);
        return { students, attendanceData };
    });
};

const checkPreviousAttendance = () => {
    const context = promptAttendanceContext('view');
    if (!context) {
        showToast('⚠️ Previous attendance check cancelled');
        return;
    }

    getAttendanceContext(context.date, context.courseCode, context.batch).then(({ students, attendanceData }) => {
        renderAttendanceHistory(students, attendanceData, false);
        document.getElementById('save-edited-attendance').style.display = 'none';
        currentEditAttendanceContext = null;
        showToast(`📋 Showing attendance for ${context.courseCode} ${context.batch} on ${context.date}`);
    });
};

const editPreviousAttendance = () => {
    const context = promptAttendanceContext('edit');
    if (!context) {
        showToast('⚠️ Edit attendance cancelled');
        return;
    }

    getAttendanceContext(context.date, context.courseCode, context.batch).then(({ students, attendanceData }) => {
        renderAttendanceHistory(students, attendanceData, true);
        const saveButton = document.getElementById('save-edited-attendance');
        if (saveButton) saveButton.style.display = 'flex';
        currentEditAttendanceContext = context;
        showToast(`✏️ Editing attendance for ${context.courseCode} ${context.batch} on ${context.date}`);
    });
};

const saveEditedAttendance = () => {
    if (!currentEditAttendanceContext) {
        showToast('⚠️ No attendance loaded for editing');
        return;
    }

    const { date, courseCode, batch } = currentEditAttendanceContext;
    const rows = document.querySelectorAll('#attendance-history-table tr');

    let updated = 0;
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length < 3) return;
        const rollNo = cells[0].textContent.trim();
        const select = row.querySelector('.status-select');
        if (!rollNo || !select) return;

        const status = select.value;
        if (status === 'Not Recorded') {
            // remove attendance entry if it exists
            updateAttendanceRecord(date, rollNo, 'Absent', '');
        } else {
            updateAttendanceRecord(date, rollNo, status, '');
        }
        updated++;
    });

    const saveButton = document.getElementById('save-edited-attendance');
    if (saveButton) saveButton.style.display = 'none';
    currentEditAttendanceContext = null;
    showToast(`✅ Updated ${updated} attendance records for ${courseCode} ${batch}`);
};

// ==================== COURSE MANAGEMENT ====================

const initCourseManager = () => {
    const addBtn = document.getElementById('add-course-btn');
    const modal = document.getElementById('course-modal');
    const cancelBtn = document.getElementById('cancel-course');
    const form = document.getElementById('course-form');

    console.log('Initializing Course Manager');

    if (!hasPermission('admin')) {
        if (addBtn) addBtn.style.display = 'none';
        return;
    }

    if (addBtn) {
        addBtn.onclick = (e) => {
            e.preventDefault();
            console.log('Add Course clicked');
            document.getElementById('course-form').reset();
            document.getElementById('course-form').onsubmit = addCourseHandler;
            showModal(modal);
        };
    }
    
    if (cancelBtn) {
        cancelBtn.onclick = (e) => {
            e.preventDefault();
            hideModal(modal);
        };
    }

    if (form) {
        form.onsubmit = addCourseHandler;
    }
};

const addCourseHandler = (e) => {
    e.preventDefault();
    console.log('Adding course...');
    
    const formData = {
        id: Date.now(),
        code: document.getElementById('course-code').value.trim(),
        name: document.getElementById('course-name').value.trim(),
        years: parseInt(document.getElementById('course-years').value),
        students: 0,
        teachers: 0
    };

    getAllData().then(data => {
        if (data.courses.find(c => c.code === formData.code)) {
            showToast('❌ Course code already exists!');
            return;
        }

        addCourse(formData).then(() => {
            renderCoursesTable();
            populateCourseDropdown('student-course');
            populateCourseDropdown('teacher-course');
            populateAttendanceCourses();
            document.getElementById('course-form').reset();
            hideModal(document.getElementById('course-modal'));
            updateDashboardStats();
            showToast('✅ Course added successfully!');
        });
    });
};

const editCourse = (courseId) => {
    getAllData().then(data => {
        const course = data.courses.find(c => c.id === courseId);

        if (course) {
            document.getElementById('course-code').value = course.code;
            document.getElementById('course-name').value = course.name;
            document.getElementById('course-years').value = course.years;

            showModal(document.getElementById('course-modal'));

            document.getElementById('course-form').onsubmit = (e) => {
                e.preventDefault();
                const updatedCourse = {
                    code: document.getElementById('course-code').value.trim(),
                    name: document.getElementById('course-name').value.trim(),
                    years: parseInt(document.getElementById('course-years').value)
                };

                updateCourse(courseId, updatedCourse).then(() => {
                    renderCoursesTable();
                    populateCourseDropdown('student-course');
                    populateCourseDropdown('teacher-course');
                    populateAttendanceCourses();
                    updateDashboardStats();

                    document.getElementById('course-form').reset();
                    document.getElementById('course-form').onsubmit = addCourseHandler;
                    hideModal(document.getElementById('course-modal'));

                    showToast('✅ Course updated successfully!');
                });
            };
        }
    });
};

const deleteCourseHandler = (courseId) => {
    if (confirm('Are you sure you want to delete this course?')) {
        window.DataManager.deleteCourse(courseId).then(() => {
            renderCoursesTable();
            populateCourseDropdown('student-course');
            populateCourseDropdown('teacher-course');
            populateAttendanceCourses();
            updateDashboardStats();
            showToast('✅ Course deleted successfully!');
        });
    }
};

const renderCoursesTable = () => {
    getAllData().then(data => {
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
                    <button class="action-btn action-delete" onclick="deleteCourseHandler(${course.id})">Delete</button>
                </td>
            </tr>
        `).join('');
    });
};

// ==================== STUDENT MANAGEMENT ====================

const populateCourseDropdown = (selectId) => {
    getAllData().then(data => {
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = '<option value="">Select Course</option>' +
                data.courses.map(course =>
                    `<option value="${course.code}">${course.name} (${course.code})</option>`
                ).join('');
        }
    });
};

const initStudentManager = () => {
    const addBtn = document.getElementById('add-student-btn');
    const modal = document.getElementById('student-modal');
    const cancelBtn = document.getElementById('cancel-student');
    const form = document.getElementById('student-form');

    console.log('Initializing Student Manager');

    if (!hasPermission('teacher')) {
        if (addBtn) addBtn.style.display = 'none';
        return;
    }

    if (addBtn) {
        addBtn.onclick = (e) => {
            e.preventDefault();
            console.log('Add Student clicked');
            document.getElementById('student-form').reset();
            document.getElementById('student-form').onsubmit = addStudentHandler;
            populateCourseDropdown('student-course');
            showModal(modal);
        };
    }

    if (cancelBtn) {
        cancelBtn.onclick = (e) => {
            e.preventDefault();
            hideModal(modal);
        };
    }

    if (form) {
        form.onsubmit = addStudentHandler;
    }

    populateCourseDropdown('student-course');
};

const addStudentHandler = (e) => {
    e.preventDefault();
    console.log('Adding student...');
    
    const formData = {
        id: Date.now(),
        rollNo: document.getElementById('student-rollno').value.trim(),
        name: document.getElementById('student-name').value.trim(),
        course: document.getElementById('student-course').value,
        year: parseInt(document.getElementById('student-year').value),
        batch: document.getElementById('student-batch').value.trim()
    };

    getAllData().then(data => {
        if (data.students.find(s => s.rollNo === formData.rollNo)) {
            showToast('❌ Roll number already exists!');
            return;
        }

        addStudent(formData).then(() => {
            updateCourseStudentCount(formData.course);
            renderStudentsTable();
            document.getElementById('student-form').reset();
            hideModal(document.getElementById('student-modal'));
            updateDashboardStats();
            populateAttendanceCourses();
            initMarkAttendance();
            showToast('✅ Student added successfully!');
        });
    });
};

const editStudent = (studentId) => {
    getAllData().then(data => {
        const student = data.students.find(s => s.id === studentId);

        if (student) {
            document.getElementById('student-rollno').value = student.rollNo;
            document.getElementById('student-name').value = student.name;
            document.getElementById('student-course').value = student.course;
            document.getElementById('student-year').value = student.year;
            document.getElementById('student-batch').value = student.batch;

            showModal(document.getElementById('student-modal'));

            document.getElementById('student-form').onsubmit = (e) => {
                e.preventDefault();
                const updatedStudent = {
                    rollNo: document.getElementById('student-rollno').value.trim(),
                    name: document.getElementById('student-name').value.trim(),
                    course: document.getElementById('student-course').value,
                    year: parseInt(document.getElementById('student-year').value),
                    batch: document.getElementById('student-batch').value.trim()
                };

                updateStudent(studentId, updatedStudent).then(() => {
                    renderStudentsTable();
                    populateAttendanceCourses();
                    updateDashboardStats();
                    document.getElementById('student-form').reset();
                    document.getElementById('student-form').onsubmit = addStudentHandler;
                    hideModal(document.getElementById('student-modal'));
                    showToast('✅ Student updated successfully!');
                });
            };
        }
    });
};

const deleteStudentHandler = (studentId) => {
    if (confirm('Are you sure you want to delete this student?')) {
        window.DataManager.deleteStudent(studentId).then(() => {
            renderStudentsTable();
            updateDashboardStats();
            populateAttendanceCourses();
            showToast('✅ Student deleted successfully!');
        });
    }
};

const renderStudentsTable = () => {
    getAllData().then(data => {
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
                    <button class="action-btn action-delete" onclick="deleteStudentHandler(${student.id})">Delete</button>
                </td>
            </tr>
        `).join('');
    });
};

const updateCourseStudentCount = (courseCode) => {
    getAllData().then(data => {
        const course = data.courses.find(c => c.code === courseCode);
        if (course) {
            const studentCount = data.students.filter(s => s.course === courseCode).length;
            updateCourse(course.id, { students: studentCount });
            renderCoursesTable();
        }
    });
};

// ==================== TEACHER MANAGEMENT ====================

const initTeacherManager = () => {
    const addBtn = document.getElementById('add-teacher-btn');
    const modal = document.getElementById('teacher-modal');
    const cancelBtn = document.getElementById('cancel-teacher');
    const form = document.getElementById('teacher-form');

    console.log('Initializing Teacher Manager');

    if (!hasPermission('admin')) {
        if (addBtn) addBtn.style.display = 'none';
        return;
    }

    if (addBtn) {
        addBtn.onclick = (e) => {
            e.preventDefault();
            console.log('Add Teacher clicked');
            document.getElementById('teacher-form').reset();
            document.getElementById('teacher-form').onsubmit = addTeacherHandler;
            populateCourseDropdown('teacher-course');
            showModal(modal);
        };
    }

    if (cancelBtn) {
        cancelBtn.onclick = (e) => {
            e.preventDefault();
            hideModal(modal);
        };
    }

    if (form) {
        form.onsubmit = addTeacherHandler;
    }

    populateCourseDropdown('teacher-course');
};

const addTeacherHandler = (e) => {
    e.preventDefault();
    console.log('Adding teacher...');
    
    const formData = {
        id: Date.now(),
        teacherId: document.getElementById('teacher-id').value.trim(),
        name: document.getElementById('teacher-name').value.trim(),
        course: document.getElementById('teacher-course').value,
        batch: document.getElementById('teacher-batch').value.trim(),
        year: parseInt(document.getElementById('teacher-year').value)
    };

    getAllData().then(data => {
        if (data.teachers.find(t => t.teacherId === formData.teacherId)) {
            showToast('❌ Teacher ID already exists!');
            return;
        }

        addTeacher(formData).then(() => {
            updateCourseTeacherCount(formData.course);
            renderTeachersTable();
            document.getElementById('teacher-form').reset();
            hideModal(document.getElementById('teacher-modal'));
            updateDashboardStats();
            showToast('✅ Teacher added successfully!');
        });
    });
};

const editTeacher = (teacherId) => {
    getAllData().then(data => {
        const teacher = data.teachers.find(t => t.id === teacherId);

        if (teacher) {
            document.getElementById('teacher-id').value = teacher.teacherId;
            document.getElementById('teacher-name').value = teacher.name;
            document.getElementById('teacher-course').value = teacher.course;
            document.getElementById('teacher-batch').value = teacher.batch;
            document.getElementById('teacher-year').value = teacher.year;

            showModal(document.getElementById('teacher-modal'));

            document.getElementById('teacher-form').onsubmit = (e) => {
                e.preventDefault();
                const updatedTeacher = {
                    teacherId: document.getElementById('teacher-id').value.trim(),
                    name: document.getElementById('teacher-name').value.trim(),
                    course: document.getElementById('teacher-course').value,
                    batch: document.getElementById('teacher-batch').value.trim(),
                    year: parseInt(document.getElementById('teacher-year').value)
                };

                updateTeacher(teacherId, updatedTeacher).then(() => {
                    renderTeachersTable();
                    updateDashboardStats();
                    document.getElementById('teacher-form').reset();
                    document.getElementById('teacher-form').onsubmit = addTeacherHandler;
                    hideModal(document.getElementById('teacher-modal'));
                    showToast('✅ Teacher updated successfully!');
                });
            };
        }
    });
};

const deleteTeacherHandler = (teacherId) => {
    if (confirm('Are you sure you want to delete this teacher?')) {
        window.DataManager.deleteTeacher(teacherId).then(() => {
            renderTeachersTable();
            updateDashboardStats();
            showToast('✅ Teacher deleted successfully!');
        });
    }
};

const renderTeachersTable = () => {
    getAllData().then(data => {
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
                    <button class="action-btn action-delete" onclick="deleteTeacherHandler(${teacher.id})">Delete</button>
                </td>
            </tr>
        `).join('');
    });
};

const updateCourseTeacherCount = (courseCode) => {
    getAllData().then(data => {
        const course = data.courses.find(c => c.code === courseCode);
        if (course) {
            const teacherCount = data.teachers.filter(t => t.course === courseCode).length;
            updateCourse(course.id, { teachers: teacherCount });
            renderCoursesTable();
        }
    });
};

// ==================== ADMIN SECTION ====================

const renderAllUsersTable = () => {
    getAllData().then(data => {
        const tableBody = document.getElementById('all-users-table');

        if (!tableBody) return;

        const allUsers = [
            ...data.students.map(s => ({
                id: s.rollNo,
                name: s.name,
                type: 'Student',
                course: s.course,
                batch: s.batch,
                year: s.year
            })),
            ...data.teachers.map(t => ({
                id: t.teacherId,
                name: t.name,
                type: 'Teacher',
                course: t.course,
                batch: t.batch,
                year: t.year
            }))
        ];

        if (allUsers.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No users available</td></tr>';
            return;
        }

        tableBody.innerHTML = allUsers.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.type}</td>
                <td>${user.course}</td>
                <td>${user.batch}</td>
                <td>${user.year}</td>
                <td>
                    <button class="action-btn action-delete" onclick="alert('Delete user: ${user.id}')">Delete</button>
                </td>
            </tr>
        `).join('');
    });
};

const initExportData = () => {
    const exportBtn = document.getElementById('export-data');
    if (exportBtn) {
        exportBtn.onclick = () => {
            exportAllData();
            showToast('📥 Data exported successfully!');
        };
    }
};

// Export global handlers used by inline HTML event attributes
window.checkPreviousAttendance = checkPreviousAttendance;
window.editPreviousAttendance = editPreviousAttendance;
window.updateAttendanceBatches = updateAttendanceBatches;
window.updateAttendanceStudents = updateAttendanceStudents;
window.toggleAllStudents = toggleAllStudents;
window.markAllPresent = markAllPresent;
window.saveAllAttendance = saveAllAttendance;
window.saveEditedAttendance = saveEditedAttendance;
window.setStudentStatus = setStudentStatus;
window.editCourse = editCourse;
window.deleteCourseHandler = deleteCourseHandler;
window.editStudent = editStudent;
window.deleteStudentHandler = deleteStudentHandler;
window.editTeacher = editTeacher;
window.deleteTeacherHandler = deleteTeacherHandler;

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    
    // Check if user is logged in
    const user = getCurrentUser();
    if (user.role === 'guest') {
        window.location.href = 'login.html';
        return;
    }

    // Wait for data.js to initialize
    setTimeout(() => {
        // Initialize all managers
        initAttendanceFilters();
        initCourseManager();
        initStudentManager();
        initTeacherManager();
        initExportData();
        
        // Initial render
        updateDashboardStats();
        renderCoursesTable();
        renderStudentsTable();
        renderTeachersTable();
        renderAllUsersTable();
        initMarkAttendance();
        
        console.log('All managers initialized');
    }, 100);
});