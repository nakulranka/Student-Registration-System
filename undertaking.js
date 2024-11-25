// Function to convert file to base64 string
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

document.getElementById('undertakingForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  try {
    // Get form data
    const rollNo = document.getElementById('roll_no').value;
    const scholarshipFile = document.getElementById('scholarshipForm').files[0];
    const aadhaarFile = document.getElementById('aadhaarCard').files[0];
    const antiRaggingFile = document.getElementById('antiRaggingForm').files[0];
    const abcFile = document.getElementById('abcID').files[0];

    // Validate files
    if (!scholarshipFile || !aadhaarFile || !antiRaggingFile || !abcFile) {
      throw new Error('Please upload all required files');
    }

    // Create FormData object
    const formData = new FormData();
    formData.append('roll_no', rollNo);
    formData.append('scholarship', scholarshipFile);
    formData.append('aadhar', aadhaarFile);
    formData.append('antiragging', antiRaggingFile);
    formData.append('abc', abcFile);

    // Send the files to the server
    const response = await fetch('http://localhost:3000/api/undertakings', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to upload files');
    }

    // Show success message
    const undertakingList = document.getElementById('undertakingList');
    const successMessage = document.createElement('div');
    successMessage.textContent = 'Files uploaded successfully!';
    successMessage.className = 'success-message';
    undertakingList.appendChild(successMessage);

    // Reset the form
    document.getElementById('undertakingForm').reset();

  } catch (error) {
    console.error('Error:', error);
    
    // Show error message
    const undertakingList = document.getElementById('undertakingList');
    const errorMessage = document.createElement('div');
    errorMessage.textContent = error.message || 'Error uploading files';
    errorMessage.className = 'error-message';
    undertakingList.appendChild(errorMessage);
  }
});

// Add some basic styling for messages
const style = document.createElement('style');
style.textContent = `
  .success-message {
    color: green;
    margin: 10px 0;
    padding: 10px;
    background-color: #e8f5e9;
    border-radius: 4px;
  }
  .error-message {
    color: red;
    margin: 10px 0;
    padding: 10px;
    background-color: #ffebee;
    border-radius: 4px;
  }
`;
document.head.appendChild(style);