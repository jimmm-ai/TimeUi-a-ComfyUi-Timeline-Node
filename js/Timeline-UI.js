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
        nodeType.prototype.onNodeCreated = function () {
          origOnNodeCreated?.apply(this, arguments);

          /** Save the original nodeType context and set nodeMgr.node to the new nodeType context within onNodeCreated
           * This is importanat because nodeType as context is different inside the onNodeCreated call than within beforeRegisterNodeDef
           *  and the context for nodeType inside of onNodeCreated is required for addDOMWidget to work properly (called within nodeMgr.createImagesContainer()).
           * Thus, nodeMgr.node must be reset to match the required context so everything behind the scenes works properly.
          */
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
      }
  },
};


app.registerExtension(node);