// Global state
const state = {
    uploadedImage: null,
    selectedOutfit: null,
    resultImage: null,
    outfits: [],
    recommendations: []
};

// API Configuration
const API_BASE_URL = 'http://localhost:8000';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    setupNavigation();
    setupUpload();
    setupFilters();
    loadOutfits();
    loadRecommendations();
}

// Navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            navigateToPage(page);
        });
    });
}

function navigateToPage(pageName) {
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-page="${pageName}"]`).classList.add('active');
    
    // Update pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageName).classList.add('active');
}

// Upload functionality
function setupUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    
    // Click to upload
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // File selection
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileUpload(file);
        }
    });
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    });
}

async function handleFileUpload(file) {
    // Validate file
    if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
    }
    
    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        showImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
    
    // Upload to server
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`${API_BASE_URL}/api/upload`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Upload failed');
        }
        
        const result = await response.json();
        state.uploadedImage = result.filename;
        console.log('Image uploaded successfully:', result);
        
    } catch (error) {
        console.error('Upload error:', error);
        alert('Failed to upload image. Please try again.');
    }
}

function showImagePreview(imageSrc) {
    const uploadArea = document.getElementById('uploadArea');
    const previewContainer = document.getElementById('previewContainer');
    const previewImage = document.getElementById('previewImage');
    
    previewImage.src = imageSrc;
    uploadArea.style.display = 'none';
    previewContainer.style.display = 'block';
}

function clearUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const previewContainer = document.getElementById('previewContainer');
    const fileInput = document.getElementById('fileInput');
    
    uploadArea.style.display = 'block';
    previewContainer.style.display = 'none';
    fileInput.value = '';
    state.uploadedImage = null;
}

function proceedToOutfits() {
    if (!state.uploadedImage) {
        alert('Please upload an image first');
        return;
    }
    navigateToPage('outfits');
}

// Outfits functionality
async function loadOutfits() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/outfits`);
        const data = await response.json();
        state.outfits = data.outfits;
        displayOutfits(state.outfits);
    } catch (error) {
        console.error('Error loading outfits:', error);
        // Show sample outfits if API fails
        const sampleOutfits = [
            {
                id: 'shirt1',
                name: 'Classic White Shirt',
                category: 'shirt',
                color: 'white',
                style: 'formal'
            },
            {
                id: 'dress1',
                name: 'Elegant Black Dress',
                category: 'dress',
                color: 'black',
                style: 'formal'
            },
            {
                id: 'tshirt1',
                name: 'Graphic T-Shirt',
                category: 'tshirt',
                color: 'gray',
                style: 'casual'
            }
        ];
        state.outfits = sampleOutfits;
        displayOutfits(sampleOutfits);
    }
}

function displayOutfits(outfits) {
    const outfitsGrid = document.getElementById('outfitsGrid');
    
    if (outfits.length === 0) {
        outfitsGrid.innerHTML = '<p>No outfits available</p>';
        return;
    }
    
    outfitsGrid.innerHTML = outfits.map(outfit => `
        <div class="outfit-card" onclick="selectOutfit('${outfit.id}')">
            <img src="${API_BASE_URL}/outfits/${outfit.image || 'placeholder.jpg'}" 
                 alt="${outfit.name}" 
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzY2N2VlYSIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPjwvdGV4dD4KICA8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj4ke291dGZpdC5uYW1lfTwvdGV4dD4KPC9zdmc+'">
            <div class="outfit-card-content">
                <h3>${outfit.name}</h3>
                <div class="outfit-meta">
                    <span class="outfit-badge">${outfit.category}</span>
                    <span class="outfit-badge">${outfit.color}</span>
                </div>
                <button class="btn btn-primary">Try On</button>
            </div>
        </div>
    `).join('');
}

function setupFilters() {
    const filterTabs = document.querySelectorAll('.filter-tab');
    
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active tab
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Filter outfits
            const category = tab.dataset.category;
            const filteredOutfits = category === 'all' 
                ? state.outfits 
                : state.outfits.filter(outfit => outfit.category === category);
            
            displayOutfits(filteredOutfits);
        });
    });
}

async function loadRecommendations() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/recommendations`);
        const data = await response.json();
        state.recommendations = data.recommendations;
        displayRecommendations(state.recommendations);
    } catch (error) {
        console.error('Error loading recommendations:', error);
    }
}

function displayRecommendations(recommendations) {
    const recommendationsGrid = document.getElementById('recommendationsGrid');
    
    if (recommendations.length === 0) {
        recommendationsGrid.innerHTML = '<p>No recommendations available</p>';
        return;
    }
    
    recommendationsGrid.innerHTML = recommendations.map(rec => `
        <div class="recommendation-card" onclick="selectOutfit('${rec.id}')">
            <h4>${rec.name}</h4>
            <p>${rec.reason}</p>
            <small>Match: ${Math.round(rec.confidence * 100)}%</small>
        </div>
    `).join('');
}

function selectOutfit(outfitId) {
    if (!state.uploadedImage) {
        alert('Please upload an image first');
        navigateToPage('upload');
        return;
    }
    
    state.selectedOutfit = outfitId;
    processVirtualTryOn(outfitId);
}

async function processVirtualTryOn(outfitId) {
    // Show loading modal
    const loadingModal = document.getElementById('loadingModal');
    loadingModal.classList.add('active');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/try-on`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_image: state.uploadedImage,
                outfit_id: outfitId
            })
        });
        
        if (!response.ok) {
            throw new Error('Try-on processing failed');
        }
        
        const result = await response.json();
        state.resultImage = result.result_url;
        state.selectedOutfit = result.outfit;
        
        // Hide loading modal
        loadingModal.classList.remove('active');
        
        // Navigate to result page
        navigateToPage('result');
        displayResult(result);
        
    } catch (error) {
        console.error('Try-on error:', error);
        loadingModal.classList.remove('active');
        alert('Failed to process virtual try-on. Please try again.');
    }
}

function displayResult(result) {
    const beforeImage = document.getElementById('beforeImage');
    const afterImage = document.getElementById('afterImage');
    const outfitInfo = document.getElementById('outfitInfo');
    
    // Set images
    beforeImage.src = `${API_BASE_URL}/uploads/${state.uploadedImage}`;
    afterImage.src = `${API_BASE_URL}${result.result_url}`;
    
    // Display outfit information
    outfitInfo.innerHTML = `
        <h3>${result.outfit.name}</h3>
        <div class="outfit-meta">
            <span class="outfit-badge">${result.outfit.category}</span>
            <span class="outfit-badge">${result.outfit.color}</span>
            <span class="outfit-badge">${result.outfit.style}</span>
        </div>
        <p>Great choice! This outfit complements your style perfectly.</p>
    `;
}

function downloadResult() {
    if (!state.resultImage) {
        alert('No result image available');
        return;
    }
    
    const link = document.createElement('a');
    link.href = `${API_BASE_URL}${state.resultImage}`;
    link.download = `virtual-try-on-${Date.now()}.jpg`;
    link.click();
}

function shareResult() {
    if (navigator.share) {
        navigator.share({
            title: 'My Virtual Try-On Result',
            text: 'Check out how I look with this outfit!',
            url: window.location.href
        }).then(() => {
            console.log('Shared successfully');
        }).catch((error) => {
            console.log('Share cancelled');
        });
    } else {
        // Fallback - copy link to clipboard
        navigator.clipboard.writeText(window.location.href).then(() => {
            alert('Link copied to clipboard!');
        });
    }
}

// Utility functions
function showLoading(message = 'Loading...') {
    // You can implement a loading indicator here
    console.log(message);
}

function hideLoading() {
    // Hide loading indicator
}

function showError(message) {
    alert(message);
}

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        // Refresh data when page becomes visible
        if (state.outfits.length === 0) {
            loadOutfits();
        }
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + U to upload
    if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
        navigateToPage('upload');
    }
    
    // Escape to close modal
    if (e.key === 'Escape') {
        const loadingModal = document.getElementById('loadingModal');
        loadingModal.classList.remove('active');
    }
});

// Error handling for images
document.addEventListener('error', (e) => {
    if (e.target.tagName === 'IMG') {
        // Set placeholder for broken images
        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y0ZjRmNCIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2Ugbm90IGF2YWlsYWJsZTwvdGV4dD4KPC9zdmc+';
    }
}, true);
