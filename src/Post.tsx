import Nullstack, { NullstackClientContext } from 'nullstack';
import { existsSync, readFileSync, statSync } from 'fs';
import { Remarkable } from 'remarkable';

import { highlight } from './utils/highlight';

import { IPost } from './@types';

import 'highlight.js/styles/vs2015.css';

interface Props {
  default_post?: IPost;
}

export class Post extends Nullstack<Props> {
  post: IPost = null;

  static async getPost({ id }: { id: string }) {
    const folder_path = `./public/posts/${id}`;

    if (!existsSync(folder_path)) throw new Error('Not found');

    const content_path = `${folder_path}/post.md`;
    const content_md = readFileSync(content_path, 'utf-8');

    const remarkable = new Remarkable({
      highlight,
    });

    const content = remarkable.render(content_md);

    const metadata_path = `${folder_path}/metadata.json`;
    const metadata = JSON.parse(readFileSync(metadata_path, 'utf-8'));

    // const image = `${folder_path.slice('./public'.length)}/image.png`;

    const created_at = statSync(content_path).birthtimeMs;
    const updated_at = Math.max(
      statSync(content_path).mtimeMs,
      statSync(metadata_path).mtimeMs,
      // statSync(image).mtimeMs,
    );

    return {
      content,
      metadata,
      /* image */ image: '/posts/1/image.png',
      created_at,
      updated_at,
      id,
    } as IPost;
  }

  async initiate({
    page,
    params,
    router,
    default_post,
  }: NullstackClientContext<Props>) {
    if (default_post?.id) {
      this.post = { ...default_post, metadata: { ...default_post.metadata } };
      return;
    }

    const id = String(params.id);

    console.log({ id });

    try {
      const post = await Post.getPost({ id });
      this.post = post;

      page.title = post.metadata.title;
      page.description = post.metadata.description;
      page.image = post.image.split('./public')[1];
    } catch (error) {
      router.url = '/404';
    }
  }

  render({ default_post }: Props) {
    const post = this.post || default_post;

    if (!default_post?.id && !this.post?.id) return <main />;

    return (
      <main>
        <div html={post?.content} />

        <footer>
          updated at: {new Date(post?.updated_at).toLocaleString()}
          <br />
          created at: {new Date(post?.created_at).toLocaleString()}
        </footer>
      </main>
    );
  }
}
