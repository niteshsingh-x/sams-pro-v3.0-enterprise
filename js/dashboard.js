import { DataManager, DATA_KEYS } from './data.js';

class Dashboard {
    constructor() {
        this.init();
    }

    init() {
        this.updateStats();
        this.updateCharts();
        this.updateTodayAttendance();
    }

    updateStats() {
        const data = DataManager.getAllData();
        document.getElementById('total-courses').textContent = data.courses.length;
        document.getElementById('total-students').textContent = data.students.length;
        document.getElementById('total-teachers').textContent = data.teachers.length;
    }

    updateCharts() {
        const data = DataManager.getAllData();
        
        // Students per Course
        const studentsPerCourse = this.groupByCourse(data.students);
        document.getElementById('students-per-course').innerHTML = 
            this.renderStudentsPerCourse(studentsPerCourse);

        // Batch Performance (mock data for demo)
        document.getElementById('batch-performance').innerHTML = 
            '<div style="padding: 2rem; text-align: center; color: #666;">📊 Batch-wise performance charts coming soon<br><small>Based on attendance & grades</small></div>';

        // Attendance by Course & Batch
        this.updateAttendanceTable(data);
    }

    groupByCourse(students) {
        return students.reduce((acc, student) => {
            acc[student.course] = (acc[student.course] || 0) + 1;
            return acc;
        }, {});
    }

    renderStudentsPerCourse(data) {
        if (Object.keys(data).length === 0) {
            return '<div style="padding: 2rem; text-align: center; color: #666;">No students enrolled yet</div>';
        }
        return Object.entries(data).map(([course, count]) => 
            `<div style="margin: 1rem 0; padding: 1rem; background: #f7fafc; border-radius: 8px;">
                <strong>${course}</strong>: ${count} students
            </div>`
        ).join('');
    }

    updateAttendanceTable(data) {
        const tableBody = document.getElementById('attendance-table');
        if (data.students.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No attendance data</td></tr>';
            return;
        }

        // Mock attendance data for demo
        const mockAttendance = this.generateMockAttendance(data.students);
        tableBody.innerHTML = mockAttendance.map(row => 
            `<tr>
                <td>${row.course}</td>
                <td>${row.batch}</td>
                <td>${row.total}</td>
                <td>${row.present}</td>
                <td>${Math.round((row.present/row.total)*100)}%</td>
            </tr>`
        ).join('');
    }

    generateMockAttendance(students) {
        const grouped = students.reduce((acc, student) => {
            const key = `${student.course}-${student.batch}`;
            if (!acc[key]) acc[key] = { course: student.course, batch: student.batch, total: 0, present: 0 };
            acc[key].total++;
            acc[key].present += Math.random() > 0.2 ? 1 : 0; // 80% attendance
            return acc;
        }, {});
        return Object.values(grouped);
    }

    updateTodayAttendance() {
        const data = DataManager.getAllData();
        const tableBody = document.getElementById('today-attendance-table');
        
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
                    <td><button class="action-btn action-edit">Save</button></td>
                </tr>`;
        }).join('');
    }
}

export default Dashboard;
