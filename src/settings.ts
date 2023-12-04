import { App, PluginSettingTab, Setting } from "obsidian";
import AnotherNamePlugin from "./main";

export class AnotherNameSettingTab extends PluginSettingTab {
    constructor(app: App, public plugin: AnotherNamePlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        new Setting(containerEl)
            .setName('Use Aliases')
            .setDesc('Will show frontmatter aliases as inline subtitle.')
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.useAliases)
                    .onChange(async (value) => {
                        this.plugin.settings.useAliases = value
                        this.plugin.addSubTitleEl()
                        await this.plugin.saveSettings()
                    })
            });

        new Setting(containerEl)
            .setName('Own Property name')
            .setDesc('If not aliases enabled, the inline subtitle will be the value of this frontmatter property ')
            .addText(text =>
                text
                    .setPlaceholder('another name')// or @subtitle
                    .setValue(this.plugin.settings.propertyName)
                    .onChange(async (value) => {
                        this.plugin.settings.propertyName = value;
                        await this.plugin.saveSettings();
                    })
                    .inputEl.addEventListener('blur', async (event) => {
                        await this.plugin.addSubTitleEl()
                    }))
    }
}