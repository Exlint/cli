import path from 'path';

import fs from 'fs-extra';
import xml2js from 'xml2js';
import { Injectable } from '@nestjs/common';

import { ILibrary } from '@/interfaces/library';
import { EXLINT_FOLDER_PATH } from '@/models/exlint-folder';
import { IUnknown } from '@/interfaces/unknown';

import { IWorkspace } from '../../interfaces/webstorm';
// import { IPolicyFilesPattern } from '../../interfaces/file-pattern';
import IdeLibrares from './ide-libraries';

@Injectable()
export class WebstormLibrariesService extends IdeLibrares {
	public async adjustLocal(
		projectId: string,
		libs: ILibrary[],
		// policiesFilesPattern?: IPolicyFilesPattern,
	) {
		const workspaceXmlFilePath = path.join(process.cwd(), '.idea', 'workspace.xml');
		const workspaceContent = await fs.readFile(workspaceXmlFilePath, 'utf-8').catch(() => '');

		const parsedWorkspaceContent = (await xml2js.parseStringPromise(
			workspaceContent,
		)) as IWorkspace | null;

		const workspaceComponents = parsedWorkspaceContent?.project?.component ?? [];

		const workspacePropertiesIndex = workspaceComponents.findIndex(
			(component) => component.$?.name === 'PropertiesComponent',
		);

		const workspaceProperties =
			workspacePropertiesIndex !== -1 ? workspaceComponents[workspacePropertiesIndex]! : {};

		let workspacePropertiesObject: { keyToString: Record<string, unknown> } & IUnknown;

		if (!workspaceProperties._) {
			workspacePropertiesObject = { keyToString: {} };
		} else if (typeof workspaceProperties._ === 'string') {
			workspacePropertiesObject = { keyToString: {}, ...JSON.parse(workspaceProperties._) };
		} else {
			workspacePropertiesObject = { keyToString: {}, ...workspaceProperties._ };
		}

		workspacePropertiesObject.keyToString['EXLINT_PLACEHOLDER'] = '<EXLINT_PLACEHOLDER>';

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
				cdata: true,
			});

			const eslintXmlFileContent = builder.buildObject(eslintXmlConfig);

			writePluginsConfigurationsPromises.push(fs.outputFile(eslintXmlFilePath, eslintXmlFileContent));

			workspacePropertiesObject.keyToString['js.linters.configure.manually.selectedeslint'] = 'true';
			workspacePropertiesObject.keyToString['node.js.detected.package.eslint'] = 'true';
			workspacePropertiesObject.keyToString['node.js.selected.package.eslint'] = path.join(
				projectPath,
				'node_modules',
				'eslint',
			);

			shouldOverridePlugins = true;
		}

		if (libs.includes('prettier')) {
			const prettierXmlFilePath = path.join(process.cwd(), '.idea', 'prettier.xml');

			const prettierXmlConfig = {
				project: {
					$: { version: '4' },
					component: {
						$: { name: 'PrettierConfiguration' },
						option: [
							{ $: { name: 'myRunOnSave', value: 'true' } },
							{ $: { name: 'myRunOnReformat', value: 'true' } },
						],
					},
				},
			};

			const builder = new xml2js.Builder({
				xmldec: { version: '1.0', encoding: 'UTF-8' },
				cdata: true,
			});

			const prettierXmlFileContent = builder.buildObject(prettierXmlConfig);

			writePluginsConfigurationsPromises.push(
				fs.outputFile(prettierXmlFilePath, prettierXmlFileContent),
			);

			workspacePropertiesObject.keyToString['prettierjs.PrettierConfiguration.Package'] = path.join(
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
				cdata: true,
			});

			const stylelintXmlFileContent = builder.buildObject(stylelintXmlConfig);

			writePluginsConfigurationsPromises.push(
				fs.outputFile(stylelintXmlFilePath, stylelintXmlFileContent),
			);

			workspacePropertiesObject.keyToString['node.js.detected.package.stylelint'] = 'true';
			workspacePropertiesObject.keyToString['node.js.selected.package.stylelint'] = path.join(
				projectPath,
				'node_modules',
				'stylelint',
			);

			shouldOverridePlugins = true;
		}

		if (shouldOverridePlugins) {
			const newComponent = {
				...workspaceProperties,
				$: {
					name: 'PropertiesComponent',
				},
				_: JSON.stringify(workspacePropertiesObject, null, 2),
			};

			if (workspacePropertiesIndex === -1) {
				workspaceComponents.push(newComponent);
			} else {
				workspaceComponents[workspacePropertiesIndex] = newComponent;
			}

			const newWorkspace = {
				...(parsedWorkspaceContent ?? {}),
				project: {
					...(parsedWorkspaceContent?.project ?? {}),
					component: workspaceComponents,
				},
			};

			const builder = new xml2js.Builder({
				xmldec: { version: '1.0', encoding: 'UTF-8' },
				cdata: true,
			});

			const workspaceXmlFileContent = builder.buildObject(newWorkspace);

			writePluginsConfigurationsPromises.push(
				fs.outputFile(workspaceXmlFilePath, workspaceXmlFileContent),
			);
		}

		await Promise.all(writePluginsConfigurationsPromises);
	}
}
