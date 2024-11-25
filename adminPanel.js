// Global variables
let studentsData = [];
let deleteModal;
let studentModal;
let selectedRollNo;

// let timetableModal;
// let selectedFile = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize all app components
function initializeApp() {
    try {
        // Initialize modals
        deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
        studentModal = new bootstrap.Modal(document.getElementById('studentModal'));
        
        // Set up event listeners
        document.getElementById('searchInput')?.addEventListener('input', filterStudents);
        document.getElementById('sortSelect')?.addEventListener('change', handleSort);
        
        // Load initial data
        refreshData();
    } catch (error) {
        console.error('Initialization error:', error);
        alert('Failed to initialize application');
    }
}

// Handle sort selection
function handleSort(event) {
    const column = event.target.value;
    if (column) {
        sortStudents(column);
    }
}

// Fetch and display students data
async function refreshData() {
    showLoading(true);
    try {
        const response = await fetch('http://localhost:3000/api/students-with-semester');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        studentsData = await response.json();

        console.log(studentsData);

        displayStudents(studentsData);
    } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to load student data. Please try again later.');
    } finally {
        showLoading(false);
    }
}

// Display students in table
function displayStudents(students) {
    const tableBody = document.getElementById('studentTableBody');
    if (!tableBody) {
        console.error('Table body element not found');
        return;
    }

    tableBody.innerHTML = '';
    console.log(students)

    students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(student.roll_no)}</td>
            <td>${escapeHtml(student.stud_name)}</td>
            <td>${escapeHtml(student.phone_no)}</td>
            <td>${escapeHtml(student.email)}</td>
            <td>${escapeHtml(student.address)}</td>
            <td>${escapeHtml(student.blood_group)}</td>
            <td>${escapeHtml(String(student.semester))}</td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="downloadDocument('${escapeHtml(student.roll_no)}', 'receipt')">
                        <i class="fas fa-download"></i> Receipt
                    </button>
                    <button class="btn btn-outline-primary" onclick="downloadDocument('${escapeHtml(student.roll_no)}', 'undertakings')">
                        <i class="fas fa-download"></i> Docs
                    </button>
                </div>
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="showStudentDetails('${escapeHtml(student.roll_no)}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="showDeleteConfirmation('${escapeHtml(student.roll_no)}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Escape HTML to prevent XSS
function escapeHtml(unsafe) {
    return unsafe
        ? unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;")
        : '';
}

// Filter students based on search input
function filterStudents(event) {
    if (!event?.target) return;
    
    const searchTerm = event.target.value.toLowerCase().trim();
    const filteredStudents = studentsData.filter(student => 
        (student.stud_name || '').toLowerCase().includes(searchTerm) || 
        (student.roll_no || '').toLowerCase().includes(searchTerm) // || 
        // (student.email || '').toLowerCase().includes(searchTerm)
    );
    displayStudents(filteredStudents);
}



async function downloadDocument(rollNo, type) {
    if (!rollNo || !type) {
        console.error('Invalid parameters for document download');
        return;
    }

    showLoading(true);

    try {
        const response = await fetch(`http://localhost:3000/api/${type}/${rollNo}/download`, {
            method: 'GET',
            headers: {
                'Accept': 'application/pdf'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to download ${type}: ${response.status} ${response.statusText}`);
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_${rollNo}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Download error:', error);
        alert(`Failed to download ${type}. Please try again later.`);
    } finally {
        showLoading(false);
    }
}


// Show student details in modal
function showStudentDetails(rollNo) {
    const student = studentsData.find(s => s.roll_no === rollNo);
    if (!student) {
        console.error('Student not found:', rollNo);
        return;
    }

    const fields = {
        'modalRollNo': 'roll_no',
        'modalName': 'stud_name',
        'modalPhone': 'phone_no',
        'modalEmail': 'email',
        'modalAddress': 'address',
        'modalBloodGroup': 'blood_group'
    };

    Object.entries(fields).forEach(([elementId, fieldName]) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.value = student[fieldName] || '';
        }
    });

    studentModal.show();
}

// Show delete confirmation modal
function showDeleteConfirmation(rollNo) {
    if (!rollNo) {
        console.error('Invalid roll number for deletion');
        return;
    }
    selectedRollNo = rollNo;
    deleteModal.show();
}

// Confirm deletion of student
async function confirmDelete() {
    if (!selectedRollNo) {
        console.error('No roll number selected for deletion');
        return;
    }

    showLoading(true);
    try {
        const response = await fetch(`http://localhost:3000/api/students/${selectedRollNo}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Delete failed with status: ${response.status}`);
        }

        await refreshData();
        alert('Student deleted successfully');
    } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete student. Please try again later.');
    } finally {
        showLoading(false);
        deleteModal.hide();
        selectedRollNo = null;
    }
}

// Sort students by column
function sortStudents(column) {
    if (!column || !studentsData.length) return;

    // Map the select values to actual database column names
    const columnMap = {
        'name': 'stud_name',
        'roll': 'roll_no',
        'email': 'email',
        'phone': 'phone_no',
        'blood': 'blood_group'
    };

    const dbColumn = columnMap[column] || column;

    const sortedStudents = [...studentsData].sort((a, b) => {
        const valueA = (a[dbColumn] || '').toString().toLowerCase();
        const valueB = (b[dbColumn] || '').toString().toLowerCase();
        return valueA.localeCompare(valueB);
    });
    
    displayStudents(sortedStudents);
}

function filterStudents(event) {
    if (!event?.target) return;
    
    const searchTerm = event.target.value.toLowerCase().trim();
    const filteredStudents = studentsData.filter(student => 
        Object.values(student).some(value => 
            value && value.toString().toLowerCase().includes(searchTerm)
        )
    );
    displayStudents(filteredStudents);
}

// Add this to the initializeApp function
// function initializeApp() {
//     try {
//         // Existing initialization code...
//         timetableModal = new bootstrap.Modal(document.getElementById('timetableModal'));
        
//         // Add event listeners for timetable functionality
//         document.querySelector('[data-bs-target="#timetableModal"]')?.addEventListener('click', resetTimetableForm);
//         document.getElementById('timetableFile')?.addEventListener('change', handleFileSelect);
//         document.getElementById('saveTimetableBtn')?.addEventListener('click', uploadTimetable);
//     } catch (error) {
//         console.error('Initialization error:', error);
//         alert('Failed to initialize application');
//     }
// }

// Reset the timetable form when opening the modal
function resetTimetableForm() {
    const form = document.getElementById('timetableForm');
    if (form) {
        form.reset();
    }
    selectedFile = null;
    const fileLabel = document.getElementById('fileLabel');
    if (fileLabel) {
        fileLabel.textContent = 'Choose PDF file';
    }
}

// Handle file selection
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.type !== 'application/pdf') {
            alert('Please select a PDF file');
            event.target.value = '';
            selectedFile = null;
            return;
        }
        selectedFile = file;
        const fileLabel = document.getElementById('fileLabel');
        if (fileLabel) {
            fileLabel.textContent = file.name;
        }
    }
}

async function uploadTimetable() {
    const semester = document.getElementById('modalSemester')?.value;
    
    if (!semester) {
        alert('Please select a semester');
        return;
    }
    
    if (!selectedFile) {
        alert('Please select a PDF file');
        return;
    }

    showLoading(true);
    
    try {
        const formData = new FormData();
        formData.append('timetable', selectedFile);
        formData.append('semester', semester);

        const response = await fetch('http://localhost:3000/api/timetable/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Upload failed with status: ${response.status}`);
        }

        alert('Timetable uploaded successfully');
        timetableModal.hide();
        resetTimetableForm();
    } catch (error) {
        console.error('Upload error:', error);
        alert('Failed to upload timetable. Please try again later.');
    } finally {
        showLoading(false);
    }
}


// Show/hide loading indicator
function showLoading(isLoading) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = isLoading ? 'block' : 'none';
    }
}