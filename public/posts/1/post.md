# Hey

### What up whaaat

```tsx
import Nullstack, { NullstackClientContext } from 'nullstack';

import { existsSync, readFileSync, statSync } from 'fs';
import hljs from 'highlight.js';
import 'hightlight.js/styles/vs2015.css';
import { Remarkable } from 'remarkable';

export class Post extends Nullstack {
  post = null;

  static async getPost({ id }: { id: string }) {
    const folder_path = `./public/posts/${id}`;

    if (!existsSync(folder_path)) throw new Error('Not found');

    const content_path = `${folder_path}/post.md`;
    const content_md = readFileSync(content_path, 'utf-8');

    const remarkable = new Remarkable({
      highlight: (str, lang) => {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(str, { language: lang, ignoreIllegals: true })
              .value;
          } catch (err) {
            //
          }
        }

        try {
          return hljs.highlightAuto(str).value;
        } catch (err) {
          //
        }

        return ''; // use external default escaping
      },
    });

    const content = remarkable.render(content_md);

    const metadata_path = `${folder_path}/metadata.json`;
    const metadata = JSON.parse(readFileSync(metadata_path, 'utf-8'));

    const image = `${folder_path}/image.png`;

    const created_at = statSync(content_path).birthtimeMs;

    const updated_at = Math.max(
      statSync(content_path).mtimeMs,
      statSync(metadata_path).mtimeMs,
      statSync(image).mtimeMs,
    );

    return { content, metadata, image, created_at, updated_at };
  }

  async initiate({ page, params, router }: NullstackClientContext) {
    const id = String(params.id);

    try {
      const post = await Post.getPost({ id });

      page.title = post.metadata.title;
      page.description = post.metadata.description;
      page.image = post.image.slice('./public'.length);

      this.post = post;
    } catch (error) {
      router.url = '/404';
    }
  }

  render() {
    return (
      <>
        <div html={this.post?.content} />
        <footer>
          updated at: {new Date(this.post?.updated_at).toLocaleString()}
          <br />
          created at: {new Date(this.post?.created_at).toLocaleString()}
        </footer>
      </>
    );
  }
}
```
