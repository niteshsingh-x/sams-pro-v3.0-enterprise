// data.js
// Handles all data management for SAMS Pro v3.0 with Google Sheets

// Your Google Apps Script Web App URL with CORS support
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyQ6fR8c6WFr-gIfZ_nEQN-2kQcChjsDQpW0akhfr21tE2J2lEp8mc_Ue3AviUSbnpz/exec';

const DB = {
    courses: [],
    students: [],
    teachers: [],
    attendance: []
};

console.log('data.js loaded - Google Sheets URL:', GOOGLE_APPS_SCRIPT_URL);

// ==================== DATA LOADING ====================

async function loadDataFromGoogleSheets() {
    try {
        console.log('Loading data from Google Sheets...');
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            console.error('Error from Google Sheets:', data.error);
            return null;
        }
        
        console.log('✅ Data loaded from Google Sheets:', data);
        return data;
    } catch (error) {
        console.error('❌ Error loading from Google Sheets:', error);
        return null;
    }
}

async function saveDataToGoogleSheets() {
    try {
        console.log('💾 Saving data to Google Sheets...');
        
        const payload = {
            action: 'save',
            data: {
                courses: DB.courses,
                students: DB.students,
                teachers: DB.teachers,
                attendance: DB.attendance
            }
        };
        
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ Save result:', result);
        return result;
    } catch (error) {
        console.error('❌ Error saving to Google Sheets:', error);
        // Still save to localStorage as backup
        localStorage.setItem('sams_data', JSON.stringify({
            courses: DB.courses,
            students: DB.students,
            teachers: DB.teachers,
            attendance: DB.attendance
        }));
        console.log('📱 Data saved to localStorage as backup');
        return null;
    }
}

// Initialize data from localStorage and Google Sheets
async function initializeData() {
    // First, load from localStorage
    const savedData = localStorage.getItem('sams_data');
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            DB.courses = parsed.courses || [];
            DB.students = parsed.students || [];
            DB.teachers = parsed.teachers || [];
            DB.attendance = parsed.attendance || [];
            console.log('📱 Data loaded from localStorage');
        } catch (e) {
            console.error('Error parsing localStorage:', e);
        }
    }

    // Then, try to load from Google Sheets
    const sheetData = await loadDataFromGoogleSheets();
    if (sheetData) {
        DB.courses = sheetData.courses || [];
        DB.students = sheetData.students || [];
        DB.teachers = sheetData.teachers || [];
        DB.attendance = sheetData.attendance || [];
        console.log('☁️ Data synced from Google Sheets');
    }
}

// Save data to both localStorage and Google Sheets
function saveData() {
    // Save to localStorage first
    localStorage.setItem('sams_data', JSON.stringify({
        courses: DB.courses,
        students: DB.students,
        teachers: DB.teachers,
        attendance: DB.attendance
    }));
    console.log('📱 Data saved to localStorage');
    
    // Save to Google Sheets (async, don't wait)
    saveDataToGoogleSheets();
}

// ==================== COURSE FUNCTIONS ====================

function addCourse(course) {
    console.log('Adding course:', course);
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

// ==================== STUDENT FUNCTIONS ====================

function addStudent(student) {
    console.log('Adding student:', student);
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

// ==================== TEACHER FUNCTIONS ====================

function addTeacher(teacher) {
    console.log('Adding teacher:', teacher);
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

// ==================== ATTENDANCE FUNCTIONS ====================

function addAttendance(attendance) {
    console.log('Adding attendance:', attendance);
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

// Initialize data when script loads
console.log('🚀 Initializing data...');
initializeData().then(() => {
    console.log('✅ Data initialization complete');
});