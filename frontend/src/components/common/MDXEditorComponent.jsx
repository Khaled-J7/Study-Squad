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
  linkPlugin,
  imagePlugin,
} from "@mdxeditor/editor";

import "@mdxeditor/editor/style.css";
import "./MDXEditorComponent.css";

const MDXEditorComponent = ({ markdown, onChange }) => {
  return (
    <div className="mdx-editor-wrapper">
      <MDXEditor
        className="mdx-editor-root"
        contentEditableClassName="mdx-editor-content"
        markdown={markdown || ""}
        onChange={onChange}
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          linkPlugin({ linkDialog: true }), // ✅ enable dialog inside linkPlugin
          imagePlugin(),
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
