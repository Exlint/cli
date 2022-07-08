import path from 'path';

import fs from 'fs-extra';
import xml2js from 'xml2js';
import { Injectable } from '@nestjs/common';

import { ILibrary } from '@/interfaces/library';
import { EXLINT_FOLDER_PATH } from '@/models/exlint-folder';
import { IUnknown } from '@/interfaces/unknown';

import { IProjectDefault, IWorkspace } from '../../interfaces/webstorm';
import { IPolicyFilesPattern } from '../../interfaces/file-pattern';
import IdeLibrares from './ide-libraries';

@Injectable()
export class WebstormLibrariesService extends IdeLibrares {
	public async adjustLocal(
		projectId: string,
		libs: ILibrary[],
		policiesFilesPattern?: IPolicyFilesPattern,
	) {
		const ideaFolderPath = path.join(process.cwd(), '.idea');
		const workspaceXmlFilePath = path.join(ideaFolderPath, 'workspace.xml');
		const workspaceContent = await fs.readFile(workspaceXmlFilePath, 'utf-8').catch(() => '');

		const projectDefaultXmlFilePath = path.join(
			ideaFolderPath,
			'inspectionProfiles',
			'Project_Default.xml',
		);

		const projectDefaultContent = await fs.readFile(projectDefaultXmlFilePath, 'utf-8').catch(() => '');

		const parsedWorkspaceContent = (await xml2js.parseStringPromise(
			workspaceContent,
		)) as IWorkspace | null;

		const parsedProjectDefaultContent = (await xml2js.parseStringPromise(
			projectDefaultContent,
		)) as IProjectDefault | null;

		const workspaceComponents = parsedWorkspaceContent?.project?.component ?? [];

		let projectDefaultInspectionTools =
			parsedProjectDefaultContent?.component?.profile?.[0].inspection_tool ?? [];

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
			projectDefaultInspectionTools = [
				...projectDefaultInspectionTools.filter(
					(inspectionTool) => inspectionTool?.$?.class !== 'Eslint',
				),
				{
					$: {
						class: 'Eslint',
						enabled: true,
						level: 'WARNING',
						enabled_by_default: true,
					},
				},
			];

			const eslintXmlFilePath = path.join(ideaFolderPath, 'jsLinters', 'eslint.xml');

			const eslintXmlConfig = {
				project: {
					$: { version: '4' },
					component: {
						'$': { name: 'EslintConfiguration' },
						'work-dir-patterns': { $: { value: process.cwd() } },
						'custom-configuration-file': {
							$: { used: true, path: path.join(projectPath, '.eslintrc.json') },
						},
						...(policiesFilesPattern?.eslint && {
							'files-pattern': {
								$: { value: policiesFilesPattern.eslint },
							},
						}),
					},
				},
			};

			const eslintXmlBuilder = new xml2js.Builder({
				xmldec: { version: '1.0', encoding: 'UTF-8' },
				cdata: true,
			});

			const eslintXmlFileContent = eslintXmlBuilder.buildObject(eslintXmlConfig);

			writePluginsConfigurationsPromises.push(fs.outputFile(eslintXmlFilePath, eslintXmlFileContent));

			workspacePropertiesObject.keyToString['js.linters.configure.manually.selectedeslint'] = 'true';
			workspacePropertiesObject.keyToString['node.js.detected.package.eslint'] = 'true';
			workspacePropertiesObject.keyToString['node.js.selected.package.eslint'] = path.join(
				EXLINT_FOLDER_PATH,
				'node_modules',
				'eslint',
			);

			shouldOverridePlugins = true;
		}

		if (libs.includes('prettier')) {
			const prettierXmlFilePath = path.join(ideaFolderPath, 'prettier.xml');

			const prettierXmlConfig = {
				project: {
					$: { version: '4' },
					component: {
						$: { name: 'PrettierConfiguration' },
						option: [
							{ $: { name: 'myRunOnSave', value: 'true' } },
							{ $: { name: 'myRunOnReformat', value: 'true' } },
							...(policiesFilesPattern?.prettier
								? [{ $: { name: 'myFilesPattern', value: policiesFilesPattern.prettier } }]
								: []),
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
				EXLINT_FOLDER_PATH,
				'node_modules',
				'prettier',
			);

			shouldOverridePlugins = true;
		}

		if (libs.includes('stylelint')) {
			projectDefaultInspectionTools = [
				...projectDefaultInspectionTools.filter(
					(inspectionTool) => inspectionTool?.$?.class !== 'Stylelint',
				),
				{
					$: {
						class: 'Stylelint',
						enabled: true,
						level: 'ERROR',
						enabled_by_default: true,
					},
				},
			];

			const stylelintXmlFilePath = path.join(ideaFolderPath, 'stylesheetLinters', 'stylelint.xml');

			const stylelintXmlConfig = {
				project: {
					$: { version: '4' },
					component: {
						'$': { name: 'StylelintConfiguration' },
						'config-file': { $: { value: path.join(projectPath, '.stylelintrc.json') } },
						...(policiesFilesPattern?.stylelint && {
							'files-patterns': {
								$: { value: policiesFilesPattern.stylelint },
							},
						}),
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
				EXLINT_FOLDER_PATH,
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

			const projectDefaultXmlConfig = {
				...(parsedProjectDefaultContent ?? {}),
				component: {
					...(parsedProjectDefaultContent?.component ?? {}),
					$: { name: 'InspectionProjectProfileManager' },
					profile: [
						{
							...(parsedProjectDefaultContent?.component?.profile?.[0] ?? {}),
							$: { version: '1.0' },
							option: { $: { name: 'myName', value: 'Project Default' } },
							inspection_tool: projectDefaultInspectionTools,
						},
					],
				},
			};

			const projectDefaultXmlBuilder = new xml2js.Builder({
				headless: true,
				cdata: true,
			});

			const projectDefaultXmlFileContent =
				projectDefaultXmlBuilder.buildObject(projectDefaultXmlConfig);

			writePluginsConfigurationsPromises.push(
				fs.outputFile(workspaceXmlFilePath, workspaceXmlFileContent),
				fs.outputFile(projectDefaultXmlFilePath, projectDefaultXmlFileContent),
			);
		}

		await Promise.all(writePluginsConfigurationsPromises);
	}
}
