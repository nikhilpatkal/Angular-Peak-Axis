# Google Sheets and Google Drive enquiry integration

This document explains how the Peak Axis website saves candidate enquiry data
in Google Sheets and uploads each candidate's resume to a private Google Drive
folder.

## Current production resources

- Spreadsheet:
  `https://docs.google.com/spreadsheets/d/1OS9RSL371Ev8A21hQ_FGtb5iKHwrG1lv8yhe-3HcEIM/edit`
- Spreadsheet ID: `1OS9RSL371Ev8A21hQ_FGtb5iKHwrG1lv8yhe-3HcEIM`
- Resume folder:
  `https://drive.google.com/drive/folders/1FWjBmPEvIZ5mghVS4m95RIlsKOYcmW9B`
- Resume folder ID: `1FWjBmPEvIZ5mghVS4m95RIlsKOYcmW9B`
- Web-app endpoint:
  `https://script.google.com/macros/s/AKfycbzr3ZBMD5f7w9ipygER9VeTzyT46PKD3_Ctm3oo1K4QqV5LdTDJWYcS54HtIrTUAeY/exec`

Keep the spreadsheet and Drive folder owned by, or shared as **Editor** with,
the Google account that deploys the Apps Script.

## How it works

```text
Candidate completes website form
              |
              v
Browser validates details and resume (PDF/DOC/DOCX, maximum 3 MB)
              |
              v
Browser sends form fields and base64-encoded resume to Apps Script
              |
              v
Apps Script validates the request and file again
              |
              +----> Creates a private resume file in Google Drive
              |
              +----> Adds the candidate data and resume URL to Google Sheets
```

The browser only receives a success response after both the Drive file and the
Sheet row are saved. If the Sheet write fails after creating the file, the
script moves that file to Trash to avoid leaving an orphaned resume.

## Files in this project

- [`Code.gs`](./Code.gs): Google Apps Script web-app code.
- [`appsscript.json`](./appsscript.json): Apps Script runtime and OAuth scopes.
- [`../../site.config.json`](../../site.config.json): Website endpoint setting.
- [`../../src/app/components/registration.component.ts`](../../src/app/components/registration.component.ts):
  browser validation, encoding and submission.
- [`../../src/app/components/registration.component.html`](../../src/app/components/registration.component.html):
  candidate form and resume input.

## 1. Prepare Google Sheets

1. Create a Google Sheet, or use the existing enquiry Sheet.
2. Give the Apps Script deployment account Editor access.
3. The script uses a worksheet named `Enquiries` when available. If that tab
   does not exist, it uses the first worksheet.
4. An empty worksheet receives the following header row automatically:

| Column | Header |
| --- | --- |
| A | Submitted At |
| B | Enquiry ID |
| C | Full Name |
| D | Email |
| E | WhatsApp |
| F | Location |
| G | Qualification |
| H | Experience |
| I | Graduation Year |
| J | Preferred Role or Course |
| K | Consent |
| L | Status |
| M | Source |
| N | Resume URL |

Existing 13-column enquiry Sheets automatically receive `Resume URL` in
column N.

To connect a different spreadsheet, replace `SPREADSHEET_ID` at the top of
`Code.gs`. The spreadsheet ID is the value between `/d/` and `/edit` in its
URL.

## 2. Prepare the Google Drive folder

1. Create a folder in Google Drive for candidate resumes.
2. Keep the folder **Restricted**. It does not need to be public.
3. Give the Apps Script deployment account Editor access to the folder.
4. Copy the folder ID from the URL. It is the value after `/folders/`.
5. Set that value as `RESUME_FOLDER_ID` in `Code.gs`.

Uploaded files use this naming pattern:

```text
PA-XXXXXXXX_Candidate-Name.pdf
```

The corresponding private Drive URL is placed in the candidate's Sheet row.
Only people with permission to the Drive file or folder can open it.

## 3. Create or update the Apps Script project

1. Open the Google Sheet.
2. Select **Extensions > Apps Script**.
3. Replace the content of `Code.gs` with this project's [`Code.gs`](./Code.gs).
4. Confirm the spreadsheet ID, Drive folder ID and worksheet name at the top
   of the file.
5. Save the project.

The script provides:

- `doGet()`: health check for the published endpoint.
- `doPost(event)`: validates and saves an enquiry.
- `authorizeServices()`: one-time Sheet and Drive permission test.

## 4. Configure the Apps Script manifest

1. In Apps Script, open **Project Settings**.
2. Enable **Show "appsscript.json" manifest file in editor**.
3. Open `appsscript.json` and use the configuration from this project's
   [`appsscript.json`](./appsscript.json).

The important OAuth scopes are:

```json
"oauthScopes": [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive"
]
```

`drive.readonly` is not sufficient. `DriveApp.Folder.createFile()` requires
the full Drive scope because the script creates resume files.

## 5. Authorize Google Sheets and Drive

Manifest configuration declares the permissions, but it does not grant them.
The deployment account must approve them once.

1. Save `Code.gs` and `appsscript.json`.
2. Select `authorizeServices` from the function selector in the Apps Script
   toolbar.
3. Click **Run**.
4. Select the same Google account that owns or can edit the Sheet and folder.
5. Approve the Google Sheets permission and the full Google Drive permission.
6. Confirm that the execution finishes successfully and logs:

```text
Drive write permission: granted
```

The authorization function creates a small test file in the resume folder and
immediately moves it to Trash. This verifies write access, not just read access.

If an old read-only grant prevents the new permission screen from appearing,
remove the Apps Script project's access from
[Google Account Connections](https://myaccount.google.com/connections), then
run `authorizeServices` again.

## 6. Deploy the Apps Script as a web app

1. Select **Deploy > New deployment**, or edit the existing active deployment.
2. Choose **Web app**.
3. Set **Execute as** to **Me** (the deployment account).
4. Set **Who has access** to **Anyone**.
5. Deploy and copy the URL ending in `/exec`.

For an existing deployment, select **New version** every time `Code.gs` or the
manifest changes. Saving code alone does not update the live `/exec` endpoint.

The deployment must execute as the owner. Do not use **User accessing the web
app**, because public candidates have not authorized access to your private
Sheet or Drive folder.

Open the `/exec` URL in a browser. A healthy deployment returns:

```json
{"success":true,"message":"Peak Axis enquiry service is active."}
```

## 7. Connect the website

Set `enquiryEndpoint` in the root `site.config.json` file to the deployed
`/exec` URL:

```json
{
  "enquiryEndpoint": "https://script.google.com/macros/s/DEPLOYMENT_ID/exec"
}
```

Build and deploy the Angular website after changing this URL:

```powershell
npm.cmd run build
```

The production website files are generated in `dist/peak-axis/browser/`.

## 8. Resume rules

The same rules are applied in both the website and Apps Script:

- Allowed extensions: `.pdf`, `.doc`, `.docx`.
- Maximum decoded file size: exactly 3 MB (`3 * 1024 * 1024` bytes).
- Files larger than 3 MB are rejected.
- The MIME type must match an allowed format.
- The file signature must match its claimed type.
- A resume is required for every new enquiry.

To change the size limit, update both locations:

```typescript
// registration.component.ts
private readonly maximumResumeSize = 3 * 1024 * 1024;
```

```javascript
// Code.gs
const MAX_RESUME_BYTES = 3 * 1024 * 1024;
```

Deploy both the website and a new Apps Script version after changing the limit.

## 9. End-to-end test

1. Open the deployed website.
2. Complete every required candidate field.
3. Choose a valid PDF, DOC or DOCX resume no larger than 3 MB.
4. Submit the enquiry.
5. Confirm the website displays **Enquiry submitted successfully**.
6. Confirm a new row appears in Google Sheets.
7. Confirm the resume appears in the configured Drive folder.
8. Open the link in column N and confirm it opens the correct resume for an
   authorized staff member.
9. Test a file larger than 3 MB and confirm the browser rejects it without
   adding a Sheet row or Drive file.

Automated website checks can be run with:

```powershell
npm.cmd run build
npx.cmd playwright test
```

## Troubleshooting

| Error or symptom | Cause | Resolution |
| --- | --- | --- |
| `Illegal spreadsheet id or key` | Placeholder or incorrect spreadsheet ID | Copy the ID between `/d/` and `/edit` into `SPREADSHEET_ID`. |
| `Script function not found: doGet` | The deployed script does not contain `doGet()` | Copy the complete `Code.gs`, save and deploy a new version. |
| `DriveApp.getFolderById` permission error | Drive permission was not granted, or the account cannot access the folder | Run `authorizeServices` and give the deployment account Editor access to the folder. |
| `DriveApp.Folder.createFile` permission error | Only `drive.readonly` was granted | Add the full Drive scope, revoke the old grant, run `authorizeServices`, and approve full Drive access. |
| Text fields save but no resume appears | An old deployment version is still live | Deploy a new version and verify the website uses its `/exec` URL. |
| `Resume must not be larger than 3 MB` | The decoded resume exceeds 3 MB | Upload a smaller resume. |
| `file extension does not match` | Extension and MIME type disagree | Export the document again as a real PDF, DOC or DOCX file. |
| `uploaded resume does not appear valid` | The file header does not match its claimed type | Open and re-export the original document in an allowed format. |
| Upload timeout | Slow connection or slow Apps Script execution | Retry on a stable connection; the website allows 45 seconds. |
| Manual authorization works but public submission fails | Deployment is running as the accessing user or an old version | Set **Execute as Me**, choose **New version**, and redeploy. |

## Security and operations

- Keep the resume folder restricted; do not enable "Anyone with the link."
- Limit access to the Sheet, Drive folder and Apps Script project to authorized
  recruitment staff.
- The full Drive scope is powerful. Only trusted administrators should own or
  edit this Apps Script project.
- Treat resumes and candidate details as personal data. Define a retention
  period and delete records that are no longer required.
- Do not place Google credentials, OAuth tokens or private keys in the Angular
  website. This implementation does not require any.
- Do not log `resumeBase64` or other full form payloads.
- Review Apps Script execution logs periodically for failures or unusual usage.
- The form has a honeypot field for basic bot filtering. For higher public
  traffic, add CAPTCHA and stronger abuse/rate-limit controls.

## Maintenance checklist

Whenever the integration changes:

1. Update `Code.gs` and, if needed, `appsscript.json`.
2. Run `authorizeServices` if a new Google service or scope was added.
3. Deploy a **New version** of the Apps Script web app.
4. Update `site.config.json` only if the `/exec` URL changed.
5. Build and publish the Angular site if frontend files changed.
6. Complete one valid end-to-end submission.
7. Confirm the Sheet row, Drive file and resume URL all match.
