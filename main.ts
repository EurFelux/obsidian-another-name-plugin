import {
    App,
    Plugin,
    PluginSettingTab,
    Setting,
    TFile,
    WorkspaceLeaf,
    FileView,
    Notice,
} from "obsidian";


interface AnotherNameSettings {
    propertyName: string;
}

// type Lang = "zh-CN" | "en";

// interface AnotherNameI18N {
// 	[key: string]: string
// }

const DEFAULT_SETTINGS: AnotherNameSettings = {
    propertyName: "another-name",
};

export default class AnotherNamePlugin extends Plugin {
    settings: AnotherNameSettings;
    noticeTime: number;
    // i18n: AnotherNameI18N;
    reloadLeaf: (leaf: WorkspaceLeaf) => void;
    reloadAllLeaves: () => void;
    //   translate: (key: string, lang: Lang, params?: object) => string;

    onload() {
        this.loadSettings();
        this.noticeTime = 5000;

        // This adds a settings tab so the user can configure various aspects of the plugin
        this.addSettingTab(new AnotherNameSettingTab(this.app, this));

        // this.translate = (key: string, lang: string, params: object) => {
        // 	  let translation = this.i18n[lang][key];

        // 	  for (const placeholder in params) {
        // 		translation = translation.replace(`{{${placeholder}}}`, params[placeholder]);
        // 	  }

        // 	  return translation;
        // };

        this.reloadLeaf = (leaf: WorkspaceLeaf) => {
            const viewState = leaf.getViewState();
            if (viewState.type === "markdown") {
                const view = leaf.view as FileView;
                const containerEl = view.containerEl;

                const oldNames = containerEl.querySelectorAll(".another-name");

                oldNames.forEach((v) => {
                    v.remove();
                });

                const inlineTitle = containerEl.querySelector(".inline-title");
                if (!inlineTitle) {
                    return;
                }

                const file = view.file;
                if (!file) {
                    return;
                }
                const cache = this.app.metadataCache.getFileCache(file);
                if (!cache || !cache.frontmatter) {
                    return;
                }

                const anotherNameProperty = this.settings.propertyName;

                const anotherName = cache.frontmatter[anotherNameProperty];

                if (!anotherName) {
                    return;
                } else if (typeof anotherName !== "string") {
                    new Notice(
                        `Another-name: File ${file.basename} have invalid property type.`,
                        this.noticeTime
                    );
                    //   new Notice(this.translate("notice_1", "en"), this.noticeTime);
                    return;
                }
				const anotherNameEl = containerEl.createDiv({
					cls: "another-name",
					text: anotherName
				})

                inlineTitle.insertAdjacentElement("afterend", anotherNameEl);
            }
        };

        this.reloadAllLeaves = () => {
            this.app.workspace.iterateAllLeaves(this.reloadLeaf);
        };

        this.registerEvent(
            this.app.metadataCache.on("changed", (file: TFile) => {
                if (file) {
                    this.app.workspace.iterateAllLeaves(
                        (leaf: WorkspaceLeaf) => {
                            const view = leaf.view as FileView;
                            if (view.file === file) {
                                this.reloadLeaf(leaf);
                            }
                        }
                    );
                }
            })
        );

        this.registerEvent(
            this.app.workspace.on("layout-change", () => {
				this.app.workspace.iterateAllLeaves(this.reloadLeaf);
            })
        );
    }

    onunload() {}

    async loadSettings() {
        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            await this.loadData()
        );
    }

    async saveSettings() {
        await this.saveData(this.settings).catch((err) => {
            new Notice(
                `Another-Name: Error: Something goes wrong when saving settings. \n ${err}`,
                this.noticeTime
            );
            //   new Notice(this.translate("error_1", "en"), this.noticeTime);
            console.error(err);
        });
    }

    updateSettings() {
        this.loadSettings();
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
            .setName("Property name")
            .setDesc("Change the property name in metadata.")
            .addText((text) =>
                text
                    .setPlaceholder("another name")
                    .setValue(this.plugin.settings.propertyName)
                    .onChange(async (value) => {
                        this.plugin.settings.propertyName = value;
                        await this.plugin.saveSettings();
                        await this.plugin.loadSettings();
                        this.plugin.reloadAllLeaves();
                    })
            );
    }
}
