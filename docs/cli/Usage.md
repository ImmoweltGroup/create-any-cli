# CLI Usage

The `create` CLI can be used in many different ways, after configuring it and adding a template to your project, you can launch the CLI in 3 different modes:

### Interactive mode
The interactive mode is the most useful for people who like graphical guidance and are not that familiar with CLI's in general. It will prompt you to select a specific template from all resolved template configurations and afterwards continue with the questions of the selected template, easy!

```sh
create
```

### Pre-selected template mode
In case you know ahead of time which template you would like to use you can easily specify the template ID as an argument to the CLI, e.g.

```sh
create my-template
```

and the CLI will only ask you for answers of the resolved template questions.

### Template help mode
Not really sure what a template will do? No problem, all templates can be invoked with a `--help` or `-h` flag and you will see an automatically generated help / usage guide.

```sh
create my-template --help
```

### Non-Interactive mode
When executing the template help you should see all available CLI arguments listed with their description, so of course there is a way to pre-define the answers in the most common way via CLI flags e.g.

```sh
create my-template --foo="bar"
```

And that's it, no special fuss but almost everything you can ask for! :rocket: [Let's continue to see how a template is made](/docs/templates/CreatingTemplates.md)!
