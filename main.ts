import { App, Editor, MarkdownView, MarkdownFileInfo, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile, CachedMetadata } from 'obsidian';
// Remember to rename these classes and interfaces!

interface AnotherNameSettings {
	propertyName: string;
}

const DEFAULT_SETTINGS: AnotherNameSettings = {
	propertyName: 'another name'
}

export default class AnotherNamePlugin extends Plugin {
	settings: AnotherNameSettings;

	async onload() {
		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new AnotherNameSettingTab(this.app, this));

		const reloadForFile = (file: TFile, cache: CachedMetadata) => {
			// 检查是否有旧的元素
			const mdView = this.app.workspace.getActiveViewOfType(MarkdownView);
			const editor = mdView?.editor;
			const cmEditorEl = editor?.containerEl;

			const anotherNameElOld = cmEditorEl?.querySelectorAll('.another-name');
			// if (anotherNameElOld) {
			// 	anotherNameElOld.remove();
			// }
			if (anotherNameElOld) {
				anotherNameElOld.forEach((el: Element) => {
					el.remove();
				})
			}


			// 读取元数据
			const frontmatter = cache?.frontmatter;
			// console.log('frontmatter', frontmatter);

			let anotherName;
			if (frontmatter) {
				anotherName = frontmatter[this.settings.propertyName]
				console.log(anotherName);
			} else {
				console.log('no frontmatter')
				return;
			}

			// 构造HTML元素
			const anotherNameEl = document.createElement('div');
			anotherNameEl.innerText = anotherName;
			anotherNameEl.classList.add('another-name');

			// 插入
			if (mdView) {
				// console.log(editor)
				const inlineTitle = cmEditorEl.querySelectorAll('.inline-title');

				if (inlineTitle) {
					// inlineTitle.parentNode.insertBefore(anotherNameEl, inlineTitle.nextSibling);
					inlineTitle.forEach((el: HTMLElement) => {
						el.style.marginBottom = '0px';
						el.parentNode?.insertBefore(anotherNameEl, el.nextSibling);
					})
				}

			}
		}

		// add something!
		this.registerEvent(this.app.workspace.on('file-open', (file: TFile) => {
			if (file) {
				const cache = this.app.metadataCache.getFileCache(file);
				if (cache) {
					reloadForFile(file, cache);
				}
			}

		}));

		this.registerEvent(this.app.metadataCache.on('changed', (file: TFile, data: string, cache: CachedMetadata) => {
			// console.log('changed', file, data, cache);
			if (file) {
				reloadForFile(file, cache);
			}
		}));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			// console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));

	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

// Settings tab
class AnotherNameSettingTab extends PluginSettingTab {
	plugin: AnotherNamePlugin;

	constructor(app: App, plugin: AnotherNamePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Property name')
			.setDesc('')
			.addText(text => text
				.setPlaceholder('another name')
				.setValue(this.plugin.settings.propertyName)
				.onChange(async (value) => {
					this.plugin.settings.propertyName = value;
					await this.plugin.saveSettings();
				}));
	}
}
