// renderer.js
document.addEventListener('DOMContentLoaded', () => {
    const selectDirBtn = document.getElementById('select-dir-btn');
    const organizeBtn = document.getElementById('organize-btn');
    const selectedPathElement = document.getElementById('selected-path');
    const resultsDiv = document.getElementById('results');
    const successList = document.getElementById('success-list');
    const errorList = document.getElementById('error-list');
    
    let selectedDirectory = null;
    
    selectDirBtn.addEventListener('click', async () => {
      try {
        const directory = await window.api.selectDirectory();
        if (directory) {
          selectedDirectory = directory;
          selectedPathElement.textContent = directory;
          organizeBtn.disabled = false;
          
          // Hide previous results
          resultsDiv.classList.add('hidden');
          successList.innerHTML = '';
          errorList.innerHTML = '';
        }
      } catch (error) {
        console.error('Error selecting directory:', error);
        alert(`Error selecting directory: ${error.message}`);
      }
    });
    
    organizeBtn.addEventListener('click', async () => {
      if (!selectedDirectory) return;
      
      try {
        organizeBtn.disabled = true;
        organizeBtn.textContent = 'Organizing...';
        
        const results = await window.api.organizeFiles(selectedDirectory);
        
        // Display results
        successList.innerHTML = '';
        errorList.innerHTML = '';
        
        results.success.forEach(item => {
          const li = document.createElement('li');
          li.textContent = `"${item.file}" → ${item.destination}`;
          successList.appendChild(li);
        });
        
        results.errors.forEach(item => {
          const li = document.createElement('li');
          li.textContent = `"${item.file}": ${item.error}`;
          errorList.appendChild(li);
        });
        
        resultsDiv.classList.remove('hidden');
        
        organizeBtn.textContent = 'Organize Files';
        organizeBtn.disabled = false;
      } catch (error) {
        console.error('Error organizing files:', error);
        alert(`Error organizing files: ${error.message}`);
        organizeBtn.textContent = 'Organize Files';
        organizeBtn.disabled = false;
      }
    });
  });