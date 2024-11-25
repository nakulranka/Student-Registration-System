document.getElementById('timetableForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const semester = document.getElementById('semester').value;

  if (semester) {
    // Generate a random timetable
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const subjects = ['Math', 'Physics', 'Chemistry', 'English', 'History', 'Biology', 'Computer Science', 'Economics'];
    const timetable = {};

    days.forEach(day => {
      const schedule = [];
      for (let i = 0; i < 4; i++) {
        const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
        schedule.push(randomSubject);
      }
      timetable[day] = schedule;
    });

    // Open a new tab
    const newTab = window.open();
    const newTabDocument = newTab.document;

    // Style and Structure
    newTabDocument.write(`
      <html>
        <head>
          <title>Timetable for Semester ${semester}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
            }
            h1 {
              text-align: center;
              margin-bottom: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              padding: 10px;
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
          <h1>Semester ${semester} Timetable</h1>
          <table>
            <tr>
              <th>Day</th>
              <th>Period 1</th>
              <th>Period 2</th>
              <th>Period 3</th>
              <th>Period 4</th>
            </tr>
            ${Object.keys(timetable).map(day => `
              <tr>
                <td>${day}</td>
                <td>${timetable[day][0]}</td>
                <td>${timetable[day][1]}</td>
                <td>${timetable[day][2]}</td>
                <td>${timetable[day][3]}</td>
              </tr>
            `).join('')}
          </table>
        </body>
      </html>
    `);
    
    newTabDocument.close();  // Close the document stream to render content
  }
});


  