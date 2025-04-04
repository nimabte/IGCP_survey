document.addEventListener('DOMContentLoaded', () => {
    const imageItems = document.querySelectorAll('.image-item');
    const submitButton = document.getElementById('submit-btn');
    const resetButton = document.getElementById('reset-btn');
    const prevButton = document.getElementById('prev-btn');

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
        referenceImage.src = 'image1/ref.png';
        referenceImage.onload = () => console.log('Reference image loaded successfully');
        referenceImage.onerror = () => console.error('Error loading reference image');
        
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
            const imagePath = `image1/${imageFiles[index]}`;
            console.log(`Loading image: ${imagePath}`);
            img.src = imagePath;
            img.onload = () => console.log(`Successfully loaded: ${imageFiles[index]}`);
            img.onerror = (e) => console.error(`Error loading image: ${imageFiles[index]}`, e);
        });

        // Initialize comparison sliders
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

    // Initialize Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyA1WUzEyIFdvzc4MxBDy2SatkGaQuIb2w0",
        authDomain: "face-sr.firebaseapp.com",
        databaseURL: "https://face-sr-default-rtdb.firebaseio.com",
        projectId: "face-sr",
        storageBucket: "face-sr.firebasestorage.app",
        messagingSenderId: "384091299102",
        appId: "1:384091299102:web:f63915dea8dbaeeaccfd0f"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();

    // Function to submit rankings
    async function submitRankings() {
        try {
            // Get or create user ID
            let userId = localStorage.getItem('userId');
            if (!userId) {
                userId = 'user_' + Date.now();
                localStorage.setItem('userId', userId);
            }

            // Save current page rankings
            const currentPageRankings = Array.from(imageItems)
                .map(item => ({
                    imageId: item.querySelector('.super-res-image').src.split('/').pop(),
                    rank: parseInt(item.dataset.rank)
                }))
                .sort((a, b) => a.rank - b.rank);

            // Collect all available page rankings
            const allRankings = {};
            for (let page = 1; page <= 15; page++) {
                const pageRankings = localStorage.getItem(`page_${page}_rankings`);
                if (pageRankings) {
                    try {
                        allRankings[`Page ${page}`] = JSON.parse(pageRankings);
                        console.log(`Loaded rankings for page ${page}:`, allRankings[`Page ${page}`]);
                    } catch (e) {
                        console.error(`Error parsing rankings for page ${page}:`, e);
                    }
                }
            }

            console.log('Saving rankings to Firebase:', allRankings);

            // Save to Firebase
            const rankingsRef = database.ref('rankings/' + userId);
            await rankingsRef.set({
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                rankings: allRankings
            });

            console.log('Successfully saved to Firebase');

            // Clear local storage after successful submission
            for (let page = 1; page <= 15; page++) {
                localStorage.removeItem(`page_${page}_rankings`);
            }
            localStorage.removeItem('userId');

            alert('Thank you for your participation! Your rankings have been saved successfully.');
            window.location.href = '/thank-you.html';
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