const { description } = require('../../package')

module.exports = {
  /**
   * Ref：https://v1.vuepress.vuejs.org/config/#title
   */
  title: 'OpenCL Book',
  /**
   * Ref：https://v1.vuepress.vuejs.org/config/#description
   */
  description: description,

  /**
   * Extra tags to be injected to the page HTML `<head>`
   *
   * ref：https://v1.vuepress.vuejs.org/config/#head
   */
  head: [
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }]
  ],

  /**
   * Theme configuration, here is the default theme configuration for VuePress.
   *
   * ref：https://v1.vuepress.vuejs.org/theme/default-theme-config.html
   */
  themeConfig: {
    repo: '',
    editLinks: false,
    docsDir: '',
    editLinkText: '',
    lastUpdated: false,
    nav: [
      {
        text: 'OpenCL Book',
        link: '/opencl-book/',
      },
      {
        text: 'Fixstars Solutions',
        link: 'https://us.fixstars.com/'
      }
    ],
    // sidebar: {
    //   '/opencl-book/': [
    //     {
    //       title: 'Foreword2',
    //       collapsable: false,
    //     }
    //   ],
    //   '/opencl-book/test/': [
    //     {
    //       title: 'Intro',
    //       collapsable: false,
    //     }
    //   ],
    //   // '/opencl-book/': [
    //   //   {
    //   //     title: 'test2',
    //   //     collapsable: false,
    //   //     // children: [
    //   //     //   '',
    //   //     //   'using-vue',
    //   //     // ]
    //   //   }
    //   // ],
    // }
    sidebar: [
      '/opencl-book/',
      '/opencl-book/who-should-read-this-book',
      '/opencl-book/about-the-authors',

      {
          title: 'Introduction to Parallelization',
          collapsable: false,
          children: [ 
          ['/opencl-book/introduction-to-parallelization/why-parallelization','Why Parallelization'],
          ['/opencl-book/introduction-to-parallelization/parallel-computing-hardware','Parallel Computing Hardware'],
          ['/opencl-book/introduction-to-parallelization/parallel-computing-software','Parallel Computing Software'],
          ['/opencl-book/introduction-to-parallelization/conclusion','Conclusion'],
          ]
      },
    ]
  },

  /**
   * Apply plugins，ref：https://v1.vuepress.vuejs.org/zh/plugin/
   */
  plugins: [
    '@vuepress/plugin-back-to-top',
    '@vuepress/plugin-medium-zoom',
  ],
}

