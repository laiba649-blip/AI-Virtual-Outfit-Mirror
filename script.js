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
    console.log('handleFileUpload called with file:', file);
    
    // Validate file
    if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
    }
    
    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        console.log('File reader loaded, showing preview');
        showImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
    
    // Upload to server
    try {
        console.log('Starting upload to server...');
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`${API_BASE_URL}/api/upload`, {
            method: 'POST',
            body: formData
        });
        
        console.log('Upload response status:', response.status);
        
        if (!response.ok) {
            throw new Error('Upload failed');
        }
        
        const result = await response.json();
        state.uploadedImage = result.filename;
        console.log('Image uploaded successfully:', result);
        console.log('Updated state:', state);
        
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
    
    // Navigate immediately and show loading
    navigateToPage('outfits');
    
    // Show quick loading message
    showLoading('Loading products...');
    
    // Load products directly without analysis
    setTimeout(() => {
        hideLoading();
        loadProductsForCategory('shirts');
    }, 500); // Short delay for better UX
}

// AI Analysis Functions - Simplified Version
function analyzeUserImageForRecommendations() {
    console.log('Using default analysis (no API call)');
    
    // Show default analysis immediately
    const defaultAnalysis = {
        skin_tone: "medium",
        body_structure: "medium", 
        face_shape: null,
        gender: null,
        color_palette: ["#FF6B6B", "#4ECDC4", "#45B7D1"],
        analysis_complete: true
    };
    
    state.userAnalysis = defaultAnalysis;
    showAnalysisResults(defaultAnalysis);
    loadProductsForCategory('shirts');
}

function showAnalysisResults(analysis) {
    // Create or update analysis results section
    let analysisSection = document.getElementById('analysisResults');
    
    if (!analysisSection) {
        // Create analysis section if it doesn't exist
        const outfitsPage = document.getElementById('outfits');
        const analysisHTML = `
            <div id="analysisResults" class="analysis-section">
                <h2>Your AI Style Analysis</h2>
                <div class="analysis-grid">
                    <div class="analysis-card">
                        <h3>Skin Tone</h3>
                        <div class="analysis-value">${analysis.skin_tone}</div>
                    </div>
                    <div class="analysis-card">
                        <h3>Body Structure</h3>
                        <div class="analysis-value">${analysis.body_structure}</div>
                    </div>
                    <div class="analysis-card">
                        <h3>Color Palette</h3>
                        <div class="color-palette">
                            ${analysis.color_palette.map(color => `
                                <div class="color-swatch" style="background-color: ${color};" title="${color}"></div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Insert after upload section
        const uploadSection = document.querySelector('.upload-section');
        uploadSection.insertAdjacentHTML('afterend', analysisHTML);
        
    } else {
        // Update existing analysis section
        analysisSection.innerHTML = `
            <h2>Your AI Style Analysis</h2>
            <div class="analysis-grid">
                <div class="analysis-card">
                    <h3>Skin Tone</h3>
                    <div class="analysis-value">${analysis.skin_tone}</div>
                </div>
                <div class="analysis-card">
                    <h3>Body Structure</h3>
                    <div class="analysis-value">${analysis.body_structure}</div>
                </div>
                <div class="analysis-card">
                    <h3>Color Palette</h3>
                    <div class="color-palette">
                        ${analysis.color_palette.map(color => `
                            <div class="color-swatch" style="background-color: ${color};" title="${color}"></div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
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
    
    // Show clothing categories first
    const categoriesHTML = `
        <div class="clothing-categories">
            <h3>Clothing Categories</h3>
            <div class="category-tabs">
                <button class="category-tab active" data-category="all" onclick="filterByCategory('all')">All</button>
                <button class="category-tab" data-category="shirts" onclick="filterByCategory('shirts')">Shirts</button>
                <button class="category-tab" data-category="tshirts" onclick="filterByCategory('tshirts')">T-Shirts</button>
                <button class="category-tab" data-category="jeans" onclick="filterByCategory('jeans')">Jeans</button>
                <button class="category-tab" data-category="jackets" onclick="filterByCategory('jackets')">Jackets</button>
                <button class="category-tab" data-category="shoes" onclick="filterByCategory('shoes')">Shoes</button>
                <button class="category-tab" data-category="womens_clothing" onclick="filterByCategory('womens_clothing')">Women's Clothing</button>
                <button class="category-tab" data-category="accessories" onclick="filterByCategory('accessories')">Accessories</button>
            </div>
        </div>
    `;
    
    // Insert categories before outfits grid
    outfitsGrid.insertAdjacentHTML('beforebegin', categoriesHTML);
    
    // Display outfits with recommendation scores
    outfitsGrid.innerHTML = outfits.map(outfit => `
        <div class="outfit-card" onclick="selectOutfit('${outfit.id}')">
            <img src="${outfit.image_url || 'https://via.placeholder.com/150x200/cccccc/ffffff/000000?text=Outfit'}" 
                 alt="${outfit.name}" 
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aDQoAEsAAABJRU5ErkJggg==';">
            <div class="outfit-card-content">
                <h3>${outfit.name}</h3>
                <div class="outfit-meta">
                    <span class="outfit-badge">${outfit.category}</span>
                    <span class="outfit-badge">${outfit.color}</span>
                </div>
                <button class="btn btn-primary" onclick="selectOutfit('${outfit.id}')">Try On</button>
            </div>
        </div>
    `).join('');
}

// Filter and Product Loading Functions
async function loadProductsForCategory(category) {
    try {
        console.log(`Loading products for category: ${category}`);
        showLoading('Loading products...');
        
        const response = await fetch(`${API_BASE_URL}/api/products?category=${category}`);
        const data = await response.json();
        
        console.log('Products data:', data);
        hideLoading();
        
        // Display products
        displayProducts(data.products);
        
    } catch (error) {
        console.error('Error loading products:', error);
        hideLoading();
        // Show sample products if API fails
        displayProducts([]);
    }
}

async function filterByCategory(category) {
    try {
        showLoading('Loading products...');
        
        const response = await fetch(`${API_BASE_URL}/api/products?category=${category}`);
        const data = await response.json();
        
        hideLoading();
        
        // Update active tab
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        
        // Display products
        displayProducts(data.products);
        
    } catch (error) {
        console.error('Error loading products:', error);
        hideLoading();
        alert('Failed to load products. Please try again.');
    }
}

function displayProducts(products) {
    console.log('Displaying products:', products);
    const outfitsGrid = document.getElementById('outfitsGrid');
    
    if (!outfitsGrid) {
        console.error('outfitsGrid element not found');
        return;
    }
    
    // Add clothing categories if they don't exist
    let categoriesSection = document.querySelector('.clothing-categories');
    if (!categoriesSection) {
        const categoriesHTML = `
            <div class="clothing-categories">
                <h3>Clothing Categories</h3>
                <div class="category-tabs">
                    <button class="category-tab active" data-category="shirts" onclick="filterByCategory('shirts')">Shirts</button>
                    <button class="category-tab" data-category="tshirts" onclick="filterByCategory('tshirts')">T-Shirts</button>
                    <button class="category-tab" data-category="jeans" onclick="filterByCategory('jeans')">Jeans</button>
                    <button class="category-tab" data-category="jackets" onclick="filterByCategory('jackets')">Jackets</button>
                    <button class="category-tab" data-category="shoes" onclick="filterByCategory('shoes')">Shoes</button>
                    <button class="category-tab" data-category="womens_clothing" onclick="filterByCategory('womens_clothing')">Women's Clothing</button>
                    <button class="category-tab" data-category="accessories" onclick="filterByCategory('accessories')">Accessories</button>
                </div>
            </div>
        `;
        
        // Insert categories before outfits grid
        outfitsGrid.insertAdjacentHTML('beforebegin', categoriesHTML);
    }
    
    if (products.length === 0) {
        outfitsGrid.innerHTML = '<p>No products available</p>';
        return;
    }
    
    // Display products with enhanced e-commerce layout
    outfitsGrid.innerHTML = products.map(product => {
        // Debug image URL
        console.log('Product image URL:', product.image);
        
        return `
        <div class="product-card">
            <div class="product-image-container">
                <img src="${product.image}" 
                     alt="${product.name}" 
                     class="product-image"
                     onclick="viewProduct('${product.product_url}')"
                     onerror="console.error('Failed to load image:', '${product.image}'); this.src='https://via.placeholder.com/150x200/cccccc/cccccc?text=Image+Not+Found';"
                     onload="console.log('✅ Image loaded successfully:', '${product.image}');"
                     style="width: 100%; height: 100%; object-fit: cover;">
                <div class="product-overlay">
                    <span class="view-product-btn" onclick="viewProduct('${product.product_url}')">View Product</span>
                </div>
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-meta">
                    <span class="store-badge ${product.store.toLowerCase()}">${product.store}</span>
                    <span class="price-tag">${product.price}</span>
                </div>
                <div class="suitability-score">
                    <div class="score-label">Suitability Score</div>
                    <div class="score-bar">
                        <div class="score-fill" style="width: ${product.score}%"></div>
                    </div>
                    <div class="score-value">${product.score}% Match</div>
                </div>
                <div class="product-actions">
                    <button class="btn btn-primary try-on-btn" onclick="selectProduct('${product.name}')">
                        <i class="fas fa-magic"></i> Try On
                    </button>
                    <button class="btn btn-secondary view-btn" onclick="viewProduct('${product.product_url}')">
                        <i class="fas fa-external-link-alt"></i> View Product
                    </button>
                </div>
            </div>
        </div>
    `;
    }).join('');
    
    console.log('Products displayed successfully');
    
    // Add a small delay to ensure images are loaded
    setTimeout(() => {
        const images = document.querySelectorAll('.product-image');
        console.log('Found images:', images.length);
        images.forEach((img, index) => {
            if (img.complete && img.naturalWidth > 0) {
                console.log(`✅ Image ${index + 1} loaded successfully:`, img.src);
            } else {
                console.log(`⚠️ Image ${index + 1} may not be loaded:`, img.src);
            }
        });
    }, 1000);
}

function viewProduct(productUrl) {
    console.log('Opening product URL:', productUrl);
    // Open product in new tab
    window.open(productUrl, '_blank');
}

async function selectProduct(productName) {
    console.log('selectProduct called with:', productName);
    
    if (!state.uploadedImage) {
        alert('Please upload an image first');
        navigateToPage('upload');
        return;
    }
    
    // Show loading modal
    const loadingModal = document.getElementById('loadingModal');
    loadingModal.classList.add('active');

    try {
        // Create a proper outfit ID for the virtual try-on system
        // The try-on system expects outfit IDs from the LOCAL_OUTFIT_CATALOG
        const outfitId = findMatchingOutfit(productName);
        
        console.log('Processing virtual try-on for outfit:', outfitId);
        console.log('Making API call to:', `${API_BASE_URL}/api/try-on`);
        console.log('Request body:', JSON.stringify({
            user_image: state.uploadedImage,
            outfit_id: outfitId
        }));

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

        console.log('API response status:', response.status);

        if (!response.ok) {
            throw new Error(`Try-on processing failed: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        console.log('API response data:', result);

        state.resultImage = result.result_url;
        state.selectedOutfit = {
            name: productName,
            category: 'product',
            color: 'various',
            style: 'modern'
        };

        // Hide loading modal
        loadingModal.classList.remove('active');

        // Navigate to result page
        console.log('Navigating to result page...');
        navigateToPage('result');
        console.log('Calling displayResult...');
        displayResult(result);

    } catch (error) {
        console.error('Try-on error:', error);
        loadingModal.classList.remove('active');
        alert('Failed to process virtual try-on. Please try again.');
    }
}

// Helper function to match product names with outfit IDs
function findMatchingOutfit(productName) {
    // Map product names to existing outfit IDs for compatibility
    const productMapping = {
        // Shirts
        'Navy Blue Slim Fit Shirt': 'shirt1',
        'Classic White Formal Shirt': 'shirt2', 
        'Light Blue Casual Shirt': 'shirt3',
        
        // T-Shirts
        'Graphic Print T-Shirt': 'tshirt1',
        'Oversized Street T-Shirt': 'tshirt2',
        
        // Jeans
        'Slim Fit Blue Jeans': 'jeans1',
        'Classic Black Jeans': 'jeans2',
        
        // Jackets
        'Denim Jacket': 'jacket1',
        'Leather Biker Jacket': 'jacket2',
        
        // Shoes
        'White Sneakers': 'shoes1',
        'Black Formal Shoes': 'shoes2',
        
        // Women's Clothing
        'Floral Summer Dress': 'dress1',
        'Elegant Evening Gown': 'dress2',
        
        // Accessories
        'Classic Leather Belt': 'accessories1',
        'Designer Sunglasses': 'accessories2'
    };
    
    // Return matching outfit ID or default
    return productMapping[productName] || 'shirt1';
}

function showProductPreview(productName) {
    // Create preview modal
    const modal = document.createElement('div');
    modal.className = 'product-preview-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Product Preview</h3>
            <div class="preview-grid">
                <div class="preview-image">
                    <img src="https://via.placeholder.com/200x250/cccccc/ffffff/000000?text=Product+Preview" alt="Product Preview">
                </div>
                <div class="preview-info">
                    <h4>${productName}</h4>
                    <p>This product will be applied to your uploaded image for virtual try-on.</p>
                    <div class="preview-actions">
                        <button class="btn btn-secondary" onclick="closeProductPreview()">Close</button>
                        <button class="btn btn-primary" onclick="applyProductToTryOn('${productName}')">Apply to Try-On</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeProductPreview();
        }
    });
}

function closeProductPreview() {
    const modal = document.querySelector('.product-preview-modal');
    if (modal) {
        modal.remove();
    }
}

function applyProductToTryOn(productName) {
    // This would integrate with the existing virtual try-on system
    // For now, we'll use the existing outfit selection
    console.log(`Applying product ${productName} to virtual try-on`);
    
    // Find the product in our current outfits and select it
    const outfit = state.outfits.find(o => o.id === productName);
    if (outfit) {
        selectOutfit(productName);
    } else {
        alert('Product not found in current outfits');
        closeProductPreview();
    }
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
    console.log('selectOutfit called with outfitId:', outfitId);
    console.log('Current state before selection:', state);
    
    if (!state.uploadedImage) {
        console.log('No uploaded image found, redirecting to upload');
        alert('Please upload an image first');
        navigateToPage('upload');
        return;
    }
    
    console.log('Setting selected outfit and processing try-on...');
    state.selectedOutfit = outfitId;
    processVirtualTryOn(outfitId);
}

async function processVirtualTryOn(outfitId) {
    console.log('processVirtualTryOn called with outfitId:', outfitId);
    console.log('Current state:', state);
    
    // Show loading modal
    const loadingModal = document.getElementById('loadingModal');
    loadingModal.classList.add('active');
    
    try {
        console.log('Making API call to:', `${API_BASE_URL}/api/try-on`);
        console.log('Request body:', JSON.stringify({
            user_image: state.uploadedImage,
            outfit_id: outfitId
        }));
        
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
        
        console.log('API response status:', response.status);
        console.log('API response headers:', response.headers);
        
        if (!response.ok) {
            throw new Error(`Try-on processing failed: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('API response data:', result);
        
        state.resultImage = result.result_url;
        state.selectedOutfit = result.outfit;
        
        // Hide loading modal
        loadingModal.classList.remove('active');
        
        // Navigate to result page
        console.log('Navigating to result page...');
        navigateToPage('result');
        console.log('Calling displayResult...');
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
    
    // Debug logging
    console.log('DisplayResult called with:', result);
    console.log('State uploadedImage:', state.uploadedImage);
    console.log('Before image URL:', `${API_BASE_URL}/uploads/${state.uploadedImage}`);
    console.log('After image URL:', `${API_BASE_URL}${result.result_url}`);
    console.log('Elements found:', {
        beforeImage: !!beforeImage,
        afterImage: !!afterImage,
        outfitInfo: !!outfitInfo
    });
    
    // Set images
    beforeImage.src = `${API_BASE_URL}/uploads/${state.uploadedImage}`;
    afterImage.src = `${API_BASE_URL}${result.result_url}`;
    
    // Add image load event listeners for debugging
    afterImage.onload = () => {
        console.log('After image loaded successfully');
        console.log('After image dimensions:', afterImage.naturalWidth, 'x', afterImage.naturalHeight);
    };
    afterImage.onerror = (e) => {
        console.error('After image failed to load:', e);
        console.error('After image src that failed:', afterImage.src);
    };
    
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

// Error handling for images - FIXED VERSION
document.addEventListener('error', (e) => {
    if (e.target.tagName === 'IMG') {
        // Set placeholder for broken images
        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y0ZjRmNCIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2Ugbm90IGF2YWlsYWJsZTwvdGV4dD4KPC9zdmc+';
    }
}, true);
