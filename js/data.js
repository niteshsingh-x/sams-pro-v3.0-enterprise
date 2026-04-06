// data.js
// Handles all Google Sheets integration for SAMS Pro v3.0

// Google Apps Script URL (replace with your actual URL)
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/library/d/150EUCqI610PS0zcjO5T12cLz0J0-kwEWxQ6_h11_DyfZ0ZD_Bmau-P6b/5';

// Save data to Google Sheets
function saveToSheets(sheetName, data) {
    const url = GOOGLE_APPS_SCRIPT_URL;
    const params = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            sheet: sheetName,
            data: data
        })
    };
    
    return fetch(url, params)
        .then(response => response.text())
        .catch(error => {
            console.error('Error saving to Google Sheets:', error);
            return 'ERROR';
        });
}

// Load data from Google Sheets
function loadFromSheets(sheetName) {
    const url = `${GOOGLE_APPS_SCRIPT_URL}?sheet=${sheetName}`;
    
    return fetch(url)
        .then(response => response.json())
        .then(data => {
            if (sheetName === 'Attendance') {
                // Convert 2D array to objects
                return data.map(row => ({
                    date: row,
                    rollNo: row,
                    status: row,
                    remarks: row
                }));
            }
            return data.slice(1).map(row => ({
                id: row,
                code: row,
                name: row,
                years: row,
                students: row,
                teachers: row
            }));
        })
        .catch(error => {
            console.error('Error loading from Google Sheets:', error);
            return [];
        });
}

// Update a specific attendance record
function updateAttendanceRecord(date, rollNo, status, remarks) {
    const url = GOOGLE_APPS_SCRIPT_URL;
    const params = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            sheet: 'Attendance',
            data: [date, rollNo, status, remarks]
        })
    };
    
    return fetch(url, params)
        .then(response => response.text())
        .catch(error => {
            console.error('Error updating attendance:', error);
            return 'ERROR';
        });
}

// Export all data
function exportAllData() {
    const allData = {
        courses: loadFromSheets('Courses'),
        students: loadFromSheets('Students'),
        teachers: loadFromSheets('Teachers'),
        attendance: loadFromSheets('Attendance'),
        exportDate: new Date().toISOString(),
        version: 'SAMS Pro v3.0'
    };
    
    const dataStr = JSON.stringify(allData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sams-pro-backup-${new Date().toISOString().split('T')}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

// Add Course
function addCourse(course) {
    return saveToSheets('Courses', [
        course.id,
        course.code,
        course.name,
        course.years,
        course.students,
        course.teachers
    ]);
}

// Add Student
function addStudent(student) {
    return saveToSheets('Students', [
        student.id,
        student.rollNo,
        student.name,
        student.course,
        student.year,
        student.batch
    ]);
}

// Add Teacher
function addTeacher(teacher) {
    return saveToSheets('Teachers', [
        teacher.id,
        teacher.teacherId,
        teacher.name,
        teacher.course,
        teacher.batch,
        teacher.year
    ]);
}

// Add Attendance
function addAttendance(attendance) {
    return saveToSheets('Attendance', [
        attendance.date,
        attendance.rollNo,
        attendance.status,
        attendance.remarks
    ]);
}

// Get All Data
async function getAllData() {
    const [courses, students, teachers, attendance] = await Promise.all([
        loadFromSheets('Courses'),
        loadFromSheets('Students'),
        loadFromSheets('Teachers'),
        loadFromSheets('Attendance')
    ]);
    
    return {
        courses,
        students,
        teachers,
        attendance
    };
}

// Export Data
function exportData() {
    exportAllData();
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Add Google Sheets integration to global scope
    window.GoogleSheets = {
        addCourse,
        addStudent,
        addTeacher,
        addAttendance,
        updateAttendanceRecord,
        getAllData,
        exportData
    };
});