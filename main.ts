import { App, Editor, MarkdownView, Events, EventRef, Plugin, PluginSettingTab, Setting, TFile, CachedMetadata, MarkdownPostProcessorContext, WorkspaceLeaf } from 'obsidian';
// Remember to rename these classes and interfaces!

interface AnotherNameSettings {
	propertyName: string;
}

const DEFAULT_SETTINGS: AnotherNameSettings = {
	propertyName: 'another name'
}

export default class AnotherNamePlugin extends Plugin {
	settings: AnotherNameSettings;
	reloadForFile: (file: TFile, cache: CachedMetadata, leaf?: WorkspaceLeaf, inlineTitle?: HTMLElement) => void;
	reloadAllVisible: () => void;

	async initReloadFunction() {
		this.loadSettings();
		this.reloadForFile = (file: TFile, cache: CachedMetadata, leaf?: WorkspaceLeaf) => {
			const mdView = this.app.workspace.getActiveViewOfType(MarkdownView);
			let viewContentEl = leaf?.view?.contentEl;
			if (!viewContentEl)
				viewContentEl = mdView?.contentEl;

			let inlineTitle = leaf?.view.inlineTitleEl;
			if (!inlineTitle)
				inlineTitle = mdView?.inlineTitleEl;

			// console.log('reloadForFile', file, cache, mdView, inlineTitle);
			// console.log('viewContentEl', viewContentEl);
			// 检查是否有旧的元素
			const anotherNameElOld = viewContentEl?.querySelector('.another-name');
			if (anotherNameElOld) {
				anotherNameElOld.remove();
				// anotherNameElOld.forEach((el: HTMLElement) => {
				// 	el.remove();
				// });
			}

			if (!inlineTitle) return;

			// 读取元数据
			const frontmatter = cache?.frontmatter;
			// console.log('frontmatter', frontmatter);

			let anotherName;
			if (frontmatter) {
				anotherName = frontmatter[this.settings.propertyName]
				if (!anotherName)
					return;
				// console.log(anotherName);
			} else {
				// console.log('no frontmatter')
				return;
			}

			// 构造HTML元素
			const anotherNameEl = document.createElement('div');
			anotherNameEl.innerText = anotherName;
			anotherNameEl.classList.add('another-name');

			// 插入
			if (inlineTitle) {
				// console.log('inlineTitle', inlineTitle);
				inlineTitle.style.marginBottom = "0px";
				inlineTitle.parentNode?.insertBefore(anotherNameEl, inlineTitle.nextSibling);
			}

		}

		this.reloadAllVisible = () => {
			this.app.workspace.iterateRootLeaves(leaf => {
				// console.log("It works.")
				const display = leaf.containerEl.style.display;
				// console.log("leaf", leaf)
				// console.log("display", display)
				if (display === "none") return;
				const file = leaf.view.file;
				if (!file) return;
				const cache = this.app.metadataCache.getFileCache(file);
				if (cache) {
					this.reloadForFile(file, cache, leaf);
				}
			});
		};
	}


	async onload() {
		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new AnotherNameSettingTab(this.app, this));

		this.initReloadFunction();

		// this.app.workspace.onLayoutReady(() => {
		// 	this.reloadAllVisible();
		// });

		let leaves = this.app.workspace.getLeavesOfType('markdown');

		// add something!
		this.registerEvent(this.app.workspace.on('file-open', (file: TFile) => {
			if (file) {
				const cache = this.app.metadataCache.getFileCache(file);
				if (cache) {
					this.reloadForFile(file, cache);
				}
			}

		}));

		this.registerEvent(this.app.metadataCache.on('changed', (file: TFile, data: string, cache: CachedMetadata) => {
			// console.log('changed', file, data, cache);
			if (file) {
				this.reloadForFile(file, cache);
			}
		}));

		this.registerEvent(this.app.workspace.on('layout-change', () => {
			// 这样效率很低，但是我没有更好的办法
			// console.log('trigger layout-change')
			this.reloadAllVisible();
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

	async updateSettings() {
		await this.loadSettings();

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
			.setDesc('wait a while to take effect')
			.addText(text => text
				.setPlaceholder('another name')
				.setValue(this.plugin.settings.propertyName)
				.onChange(async (value) => {
					this.plugin.settings.propertyName = value;
					await this.plugin.saveSettings();
					this.plugin.initReloadFunction();

				}));
	}
}
