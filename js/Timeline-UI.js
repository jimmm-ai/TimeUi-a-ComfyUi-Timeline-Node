import { app } from "../../scripts/app.js";
import { ComfyWidgets } from "../../scripts/widgets.js";
import './Sortable.min.js'; // Include the local Sortable.min.js
import { SVG_ADD_ROW, SVG_REMOVE_ROW, SVG_ADD_TIMEFRAME, SVG_REMOVE_TIMEFRAME, SVG_UPLOAD_IMAGE } from './svg-constants.js';
import { style } from "./styles.js";
// import { create } from "./Sortable.min.js";

let image_timelines = {};
const SIZE = Symbol();

const out = (message) => {
    console.log(`Timeline-UI: ${message}`);
};

// don't need to add these widgets if they're defined on the backend
function addWidgets(node) {
    node.addCustomWidget(ComfyWidgets.COMBO(node, "ipadapter_preset", [
      ["LIGHT - SD1.5 only (low strength)", "STANDARD (medium strength)", "VIT-G (medium strength)", "PLUS (high strength)", "PLUS FACE (portraits)", "FULL FACE - SD1.5 only (portraits stronger)"],
      { default: "LIGHT - SD1.5 only (low strength)" },
    ]));
    node.addCustomWidget(ComfyWidgets.INT(node,   "video_width",             ["INT", { default: 512, min: 0, max: 10000, step: 1 }],                    app).widget);
    node.addCustomWidget(ComfyWidgets.INT(node,   "video_height",            ["INT", { default: 512, min: 0, max: 10000, step: 1 }],                    app).widget);
    node.addCustomWidget(ComfyWidgets.COMBO(node, "interpolation_mode",      [["Linear", "Ease_in", "Ease_out", "Ease_in_out"], { default: "Linear" }], app).widget);
    node.addCustomWidget(ComfyWidgets.INT(node,   "number_animation_frames", ["INT", { default: 96, min: 1, max: 12000, step: 12 }],                    app).widget);
    node.addCustomWidget(ComfyWidgets.INT(node,   "frames_per_second",       ["INT", { default: 12, min: 8, max: 24, step: 8 }],                        app).widget);
    node.addCustomWidget(ComfyWidgets.COMBO(node, "time_format",             [["Frames", "Seconds"], { default: "Linear" }],                            app).widget);
    
}

function createImagesContainer(node) {
  const container = document.createElement("div");
  container.id = "images-rows-container";
  container.className = "timeline-container";
  node.addDOMWidget("custom-html", "html", container, {
    getValue: () => container.innerHTML,
    setValue: (value) => {
      container.innerHTML = value;
    },
  });
  return container;
}

function setupEventListeners(node) {
    node.htmlElement.addEventListener("click", (event) => {
        if (event.target.closest(".add-row")) {
          addImageRow();
        } else if (event.target.closest(".remove-row")) {
          removeImageRow(node, event.target);
        } else if (event.target.closest(".image-input")) {
          event.target.closest(".image-input").addEventListener("change", (e) => handleImageUpload(e));
        }
    });
}

function addImageRow(node) {
    const newRow = document.createElement("section");
    const currentIndex = node.htmlElement.querySelectorAll(".timeline-row").length + 1;
    newRow.className = "timeline-row";
    newRow.id = `timeline-row-${currentIndex}`;
    newRow.innerHTML = generateRowHTML(currentIndex);
    node.htmlElement.appendChild(newRow);
    initializeSortable(node); // Re-initialize Sortable to include new row
    initializeDragAndResize(); // Re-initialize custom drag and resize for new elements
}

function generateRowHTML(currentIndex) {
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

function removeImageRow(button) {
    const row = button.closest(".timeline-row");
    if (row) {
      row.remove();
      renumberImageRows();
    }
}

function renumberImageRows(node) {
    const rows = node.htmlElement.querySelectorAll(".timeline-row");
    rows.forEach((row, index) => {
      row.id = `timeline-row-${index + 1}`;
      const textHook = row.querySelector(".image-number");
      if (textHook) {
        textHook.textContent = `IMAGE ${index + 1}`;
      }
    });
}

function initializeSortable(node) {
    Sortable.create(node.htmlElement, {
      animation: 150,
      handle: ".rearrange-handle",
      onEnd: () => {
        renumberImageRows();
      },
    });
}

function initializeDragAndResize() {
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
        handleDragging(e, handler, handlerStartX, dragStartX, timelineContainer, paddingSize);
      } else if (isResizingRight) {
        handleResizingRight(e, handler, resizeStartX, handlerStartWidth, timelineContainer, paddingSize);
      } else if (isResizingLeft) {
        handleResizingLeft(e, handler, resizeStartX, handlerStartWidth, handlerStartX, timelineContainer, paddingSize);
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

function handleDragging(e, handler, handlerStartX, dragStartX, timelineContainer, paddingSize) {
    const dx = e.clientX - dragStartX;
    const newLeft = handlerStartX + dx;
    const maxRight = timelineContainer.clientWidth - handler.clientWidth - paddingSize;
    if (newLeft >= 0 && newLeft <= maxRight) {
      handler.style.left = `${newLeft}px`;
    }
}

function handleResizingRight(e, handler, resizeStartX, handlerStartWidth, timelineContainer, paddingSize) {
    const dx = e.clientX - resizeStartX;
    const newWidth = handlerStartWidth + dx;
    const maxRight = timelineContainer.clientWidth - handler.offsetLeft - paddingSize;
    if (newWidth > 0 && newWidth <= maxRight) {
      handler.style.width = `${newWidth}px`;
    }
}

function handleResizingLeft(e, handler, resizeStartX, handlerStartWidth, handlerStartX, timelineContainer, paddingSize) {
    const dx = e.clientX - resizeStartX;
    const newWidth = handlerStartWidth - dx;
    const newLeft = handlerStartX + dx;
    const maxRight = timelineContainer.clientWidth - handlerStartX - paddingSize;
    if (newWidth > 0 && newLeft >= 0 && newLeft <= maxRight) {
      handler.style.width = `${newWidth}px`;
      handler.style.left = `${newLeft}px`;
    }
 }

 function handleImageUpload(event) {
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
        image_timelines[rowHTML.id] = {imgSrc: img.src, timelineHandler};
        uploadContainer.innerHTML = '';
        uploadContainer.appendChild(img);
      };
      reader.readAsDataURL(file);
    }
}

function sendDataToBackend(image_timelines) {
    let data = {imageData: []};

    Object.keys(image_timelines).forEach(([key, item]) => {
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

function testBackend() {
    api.fetchApi("/api/test", {});
}

function onExecute() {
    let inputData = getInputData(0);
    if (inputData !== undefined) {
      setOutputData(0, `Processed: ${inputData}`);
    }

    testBackend();
    // this.sendDataToBackend();
}

// domWidget is just a custom widget type that 


const node = {
  name: "jimmm.ai.TimelineUI",
  async beforeRegisterNodeDef(nodeType, nodeData, app) {
      if (nodeType.comfyClass === "jimmm.ai.TimelineUI") {
        nodeType.prototype.addDOMWidget = LiteGraph.LGraphNode.prototype.addDOMWidget;
        nodeType.title = "Timeline UI";
        nodeType.inputs = [
          {
            name: "model",
            type: "MODEL",
            label: "model"
          },
        ];

        // Hijacking onNodeCreated
        const orig_nodeCreated = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function () {
          out(Object.keys(this));
          const r = orig_nodeCreated ? orig_nodeCreated.apply(this, arguments) : undefined;
          
          // Create the html body
          this.htmlElement = createImagesContainer(this);
          document.body.appendChild(this.htmlElement);

          this.onResize?.(this.size);
          addImageRow(this); // Add the first row
          setupEventListeners(this);
          initializeSortable(this);
          initializeDragAndResize();

          out("onCreate was called!");

          return r;
        };

        // Hijacking onExecute
        const orig_onExecuted = nodeType.prototype.onExecuted;
        nodeType.prototype.onExecuted = (messageFromBackend) => {
          orig_onExecuted?.apply(this);
        };
      }
  },
};


app.registerExtension(node);