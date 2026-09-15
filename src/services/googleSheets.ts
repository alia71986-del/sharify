import { Student } from '../types';

export interface DriveSpreadsheetFile {
  id: string;
  name: string;
  modifiedTime?: string;
  webViewLink?: string;
}

export interface ParsedSheetStudent {
  studentName: string;
  gender?: 'male' | 'female';
  birthDate: string;
  phoneNumber: string;
  parentPhoneNumber?: string;
  additionalPhoneNumber?: string;
  province?: string;
  residenceDetails?: string;
  collectionDate: string;
  receiptNo?: string;
  notes?: string;
}

const DEFAULT_HEADERS = [
  'Student ID',
  'Student Full Name',
  'Gender',
  'Birth Date',
  'Student Phone Number',
  'Parents Phone Number',
  'Province (Iraq)',
  'Residence Details',
  'Collection Date',
  'Receipt No.',
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
      s.gender || 'male',
      s.birthDate,
      s.phoneNumber,
      s.parentPhoneNumber || s.additionalPhoneNumber || '',
      s.province || 'Al-Najaf',
      s.residenceDetails || '',
      s.collectionDate,
      s.receiptNo || s.notes || '',
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
                userEnteredFormat:
                  rowIndex === 0
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

  const result = await res.json();
  return {
    spreadsheetId: result.spreadsheetId,
    spreadsheetUrl: result.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${result.spreadsheetId}/edit`,
    sheetName: 'Student Registry',
  };
}

/**
 * Sync (Export) all students to a designated Google Sheet
 */
export async function syncAllStudentsToSpreadsheet(
  accessToken: string,
  spreadsheetId: string,
  students: Student[],
  mode: 'overwrite' | 'append' = 'overwrite'
): Promise<{ updatedRows: number }> {
  // First, check sheet metadata to identify sheet name
  const metaRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!metaRes.ok) {
    const err = await metaRes.json().catch(() => ({}));
    throw new Error(err.error?.message || `Cannot access spreadsheet (${metaRes.status})`);
  }

  const metaData = await metaRes.json();
  const firstSheetName = metaData.sheets?.[0]?.properties?.title || 'Sheet1';

  const rows = students.map((s) => [
    s.id,
    s.studentName,
    s.gender || 'male',
    s.birthDate,
    s.phoneNumber,
    s.parentPhoneNumber || s.additionalPhoneNumber || '',
    s.province || 'Al-Najaf',
    s.residenceDetails || '',
    s.collectionDate,
    s.receiptNo || s.notes || '',
    s.createdAt,
    s.updatedAt,
  ]);

  if (mode === 'overwrite') {
    // Clear sheet
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(firstSheetName)}:clear`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    // Write headers + rows
    const updateRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(firstSheetName)}!A1?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range: `${firstSheetName}!A1`,
          majorDimension: 'ROWS',
          values: [DEFAULT_HEADERS, ...rows],
        }),
      }
    );

    if (!updateRes.ok) {
      const err = await updateRes.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to update sheet values');
    }

    const data = await updateRes.json();
    return { updatedRows: data.updatedRows || rows.length };
  } else {
    // Append rows
    const appendRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(firstSheetName)}!A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: rows,
        }),
      }
    );

    if (!appendRes.ok) {
      const err = await appendRes.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to append sheet values');
    }

    const data = await appendRes.json();
    return { updatedRows: data.updates?.updatedRows || rows.length };
  }
}

/**
 * Read and parse students from Google Spreadsheet for importing
 */
export async function readStudentsFromSpreadsheet(
  accessToken: string,
  spreadsheetId: string
): Promise<ParsedSheetStudent[]> {
  const metaRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!metaRes.ok) {
    const err = await metaRes.json().catch(() => ({}));
    throw new Error(err.error?.message || `Cannot access spreadsheet (${metaRes.status})`);
  }

  const metaData = await metaRes.json();
  const firstSheetName = metaData.sheets?.[0]?.properties?.title || 'Sheet1';

  const readRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(firstSheetName)}!A1:Z500`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!readRes.ok) {
    const err = await readRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to read sheet values');
  }

  const data = await readRes.json();
  const values: string[][] = data.values || [];

  if (values.length <= 1) {
    return [];
  }

  const headerRow = values[0].map((h) => h.toLowerCase().trim());
  const rows = values.slice(1);

  // Column index finders
  const nameIdx = headerRow.findIndex((h) => h.includes('name') || h.includes('student'));
  const genderIdx = headerRow.findIndex((h) => h.includes('gender') || h.includes('sex'));
  const dobIdx = headerRow.findIndex((h) => h.includes('birth') || h.includes('dob'));
  const phoneIdx = headerRow.findIndex((h) => (h.includes('phone') || h.includes('mobile')) && !h.includes('parent'));
  const parentPhoneIdx = headerRow.findIndex((h) => h.includes('parent') || h.includes('guardian') || h.includes('family'));
  const provIdx = headerRow.findIndex((h) => h.includes('province') || h.includes('city') || h.includes('governorate') || h.includes('place'));
  const resIdx = headerRow.findIndex((h) => h.includes('residence') || h.includes('address') || h.includes('details') || h.includes('district'));
  const dateIdx = headerRow.findIndex((h) => h.includes('collection') || h.includes('collected') || h.includes('date'));
  const receiptIdx = headerRow.findIndex((h) => h.includes('receipt') || h.includes('voucher') || h.includes('notes') || h.includes('وصل'));

  const parsedStudents: ParsedSheetStudent[] = [];

  for (const row of rows) {
    const studentName = (row[nameIdx !== -1 ? nameIdx : 1] || '').trim();
    if (!studentName) continue; // Skip empty rows

    const rawGender = (genderIdx !== -1 ? row[genderIdx] : row[2] || '').trim().toLowerCase();
    const gender: 'male' | 'female' =
      rawGender.includes('fem') || rawGender.includes('f') || rawGender.includes('أنثى')
        ? 'female'
        : 'male';

    let birthDate = (dobIdx !== -1 ? row[dobIdx] : row[3] || '').trim();
    if (!birthDate) birthDate = '2004-01-01';

    const phoneNumber = (phoneIdx !== -1 ? row[phoneIdx] : row[4] || '').trim();
    if (!phoneNumber) continue; // Skip without phone

    const parentPhoneNumber = (parentPhoneIdx !== -1 ? row[parentPhoneIdx] : row[5] || '').trim();
    const province = (provIdx !== -1 ? row[provIdx] : row[6] || 'Al-Najaf').trim();
    const residenceDetails = (resIdx !== -1 ? row[resIdx] : row[7] || '').trim();
    const collectionDate = (dateIdx !== -1 ? row[dateIdx] : row[8] || '').trim() || new Date().toISOString().split('T')[0];
    const receiptNo = (receiptIdx !== -1 ? row[receiptIdx] : row[9] || '').trim();

    parsedStudents.push({
      studentName,
      gender,
      birthDate,
      phoneNumber,
      parentPhoneNumber,
      additionalPhoneNumber: parentPhoneNumber,
      province: province || 'Al-Najaf',
      residenceDetails,
      collectionDate,
      receiptNo,
      notes: receiptNo,
    });
  }

  return parsedStudents;
}
