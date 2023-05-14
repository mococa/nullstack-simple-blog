import Nullstack, { NullstackClientContext, NullstackNode } from 'nullstack';
import { Remarkable } from 'remarkable';

import { readdirSync, readFileSync, statSync } from 'fs';

import { Post } from './Post';

import { IPost } from './@types';

import './styles.scss';
import { highlight } from './utils/highlight';

declare function Head(): NullstackNode;

class Application extends Nullstack {
  posts = [];
  selected_post = '';

  static async getPosts() {
    const posts_folder = './public/posts';
    const posts = readdirSync(posts_folder).map(folder => {
      const folder_items = `${posts_folder}/${folder}`;

      const metadata_path = `${folder_items}/metadata.json`;
      const metadata = readFileSync(metadata_path, 'utf8');

      const content_path = `${folder_items}/post.md`;
      const content_md = readFileSync(content_path, 'utf-8');

      const remarkable = new Remarkable({
        highlight,
      });

      const image = `${folder_items}/image.png`;

      const content = remarkable.render(content_md);
      const created_at = statSync(content_path).birthtimeMs;
      const updated_at = Math.max(
        statSync(content_path).mtimeMs,
        statSync(metadata_path).mtimeMs,
        statSync(image).mtimeMs,
      );

      return {
        id: folder,
        metadata: JSON.parse(metadata),
        content,
        created_at,
        image: `${folder_items.slice('./public'.length)}/image.png`,
        updated_at,
      } as IPost;
    });

    return posts;
  }

  async initiate({ page }: NullstackClientContext) {
    page.locale = 'pt-BR';
    page.title = 'Nullstack Blog';
    page.description = 'A blog made with nullstack';

    const posts = await Application.getPosts();

    this.posts = posts;
  }

  renderHead() {
    return (
      <head>
        <link href="https://fonts.gstatic.com" rel="preconnect" />
        <link
          href="https://fonts.googleapis.com/css2?family=Crete+Round&family=Roboto&display=swap"
          rel="stylesheet"
        />
      </head>
    );
  }

  renderPosts({ posts }) {
    return (
      <section class="blog-posts">
        {posts.map(post => (
          <a
            href={`/post/${post.id}`}
            onclick={() => (this.selected_post = '')}
          >
            <article>
              {post.metadata.tags.length > 0 && (
                <span class="tag">{post.metadata.tags[0]}</span>
              )}

              <img src={post.image} alt={post.metadata.title} />

              <b>{post.metadata.title}</b>

              <p>{post.metadata.description}</p>

              <strong
                href={`/post/${post.id}`}
                onclick={() => (this.selected_post = post.id)}
              >
                Access here
              </strong>
            </article>
          </a>
        ))}
      </section>
    );
  }

  render() {
    const post = this.posts?.find(post => post.id === this.selected_post);
    if (post) post.metadata = { ...post?.metadata };

    return (
      <>
        <Head />

        <main route="/">
          <h1>Blog</h1>

          {this.renderPosts({ posts: this.posts })}
        </main>

        <Post route="/post/:id" default_post={{ ...post }} />
      </>
    );
  }
}

export default Application;
