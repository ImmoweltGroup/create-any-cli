// @flow

const template = require('./lib/template.js');

module.exports = {
  createDecoratedTemplateArgs: template.createDecoratedTemplateArgs.bind(
    template
  ),
  processTemplateAndCreate: template.processTemplateAndCreate.bind(template),
  resolveTemplateConfigsById: template.resolveTemplateConfigsById.bind(template)
};
