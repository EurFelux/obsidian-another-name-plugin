import { EditorView, WidgetType } from "@codemirror/view";

export class AnotherNameWidget extends WidgetType {
    anotherName: string;

    constructor(anotherName: string) {
        super();
        this.anotherName = anotherName;
    }

    toDOM(view: EditorView): HTMLElement {
        const div = document.createElement("div");

        div.addClass('another-name');
        div.innerText = this.anotherName;

        return div;
    }
}