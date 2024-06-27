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

const node = {
  name: "jimmm.ai.TimelineUI",
  async beforeRegisterNodeDef(nodeType, nodeData, app) {
      if (nodeType.comfyClass === "jimmm.ai.TimelineUI") {
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

          /**
           * `this` is the required context of the instanced node to make sure that
           *   the html is added to the node being created instead of applied to all
           *   existing nodes.
          */
          let nodeMgr = new NodeManager(this);

          nodeMgr.baseHeight = 260;
          nodeMgr.rowHeight = 100;

          nodeMgr.onNodeCreated();

        }
      }
  },
};


app.registerExtension(node);