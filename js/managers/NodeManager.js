import { createTimeRuler, updateTimeRuler, updateAllHandlersFrameInfo } from "../ui-elements/TimeRuler.js";
import { addImageRow, renumberImageRows, removeImageRow } from "../ui-elements/TimelineHandler.js";
import { initializeDragAndResize } from "../utils/EventListeners.js";
import { ObjectStore } from "./ObjectStore.js";
import { app } from "../../../scripts/app.js";
import { $el } from "../../../scripts/ui.js";
import { ComfyWidgets } from "../../../scripts/widgets.js";

const createUUIDGenerator = () => {
  let currUUID = 0;
  return () => currUUID++;
};

const uuid = createUUIDGenerator();

// We don't need to add the docListeners more than once, so this flag stops multiple adds
let docListenersAdded = false;

export const out = (message) => {
    console.log(`Timeline-UI: ${message}`);
};

function get_position_style(ctx, widget_width, y, node_height, rowHeight) {
  const MARGIN = 8;

/**
 * Create a transform that deals with all the scrolling and zooming
 * This use of logarithms appears to be the most stable method to handle zooming
*/
  const elRect = ctx.canvas.getBoundingClientRect();
  const scaleFactor = ctx.getTransform().a;  // Scale: Zoomed in=[0.1, 1), Normal=1, Zoomed out=(1, 10]
  const scaledMargin = (1 + Math.log(MARGIN) / Math.log(2)) * (1 + Math.log10(MARGIN)) * (1 + (Math.log10(scaleFactor)));
  const transform = new DOMMatrix()
      .scaleSelf(elRect.width / ctx.canvas.width, elRect.height / ctx.canvas.height)
      .multiplySelf(ctx.getTransform())
      .translateSelf(scaledMargin, scaledMargin + y);

  return {
      transformOrigin: '0 0',
      transform: transform.toString(),
      left: `${scaledMargin}px`, 
      top: `${scaledMargin}px`,
      position: "absolute",
      maxWidth: `${widget_width - scaledMargin*4}px`,
      maxHeight: `${rowHeight}px`,    // we're assuming we have the whole height of the node
      width: `${widget_width - scaledMargin*4}px`,
      height: `${rowHeight}px`,
  }
}

/**
 * this == nodeStorage.get(nodeUID) only because the object persists within nodeStorage
 */
function onWidgetChange(widget, nodeUID) {
  let realNode = nodeStorage.get(nodeUID);
  // realNode.properties[widget.name] = widget.value;
  this.properties[widget.name] = widget.value;

  console.log(`nodeStorage(${nodeUID}).properties[${widget.name}] ${realNode.properties[widget.name] === this.properties[widget.name] ? 'equals' : 'does not equal'} this.properties[${widget.name}]`);
  
  if (realNode.timeRulerContainer) {
    const timeRuler = this.timeRulerContainer.querySelector('.time-ruler');
    if (timeRuler) {
        updateTimeRuler(this, timeRuler);
        updateAllHandlersFrameInfo(this);
    } else {
        console.error("Time ruler element not found!");
    }
} else {
    console.error("Time ruler container not found!");
}
}

class NodeManager {
    constructor(node, props={}) {
      // Destructuring props with default values
      const {
          size = [900, 360],
          baseHeight = 260,
          rowHeight = 100,
          serialize_widgets = true,
      } = props;
      
      this.node = node;
      this.uID = uuid();
      this.node.jimmmm_ai_node_uID = this.uID;
      this.baseHeight = baseHeight;
      this.rowHeight = rowHeight;
      this.node.serialize_widgets = serialize_widgets;
      this.node.size = size;
      this.properties = {
        ipadapter_preset: "LIGHT - SD1.5 only (low strength)",
        video_width: 512,
        video_height: 512,
        interpolation_mode: "Linear",
        number_animation_frames: 96,
        frames_per_second: 12,
        time_format: "Frames",
        imageTimelineInfo: {},
      }

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
          this.node.setDirtyCanvas(true, true);
      }
    }

    get resizable() {return this.node.resizable;}
    set resizable(isResizable) {this.node.resizable = isResizable;}

    onNodeCreated() {
      this.addWidgets();
      this.createImagesContainer();
      this.addTimelineHandlerRow();
      this.setupEventListeners();
      this.initializeSortable();
      this.initResizeListeners();
      this.addTimelineWidget();
    }

    /** Logical Methods */
    addWidgets() {
      ComfyWidgets.COMBO(this.node, "ipadapter_preset", [["LIGHT - SD1.5 only (low strength)", "STANDARD (medium strength)", "VIT-G (medium strength)", "PLUS (high strength)", "PLUS FACE (portraits)", "FULL FACE - SD1.5 only (portraits stronger)"], { default: "LIGHT - SD1.5 only (low strength)" }]);
      ComfyWidgets.FLOAT(this.node, "video_width", ["INT", { default: 512, min: 0, max: 10000, step: 1 }], app);
      ComfyWidgets.FLOAT(this.node, "video_height", ["INT", { default: 512, min: 0, max: 10000, step: 1 }], app);
      ComfyWidgets.COMBO(this.node, "interpolation_mode", [["Linear", "Ease_in", "Ease_out", "Ease_in_out"], { default: "Linear" }]);
      ComfyWidgets.FLOAT(this.node, "number_animation_frames", ["INT", { default: 96, min: 1, max: 12000, step: 1 }], app);
      ComfyWidgets.FLOAT(this.node, "frames_per_second", ["INT", { default: 12, min: 8, max: 24, step: 1 }], app);
      ComfyWidgets.COMBO(this.node, "time_format", [["Frames", "Seconds"], { default: "Frames" }], app);
    
      // Bind onWidgetChange function to widget change events
      this.node.widgets.forEach(widget => {
        widget.callback = onWidgetChange.bind(this, widget, this.uID);
      });
    }

    createImagesContainer() {
        const container = $el("div.timeline-container", { 
          id: "images-rows-container" 
        });
      
        this.timeRulerContainer = createTimeRuler(this);
        container.appendChild(this.timeRulerContainer);
    
        this.htmlElement = container;
        document.body.appendChild(this.htmlElement);
    }

    addTimelineWidget() {
      const rowHeight = this.rowHeight;
      const timelineWidget = {
        type: "HTML",
        name: "timeline",
        inputEl: this.htmlElement,
        draw(ctx, node, widget_width, y, widget_height) {
          Object.assign(this.inputEl.style, get_position_style(ctx, widget_width, y, node.size[1]), rowHeight);
        },
        async serializeValue(nodeId, widgetIndex) {
          return this.properties.imageTimelineInfo;
        }
      };

      this.node.addCustomWidget(timelineWidget);
      this.node.onRemoved = function() { timelineWidget.inputEl.remove(); };
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
          // This is used for passing the images to the backend
          this.properties.imageTimelineInfo[rowHTML.id] = {imgSrc: img.src, timelineHandler};
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
          addImageRow(this);
        } else if (event.target.closest(".remove-row")) {
          removeImageRow(this, event.target);
        } else if (event.target.closest(".image-input")) {
          event.target.closest(".image-input").addEventListener("change", (e) => this.handleImageUpload(e));
        }
      });
    }

    updateNodeHeight(addingRow=true) {
      const rowCount = this.htmlElement.querySelectorAll(".timeline-row").length + (addingRow ? 1 : 0);
      console.log(`row count=${rowCount}`);
      this.size = [this.size[0], this.baseHeight + this.rowHeight * rowCount];
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
      if (!docListenersAdded) {
        initializeDragAndResize(this);
      }
      docListenersAdded = true;
    }
}

let nodeStorage = new ObjectStore();

// I want every NodeManager to be stored in the nodeStorage, so this is the only way to get a node manager in code
export function makeNodeManager(node, props={}) {
  const uID = nodeStorage.add(new NodeManager(node, props));
  return nodeStorage.get(uID);
}