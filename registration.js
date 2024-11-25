// registration.js - Frontend Form Handler
document.getElementById('registrationForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const roll_no = document.getElementById('registrationID').value;
  const semester = document.getElementById('semester').value;

  try {
      const response = await fetch('http://localhost:3000/api/registration', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ roll_no, semester })
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Registration failed');
      }

      const result = await response.json();
      
      // Update UI
      const registrationList = document.getElementById('registrationList');
      const registrationItem = document.createElement('div');
      registrationItem.textContent = `Registration successful - Roll No: ${roll_no}, Semester: ${semester}`;
      registrationList.appendChild(registrationItem);
      
      // Reset form
      document.getElementById('registrationForm').reset();
      
  } catch (error) {
      console.error('Registration error:', error);
      alert(`Registration failed: ${error.message}`);
  }
});