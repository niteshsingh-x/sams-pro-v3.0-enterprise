// data.js
// Handles all data management for SAMS Pro v3.0

const SHEET_CONFIG = {
    enabled: true,
    webAppUrl: 'https://script.google.com/macros/s/AKfycbyQ6fR8c6WFr-gIfZ_nEQN-2kQcChjsDQpW0akhfr21tE2J2lEp8mc_Ue3AviUSbnpz/exec'
};

const DB = {
    courses: [],
    students: [],
    teachers: [],
    attendance: []
};

const useGoogleSheets = () => SHEET_CONFIG.enabled && SHEET_CONFIG.webAppUrl;

async function loadDataFromSheet() {
    if (!useGoogleSheets()) return null;

    try {
        const url = `${SHEET_CONFIG.webAppUrl}?action=load`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Google Sheet load returned ' + response.status);
        const payload = await response.json();
        return payload;
    } catch (error) {
        console.warn('Failed to load data from Google Sheets:', error);
        return null;
    }
}

async function saveDataToSheet() {
    if (!useGoogleSheets()) return;

    try {
        await fetch(SHEET_CONFIG.webAppUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ action: 'save', data: DB })
        });
    } catch (error) {
        console.warn('Failed to save data to Google Sheets:', error);
    }
}

// Initialize data from localStorage or Google Sheets
function initializeData() {
    const savedData = localStorage.getItem('sams');
    if (savedData) {
        const parsed = JSON.parse(savedData);
        DB.courses = parsed.courses || [];
        DB.students = parsed.students || [];
        DB.teachers = parsed.teachers || [];
        DB.attendance = parsed.attendance || [];
    }

    if (useGoogleSheets()) {
        loadDataFromSheet().then(sheetData => {
            if (sheetData) {
                DB.courses = sheetData.courses || [];
                DB.students = sheetData.students || [];
                DB.teachers = sheetData.teachers || [];
                DB.attendance = sheetData.attendance || [];
                saveData();
            }
        });
    }
}

// Save data to localStorage and Google Sheets
function saveData() {
    localStorage.setItem('sams', JSON.stringify(DB));
    saveDataToSheet();
}

// ==================== COURSE FUNCTIONS ====================

function addCourse(course) {
    DB.courses.push(course);
    saveData();
    return Promise.resolve();
}

function updateCourse(courseId, updatedCourse) {
    const index = DB.courses.findIndex(c => c.id === courseId);
    if (index !== -1) {
        DB.courses[index] = { ...DB.courses[index], ...updatedCourse };
        saveData();
    }
    return Promise.resolve();
}

function deleteCourse(courseId) {
    DB.courses = DB.courses.filter(c => c.id !== courseId);
    saveData();
    return Promise.resolve();
}

function getCourses() {
    return Promise.resolve(DB.courses);
}

// ==================== STUDENT FUNCTIONS ====================

function addStudent(student) {
    DB.students.push(student);
    saveData();
    return Promise.resolve();
}

function updateStudent(studentId, updatedStudent) {
    const index = DB.students.findIndex(s => s.id === studentId);
    if (index !== -1) {
        DB.students[index] = { ...DB.students[index], ...updatedStudent };
        saveData();
    }
    return Promise.resolve();
}

function deleteStudent(studentId) {
    DB.students = DB.students.filter(s => s.id !== studentId);
    saveData();
    return Promise.resolve();
}

function getStudents() {
    return Promise.resolve(DB.students);
}

// ==================== TEACHER FUNCTIONS ====================

function addTeacher(teacher) {
    DB.teachers.push(teacher);
    saveData();
    return Promise.resolve();
}

function updateTeacher(teacherId, updatedTeacher) {
    const index = DB.teachers.findIndex(t => t.id === teacherId);
    if (index !== -1) {
        DB.teachers[index] = { ...DB.teachers[index], ...updatedTeacher };
        saveData();
    }
    return Promise.resolve();
}

function deleteTeacher(teacherId) {
    DB.teachers = DB.teachers.filter(t => t.id !== teacherId);
    saveData();
    return Promise.resolve();
}

function getTeachers() {
    return Promise.resolve(DB.teachers);
}

// ==================== ATTENDANCE FUNCTIONS ====================

function addAttendance(attendance) {
    DB.attendance.push(attendance);
    saveData();
    return Promise.resolve();
}

function updateAttendanceRecord(date, rollNo, status, remarks) {
    const index = DB.attendance.findIndex(a => a.date === date && a.rollNo === rollNo);
    if (index !== -1) {
        DB.attendance[index] = { date, rollNo, status, remarks };
    } else {
        DB.attendance.push({ date, rollNo, status, remarks });
    }
    saveData();
    return Promise.resolve();
}

function getAttendance() {
    return Promise.resolve(DB.attendance);
}

// ==================== GLOBAL DATA FUNCTIONS ====================

function getAllData() {
    return Promise.resolve({
        courses: DB.courses,
        students: DB.students,
        teachers: DB.teachers,
        attendance: DB.attendance
    });
}

function exportAllData() {
    const allData = {
        courses: DB.courses,
        students: DB.students,
        teachers: DB.teachers,
        attendance: DB.attendance,
        exportDate: new Date().toISOString(),
        version: 'SAMS Pro v3.0'
    };
    
    const dataStr = JSON.stringify(allData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sams-pro-backup-${new Date().toISOString().split('T')}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

// Initialize data on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeData();
    
    // Make functions available globally
    window.DataManager = {
        addCourse,
        updateCourse,
        deleteCourse,
        getCourses,
        addStudent,
        updateStudent,
        deleteStudent,
        getStudents,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        getTeachers,
        addAttendance,
        updateAttendanceRecord,
        getAttendance,
        getAllData,
        exportAllData
    };
});