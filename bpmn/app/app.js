import BpmnModeler from 'bpmn-js/lib/Modeler';
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
} from 'bpmn-js-properties-panel';
import setupFileOperations from './fileOperations';

import { SpiffworkflowModule, SpiffworkflowModdle } from 'bpmn-js-spiffworkflow'

console.log("yo!", SpiffworkflowModule, SpiffworkflowModdle)
const modelerEl = document.getElementById('modeler');
const panelEl = document.getElementById('panel');
let bpmnModeler;

import diagramXML from './example.bpmn';

/**
 * This provides an example of how to instantiate a BPMN Modeler configured with
 * all the extensions and modifications in this application.
 */
try {
  bpmnModeler = new BpmnModeler({
    container: modelerEl,
    propertiesPanel: {
      parent: panelEl,
    },
    additionalModules: [
 //     SpiffworkflowModule,
      BpmnPropertiesPanelModule,
      BpmnPropertiesProviderModule,
    ],
    moddleExtensions: {
//      spiffworkflowModdle: SpiffworkflowModdle,
    },
  });
} catch (error) {
  if (error.constructor.name === 'AggregateError') {
    console.log(error.message);
    console.log(error.name);
    console.log(error.errors);
  }
  throw error;
}

// import XML
bpmnModeler.importXML(diagramXML).then(() => {});

/**
 * It is possible to poplulate certain components using API calls to
 * a backend.  Here we mock out the API call, but this gives you
 * a sense of how things might work.
 *
 */
bpmnModeler.on('spiff.service_tasks.requested', (event) => {
  event.eventBus.fire('spiff.service_tasks.returned', {
    serviceTaskOperators: [
      {
        id: 'Chuck Norris Fact Service',
        parameters: [
          {
            id: 'category',
            type: 'string',
          },
        ],
      },
    ],
  });
});

// This handles the download and upload buttons - it isn't specific to
// the BPMN modeler or these extensions, just a quick way to allow you to
// create and save files.
setupFileOperations(bpmnModeler);
