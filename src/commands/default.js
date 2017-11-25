// @flow

import type {
  AnswersType,
  QuestionListType,
  TemplateConfigType,
  TemplateHookArgsType
} from './../types.js';

const inquirer = require('inquirer');
const {createMsg} = require('./../lib/logger.js');
const api = require('./../api.js');
const Command = require('./../lib/command.js');

class DefaultCommand extends Command {
  /**
   * Executes the workflow of this command.
   *
   * @return {Promise} The Promise that resolves once everything was executed.
   */
  async exec(): Promise<void> {
    this.log('start', `Resolving templates from`, process.cwd());

    await this.bootstrap();

    const template = await this.resolveTemplateConfiguration();

    if (!template) {
      return process.exit(1);
    }

    this.log('start', `Using template "${template.config.id}"...`);

    const answers = await this.resolveTemplateAnswers(template);
    const filePatterns = await template.config.resolveFiles(
      answers,
      this.cli.flags
    );
    const args = await template.config.createTemplateArgs(
      answers,
      this.cli.flags
    );
    const distDir = await template.config.resolveDestinationFolder(
      answers,
      this.cli.flags
    );

    await api.processTemplateAndCreate({
      dist: distDir,
      template: {
        src: template.cwd,
        args,
        filePatterns,
        ignore: ['create-config.js', '*/node_modules/*']
      },
      hooks: {
        onInvalidDistDir: this.onInvalidDistDir,
        onBeforeReadFile: this.onBeforeReadFile,
        onBeforeProcessFile: this.onBeforeProcessFile,
        onBeforeWriteFile: this.onBeforeWriteFile,
        onAfterWriteFile: this.onAfterWriteFile
      }
    });

    this.log(
      'succeed',
      `Successfully created template "${template.config.id}" in`,
      distDir
    );
  }

  /**
   * Resolves the template to use, can be either provided via the CLI args,
   * if none was provided an interactive prompt will be created with all
   * available templates to choose from.
   *
   * @return {Promise} The Promise that resolves with the templateId the user has choosen.
   */
  async resolveTemplateConfiguration(): Promise<void | TemplateConfigType> {
    const templatesById = await this.getTemplatesById();
    const templateKeys = Object.keys(templatesById);
    let templateId = await this.getRequestedTemplateId();

    if (templateKeys.length === 0) {
      return this.log(
        'fail',
        `No templates found in`,
        process.cwd(),
        `Please configure the CLI to lookup templates using the ".createrc" file or a package.json["create-any-cli"] property.`
      );
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

      this.suspendLogging();

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

  /**
   * Resolves the given templates questions, and afterwards tries to resolve the
   * answers either via the CLI options or via an interactive prompt.
   *
   * @param  {Object}  template The template config / exports to use as a basis.
   * @return {Promise}          The Promise that resolves with the answers of the given template.
   */
  async resolveTemplateAnswers(
    template: TemplateConfigType
  ): Promise<AnswersType> {
    const {id, resolveQuestions} = template.config;

    if (!resolveQuestions) {
      return {};
    }

    const questions = await resolveQuestions();
    const {
      interactiveQuestions,
      implicitAnswers,
      implicitQuestions
    } = await this.groupQuestionsByType(questions);

    this.suspendLogging();

    implicitQuestions.forEach(question => {
      const {message, name} = question;

      this.log('succeed', id, message, String(implicitAnswers[name]));
    });

    const interactiveAnswers = await inquirer.prompt(
      interactiveQuestions.map(question => {
        return Object.assign({}, question, {
          message: createMsg(id, question.message)
        });
      })
    );

    return {
      ...implicitAnswers,
      ...interactiveAnswers
    };
  }

  /**
   * Groups questions by their type (CLI / Interactive prompt). CLI answers have precedence.
   *
   * @param  {Array}   questions         The list of inquirer questions.
   * @return {Promise}                   The Promise that resolves with the grouped answers/questions.
   */
  async groupQuestionsByType(questions: QuestionListType) {
    const interactiveQuestions = [];
    const implicitQuestions = [];
    const implicitAnswers: {[string]: mixed} = {};
    const {flags} = this.cli;

    questions.forEach(question => {
      const {name, filter = val => val, validate = val => true} = question;
      const value = filter(flags[name]);
      const isValid = validate(value);

      if (isValid && (value || value === true || value === 0)) {
        implicitQuestions.push(question);
        implicitAnswers[name] = value;
      } else {
        interactiveQuestions.push(question);
      }
    });

    return {
      implicitAnswers,
      implicitQuestions,
      interactiveQuestions
    };
  }

  onInvalidDistDir = (distDir: string) => {
    this.log(
      'fail',
      'Target folder',
      distDir,
      'is not empty, skipping any further operations...'
    );

    process.exit(1);
  };

  onBeforeReadFile = async ({filePaths}: TemplateHookArgsType) => {
    this.log('start', 'Reading file', filePaths.dist);
  };

  onBeforeProcessFile = async ({filePaths}: TemplateHookArgsType) => {
    this.log('start', 'Processing file', filePaths.dist);
  };

  onBeforeWriteFile = async ({filePaths}: TemplateHookArgsType) => {
    this.log('start', 'Writing file', filePaths.dist);
  };

  onAfterWriteFile = async ({filePaths}: TemplateHookArgsType) => {
    this.log('succeed', 'Writing file', filePaths.dist);
  };
}

module.exports = DefaultCommand;
