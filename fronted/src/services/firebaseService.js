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
  limit,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { firestore, auth } from '../firebase/config';
import { createUserWithEmailAndPassword } from 'firebase/auth';

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
          ownerId: 'system'
        },
        { 
          name: 'Global Business Corp', 
          email: 'hr@globalbusiness.com', 
          industry: 'Consulting', 
          description: 'International business consulting firm',
          status: 'approved', 
          role: 'company',
          createdAt: new Date(),
          ownerId: 'system'
        },
        { 
          name: 'Innovate Labs', 
          email: 'careers@innovatelabs.com', 
          industry: 'Research & Development', 
          description: 'Cutting-edge research and development company',
          status: 'pending', 
          role: 'company',
          createdAt: new Date(),
          ownerId: 'system'
        }
      ];
      
      sampleCompanies.forEach(company => {
        const docRef = doc(companiesRef);
        batch.set(docRef, company);
      });
      await batch.commit();
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

// CRUD Operations for Institutions - COMPLETELY FIXED VERSION
export const getInstitutions = async () => {
  try {
    const snapshot = await getDocs(collection(firestore, 'institutions'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting institutions:', error);
    throw error;
  }
};

export const addInstitution = async (data, password = null) => {
  try {
    console.log('Adding institution to Firestore:', data);
    console.log('Password provided:', password ? 'Yes' : 'No');

    const institutionData = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // First, add to institutions collection
    const docRef = await addDoc(collection(firestore, 'institutions'), institutionData);
    const institutionId = docRef.id;
    
    console.log('Institution created with ID:', institutionId);

    // If password is provided, create a user account for the institution with role "institute"
    if (password) {
      try {
        console.log('Creating user account for institution with role "institute"...');
        
        // Create user account with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, password);
        const user = userCredential.user;
        
        console.log('User account created for institution:', user.uid);

        // Add user record to Firestore users collection with role "institute"
        // FIXED: Use setDoc with the Firebase Auth UID as the document ID
        const userData = {
          uid: user.uid,
          name: data.name,
          email: data.email,
          role: 'institute', // Set role to "institute"
          institutionId: institutionId,
          status: data.status || 'active',
          contactPerson: data.contactPerson || '',
          phone: data.phone || '',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        // FIXED: Use setDoc instead of addDoc to create document with specific ID
        await setDoc(doc(firestore, 'users', user.uid), userData);
        console.log('User record added to Firestore for institution with role "institute"');

      } catch (authError) {
        console.error('Error creating user account for institution:', authError);
        // If user creation fails but institution was created, we should delete the institution
        await deleteDoc(doc(firestore, 'institutions', institutionId));
        throw authError;
      }
    }

    return { id: institutionId, ...data };
  } catch (error) {
    console.error('Error adding institution:', error);
    throw error;
  }
};

export const updateInstitution = async (id, data) => {
  try {
    console.log('Updating institution:', id, data);

    const updateData = {
      ...data,
      updatedAt: new Date()
    };

    // Remove password from update data as it's handled separately
    const { password, ...institutionUpdateData } = updateData;

    // Update institution in Firestore
    await updateDoc(doc(firestore, 'institutions', id), institutionUpdateData);

    // If password is provided, we need to update the user's password
    // Note: This requires the Firebase Admin SDK on the backend for security
    // For now, we'll just log this requirement
    if (password) {
      console.log('Password update requested for institution. This requires backend implementation.');
      
      // Try to find the associated user and update their password
      try {
        const institutionDoc = await getDoc(doc(firestore, 'institutions', id));
        if (institutionDoc.exists()) {
          const institutionData = institutionDoc.data();
          const usersRef = collection(firestore, 'users');
          const q = query(usersRef, 
            where('email', '==', institutionData.email),
            where('role', '==', 'institute')
          );
          const userSnapshot = await getDocs(q);
          
          if (!userSnapshot.empty) {
            console.log('Found associated user account. Password update would be handled here.');
            // Note: Actual password update requires Firebase Admin SDK
          }
        }
      } catch (userError) {
        console.warn('Could not find associated user account for password update:', userError);
      }
    }

    console.log('Institution updated successfully');
  } catch (error) {
    console.error('Error updating institution:', error);
    throw error;
  }
};

export const deleteInstitution = async (id) => {
  try {
    // First get the institution data to find the associated email
    const institutionDoc = await getDoc(doc(firestore, 'institutions', id));
    if (!institutionDoc.exists()) {
      throw new Error('Institution not found');
    }

    const institutionData = institutionDoc.data();
    
    // Delete the institution
    await deleteDoc(doc(firestore, 'institutions', id));
    
    // Try to find and delete the associated user account
    try {
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, 
        where('email', '==', institutionData.email),
        where('role', '==', 'institute') // Look for institute role
      );
      const userSnapshot = await getDocs(q);
      
      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        await deleteDoc(doc(firestore, 'users', userDoc.id));
        console.log('Associated user account deleted');
        
        // Note: To delete the Firebase Auth user, you need Admin SDK on backend
        console.log('Note: Firebase Auth user deletion requires backend implementation');
      }
    } catch (userError) {
      console.warn('Could not delete associated user account:', userError);
      // Continue even if user deletion fails
    }
    
    console.log('Institution deleted successfully');
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
    
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      appliedAt: doc.data().appliedAt?.toDate?.() || doc.data().appliedAt,
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
    }));
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

// Admissions Operations
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

// Application Decisions Operations
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

// Company-specific operations
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

// Get user-specific data
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

// Student Profile Operations
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

// Document Management
export const uploadStudentDocument = async (studentId, documentData) => {
  try {
    const documentsRef = collection(firestore, 'studentDocuments');
    const document = {
      ...documentData,
      studentId,
      uploadedAt: new Date(),
      status: 'active'
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

// System Reports Functions
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

// Check database status
export const checkDatabaseStatus = async () => {
  try {
    const collections = ['institutions', 'faculties', 'courses', 'users', 'jobPostings', 'applications', 'admissions', 'studentDocuments'];
    const status = {};
    
    for (const collectionName of collections) {
      const snapshot = await getDocs(collection(firestore, collectionName));
      status[collectionName] = {
        exists: !snapshot.empty,
        count: snapshot.size
      };
    }
    
    return status;
  } catch (error) {
    console.error('Error checking database status:', error);
    throw error;
  }
};