const LOW_PRIORITY = 500;

export default function IdGeneratorExtension(eventBus) {
  const self = this;
  console.log("IdGeneratorExtension");

  eventBus.on([
    "import.done",
    "elements.changed",
    "linting.configChanged",
    "linting.toggle"
  ], LOW_PRIORITY, function(e) {
    self.update();
  });

  this._init();
}

IdGeneratorExtension.prototype._init = function() {
  const self = this;
  console.log("_init");
};

IdGeneratorExtension.prototype.update = function() {
  const self = this;
  console.log("update");
}

IdGeneratorExtension.$inject = [
  "eventBus"
];