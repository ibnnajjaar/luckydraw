$(document).ready(function() {
    // Load saved logo from localStorage
    const savedLogo = localStorage.getItem('luckyDrawLogo');
    if (savedLogo) {
        $('#logoImage').attr('src', savedLogo);
    }

    // Load saved title from localStorage
    const savedTitle = localStorage.getItem('luckyDrawTitle');
    if (savedTitle) {
        $('#titleText').text(savedTitle);
        $('#titleInput').val(savedTitle);
    }

    // Make title editable
    $('#titleText').click(function() {
        $(this).addClass('hidden');
        $('#titleInput').removeClass('hidden').focus();
    });

    // Handle title input blur and enter key
    $('#titleInput').on('blur keypress', function(e) {
        if (e.type === 'blur' || e.which === 13) {
            e.preventDefault();
            const newTitle = $(this).val().trim() || 'Lucky Number Generator';
            $('#titleText').text(newTitle).removeClass('hidden');
            $(this).addClass('hidden');
            localStorage.setItem('luckyDrawTitle', newTitle);
        }
    });

    // Handle logo upload
    $('#logoInput').change(function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const logoData = e.target.result;
                $('#logoImage').attr('src', logoData);
                localStorage.setItem('luckyDrawLogo', logoData);
            };
            reader.readAsDataURL(file);
        }
    });

    // Add new range group
    $('#addRange').click(function() {
        const newRange = $('.range-group').first().clone();
        newRange.find('input').val('');
        $('#rangeContainer').append(newRange);
    });

    // Remove range group
    $(document).on('click', '.remove-range', function() {
        if ($('.range-group').length > 1) {
            $(this).closest('.range-group').remove();
        }
    });

    $('#spinButton').click(function() {
        let availableNumbers = [];
        let isValid = true;

        // Collect numbers from all ranges
        $('.range-group').each(function() {
            const min = parseInt($(this).find('.min-number').val());
            const max = parseInt($(this).find('.max-number').val());

            if (isNaN(min) || isNaN(max)) {
                alert('Please enter valid numbers in all ranges');
                isValid = false;
                return false;
            }

            if (min >= max) {
                alert('Maximum number must be greater than minimum number in all ranges');
                isValid = false;
                return false;
            }

            for (let i = min; i <= max; i++) {
                availableNumbers.push(i);
            }
        });

        if (!isValid) return;

        // Process excluded numbers
        const excludeStr = $('#excludeNumbers').val().trim();
        const excludeNumbers = excludeStr ? excludeStr.split(',').map(num => parseInt(num.trim())) : [];
        
        availableNumbers = availableNumbers.filter(num => !excludeNumbers.includes(num));

        if (availableNumbers.length === 0) {
            alert('No available numbers to choose from after exclusions');
            return;
        }

        const randomIndex = Math.floor(Math.random() * availableNumbers.length);
        const finalNumber = availableNumbers[randomIndex];

        // Show modal and start animation
        $('.modal-backdrop, .modal').show();
        
        let currentNumber = availableNumbers[0];
        const animationDuration = 2000;
        const interval = 50;
        const startTime = Date.now();

        const animation = setInterval(function() {
            const elapsedTime = Date.now() - startTime;
            
            if (elapsedTime < animationDuration) {
                currentNumber = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
                $('#modalNumber').text(currentNumber);
            } else {
                clearInterval(animation);
                $('#modalNumber').text(finalNumber);
                
                // Add confetti celebration
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
                
                // Continue confetti for 2 seconds
                const duration = 2000;
                const end = Date.now() + duration;
                
                (function frame() {
                    confetti({
                        particleCount: 2,
                        angle: 60,
                        spread: 55,
                        origin: { x: 0 }
                    });
                    confetti({
                        particleCount: 2,
                        angle: 120,
                        spread: 55,
                        origin: { x: 1 }
                    });
                    
                    if (Date.now() < end) {
                        requestAnimationFrame(frame);
                    }
                }());
            }
        }, interval);
    });

    // Handle modal close
    $('#closeModal, .modal-backdrop').click(function() {
        $('.modal-backdrop, .modal').hide();
        
        // Clear any remaining confetti
        confetti.reset();
        
        // Add the chosen number to exclude list
        const chosenNumber = $('#modalNumber').text();
        const excludeInput = $('#excludeNumbers');
        const currentExclude = excludeInput.val();
        
        excludeInput.val(currentExclude ? 
            currentExclude + ',' + chosenNumber : 
            chosenNumber);
        
        // Update the main result display
        $('#randomNumber').text(chosenNumber);
        $('#result').removeClass('hidden');
    });

    // Prevent modal close when clicking modal content
    $('.modal').click(function(e) {
        e.stopPropagation();
    });
});