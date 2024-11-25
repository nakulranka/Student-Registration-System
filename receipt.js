// Debugging: Check if the server is returning HTML instead of JSON
fetch('http://localhost:3000/api/receipt/upload', {
    method: 'POST',
    body: formData,
})
.then(response => {
    console.log('Response status:', response.status);
    const contentType = response.headers.get('content-type');
    console.log('Content-Type:', contentType);

    if (!contentType || !contentType.includes('application/json')) {
        return response.text().then(text => {
            console.error('Server response is not JSON:', text);
            throw new Error('Server sent an invalid response format');
        });
    }

    return response.json();
})
.then(result => {
    console.log('Upload successful:', result);
    statusMessage.textContent = 'Upload successful!';
})
.catch(error => {
    console.error('Error during upload:', error);
    statusMessage.textContent = `Upload failed: ${error.message}`;
});
const handleReceiptForm = () => {
  const form = document.getElementById('feeReceiptForm');
  const statusMessage = document.getElementById('status-message');
  
  if (!form) {
      console.error('Form not found');
      return;
  }

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
          const response = await fetch('http://localhost:3000/api/receipt/upload', {
              method: 'POST',
              body: formData,
              // Don't set Content-Type header when using FormData
          });

          // Debug: Log the response
          console.log('Response status:', response.status);
          const contentType = response.headers.get('content-type');
          console.log('Content-Type:', contentType);

          // Check if response is JSON
          if (!contentType || !contentType.includes('application/json')) {
              throw new Error('Server sent an invalid response format');
          }

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