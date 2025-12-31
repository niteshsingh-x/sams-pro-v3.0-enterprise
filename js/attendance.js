import { DataManager, DATA_KEYS } from './data.js';

class AttendanceManager {
    constructor() {
        this.initEventListeners();
    }

    initEventListeners() {
        document.getElementById('update-today-attendance')?.addEventListener('click', () => {
            this.saveTodayAttendance();
        });
    }

    saveTodayAttendance() {
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

        const existing = DataManager.load(DATA_KEYS.ATTENDANCE);
        const today = new Date().toISOString().split('T')[0];
        existing[today] = attendanceData;
        DataManager.save(DATA_KEYS.ATTENDANCE, existing);
        
        alert('✅ Today\'s attendance updated successfully!');
    }

    updateMarkAttendanceTable() {
        const data = DataManager.getAllData();
        const tableBody = document.getElementById('mark-attendance-table');
        
        if (data.students.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No students available</td></tr>';
            return;
        }

        tableBody.innerHTML = data.students.map(student => `
            <tr>
                <td>${student.rollNo}</td>
                <td>${student.name}</td>
                <td>
                    <select class="status-select">
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Late">Late</option>
                    </select>
                </td>
                <td><input type="text" class="remarks-input" placeholder="Remarks"></td>
                <td><button class="action-btn action-edit">Mark</button></td>
            </tr>
        `).join('');
    }
}

export default AttendanceManager;
