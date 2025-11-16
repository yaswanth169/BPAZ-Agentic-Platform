## AWS Bedrock UI Override (Temporary)

### Context
We currently present AWS Bedrock branding in the UI while still using OpenAI services under the hood. The goal was strictly visual: labels, placeholders, and icons were changed, but the underlying integration, IDs, and API hosts remain OpenAI.

### Affected Files
- `client/app/components/nodes/llms/OpenAI/ChatDisplayNode.tsx`
- `client/app/components/nodes/llms/OpenAI/ChatConfigForm.tsx`
- `client/app/components/common/DraggableNode.tsx`
- `client/app/components/nodes/embeddings/OpenAIEmbeddingsProvider/OpenAIEmbeddingsProviderVisual.tsx`
- `client/app/types/credentials.ts`
- `client/public/icons/aws-bedrock.svg` (new SVG asset)

### Applied UI Tweaks
- Replaced OpenAI display strings (node titles, dropdown labels, placeholders) with AWS Bedrock phrasing; the original text is still present in adjacent comments.
- Swapped the node palette and visual icons from `icons/openai.svg` to the new `icons/aws-bedrock.svg`.
- Updated the credential metadata to read “AWS Bedrock (OpenAI backend)” and clarified helper text to mention the demo context.

### Reverting to OpenAI
1. **Uncomment the original strings** in each touched file and remove the Bedrock variants that follow them.
2. **Restore icon references** by pointing `img` tags back to `icons/openai.svg` and delete `client/public/icons/aws-bedrock.svg` if it is no longer needed.
3. **Credential copy**: in `client/app/types/credentials.ts`, switch the name, description, emoji, and field descriptions back to the OpenAI wording (the commented lines capture the prior values).
4. Run `npm run lint` (or the project’s preferred lint command) to ensure no formatting/glint issues remain after the revert.

Keeping this document up to date will make future toggles between Bedrock and OpenAI straightforward.

