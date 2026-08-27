import { Student } from '../types';

export interface DriveSpreadsheetFile {
  id: string;
  name: string;
  modifiedTime?: string;
  webViewLink?: string;
}

export interface ParsedSheetStudent {
  studentName: string;
  birthDate: string;
  phoneNumber: string;
  additionalPhoneNumber?: string;
  collectionDate: string;
  department?: string;
  academicYear?: string;
  notes?: string;
}

const DEFAULT_HEADERS = [
  'Student ID',
  'Student Full Name',
  'Birth Date',
  'Primary Phone Number',
  'Additional Phone Number',
  'Collection Date',
  'Department',
  'Academic Year',
  'Administrative Notes',
  'Record Created At',
  'Last Updated At',
];

/**
 * List Google Spreadsheets from user's Google Drive
 */
export async function listUserSpreadsheets(accessToken: string): Promise<DriveSpreadsheetFile[]> {
  const query = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime,webViewLink)&orderBy=modifiedTime desc&pageSize=30`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to list Google Sheets (${res.status})`);
  }

  const data = await res.json();
  return (data.files || []).map((f: any) => ({
    id: f.id,
    name: f.name,
    modifiedTime: f.modifiedTime,
    webViewLink: f.webViewLink || `https://docs.google.com/spreadsheets/d/${f.id}/edit`,
  }));
}

/**
 * Create a new styled Google Spreadsheet for Student Records
 */
export async function createStudentSpreadsheet(
  accessToken: string,
  title: string = 'University Students Registry 2026',
  students: Student[] = []
): Promise<{ spreadsheetId: string; spreadsheetUrl: string; sheetName: string }> {
  const rows = [
    DEFAULT_HEADERS,
    ...students.map((s) => [
      s.id,
      s.studentName,
      s.birthDate,
      s.phoneNumber,
      s.additionalPhoneNumber || '',
      s.collectionDate,
      s.department || '',
      s.academicYear || '',
      s.notes || '',
      s.createdAt,
      s.updatedAt,
    ]),
  ];

  const createBody = {
    properties: {
      title,
    },
    sheets: [
      {
        properties: {
          title: 'Student Registry',
          gridProperties: {
            frozenRowCount: 1,
          },
        },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: rows.map((row, rowIndex) => ({
              values: row.map((cell) => ({
                userEnteredValue: { stringValue: String(cell) },
                userEnteredFormat: rowIndex === 0
                  ? {
                      backgroundColor: { red: 0.08, green: 0.12, blue: 0.18 }, // Dark slate
                      textFormat: {
                        foregroundColor: { red: 0.95, green: 0.8, blue: 0.4 }, // Amber
                        bold: true,
                        fontSize: 10,
                      },
                      horizontalAlignment: 'LEFT',
                    }
                  : {
                      textFormat: {
                        fontSize: 10,
                      },
                    },
              })),
            })),
          },
        ],
      },
    ],
  };

  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(createBody),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to create Google Sheet (${res.status})`);
  }

  const created = await res.json();
  return {
    spreadsheetId: created.spreadsheetId,
    spreadsheetUrl: created.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${created.spreadsheetId}/edit`,
    sheetName: 'Student Registry',
  };
}

/**
 * Get sheet tab names for a spreadsheet
 */
export async function getSpreadsheetDetails(accessToken: string, spreadsheetId: string) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}?fields=properties.title,sheets.properties(sheetId,title,gridProperties)`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to fetch spreadsheet details (${res.status})`);
  }

  const data = await res.json();
  const sheets: string[] = (data.sheets || []).map((s: any) => s.properties.title);
  return {
    title: data.properties?.title || 'Google Sheet',
    sheets,
    defaultSheet: sheets[0] || 'Sheet1',
  };
}

/**
 * Append a single student record to a Google Sheet
 */
export async function appendStudentToSpreadsheet(
  accessToken: string,
  spreadsheetId: string,
  student: Student,
  sheetName: string = 'Sheet1'
): Promise<boolean> {
  const row = [
    student.id,
    student.studentName,
    student.birthDate,
    student.phoneNumber,
    student.additionalPhoneNumber || '',
    student.collectionDate,
    student.department || '',
    student.academicYear || '',
    student.notes || '',
    student.createdAt,
    student.updatedAt,
  ];

  const range = `${encodeURIComponent(sheetName)}!A:K`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [row],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to append student to sheet (${res.status})`);
  }

  return true;
}

/**
 * Sync all student records to an existing Google Spreadsheet (Overwrite or Append)
 */
export async function syncAllStudentsToSpreadsheet(
  accessToken: string,
  spreadsheetId: string,
  students: Student[],
  mode: 'overwrite' | 'append' = 'overwrite',
  sheetName: string = 'Student Registry'
): Promise<{ rowCount: number }> {
  if (mode === 'overwrite') {
    // Clear existing values first
    const clearUrl = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(sheetName)}!A1:Z5000:clear`;
    await fetch(clearUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }).catch(() => {});

    // Write header + all rows
    const rows = [
      DEFAULT_HEADERS,
      ...students.map((s) => [
        s.id,
        s.studentName,
        s.birthDate,
        s.phoneNumber,
        s.additionalPhoneNumber || '',
        s.collectionDate,
        s.department || '',
        s.academicYear || '',
        s.notes || '',
        s.createdAt,
        s.updatedAt,
      ]),
    ];

    const writeUrl = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(sheetName)}!A1?valueInputOption=USER_ENTERED`;
    const res = await fetch(writeUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: rows }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to write students to sheet (${res.status})`);
    }

    return { rowCount: students.length };
  } else {
    // Append rows
    const rows = students.map((s) => [
      s.id,
      s.studentName,
      s.birthDate,
      s.phoneNumber,
      s.additionalPhoneNumber || '',
      s.collectionDate,
      s.department || '',
      s.academicYear || '',
      s.notes || '',
      s.createdAt,
      s.updatedAt,
    ]);

    const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(sheetName)}!A:K:append?valueInputOption=USER_ENTERED`;
    const res = await fetch(appendUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: rows }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to append students to sheet (${res.status})`);
    }

    return { rowCount: students.length };
  }
}

/**
 * Read and parse student records from a Google Sheet
 */
export async function readStudentsFromSpreadsheet(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string = 'Student Registry'
): Promise<ParsedSheetStudent[]> {
  const range = `${encodeURIComponent(sheetName)}!A1:Z500`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${range}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to read Google Sheet (${res.status})`);
  }

  const data = await res.json();
  const rawRows: string[][] = data.values || [];

  if (rawRows.length <= 1) {
    return [];
  }

  const headerRow = rawRows[0].map((h) => h.toLowerCase().trim());
  const nameIdx = headerRow.findIndex((h) => h.includes('name') || h.includes('student'));
  const birthIdx = headerRow.findIndex((h) => h.includes('birth') || h.includes('dob'));
  const phoneIdx = headerRow.findIndex((h) => h.includes('phone') || h.includes('mobile') || h.includes('contact'));
  const addPhoneIdx = headerRow.findIndex((h) => h.includes('additional') || h.includes('secondary') || h.includes('emergency'));
  const collDateIdx = headerRow.findIndex((h) => h.includes('collection') || h.includes('intake') || h.includes('date'));
  const deptIdx = headerRow.findIndex((h) => h.includes('department') || h.includes('faculty') || h.includes('major'));
  const yearIdx = headerRow.findIndex((h) => h.includes('year') || h.includes('cohort') || h.includes('academic'));
  const notesIdx = headerRow.findIndex((h) => h.includes('note') || h.includes('remark') || h.includes('comment'));

  const parsedStudents: ParsedSheetStudent[] = [];
  const todayStr = new Date().toISOString().split('T')[0];

  for (let i = 1; i < rawRows.length; i++) {
    const row = rawRows[i];
    if (!row || row.length === 0) continue;

    // Resolve name
    const studentName = nameIdx !== -1 && row[nameIdx] ? row[nameIdx].trim() : (row[1] || row[0] || '').trim();
    if (!studentName) continue; // Skip empty rows

    // Resolve birth date
    let birthDate = birthIdx !== -1 && row[birthIdx] ? row[birthIdx].trim() : (row[2] || '').trim();
    if (!birthDate) birthDate = '2004-01-01';

    // Resolve primary phone
    const phoneNumber = phoneIdx !== -1 && row[phoneIdx] ? row[phoneIdx].trim() : (row[3] || '').trim();
    if (!phoneNumber) continue;

    // Resolve additional phone
    const additionalPhoneNumber = addPhoneIdx !== -1 && row[addPhoneIdx] ? row[addPhoneIdx].trim() : (row[4] || '').trim();

    // Resolve collection date
    let collectionDate = collDateIdx !== -1 && row[collDateIdx] ? row[collDateIdx].trim() : (row[5] || '').trim();
    if (!collectionDate) collectionDate = todayStr;

    // Resolve department & notes
    const department = deptIdx !== -1 && row[deptIdx] ? row[deptIdx].trim() : '';
    const academicYear = yearIdx !== -1 && row[yearIdx] ? row[yearIdx].trim() : '';
    const notes = notesIdx !== -1 && row[notesIdx] ? row[notesIdx].trim() : '';

    parsedStudents.push({
      studentName,
      birthDate,
      phoneNumber,
      additionalPhoneNumber,
      collectionDate,
      department,
      academicYear,
      notes,
    });
  }

  return parsedStudents;
}
