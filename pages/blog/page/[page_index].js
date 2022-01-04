import Link from 'next/link';

import Layout from '../../../components/Layout';
import Post from '../../../components/Post';
import Pagination from '../../../components/Pagination';

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

import {sortByDate} from '../../../utils';
import {POSTS_PER_PAGE} from '../../../config';

export default function BlogPage({posts, numPages, currentPage}) {
  console.log(posts);
  return (
    <Layout>
      <h1 className="text-5xl border-b-4 p-5 font-bold">Blog</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {posts.map((post, index) => (
          <Post key={index} post={post} />
        ))}
      </div>

      <Pagination currentPage={currentPage} numPages={numPages}></Pagination>
    </Layout>
  );
}

export async function getStaticPaths() {
  const files = fs.readdirSync(path.join('posts'));

  const numPages = Math.ceil(files.length / POSTS_PER_PAGE);

  let paths = [];

  for (let i = 1; i <= numPages; i++) {
    paths.push({
      params: {page_index: i.toString()},
    });
  }

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({params}) {
  const page = parseInt((params && params.page_index) || 1);

  const files = fs.readdirSync(path.join('posts'));

  const posts = files.map((file) => {
    const slug = file.replace('.md', '');

    const markdownWithMeta = fs.readFileSync(path.join('posts', file), 'utf-8');

    const {data: frontmatter} = matter(markdownWithMeta);

    return {
      slug,
      frontmatter,
    };
  });

  const numPages = Math.ceil(files.length / POSTS_PER_PAGE);
  const pageIndex = page - 1;
  const orderedPost = posts
    .sort(sortByDate)
    .slice(pageIndex * POSTS_PER_PAGE, (pageIndex + 1) * POSTS_PER_PAGE);

  return {
    props: {
      posts: orderedPost,
      numPages,
      currentPage: page,
    },
  };
}
