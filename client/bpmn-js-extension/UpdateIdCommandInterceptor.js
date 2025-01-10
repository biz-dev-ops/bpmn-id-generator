import CommandInterceptor from "diagram-js/lib/command/CommandInterceptor.js";
import diacritics from "diacritics";

const ELEMENT_TYPE_MAPPING = {
  "bpmn:Task": "Task",
  "bpmn:ServiceTask": "Task",
  "bpmn:ReceiveTask": "CatchEvent",
  "bpmn:SendTask": "ThrowEvent",
  "bpmn:ManualTask": "ManualTask",
  "bpmn:BusinessRuleTask": "Task",
  "bpmn:ScriptTask": "Task",
  "bpmn:UserTask": "UserTask",

  "bpmn:IntermediateCatchEvent": "CatchEvent",
  "bpmn:IntermediateThrowEvent": "ThrowEvent",
  "bpmn:BoundaryEvent": "BoundaryEvent",

  "bpmn:StartEvent": "StartEvent",
  "bpmn:EndEvent": "EndEvent",

  "bpmn:ExclusiveGateway": "Gateway",
  "bpmn:ParallelGateway": "Gateway",
  "bpmn:ComplexGateway": "Gateway",
  "bpmn:EventBasedGateway": "Gateway",

  "bpmn:Participant": "Participant",

  "bpmn:SequenceFlow": "Flow",

  "bpmn:SubProcess": "SubProcess"
};

class UpdateIdCommandInterceptor extends CommandInterceptor {
  constructor(eventBus, modeling, elementRegistry) {
    super(eventBus);
    this._modeling = modeling;
    this._elementRegistry = elementRegistry;
    this._updating = false;

    this.postExecuted("element.updateLabel", context => {
      const { element } = context;
      this._changeId(element);
    }, true);

    this.postExecuted("elements.delete", () => {
      if (this._updating) {
        return;
      }

      this._elementRegistry.forEach(element => {
        this._changeId(element);
      });
    }, true);

    eventBus.on("import.done", () => {
      try {
        this._elementRegistry.forEach(element => {
          this._changeId(element);
        });
      }
      catch { }
    }, true);
  }
}

UpdateIdCommandInterceptor.prototype._changeId = function (element) {
  this._updating = true;

  try {
    const self = this;
    const { businessObject } = element;
    let level = 0;
    let id;

    while (true) {
      id = createId(element, level);
      if (!id) {
        return;
      }

      if (businessObject.id === id) {
        return;
      }

      if (!this._elementRegistry.get(id)) {
        break;
      }

      level++;
    }

    self._modeling.updateProperties(element, { id: id });
  }
  finally {
    this._updating = false;
  }
}

const createId = function (element, level = 0) {
  const { businessObject } = element;
  const { sourceRef, $type } = businessObject;

  if (!$type || !($type in ELEMENT_TYPE_MAPPING)) {
    return;
  }

  const mappedType = ELEMENT_TYPE_MAPPING[$type];

  let { name } = businessObject;
  if (!name) {
    return;
  }

  if (sourceRef) {
    name += ` from ${sourceRef.name}`;
  }

  name = diacritics.remove(name);
  name = name.replace(/[^\w\s]/gi, "");
  name = stringToCamelCase(name);
  if (!isNaN(name.charAt(0))) {
    name = "N" + name;
  }

  if (level > 0) {
    name += level;
  }

  name = `${name}_${mappedType}`;

  return name;
}

const stringToCamelCase = function (str) {
  const camelCase = str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
    if (+match === 0) {
      return "";
    }
    return index == 0 ? match.toLowerCase() : match.toUpperCase();
  });
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
};

UpdateIdCommandInterceptor.$inject = ["eventBus", "modeling", "elementRegistry"];

export default UpdateIdCommandInterceptor;