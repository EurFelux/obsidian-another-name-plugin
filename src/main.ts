import { Plugin } from 'obsidian';
import { AnotherNameSettingTab } from './settings';
import { AnotherNameSettings, DEFAULT_SETTINGS } from './interfaces';

export default class AnotherNamePlugin extends Plugin {
	settings: AnotherNameSettings;
	activeSubTitle: string

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new AnotherNameSettingTab(this.app, this));

		// when layout ready
		this.app.workspace.onLayoutReady(() => {
			this.addSubTitleEl()

			// editing metadata
			this.registerEvent(this.app.metadataCache.on('changed', () => {
				this.addSubTitleEl()
			}));
			// changing of active leaf
			this.registerEvent(this.app.workspace.on('active-leaf-change', () => {
				this.addSubTitleEl()
			}))
		})
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

	getSubTitle() {
		const file = this.app.workspace.getActiveFile()
		const metadataCache = this.app.metadataCache.getCache(file?.path as string)
		if( !('frontmatter' in metadataCache!)) return false
		// use aliases or own property
		if (this.settings.useAliases) {
			this.activeSubTitle = metadataCache?.frontmatter!["aliases"]
		} else {
			const settingName = this.settings.propertyName
			this.activeSubTitle = metadataCache?.frontmatter![settingName]
		}
		return true
	}

	async addSubTitleEl() {
		const ret = this.getSubTitle();
		if(!ret) return
		let activeView = this.app.workspace.getLeaf(false)?.view;
		const inlineTitle = activeView?.containerEl.querySelector("div.inline-title") as HTMLElement;

		// check if element already exists
		const existingSubTitleEl = inlineTitle?.querySelector('.another-name');
		if (existingSubTitleEl) {
			existingSubTitleEl.remove();
		}

		// create new element
		const anotherNameEl = document.createElement('div');
		anotherNameEl.innerText = this.activeSubTitle;
		anotherNameEl.classList.add('another-name');

		inlineTitle.insertAdjacentElement('beforeend', anotherNameEl); // stay in place in view mode
	}
}








