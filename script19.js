document.addEventListener('DOMContentLoaded', () => {
    const imageItems = document.querySelectorAll('.image-item');
    const resetBtn = document.getElementById('reset-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    let currentRank = 1;

    // Function to load images from the image1 folder
    function loadImages() {
        console.log('Starting to load images for page 19...');
        
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
        referenceImage.src = './image1/ref.png';
        referenceImage.onload = () => console.log('Reference image loaded successfully');
        referenceImage.onerror = (e) => {
            console.error('Error loading reference image:', e);
            console.error('Reference image path:', referenceImage.src);
        };
        
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
    if (resetBtn) {
        resetBtn.addEventListener('click', resetRankings);
    }

    // Add navigation button event listeners
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            window.location.href = 'index18.html';
        });
    }

    // Enable the Next button if all images are ranked
    if (nextBtn) {
        nextBtn.disabled = !checkAllRanked();
    }

    // Add next button event listener
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            window.location.href = 'index20.html';
        });
    }

    // Initialize the page
    loadImages();
}); 