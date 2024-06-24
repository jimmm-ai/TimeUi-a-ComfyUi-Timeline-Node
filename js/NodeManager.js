import { createTimeRuler, timeRulerCallback } from "./ui-elements/TimeRuler.js";
import { addImageRow, renumberImageRows, removeImageRow } from "./ui-elements/TimelineHandler.js";
import { initializeDragAndResize } from "./utils/EventListeners.js";

export const out = (message) => {
    console.log(`Timeline-UI: ${message}`);
};

export class NodeManager {
    constructor(node, props={}) {
        // Destructuring props with default values
        const {
            size = [900, 600],
            baseHeight = 260,
            rowHeight = 100
        } = props;

        this.node = node;  // this is nodeType from app.registerExtension({async beforeRegisterNodeDef(nodeType, ...) {...}})
        this.node.size = size;
        this.baseHeight = baseHeight;
        this.rowHeight = rowHeight;

        this.imageTimelines = {};
        this.node.properties = {
            number_animation_frames: 96,
            frames_per_second: 12,
            time_format: "Frames" // Default value for time_format
        };

        // this.htmlElement = this.createImagesContainer(node);
    }

    /** Getters and Setters to alias node object passed to constructor */
    get widgets() {return this.node.widgets;}

    get title() {return this.node.title;}
    set title(newTitle) {this.node.title = newTitle;}

    get inputs() {return this.node.inputs;}
    set inputs(newInputs) {
        if (Array.isArray(newInputs)) {
            this.node.inputs = newInputs.map(input => ({name: input.name, type: input.type, label: input.label}));
        }
    }

    get size() {return this.node.size;}
    set size(newSize) {
        if (Array.isArray(newSize)) {
            this.node.size = newSize;
        }
    }

    get resizable() {return this.node.resizable;}
    set resizable(isResizable) {this.node.resizable = isResizable;}

    set onExecuted(func) {
        this.origOnExecuted = this.node.prototype.onExecuted;
        this.node.prototype.onExecuted = function() {
            this.origOnExecuted?.apply(this.node);

            func();
        }
    }

    /** Logical Methods */
    createImagesContainer() {
        const container = document.createElement("div");
        container.id = "images-rows-container";
        container.className = "timeline-container";
      
        this.timeRulerContainer = createTimeRuler(this.node);
        container.appendChild(this.timeRulerContainer);
      
        let domWidget = this.node.prototype.addDOMWidget("custom-html", "html", container, {
          getValue: () => container.innerHTML,
          setValue: (value) => {
            container.innerHTML = value;
          },
        });
        domWidget.callback = timeRulerCallback.bind(this.node);

        return container;
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
            this.imageTimelines[rowHTML.id] = {imgSrc: img.src, timelineHandler};
            uploadContainer.innerHTML = '';
            uploadContainer.appendChild(img);
          };
          reader.readAsDataURL(file);
        }
    }

    addTimelineHandlerRow() {
        addImageRow(this.node);
    }

    setupEventListeners() {
        this.htmlElement.addEventListener("click", (event) => {
            if (event.target.closest(".add-row")) {
              addImageRow(this.node);
            } else if (event.target.closest(".remove-row")) {
              removeImageRow(this.node, event.target);
            } else if (event.target.closest(".image-input")) {
              event.target.closest(".image-input").addEventListener("change", (e) => this.handleImageUpload(e));
            }
        });
    }

    updateNodeHeight() {
        const rowCount = this.htmlElement.querySelectorAll(".timeline-row").length;
        this.node.size[1] = this.baseHeight + this.rowHeight * rowCount;
    }

    initializeSortable(animation=150) {
        Sortable.create(this.htmlElement, {
          animation,
          handle: ".rearrange-handle",
          onEnd: () => {
            renumberImageRows(this.node);
          },
        });
    }

    initResizeListeners() {
        initializeDragAndResize();
    }
}