import { app } from "../../scripts/app.js";
import './utils/Sortable.min.js';
import { NodeManager, out } from "./NodeManager.js";


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
        
        let nodeMgr = new NodeManager(nodeType);
        nodeMgr.title = "Timeline UI";
        nodeMgr.inputs = [
          {
            name: "model",
            type: "MODEL",
            label: "model"
          },
        ];

        const origOnNodeCreated = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function () {
          const r = origOnNodeCreated ? origOnNodeCreated.apply(nodeType, arguments) : undefined;

          const orgContext = nodeMgr.node;
          nodeMgr.node = nodeType;

          nodeMgr.baseHeight = 260;
          nodeMgr.rowHeight = 100;
          nodeMgr.size = [900, 600];
          nodeMgr.resizable = true;

          nodeMgr.createImagesContainer();

          out(`nodeMgr.htmlElement=${nodeMgr.htmlElement}`);

          nodeMgr.addTimelineHandlerRow();
          nodeMgr.setupEventListeners();
          nodeMgr.initializeSortable();
          nodeMgr.initResizeListeners();

          nodeMgr.node = orgContext;

          return r;
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