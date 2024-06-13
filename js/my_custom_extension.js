import { app } from "../../scripts/app.js";
import { ComfyWidgets } from "../../scripts/widgets.js";
import './Sortable.min.js'; // Include the local Sortable.min.js
import { SVG_ADD_ROW, SVG_REMOVE_ROW, SVG_ADD_TIMEFRAME, SVG_REMOVE_TIMEFRAME, SVG_UPLOAD_IMAGE } from './svg-constants.js';
import { style } from "./styles.js";

// Add CSS for the node
document.head.appendChild(style);

class TimelineUI extends LiteGraph.LGraphNode {
  constructor() {
    super("jimmm.ai.TimelineUI");
    this.title = "jimmm.ai.TimelineUI";
    this.category = "anim_timeline";
    this.color = LGraphCanvas.node_colors.black.groupcolor;
    this.bgcolor = LGraphCanvas.node_colors.black.groupcolor;
    this.groupcolor = LGraphCanvas.node_colors.black.groupcolor;

    this.image_timelines = {};

    this.addInput("model", "MODEL");
    this.addOutput("model", "MODEL");

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
    ComfyWidgets.COMBO(this, "ipadapter_preset", [
      ["LIGHT - SD1.5 only (low strength)", "STANDARD (medium strength)", "VIT-G (medium strength)", "PLUS (high strength)", "PLUS FACE (portraits)", "FULL FACE - SD1.5 only (portraits stronger)"],
      { default: "LIGHT - SD1.5 only (low strength)" },
    ]);
    ComfyWidgets.FLOAT(this, "video_width",             ["INT", { default: 512, min: 0, max: 10000, step: 1 }], app);
    ComfyWidgets.FLOAT(this, "video_height",            ["INT", { default: 512, min: 0, max: 10000, step: 1 }], app);
    ComfyWidgets.COMBO(this, "interpolation_mode",      [["Linear", "Ease_in", "Ease_out", "Ease_in_out"], { default: "Linear" }], app);
    ComfyWidgets.FLOAT(this, "number_animation_frames", ["INT", { default: 96, min: 1, max: 12000, step: 12 }], app);
    ComfyWidgets.FLOAT(this, "frames_per_second",       ["INT", { default: 12, min: 8, max: 24, step: 8 }], app);
    ComfyWidgets.COMBO(this, "time_format",             [["Frames", "Seconds"], { default: "Linear" }], app);
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
        const timelineHandler = event.target.closest(".timeline-handler");
        const rowHTML = event.target.closest(".timeline-row");
        this.image_timelines[rowHTML.id] = {imgSrc: img.src, timelineHandler};
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

  sendDataToBackend() {
    let data = {imageData: []};

    Object.keys(this.image_timelines).forEach(([key, item]) => {
      const boundingRect = item.timelineHandler.getBoundingClientRect();
      data.imageData.push({rowID: key, imgSrc: item.imgSrc, start: boundingRect.left, end: boundingRect.right});
    });

    api.fetchApi("/api/timeline_data", {  // Replace with your backend endpoint
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  }

  onExecute() {
    let inputData = this.getInputData(0);
    if (inputData !== undefined) {
      this.setOutputData(0, `Processed: ${inputData}`);
    }

    this.sendDataToBackend();
  }
}

LiteGraph.registerNodeType("jimmm.ai.TimelineUI", TimelineUI);

console.log("my_custom_extension.js was executed!");