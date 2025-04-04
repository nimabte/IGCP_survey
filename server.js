const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.')); // Serve static files from current directory

// Create rankings directory if it doesn't exist
const rankingsDir = path.join(__dirname, 'rankings');
if (!fs.existsSync(rankingsDir)) {
    fs.mkdirSync(rankingsDir);
    console.log('Created rankings directory');
}

// Handle POST request to save rankings
app.post('/save-rankings', (req, res) => {
    try {
        console.log('Received rankings data:', req.body);

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `user_${req.body.userId}_${timestamp}.json`;
        const filepath = path.join(rankingsDir, filename);

        // Save rankings to file
        fs.writeFileSync(filepath, JSON.stringify(req.body.rankings, null, 2));
        console.log(`Saved rankings to: ${filepath}`);

        // Send success response
        res.json({
            success: true,
            filename: filename,
            message: 'Rankings saved successfully'
        });
    } catch (error) {
        console.error('Error saving rankings:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log('Available files:');
    fs.readdirSync('.').forEach(file => {
        if (file.endsWith('.html') || file.endsWith('.js') || file.endsWith('.css')) {
            console.log(`  - ${file}`);
        }
    });
}); 