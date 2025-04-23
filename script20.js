document.addEventListener('DOMContentLoaded', () => {
    const imageItems = document.querySelectorAll('.image-item');
    const submitButton = document.getElementById('submit-btn');
    const resetButton = document.getElementById('reset-btn');
    const prevButton = document.getElementById('prev-btn');
    let currentRank = 1;

    // Initialize Firebase with error handling
    let database;
    try {
        const firebaseConfig = {
            apiKey: "AIzaSyDPRT2KSfmTHs6n5RYY-gJd4EOFw3Le9Q8",
            authDomain: "igcp-survay.firebaseapp.com",
            databaseURL: "https://igcp-survay-default-rtdb.firebaseio.com",
            projectId: "igcp-survay",
            storageBucket: "igcp-survay.firebasestorage.app",
            messagingSenderId: "793385772963",
            appId: "1:793385772963:web:2a7f9882673063f0f4dc16"
        };

        // Initialize Firebase
        const app = firebase.initializeApp(firebaseConfig);
        database = firebase.database();
        console.log('Firebase initialized successfully');
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        alert('Error initializing database. Please check console for details.');
    }

    // Function to load images from the image1 folder
    function loadImages() {
        console.log('Starting to load images for page 20...');
        
        const referenceImage = document.getElementById('reference-img');
        if (!referenceImage) {
            console.error('Reference image element not found');
            return;
        }
        
        const superResImages = document.querySelectorAll('.super-res-image');
        if (superResImages.length === 0) {
            console.error('No super-resolved images found');
            return;
        }
        
        // Load reference image
        referenceImage.src = './Synthetic samples/sample_12866/0_HQ_12866.jpg';
        referenceImage.onload = () => console.log('Reference image loaded successfully');
        referenceImage.onerror = (e) => {
            console.error('Error loading reference image:', e);
            console.error('Reference image path:', referenceImage.src);
        };
        
        // Define the image filenames in order
        const imageFiles = [
            '2_GFPGAN_12866.jpg',
            '7_restored_faces_IGPN_new_ep39_vqgan_dec_15000_12866.jpg',
            '5_VQFR_12866.jpg',
            '9_difface12866.png',
            '3_GPEN_12866.jpg',
            '10_difbir12866.png',
            '4_CodeFormer_12866.jpg',
            '8_pgdiff_12866.jpg',
            '6_DR2_12866.jpg'
        ];
        
        // Load super-resolved images
        superResImages.forEach((img, index) => {
            if (index < imageFiles.length) {
                const imagePath = `./Synthetic samples/sample_12866/${imageFiles[index]}`;
                console.log(`Loading image ${index + 1}: ${imagePath}`);
                img.src = imagePath;
                img.onload = () => {
                    console.log(`Successfully loaded image ${index + 1}: ${imageFiles[index]}`);
                    console.log(`Image dimensions: ${img.naturalWidth}x${img.naturalHeight}`);
                };
                img.onerror = (e) => {
                    console.error(`Error loading image ${index + 1}: ${imageFiles[index]}`);
                    console.error(`Image path: ${imagePath}`);
                    console.error(`Error details:`, e);
                };
            } else {
                console.warn(`No image file defined for index ${index}`);
            }
        });

        // Initialize comparison sliders
        initializeSliders();
    }

    // Function to initialize comparison sliders
    function initializeSliders() {
        const sliders = document.querySelectorAll('.comparison-slider');
        const referenceImage = document.getElementById('reference-img');
        
        if (!referenceImage) {
            console.error('Reference image not found for slider initialization');
            return;
        }
        
        sliders.forEach(slider => {
            const imageWrapper = slider.closest('.image-item')?.querySelector('.image-wrapper');
            if (!imageWrapper) {
                console.error('Image wrapper not found for slider');
                return;
            }
            
            const superResImage = imageWrapper.querySelector('.super-res-image');
            if (!superResImage) {
                console.error('Super-resolved image not found for slider');
                return;
            }
            
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

    // Function to check if all images are ranked
    function checkAllRanked() {
        const rankedItems = Array.from(imageItems)
            .filter(item => item.dataset.rank !== '' && item.dataset.rank !== '0');
        const rankedCount = rankedItems.length;
        const allRanked = rankedCount === 9;
        
        // Log detailed ranking information
        console.log('Current rankings:');
        imageItems.forEach((item, index) => {
            const rank = item.dataset.rank;
            const imageSrc = item.querySelector('.super-res-image')?.src.split('/').pop();
            console.log(`Image ${index + 1} (${imageSrc}): ${rank || 'not ranked'}`);
        });
        
        console.log(`Ranked images: ${rankedCount}/9`);
        return allRanked;
    }

    // Function to update rank overlays
    function updateRankOverlays() {
        imageItems.forEach(item => {
            const overlay = item.querySelector('.rank-overlay');
            const rank = item.dataset.rank;
            if (overlay) {
                overlay.textContent = rank || '';
            }
        });
    }

    // Function to handle image click
    function handleImageClick(e) {
        const imageItem = e.currentTarget.closest('.image-item');
        if (!imageItem) return;
        
        const currentItemRank = imageItem.dataset.rank;

        if (currentItemRank) {
            // If already ranked, remove rank
            imageItem.dataset.rank = '';
            currentRank = 1; // Reset current rank
            // Reorder remaining ranks
            const rankedItems = Array.from(imageItems)
                .filter(item => item.dataset.rank !== '')
                .sort((a, b) => parseInt(a.dataset.rank) - parseInt(b.dataset.rank));
            
            rankedItems.forEach((item, index) => {
                item.dataset.rank = (index + 1).toString();
            });
            currentRank = rankedItems.length + 1;
        } else {
            // If not ranked and we haven't ranked all images
            if (currentRank <= 9) {
                imageItem.dataset.rank = currentRank.toString();
                currentRank++;
            }
        }

        updateRankOverlays();
        checkAllRanked();
    }

    // Function to reset rankings
    function resetRankings() {
        imageItems.forEach(item => {
            item.dataset.rank = '';
        });
        currentRank = 1;
        updateRankOverlays();
        checkAllRanked();
    }

    // Function to submit rankings
    async function submitRankings() {
        try {
            if (!database) {
                throw new Error('Database not initialized');
            }

            // Check if all images are ranked
            if (!checkAllRanked()) {
                throw new Error('Please rank all images before submitting');
            }

            // Get current page rankings first
            const currentPageRankings = Array.from(imageItems)
                .map(item => ({
                    imageId: item.querySelector('.super-res-image')?.src.split('/').pop(),
                    rank: parseInt(item.dataset.rank)
                }))
                .sort((a, b) => a.rank - b.rank);

            console.log('Current page (20) rankings:', currentPageRankings);

            // Save page 20 rankings to localStorage first
            try {
                localStorage.setItem('page_20_rankings', JSON.stringify(currentPageRankings));
                console.log('Successfully saved page 20 rankings to localStorage');
            } catch (e) {
                console.error('Error saving page 20 rankings to localStorage:', e);
                throw new Error('Failed to save page 20 rankings');
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
            
            // Add page 20 rankings first
            allRankings['Page 20'] = currentPageRankings;
            
            // Then add other pages
            for (let page = 1; page <= 19; page++) {
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
            for (let page = 1; page <= 20; page++) {
                localStorage.removeItem(`page_${page}_rankings`);
            }
            localStorage.removeItem('userId');

            alert('Thank you for your participation! Your rankings have been saved successfully.');
            window.location.href = 'thankyou.html';
        } catch (error) {
            console.error('Error submitting rankings:', error);
            alert('Error saving rankings: ' + error.message);
        }
    }

    // Add click event listeners to image wrappers
    imageItems.forEach(item => {
        const wrapper = item.querySelector('.image-wrapper');
        if (wrapper) {
            wrapper.addEventListener('click', handleImageClick);
        } else {
            console.error('Image wrapper not found for item:', item);
        }
    });

    // Add reset button event listener
    if (resetButton) {
        resetButton.addEventListener('click', resetRankings);
    }

    // Add navigation button event listeners
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            window.location.href = 'index19.html';
        });
    }

    // Add submit button event listener
    if (submitButton) {
        submitButton.addEventListener('click', submitRankings);
    }

    // Initialize the page
    loadImages();
}); 