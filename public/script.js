class TikTokDownloader {
    constructor() {
        this.form = document.getElementById('downloadForm');
        this.urlInput = document.getElementById('tiktokUrl');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.loading = document.getElementById('loading');
        this.error = document.getElementById('error');
        this.results = document.getElementById('results');
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Paste event for URL input
        this.urlInput.addEventListener('paste', (e) => {
            setTimeout(() => this.validateUrl(), 100);
        });

        // Input event for real-time validation
        this.urlInput.addEventListener('input', () => this.validateUrl());
    }

    validateUrl() {
        const url = this.urlInput.value.trim();
        const tiktokRegex = /https?:\/\/(www\.)?tiktok\.com\/.+\/video\/.+|https?:\/\/(vm|vt)\.tiktok\.com\/.+/;
        
        if (url && !tiktokRegex.test(url)) {
            this.urlInput.classList.add('border-red-500');
            return false;
        } else {
            this.urlInput.classList.remove('border-red-500');
            return true;
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const url = this.urlInput.value.trim();
        
        if (!this.validateUrl()) {
            this.showError('Please enter a valid TikTok URL');
            return;
        }

        this.showLoading();
        this.hideError();
        this.hideResults();

        try {
            const response = await fetch('/api/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url })
            });

            const data = await response.json();

            if (data.success) {
                this.displayResults(data.data);
            } else {
                this.showError(data.error);
            }
        } catch (error) {
            this.showError('Network error: Unable to connect to server');
        } finally {
            this.hideLoading();
        }
    }

    displayResults(videoData) {
        // Update video player
        const videoPlayer = document.getElementById('videoPlayer');
        videoPlayer.src = videoData.video.noWatermark;
        videoPlayer.poster = videoData.video.cover;

        // Update basic information
        document.getElementById('videoTitle').textContent = videoData.title || 'No title';
        document.getElementById('videoAuthor').textContent = `${videoData.author.name} (@${videoData.author.unique_id})`;
        document.getElementById('videoDuration').textContent = videoData.video.durationFormatted;
        document.getElementById('videoCreated').textContent = videoData.created_at;

        // Update statistics
        document.getElementById('likesCount').textContent = videoData.stats.likeCount.toLocaleString();
        document.getElementById('commentsCount').textContent = videoData.stats.commentCount.toLocaleString();
        document.getElementById('sharesCount').textContent = videoData.stats.shareCount.toLocaleString();
        document.getElementById('playsCount').textContent = videoData.stats.playCount.toLocaleString();

        // Set up download buttons
        this.setupDownloadButtons(videoData);

        this.showResults();
    }

    setupDownloadButtons(videoData) {
        const downloadVideoBtn = document.getElementById('downloadVideoBtn');
        const downloadAudioBtn = document.getElementById('downloadAudioBtn');
        const copyLinkBtn = document.getElementById('copyLinkBtn');

        // Video download
        downloadVideoBtn.onclick = () => {
            this.downloadFile(videoData.video.noWatermark, `tiktok_${videoData.id}.mp4`);
        };

        // Audio download
        if (videoData.music && videoData.music.play_url) {
            downloadAudioBtn.onclick = () => {
                this.downloadFile(videoData.music.play_url, `tiktok_audio_${videoData.id}.mp3`);
            };
            downloadAudioBtn.disabled = false;
        } else {
            downloadAudioBtn.disabled = true;
            downloadAudioBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }

        // Copy link
        copyLinkBtn.onclick = () => {
            navigator.clipboard.writeText(videoData.video.noWatermark)
                .then(() => {
                    this.showTempMessage('Video link copied to clipboard!', 'green');
                })
                .catch(() => {
                    this.showTempMessage('Failed to copy link', 'red');
                });
        };
    }

    async downloadFile(url, filename) {
        try {
            this.showTempMessage('Downloading... Please wait', 'blue');
            
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename;
            a.style.display = 'none';
            
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // Clean up
            URL.revokeObjectURL(blobUrl);
            
            this.showTempMessage('Download completed!', 'green');
        } catch (error) {
            console.error('Download error:', error);
            this.showTempMessage('Download failed. Trying alternative method...', 'red');
            
            // Fallback to direct link
            setTimeout(() => {
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                a.target = '_blank';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }, 1000);
        }
    }

    showLoading() {
        this.downloadBtn.disabled = true;
        this.loading.classList.remove('hidden');
    }

    hideLoading() {
        this.downloadBtn.disabled = false;
        this.loading.classList.add('hidden');
    }

    showError(message) {
        this.error.textContent = message;
        this.error.classList.remove('hidden');
    }

    hideError() {
        this.error.classList.add('hidden');
    }

    showResults() {
        this.results.classList.remove('hidden');
    }

    hideResults() {
        this.results.classList.add('hidden');
    }

    showTempMessage(message, type) {
        const tempDiv = document.createElement('div');
        tempDiv.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white font-semibold z-50 ${
            type === 'green' ? 'bg-green-500' : 'bg-red-500'
        }`;
        tempDiv.textContent = message;
        
        document.body.appendChild(tempDiv);
        
        setTimeout(() => {
            tempDiv.remove();
        }, 3000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TikTokDownloader();
});