document.addEventListener('DOMContentLoaded', () => {
    const imageItems = document.querySelectorAll('.image-item');
    const resetBtn = document.getElementById('reset-btn');
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    let currentRank = 1;

    // Function to load images from the image1 folder
    function loadImages() {
        console.log('Starting to load images for page 3...');
        
        const referenceImage = document.getElementById('reference-img');
        const superResImages = document.querySelectorAll('.super-res-image');
        
        // Load reference image
        referenceImage.src = './image1/ref.png';
        referenceImage.onload = () => console.log('Reference image loaded successfully');
        referenceImage.onerror = () => console.error('Error loading reference image');
        
        // Define the image filenames in order
        const imageFiles = [
            '1_IGCP-v1.png',
            '2_VQFR.jpg',
            '3_codeformer.png',
            '4_DR2.jpg',
            '5_GPEN.png',
            '6_GFPGAN.jpg',
            '7_PULSE.jpg',
            '1_IGCP-v1.png',  // Reusing first image for now
            '2_VQFR.jpg'      // Reusing second image for now
        ];
        
        // Load super-resolved images
        superResImages.forEach((img, index) => {
            if (index < imageFiles.length) {
                const imagePath = `./image1/${imageFiles[index]}`;
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

    // Function to check if all images are ranked
    function checkAllRanked() {
        const rankedCount = Array.from(imageItems)
            .filter(item => item.dataset.rank !== '' && item.dataset.rank !== '0')
            .length;
        const allRanked = rankedCount === 9;
        nextBtn.disabled = !allRanked;
        console.log(`Ranked images: ${rankedCount}/9, Next button ${allRanked ? 'enabled' : 'disabled'}`);
        return allRanked;
    }

    // Function to update rank overlays
    function updateRankOverlays() {
        imageItems.forEach(item => {
            const overlay = item.querySelector('.rank-overlay');
            const rank = item.dataset.rank;
            if (rank && rank !== '0') {
                overlay.textContent = rank;
            } else {
                overlay.textContent = '';
                item.dataset.rank = '0';
            }
        });
    }

    // Function to handle image click
    function handleImageClick(e) {
        const imageItem = e.currentTarget.closest('.image-item');
        const currentItemRank = imageItem.dataset.rank;

        if (currentItemRank && currentItemRank !== '0') {
            // If already ranked, remove rank
            imageItem.dataset.rank = '0';
            currentRank = 1; // Reset current rank
            // Reorder remaining ranks
            const rankedItems = Array.from(imageItems)
                .filter(item => item.dataset.rank !== '0')
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
            item.dataset.rank = '0';
        });
        currentRank = 1;
        updateRankOverlays();
        checkAllRanked();
    }

    // Add click event listeners to image wrappers
    imageItems.forEach(item => {
        item.dataset.rank = '0'; // Initialize with rank 0
        const wrapper = item.querySelector('.image-wrapper');
        wrapper.addEventListener('click', handleImageClick);
    });

    // Add reset button event listener
    resetBtn.addEventListener('click', resetRankings);

    // Add navigation button event listeners
    prevBtn.addEventListener('click', () => {
        window.location.href = 'index2.html';
    });

    nextBtn.addEventListener('click', () => {
        if (!checkAllRanked()) {
            alert('Please rank all images before proceeding');
            return;
        }

        // Store current page rankings before navigating
        const rankings = Array.from(imageItems)
            .map(item => ({
                imageId: item.querySelector('.super-res-image').src.split('/').pop(),
                rank: parseInt(item.dataset.rank)
            }))
            .sort((a, b) => a.rank - b.rank);

        localStorage.setItem('page_3_rankings', JSON.stringify(rankings));
        console.log('Saved page 3 rankings:', rankings);
        window.location.href = 'index4.html';
    });

    // Initialize the page
    loadImages();
    resetRankings(); // Initialize rankings
    nextBtn.disabled = true; // Start with next button disabled
}); 