// SAMS Pro v3.0 - Data Management & LocalStorage
const DATA_KEYS = {
    COURSES: 'sams_courses',
    STUDENTS: 'sams_students',
    TEACHERS: 'sams_teachers',
    ATTENDANCE: 'sams_attendance'
};

class DataManager {
    static save(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    static load(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    }

    static getAllData() {
        return {
            courses: this.load(DATA_KEYS.COURSES),
            students: this.load(DATA_KEYS.STUDENTS),
            teachers: this.load(DATA_KEYS.TEACHERS),
            attendance: this.load(DATA_KEYS.ATTENDANCE)
        };
    }

    static exportData() {
        const allData = this.getAllData();
        const exportData = {
            ...allData,
            exportDate: new Date().toISOString(),
            version: 'SAMS Pro v3.0'
        };
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `sams-pro-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }
}

export { DataManager, DATA_KEYS };
