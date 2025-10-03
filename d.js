const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// TikTok Download API
async function downloadTikTok(url) {
    try {
        const response = await axios.get('https://api.tiklydown.eu.org/api/download', {
            params: {
                url: url
            },
            headers: {
                'accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'X-API-Key': 'tk_362a6aff8c13707d87be64ed3874513b64475b29d7771400ee4b7b565e40806f'
            },
            timeout: 10000
        });
        
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        if (error.response) {
            console.log(`API Error: ${error.response.status} -`, error.response.data);
            return {
                success: false,
                error: `API Error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`
            };
        } else if (error.request) {
            return {
                success: false,
                error: 'Network error: Unable to connect to TikTok API'
            };
        } else {
            return {
                success: false,
                error: `Request error: ${error.message}`
            };
        }
    }
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/download', async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({
                success: false,
                error: 'URL is required'
            });
        }

        // Validate TikTok URL
        const tiktokRegex = /https?:\/\/(www\.)?tiktok\.com\/.+\/video\/.+|https?:\/\/(vm|vt)\.tiktok\.com\/.+/;
        if (!tiktokRegex.test(url)) {
            return res.status(400).json({
                success: false,
                error: 'Please enter a valid URL'
            });
        }

        console.log('Processing TikTok URL:', url);
        const result = await downloadTikTok(url);
        
        if (result.success) {
            res.json({
                success: true,
                data: result.data
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 TikTok Downloader server running on http://localhost:${PORT}`);
});