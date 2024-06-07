import { app } from "../../scripts/app.js";
import { ComfyWidgets } from "../../scripts/widgets.js";
import './Sortable.min.js'; // Include the local Sortable.min.js

// Define SVG constants
const SVG_ADD_ROW = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image-plus">
  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/>
  <line x1="16" x2="22" y1="5" y2="5"/>
  <line x1="19" x2="19" y1="2" y2="8"/>
  <circle cx="9" cy="9" r="2"/>
  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
</svg>`;

const SVG_REMOVE_ROW = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2">
<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
<line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>
</svg>`;

const SVG_ADD_TIMEFRAME = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-images">
  <path d="M18 22H4a2 2 0 0 1-2-2V6"/>
  <path d="m22 13-1.296-1.296a2.41 2.41 0 0 0-3.408 0L11 18"/>
  <circle cx="12" cy="8" r="2"/>
  <rect width="16" height="16" x="6" y="2" rx="2"/>
</svg>`;

const SVG_REMOVE_TIMEFRAME = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="lucide lucide-image-off">
  <line x1="2" x2="22" y1="2" y2="22"/>
  <path d="M10.41 10.41a2 2 0 1 1-2.83-2.83"/>
  <line x1="13.5" x2="6" y1="13.5" y2="21"/>
  <line x1="18" x2="21" y1="12" y2="15"/>
  <path d="M3.59 3.59A1.99 1.99 0 0 0 3 5v14a2 2 0 0 0 2 2h14c.55 0 1.052-.22 1.41-.59"/>
  <path d="M21 15V5a2 2 0 0 0-2-2H9"/>
</svg>`;

const SVG_UPLOAD_IMAGE = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="lucide lucide-image-up">
  <path d="M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.814.014L6 21"/>
  <path d="m14 19.5 3-3 3 3"/>
  <path d="M17 22v-5.5"/>
  <circle cx="9" cy="9" r="2"/>
</svg>`;


// Add CSS for the node
const style = document.createElement('style');
style.type = 'text/css';
style.textContent = `
/* General Styles */
:root {
  --color-background: #1a1a1a;
  --color-border: #666666;
  --color-icon: #444;
  --color-text: #eee;
  --spacing-gap: 12px;
  --spacing-padding: 8px;
}

.timeline-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.timeline-row {
  border-bottom: var(--color-border) 1px solid;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 8px;
  padding-bottom: var(--spacing-padding);
}

.timeline-controls {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: var(--spacing-gap);
}

.btn {
  background-color: var(--color-icon);
  border-radius: 8px;
  border: 1px solid var(--color-border);
  color: var(--color-text);
  padding: var(--spacing-padding);
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
}

.btn-sm {
  width: 32px;
  height: 32px;
}

.timeline {
  background-color: var(--color-background);
  border-radius: 8px;
  border: 1px solid var(--color-border);
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  position: relative;
  padding: 2px;
}

.timeline-handler {
  background-color: #2A2A2B;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px;
  height: calc(100% - 12px);
  position: absolute;
  overflow: hidden;
  gap: 4px;
}

.resize-handle {
  cursor: ew-resize;
  position: relative;
  height: 100%;
  width: 8px;
  border-right: 1px solid var(--color-border);
  border-left: 1px solid var(--color-border);
}

.drag-area {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 8px;
  cursor: grab;
  width: 100%;
  flex-wrap: nowrap;
  align-items: center;
}

.image-upload {
  background-color: var(--color-icon);
  border-radius: 4px;
  border: 1px solid var(--color-border);
  display: flex;
  justify-content: center;
  align-items: center;
  width: 72px;
  height: 72px;
  position: relative;
  max-width: 72px;
  max-height: 72px;
}

.uploaded-image {
  width: 100%;
  height: auto;
  border-radius: 4px;
}

.image-input {
  position: absolute;
  opacity: 0;
  width: 72px;
  height: 72px;
  cursor: pointer;
}

.handler-info {
  display: flex;
  flex-direction: column;
}

.image-number {
  font-size: 12px;
  color: var(--color-text);
  font-family: Arial, sans-serif;
}

.frame-info {
  font-size: 10px;
  color: #c6c6c6;
  font-family: Arial, sans-serif;
}

.handler-buttons {
  display: flex;
  gap: 8px;
  flex-direction: column;
  justify-content: space-between;
}

.rearrange-handle {
  cursor: move;
  position: relative;
  height: 88px;
  width: 8px;
  border-right: 1px solid var(--color-border);
  border-left: 1px solid var(--color-border);
}

.no_selectionable {
  user-select: none;
}
`;
document.head.appendChild(style);

app.registerExtension({
  name: "my.unique.node.extension",
  registerCustomNodes() {
    class TimeUINode extends LiteGraph.LGraphNode {
      constructor() {
        super("TimeUI - Timeline Node");
        this.color = LGraphCanvas.node_colors.black.groupcolor;
        this.bgcolor = LGraphCanvas.node_colors.black.groupcolor;
        this.groupcolor = LGraphCanvas.node_colors.black.groupcolor;

        this.addInput("Model", "string");
        this.addOutput("Model", "string");

        // Set default size
        this.size = [600, 800];
        this.resizable = true;

        // Add widgets using ComfyWidgets
        this.addWidgets();

        // Create and append the images container
        this.htmlElement = this.createImagesContainer();
        document.body.appendChild(this.htmlElement);

        // Initialize
        this.addImageRow(); // Add the first row
        this.setupEventListeners();
        this.initializeSortable();
        this.initializeDragAndResize();
      }

      addWidgets() {
        ComfyWidgets.COMBO(this, "IP Adapter Settings", [
          ["LIGHT - SD1.5 only (low strength)", "STANDARD (medium strength)", "VIT-G (medium strength)", "PLUS (high strength)", "PLUS FACE (portraits)", "FULL FACE - SD1.5 only (portraits stronger)"],
          { default: "LIGHT - SD1.5 only (low strength)" },
        ]);
        ComfyWidgets.FLOAT(this, "Width of the Animation", ["FLOAT", { default: 512, min: 0, max: 10000, step: 1 }], app);
        ComfyWidgets.FLOAT(this, "Height of the Animation", ["FLOAT", { default: 512, min: 0, max: 10000, step: 1 }], app);
        ComfyWidgets.COMBO(this, "InterInterpolation", [["Linear", "Ease_in", "Ease_out", "Ease_in_out"], { default: "Linear" }]);
        ComfyWidgets.FLOAT(this, "Number of Animation Frames", ["FLOAT", { default: 96, min: 8, max: 12000, step: 12 }], app);
        ComfyWidgets.FLOAT(this, "Number of frames per Second", ["FLOAT", { default: 12, min: 8, max: 24, step: 8 }], app);
        ComfyWidgets.COMBO(this, "Time Format of the Timeline", [["Frames", "Seconds"], { default: "Linear" }]);
      }

      createImagesContainer() {
        const container = document.createElement("div");
        container.id = "images-rows-container";
        container.className = "timeline-container";
        this.addDOMWidget("custom-html", "html", container, {
          getValue: () => container.innerHTML,
          setValue: (value) => {
            container.innerHTML = value;
          },
        });
        return container;
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
      }

      addImageRow() {
        const newRow = document.createElement("section");
        const currentIndex = this.htmlElement.querySelectorAll(".timeline-row").length + 1;
        newRow.className = "timeline-row";
        newRow.id = `timeline-row-${currentIndex}`;
        newRow.innerHTML = this.generateRowHTML(currentIndex);
        this.htmlElement.appendChild(newRow);
        this.initializeSortable(); // Re-initialize Sortable to include new row
        this.initializeDragAndResize(); // Re-initialize custom drag and resize for new elements
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
                  <div class="frame-info"></div>
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
          if (e.target.classList.contains("drag-area")) {
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

      onAdded() {
        // Set default size
        this.size = [900, 600];
        this.resizable = true;
      }

      onExecute() {
        let inputData = this.getInputData(0);
        if (inputData !== undefined) {
          this.setOutputData(0, `Processed: ${inputData}`);
        }
      }
    }

    LiteGraph.registerNodeType("utils/TimeUINode", TimeUINode);
    TimeUINode.category = "utils";
  },
});
