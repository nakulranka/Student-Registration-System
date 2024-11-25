document.getElementById('studentInfoForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const formData = {
      roll_no: document.getElementById('roll_no').value,
      name: document.getElementById('name').value,
      adhar_no: document.getElementById('adhar_no').value,
      phone_no: document.getElementById('phone_no').value,
      email_id: document.getElementById('email_id').value,
      address: document.getElementById('address').value,
      abc_id: document.getElementById('abc_id').value,
      blood_group: document.getElementById('blood_group').value
  };

  try {
      const response = await fetch('http://localhost:3000/api/student', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (response.ok) {
          alert('Student information saved successfully!');
          displayStudent(formData);
          this.reset();
      } else {
          throw new Error(data.error || 'Failed to save student information');
      }
  } catch (error) {
      alert('Error: ' + error.message);
      console.error('Error:', error);
  }
});

function displayStudent(studentData) {
  const studentList = document.getElementById('studentList');
  const studentItem = document.createElement('div');
  studentItem.className = 'student-item';
  studentItem.innerHTML = `
      <p><strong>Roll No:</strong> ${studentData.roll_no}</p>
      <p><strong>Name:</strong> ${studentData.name}</p>
      <p><strong>Phone:</strong> ${studentData.phone_no}</p>
      <p><strong>Email:</strong> ${studentData.email_id}</p>
  `;
  studentList.appendChild(studentItem);
}

function openNav() {
  document.getElementById("mySidebar").style.width = "250px";
}

function closeNav() {
  document.getElementById("mySidebar").style.width = "0";
}