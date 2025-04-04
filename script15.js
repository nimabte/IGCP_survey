document.addEventListener('DOMContentLoaded', () => {
    const imageItems = document.querySelectorAll('.image-item');
    const submitButton = document.getElementById('submit-btn');
    const resetButton = document.getElementById('reset-btn');
    const prevButton = document.getElementById('prev-btn');

    // Initialize Firebase with error handling
    let database;
    try {
        const firebaseConfig = {
            apiKey: "AIzaSyA1WUzEyIFdvzc4MxBDy2SatkGaQuIb2w0",
            authDomain: "face-sr.firebaseapp.com",
            databaseURL: "https://face-sr-default-rtdb.firebaseio.com",
            projectId: "face-sr",
            storageBucket: "face-sr.firebasestorage.app",
            messagingSenderId: "384091299102",
            appId: "1:384091299102:web:f63915dea8dbaeeaccfd0f"
        };

        firebase.initializeApp(firebaseConfig);
        database = firebase.database();
        console.log('Firebase initialized successfully');

        // Test write to Firebase
        const testRef = database.ref('test');
        testRef.set({
            timestamp: Date.now(),
            status: 'connected'
        })
        .then(() => console.log('Test write to Firebase successful'))
        .catch(error => console.error('Test write failed:', error));
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        alert('Error initializing database. Please check console for details.');
    }

    // Function to check if all images are ranked
    function areAllImagesRanked() {
        return Array.from(imageItems).every(item => item.dataset.rank !== '0');
    }

    // Function to update rank overlay
    function updateRankOverlay(item) {
        const rankOverlay = item.querySelector('.rank-overlay');
        const rank = item.dataset.rank;
        rankOverlay.textContent = rank === '0' ? '' : rank;
    }

    // Function to handle image click for ranking
    function handleImageClick(item) {
        const currentRank = parseInt(item.dataset.rank);
        const nextRank = currentRank === 0 ? 1 : 0;
        
        // Reset all ranks if clicking a ranked image
        if (currentRank !== 0) {
            imageItems.forEach(img => {
                img.dataset.rank = '0';
                updateRankOverlay(img);
            });
            return;
        }

        // Find the next available rank
        const usedRanks = new Set(Array.from(imageItems)
            .map(img => parseInt(img.dataset.rank))
            .filter(rank => rank > 0));
        
        let newRank = 1;
        while (usedRanks.has(newRank)) {
            newRank++;
        }

        item.dataset.rank = newRank.toString();
        updateRankOverlay(item);

        // Enable/disable submit button based on ranking completion
        submitButton.disabled = !areAllImagesRanked();
    }

    // Function to reset rankings
    function resetRankings() {
        imageItems.forEach(item => {
            item.dataset.rank = '0';
            updateRankOverlay(item);
        });
        submitButton.disabled = true;
    }

    // Function to load images
    function loadImages() {
        console.log('Starting to load images for page 15...');
        
        const referenceImage = document.getElementById('reference-img');
        const superResImages = document.querySelectorAll('.super-res-image');
        
        // Load reference image
        const refPath = 'image1/ref.png';
        console.log(`Loading reference image from: ${refPath}`);
        referenceImage.src = refPath;
        referenceImage.onload = () => console.log('Reference image loaded successfully');
        referenceImage.onerror = (e) => {
            console.error('Error loading reference image:', e);
            console.error('Reference image path:', refPath);
        };
        
        // Define the image filenames in order
        const imageFiles = [
            '1_IGCP-v1.png',
            '2_VQFR.jpg',
            '3_codeformer.png',
            '4_DR2.jpg',
            '5_GPEN.png',
            '6_GFPGAN.jpg'
        ];
        
        // Load super-resolved images
        superResImages.forEach((img, index) => {
            if (index >= imageFiles.length) {
                console.error(`No image file defined for index ${index}`);
                return;
            }
            
            const imagePath = `image1/${imageFiles[index]}`;
            console.log(`Loading image ${index + 1} from: ${imagePath}`);
            
            img.src = imagePath;
            img.onload = () => {
                console.log(`Successfully loaded image ${index + 1}: ${imageFiles[index]}`);
                console.log('Image dimensions:', img.naturalWidth, 'x', img.naturalHeight);
            };
            img.onerror = (e) => {
                console.error(`Error loading image ${index + 1}:`, e);
                console.error('Image path:', imagePath);
            };
        });

        // Initialize comparison sliders
        console.log('Initializing comparison sliders...');
        initializeSliders();
    }

    // Function to initialize comparison sliders
    function initializeSliders() {
        const sliders = document.querySelectorAll('.comparison-slider');
        const referenceImage = document.getElementById('reference-img');
        
        sliders.forEach(slider => {
            const imageWrapper = slider.closest('.image-item').querySelector('.image-wrapper');
            const superResImage = imageWrapper.querySelector('.super-res-image');
            
            // Create a new image element for the reference image
            const refImage = document.createElement('img');
            refImage.src = referenceImage.src;
            refImage.alt = 'Reference Image';
            refImage.className = 'reference-image-overlay';
            imageWrapper.appendChild(refImage);

            // Set initial slider position to rightmost (100%)
            slider.value = 100;
            // Set initial clip position to show full super-resolved image
            imageWrapper.style.setProperty('--clip-position', '100%');

            // Handle slider input
            slider.addEventListener('input', (e) => {
                const value = e.target.value;
                imageWrapper.style.setProperty('--clip-position', `${value}%`);
            });

            // Reset slider on mouseup
            slider.addEventListener('mouseup', () => {
                setTimeout(() => {
                    slider.value = 100;
                    imageWrapper.style.setProperty('--clip-position', '100%');
                }, 1000);
            });
        });
    }

    // Function to submit rankings
    async function submitRankings() {
        try {
            if (!database) {
                throw new Error('Database not initialized');
            }

            // Check if all images are ranked
            if (!areAllImagesRanked()) {
                throw new Error('Please rank all images before submitting');
            }

            // Get current page rankings first
            const currentPageRankings = Array.from(imageItems)
                .map(item => ({
                    imageId: item.querySelector('.super-res-image').src.split('/').pop(),
                    rank: parseInt(item.dataset.rank)
                }))
                .sort((a, b) => a.rank - b.rank);

            console.log('Current page (15) rankings:', currentPageRankings);

            // Save page 15 rankings to localStorage first
            try {
                localStorage.setItem('page_15_rankings', JSON.stringify(currentPageRankings));
                console.log('Successfully saved page 15 rankings to localStorage');
            } catch (e) {
                console.error('Error saving page 15 rankings to localStorage:', e);
                throw new Error('Failed to save page 15 rankings');
            }

            // Get or create user ID
            let userId = localStorage.getItem('userId');
            if (!userId) {
                userId = 'user_' + Date.now();
                localStorage.setItem('userId', userId);
            }
            console.log('Using userId:', userId);

            // Collect all available page rankings
            const allRankings = {};
            
            // Add page 15 rankings first
            allRankings['Page 15'] = currentPageRankings;
            
            // Then add other pages
            for (let page = 1; page <= 14; page++) {
                const pageRankings = localStorage.getItem(`page_${page}_rankings`);
                if (pageRankings) {
                    try {
                        allRankings[`Page ${page}`] = JSON.parse(pageRankings);
                        console.log(`Loaded rankings for page ${page}:`, allRankings[`Page ${page}`]);
                    } catch (e) {
                        console.error(`Error parsing rankings for page ${page}:`, e);
                    }
                } else {
                    console.log(`No rankings found for page ${page}`);
                }
            }

            console.log('Final rankings to save:', allRankings);

            // Save to Firebase
            const rankingsRef = database.ref('rankings/' + userId);
            await rankingsRef.set({
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                rankings: allRankings
            });

            console.log('Successfully saved all rankings to Firebase');

            // Clear local storage after successful submission
            for (let page = 1; page <= 15; page++) {
                localStorage.removeItem(`page_${page}_rankings`);
            }
            localStorage.removeItem('userId');

            alert('Thank you for your participation! Your rankings have been saved successfully.');
            window.location.href = '/thankyou.html';
        } catch (error) {
            console.error('Error submitting rankings:', error);
            alert('Error saving rankings: ' + error.message);
        }
    }

    // Add event listeners
    imageItems.forEach(item => {
        item.addEventListener('click', () => handleImageClick(item));
    });

    resetButton.addEventListener('click', resetRankings);
    prevButton.addEventListener('click', () => {
        window.location.href = 'index14.html';
    });
    submitButton.addEventListener('click', submitRankings);

    // Initialize the page
    loadImages();
}); 