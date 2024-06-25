import { createTimeRuler, timeRulerCallback } from "./ui-elements/TimeRuler.js";
import { addImageRow, renumberImageRows, removeImageRow } from "./ui-elements/TimelineHandler.js";
import { initializeDragAndResize } from "./utils/EventListeners.js";
import { app } from "../../scripts/app.js";
import { ComfyWidgets } from "../../scripts/widgets.js";

export const out = (message) => {
    console.log(`Timeline-UI: ${message}`);
};

export function createImagesContainer(node, nodeMgr) {
    const container = document.createElement("div");
    container.id = "images-rows-container";
    container.className = "timeline-container";
  
    nodeMgr.timeRulerContainer = createTimeRuler(node);
    container.appendChild(nodeMgr.timeRulerContainer);
  
    let domWidget = node.prototype.addDOMWidget("custom-html", "html", container, {
      getValue: () => container.innerHTML,
      setValue: (value) => {
        container.innerHTML = value;
      },
    });
    domWidget.callback = timeRulerCallback.bind(node);

    nodeMgr.htmlElement = container;
}

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
        ipadapter_preset: "LIGHT - SD1.5 only (low strength)",
        video_width: 512,
        video_height: 512,
        interpolation_mode: "Linear",
        number_animation_frames: 96,
        frames_per_second: 12,
        time_format: "Frames" // Default value for time_format
      };

      this.htmlElement;
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
    addWidgets() {
      ComfyWidgets.COMBO(this.node.prototype, "ipadapter_preset", [["LIGHT - SD1.5 only (low strength)", "STANDARD (medium strength)", "VIT-G (medium strength)", "PLUS (high strength)", "PLUS FACE (portraits)", "FULL FACE - SD1.5 only (portraits stronger)"], { default: "LIGHT - SD1.5 only (low strength)" }]);
      ComfyWidgets.FLOAT(this.node.prototype, "video_width", ["INT", { default: 512, min: 0, max: 10000, step: 1 }], app);
      ComfyWidgets.FLOAT(this.node.prototype, "video_height", ["INT", { default: 512, min: 0, max: 10000, step: 1 }], app);
      ComfyWidgets.COMBO(this.node.prototype, "interpolation_mode", [["Linear", "Ease_in", "Ease_out", "Ease_in_out"], { default: "Linear" }]);
      ComfyWidgets.FLOAT(this.node.prototype, "number_animation_frames", ["INT", { default: 96, min: 1, max: 12000, step: 1 }], app);
      ComfyWidgets.FLOAT(this.node.prototype, "frames_per_second", ["INT", { default: 12, min: 8, max: 24, step: 1 }], app);
    
      // Time format COMBO widget with the specified structure
      ComfyWidgets.COMBO(this.node.prototype, "time_format", [["Frames", "Seconds"], { default: "Frames" }]);
    
      // Bind onWidgetChange function to widget change events
      this.node.prototype.widgets.forEach(widget => {
        console.log(`Widget initialized: ${widget.name} with value ${widget.value}`); // Debugging output
        widget.callback = this.onWidgetChange.bind(widget, widget);
      });
    }

    onWidgetChange(widget, value) {
      console.log(`Widget changed: ${widget.name} = ${value}`);
      this.node.properties[widget.name] = value;
      console.log('Updated properties:', this.node.properties);

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
      
        this.timeRulerContainer = createTimeRuler(this.node);
        container.appendChild(this.timeRulerContainer);
      
        let domWidget = this.node.prototype.addDOMWidget("custom-html", "html", container, {
          getValue: () => container.innerHTML,
          setValue: (value) => {
            container.innerHTML = value;
          },
        });
        domWidget.callback = timeRulerCallback.bind(this.node);
    
        this.htmlElement = container;
        document.body.appendChild(this.htmlElement);
        out(`this.htmlElement=${this.htmlElement} container=${container}`);
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
      addImageRow(this);
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