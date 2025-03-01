// main.js
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs-extra');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

// File type mapping - add more types as needed
const fileTypes = {
    documents: ['.pdf', '.txt', '.doc', '.docx', '.rtf', '.odt', '.md'],
    images: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.svg', '.webp'],
    videos: ['.mp4', '.mov', '.avi', '.mkv', '.wmv', '.flv', '.webm'],
    audio: ['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a'],
    archives: ['.zip', '.rar', '.7z', '.tar', '.gz'],
    code: ['.js', '.py', '.html', '.css', '.java', '.cpp', '.c', '.php', '.rb']
};

// Handle directory selection
ipcMain.handle('select-directory', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    });

    if (result.canceled) {
        return null;
    }

    return result.filePaths[0];
});

// Process file organization
ipcMain.handle('organize-files', async (event, directoryPath) => {
    try {
        // List all files
        const files = await fs.readdir(directoryPath);
        const results = { success: [], errors: [] };

        // Create destination folders if they don't exist
        for (const folder of Object.keys(fileTypes)) {
            await fs.ensureDir(path.join(directoryPath, folder));
        }

        // Process each file
        for (const file of files) {
            try {
                const filePath = path.join(directoryPath, file);
                const stats = await fs.stat(filePath);

                // Skip directories
                if (stats.isDirectory()) continue;

                const fileExtension = path.extname(file).toLowerCase();
                let destinationFolder = 'other'; // Default folder for unrecognized types

                // Find the correct folder based on file extension
                for (const [folder, extensions] of Object.entries(fileTypes)) {
                    if (extensions.includes(fileExtension)) {
                        destinationFolder = folder;
                        break;
                    }
                }

                // Ensure the destination folder exists
                await fs.ensureDir(path.join(directoryPath, destinationFolder));

                // Move the file
                await fs.move(
                    filePath,
                    path.join(directoryPath, destinationFolder, file),
                    { overwrite: false }
                );

                results.success.push({
                    file,
                    destination: destinationFolder
                });
            } catch (err) {
                results.errors.push({
                    file,
                    error: err.message
                });
            }
        }

        return results;
    } catch (err) {
        throw new Error(`Failed to organize files: ${err.message}`);
    }
});
