module.exports = {
  objectType: {
    label: 'Object Type',
    viewClass: 'SelectView',
    model: 'TODO',
  },
  allowEmptyResult: {
    label: 'Allow Empty Result',
    viewClass: 'CheckBoxView',
  },
  allowCriteriaToBeOmitted: {
    label: 'Allow Criteria to be Omitted',
    viewClass: 'CheckBoxView',
  },
  emitBehaviour: {
    label: 'Emit Behaviour',
    viewClass: 'SelectView',
    model: {
      emitIndividually: 'Emit Individually',
      fetchAll: 'Fetch All',
      fetchPage: 'Fetch Page',
    },
  },
  startTime: {
    label: 'Start Time',
    viewClass: 'TextFieldView',
  },
  endTime: {
    label: 'End Time',
    viewClass: 'TextFieldView',
  },
  pageSize: {
    label: 'Polling Page Size',
    viewClass: 'TextFieldView',
  },
  singlePagePerInterval: {
    label: 'Single Page Per Interval',
    viewClass: 'CheckBoxView',
  },
};
