import UpdateIdCommandInterceptor from "./UpdateIdCommandInterceptor"

export default {
  __init__: [ "BIZDEVOPS_BPMN_ID_GENERATOR" ],
  BIZDEVOPS_BPMN_ID_GENERATOR: ["type", UpdateIdCommandInterceptor ]
};
