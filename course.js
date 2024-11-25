// Define subjects and credits for each semester
const semesterData = {
  1: [
    { subject: 'Mathematics I', credits: 4 },
    { subject: 'Physics I', credits: 3 },
    { subject: 'Chemistry', credits: 3 },
    { subject: 'English', credits: 2 }
  ],
  2: [
    { subject: 'Mathematics II', credits: 4 },
    { subject: 'Physics II', credits: 3 },
    { subject: 'Biology', credits: 3 },
    { subject: 'Computer Programming', credits: 3 }
  ],
  // Add more data for other semesters
  3: [
    { subject: 'Mathematics III', credits: 4 },
    { subject: 'Digital Electronics', credits: 3 },
    { subject: 'Data Structures', credits: 4 },
    { subject: 'Environmental Science', credits: 2 }
  ],
  4: [
    { subject: 'Signals and Systems', credits: 3 },
    { subject: 'Microprocessors', credits: 3 },
    { subject: 'Object-Oriented Programming', credits: 3 },
    { subject: 'Discrete Mathematics', credits: 4 }
  ]
};

// Add event listener to the form
document.getElementById('courseForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const semester = document.getElementById('semester').value;

  if (semesterData[semester]) {
    // Open a new tab
    const newTab = window.open();
    const newTabDocument = newTab.document;

    // Write content to the new tab with styling and table structure
    newTabDocument.write(`
      <html>
        <head>
          <title>Semester ${semester} - Course Details</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              text-align: center;
            }
            h1 {
              margin-bottom: 20px;
            }
            table {
              width: 80%;
              margin: 0 auto;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              padding: 12px;
              border: 1px solid #333;
              text-align: center;
            }
            th {
              background-color: #4CAF50;
              color: white;
            }
            tr:nth-child(even) {
              background-color: #f2f2f2;
            }
          </style>
        </head>
        <body>
          <h1>Subjects and Credits for Semester ${semester}</h1>
          <table>
            <tr>
              <th>Subject</th>
              <th>Credits</th>
            </tr>
            ${semesterData[semester].map(course => `
              <tr>
                <td>${course.subject}</td>
                <td>${course.credits}</td>
              </tr>
            `).join('')}
          </table>
        </body>
      </html>
    `);

    newTabDocument.close();  // Close the document stream
  } else {
    alert("No data available for the selected semester.");
  }
});


  