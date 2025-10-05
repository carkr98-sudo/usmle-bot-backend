const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all origins (allows your HTML to call this API)
app.use(cors());
app.use(express.json());

// Path to store the count (using a simple JSON file)
const DATA_FILE = path.join(__dirname, 'count.json');

// Initialize count file if it doesn't exist
async function initializeCountFile() {
    try {
        await fs.access(DATA_FILE);
    } catch {
        await fs.writeFile(DATA_FILE, JSON.stringify({ count: 0 }));
        console.log('Initialized count file');
    }
}

// Read current count
async function getCount() {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
}

// Write count
async function setCount(count) {
    await fs.writeFile(DATA_FILE, JSON.stringify({ count }));
}

// API endpoint to get current count
app.get('/api/count', async (req, res) => {
    try {
        const data = await getCount();
        res.json({ count: data.count, success: true });
    } catch (error) {
        console.error('Error getting count:', error);
        res.status(500).json({ error: 'Failed to get count', success: false });
    }
});

// API endpoint to increment count
app.post('/api/increment', async (req, res) => {
    try {
        const data = await getCount();
        const newCount = data.count + 1;
        await setCount(newCount);
        console.log(`Count incremented to: ${newCount}`);
        res.json({ count: newCount, success: true });
    } catch (error) {
        console.error('Error incrementing count:', error);
        res.status(500).json({ error: 'Failed to increment count', success: false });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running' });
});

// Start server
async function startServer() {
    await initializeCountFile();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Health check: http://localhost:${PORT}/health`);
        console.log(`Get count: http://localhost:${PORT}/api/count`);
        console.log(`Increment: POST to http://localhost:${PORT}/api/increment`);
    });
}

startServer();