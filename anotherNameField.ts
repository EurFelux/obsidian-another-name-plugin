import { StateField, Transaction, Extension } from '@codemirror/state';
import { DecorationSet, Decoration, EditorView } from '@codemirror/view';
import { AnotherNameWidget } from 'another-name-widget';

export const anothernameField = StateField.define<DecorationSet>({
    create() {
        return Decoration.none
    },
    update(oldState: DecorationSet, transaction: Transaction): DecorationSet {
        const decoration = Decoration.widget({
            widget: new AnotherNameWidget('another name'),
            side: 1
        })

        const position = transaction.state.doc.

        return Decoration.set.of([decoration])

    },
    provide(field: StateField<DecorationSet>): Extension {
        return EditorView.decorations.from(field)
    }
})