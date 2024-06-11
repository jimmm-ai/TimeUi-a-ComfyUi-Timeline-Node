import { app } from "../../scripts/app.js";
import { ComfyWidgets } from "../../scripts/widgets.js";
import './Sortable.min.js'; // Include the local Sortable.min.js
import { SVG_ADD_ROW, SVG_REMOVE_ROW, SVG_ADD_TIMEFRAME, SVG_REMOVE_TIMEFRAME, SVG_UPLOAD_IMAGE, SVG_SHOW_CURVES } from './svg-constants.js';
import { style } from "./styles.js";

// Add CSS for the node
document.head.appendChild(style);

class TimelineUI extends LiteGraph.LGraphNode {
    constructor() {
        /**
         * This is called when a node is created AND when a reload occurs, so don't do this stuff twice
        */
        super("TimelineUI");
        this.title = "TimelineUI";
        this.color = LGraphCanvas.node_colors.black.groupcolor;
        this.bgcolor = LGraphCanvas.node_colors.black.groupcolor;
        this.groupcolor = LGraphCanvas.node_colors.black.groupcolor;

        this.addInput("model", "MODEL");
        this.addOutput("model", "MODEL");

        // Set default size (initial height based on one row)
        this.baseHeight = 260; // Base height for the node excluding rows
        this.rowHeight = 100; // Height of each row
        this.size = [900, this.baseHeight + this.rowHeight];
        this.resizable = true;

        // Initialize properties
        this.properties = {
            ipadapter_preset: "LIGHT - SD1.5 only (low strength)",
            video_width: 512,
            video_height: 512,
            interpolation_mode: "Linear",
            number_animation_frames: 96,
            frames_per_second: 12,
            time_format: "Frames" // Default value for time_format
        };

        // Add widgets using ComfyWidgets
        this.addWidgets();

        // Create and append the images container
        if (this.htmlElement) {
            this.htmlElement.innerHTML = '';
        }
        this.htmlElement = this.createImagesContainer();
        document.body.appendChild(this.htmlElement);

        // Initialize
        this.addImageRow(); // Add the first row
        this.setupEventListeners();
        this.initializeSortable();
        this.initializeDragAndResize();
    }

    addWidgets() {
        ComfyWidgets.COMBO(this, "ipadapter_preset", [["LIGHT - SD1.5 only (low strength)", "STANDARD (medium strength)", "VIT-G (medium strength)", "PLUS (high strength)", "PLUS FACE (portraits)", "FULL FACE - SD1.5 only (portraits stronger)"], { default: "LIGHT - SD1.5 only (low strength)" }]);
        ComfyWidgets.FLOAT(this, "video_width", ["INT", { default: 512, min: 0, max: 10000, step: 1 }], app);
        ComfyWidgets.FLOAT(this, "video_height", ["INT", { default: 512, min: 0, max: 10000, step: 1 }], app);
        ComfyWidgets.COMBO(this, "interpolation_mode", [["Linear", "Ease_in", "Ease_out", "Ease_in_out"], { default: "Linear" }]);
        ComfyWidgets.FLOAT(this, "number_animation_frames", ["INT", { default: 96, min: 1, max: 12000, step: 1 }], app);
        ComfyWidgets.FLOAT(this, "frames_per_second", ["INT", { default: 12, min: 8, max: 24, step: 1 }], app);

        // Time format COMBO widget with the specified structure
        ComfyWidgets.COMBO(this, "time_format", [["Frames", "Seconds"], { default: "Frames" }]);

        // Bind onWidgetChange function to widget change events
        this.widgets.forEach(widget => {
            console.log(`Widget initialized: ${widget.name} with value ${widget.value}`); // Debugging output
            widget.callback = this.onWidgetChange.bind(this, widget);
        });
    }

    onWidgetChange(widget, value) {
        console.log(`Widget changed: ${widget.name} = ${value}`);
        this.properties[widget.name] = value;
        console.log('Updated properties:', this.properties);

        // Ensure the timeRulerContainer exists and has a time-ruler element
        if (this.timeRulerContainer) {
            const timeRuler = this.timeRulerContainer.querySelector('.time-ruler');
            if (timeRuler) {
                this.updateTimeRuler(timeRuler);
                this.updateAllHandlersFrameInfo(); // Update frame info for all handlers
            } else {
                console.error("Time ruler element not found!");
            }
        } else {
            console.error("Time ruler container not found!");
        }
    }

    createImagesContainer() {
        const container = document.createElement("div");
        container.id = "images-rows-container";
        container.className = "timeline-container";

        // Append the time ruler container inside the main container
        this.timeRulerContainer = this.createTimeRuler();
        container.appendChild(this.timeRulerContainer);

        this.addDOMWidget("custom-html", "html", container, {
            getValue: () => container.innerHTML,
            setValue: (value) => {
                container.innerHTML = value;
            },
        });
        return container;
    }

    createTimeRuler() {
        const timeRulerContainer = document.createElement("div");
        timeRulerContainer.className = "time-ruler-container";

        // Add the new button to the left of the time ruler
        const newButton = document.createElement("button");
        newButton.className = "btn new-function-button";
        newButton.innerHTML = SVG_SHOW_CURVES; // You can replace this with SVG or any other content
        // Add an event listener for the button
        newButton.addEventListener("click", () => {
            console.log("New function button clicked");
            // Add your future function logic here
        });
        timeRulerContainer.appendChild(newButton);

        const timeRuler = document.createElement("div");
        timeRuler.className = "time-ruler";

        // Initialize the time ruler with current properties
        this.updateTimeRuler(timeRuler);

        timeRulerContainer.appendChild(timeRuler);

        // Add the rearrange handle to the right of the time ruler
        const rearrangeHandle = document.createElement("div");
        rearrangeHandle.className = "same-space-handle";
        timeRulerContainer.appendChild(rearrangeHandle);

        return timeRulerContainer;
    }

    updateTimeRuler(timeRuler) {
      console.log('Updating time ruler with properties:', this.properties);
      const numberOfFrames = this.properties.number_animation_frames || 96;
      const framesPerSecond = this.properties.frames_per_second || 12;
      const timeFormat = this.properties.time_format;
  
      console.log('Time Format:', timeFormat); // Debugging output
  
      const totalMarkers = timeFormat === "Seconds" ? Math.ceil(numberOfFrames / framesPerSecond) * 10 : numberOfFrames;
      timeRuler.innerHTML = '';
  
      for (let i = 0; i <= totalMarkers; i++) {
          const timeMarker = document.createElement("div");
          timeMarker.className = "time-marker";
          timeMarker.style.left = `${(i / totalMarkers) * 100}%`;
  
          if (i % 10 === 0) {
              timeMarker.classList.add("big-tick");
              timeMarker.innerHTML = `<span>${timeFormat === "Seconds" ? i / 10 : i} ${timeFormat === "Seconds" ? 's' : ''}</span>`;
          } else if (i % 5 === 0) {
              timeMarker.classList.add("medium-tick");
          } else {
              timeMarker.classList.add("small-tick");
          }
  
          timeRuler.appendChild(timeMarker);
      }
  
      // Add the total number of frames as the last marker only if the time format is "Frames"
      if (timeFormat === "Frames") {
          const totalFramesMarker = document.createElement("div");
          totalFramesMarker.className = "time-marker big-tick";
          totalFramesMarker.style.left = `100%`;
          totalFramesMarker.innerHTML = `<span>${numberOfFrames}</span>`;
          timeRuler.appendChild(totalFramesMarker);
      }
  }
  
  

    setupEventListeners() {
        this.htmlElement.addEventListener("click", (event) => {
            if (event.target.closest(".add-row")) {
                this.addImageRow();
            } else if (event.target.closest(".remove-row")) {
                this.removeImageRow(event.target);
            } else if (event.target.closest(".image-input")) {
                event.target.closest(".image-input").addEventListener("change", (e) => this.handleImageUpload(e));
            }
        });

        this.htmlElement.addEventListener("keypress", (event) => {
            if (event.target.classList.contains("frame-info-input") && event.key === "Enter") {
                this.updateHandlerSize(event.target);
            }
        });

        // Prevent the input field from interfering with dragging
        this.htmlElement.addEventListener("mousedown", (event) => {
            if (event.target.classList.contains("frame-info-input")) {
                event.stopPropagation();
            }
        });
    }

    updateHandlerSize(inputElement) {
        const handler = inputElement.closest(".timeline-handler");
        const timelineContainer = handler.closest(".timeline");
        const totalWidth = timelineContainer.clientWidth;

        const maxFrames = this.properties.number_animation_frames;
        const framesPerPixel = maxFrames / totalWidth;
        let totalFrames = parseInt(inputElement.value, 10);

        if (isNaN(totalFrames) || totalFrames < 1) {
            totalFrames = 1;
        }

        if (this.properties.time_format === 'Frames' && totalFrames > maxFrames) {
            totalFrames = maxFrames;
        }

        const newWidth = this.properties.time_format === 'Frames' ? totalFrames / framesPerPixel : (totalFrames * this.properties.frames_per_second) / framesPerPixel;
        handler.style.width = `${newWidth}px`;

        this.updateFrameInfo(handler);
    }

    addImageRow() {
        const newRow = document.createElement("section");
        const currentIndex = this.htmlElement.querySelectorAll(".timeline-row").length + 1;
        newRow.className = "timeline-row";
        newRow.id = `timeline-row-${currentIndex}`;
        newRow.innerHTML = this.generateRowHTML(currentIndex);
        this.htmlElement.appendChild(newRow);
        this.updateNodeHeight(); // Update the height of the node
        this.initializeSortable(); // Re-initialize Sortable to include new row
        this.initializeDragAndResize(); // Re-initialize custom drag and resize for new elements
        this.updateFrameInfo(newRow.querySelector(".timeline-handler")); // Update frame info for the new row
    }

    generateRowHTML(currentIndex) {
        return `
           <div class="timeline-controls">
               <button class="btn remove-row">${SVG_REMOVE_ROW}</button>
               <button class="btn add-row">${SVG_ADD_ROW}</button>
           </div>
           <div class="timeline">
               <div class="timeline-handler" style="left: 0;">
                   <div class="resize-handle left-handle"></div>
                   <div class="drag-area">
                       <div class="image-upload">
                           ${SVG_UPLOAD_IMAGE}
                           <input type="file" class="image-input" accept="image/*">
                       </div>
                       <div class="handler-info">
                           <div class="image-number">IMAGE ${currentIndex}</div>
                           <div class="frame-info-container">
                               <div class="frame-info-container-input">
                                   <input type="text" class="frame-info-input"><span class="frame-label"> frames</span>
                               </div>
                               <span class="frame-info"></span>
                           </div>
                       </div>
                       <div class="handler-buttons">
                           <button class="btn btn-sm add-timeframe">${SVG_ADD_TIMEFRAME}</button>
                           <button class="btn btn-sm remove-timeframe">${SVG_REMOVE_TIMEFRAME}</button>
                       </div>
                   </div>
                   <div class="resize-handle right-handle"></div>
               </div>
           </div>
           <div class="rearrange-handle"></div>
        `;
    }

    removeImageRow(button) {
        const row = button.closest(".timeline-row");
        if (row) {
            row.remove();
            this.renumberImageRows();
            this.updateNodeHeight(); // Update the height of the node
        }
    }

    renumberImageRows() {
        const rows = this.htmlElement.querySelectorAll(".timeline-row");
        rows.forEach((row, index) => {
            row.id = `timeline-row-${index + 1}`;
            const textHook = row.querySelector(".image-number");
            if (textHook) {
                textHook.textContent = `IMAGE ${index + 1}`;
            }
        });
    }

    updateNodeHeight() {
        const rowCount = this.htmlElement.querySelectorAll(".timeline-row").length;
        this.size[1] = this.baseHeight + this.rowHeight * rowCount;
    }

    initializeSortable() {
        Sortable.create(this.htmlElement, {
            animation: 150,
            handle: ".rearrange-handle",
            onEnd: () => {
                this.renumberImageRows();
            },
        });
    }

    initializeDragAndResize() {
        let isDragging = false;
        let dragStartX;
        let handlerStartX;
        let isResizingLeft = false;
        let isResizingRight = false;
        let resizeStartX;
        let handlerStartWidth;

        document.addEventListener("mousedown", (e) => {
            const handler = e.target.closest(".timeline-handler");
            if (!handler) return; // Exit if no handler is found

            if (e.target.classList.contains("drag-area") || e.target.closest(".drag-area")) {
                isDragging = true;
                dragStartX = e.clientX;
                handlerStartX = handler.offsetLeft;
                handler.classList.add("dragging");
            } else if (e.target.classList.contains("left-handle")) {
                isResizingLeft = true;
                resizeStartX = e.clientX;
                handlerStartWidth = handler.offsetWidth;
                handlerStartX = handler.offsetLeft;
                handler.classList.add("resizing-left");
            } else if (e.target.classList.contains("right-handle")) {
                isResizingRight = true;
                resizeStartX = e.clientX;
                handlerStartWidth = handler.offsetWidth;
                handlerStartX = handler.offsetLeft;
                handler.classList.add("resizing-right");
            }
        });

        document.addEventListener("mousemove", (e) => {
            const handler = document.querySelector(".timeline-handler.dragging, .timeline-handler.resizing-left, .timeline-handler.resizing-right");
            if (!handler) return;

            const timelineContainer = handler.closest(".timeline");
            const paddingSize = 2 * parseInt(getComputedStyle(timelineContainer).paddingLeft);

            if (isDragging) {
                this.handleDragging(e, handler, handlerStartX, dragStartX, timelineContainer, paddingSize);
            } else if (isResizingRight) {
                this.handleResizingRight(e, handler, resizeStartX, handlerStartWidth, timelineContainer, paddingSize);
            } else if (isResizingLeft) {
                this.handleResizingLeft(e, handler, resizeStartX, handlerStartWidth, handlerStartX, timelineContainer, paddingSize);
            }

            this.updateFrameInfo(handler); // Update the frame info based on new size
        });

        document.addEventListener("mouseup", () => {
            isDragging = false;
            isResizingLeft = false;
            isResizingRight = false;
            document.querySelectorAll(".timeline-handler").forEach((handler) => {
                handler.classList.remove("dragging", "resizing-left", "resizing-right");
            });
        });
    }

    handleDragging(e, handler, handlerStartX, dragStartX, timelineContainer, paddingSize) {
        const dx = e.clientX - dragStartX;
        const newLeft = handlerStartX + dx;
        const maxRight = timelineContainer.clientWidth - handler.clientWidth - paddingSize;
        if (newLeft >= 0 && newLeft <= maxRight) {
            handler.style.left = `${newLeft}px`;
        }
    }

    handleResizingRight(e, handler, resizeStartX, handlerStartWidth, timelineContainer, paddingSize) {
        const dx = e.clientX - resizeStartX;
        const newWidth = handlerStartWidth + dx;
        const maxRight = timelineContainer.clientWidth - handler.offsetLeft - paddingSize;
        if (newWidth > 0 && newWidth <= maxRight) {
            handler.style.width = `${newWidth}px`;
        }
    }

    handleResizingLeft(e, handler, resizeStartX, handlerStartWidth, handlerStartX, timelineContainer, paddingSize) {
        const dx = e.clientX - resizeStartX;
        const newWidth = handlerStartWidth - dx;
        const newLeft = handlerStartX + dx;
        const maxRight = timelineContainer.clientWidth - handlerStartX - paddingSize;
        if (newWidth > 0 && newLeft >= 0 && newLeft <= maxRight) {
            handler.style.width = `${newWidth}px`;
            handler.style.left = `${newLeft}px`;
        }
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;
                img.className = "uploaded-image";

                const uploadContainer = event.target.closest(".image-upload");
                uploadContainer.innerHTML = '';
                uploadContainer.appendChild(img);
            };
            reader.readAsDataURL(file);
        }
    }

    updateFrameInfo(handler) {
        const timelineContainer = handler.closest(".timeline");
        const totalWidth = timelineContainer.clientWidth;
        const handlerWidth = handler.clientWidth;
        const handlerLeft = handler.offsetLeft;

        const framesPerPixel = this.properties.number_animation_frames / totalWidth;
        const startFrame = Math.round(handlerLeft * framesPerPixel);
        const endFrame = Math.round((handlerLeft + handlerWidth) * framesPerPixel);
        const totalFrames = endFrame - startFrame;

        const startSecond = (startFrame / this.properties.frames_per_second).toFixed(2);
        const endSecond = (endFrame / this.properties.frames_per_second).toFixed(2);

        const frameInfoElement = handler.querySelector('.frame-info');
        const frameInfoInput = handler.querySelector('.frame-info-input');
        const frameLabel = handler.querySelector('.frame-label');

        if (frameInfoElement && frameInfoInput && frameLabel) {
            frameInfoInput.value = this.properties.time_format === 'Seconds' ? `${(totalFrames / this.properties.frames_per_second).toFixed(2)}` : `${totalFrames}`;
            frameLabel.textContent = this.properties.time_format === 'Seconds' ? ' seconds' : ' frames';
            
            if (this.properties.time_format === 'Seconds') {
                frameInfoElement.textContent = `From ${startSecond}s to ${endSecond}s`;
            } else {
                frameInfoElement.textContent = `From ${startFrame} to ${endFrame} frames`;
            }
        }
    }

    updateAllHandlersFrameInfo() {
        const handlers = this.htmlElement.querySelectorAll(".timeline-handler");
        handlers.forEach(handler => {
            this.updateFrameInfo(handler);
        });
    }

    onAdded() {
        // Set default size (initial height based on one row)
        this.baseHeight = 260; // Base height for the node excluding rows
        this.rowHeight = 100; // Height of each row
        this.size = [900, this.baseHeight + this.rowHeight];
        this.resizable = true;
    }

    onExecute() {
        let inputData = this.getInputData(0);
        if (inputData !== undefined) {
            this.setOutputData(0, `Processed: ${inputData}`);
        }
    }

    // Ensure only serializable data is included in the properties
    serialize() {
        const data = super.serialize();
        data.properties = { ...this.properties };
        data.rows = this.htmlElement.querySelectorAll(".timeline-row").length; // Save the number of rows
        return data;
    }

    // Deserialize properties and ensure non-serializable objects are handled correctly
    configure(data) {
        super.configure(data);
        this.properties = data.properties ? { ...data.properties } : {};

        // Restore state from saved data
        const savedRows = data.rows || 1;
        for (let i = 0; i < savedRows - 1; i++) {
            this.addImageRow();
        }
    }
}

LiteGraph.registerNodeType("animation_timeline/TimelineUI", TimelineUI);