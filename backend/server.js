// server.js
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const bodyParser = require('body-parser');

// Initialize Firebase Admin
const serviceAccount = require('./groupassign-87a64-firebase-adminsdk-fbsvc-1a59cd1388'); // Path to your Firebase service account file
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;

// Middleware: Verify ID token and attach roles
const verifyIdToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded; // { uid, email, ... }

    // Fetch user role from Firestore 'users' collection
    const userDoc = await db.collection('users').doc(decoded.uid).get();
    req.user.role = userDoc.exists ? userDoc.data().role : null;

    next();
  } catch (err) {
    console.error('Invalid token:', err);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// --------- Role Assignment Endpoint ---------
app.post('/api/admin/assign-role', verifyIdToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { uid, role } = req.body; // role: 'admin', 'institute', 'student', 'company'
  try {
    await admin.auth().setCustomUserClaims(uid, { [role]: true });
    await db.collection('users').doc(uid).set({ role }, { merge: true });
    res.json({ message: `Role '${role}' assigned to user ${uid}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------- Admin CRUD Routes ---------

// Add Institution
app.post('/api/admin/institutions', verifyIdToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { name, address } = req.body;
  try {
    const docRef = await db.collection('institutions').add({
      name,
      address,
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ id: docRef.id, name, address });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Institution
app.put('/api/admin/institutions/:id', verifyIdToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { id } = req.params;
  const { name, address, status } = req.body;
  try {
    await db.collection('institutions').doc(id).update({ name, address, status });
    res.json({ message: 'Institution updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Institution
app.delete('/api/admin/institutions/:id', verifyIdToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { id } = req.params;
  try {
    await db.collection('institutions').doc(id).delete();
    res.json({ message: 'Institution deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Faculty under Institution
app.post('/api/admin/institutions/:instId/faculties', verifyIdToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { instId } = req.params;
  const { name } = req.body;
  try {
    const ref = await db.collection('institutions').doc(instId).collection('faculties').add({
      name,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ id: ref.id, name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Course under Faculty
app.post('/api/admin/institutions/:instId/faculties/:facultyId/courses', verifyIdToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { instId, facultyId } = req.params;
  const { name } = req.body;
  try {
    const ref = await db.collection('institutions').doc(instId)
      .collection('faculties').doc(facultyId)
      .collection('courses').add({
        name,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    res.json({ id: ref.id, name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Publish Admissions (Admin)
app.post('/api/admin/institutions/:instId/admissions', verifyIdToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { instId } = req.params;
  const { description, deadline } = req.body;
  try {
    await db.collection('institutions').doc(instId).collection('admissions').add({
      description,
      deadline,
      status: 'published',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ message: 'Admission published' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------- Institute Routes ---------
app.post('/api/institute/faculties', verifyIdToken, async (req, res) => {
  if (req.user.role !== 'institute') return res.status(403).json({ error: 'Forbidden' });
  const { name } = req.body;
  try {
    const ref = await db.collection('institutions').doc(req.user.uid).collection('faculties').add({
      name,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ id: ref.id, name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Course under Faculty
app.post('/api/institute/courses', verifyIdToken, async (req, res) => {
  if (req.user.role !== 'institute') return res.status(403).json({ error: 'Forbidden' });
  const { facultyId, name } = req.body;
  try {
    const ref = await db.collection('institutions').doc(req.user.uid)
      .collection('faculties').doc(facultyId)
      .collection('courses').add({
        name,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    res.json({ id: ref.id, name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Publish Admission (Institute)
app.post('/api/institute/admissions', verifyIdToken, async (req, res) => {
  if (req.user.role !== 'institute') return res.status(403).json({ error: 'Forbidden' });
  const { description, deadline } = req.body;
  try {
    await db.collection('institutions').doc(req.user.uid).collection('admissions').add({
      description,
      deadline,
      status: 'published',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ message: 'Admission published' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------- Student Routes ---------
app.post('/api/students/apply', verifyIdToken, async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden' });
  const { institutionId, courseId } = req.body;
  try {
    const existing = await db.collection('applications')
      .where('studentId', '==', req.user.uid)
      .where('institutionId', '==', institutionId)
      .where('courseId', '==', courseId)
      .get();
    if (!existing.empty) return res.status(400).json({ error: 'Already applied' });
    await db.collection('applications').add({
      studentId: req.user.uid,
      institutionId,
      courseId,
      status: 'pending',
      appliedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ message: 'Application submitted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch applications
app.get('/api/students/applications', verifyIdToken, async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden' });
  try {
    const snapshot = await db.collection('applications')
      .where('studentId', '==', req.user.uid)
      .get();
    const apps = [];
    snapshot.forEach(doc => apps.push({ id: doc.id, ...doc.data() }));
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------- Company Routes ---------
app.post('/api/jobs', verifyIdToken, async (req, res) => {
  if (req.user.role !== 'company') return res.status(403).json({ error: 'Forbidden' });
  const { title, description, requirements } = req.body;
  try {
    const ref = await db.collection('jobs').add({
      companyId: req.user.uid,
      title,
      description,
      requirements,
      postedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'open',
    });
    res.json({ id: ref.id, title });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/jobs', verifyIdToken, async (req, res) => {
  if (req.user.role !== 'company') return res.status(403).json({ error: 'Forbidden' });
  try {
    const snapshot = await db.collection('jobs').where('companyId', '==', req.user.uid).get();
    const jobs = [];
    snapshot.forEach(doc => jobs.push({ id: doc.id, ...doc.data() }));
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Apply for job
app.post('/api/apply-job', verifyIdToken, async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden' });
  const { jobId } = req.body;
  try {
    const existing = await db.collection('jobApplications')
      .where('jobId', '==', jobId)
      .where('applicantId', '==', req.user.uid)
      .get();
    if (!existing.empty) return res.status(400).json({ error: 'Already applied' });
    await db.collection('jobApplications').add({
      jobId,
      applicantId: req.user.uid,
      status: 'applied',
      appliedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ message: 'Application submitted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------- Notifications ---------
app.post('/api/notifications', verifyIdToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { studentId, message } = req.body;
  try {
    await db.collection('notifications').add({
      studentId,
      message,
      date: admin.firestore.FieldValue.serverTimestamp(),
      readStatus: false,
    });
    res.json({ message: 'Notification sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------- Profile update ---------
app.put('/api/profile', verifyIdToken, async (req, res) => {
  const { name, email } = req.body;
  try {
    await db.collection('users').doc(req.user.uid).set(
      { role: req.user.role, name, email },
      { merge: true }
    );
    res.json({ message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------- Bulk Insert Endpoint ---------
app.post('/api/admin/bulk-insert', verifyIdToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const data = req.body;

  try {
    // Process adminModules
    if (data.adminModules) {
      for (const [collectionName, items] of Object.entries(data.adminModules)) {
        for (const item of items) {
          await db.collection(collectionName).doc(item.documentId).set({
            ...item.fields,
            documentId: item.documentId,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
      }
    }

    // Process instituteModules
    if (data.instituteModules) {
      for (const [collectionName, items] of Object.entries(data.instituteModules)) {
        for (const item of items) {
          await db.collection(collectionName).doc(item.documentId).set({
            ...item.fields,
            documentId: item.documentId,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
      }
    }

    // Process studentModules
    if (data.studentModules) {
      for (const [collectionName, items] of Object.entries(data.studentModules)) {
        for (const item of items) {
          await db.collection(collectionName).doc(item.documentId).set({
            ...item.fields,
            documentId: item.documentId,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
      }
    }

    // Process companyModules
    if (data.companyModules) {
      for (const [collectionName, items] of Object.entries(data.companyModules)) {
        for (const item of items) {
          await db.collection(collectionName).doc(item.documentId).set({
            ...item.fields,
            documentId: item.documentId,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
      }
    }

    res.json({ message: 'Bulk data inserted successfully' });
  } catch (err) {
    console.error('Bulk insert error:', err);
    res.status(500).json({ error: err.message });
  }
});

// --------- Start server ---------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});