import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

interface StudentRecord {
  id: string;
  studentName: string;
  birthDate: string;
  phoneNumber: string;
  additionalPhoneNumber?: string;
  collectionDate: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  department?: string;
  academicYear?: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'students.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed data with authentic university student records
const INITIAL_STUDENTS: StudentRecord[] = [
  {
    id: 'std-2026-001',
    studentName: 'Ali Hussein Al-Moussawi',
    birthDate: '2004-03-15',
    phoneNumber: '07801234567',
    additionalPhoneNumber: '07709876543',
    collectionDate: '2026-08-26',
    createdAt: '2026-08-26T09:15:00.000Z',
    updatedAt: '2026-08-26T09:15:00.000Z',
    department: 'Computer Science & Engineering',
    academicYear: 'Year 2',
    notes: 'Transferred from University of Baghdad.',
  },
  {
    id: 'std-2026-002',
    studentName: 'Zainab Kareem Al-Saadi',
    birthDate: '2003-11-22',
    phoneNumber: '07705551234',
    additionalPhoneNumber: '',
    collectionDate: '2026-08-26',
    createdAt: '2026-08-26T10:30:00.000Z',
    updatedAt: '2026-08-26T10:30:00.000Z',
    department: 'Information Technology',
    academicYear: 'Year 3',
    notes: 'Dean honor list student.',
  },
  {
    id: 'std-2026-003',
    studentName: 'Mustafa Ahmed Al-Janabi',
    birthDate: '2005-06-08',
    phoneNumber: '07503338899',
    additionalPhoneNumber: '07804441122',
    collectionDate: '2026-08-25',
    createdAt: '2026-08-25T14:20:00.000Z',
    updatedAt: '2026-08-25T14:20:00.000Z',
    department: 'Civil Engineering',
    academicYear: 'Year 1',
    notes: 'Freshman student registration.',
  },
  {
    id: 'std-2026-004',
    studentName: 'Maryam Hassan Al-Basri',
    birthDate: '2004-09-18',
    phoneNumber: '07817774433',
    additionalPhoneNumber: '',
    collectionDate: '2026-08-24',
    createdAt: '2026-08-24T11:00:00.000Z',
    updatedAt: '2026-08-24T11:00:00.000Z',
    department: 'Biomedical Sciences',
    academicYear: 'Year 2',
    notes: 'Laboratory safety training completed.',
  },
  {
    id: 'std-2026-005',
    studentName: 'Omar Tariq Al-Nuaimi',
    birthDate: '2002-12-04',
    phoneNumber: '+9647809988776',
    additionalPhoneNumber: '07712233445',
    collectionDate: '2026-08-20',
    createdAt: '2026-08-20T08:45:00.000Z',
    updatedAt: '2026-08-20T08:45:00.000Z',
    department: 'Business Administration',
    academicYear: 'Year 4',
    notes: 'Graduation project team lead.',
  }
];

// Helper to read database
function readStudents(): StudentRecord[] {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_STUDENTS, null, 2), 'utf-8');
      return INITIAL_STUDENTS;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw) as StudentRecord[];
  } catch (err) {
    console.error('Error reading students data file:', err);
    return INITIAL_STUDENTS;
  }
}

// Helper to write database safely
function writeStudents(students: StudentRecord[]): boolean {
  try {
    const tempFile = `${DATA_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(students, null, 2), 'utf-8');
    fs.renameSync(tempFile, DATA_FILE);
    return true;
  } catch (err) {
    console.error('Error writing students data file:', err);
    return false;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize DB if needed
  readStudents();

  // --- API Endpoints ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // GET /api/students - List students with optional filter/search/sort
  app.get('/api/students', (req, res) => {
    try {
      const { search, collectionDate, sortBy, sortOrder } = req.query;
      let students = readStudents();

      // Search by student name or phone number
      if (search && typeof search === 'string' && search.trim().length > 0) {
        const q = search.trim().toLowerCase();
        students = students.filter(
          (s) =>
            s.studentName.toLowerCase().includes(q) ||
            s.phoneNumber.replace(/[\s\-\(\)]/g, '').includes(q) ||
            (s.additionalPhoneNumber && s.additionalPhoneNumber.replace(/[\s\-\(\)]/g, '').includes(q)) ||
            (s.department && s.department.toLowerCase().includes(q))
        );
      }

      // Filter by collection date
      if (collectionDate && typeof collectionDate === 'string' && collectionDate.trim().length > 0) {
        const filterVal = collectionDate.trim();
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        if (filterVal === 'today') {
          students = students.filter((s) => s.collectionDate === todayStr);
        } else if (filterVal === 'this_week') {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          const weekAgoStr = weekAgo.toISOString().split('T')[0];
          students = students.filter((s) => s.collectionDate >= weekAgoStr);
        } else if (filterVal === 'this_month') {
          const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
          students = students.filter((s) => s.collectionDate.startsWith(monthPrefix));
        } else if (filterVal !== 'all') {
          students = students.filter((s) => s.collectionDate === filterVal);
        }
      }

      // Sorting
      const field = (sortBy as string) || 'createdAt';
      const order = (sortOrder as string) === 'asc' ? 1 : -1;

      students.sort((a, b) => {
        let valA = a[field as keyof StudentRecord] || '';
        let valB = b[field as keyof StudentRecord] || '';
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return -1 * order;
        if (valA > valB) return 1 * order;
        return 0;
      });

      res.json({
        success: true,
        count: students.length,
        data: students,
      });
    } catch (err) {
      console.error('Error fetching students:', err);
      res.status(500).json({ success: false, error: 'Failed to fetch students' });
    }
  });

  // GET /api/students/:id - Get single student
  app.get('/api/students/:id', (req, res) => {
    try {
      const students = readStudents();
      const student = students.find((s) => s.id === req.params.id);
      if (!student) {
        return res.status(404).json({ success: false, error: 'Student record not found' });
      }
      res.json({ success: true, data: student });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  // POST /api/students - Create new student
  app.post('/api/students', (req, res) => {
    try {
      const { studentName, birthDate, phoneNumber, additionalPhoneNumber, collectionDate, notes, department, academicYear } = req.body;

      // Validation
      if (!studentName || !studentName.trim()) {
        return res.status(400).json({ success: false, error: 'Student Name is required' });
      }
      if (!birthDate || !birthDate.trim()) {
        return res.status(400).json({ success: false, error: 'Birth Date is required' });
      }
      if (!phoneNumber || !phoneNumber.trim()) {
        return res.status(400).json({ success: false, error: 'Phone Number is required' });
      }
      if (!collectionDate || !collectionDate.trim()) {
        return res.status(400).json({ success: false, error: 'Collection Date is required' });
      }

      // Check birth date not future
      const today = new Date().toISOString().split('T')[0];
      if (birthDate > today) {
        return res.status(400).json({ success: false, error: 'Birth Date cannot be in the future' });
      }

      const students = readStudents();
      const newId = `std-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      const nowIso = new Date().toISOString();

      const newStudent: StudentRecord = {
        id: newId,
        studentName: studentName.trim(),
        birthDate: birthDate.trim(),
        phoneNumber: phoneNumber.trim(),
        additionalPhoneNumber: (additionalPhoneNumber || '').trim(),
        collectionDate: collectionDate.trim(),
        createdAt: nowIso,
        updatedAt: nowIso,
        notes: (notes || '').trim(),
        department: (department || '').trim(),
        academicYear: (academicYear || '').trim(),
      };

      // Add to beginning of array
      students.unshift(newStudent);
      writeStudents(students);

      res.status(201).json({
        success: true,
        message: 'Student information saved successfully.',
        data: newStudent,
      });
    } catch (err) {
      console.error('Error creating student:', err);
      res.status(500).json({ success: false, error: 'Failed to save student record' });
    }
  });

  // PUT /api/students/:id - Update existing student
  app.put('/api/students/:id', (req, res) => {
    try {
      const { id } = req.params;
      const { studentName, birthDate, phoneNumber, additionalPhoneNumber, collectionDate, notes, department, academicYear } = req.body;

      // Validation
      if (!studentName || !studentName.trim()) {
        return res.status(400).json({ success: false, error: 'Student Name is required' });
      }
      if (!birthDate || !birthDate.trim()) {
        return res.status(400).json({ success: false, error: 'Birth Date is required' });
      }
      if (!phoneNumber || !phoneNumber.trim()) {
        return res.status(400).json({ success: false, error: 'Phone Number is required' });
      }
      if (!collectionDate || !collectionDate.trim()) {
        return res.status(400).json({ success: false, error: 'Collection Date is required' });
      }

      const students = readStudents();
      const index = students.findIndex((s) => s.id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Student record not found' });
      }

      const nowIso = new Date().toISOString();
      const updatedStudent: StudentRecord = {
        ...students[index],
        studentName: studentName.trim(),
        birthDate: birthDate.trim(),
        phoneNumber: phoneNumber.trim(),
        additionalPhoneNumber: (additionalPhoneNumber || '').trim(),
        collectionDate: collectionDate.trim(),
        updatedAt: nowIso,
        notes: notes !== undefined ? notes.trim() : students[index].notes,
        department: department !== undefined ? department.trim() : students[index].department,
        academicYear: academicYear !== undefined ? academicYear.trim() : students[index].academicYear,
      };

      students[index] = updatedStudent;
      writeStudents(students);

      res.json({
        success: true,
        message: 'Student information updated successfully.',
        data: updatedStudent,
      });
    } catch (err) {
      console.error('Error updating student:', err);
      res.status(500).json({ success: false, error: 'Failed to update student record' });
    }
  });

  // DELETE /api/students/:id - Delete student
  app.delete('/api/students/:id', (req, res) => {
    try {
      const { id } = req.params;
      const students = readStudents();
      const index = students.findIndex((s) => s.id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Student record not found' });
      }

      const deleted = students.splice(index, 1)[0];
      writeStudents(students);

      res.json({
        success: true,
        message: `Student record for ${deleted.studentName} deleted successfully.`,
        data: deleted,
      });
    } catch (err) {
      console.error('Error deleting student:', err);
      res.status(500).json({ success: false, error: 'Failed to delete student record' });
    }
  });

  // GET /api/stats - Statistical breakdown
  app.get('/api/stats', (req, res) => {
    try {
      const students = readStudents();
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      const todayCount = students.filter((s) => s.collectionDate === todayStr).length;
      const thisMonthCount = students.filter((s) => s.collectionDate.startsWith(monthPrefix)).length;
      const withAdditionalPhoneCount = students.filter((s) => !!s.additionalPhoneNumber).length;

      res.json({
        success: true,
        data: {
          totalStudents: students.length,
          todayCount,
          thisMonthCount,
          withAdditionalPhoneCount,
        },
      });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to calculate stats' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`University Student Info Server running on http://localhost:${PORT}`);
  });
}

startServer();
