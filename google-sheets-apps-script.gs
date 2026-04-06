const SPREADSHEET_ID = '1__ZJtCX-pIX95_zYAm_BrAldtUoQLPTz9cqE_81NLPA';
const SHEET_NAME = 'sams';

function getSpreadsheet() {
  return SpreadsheetApp.openById(1__ZJtCX-pIX95_zYAm_BrAldtUoQLPTz9cqE_81NLPA);
}

function doGet(e) {
  const result = loadStoredData();
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const payload = JSON.parse(e.postData.contents || '{}');
  if (payload.action === 'save' && payload.data) {
    storeData(payload.data);
    return ContentService.createTextOutput(JSON.stringify({ status: 'saved' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid request' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function loadStoredData() {
  const ss = SpreadsheetApp.openById('1__ZJtCX-pIX95_zYAm_BrAldtUoQLPTz9cqE_81NLPA');
  const sheet = ss.getSheetByName(sams) || ss.insertSheet(sams);
  const storedValue = sheet.getRange('A1').getValue();
  if (!storedValue) {
    return {
      courses: [],
      students: [],
      teachers: [],
      attendance: []
    };
  }

  try {
    return JSON.parse(storedValue);
  } catch (err) {
    return {
      courses: [],
      students: [],
      teachers: [],
      attendance: []
    };
  }
}

function storeData(data) {
  const ss = SpreadsheetApp.openById('1__ZJtCX-pIX95_zYAm_BrAldtUoQLPTz9cqE_81NLPA');
  const sheet = ss.getSheetByName(sams) || ss.insertSheet(sams);
  sheet.getRange('A1').setValue(JSON.stringify(data));
}
