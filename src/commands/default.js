const findConfigUp = require('find-config-up');
const yargs = require('yargs');
const inquirer = require('inquirer');
const {ora, createMsg} = require('./../lib/logger.js');
const template = require('./../lib/template.js');

module.exports = async function defaultCommand() {
  const cwd = process.cwd();
  const args = yargs.argv;
  const spinner = ora(createMsg(`Resolving templates from`, cwd)).start();
  const config = await findConfigUp({
    rawConfigFileName: '.createrc',
    packageJsonProperty: 'create-any-cli',
    defaults: {
      templates: []
    }
  });
  const templatesById = await template.resolveTemplates(cwd, config.templates);
  let templateId = args._.join(' ');

  //
  // Prompt the user if no id was explicitly provided via the CLI args.
  //
  if (!templateId) {
    spinner.stopAndPersist();
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'templateId',
        message: createMsg('Which template would you like to use?'),
        choices: Object.keys(templatesById),
        filter: val => val.toLowerCase()
      }
    ]);

    templateId = answers.templateId;
  }

  //
  // Resolve the template config and apply the configured logic to the CLI.
  //
  const templateConfig = templatesById[templateId];

  spinner.start(createMsg(`Using template "${templateId}"...`));

  if (templateConfig) {
    const {
      id,
      files,
      createTemplateArgs,
      resolveDestinationFolder,
      questions = []
    } = templateConfig;
    let answers = {};

    //
    // Questions
    //
    if (questions.length) {
      spinner.stopAndPersist();
      answers = await inquirer.prompt(
        questions.map(question => {
          return Object.assign({}, question, {
            message: createMsg(id, question.message)
          });
        })
      );
    }

    //
    // Arguments and path destination.
    //
    const args = await createTemplateArgs(answers);
    const distDir = await resolveDestinationFolder(cwd, answers);

    await template.processTemplateAndCreate({
      files,
      distDir,
      args
    });

    spinner.succeed(
      createMsg(`Successfully created template "${templateId}" in`, cwd)
    );
  } else {
    const availableIds = Object.keys(templatesById)
      .map(id => `• ${id}`)
      .join('\n');

    return spinner.warn(
      createMsg(
        cwd,
        `No template found for id "${
          templateId
        }".\nResolved template id's are:\n${availableIds}\n`
      )
    );
  }
};
