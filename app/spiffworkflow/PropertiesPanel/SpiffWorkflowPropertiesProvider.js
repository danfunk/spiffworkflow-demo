import scriptGroup, { SCRIPT_TYPE } from './parts/ScriptGroup';
import { is, isAny } from 'bpmn-js/lib/util/ModelUtil';
import dataReferenceGroup from './parts/DataReferenceGroup';
import { DataObjectSelect } from './parts/DataObjectSelect';
import { ListGroup, isTextFieldEntryEdited } from '@bpmn-io/properties-panel';
import {DataObjectArray} from './parts/DataObjectArray';
const LOW_PRIORITY = 500;

export default function SpiffWorkflowPropertiesProvider(propertiesPanel, translate, moddle, commandStack, elementRegistry) {
  this.getGroups = function(element) {
    return function(groups) {
      if (is(element, 'bpmn:ScriptTask')) {
        groups.push(createScriptGroup(element, translate, moddle));
      } else if (isAny(element, [ 'bpmn:Task', 'bpmn:CallActivity', 'bpmn:SubProcess' ])) {
        groups.push(preScriptPostScriptGroup(element, translate, moddle));
      }
      if (is(element, 'bpmn:DataObjectReference')) {
        groups.push(createDataObjectSelector(element, translate, moddle));
      }
      if (is(element, 'bpmn:Process')) {
        groups.push(createDataObjectEditor(element, translate, moddle, commandStack, elementRegistry));
      }


      return groups;
    };
  };
  propertiesPanel.registerProvider(LOW_PRIORITY, this);
}

SpiffWorkflowPropertiesProvider.$inject = [ 'propertiesPanel', 'translate', 'moddle', 'commandStack', 'elementRegistry' ];


/**
 * Adds a group to the properties panel for the script task that allows you
 * to set the script.
 * @param element
 * @param translate
 * @returns The components to add to the properties panel. */
function createScriptGroup(element, translate, moddle, commandStack) {
  return {
    id: 'spiff_script',
    label: translate('SpiffWorkflow Properties'),
    entries: scriptGroup(element, moddle, SCRIPT_TYPE.bpmn, 'Script', 'Code to execute.')
  };
}

/**
 * Adds a section to the properties' panel for NON-Script tasks, so that
 * you can define a pre-script and a post-script for modifying data as it comes and out.
 * @param element
 * @param translate
 * @param moddle  For altering the underlying XML File.
 * @returns The components to add to the properties panel.
 */
function preScriptPostScriptGroup(element, translate, moddle) {
  return {
    id: 'spiff_pre_post_scripts',
    label: translate('Pre-Script and Post-Script'),
    entries: [
      ...scriptGroup(element,
        moddle,
        SCRIPT_TYPE.pre,
        'Pre-Script',
        'Code to execute prior to this task.'),
      ...scriptGroup(element,
        moddle,
        SCRIPT_TYPE.post,
        'Post-Script',
        'code to execute after this task.')
    ]
  };
}

/**
 * Create a group on the main panel with a select box (for choosing the Data Object to connect)
 * @param element
 * @param translate
 * @param moddle
 * @returns entries
 */
function createDataObjectSelector(element, translate, moddle) {
  return {
    id: 'data_object_properties',
    label: translate('Data Object Properties'),
    entries: [
      {
        id: 'selectDataObject',
        element,
        component: DataObjectSelect,
        isEdited: isTextFieldEntryEdited,
        moddle: moddle
      }
    ]
  };
}

/**
 * Create a group on the main panel with a select box (for choosing the Data Object to connect) AND a
 * full Data Object Array for modifying all the data objects.
 * @param element
 * @param translate
 * @param moddle
 * @returns entries
 */
function createDataObjectEditor(element, translate, moddle, commandStack, elementRegistry) {
  const dataObjectArray = {
    id: 'editDataObjects',
    element,
    label: 'Data Objects',
    component: ListGroup,
    ...DataObjectArray({ element, moddle, commandStack, elementRegistry })
  };

  if (dataObjectArray.items) {
    return dataObjectArray;
  }
}
