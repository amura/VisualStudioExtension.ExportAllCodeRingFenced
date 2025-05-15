// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const exportAllDisposable = vscode.commands.registerCommand('exportallcoderingfenced.exportAllFiles', async () => {
		// Determine the root directory: use selected node if available, else workspace root
		let rootUri: vscode.Uri;
		const selectedResource = vscode.window.activeTextEditor?.document.uri;
		if (vscode.window.activeTextEditor && selectedResource) {
			rootUri = vscode.Uri.joinPath(selectedResource, '..');
		} else {
			const workspaceFolders = vscode.workspace.workspaceFolders;
			if (!workspaceFolders) {
				vscode.window.showErrorMessage('No workspace folder open.');
				return;
			}
			rootUri = workspaceFolders[0].uri;
		}

		const outputFileName = await vscode.window.showInputBox({
			prompt: 'Enter target filename for the exported files',
			value: 'exported-files.txt'
		});
		if (!outputFileName) {
			return;
		}

		vscode.window.showInformationMessage(`Starting to export all code files to ${outputFileName}`);

		// Read exclusion list from configuration
		const config = vscode.workspace.getConfiguration('exportallcoderingfenced');
		const excludeList: string[] = config.get('exclude', ['node_modules', '.git']);

		function isExcluded(name: string): boolean {
			return excludeList.some(pattern => {
				if (pattern.startsWith('.')) {
					return name === pattern;
				}
				if (pattern.startsWith('*')) {
					return name.endsWith(pattern.slice(1));
				}
				return name === pattern;
			});
		}

		async function getAllFiles(dir: vscode.Uri): Promise<vscode.Uri[]> {
			const entries = await vscode.workspace.fs.readDirectory(dir);
			let files: vscode.Uri[] = [];
			for (const [name, type] of entries) {
				if (isExcluded(name)) {
					continue;
				}
				const entryUri = vscode.Uri.joinPath(dir, name);
				if (type === vscode.FileType.Directory) {
					files = files.concat(await getAllFiles(entryUri));
				} else if (type === vscode.FileType.File) {
					if (!isExcluded(name)) {
						files.push(entryUri);
					}
				}
			}
			return files;
		}

		const allFiles = await getAllFiles(rootUri);
		let output = '';
		for (const fileUri of allFiles) {
			output += '```';
			try {
				const content = await vscode.workspace.fs.readFile(fileUri);
				output += `\n# filename: ${vscode.workspace.asRelativePath(fileUri)} \n`;
				output += Buffer.from(content).toString('utf8') + '\n';
			} catch (err) {
				output += `\n# filename: ${vscode.workspace.asRelativePath(fileUri)} (ERROR READING FILE) \n`;
			}
			finally {
				output += '```\n';
			}
		}

		const outUri = vscode.Uri.joinPath(rootUri, outputFileName);
		await vscode.workspace.fs.writeFile(outUri, Buffer.from(output, 'utf8'));
		vscode.window.showInformationMessage(`Exported ${allFiles.length} files from ${rootUri} to ${outputFileName}`);
	});

	context.subscriptions.push(exportAllDisposable);

}

// This method is called when your extension is deactivated
export function deactivate() {}
