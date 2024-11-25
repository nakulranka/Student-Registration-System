const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors');
const app = express();
app.use(cors());

// Define the port for Express server
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ 
        error: 'Internal server error', 
        details: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
});

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Database connection
const conn = mysql.createPool({
    connectionLimit: 10,
    host: '127.0.0.1',
    user: 'root',
    password: '#Nikss@3003',
    database: 'DBMS',
    port: 3306  // MySQL port
});

// Test database connection
conn.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Successfully connected to MySQL database');
    connection.release();
});

// Helper function to check if student exists
const checkStudentExists = (roll_no) => {
    return new Promise((resolve, reject) => {
        conn.query('SELECT roll_no FROM student_information WHERE roll_no = ?', [roll_no], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results.length > 0);
            }
        });
    });
};

// Student Information API
app.post('/api/student', (req, res) => {
    const studentData = {
        roll_no: req.body.roll_no,
        stud_name: req.body.name,
        aadhar_no: req.body.adhar_no,
        phone_no: req.body.phone_no,
        email: req.body.email_id,
        address: req.body.address,
        abc: req.body.abc_id,
        blood_group: req.body.blood_group
    };

    conn.getConnection((err, connection) => {
        if (err) {
            console.error('Error connecting to database:', err);
            res.status(500).json({ error: 'Error connecting to database' });
            return;
        }

        connection.beginTransaction();

        // Insert student data into student_information table
        connection.query('INSERT INTO student_information SET ?', studentData, (err, result) => {
            if (err) {
                connection.rollback();
                console.error('Database error:', err);
                if (err.code === 'ER_DUP_ENTRY') {
                    if (err.sqlMessage.includes('aadhar_no')) {
                        res.status(400).json({ error: 'Aadhar number already exists' });
                    } else {
                        res.status(400).json({ error: 'Roll number already exists' });
                    }
                } else {
                    res.status(500).json({ error: 'Error saving student information' });
                }
                connection.release();
                return;
            }

            // Insert approval status into student_approval table
            const approvalData = {
                roll_no: req.body.roll_no,
                status: 'pending'
            };

            connection.query('INSERT INTO student_approval SET ?', approvalData, (err, result) => {
                if (err) {
                    connection.rollback();
                    console.error('Error inserting approval status:', err);
                    res.status(500).json({ error: 'Error saving student approval status' });
                    connection.release();
                    return;
                }

                connection.commit();
                console.log('Student and approval data inserted successfully');
                res.json({ message: 'Student information saved successfully' });
                connection.release();
            });
        });
    });
});


// Get student information
app.get('/api/student/:roll_no', (req, res) => {
    const rollNo = req.params.roll_no;
    conn.query('SELECT * FROM student_information WHERE roll_no = ?', [rollNo], (err, results) => {
        if (err) {
            console.error('Error fetching student data:', err);
            res.status(500).json({ error: 'Error fetching student information' });
            return;
        }
        if (results.length === 0) {
            res.status(404).json({ error: 'Student not found' });
            return;
        }
        res.json(results[0]);
    });
});

// const upload = require('./path-to-multer-config-file');

// Update these endpoints in your server.js file

// Update the registration endpoint in server.js
app.post('/api/registration', async (req, res) => {
    // Log the incoming request body
    console.log('Received registration data:', req.body);
    
    try {
        const { roll_no, semester } = req.body;
        
        // Validate the input
        if (!roll_no || !semester) {
            return res.status(400).json({ error: 'Roll number and semester are required' });
        }

        // Check if student exists
        const studentExists = await checkStudentExists(roll_no);
        if (!studentExists) {
            return res.status(404).json({ error: 'Student not found. Please register student first.' });
        }

        // Create registration data object
        const registrationData = {
            roll_no: roll_no,
            semester: semester
        };

        // Log the data being inserted
        console.log('Inserting registration data:', registrationData);

        // Insert into database
        conn.query('INSERT INTO semester_registration SET ?', registrationData, (err, result) => {
            if (err) {
                console.error('Database error:', err);
                res.status(500).json({ error: 'Error in semester registration' });
                return;
            }
            console.log('Insert successful:', result);
            res.json({ message: 'Semester registration successful' });
        });
    } catch (err) {
        console.error('Error in registration:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get receipt status
app.get('/api/receipt/:roll_no', async (req, res) => {
    try {
        const [results] = await conn.promise().query(
            'SELECT roll_no, LENGTH(receipt_pdf) > 0 as has_receipt FROM receipt WHERE roll_no = ?',
            [req.params.roll_no]
        );

        if (results.length === 0) {
            return res.status(404).json({ 
                error: 'No receipt found for this roll number' 
            });
        }

        res.json(results[0]);

    } catch (err) {
        console.error('Error retrieving receipt:', err);
        res.status(500).json({ 
            error: 'Internal server error while retrieving receipt' 
        });
    }
});

// Download receipt endpoint
// Receipt Download Route
app.get('/api/receipt/:rollNo/download', async (req, res) => {
    try {
        const [results] = await conn.promise().query(
            'SELECT receipt_pdf FROM receipt WHERE roll_no = ?',
            [req.params.rollNo]
        );

        if (results.length === 0) {
            return res.status(404).json({ error: 'Receipt not found' });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="receipt_${req.params.rollNo}.pdf"`);
        res.end(results[0].receipt_pdf, 'binary');

    } catch (err) {
        console.error('Error downloading receipt:', err);
        res.status(500).json({ error: 'Internal server error while downloading receipt' });
    }
});

// Undertakings Download Route
app.get('/api/undertakings/:rollNo/download', async (req, res) => {
    try {
        const [results] = await conn.promise().query(
            'SELECT scholarship, aadhar, antiragging, abc FROM undertakings WHERE roll_no = ?',
            [req.params.rollNo]
        );

        if (results.length === 0) {
            return res.status(404).json({ error: 'Undertakings not found' });
        }

        const pdfBuffer = results[0].scholarship; // Assume `scholarship` as the PDF document or specify accordingly

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="undertakings_${req.params.rollNo}.pdf"`);
        res.end(pdfBuffer, 'binary');

    } catch (err) {
        console.error('Error downloading undertakings:', err);
        res.status(500).json({ error: 'Internal server error while downloading undertakings' });
    }
});





// 3. Semester Registration API
app.post('/api/registration', async (req, res) => {
    console.log('Received registration data:', req.body);
    
    try {
        const { roll_no, semester } = req.body;
        
        if (!roll_no || !semester) {
            return res.status(400).json({ error: 'Roll number and semester are required' });
        }

        const studentExists = await checkStudentExists(roll_no);
        if (!studentExists) {
            return res.status(404).json({ error: 'Student not found. Please register student first.' });
        }

        const registrationData = {
            roll_no: roll_no,
            semester: semester
        };

        conn.query('INSERT INTO semester_registration SET ?', registrationData, (err, result) => {
            if (err) {
                console.error('Database error:', err);
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

// 4. Undertaking Forms Upload API
app.post('/api/undertakings', upload.fields([
    { name: 'scholarship', maxCount: 1 },
    { name: 'aadhar', maxCount: 1 },
    { name: 'antiragging', maxCount: 1 },
    { name: 'abc', maxCount: 1 }
]), async (req, res) => {
    if (!req.files || !req.files.scholarship || !req.files.aadhar || 
        !req.files.antiragging || !req.files.abc) {
        return res.status(400).json({ error: 'All files are required' });
    }

    try {
        const studentExists = await checkStudentExists(req.body.roll_no);
        if (!studentExists) {
            return res.status(404).json({ error: 'Student not found. Please register student first.' });
        }

        const undertakingData = {
            roll_no: req.body.roll_no,
            scholarship: req.files.scholarship[0].buffer,
            aadhar: req.files.aadhar[0].buffer,
            antiragging: req.files.antiragging[0].buffer,
            abc: req.files.abc[0].buffer
        };

        conn.query('INSERT INTO undertakings SET ?', undertakingData, (err, result) => {
            if (err) {
                console.error('Error uploading undertaking forms:', err);
                res.status(500).json({ error: 'Error uploading undertaking forms' });
                return;
            }
            res.json({ message: 'Undertaking forms uploaded successfully' });
        });
    } catch (err) {
        console.error('Error in undertakings upload:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get student information
// Get all students
app.get('/api/students', (req, res) => {
    conn.query('SELECT * FROM student_information', (err, results) => {
        if (err) {
            console.error('Error fetching students:', err);
            return res.status(500).json({ error: 'Error fetching student information' });
        }
        res.json(results);
    });
});

// Get semester registration status
app.get('/api/registration/:roll_no', (req, res) => {
    const rollNo = req.params.roll_no;
    conn.query('SELECT * FROM semester_registration WHERE roll_no = ?', [rollNo], (err, results) => {
        if (err) {
            console.error('Error fetching registration data:', err);
            res.status(500).json({ error: 'Error fetching registration information' });
            return;
        }
        res.json(results);
    });
});

// Get receipt status
app.get('/api/receipt/:roll_no', (req, res) => {
    const rollNo = req.params.roll_no;
    conn.query('SELECT roll_no, LENGTH(receipt_pdf) > 0 as has_receipt FROM receipt WHERE roll_no = ?', 
        [rollNo], (err, results) => {
        if (err) {
            console.error('Error fetching receipt data:', err);
            res.status(500).json({ error: 'Error fetching receipt information' });
            return;
        }
        res.json(results);
    });
});

// Add this new endpoint to server.js
// Add this new endpoint to server.js
app.get('/api/students-with-semester', (req, res) => {
    const query = `
        SELECT si.*, sr.semester
        FROM student_information si
        LEFT JOIN semester_registration sr ON si.roll_no = sr.roll_no
        ORDER BY si.roll_no
    `;

    conn.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching students:', err);
            return res.status(500).json({
                error: 'Error fetching student information'
            });
        }
        console.log(results);

        const formattedResults = results.map(student => ({
            ...student,
            phone_no: student.phone_no || '',
            email: student.email || '',
            address: student.address || '',
            blood_group: student.blood_group || '',
            semester: student.semester || null
        }));

        res.json(formattedResults);
    });
});

// Update student information
app.put('/api/students/:roll_no', async (req, res) => {
    const rollNo = req.params.roll_no;
    const updateData = {
        stud_name: req.body.stud_name,
        phone_no: req.body.phone_no,
        email: req.body.email,
        address: req.body.address,
        blood_group: req.body.blood_group
    };

    try {
        const [result] = await conn.promise().query(
            'UPDATE student_information SET ? WHERE roll_no = ?',
            [updateData, rollNo]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json({ message: 'Student information updated successfully' });
    } catch (err) {
        console.error('Error updating student:', err);
        res.status(500).json({ error: 'Error updating student information' });
    }
});


// Delete student's undertakings
app.delete('/api/students/:roll_no/undertakings', async (req, res) => {
    try {
        await conn.promise().query(
            'DELETE FROM undertakings WHERE roll_no = ?',
            [req.params.roll_no]
        );
        res.json({ message: 'Undertakings deleted successfully' });
    } catch (err) {
        console.error('Error deleting undertakings:', err);
        res.status(500).json({ error: 'Error deleting undertakings' });
    }
});

// Delete student's receipt
app.delete('/api/students/:roll_no/receipt', async (req, res) => {
    try {
        await conn.promise().query(
            'DELETE FROM receipt WHERE roll_no = ?',
            [req.params.roll_no]
        );
        res.json({ message: 'Receipt deleted successfully' });
    } catch (err) {
        console.error('Error deleting receipt:', err);
        res.status(500).json({ error: 'Error deleting receipt' });
    }
});

// Delete student's semester registration
app.delete('/api/students/:roll_no/semester', async (req, res) => {
    try {
        await conn.promise().query(
            'DELETE FROM semester_registration WHERE roll_no = ?',
            [req.params.roll_no]
        );
        res.json({ message: 'Semester registration deleted successfully' });
    } catch (err) {
        console.error('Error deleting semester registration:', err);
        res.status(500).json({ error: 'Error deleting semester registration' });
    }
});

// Delete student record
app.delete('/api/students/:roll_no', async (req, res) => {
    try {
        const [result] = await conn.promise().query(
            'DELETE FROM student_information WHERE roll_no = ?',
            [req.params.roll_no]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json({ message: 'Student deleted successfully' });
    } catch (err) {
        console.error('Error deleting student:', err);
        res.status(500).json({ error: 'Error deleting student record' });
    }
});

// Add these new endpoints to server.js:

// Update semester registration
app.put('/api/registration/:roll_no', async (req, res) => {
    const rollNo = req.params.roll_no;
    const semester = req.body.semester;

    try {
        // Check if registration exists
        const [existing] = await conn.promise().query(
            'SELECT * FROM semester_registration WHERE roll_no = ?',
            [rollNo]
        );

        if (existing.length > 0) {
            // Update existing registration
            await conn.promise().query(
                'UPDATE semester_registration SET semester = ? WHERE roll_no = ?',
                [semester, rollNo]
            );
        } else {
            // Create new registration
            await conn.promise().query(
                'INSERT INTO semester_registration (roll_no, semester) VALUES (?, ?)',
                [rollNo, semester]
            );
        }

        res.json({ message: 'Semester registration updated successfully' });
    } catch (err) {
        console.error('Error updating semester registration:', err);
        res.status(500).json({ error: 'Error updating semester registration' });
    }
});

// Receipt upload endpoint
app.post('/api/receipt/upload', upload.single('receipt_pdf'), async (req, res) => {
    console.log('Receipt upload request received');
    
    try {
        // Debug logs
        console.log('Files:', req.file);
        console.log('Body:', req.body);

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        if (!req.body.roll_no) {
            return res.status(400).json({ error: 'Roll number is required' });
        }

        // Always set proper headers
        res.setHeader('Content-Type', 'application/json');

        // Check if student exists
        const studentExists = await checkStudentExists(req.body.roll_no);
        if (!studentExists) {
            return res.status(404).json({ error: 'Student not found. Please register student first.' });
        }

        // Check if receipt already exists
        const [existingReceipt] = await conn.promise().query(
            'SELECT roll_no FROM receipt WHERE roll_no = ?',
            [req.body.roll_no]
        );

        if (existingReceipt.length > 0) {
            // Update existing receipt
            await conn.promise().query(
                'UPDATE receipt SET receipt_pdf = ? WHERE roll_no = ?',
                [req.file.buffer, req.body.roll_no]
            );
        } else {
            // Insert new receipt
            await conn.promise().query(
                'INSERT INTO receipt (roll_no, receipt_pdf) VALUES (?, ?)',
                [req.body.roll_no, req.file.buffer]
            );
        }

        res.status(200).json({ message: 'Receipt uploaded successfully' });
        
    } catch (err) {
        console.error('Error in receipt upload:', err);
        res.status(500).json({ error: 'Error uploading receipt' });
    }
});


// Update receipt
app.put('/api/receipt/:roll_no', upload.single('receipt_pdf'), async (req, res) => {
    const rollNo = req.params.roll_no;
    
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        // Check if receipt exists
        const [existing] = await conn.promise().query(
            'SELECT * FROM receipt WHERE roll_no = ?',
            [rollNo]
        );

        if (existing.length > 0) {
            // Update existing receipt
            await conn.promise().query(
                'UPDATE receipt SET receipt_pdf = ? WHERE roll_no = ?',
                [req.file.buffer, rollNo]
            );
        } else {
            // Create new receipt
            await conn.promise().query(
                'INSERT INTO receipt (roll_no, receipt_pdf) VALUES (?, ?)',
                [rollNo, req.file.buffer]
            );
        }

        res.json({ message: 'Receipt updated successfully' });
    } catch (err) {
        console.error('Error updating receipt:', err);
        res.status(500).json({ error: 'Error updating receipt' });
    }
});

// Update undertakings
app.put('/api/undertakings/:roll_no', upload.fields([
    { name: 'scholarship', maxCount: 1 },
    { name: 'aadhar', maxCount: 1 },
    { name: 'antiragging', maxCount: 1 },
    { name: 'abc', maxCount: 1 }
]), async (req, res) => {
    const rollNo = req.params.roll_no;

    try {
        // Check if undertakings exist
        const [existing] = await conn.promise().query(
            'SELECT * FROM undertakings WHERE roll_no = ?',
            [rollNo]
        );

        // Prepare update data
        const updateData = {};
        if (req.files) {
            if (req.files.scholarship) updateData.scholarship = req.files.scholarship[0].buffer;
            if (req.files.aadhar) updateData.aadhar = req.files.aadhar[0].buffer;
            if (req.files.antiragging) updateData.antiragging = req.files.antiragging[0].buffer;
            if (req.files.abc) updateData.abc = req.files.abc[0].buffer;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        if (existing.length > 0) {
            // Update existing undertakings
            const setClause = Object.keys(updateData)
                .map(key => `${key} = ?`)
                .join(', ');
            
            await conn.promise().query(
                `UPDATE undertakings SET ${setClause} WHERE roll_no = ?`,
                [...Object.values(updateData), rollNo]
            );
        } else {
            // Create new undertakings
            updateData.roll_no = rollNo;
            await conn.promise().query(
                'INSERT INTO undertakings SET ?',
                [updateData]
            );
        }

        res.json({ message: 'Undertakings updated successfully' });
    } catch (err) {
        console.error('Error updating undertakings:', err);
        res.status(500).json({ error: 'Error updating undertakings' });
    }
});

// Get undertakings status
app.get('/api/undertakings/:roll_no', (req, res) => {
    conn.query(
        'SELECT roll_no FROM undertakings WHERE roll_no = ?',
        [req.params.roll_no],
        (err, results) => {
            if (err) {
                console.error('Error fetching undertakings status:', err);
                return res.status(500).json({ error: 'Error fetching undertakings status' });
            }
            res.json(results);
        }
    );
});




// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);  // Use backticks here
}).on('error', (err) => {
    console.error('Server error:', err);
});