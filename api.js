// Utility function for making API calls
const makeApiCall = async (url, method, data) => {
    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || 'An error occurred');
        }
        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

// Utility function for file uploads
const uploadFiles = async (url, formData) => {
    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error || 'An error occurred');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Upload Error:', error);
        throw error;
    }
};

// Student Information Form Handler
const handleStudentForm = () => {
    const form = document.getElementById('studentForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const studentData = {
            roll_no: form.roll_no.value,
            stud_name: form.stud_name.value,
            aadhar_no: form.aadhar_no.value,
            phone_no: form.phone_no.value,
            email: form.email.value,
            address: form.address.value,
            abc: form.abc.value,
            blood_group: form.blood_group.value
        };

        try {
            const result = await makeApiCall('http://localhost:3306/api/student', 'POST', studentData);
            alert('Student information saved successfully!');
            form.reset();
        } catch (error) {
            alert(error.message);
        }
    });
};



// Fee Receipt Form Handler
const handleReceiptForm = () => {
    const form = document.getElementById('feeReceiptForm');
    const statusMessage = document.getElementById('status-message');
    
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        statusMessage.textContent = 'Uploading...';
        
        try {
            // Validate inputs
            const rollNo = form.roll_no.value.trim();
            const fileInput = form.receipt_pdf;
            
            if (!rollNo) {
                throw new Error('Please enter a Roll Number');
            }
            
            if (!fileInput.files || !fileInput.files[0]) {
                throw new Error('Please select a PDF file');
            }

            // Create FormData
            const formData = new FormData();
            formData.append('roll_no', rollNo);
            formData.append('receipt_pdf', fileInput.files[0]);

            // Make the upload request
            const response = await fetch('http://localhost:3000/api/receipt', {
                method: 'POST',
                body: formData // Don't set Content-Type header when sending FormData
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Error uploading receipt');
            }

            // Show success message
            statusMessage.textContent = 'Receipt uploaded successfully!';
            statusMessage.style.color = 'green';
            form.reset();

        } catch (error) {
            // Show error message
            statusMessage.textContent = error.message || 'Error uploading receipt';
            statusMessage.style.color = 'red';
            console.error('Upload error:', error);
        }
    });
};




// Semester Registration Form Handler
// In server.js, modify the registration endpoint
app.post('/api/registration', async (req, res) => {
    try {
        const studentExists = await checkStudentExists(req.body.roll_no);
        if (!studentExists) {
            return res.status(404).json({ error: 'Student not found. Please register student first.' });
        }

        const registrationData = {
            roll_no: req.body.roll_no,  // Changed from registrationID to roll_no
            semester: req.body.semester
        };

        conn.query('INSERT INTO semester_registration SET ?', registrationData, (err, result) => {
            if (err) {
                console.error('Error in semester registration:', err);
                res.status(500).json({ error: 'Error in semester registration' });
                return;
            }
            res.json({ message: 'Semester registration successful' });
        });
    } catch (err) {
        console.error('Error in registration:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Undertaking Forms Handler
const handleUndertakingForm = () => {
    const form = document.getElementById('undertakingForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('roll_no', form.roll_no.value);
        formData.append('scholarship', form.scholarship.files[0]);
        formData.append('aadhar', form.aadhar.files[0]);
        formData.append('antiragging', form.antiragging.files[0]);
        formData.append('abc', form.abc.files[0]);

        try {
            const result = await uploadFiles('http://localhost:3306/api/undertakings', formData);
            alert('Undertaking forms uploaded successfully!');
            form.reset();
        } catch (error) {
            alert(error.message);
        }
    });
};

// Function to fetch and display student information
const fetchStudentInfo = async (rollNo) => {
    try {
        const response = await fetch(`http://localhost:3306/api/student/${rollNo}`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch student information');
        }
        
        return data;
    } catch (error) {
        console.error('Error fetching student info:', error);
        throw error;
    }
};

// Admin login endpoint
app.post('/api/admin-login', (req, res) => {
    const { email, password } = req.body;
    // Validate admin credentials (this is just a placeholder)
    if (email === 'admin@gmail.com' && password === 'password') {
        res.status(200).json({ message: 'Login successful' });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Endpoint for fetching student data
app.get('/api/student/:rollNo', (req, res) => {
    const rollNo = req.params.rollNo;
    // Fetch student data from the database (placeholder)
    const studentData = {
        name: 'John Doe',
        rollNo: rollNo,
        course: 'Computer Science',
        semester: '5th'
    };
    res.status(200).json(studentData);
});

// Endpoint for adding a semester
app.post('/api/semesters', (req, res) => {
    const { name } = req.body;
    // Add semester to the database (placeholder)
    res.status(201).json({ name });
});

// Endpoint for file uploads
app.post('/api/upload-file', upload.single('file'), (req, res) => {
    // Handle file upload (placeholder)
    res.status(200).json({ message: 'File uploaded successfully' });
});

// Endpoint for uploading timetable
app.post('/api/upload-timetable', upload.single('file'), (req, res) => {
    const semesterId = req.body.semesterId;
    // Handle timetable upload (placeholder)
    res.status(200).json({ message: 'Timetable uploaded successfully for semester ' + semesterId });
});

// Endpoint for uploading courses
app.post('/api/upload-courses', upload.single('file'), (req, res) => {
    const semesterId = req.body.semesterId;
    // Handle courses upload (placeholder)
    res.status(200).json({ message: 'Courses uploaded successfully for semester ' + semesterId });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// Initialize all form handlers
document.addEventListener('DOMContentLoaded', () => {
    handleStudentForm();
    handleReceiptForm();
    handleRegistrationForm();
    handleUndertakingForm();
});

