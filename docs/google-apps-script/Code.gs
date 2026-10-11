const SPREADSHEET_ID = '1OS9RSL371Ev8A21hQ_FGtb5iKHwrG1lv8yhe-3HcEIM';
const RESUME_FOLDER_ID = '1FWjBmPEvIZ5mghVS4m95RIlsKOYcmW9B';
const SHEET_NAME = 'Enquiries';
const MAX_RESUME_BYTES = 3 * 1024 * 1024;

const RESUME_TYPES = {
  'application/pdf': { extension: 'pdf', signature: [0x25, 0x50, 0x44, 0x46, 0x2d] },
  'application/msword': { extension: 'doc', signature: [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1] },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    extension: 'docx',
    signature: [0x50, 0x4b, 0x03, 0x04]
  }
};

const HEADERS = [
  'Submitted At',
  'Enquiry ID',
  'Full Name',
  'Email',
  'WhatsApp',
  'Location',
  'Qualification',
  'Experience',
  'Graduation Year',
  'Preferred Role or Course',
  'Consent',
  'Status',
  'Source',
  'Resume URL'
];

function doGet() {
  return jsonResponse({
    success: true,
    message: 'Peak Axis enquiry service is active.'
  });
}

/**
 * Run this once from the Apps Script editor after adding DriveApp to the
 * project. It forces Google to display the Spreadsheet and Drive permission
 * prompt before the public web app receives a submission.
 */
function authorizeServices() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const folder = DriveApp.getFolderById(RESUME_FOLDER_ID);

  // Creating and immediately trashing a small test file verifies the full
  // Drive scope. Read-only permission is not enough for resume uploads.
  const permissionTestFile = folder.createFile(
    Utilities.newBlob(
      'Peak Axis Drive authorization check.',
      'text/plain',
      '.peak-axis-authorization-check.txt'
    )
  );
  permissionTestFile.setTrashed(true);

  console.log('Authorized spreadsheet: ' + spreadsheet.getName());
  console.log('Authorized resume folder: ' + folder.getName());
  console.log('Drive write permission: granted');

  return 'Authorization successful. You can now deploy a new web-app version.';
}

function doPost(event) {
  let resumeFile = null;
  let lock = null;

  try {
    const params = event && event.parameter ? event.parameter : {};

    // A filled honeypot is treated as a successful no-op to discourage bots.
    if (cleanText(params.website, 200)) {
      return jsonResponse({ success: true, message: 'Enquiry received.' });
    }

    const fullName = requiredText(params.fullName, 'Full name', 100);
    const email = requiredText(params.email, 'Email address', 254);
    const phone = requiredText(params.phone, 'WhatsApp number', 20);
    const location = requiredText(params.location, 'Current location', 100);
    const qualification = requiredText(params.qualification, 'Qualification', 150);
    const experience = requiredText(params.experience, 'Experience level', 50);
    const graduation = cleanText(params.graduation, 4);
    const role = requiredText(params.role, 'Preferred job role or course', 150);
    const source = cleanText(params.source, 500);

    if (!params.consent) throw new Error('Consent is required.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Please enter a valid email address.');

    const originalResumeName = requiredText(params.resumeName, 'Resume name', 255);
    const resumeMimeType = requiredText(params.resumeMimeType, 'Resume type', 150).toLowerCase();
    const resumeBase64 = requiredText(params.resumeBase64, 'Resume file', 5 * 1024 * 1024);
    const resumeType = RESUME_TYPES[resumeMimeType];

    if (!resumeType) throw new Error('Resume must be a PDF, DOC or DOCX file.');

    const originalExtension = originalResumeName.split('.').pop().toLowerCase();
    if (originalExtension !== resumeType.extension) {
      throw new Error('The resume file extension does not match its file type.');
    }

    let resumeBytes;
    try {
      resumeBytes = Utilities.base64Decode(resumeBase64);
    } catch (error) {
      throw new Error('The resume could not be decoded. Please select the file again.');
    }

    if (!resumeBytes.length) throw new Error('The selected resume is empty.');
    if (resumeBytes.length > MAX_RESUME_BYTES) throw new Error('Resume must not be larger than 3 MB.');
    if (!hasSignature(resumeBytes, resumeType.signature)) {
      throw new Error('The uploaded resume does not appear to be a valid ' + resumeType.extension.toUpperCase() + ' file.');
    }

    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.getSheets()[0];
    if (!sheet) throw new Error('No worksheet was found in the enquiry spreadsheet.');

    const folder = DriveApp.getFolderById(RESUME_FOLDER_ID);
    const enquiryId = 'PA-' + Utilities.getUuid().slice(0, 8).toUpperCase();
    const savedResumeName = enquiryId + '_' + safeFileName(fullName) + '.' + resumeType.extension;

    lock = LockService.getScriptLock();
    lock.waitLock(10000);

    const blob = Utilities.newBlob(resumeBytes, resumeMimeType, savedResumeName);
    resumeFile = folder.createFile(blob);

    ensureHeaders(sheet);
    sheet.appendRow([
      new Date(),
      enquiryId,
      safeCell(fullName),
      safeCell(email),
      safeCell(phone),
      safeCell(location),
      safeCell(qualification),
      safeCell(experience),
      safeCell(graduation),
      safeCell(role),
      'Yes',
      'New',
      safeCell(source),
      resumeFile.getUrl()
    ]);

    return jsonResponse({
      success: true,
      message: 'Your enquiry and resume were saved successfully.',
      enquiryId: enquiryId
    });
  } catch (error) {
    // Do not leave an orphaned Drive file if writing the Sheet row fails.
    if (resumeFile) {
      try {
        resumeFile.setTrashed(true);
      } catch (cleanupError) {
        console.error(cleanupError);
      }
    }

    console.error(error);
    return jsonResponse({
      success: false,
      message: error && error.message ? error.message : 'Unable to save the enquiry.'
    });
  } finally {
    if (lock && lock.hasLock()) lock.releaseLock();
  }
}

function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
    return;
  }

  // Existing enquiry sheets have 13 columns; add the resume link as column 14.
  if (!sheet.getRange(1, HEADERS.length).getValue()) {
    sheet.getRange(1, HEADERS.length).setValue(HEADERS[HEADERS.length - 1]);
  }
}

function hasSignature(bytes, signature) {
  if (bytes.length < signature.length) return false;
  return signature.every(function(expected, index) {
    return (bytes[index] & 0xff) === expected;
  });
}

function requiredText(value, label, maximumLength) {
  const text = cleanText(value, maximumLength);
  if (!text) throw new Error(label + ' is required.');
  return text;
}

function cleanText(value, maximumLength) {
  return String(value || '').trim().slice(0, maximumLength);
}

function safeCell(value) {
  const text = String(value || '');
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function safeFileName(value) {
  const result = String(value || 'candidate')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return result || 'candidate';
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
