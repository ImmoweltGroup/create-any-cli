// @flow

export type FilePatternType = string;
export type FilePatternListType = Array<FilePatternType>;
export type QuestionType = {
  type: string,
  name: string,
  message: string,
  filter: Function,
  validate: Function,
  when: Function,
  default?: any
};
export type QuestionListType = Array<QuestionType>;
export type AnswersType = {[string]: mixed};

export type DecoratedTemplateArgsType = {
  [string]: {
    raw: string,
    snakeCase: string,
    kebabCase: string,
    upperCamelCase: string,
    camelCase: string,
    lowerCase: string,
    startCase: string,
    upperCase: string
  }
};
export type TemplateArgsType = DecoratedTemplateArgsType | Object;

export type TemplateConfigExportType = {
  id: string,
  resolveQuestions: () => QuestionListType | Promise<QuestionListType>,
  resolveFiles: (
    answers: AnswersType
  ) => FilePatternListType | Promise<FilePatternListType>,
  createTemplateArgs: (
    answers: AnswersType
  ) => TemplateArgsType | Promise<TemplateArgsType>,
  resolveDestinationFolder: (answers: AnswersType) => string | Promise<string>
};
export type TemplateConfigType = {
  cwd: string,
  config: TemplateConfigExportType
};
export type TemplateConfigsByIdType = {
  [string]: TemplateConfigType
};

export type CliConfigType = {
  templates: FilePatternListType
};

export type TemplateHookArgsType = {
  filePaths: {
    src: string,
    dist: string
  },
  context: Object,
  data: {
    raw: string,
    processed: string
  }
};
