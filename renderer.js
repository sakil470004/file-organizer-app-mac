// renderer.js
const fs = require('fs');
const path = require('path');
const { dialog } = require('electron').remote || require('@electron/remote');

const organizeBtn = document.getElementById('organizeBtn');
const statusDiv = document.getElementById('status');

organizeBtn.addEventListener('click', () => {
  // Open a dialog to choose a directory to organize
  dialog.showOpenDialog({
    properties: ['openDirectory']
  }).then(result => {
    if (!result.canceled) {
      const folderPath = result.filePaths[0];
      organizeFiles(folderPath);
    }
  }).catch(err => {
    statusDiv.innerText = `Error: ${err}`;
  });
});

function organizeFiles(folderPath) {
  // Read the files in the selected directory
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      statusDiv.innerText = `Error reading directory: ${err}`;
      return;
    }
    
    // For each file, check its extension and move it to a subfolder
    files.forEach(file => {
      const filePath = path.join(folderPath, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return;
        if (stats.isFile()) {
          const ext = path.extname(file).slice(1); // remove the dot
          if (!ext) return; // Skip files without an extension
          
          const targetFolder = path.join(folderPath, ext);
          // Create the subfolder if it doesn't exist
          if (!fs.existsSync(targetFolder)) {
            fs.mkdirSync(targetFolder);
          }
          // Move the file to the subfolder
          const targetPath = path.join(targetFolder, file);
          fs.rename(filePath, targetPath, (err) => {
            if (err) {
              statusDiv.innerText += `Error moving ${file}: ${err}\n`;
            } else {
              statusDiv.innerText += `${file} moved to ${ext} folder\n`;
            }
          });
        }
      });
    });
  });
}
