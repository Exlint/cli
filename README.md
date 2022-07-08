<p align="center">
	<a href="https://github.com/Exlint/cli">
    	<img src="https://img.shields.io/github/workflow/status/Exlint/cli/Integration" alt="build status">
  	</a>
	<a href="https://www.npmjs.com/package/@exlint.io/cli">
    	<img src="https://img.shields.io/npm/dw/@exlint.io/cli" alt="npm downloads">
  	</a>
	<a href="https://github.com/Exlint/cli">
    	<img src="https://img.shields.io/npm/l/@exlint.io/cli" alt="npm license">
  	</a>
	<a href="https://github.com/Exlint/cli">
    	<img src="https://img.shields.io/npm/v/@exlint.io/cli" alt="npm version">
  	</a>
	<a href="https://github.com/Exlint/cli">
    	<img src="https://img.shields.io/github/commit-activity/m/Exlint/cli" alt="commits">
  	</a>
</p>

<p>&nbsp;</p>

<p align="center"><img src="./assets/brand.png" width="80%"/></p>

<h2 align="center">Exlint CLI</h2>

**👩🏻‍💻 Developement and Code Standard**: Keep your code clean with Exlint over multiple repositories.

**📦️ Sharable Code Conventions**: Share, use and run your code conventions over any chosen repositories.

**🚀 CI Workflow**: Integrate Exlint into your workflow to continuously prevent coding bad practices.

<p align="right"><em>See more on <a href="https://exlint.io">exlint.io</a></em></p>

## Table of Contents

-   [Getting Started](#getting-started)
-   [Running from command line](#running-from-command-line)
-   [CI Workflows](#ci-workflows)
-   [Support](#support)
-   [Contributing](#contributing)

    -   [Code of Conduct](#code-of-conduct)

-   [License](#license)

## Getting Started

To use Exlint, you first need to configure an account with groups and policies.
Please visit [Exlint.io](https://app.exlint.io) before using the CLI.

We recommend installing Exlint CLI globally using [`npm`](https://npmjs.com):

```bash
npm install --global @exlint.io/cli
```

You can also install it locally:

```bash
npm install --save-dev @exlint.io/cli
```

## Running from command line

You can run Exlint directly from the CLI (if it's globally available in your `PATH`, e.g. by `npm install --global @exlint.io/cli`) with a variety of useful commands.
If you haven't installed Exlint CLI globally, but locally, you can use it in the CLI by using `npx`.

### Auth Command

```bash
exlint auth
```

Exlint requires you to authenticate. This will allow you to use your configured groups and policies in the CLI.
First you should make sure you have created an account and configured your group.
When running the command, you will be prompted to your browser to authenticate yourself.
After doing so, you can return back to the CLI and start using Exlint!

### Use Command

```bash
exlint use <group_id>
```

When you want to use a group you have created in the dashboard, you copy its identifier and use it with the `use` command.
Exlint will adjust your IDE (if using VSCode or Webstorm), install required extensions and libraries.
You can easily switch group by using the command again!

### Run Command

```bash
exlint run [options]
```

After running the `use` command, you can run your group over your code to get CLI results.
Exlint will run your configured libraries against your code and report upon success or failure run.
If your code fails to match the configured code standard, Exlint will report the issues in the CLI.

#### Options

You can also run the command with `--fix` or `-f` option.
Providinig this option will make Exlint to try automatically fix your code issues.

## CI Workflows

You can run Exlint also in CI. If you want to integrate an Exlint step in your workflow, you can use the [GitHub Action](https://github.com/Exlint/github-action)

## Support

Currently we offer support through Discussions and Issues, but you can always reach out on contact@exlint.io.

## Contributing

Development of Exlint CLI happens in the open on GitHub, and we are grateful to the community for contributing bugfixes and improvements.

### Code of Conduct

Exlint has adopted a [Code of Conduct](CODE_OF_CONDUCT.md) that we expect project participants to adhere to.

## License

Exlint is [Apache 2.0 Licensed](./LICENSE).
