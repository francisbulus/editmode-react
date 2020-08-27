// @ts-check
import { useContext } from "react";
import useSWR from 'swr';

import { api } from "./api";
import { EditmodeContext } from "./EditmodeContext";
import { renderChunk } from "./utils/renderChunk.jsx";
import { computeContentKey } from "./utils/computeContentKey";

export function useChunk(defaultContent, { identifier, type }) {
  const { projectId, defaultChunks } = useContext(EditmodeContext);
  const contentKey = defaultContent ? computeContentKey(defaultContent) : null;
  const url = identifier
    ? `chunks/${identifier}`
    : `chunks/${contentKey}?project_id=${projectId}`;

  const { data: chunk, error } = useSWR(url, (url) => api.get(url));

  if (error) {
    if (identifier) {
      console.warn(
        `Something went wrong trying to retrieve chunk data: ${error}. Have you provided the correct Editmode identifier (${identifier}) as a prop to your Chunk component instance?`
      );
    }

    return {
      Component(props) {
        return renderChunk(
          {
            chunk_type: type || "single_line_text",
            content: defaultContent,
            content_key: contentKey,
          },
          props
        );
      },
      content: defaultContent,
    };
  }

  const fallbackChunk = defaultChunks.filter(chunkItem => chunkItem.identifier === identifier)[0];

  if (!chunk) {
    if (fallbackChunk) {
      return {
        Component() {
          return null;
        },
        content: fallbackChunk,
      };
    } else if (defaultContent) {
      return {
        Component() {
          return null;
        },
        content: defaultContent,
      };
    }
  }

  return {
    Component(props) {
      return renderChunk(chunk, props);
    },
    content: chunk.content,
  };
}
