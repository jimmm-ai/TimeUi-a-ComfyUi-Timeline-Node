// Component Input
class ContentSelector extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.currentIndex = 0;
        this.values = this.getAttribute('values').split(',');
        this.label = this.getAttribute('label');

        this.shadowRoot.innerHTML = `
            <div class="preset-container">
                <div class="arrow left-arrow"></div>
                <label class="preset-text">${this.label} <strong class="value" id="content">${this.values[this.currentIndex]}</strong></label>
                <div class="arrow right-arrow"></div>
            </div>

            <style>
                .preset-container {
                    display: flex;
                    align-items: center;
                    background-color: #222222;
                    padding: 4px 8px;
                    border-radius: 8px;
                    border: 1px solid #555;
                    color: #ccc;
                }

                .arrow {
                    width: 0;
                    height: 0;
                    border-top: 5px solid transparent;
                    border-bottom: 5px solid transparent;
                    cursor: pointer;
                }

                .left-arrow {
                    border-right: 8px solid #ccc;
                    margin-right: 10px;
                }

                .right-arrow {
                    border-left: 8px solid #ccc;
                    margin-left: 10px;
                }

                .preset-text {
                    font-size: 12px;
                }

                .preset-text strong {
                    color: white;
                }
            </style>
        `;

        this.shadowRoot.querySelector('.left-arrow').addEventListener('click', () => this.prevContent());
        this.shadowRoot.querySelector('.right-arrow').addEventListener('click', () => this.nextContent());
    }

    updateContent() {
        this.shadowRoot.getElementById('content').innerText = this.values[this.currentIndex];
    }

    prevContent() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.updateContent();
        }
    }

    nextContent() {
        if (this.currentIndex < this.values.length - 1) {
            this.currentIndex++;
            this.updateContent();
        }
    }
}
customElements.define('content-selector', ContentSelector);

let imageCounter = 1;
let isDragging = false;
let dragStartX;
let handlerStartX;
let isResizing = false;
let resizeStartX;
let handlerStartWidth;

// Ensure this function is called on DOM ready
document.addEventListener('DOMContentLoaded', function () {
    createTimeRuler();
    window.addEventListener('resize', createTimeRuler);
    initializeFirstHandler(); // Initialize the first time handler
});

document.addEventListener('mousedown', function (e) {
    if (e.target.closest('.center-handler')) {
        isDragging = true;
        dragStartX = e.clientX;
        handlerStartX = e.target.closest('.timeline_handler').offsetLeft;
    } else if (e.target.closest('.right-handle')) {
        isResizing = true;
        resizeStartX = e.clientX;
        handlerStartWidth = e.target.closest('.timeline_handler').offsetWidth;
        const handler = e.target.closest('.timeline_handler');
        if (handler) {
            handlerStartWidth = handler.offsetWidth;
            handler.classList.add('resizing');
        }
    }
});

document.addEventListener('mousemove', function (e) {
    if (!e.target) return; // Add a guard clause to handle null target
    if (isDragging) {
        const dx = e.clientX - dragStartX;
        const newLeft = handlerStartX + dx;
        const timelineContainer = e.target.closest('.timeline_container');
        const handler = e.target.closest('.timeline_handler');
        if (!timelineContainer || !handler) return; // Add additional checks
        const maxRight = timelineContainer.clientWidth - handler.clientWidth;
        if (newLeft >= 0 && newLeft <= maxRight) {
            handler.style.left = newLeft + 'px';
            preventOverlap(handler, timelineContainer); // Ensure no overlap on drag
            updateHandlerDuration(handler); // Update duration on drag
        }
    } else if (isResizing) {
        const dx = e.clientX - resizeStartX;
        const handler = document.querySelector('.timeline_handler.resizing');
        if (!handler) return;
        const newWidth = handlerStartWidth + dx;
        const timelineContainer = handler.closest('.timeline_container');
        if (!timelineContainer) return;
        const maxRight = timelineContainer.clientWidth - handler.offsetLeft;
        if (newWidth > 0 && newWidth <= maxRight) {
            handler.style.width = newWidth + 'px';
            updateHandlerTextVisibility(handler);
            updateHandlerDuration(handler); // Update duration on resize
            preventOverlap(handler, timelineContainer); // Ensure no overlap on resize
        }
    }
});



document.addEventListener('mouseup', function (e) {
    isDragging = false;
    isResizing = false;
    document.querySelectorAll('.timeline_handler').forEach(handler => {
        handler.classList.remove('resizing');
    });
});

document.querySelector('.icon-btn-text').addEventListener('click', function () {
    const imgRowTemplate = document.querySelector('.img_row').cloneNode(true);
    updateImageNumbers();
    imgRowTemplate.querySelector('.text_hook_image_number').textContent = `IMAGE ${imageCounter}`;

    const handlers = imgRowTemplate.querySelectorAll('.timeline_handler .text_hook_image_number');
    handlers.forEach(handler => {
        handler.textContent = `IMAGE ${imageCounter}`;
    });

    const lastRow = document.querySelectorAll('.img_row')[document.querySelectorAll('.img_row').length - 1];
    lastRow.parentNode.insertBefore(imgRowTemplate, lastRow.nextSibling);
    initializeFirstHandler(imgRowTemplate);
    createTimeRuler(); // Update ruler when a new image row is added
});

function updateHandlerDuration(handler) {
    const container = handler.closest('.timeline_container');
    const frameCount = parseInt(document.getElementById('frame_animation').shadowRoot.querySelector('.value').innerText);
    const format = document.getElementById('time_format').shadowRoot.querySelector('.value').innerText;

    const framesPerSecond = 12; // Assuming 24 frames per second
    const containerWidth = container.clientWidth;
    const handlerWidth = handler.offsetWidth;

    let duration;
    if (format === 'Frames') {
        duration = Math.round((handlerWidth / containerWidth) * frameCount);
        handler.querySelector('.time_frame_text').textContent = `Duration: ${duration} frames`;
    } else if (format === 'Seconds') {
        const totalSeconds = frameCount / framesPerSecond;
        duration = (handlerWidth / containerWidth) * totalSeconds;
        handler.querySelector('.time_frame_text').textContent = `Duration: ${duration.toFixed(2)} seconds`;
    }
}

document.addEventListener('click', function (e) {
    if (e.target.closest('.remove_img_row')) {
        const imgRow = e.target.closest('.img_row');
        if (imgRow) {
            imgRow.remove();
            updateImageNumbers(); // Update image numbers after removal
            createTimeRuler(); // Update ruler when an image row is removed
        }
    }
    if (e.target.closest('.toggle_bottom_img_row')) {
        const imgRow = e.target.closest('.img_row');
        if (imgRow) {
            const bottomImgRow = imgRow.querySelector('.bottom_img_row');
            if (bottomImgRow) {
                bottomImgRow.classList.toggle('hidden');
                createTimeRuler(); // Update ruler when the layout changes
            }
        }
    }
    if (e.target.closest('.toggle_image_negative_hook')) {
        const imgRow = e.target.closest('.img_row');
        if (imgRow) {
            const imageNegativeHook = imgRow.querySelector('.image_negative_hook');
            if (imageNegativeHook) {
                imageNegativeHook.classList.toggle('hidden');
                createTimeRuler(); // Update ruler when the layout changes
            }
        }
    }
    if (e.target.closest('.toggle_mask_hook')) {
        const imgRow = e.target.closest('.img_row');
        if (imgRow) {
            const maskHook = imgRow.querySelector('.mask_hook');
            if (maskHook) {
                maskHook.classList.toggle('hidden');
                createTimeRuler(); // Update ruler when the layout changes
            }
        }
    }
    if (e.target.closest('.toggle_attn_mask_hook')) {
        const imgRow = e.target.closest('.img_row');
        if (imgRow) {
            const attnMaskHook = imgRow.querySelector('.attn_mask_hook');
            if (attnMaskHook) {
                attnMaskHook.classList.toggle('hidden');
                createTimeRuler(); // Update ruler when the layout changes
            }
        }
    }
    if (e.target.closest('.toggle_clip_vision_hook')) {
        const imgRow = e.target.closest('.img_row');
        if (imgRow) {
            const clipVisionHook = imgRow.querySelector('.clip_vision_hook');
            if (clipVisionHook) {
                clipVisionHook.classList.toggle('hidden');
                createTimeRuler(); // Update ruler when the layout changes
            }
        }
    }
    if (e.target.closest('.toggle_mask_img')) {
        const imgRow = e.target.closest('.img_row');
        if (imgRow) {
            const maskImg = imgRow.querySelector('.mask_img');
            if (maskImg) {
                maskImg.classList.toggle('hidden');
                createTimeRuler(); // Update ruler when the layout changes
            }
        }
    }
    if (e.target.closest('.add_timeframe')) {
        const imgRow = e.target.closest('.img_row');
        const timelineContainer = imgRow.querySelector('.timeline_container');
        addTimelineHandler(timelineContainer, imgRow);
        createTimeRuler(); // Update ruler when a new time handler is added
    }
    if (e.target.closest('.remove_curent_time_handler')) {
        const handler = e.target.closest('.timeline_handler');
        if (handler) {
            const container = handler.parentElement;
            handler.remove();
            updateHandlersWidth(container);
            createTimeRuler(); // Update ruler when a time handler is removed
        }
    }
});

document.addEventListener('change', function (e) {
    if (e.target.closest('.img_row')) {
        const imgRow = e.target.closest('.img_row');
        const imgUploadInput = e.target.closest('.imgUploadInput');
        if (imgUploadInput) {
            const file = imgUploadInput.files[0];
            const reader = new FileReader();
            const uploadedImage = imgUploadInput.closest('.timeline_handler').querySelector('.uploadedImage');

            reader.onload = function (event) {
                uploadedImage.src = event.target.result;
                uploadedImage.style.display = 'block';
                // Handle aspect ratio and other image adjustments if needed
                updateTimeHandlerImage(imgUploadInput.closest('.timeline_handler'), event.target.result); // Update the image for the corresponding time handler
                createTimeRuler(imgRow.querySelector('.timeline_container')); // Update ruler when an image is uploaded and loaded
            };

            if (file) {
                reader.readAsDataURL(file);
            }
        }
    }
});


function initializeFirstHandler(imgRow = document.querySelector('.img_row')) {
    const timelineContainer = imgRow.querySelector('.timeline_container');
    if (!timelineContainer.querySelector('.timeline_handler')) {
        addTimelineHandler(timelineContainer, imgRow);
    }
}

function addTimelineHandler(container, imgRow) {
    const lastHandler = imgRow.querySelector('.timeline_handler:last-child');
    const newHandler = lastHandler.cloneNode(true);

    // Ensure new handler does not overlap
    const lastHandlerRight = lastHandler.offsetLeft + lastHandler.offsetWidth;
    const newHandlerLeft = Math.min(container.clientWidth - lastHandler.offsetWidth, lastHandlerRight + 10); // Adjusted for spacing
    newHandler.style.left = newHandlerLeft + 'px';

    container.appendChild(newHandler);

    // Copy the uploaded image to the new handler
    const uploadedImage = newHandler.querySelector('.uploadedImage');
    const lastUploadedImage = lastHandler.querySelector('.uploadedImage');
    uploadedImage.src = lastUploadedImage.src;
    uploadedImage.style.display = lastUploadedImage.style.display;

    const imgUploadInput = newHandler.querySelector('.imgUploadInput');
    if (imgUploadInput) {
        imgUploadInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onload = function(event) {
                uploadedImage.src = event.target.result;
                uploadedImage.style.display = 'block';
                const svgIcon = imgUploadInput.nextElementSibling;
                if (svgIcon.tagName.toLowerCase() === 'svg') {
                    svgIcon.style.display = 'none';
                }
                updateTimeHandlerImage(newHandler, event.target.result);
                createTimeRuler(container);
            };

            if (file) {
                reader.readAsDataURL(file);
            }
        });
    }

    preventOverlap(newHandler, container); // Ensure no overlap

    updateHandlersWidth(container);
}



document.querySelector('.icon-btn-text.new_image_row').addEventListener('click', function () {
    const imgRowTemplate = document.querySelector('.img_row').cloneNode(true);
    imgRowTemplate.querySelectorAll('.timeline_handler').forEach(handler => handler.remove()); // Remove existing handlers
    const timelineContainer = imgRowTemplate.querySelector('.timeline_container');
    addTimelineHandler(timelineContainer, imgRowTemplate); // Add a default handler without an image

    updateImageNumbers();
    const lastRow = document.querySelectorAll('.img_row')[document.querySelectorAll('.img_row').length - 1];
    lastRow.parentNode.insertBefore(imgRowTemplate, lastRow.nextSibling);
    createTimeRuler(); // Update ruler when a new image row is added
});



document.addEventListener('change', function (e) {
    if (e.target.matches('.imgUploadInput')) {
        const imgUploadInput = e.target;
        const handler = imgUploadInput.closest('.timeline_handler');
        const file = imgUploadInput.files[0];
        const reader = new FileReader();

        reader.onload = function(event) {
            const uploadedImage = handler.querySelector('.uploadedImage');
            uploadedImage.src = event.target.result;
            uploadedImage.style.display = 'block';
            const svgIcon = imgUploadInput.nextElementSibling;
            if (svgIcon.tagName.toLowerCase() === 'svg') {
                svgIcon.style.display = 'none';
            }
            uploadedImage.onload = function() {
                const container = uploadedImage.parentElement;
                const aspectRatio = uploadedImage.naturalWidth / uploadedImage.naturalHeight;
                container.style.height = '100%';
                container.style.width = `calc(100% * ${aspectRatio})`;
                createTimeRuler(); // Update ruler when an image is uploaded and loaded
            };
        };

        if (file) {
            reader.readAsDataURL(file);
        }
    }
});





function updateTimeHandlerImage(handler, imageUrl) {
    const uploadedImage = handler.querySelector('.uploadedImage');
    if (uploadedImage) {
        uploadedImage.src = imageUrl;
        uploadedImage.style.display = 'block';
        // Handle aspect ratio and other image adjustments if needed
    }
}


function createTimeRuler() {
    const rulerContainers = document.querySelectorAll('.Timeline_time_ruler');
    rulerContainers.forEach(rulerContainer => {
        const timelineContainer = rulerContainer.closest('.timeline_container');
        const containerWidth = timelineContainer.clientWidth;

        // Set the ruler width to match the timeline container
        rulerContainer.style.width = `${containerWidth}px`;
        rulerContainer.innerHTML = ''; // Clear any existing ruler marks

        const frameCount = 96; // Update accordingly
        for (let i = 0; i <= frameCount; i++) {
            const tick = document.createElement('div');
            tick.classList.add('tick');
            tick.style.left = `${(i * (containerWidth / frameCount))}px`;
            if (i % 10 === 0) {
                const label = document.createElement('div');
                label.classList.add('label');
                label.textContent = i;
                tick.appendChild(label);
            }
            rulerContainer.appendChild(tick);
        }
    });
}


function updateImageNumbers() {
    const imgRows = document.querySelectorAll('.img_row');
    imageCounter = 1;
    imgRows.forEach((imgRow) => {
        const imageNumberElement = imgRow.querySelector('.text_hook_image_number');
        if (imageNumberElement) {
            imageNumberElement.textContent = `IMAGE ${imageCounter}`;
        }
        const handlers = imgRow.querySelectorAll('.timeline_handler .text_hook_image_number');
        handlers.forEach(handler => {
            handler.textContent = `IMAGE ${imageCounter}`;
        });
        imageCounter++;
    });
}

function updateHandlersWidth(container) {
    const handlers = container.querySelectorAll('.timeline_handler');
    let totalWidth = 0;
    handlers.forEach(handler => {
        totalWidth += handler.offsetWidth;
    });

    if (totalWidth > container.clientWidth) {
        const scale = container.clientWidth / totalWidth;
        handlers.forEach(handler => {
            handler.style.width = (handler.offsetWidth * scale) + 'px';
        });
    }
}

function updateHandlerTextVisibility(handler) {
    const minWidth = handler.querySelector('.upload_img').offsetWidth;
    if (handler.offsetWidth <= minWidth) {
        handler.querySelector('.text_hook_image_number').style.display = 'none';
    } else {
        handler.querySelector('.text_hook_image_number').style.display = 'block';
    }
}

function preventOverlap(handler, container) {
    const handlers = Array.from(container.querySelectorAll('.timeline_handler')).filter(h => h !== handler);
    handlers.forEach((otherHandler) => {
        if (
            handler.offsetLeft < otherHandler.offsetLeft + otherHandler.offsetWidth &&
            handler.offsetLeft + handler.offsetWidth > otherHandler.offsetLeft
        ) {
            if (handler.offsetLeft < otherHandler.offsetLeft) {
                handler.style.left = otherHandler.offsetLeft - handler.offsetWidth + 'px';
            } else {
                handler.style.left = otherHandler.offsetLeft + otherHandler.offsetWidth + 'px';
            }
        }
    });
}

document.querySelector('.popup_bezier_curve').addEventListener('click', function (e) {
    const tooltip = document.getElementById('bezier-tooltip');
    const buttonRect = e.target.closest('.popup_bezier_curve').getBoundingClientRect();
    tooltip.style.top = `${buttonRect.bottom + window.scrollY + 5}px`; // Adjust the position slightly below the button
    tooltip.style.left = `${buttonRect.left + window.scrollX}px`;
    tooltip.classList.toggle('hidden');
    tooltip.style.display = tooltip.style.display === 'none' || tooltip.style.display === '' ? 'block' : 'none';
});

document.addEventListener('click', function (e) {
    const tooltip = document.getElementById('bezier-tooltip');
    if (!e.target.closest('.popup_bezier_curve') && !tooltip.contains(e.target)) {
        tooltip.classList.add('hidden');
        tooltip.style.display = 'none';
    }
});

document.addEventListener('DOMContentLoaded', function () {
    createTimeRuler();
    window.addEventListener('resize', createTimeRuler);
    setupFrameConversion();
    setupTimeFormatConversion();
    updateTimeHandlerDurationOnLoad(); // Update time handler durations on page load
});


function setupFrameConversion() {
    const frameSelector = document.getElementById('frame_animation');
    frameSelector.addEventListener('click', updateRuler);

    function updateRuler() {
        const frames = parseInt(frameSelector.shadowRoot.querySelector('.value').innerText);
        const format = document.getElementById('time_format').shadowRoot.querySelector('.value').innerText;
        createTimeRuler(frames, format); // Pass the selected number of frames and format to createTimeRuler
    }
}

function setupTimeFormatConversion() {
    const timeFormatSelector = document.getElementById('time_format');
    timeFormatSelector.addEventListener('click', updateRuler);

    function updateRuler() {
        const frames = parseInt(document.getElementById('frame_animation').shadowRoot.querySelector('.value').innerText);
        const format = timeFormatSelector.shadowRoot.querySelector('.value').innerText;
        createTimeRuler(frames, format); // Pass the selected number of frames and format to createTimeRuler
    }
}

function createTimeRuler(frameCount = 96, format = 'Frames') { // Default to 96 frames and 'Frames' format if no values are provided
    const rulerContainer = document.querySelector('.Timeline_time_ruler');
    const timelineContainers = document.querySelectorAll('.timeline_container');
    const containerWidth = document.querySelector('.timeline_container').clientWidth;

    // Set the ruler width to match the timeline container
    rulerContainer.style.width = containerWidth + 'px';

    // Clear previous ruler ticks
    rulerContainer.innerHTML = '';

    // Calculate the total seconds based on frames (assuming 24 frames per second)
    const totalSeconds = frameCount / 12;

    // Create ticks for the ruler
    for (let i = 0; i <= frameCount; i++) {
        const tick = document.createElement('div');
        tick.classList.add('tick');
        tick.style.left = (i * (containerWidth / frameCount)) + 'px';

        if (i % 10 === 0) { // Major ticks
            const label = document.createElement('div');
            label.classList.add('label');
            if (format === 'Seconds') {
                label.textContent = (i / 12).toFixed(2); // Convert frames to seconds
            } else {
                label.textContent = i;
            }
            tick.appendChild(label);
        }

        rulerContainer.appendChild(tick);
    }
}

document.addEventListener('change', function(e) {
    if (e.target && e.target.matches('.imgUploadInput')) {
        const imgUploadInput = e.target;
        const handler = imgUploadInput.closest('.timeline_handler');
        const file = imgUploadInput.files[0];
        const reader = new FileReader();

        reader.onload = function(event) {
            const uploadedImage = handler.querySelector('.uploadedImage');
            uploadedImage.src = event.target.result;
            uploadedImage.style.display = 'block';
            const svgIcon = imgUploadInput.nextElementSibling;
            if (svgIcon.tagName.toLowerCase() === 'svg') {
                svgIcon.style.display = 'none';
            }
            uploadedImage.onload = function() {
                const container = uploadedImage.parentElement;
                const aspectRatio = uploadedImage.naturalWidth / uploadedImage.naturalHeight;
                container.style.height = '100%';
                container.style.width = `calc(100% * ${aspectRatio})`;
                createTimeRuler(); // Update ruler when an image is uploaded and loaded
            };
        };

        if (file) {
            reader.readAsDataURL(file);
        }
    }
});


let isRearranging = false;
let draggedImgRow = null;

document.addEventListener('mousedown', function (e) {
    if (e.target.closest('.rearange_img_row_handle')) {
        isRearranging = true;
        draggedImgRow = e.target.closest('.img_row');
        e.target.closest('.img_row').classList.add('dragging');
    }
});

document.addEventListener('mousemove', function (e) {
    if (isRearranging && draggedImgRow) {
        const draggingOver = document.elementFromPoint(e.clientX, e.clientY).closest('.img_row');
        if (draggingOver && draggingOver !== draggedImgRow) {
            const allImgRows = Array.from(document.querySelectorAll('.img_row'));
            const draggedIndex = allImgRows.indexOf(draggedImgRow);
            const overIndex = allImgRows.indexOf(draggingOver);
            if (draggedIndex < overIndex) {
                draggingOver.parentNode.insertBefore(draggedImgRow, draggingOver.nextSibling);
            } else {
                draggingOver.parentNode.insertBefore(draggedImgRow, draggingOver);
            }
            updateImageNumbers(); // Update image numbers after rearrangement
        }
    }
});

document.addEventListener('mouseup', function () {
    if (isRearranging) {
        isRearranging = false;
        if (draggedImgRow) {
            draggedImgRow.classList.remove('dragging');
            draggedImgRow = null;
            updateImageNumbers(); // Update image numbers after rearrangement
        }
    }
});
