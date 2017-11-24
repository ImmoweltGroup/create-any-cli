// @flow

import type {AnswersType, TemplateConfigType} from './../types.js';

const yargs = require('yargs');
const inquirer = require('inquirer');
const {createMsg} = require('./../lib/logger.js');
const api = require('./../api.js');
const Command = require('./../lib/command.js');

class DefaultCommand extends Command {
  async exec(): Promise<void> {
    this.log('start', `Resolving templates from`, process.cwd());

    await this.bootstrap();

    const template = await this.resolveAndPromptForTemplate();

    if (!template) {
      return this.log(
        'warn',
        `No templates found in`,
        process.cwd(),
        `Please configure the CLI to lookup templates using the ".createrc" file or a package.json["create-any-cli"] property.`
      );
    }

    this.log('start', `Using template "${template.config.id}"...`);

    const {
      resolveDestinationFolder,
      resolveFiles,
      createTemplateArgs
    } = template.config;
    const answers = await this.promptForTemplateAnswers(template);
    const filePatterns = await resolveFiles(answers);
    const args = await createTemplateArgs(answers);
    const distDir = await resolveDestinationFolder(answers);

    await api.processTemplateAndCreate({
      srcDir: template.cwd,
      ignorePatterns: ['create-config.js', '*/node_modules/*'],
      filePatterns,
      distDir,
      args
    });

    this.log(
      'succeed',
      `Successfully created template "${template.config.id}" in`,
      distDir
    );
  }

  async resolveAndPromptForTemplate(): Promise<void | TemplateConfigType> {
    const templatesById = await this.getTemplatesById();
    const templateKeys = Object.keys(templatesById);
    let templateId = yargs.argv._.join(' ').toLowerCase();

    if (templateKeys.length === 0) {
      return;
    }

    //
    // Prompt the user if no id was explicitly provided via the CLI args or
    // if the provided id is invalid.
    //
    const hasNoExplicitTemplateId = !templateId;
    const hasInvalidExplicitTemplateId =
      templateId && !templatesById[templateId];

    if (hasNoExplicitTemplateId || hasInvalidExplicitTemplateId) {
      const message = hasNoExplicitTemplateId
        ? 'Which template would you like to use?'
        : `No template found for id "${templateId}"`;

      this.spinner.stopAndPersist();

      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'templateId',
          message: createMsg(message),
          choices: templateKeys,
          filter: val => val.toLowerCase()
        }
      ]);

      templateId = answers.templateId;
    }

    return templatesById[templateId];
  }

  async promptForTemplateAnswers(
    template: TemplateConfigType
  ): Promise<AnswersType> {
    const {id, resolveQuestions} = template.config;
    let interactiveAnswers = {};
    let answers = {};

    if (typeof resolveQuestions === 'function') {
      const questions = await resolveQuestions();

      this.spinner.stopAndPersist();

      const filteredQuestions = questions.filter(question => {
        const {name, filter = val => val, validate = val => true} = question;
        const cliArg = filter(yargs.argv[name]);
        const isValid = validate(cliArg);
        const wasProvided = Boolean(cliArg && isValid);

        if (wasProvided) {
          answers[name] = cliArg;

          this.log('succeed', id, question.message, String(cliArg));

          return false;
        }

        return true;
      });

      interactiveAnswers = await inquirer.prompt(
        filteredQuestions.map(question => {
          return Object.assign({}, question, {
            message: createMsg(id, question.message)
          });
        })
      );
    }

    return {
      ...answers,
      ...interactiveAnswers
    };
  }
}

module.exports = DefaultCommand;
