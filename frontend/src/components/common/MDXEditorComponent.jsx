// frontend/src/components/common/MDXEditorComponent.jsx
import React from "react";
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CreateLink,
  InsertImage,
  // ✅ These are the crucial plugins for making links and images fully functional.
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
} from "@mdxeditor/editor";

// We need both the main stylesheet and our custom one for the theme overrides.
import "@mdxeditor/editor/style.css";
import "./MDXEditorComponent.css";

/**
 * A reusable, professionally styled MDX Editor component with a full-featured toolbar.
 * @param {Object} props
 * @param {string} props.markdown - The current markdown text from the parent's state.
 * @param {Function} props.onChange - The state setter function from the parent.
 */
const MDXEditorComponent = ({ markdown, onChange }) => {
  return (
    <div className="mdx-editor-wrapper">
      <MDXEditor
        className="mdx-editor-root"
        contentEditableClassName="mdx-editor-content"
        markdown={markdown}
        onChange={onChange}
        // This full suite of plugins enables a rich, reliable editing experience.
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          // These plugins provide the core functionality for the link and image buttons.
          linkPlugin(),
          linkDialogPlugin(), // This plugin provides the pop-up dialog for inserting links.
          imagePlugin(), // This plugin provides support for inserting images.

          // The toolbar plugin is what displays the UI for all the other plugins.
          toolbarPlugin({
            toolbarClassName: "mdx-editor-toolbar",
            toolbarContents: () => (
              <>
                <BlockTypeSelect />
                <BoldItalicUnderlineToggles />
                <CreateLink />
                <InsertImage />
              </>
            ),
          }),
        ]}
      />
    </div>
  );
};

export default MDXEditorComponent;
