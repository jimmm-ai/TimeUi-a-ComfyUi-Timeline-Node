import { app } from "../../scripts/app.js";
import './utils/Sortable.min.js';
import { NodeManager, out } from "./NodeManager.js";
import { ComfyWidgets } from "../../scripts/widgets.js";


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

        nodeType.size = [900, 600];
        nodeType.resizable = true;
        const origOnNodeCreated = nodeType.prototype.onNodeCreated;

        out(`this has "addWidget" = ${this.hasOwnProperty("addWidget")}`);
        out(`nodeType has "addWidget" = ${nodeType.hasOwnProperty("addWidget")}`);
        out(`nodeType.prototype has "addWidget" = ${nodeType.prototype.hasOwnProperty("addWidget")}`);

        nodeType.prototype.onNodeCreated = function () {
          origOnNodeCreated?.apply(this, arguments);

          /** Save the original nodeType context and set nodeMgr.node to the new nodeType context within onNodeCreated
           * This is importanat because nodeType as context is different inside the onNodeCreated call than within beforeRegisterNodeDef
           *  and the context for nodeType inside of onNodeCreated is required for addDOMWidget to work properly (called within nodeMgr.createImagesContainer()).
           * Thus, nodeMgr.node must be reset to match the required context so everything behind the scenes works properly.
          */

          out(`this has "addWidget" = ${this.hasOwnProperty("addWidget")}`);
          out(`nodeType has "addWidget" = ${nodeType.hasOwnProperty("addWidget")}`);
          out(`nodeType.prototype has "addWidget" = ${nodeType.prototype.hasOwnProperty("addWidget")}`);

          let nodeMgr = new NodeManager(nodeType);

          nodeMgr.baseHeight = 260;
          nodeMgr.rowHeight = 100;

          nodeMgr.addWidgets();
          nodeMgr.createImagesContainer();
          nodeMgr.addTimelineHandlerRow();
          nodeMgr.setupEventListeners();
          nodeMgr.initializeSortable();
          nodeMgr.initResizeListeners();

        }

        /* Bind addDOMWidget to nodeType
        nodeType.prototype.addDOMWidget = LiteGraph.LGraphNode.prototype.addDOMWidget;
        
        // Set title and inputs
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
          const r = orig_nodeCreated ? orig_nodeCreated.apply(this, arguments) : undefined;

          // Set the size
          this.baseHeight = 260; // Base height for the node excluding rows
          this.rowHeight = 100; // Height of each row
          this.size = [900, 600];
          this.resizable = true;
          // this.onResize?.(this.size);

          // Set properties
          this.properties = {
            ipadapter_preset: "LIGHT - SD1.5 only (low strength)",
            video_width: 512,
            video_height: 512,
            interpolation_mode: "Linear",
            number_animation_frames: 96,
            frames_per_second: 12,
            time_format: "Frames" // Default value for time_format
          };
          
          // Use addDOMWidget to add a custom widget that supports custom html
          this.htmlElement = createImagesContainer(this);
          document.body.appendChild(this.htmlElement);

          this.widgets.forEach(widget => {
            // console.log(`Widget initialized: ${widget.name} with value ${widget.value}`); // Debugging output
            widget.callback = onWidgetChange.bind(this, this, widget);
          });

          addImageRow(this);
          setupEventListeners(this);
          initializeSortable(this);
          initializeDragAndResize();

          return r;
        };

        // Hijacking onExecute
        const orig_onExecuted = nodeType.prototype.onExecuted;
        nodeType.prototype.onExecuted = (messageFromBackend) => {
          orig_onExecuted?.apply(this);
        };

        */
      }
  },
};


app.registerExtension(node);