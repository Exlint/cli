import path from 'path';

import fs from 'fs-extra';
import xml2js from 'xml2js';
import { Injectable } from '@nestjs/common';

import { ILibrary } from '@/interfaces/library';
import { EXLINT_FOLDER_PATH } from '@/models/exlint-folder';

import { IWorkspace } from '../../interfaces/webstorm';
import IdeLibrares from './ide-libraries';

@Injectable()
export class WebstormLibrariesService extends IdeLibrares {
	protected async adjustLocalImpl(projectId: string, libs: ILibrary[]) {
		const workspaceXmlFilePath = path.join(process.cwd(), '.idea', 'workspace.xml');

		const workspaceContent = await fs.readFile(workspaceXmlFilePath, 'utf-8');
		const parsedWorkspaceContent = (await xml2js.parseStringPromise(workspaceContent)) as IWorkspace;
		const workspaceComponents = parsedWorkspaceContent.project?.component ?? [];

		const workspacePropertiesIndex = workspaceComponents.findIndex(
			(component) => component.$?.name === 'PropertiesComponent',
		);

		const workspaceProperties =
			workspacePropertiesIndex !== -1 ? workspaceComponents[workspacePropertiesIndex]! : {};

		const workspacePropertiesObject = workspaceProperties._?.keyToString ?? {};

		const projectPath = path.join(EXLINT_FOLDER_PATH, projectId);

		const writePluginsConfigurationsPromises = [];

		let shouldOverridePlugins = false;

		if (libs.includes('eslint')) {
			const eslintXmlFilePath = path.join(process.cwd(), '.idea', 'jsLinters', 'eslint.xml');

			const eslintXmlConfig = {
				project: {
					$: { version: '4' },
					component: {
						'$': { name: 'EslintConfiguration' },
						'work-dir-patterns': { $: { value: process.cwd() } },
						'custom-configuration-file': {
							$: { used: true, path: path.join(projectPath, '.eslintrc.json') },
						},
					},
				},
			};

			const builder = new xml2js.Builder({
				xmldec: { version: '1.0', encoding: 'UTF-8' },
			});

			const eslintXmlFileContent = builder.buildObject(eslintXmlConfig);

			writePluginsConfigurationsPromises.push(fs.outputFile(eslintXmlFilePath, eslintXmlFileContent));

			workspacePropertiesObject['js.linters.configure.manually.selectedeslint'] = true;
			workspacePropertiesObject['node.js.detected.package.eslint'] = true;
			workspacePropertiesObject['node.js.selected.package.eslint'] = path.join(
				projectPath,
				'node_modules',
				'eslint',
			);

			shouldOverridePlugins = true;
		}

		if (libs.includes('prettier')) {
			workspacePropertiesObject['prettierjs.PrettierConfiguration.Package'] = path.join(
				projectPath,
				'node_modules',
				'prettier',
			);

			shouldOverridePlugins = true;
		}

		if (libs.includes('stylelint')) {
			const stylelintXmlFilePath = path.join(
				process.cwd(),
				'.idea',
				'stylesheetLinters',
				'stylelint.xml',
			);

			const stylelintXmlConfig = {
				project: {
					$: { version: '4' },
					component: {
						'$': { name: 'StylelintConfiguration' },
						'config-file': { $: { value: path.join(projectPath, '.stylelintrc.json') } },
					},
				},
			};

			const builder = new xml2js.Builder({
				xmldec: { version: '1.0', encoding: 'UTF-8' },
			});

			const stylelintXmlFileContent = builder.buildObject(stylelintXmlConfig);

			writePluginsConfigurationsPromises.push(
				fs.outputFile(stylelintXmlFilePath, stylelintXmlFileContent),
			);

			workspacePropertiesObject['node.js.detected.package.stylelint'] = true;
			workspacePropertiesObject['node.js.selected.package.stylelint'] = path.join(
				projectPath,
				'node_modules',
				'stylelint',
			);

			shouldOverridePlugins = true;
		}

		if (shouldOverridePlugins) {
			const newComponent = {
				...workspaceProperties,
				_: {
					...(workspaceProperties._ ?? {}),
					keyToString: workspacePropertiesObject,
				},
			};

			if (workspacePropertiesIndex === -1) {
				workspaceComponents.push(newComponent);
			} else {
				workspaceComponents[workspacePropertiesIndex] = newComponent;
			}

			const newWorkspace = {
				...parsedWorkspaceContent,
				project: {
					...(parsedWorkspaceContent.project ?? {}),
					component: workspaceComponents,
				},
			};

			const builder = new xml2js.Builder({
				xmldec: { version: '1.0', encoding: 'UTF-8' },
			});

			const workspaceXmlFileContent = builder.buildObject(newWorkspace);

			writePluginsConfigurationsPromises.push(
				fs.outputFile(workspaceXmlFilePath, workspaceXmlFileContent),
			);
		}

		await Promise.all(writePluginsConfigurationsPromises);
	}
}
