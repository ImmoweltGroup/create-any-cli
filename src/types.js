// @flow

export type FilePatternType = string;
export type FilePatternListType = Array<FilePatternType>;
export type QuestionType = {
  type: string,
  name: string,
  message: string,
  filter?: Function,
  validate?: Function,
  when?: Function,
  default?: any
};
export type QuestionListType = Array<QuestionType>;
export type AnswersType = {[string]: mixed};

export type CliConfigType = {
  templates: FilePatternListType
};
export type CliFlagsType = {
  [string]: mixed
};

//
// Template arguments
//
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

//
// Template configuration
//
export type ResolveQuestionsType = () =>
  | QuestionListType
  | Promise<QuestionListType>;
export type ResolveFilesType = (
  answers: AnswersType,
  flags: CliFlagsType
) => FilePatternListType | Promise<FilePatternListType>;
export type CreateTemplateArgsType = (
  answers: AnswersType,
  flags: CliFlagsType
) => TemplateArgsType | Promise<TemplateArgsType>;
export type ResolveDestinationFolderType = (
  answers: AnswersType,
  flags: CliFlagsType
) => string | Promise<string>;

export type TemplateConfigExportType = {
  id: string,
  description?: string,
  resolveQuestions?: ResolveQuestionsType,
  resolveFiles: ResolveFilesType,
  createTemplateArgs: CreateTemplateArgsType,
  resolveDestinationFolder: ResolveDestinationFolderType
};
export type TemplateConfigType = {
  cwd: string,
  config: TemplateConfigExportType
};
export type TemplateConfigsByIdType = {
  [string]: TemplateConfigType
};

//
// Hooks
//
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
