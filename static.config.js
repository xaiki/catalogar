import axios from 'axios'
import fs from 'fs'
import klaw from 'klaw'
import path from 'path'

const getImgs = (filePath) => {
  const items = []
  // Walk ("klaw") through posts directory and push file paths into items array //
  const getFiles = (filePath) => new Promise(resolve => {
    // Check if posts directory exists //
    if (fs.existsSync(filePath)) {
      klaw(filePath)
        .on('data', item => {
          if (path.extname(item.path).match(/jpeg$/)) {
            items.push(item.path.split('/').pop())
          }
        })
        .on('error', e => {
          console.log(e)
        })
        .on('end', () => {
          // Resolve promise for async getRoutes request //
          // posts = items for below routes //
          resolve(items.reverse())
        })
    } else {
      // If src/posts directory doesn't exist, return items as empty array //
      resolve(items)
    }
  })
  return getFiles(filePath)
}

export default {
  getSiteData: async () => ({
    title: 'React Static',
    images: await getImgs('./public/images')
  }),
  getRoutes: async () => {
    const { data: posts } = await axios.get('https://jsonplaceholder.typicode.com/posts')
    return [
      {
        path: '/',
        component: 'src/containers/Home',
      },
      {
        path: '/about',
        component: 'src/containers/About',
      },
      {
        path: '/search',
        component: 'src/containers/Search',
      },
      {
        path: '/blog',
        component: 'src/containers/Blog',
        getData: () => ({
          posts,
        }),
        children: posts.map(post => ({
          path: `/post/${post.id}`,
          component: 'src/containers/Post',
          getData: () => ({
            post,
          }),
        })),
      },
      {
        is404: true,
        component: 'src/containers/404',
      },
    ]
  },
}
