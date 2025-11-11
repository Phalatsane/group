// src/services/firebaseService.js
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  updateDoc,
  writeBatch,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { firestore } from '../firebase/config';

// Initialize Database with Sample Data
export const initializeDatabase = async () => {
  try {
    console.log('Initializing database collections...');
    
    await initializeInstitutions();
    await initializeFaculties();
    await initializeCourses();
    await initializeCompanies();
    await initializeJobPostings();
    await initializeStudents();
    
    console.log('Database initialization completed successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Collection Initialization Functions
const initializeInstitutions = async () => {
  try {
    const institutionsRef = collection(firestore, 'institutions');
    const snapshot = await getDocs(institutionsRef);
    
    if (snapshot.empty) {
      const batch = writeBatch(firestore);
      const sampleInstitutions = [
        { 
          name: 'University of Technology', 
          code: 'UTECH', 
          type: 'University',
          description: 'Leading technology university offering cutting-edge programs',
          contactEmail: 'admin@utech.edu',
          phone: '+1-555-0101',
          address: '123 Tech Street, Innovation City',
          website: 'www.utech.edu',
          status: 'active', 
          createdAt: new Date(),
          createdBy: 'system'
        },
        { 
          name: 'City College', 
          code: 'CITYCOL', 
          type: 'College',
          description: 'Community college focused on practical education',
          contactEmail: 'info@citycollege.edu',
          phone: '+1-555-0102',
          address: '456 Main Street, Downtown',
          website: 'www.citycollege.edu',
          status: 'active', 
          createdAt: new Date(),
          createdBy: 'system'
        },
        { 
          name: 'State University', 
          code: 'STATEUNI', 
          type: 'University',
          description: 'Public university with comprehensive programs',
          contactEmail: 'admissions@stateuni.edu',
          phone: '+1-555-0103',
          address: '789 University Avenue, Capital City',
          website: 'www.stateuni.edu',
          status: 'active', 
          createdAt: new Date(),
          createdBy: 'system'
        }
      ];
      
      sampleInstitutions.forEach(institution => {
        const docRef = doc(institutionsRef);
        batch.set(docRef, institution);
      });
      await batch.commit();
      console.log('Institutions initialized');
    }
  } catch (error) {
    console.error('Error initializing institutions:', error);
    throw error;
  }
};

const initializeFaculties = async () => {
  try {
    const facultiesRef = collection(firestore, 'faculties');
    const snapshot = await getDocs(facultiesRef);
    
    if (snapshot.empty) {
      const batch = writeBatch(firestore);
      const sampleFaculties = [
        { 
          name: 'Faculty of Engineering', 
          code: 'ENG', 
          description: 'Engineering and technology programs',
          status: 'active', 
          institution: 'University of Technology',
          createdAt: new Date(),
          createdBy: 'system'
        },
        { 
          name: 'Faculty of Science', 
          code: 'SCI', 
          description: 'Science and research programs',
          status: 'active', 
          institution: 'University of Technology',
          createdAt: new Date(),
          createdBy: 'system'
        },
        { 
          name: 'Faculty of Business', 
          code: 'BUS', 
          description: 'Business and management programs',
          status: 'active', 
          institution: 'University of Technology',
          createdAt: new Date(),
          createdBy: 'system'
        },
        { 
          name: 'Faculty of Arts', 
          code: 'ARTS', 
          description: 'Arts and humanities programs',
          status: 'active', 
          institution: 'State University',
          createdAt: new Date(),
          createdBy: 'system'
        }
      ];
      
      sampleFaculties.forEach(faculty => {
        const docRef = doc(facultiesRef);
        batch.set(docRef, faculty);
      });
      await batch.commit();
      console.log('Faculties initialized');
    }
  } catch (error) {
    console.error('Error initializing faculties:', error);
    throw error;
  }
};

const initializeCourses = async () => {
  try {
    const coursesRef = collection(firestore, 'courses');
    const snapshot = await getDocs(coursesRef);
    
    if (snapshot.empty) {
      const batch = writeBatch(firestore);
      const sampleCourses = [
        { 
          name: 'Computer Science', 
          code: 'CS101', 
          duration: '4 years', 
          faculty: 'Engineering', 
          description: 'Comprehensive computer science program',
          credits: '120',
          institution: 'University of Technology',
          status: 'active', 
          createdAt: new Date(),
          createdBy: 'system'
        },
        { 
          name: 'Electrical Engineering', 
          code: 'EE201', 
          duration: '4 years', 
          faculty: 'Engineering', 
          description: 'Electrical engineering with modern applications',
          credits: '125',
          institution: 'University of Technology',
          status: 'active', 
          createdAt: new Date(),
          createdBy: 'system'
        },
        { 
          name: 'Business Administration', 
          code: 'BA301', 
          duration: '3 years', 
          faculty: 'Business', 
          description: 'Business management and administration',
          credits: '90',
          institution: 'State University',
          status: 'active', 
          createdAt: new Date(),
          createdBy: 'system'
        },
        { 
          name: 'Data Science', 
          code: 'DS401', 
          duration: '4 years', 
          faculty: 'Science', 
          description: 'Data analysis and machine learning',
          credits: '120',
          institution: 'University of Technology',
          status: 'active', 
          createdAt: new Date(),
          createdBy: 'system'
        }
      ];
      
      sampleCourses.forEach(course => {
        const docRef = doc(coursesRef);
        batch.set(docRef, course);
      });
      await batch.commit();
      console.log('Courses initialized');
    }
  } catch (error) {
    console.error('Error initializing courses:', error);
    throw error;
  }
};

const initializeCompanies = async () => {
  try {
    const companiesRef = collection(firestore, 'users');
    const snapshot = await getDocs(companiesRef);
    
    if (snapshot.empty) {
      const batch = writeBatch(firestore);
      const sampleCompanies = [
        { 
          name: 'Tech Solutions Inc.', 
          email: 'contact@techsolutions.com', 
          industry: 'Technology', 
          description: 'Leading technology solutions provider',
          status: 'approved', 
          role: 'company',
          createdAt: new Date(),
          ownerId: 'system',
          uploadedDocs: []
        },
        { 
          name: 'Global Business Corp', 
          email: 'hr@globalbusiness.com', 
          industry: 'Consulting', 
          description: 'International business consulting firm',
          status: 'approved', 
          role: 'company',
          createdAt: new Date(),
          ownerId: 'system',
          uploadedDocs: []
        },
        { 
          name: 'Innovate Labs', 
          email: 'careers@innovatelabs.com', 
          industry: 'Research & Development', 
          description: 'Cutting-edge research and development company',
          status: 'pending', 
          role: 'company',
          createdAt: new Date(),
          ownerId: 'system',
          uploadedDocs: []
        }
      ];
      
      sampleCompanies.forEach(company => {
        const docRef = doc(companiesRef);
        batch.set(docRef, company);
      });
      console.log('Companies initialized');
    }
  } catch (error) {
    console.error('Error initializing companies:', error);
    throw error;
  }
};

const initializeJobPostings = async () => {
  try {
    const jobsRef = collection(firestore, 'jobPostings');
    const snapshot = await getDocs(jobsRef);
    
    if (snapshot.empty) {
      const batch = writeBatch(firestore);
      const sampleJobs = [
        { 
          title: 'Software Engineer', 
          qualifications: 'Computer Science Degree', 
          experience: '2+ years', 
          company: 'Tech Solutions Inc.', 
          description: 'Develop and maintain software applications using modern technologies',
          requiredSkills: 'JavaScript, React, Node.js, Python',
          minGPA: '3.0',
          requiredCertificates: 'AWS Certified, Google Cloud Certified',
          status: 'active', 
          createdAt: new Date(),
          postedBy: 'system'
        },
        { 
          title: 'Business Analyst', 
          qualifications: 'Business Degree', 
          experience: '1+ years', 
          company: 'Global Business Corp', 
          description: 'Analyze business processes and recommend improvements',
          requiredSkills: 'Data Analysis, SQL, Excel, Communication',
          minGPA: '3.2',
          requiredCertificates: 'PMP, Six Sigma',
          status: 'active', 
          createdAt: new Date(),
          postedBy: 'system'
        },
        { 
          title: 'Data Scientist', 
          qualifications: 'Data Science or Statistics Degree', 
          experience: '3+ years', 
          company: 'Innovate Labs', 
          description: 'Build machine learning models and analyze complex datasets',
          requiredSkills: 'Python, R, Machine Learning, Statistics',
          minGPA: '3.5',
          requiredCertificates: 'TensorFlow Developer, Data Science Certification',
          status: 'active', 
          createdAt: new Date(),
          postedBy: 'system'
        }
      ];
      
      sampleJobs.forEach(job => {
        const docRef = doc(jobsRef);
        batch.set(docRef, job);
      });
      await batch.commit();
      console.log('Job postings initialized');
    }
  } catch (error) {
    console.error('Error initializing job postings:', error);
    throw error;
  }
};

const initializeStudents = async () => {
  try {
    const usersRef = collection(firestore, 'users');
    const snapshot = await getDocs(usersRef);
    
    // Check if we need to add sample students
    const existingStudents = snapshot.docs.filter(doc => doc.data().role === 'student');
    
    if (existingStudents.length === 0) {
      const batch = writeBatch(firestore);
      const sampleStudents = [
        { 
          name: 'John Smith', 
          email: 'john.smith@student.edu', 
          role: 'student',
          institution: 'University of Technology',
          courseOfStudy: 'Computer Science',
          gpa: '3.8',
          skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
          certificates: ['AWS Certified Developer', 'Google Cloud Associate'],
          workExperience: [
            {
              company: 'Tech Intern Inc',
              position: 'Software Developer Intern',
              duration: '6 months',
              description: 'Developed web applications using React and Node.js'
            }
          ],
          academicAchievements: ['Dean\'s List', 'Best Project Award'],
          status: 'active',
          createdAt: new Date(),
          uid: 'student1'
        },
        { 
          name: 'Sarah Johnson', 
          email: 'sarah.johnson@student.edu', 
          role: 'student',
          institution: 'State University',
          courseOfStudy: 'Business Administration',
          gpa: '3.9',
          skills: ['Data Analysis', 'Excel', 'SQL', 'Communication', 'Project Management'],
          certificates: ['PMP', 'Six Sigma Green Belt'],
          workExperience: [
            {
              company: 'Business Solutions Co',
              position: 'Business Analyst Intern',
              duration: '8 months',
              description: 'Analyzed business processes and created improvement reports'
            }
          ],
          academicAchievements: ['Valedictorian', 'Business Case Competition Winner'],
          status: 'active',
          createdAt: new Date(),
          uid: 'student2'
        },
        { 
          name: 'Michael Chen', 
          email: 'michael.chen@student.edu', 
          role: 'student',
          institution: 'University of Technology',
          courseOfStudy: 'Data Science',
          gpa: '3.7',
          skills: ['Python', 'R', 'Machine Learning', 'TensorFlow', 'Statistics'],
          certificates: ['TensorFlow Developer Certificate', 'Data Science Specialization'],
          workExperience: [
            {
              company: 'Data Analytics Corp',
              position: 'Data Science Intern',
              duration: '12 months',
              description: 'Built predictive models and conducted data analysis'
            }
          ],
          academicAchievements: ['Research Scholarship', 'Data Science Competition Finalist'],
          status: 'active',
          createdAt: new Date(),
          uid: 'student3'
        }
      ];
      
      sampleStudents.forEach(student => {
        const docRef = doc(usersRef);
        batch.set(docRef, student);
      });
      await batch.commit();
      console.log('Sample students initialized');
    }
  } catch (error) {
    console.error('Error initializing students:', error);
    throw error;
  }
};

// CRUD Operations for Institutions
export const getInstitutions = async () => {
  try {
    const snapshot = await getDocs(collection(firestore, 'institutions'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting institutions:', error);
    throw error;
  }
};

export const addInstitution = async (data, userId = null, userName = null) => {
  try {
    const institutionData = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (userId) {
      institutionData.createdBy = userId;
      institutionData.createdByName = userName;
    }

    const docRef = await addDoc(collection(firestore, 'institutions'), institutionData);
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error('Error adding institution:', error);
    throw error;
  }
};

export const updateInstitution = async (id, data) => {
  try {
    await updateDoc(doc(firestore, 'institutions', id), {
      ...data,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating institution:', error);
    throw error;
  }
};

export const deleteInstitution = async (id) => {
  try {
    await deleteDoc(doc(firestore, 'institutions', id));
  } catch (error) {
    console.error('Error deleting institution:', error);
    throw error;
  }
};

// CRUD Operations for Faculties
export const getFaculties = async () => {
  try {
    const snapshot = await getDocs(collection(firestore, 'faculties'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting faculties:', error);
    throw error;
  }
};

export const addFaculty = async (data, userId = null, userName = null) => {
  try {
    const facultyData = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (userId) {
      facultyData.createdBy = userId;
      facultyData.createdByName = userName;
    }

    const docRef = await addDoc(collection(firestore, 'faculties'), facultyData);
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error('Error adding faculty:', error);
    throw error;
  }
};

export const updateFaculty = async (id, data) => {
  try {
    await updateDoc(doc(firestore, 'faculties', id), {
      ...data,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating faculty:', error);
    throw error;
  }
};

export const deleteFaculty = async (id) => {
  try {
    await deleteDoc(doc(firestore, 'faculties', id));
  } catch (error) {
    console.error('Error deleting faculty:', error);
    throw error;
  }
};

// CRUD Operations for Courses
export const getCourses = async () => {
  try {
    const snapshot = await getDocs(collection(firestore, 'courses'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting courses:', error);
    throw error;
  }
};

export const addCourse = async (data, userId = null, userName = null) => {
  try {
    const courseData = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (userId) {
      courseData.createdBy = userId;
      courseData.createdByName = userName;
    }

    const docRef = await addDoc(collection(firestore, 'courses'), courseData);
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error('Error adding course:', error);
    throw error;
  }
};

export const updateCourse = async (id, data) => {
  try {
    await updateDoc(doc(firestore, 'courses', id), {
      ...data,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
};

export const deleteCourse = async (id) => {
  try {
    await deleteDoc(doc(firestore, 'courses', id));
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
};

// Job Postings Operations
export const getJobPostings = async () => {
  try {
    const snapshot = await getDocs(collection(firestore, 'jobPostings'));
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
    }));
  } catch (error) {
    console.error('Error getting job postings:', error);
    throw error;
  }
};

export const addJobPosting = async (data, userId = null) => {
  try {
    const jobData = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (userId) {
      jobData.postedBy = userId;
    }

    const docRef = await addDoc(collection(firestore, 'jobPostings'), jobData);
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error('Error adding job posting:', error);
    throw error;
  }
};

export const updateJobPosting = async (id, data) => {
  try {
    await updateDoc(doc(firestore, 'jobPostings', id), {
      ...data,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating job posting:', error);
    throw error;
  }
};

export const deleteJobPosting = async (id) => {
  try {
    await deleteDoc(doc(firestore, 'jobPostings', id));
  } catch (error) {
    console.error('Error deleting job posting:', error);
    throw error;
  }
};

// Applications Operations
export const getApplications = async (userId = null) => {
  try {
    const applicationsRef = collection(firestore, 'applications');
    let querySnapshot;
    
    if (userId) {
      const q = query(applicationsRef, where('studentId', '==', userId));
      querySnapshot = await getDocs(q);
    } else {
      querySnapshot = await getDocs(applicationsRef);
    }
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Safely handle nested objects
      const safeData = {
        ...data,
        // Ensure review object is safely structured
        review: data.review ? {
          reviewedByName: data.review.reviewedByName || '',
          status: data.review.status || '',
          updatedAt: data.review.updatedAt || null,
          reviewedBy: data.review.reviewedBy || ''
        } : null,
        // Ensure decision object is safely structured
        decision: data.decision ? {
          decisionStatus: data.decision.decisionStatus || '',
          comments: data.decision.comments || '',
          decisionDate: data.decision.decisionDate || null
        } : null
      };
      
      return { 
        id: doc.id, 
        ...safeData,
        appliedAt: data.appliedAt?.toDate?.() || data.appliedAt,
        createdAt: data.createdAt?.toDate?.() || data.createdAt
      };
    });
  } catch (error) {
    console.error('Error getting applications:', error);
    throw error;
  }
};

export const submitApplication = async (data) => {
  try {
    console.log('Submitting application:', data);
    
    const applicationData = {
      ...data,
      createdAt: new Date(),
      status: 'pending'
    };

    const docRef = await addDoc(collection(firestore, 'applications'), applicationData);
    console.log('Application submitted with ID:', docRef.id);
    
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error('Error submitting application:', error);
    throw error;
  }
};

export const submitJobApplication = async (data) => {
  try {
    console.log('Submitting job application:', data);
    
    const applicationData = {
      ...data,
      type: 'job',
      createdAt: new Date(),
      status: 'pending',
      applicationType: 'job'
    };

    const docRef = await addDoc(collection(firestore, 'applications'), applicationData);
    console.log('Job application created with ID:', docRef.id);
    
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error('Error submitting job application:', error);
    throw error;
  }
};

// Users Operations
export const getUsers = async () => {
  try {
    const snapshot = await getDocs(collection(firestore, 'users'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
};

export const getStudents = async () => {
  try {
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where('role', '==', 'student'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting students:', error);
    throw error;
  }
};

export const updateUser = async (id, data) => {
  try {
    await updateDoc(doc(firestore, 'users', id), {
      ...data,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Company Management Functions
export const getCompanies = async () => {
  try {
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where('role', '==', 'company'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting companies:', error);
    throw error;
  }
};

export const updateCompany = async (id, data) => {
  try {
    await updateDoc(doc(firestore, 'users', id), {
      ...data,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating company:', error);
    throw error;
  }
};

export const deleteCompany = async (id) => {
  try {
    await deleteDoc(doc(firestore, 'users', id));
  } catch (error) {
    console.error('Error deleting company:', error);
    throw error;
  }
};

// =============================================
// ENHANCED DOCUMENT MANAGEMENT FUNCTIONS
// =============================================

// Company Document Management with Enhanced Debugging
export const uploadCompanyDocument = async (companyId, documentData) => {
  try {
    console.log('🚀 Starting Firestore document upload...');
    console.log('📄 Document data:', {
      companyId,
      name: documentData.name,
      type: documentData.type,
      size: documentData.size,
      url: documentData.url ? 'URL present' : 'No URL'
    });

    const documentsRef = collection(firestore, 'companyDocuments');
    const document = {
      ...documentData,
      companyId,
      uploadedAt: new Date(),
      status: 'active',
      documentType: documentData.documentType || 'general',
      category: documentData.category || 'verification',
      firestoreTimestamp: new Date() // Additional timestamp for debugging
    };
    
    console.log('📦 Prepared document for Firestore:', document);

    const docRef = await addDoc(documentsRef, document);
    
    console.log('✅ Firestore document upload SUCCESSFUL!', {
      documentId: docRef.id,
      companyId,
      name: documentData.name,
      type: documentData.type,
      size: documentData.size,
      timestamp: new Date().toISOString()
    });
    
    const result = { 
      id: docRef.id, 
      ...document,
      uploadedAt: document.uploadedAt
    };

    // Verify the document was actually saved
    console.log('🔍 Verifying document save...');
    const verifyQuery = query(documentsRef, where('__name__', '==', docRef.id));
    const verifySnapshot = await getDocs(verifyQuery);
    
    if (!verifySnapshot.empty) {
      console.log('✅ Document verification PASSED - Document exists in Firestore');
    } else {
      console.error('❌ Document verification FAILED - Document not found in Firestore');
    }
    
    return result;
  } catch (error) {
    console.error('💥 CRITICAL: Error uploading company document to Firestore:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    throw error;
  }
};

export const getCompanyDocuments = async (companyId) => {
  try {
    console.log(`🔍 Fetching documents for company: ${companyId}`);
    
    const documentsRef = collection(firestore, 'companyDocuments');
    const q = query(
      documentsRef, 
      where('companyId', '==', companyId),
      orderBy('uploadedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    const documents = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      uploadedAt: doc.data().uploadedAt?.toDate?.() || doc.data().uploadedAt
    }));
    
    console.log(`✅ Retrieved ${documents.length} documents for company ${companyId}`);
    documents.forEach(doc => {
      console.log(`   - ${doc.name} (${doc.id}) - ${doc.uploadedAt}`);
    });
    
    return documents;
  } catch (error) {
    console.error('Error getting company documents:', error);
    throw error;
  }
};

export const deleteCompanyDocument = async (documentId) => {
  try {
    await deleteDoc(doc(firestore, 'companyDocuments', documentId));
    console.log('Company document deleted from Firestore:', documentId);
  } catch (error) {
    console.error('Error deleting company document:', error);
    throw error;
  }
};

export const updateCompanyDocument = async (documentId, data) => {
  try {
    await updateDoc(doc(firestore, 'companyDocuments', documentId), {
      ...data,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating company document:', error);
    throw error;
  }
};

// Enhanced document verification function
export const verifyDocumentUpload = async (companyId, expectedDocumentCount = null) => {
  try {
    console.log('🔍 VERIFYING DOCUMENT UPLOAD STATUS');
    console.log('Company ID:', companyId);
    
    const documents = await getCompanyDocuments(companyId);
    
    console.log('📊 DOCUMENT VERIFICATION REPORT:');
    console.log(`Total documents in database: ${documents.length}`);
    
    if (expectedDocumentCount !== null) {
      console.log(`Expected documents: ${expectedDocumentCount}`);
      console.log(`Verification: ${documents.length === expectedDocumentCount ? 'PASSED ✅' : 'FAILED ❌'}`);
    }
    
    documents.forEach((doc, index) => {
      console.log(`Document ${index + 1}:`);
      console.log(`  - ID: ${doc.id}`);
      console.log(`  - Name: ${doc.name}`);
      console.log(`  - Type: ${doc.type}`);
      console.log(`  - Size: ${doc.size} bytes`);
      console.log(`  - Uploaded: ${doc.uploadedAt}`);
      console.log(`  - URL: ${doc.url ? 'Present' : 'Missing'}`);
    });
    
    return {
      success: true,
      totalDocuments: documents.length,
      documents: documents,
      verificationPassed: expectedDocumentCount === null || documents.length === expectedDocumentCount
    };
  } catch (error) {
    console.error('Error during document verification:', error);
    return {
      success: false,
      error: error.message,
      totalDocuments: 0,
      documents: []
    };
  }
};

// Test document upload function
export const testDocumentUpload = async (companyId, companyName) => {
  try {
    console.log('🧪 TESTING DOCUMENT UPLOAD FUNCTIONALITY');
    
    const testDocument = {
      name: 'test-document.pdf',
      type: 'application/pdf',
      size: 1024,
      url: 'https://example.com/test.pdf',
      uploadedAt: new Date().toISOString(),
      companyId: companyId,
      companyName: companyName,
      status: 'active',
      storagePath: 'test/path.pdf',
      documentType: 'test',
      category: 'test'
    };
    
    console.log('📝 Testing Firestore document storage...');
    const result = await uploadCompanyDocument(companyId, testDocument);
    console.log('✅ Test document stored successfully:', result);
    
    // Verify it's in the database
    const docs = await getCompanyDocuments(companyId);
    console.log('📋 Documents in database after test:', docs.length);
    
    // Clean up test document
    await deleteCompanyDocument(result.id);
    console.log('🧹 Test document cleaned up');
    
    return {
      testPassed: true,
      documentId: result.id,
      totalDocuments: docs.length
    };
  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      testPassed: false,
      error: error.message
    };
  }
};

// Student Document Management
export const uploadStudentDocument = async (studentId, documentData) => {
  try {
    const documentsRef = collection(firestore, 'studentDocuments');
    const document = {
      ...documentData,
      studentId,
      uploadedAt: new Date(),
      status: 'active',
      documentType: documentData.documentType || 'academic'
    };
    
    const docRef = await addDoc(documentsRef, document);
    return { id: docRef.id, ...document };
  } catch (error) {
    console.error('Error uploading student document:', error);
    throw error;
  }
};

export const getStudentDocuments = async (studentId) => {
  try {
    const documentsRef = collection(firestore, 'studentDocuments');
    const q = query(documentsRef, where('studentId', '==', studentId));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      uploadedAt: doc.data().uploadedAt?.toDate?.() || doc.data().uploadedAt
    }));
  } catch (error) {
    console.error('Error getting student documents:', error);
    throw error;
  }
};

export const deleteStudentDocument = async (documentId) => {
  try {
    await deleteDoc(doc(firestore, 'studentDocuments', documentId));
  } catch (error) {
    console.error('Error deleting student document:', error);
    throw error;
  }
};

// General Document Management (for all users)
export const getUserDocuments = async (userId, userRole) => {
  try {
    if (userRole === 'company') {
      return await getCompanyDocuments(userId);
    } else if (userRole === 'student') {
      return await getStudentDocuments(userId);
    } else {
      throw new Error('Invalid user role for document retrieval');
    }
  } catch (error) {
    console.error('Error getting user documents:', error);
    throw error;
  }
};

// Document Categories and Types
export const getDocumentCategories = () => {
  return [
    { value: 'verification', label: 'Verification Documents', types: ['registration', 'license', 'certificate'] },
    { value: 'financial', label: 'Financial Documents', types: ['bank_statement', 'tax_return', 'financial_report'] },
    { value: 'legal', label: 'Legal Documents', types: ['contract', 'agreement', 'compliance'] },
    { value: 'academic', label: 'Academic Documents', types: ['transcript', 'diploma', 'certificate'] },
    { value: 'professional', label: 'Professional Documents', types: ['resume', 'portfolio', 'recommendation'] },
    { value: 'general', label: 'General Documents', types: ['other', 'miscellaneous'] }
  ];
};

export const getDocumentTypesByCategory = (category) => {
  const categories = getDocumentCategories();
  const foundCategory = categories.find(cat => cat.value === category);
  return foundCategory ? foundCategory.types : ['other'];
};

// =============================================
// ADMISSIONS OPERATIONS
// =============================================

export const addAdmission = async (data, userId = null, userName = null) => {
  try {
    const admissionData = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (userId) {
      admissionData.publishedBy = userId;
      admissionData.publishedByName = userName;
    }

    const docRef = await addDoc(collection(firestore, 'admissions'), admissionData);
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error('Error adding admission:', error);
    throw error;
  }
};

export const getAdmissions = async () => {
  try {
    const snapshot = await getDocs(collection(firestore, 'admissions'));
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      publishedAt: doc.data().publishedAt?.toDate?.() || doc.data().publishedAt,
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
    }));
  } catch (error) {
    console.error('Error getting admissions:', error);
    throw error;
  }
};

export const updateAdmission = async (id, data) => {
  try {
    await updateDoc(doc(firestore, 'admissions', id), {
      ...data,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating admission:', error);
    throw error;
  }
};

export const deleteAdmission = async (id) => {
  try {
    await deleteDoc(doc(firestore, 'admissions', id));
  } catch (error) {
    console.error('Error deleting admission:', error);
    throw error;
  }
};

// =============================================
// APPLICATION DECISIONS OPERATIONS
// =============================================

export const addApplicationDecision = async (data, userId = null, userName = null) => {
  try {
    const decisionData = {
      ...data,
      decidedAt: new Date()
    };

    if (userId) {
      decisionData.decidedBy = userId;
      decisionData.decidedByName = userName;
    }

    const docRef = await addDoc(collection(firestore, 'applicationDecisions'), decisionData);
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error('Error adding application decision:', error);
    throw error;
  }
};

// =============================================
// COMPANY-SPECIFIC OPERATIONS
// =============================================

export const getCompanyJobPostings = async (companyId) => {
  try {
    const jobsRef = collection(firestore, 'jobPostings');
    const q = query(jobsRef, where('postedBy', '==', companyId));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
    }));
  } catch (error) {
    console.error('Error getting company job postings:', error);
    throw error;
  }
};

export const getApplicationsForCompany = async (companyId) => {
  try {
    const applicationsRef = collection(firestore, 'applications');
    const q = query(applicationsRef, where('companyId', '==', companyId));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      appliedAt: doc.data().appliedAt?.toDate?.() || doc.data().appliedAt,
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
    }));
  } catch (error) {
    console.error('Error getting applications for company:', error);
    throw error;
  }
};

// Update application status
export const updateApplicationStatus = async (applicationId, status) => {
  try {
    await updateDoc(doc(firestore, 'applications', applicationId), {
      status: status,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    throw error;
  }
};

// =============================================
// USER-SPECIFIC DATA
// =============================================

export const getUserApplications = async (userId) => {
  return getApplications(userId);
};

export const getUserJobApplications = async (userId) => {
  try {
    const applicationsRef = collection(firestore, 'applications');
    const q = query(
      applicationsRef, 
      where('studentId', '==', userId),
      where('type', '==', 'job')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      appliedAt: doc.data().appliedAt?.toDate?.() || doc.data().appliedAt
    }));
  } catch (error) {
    console.error('Error getting user job applications:', error);
    throw error;
  }
};

export const getUserCourseApplications = async (userId) => {
  try {
    const applicationsRef = collection(firestore, 'applications');
    const q = query(
      applicationsRef, 
      where('studentId', '==', userId),
      where('type', '==', 'admission')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      appliedAt: doc.data().appliedAt?.toDate?.() || doc.data().appliedAt
    }));
  } catch (error) {
    console.error('Error getting user course applications:', error);
    throw error;
  }
};

// =============================================
// STUDENT PROFILE OPERATIONS
// =============================================

export const getStudentProfile = async (studentId) => {
  try {
    const usersRef = collection(firestore, 'users');
    const q = query(
      usersRef, 
      where('role', '==', 'student'),
      where('uid', '==', studentId)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  } catch (error) {
    console.error('Error getting student profile:', error);
    throw error;
  }
};

export const updateStudentProfile = async (studentId, data) => {
  try {
    // First find the student document
    const usersRef = collection(firestore, 'users');
    const q = query(
      usersRef, 
      where('role', '==', 'student'),
      where('uid', '==', studentId)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      throw new Error('Student not found');
    }
    
    const studentDoc = snapshot.docs[0];
    await updateDoc(doc(firestore, 'users', studentDoc.id), {
      ...data,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating student profile:', error);
    throw error;
  }
};

// =============================================
// QUALIFIED APPLICANT FILTERING
// =============================================

export const getQualifiedApplicants = async (jobId) => {
  try {
    // Get the job posting
    const jobDoc = await getDocs(query(
      collection(firestore, 'jobPostings'), 
      where('id', '==', jobId)
    ));
    
    if (jobDoc.empty) {
      throw new Error('Job posting not found');
    }
    
    const job = { id: jobDoc.docs[0].id, ...jobDoc.docs[0].data() };
    
    // Get applications for this job
    const applicationsRef = collection(firestore, 'applications');
    const applicationsQuery = query(
      applicationsRef, 
      where('jobId', '==', jobId),
      where('status', '==', 'pending')
    );
    const applicationsSnapshot = await getDocs(applicationsQuery);
    
    const applications = applicationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      appliedAt: doc.data().appliedAt?.toDate?.() || doc.data().appliedAt
    }));
    
    // Get student profiles for these applications
    const qualifiedApplicants = [];
    
    for (const app of applications) {
      const studentProfile = await getStudentProfile(app.studentId);
      if (studentProfile) {
        const score = calculateApplicantScore(studentProfile, job);
        if (score >= 70) { // 70% threshold for qualification
          qualifiedApplicants.push({
            application: app,
            student: studentProfile,
            qualificationScore: score,
            breakdown: calculateScoreBreakdown(studentProfile, job)
          });
        }
      }
    }
    
    // Sort by qualification score (descending)
    return qualifiedApplicants.sort((a, b) => b.qualificationScore - a.qualificationScore);
  } catch (error) {
    console.error('Error getting qualified applicants:', error);
    throw error;
  }
};

// Helper function to calculate applicant score
const calculateApplicantScore = (student, job) => {
  let score = 0;
  
  // Academic Performance (30 points max)
  score += calculateAcademicScore(student);
  
  // Certificates (20 points max)
  score += calculateCertificateScore(student);
  
  // Work Experience (25 points max)
  score += calculateExperienceScore(student, job);
  
  // Job Relevance (25 points max)
  score += calculateRelevanceScore(student, job);
  
  return Math.min(100, score);
};

const calculateAcademicScore = (student) => {
  let score = 0;
  
  // GPA-based scoring
  if (student.gpa) {
    const gpa = parseFloat(student.gpa);
    if (gpa >= 3.5) score += 25;
    else if (gpa >= 3.0) score += 20;
    else if (gpa >= 2.5) score += 15;
    else if (gpa >= 2.0) score += 10;
  }
  
  // Academic achievements
  if (student.academicAchievements) {
    const achievements = Array.isArray(student.academicAchievements) 
      ? student.academicAchievements 
      : [student.academicAchievements];
    score += Math.min(5, achievements.length * 2);
  }
  
  return Math.min(30, score);
};

const calculateCertificateScore = (student) => {
  let score = 0;
  
  // Certificates count and relevance
  if (student.certificates) {
    const certificates = Array.isArray(student.certificates) 
      ? student.certificates 
      : [student.certificates];
    score += Math.min(15, certificates.length * 3);
  }
  
  // Professional certifications
  if (student.professionalCertifications) {
    const certs = Array.isArray(student.professionalCertifications)
      ? student.professionalCertifications
      : [student.professionalCertifications];
    score += Math.min(5, certs.length * 2.5);
  }
  
  return Math.min(20, score);
};

const calculateExperienceScore = (student, job) => {
  let score = 0;
  
  // Work experience duration
  if (student.workExperience) {
    const experiences = Array.isArray(student.workExperience)
      ? student.workExperience
      : [student.workExperience];
    
    const totalMonths = experiences.reduce((total, exp) => {
      const months = exp.durationMonths || (exp.duration ? parseInt(exp.duration) : 6);
      return total + months;
    }, 0);
    
    if (totalMonths >= 24) score += 15;
    else if (totalMonths >= 12) score += 12;
    else if (totalMonths >= 6) score += 8;
    else if (totalMonths >= 3) score += 5;
  }
  
  // Relevant industry experience
  if (student.industryExperience && job.requiredSkills) {
    const jobSkills = job.requiredSkills.toLowerCase().split(',').map(s => s.trim());
    const studentSkills = Array.isArray(student.industryExperience)
      ? student.industryExperience
      : [student.industryExperience];
    
    const matchingSkills = studentSkills.filter(skill => 
      jobSkills.some(jobSkill => skill.toLowerCase().includes(jobSkill))
    );
    score += Math.min(10, matchingSkills.length * 2);
  }
  
  return Math.min(25, score);
};

const calculateRelevanceScore = (student, job) => {
  let score = 0;
  
  // Skills match
  if (student.skills && job.requiredSkills) {
    const jobSkills = job.requiredSkills.toLowerCase().split(',').map(s => s.trim());
    const studentSkills = Array.isArray(student.skills) 
      ? student.skills 
      : student.skills.split(',').map(s => s.trim());
    
    const matchingSkills = studentSkills.filter(skill => 
      jobSkills.some(jobSkill => skill.toLowerCase().includes(jobSkill))
    );
    score += Math.min(15, matchingSkills.length * 3);
  }
  
  // Education relevance
  if (student.courseOfStudy && job.qualifications) {
    const jobQualifications = job.qualifications.toLowerCase();
    const studentCourse = student.courseOfStudy.toLowerCase();
    
    if (jobQualifications.includes(studentCourse) || 
        studentCourse.includes(jobQualifications.split(' ')[0])) {
      score += 10;
    }
  }
  
  return Math.min(25, score);
};

const calculateScoreBreakdown = (student, job) => {
  return {
    academicScore: calculateAcademicScore(student),
    certificateScore: calculateCertificateScore(student),
    experienceScore: calculateExperienceScore(student, job),
    relevanceScore: calculateRelevanceScore(student, job)
  };
};

// =============================================
// SYSTEM REPORTS FUNCTIONS
// =============================================

export const generateUserReport = async () => {
  try {
    const users = await getUsers();
    const companies = await getCompanies();
    const students = await getStudents();
    
    const userStats = {
      total: users.length,
      byRole: users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {}),
      active: users.filter(u => u.status === 'active').length,
      inactive: users.filter(u => u.status === 'inactive').length,
      last30Days: users.filter(u => {
        const userDate = new Date(u.createdAt?.seconds * 1000 || u.createdAt);
        return userDate > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      }).length
    };

    const companyStats = {
      total: companies.length,
      approved: companies.filter(c => c.status === 'approved').length,
      pending: companies.filter(c => c.status === 'pending').length,
      suspended: companies.filter(c => c.status === 'suspended').length
    };

    const studentStats = {
      total: students.length,
      byInstitution: students.reduce((acc, student) => {
        const institution = student.institution || 'Unknown';
        acc[institution] = (acc[institution] || 0) + 1;
        return acc;
      }, {}),
      averageGPA: students.reduce((sum, student) => {
        return sum + (parseFloat(student.gpa) || 0);
      }, 0) / students.length
    };

    return {
      type: 'user_analytics',
      title: 'User Analytics Report',
      description: 'Comprehensive analysis of user registrations and demographics',
      data: {
        userStats,
        companyStats,
        studentStats,
        generatedAt: new Date().toISOString()
      },
      downloadUrl: null
    };
  } catch (error) {
    console.error('Error generating user report:', error);
    throw error;
  }
};

export const generateJobReport = async () => {
  try {
    const jobPostings = await getJobPostings();
    const applications = await getApplications();
    
    const jobStats = {
      total: jobPostings.length,
      active: jobPostings.filter(j => j.status === 'active').length,
      expired: jobPostings.filter(j => {
        const expiryDate = new Date(j.expiryDate || j.createdAt);
        return expiryDate < new Date();
      }).length,
      byCompany: jobPostings.reduce((acc, job) => {
        acc[job.company] = (acc[job.company] || 0) + 1;
        return acc;
      }, {})
    };

    const applicationStats = {
      total: applications.length,
      byStatus: applications.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      }, {}),
      byType: applications.reduce((acc, app) => {
        const type = app.applicationType || app.type || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {})
    };

    return {
      type: 'job_analytics',
      title: 'Job Market Analytics Report',
      description: 'Analysis of job postings and application trends',
      data: {
        jobStats,
        applicationStats,
        generatedAt: new Date().toISOString()
      },
      downloadUrl: null
    };
  } catch (error) {
    console.error('Error generating job report:', error);
    throw error;
  }
};

export const generateAdmissionReport = async () => {
  try {
    const admissions = await getAdmissions();
    const institutions = await getInstitutions();
    
    const admissionStats = {
      total: admissions.length,
      active: admissions.filter(a => a.status === 'active').length,
      published: admissions.filter(a => a.published).length,
      byInstitution: admissions.reduce((acc, admission) => {
        acc[admission.institution] = (acc[admission.institution] || 0) + 1;
        return acc;
      }, {})
    };

    const institutionStats = {
      total: institutions.length,
      active: institutions.filter(i => i.status === 'active').length,
      withAdmissions: institutions.filter(inst => 
        admissions.some(adm => adm.institution === inst.id || adm.institution === inst.name)
      ).length
    };

    return {
      type: 'admission_analytics',
      title: 'Admission Analytics Report',
      description: 'Analysis of admission trends and institutional performance',
      data: {
        admissionStats,
        institutionStats,
        generatedAt: new Date().toISOString()
      },
      downloadUrl: null
    };
  } catch (error) {
    console.error('Error generating admission report:', error);
    throw error;
  }
};

export const generateDocumentReport = async () => {
  try {
    const companyDocuments = await getDocs(collection(firestore, 'companyDocuments'));
    const studentDocuments = await getDocs(collection(firestore, 'studentDocuments'));
    
    const documentStats = {
      totalCompanyDocuments: companyDocuments.size,
      totalStudentDocuments: studentDocuments.size,
      companyDocumentsByType: companyDocuments.docs.reduce((acc, doc) => {
        const type = doc.data().documentType || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {}),
      studentDocumentsByType: studentDocuments.docs.reduce((acc, doc) => {
        const type = doc.data().documentType || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {})
    };

    return {
      type: 'document_analytics',
      title: 'Document Management Report',
      description: 'Analysis of document uploads and management',
      data: {
        documentStats,
        generatedAt: new Date().toISOString()
      },
      downloadUrl: null
    };
  } catch (error) {
    console.error('Error generating document report:', error);
    throw error;
  }
};

export const generateSystemHealthReport = async () => {
  try {
    const dbStatus = await checkDatabaseStatus();
    const users = await getUsers();
    const jobPostings = await getJobPostings();
    const admissions = await getAdmissions();
    const applications = await getApplications();
    
    const systemStats = {
      database: dbStatus,
      uptime: process.uptime(),
      totalRecords: {
        users: users.length,
        jobPostings: jobPostings.length,
        admissions: admissions.length,
        applications: applications.length
      },
      collectionHealth: Object.entries(dbStatus).reduce((acc, [collection, status]) => {
        acc[collection] = status.exists ? 'Healthy' : 'Empty';
        return acc;
      }, {})
    };

    return {
      type: 'system_health',
      title: 'System Health Report',
      description: 'Comprehensive system health and performance metrics',
      data: {
        systemStats,
        generatedAt: new Date().toISOString(),
        serverTime: new Date().toISOString()
      },
      downloadUrl: null
    };
  } catch (error) {
    console.error('Error generating system health report:', error);
    throw error;
  }
};

export const getSystemReports = async () => {
  try {
    return [
      {
        id: 'user_report',
        type: 'user_analytics',
        title: 'User Analytics',
        description: 'User registration and demographic analysis',
        canGenerate: true
      },
      {
        id: 'job_report',
        type: 'job_analytics',
        title: 'Job Market Analysis',
        description: 'Job postings and applications analysis',
        canGenerate: true
      },
      {
        id: 'admission_report',
        type: 'admission_analytics',
        title: 'Admission Statistics',
        description: 'Admission trends and institutional performance',
        canGenerate: true
      },
      {
        id: 'document_report',
        type: 'document_analytics',
        title: 'Document Management',
        description: 'Document uploads and management analysis',
        canGenerate: true
      },
      {
        id: 'system_health_report',
        type: 'system_health',
        title: 'System Health',
        description: 'System performance and database health',
        canGenerate: true
      }
    ];
  } catch (error) {
    console.error('Error getting system reports:', error);
    throw error;
  }
};

// =============================================
// DATABASE STATUS CHECK
// =============================================

export const checkDatabaseStatus = async () => {
  try {
    const collections = [
      'institutions', 
      'faculties', 
      'courses', 
      'users', 
      'jobPostings', 
      'applications', 
      'admissions', 
      'studentDocuments',
      'companyDocuments',
      'applicationDecisions'
    ];
    const status = {};
    
    for (const collectionName of collections) {
      const snapshot = await getDocs(collection(firestore, collectionName));
      status[collectionName] = {
        exists: !snapshot.empty,
        count: snapshot.size,
        sampleData: snapshot.empty ? null : snapshot.docs[0]?.data()
      };
    }
    
    return status;
  } catch (error) {
    console.error('Error checking database status:', error);
    throw error;
  }
};

// =============================================
// BULK OPERATIONS
// =============================================

export const bulkDeleteCompanyDocuments = async (companyId) => {
  try {
    const documents = await getCompanyDocuments(companyId);
    const batch = writeBatch(firestore);
    
    documents.forEach(doc => {
      const docRef = doc(firestore, 'companyDocuments', doc.id);
      batch.delete(docRef);
    });
    
    await batch.commit();
    console.log(`Deleted ${documents.length} documents for company ${companyId}`);
  } catch (error) {
    console.error('Error bulk deleting company documents:', error);
    throw error;
  }
};

export const exportCompanyDocuments = async (companyId) => {
  try {
    const documents = await getCompanyDocuments(companyId);
    const exportData = {
      exportedAt: new Date().toISOString(),
      companyId: companyId,
      totalDocuments: documents.length,
      documents: documents.map(doc => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        size: doc.size,
        uploadedAt: doc.uploadedAt,
        documentType: doc.documentType,
        category: doc.category,
        url: doc.url
      }))
    };
    
    return exportData;
  } catch (error) {
    console.error('Error exporting company documents:', error);
    throw error;
  }
};