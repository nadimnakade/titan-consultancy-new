const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '.'))); // Serve all files in current directory

// Route to Save Content
app.post('/save-content', (req, res) => {
    const content = req.body;
    const filePath = path.join(__dirname, 'assets', 'content.json');

    fs.writeFile(filePath, JSON.stringify(content, null, 4), (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Failed to save content.' });
        }
        res.json({ success: true, message: 'Content saved successfully!' });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Admin Panel: http://localhost:${PORT}/admin.html`);
});
