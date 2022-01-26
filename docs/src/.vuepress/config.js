const { description } = require('../../package')

module.exports = {
  base: '/test-book/',
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
    ['meta', { name: 'theme-color', content: '#2492f3' }],
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
      {
        title: 'OpenCL',
        collapsable: false,
        children: [ 
        ['/opencl-book/opencl/what-is-opencl','What is OpenCL?'],
        ['/opencl-book/opencl/historical-background','Historical Background'],
        ['/opencl-book/opencl/an-overview-of-opencl','An Overview of OpenCL'],
        ['/opencl-book/opencl/why-opencl','Why OpenCL?'],
        ['/opencl-book/opencl/applicable-platforms','Applicable Platforms'],
        ]
    },
    {
      title: 'OpenCL Setup',
      collapsable: false,
      children: [ 
      ['/opencl-book/opencl-setup/available-opencl-environments','Available OpenCL Environments'],
      ['/opencl-book/opencl-setup/development-environment-setup','Development Environment Setup'],
      ['/opencl-book/opencl-setup/first-opencl-program','First OpenCL Program'],
      ]
    },
    {
      title: 'Basic OpenCL',
      collapsable: false,
      children: [ 
      ['/opencl-book/basic-opencl/basic-program-flow','Basic Program Flow'],
      ['/opencl-book/basic-opencl/online-offline-compilation','Online/Offline Compilation'],
      ['/opencl-book/basic-opencl/calling-the-kernel','Calling the Kernel'],
      ]
    },
    {
      title: 'Advanced OpenCL',
      collapsable: false,
      children: [ 
      ['/opencl-book/advanced-opencl/opencl-c','OpenCL C'],
      ['/opencl-book/advanced-opencl/opencl-programming-practice','OpenCL Programming Practice'],
      ]
    },
    {
      title: 'Changes made in OpenCL Specification 1.2',
      collapsable: false,
      children: [ 
      ['/opencl-book/changes-made-in-opencl-specification-1.2/changes-made-in-update-from-1.0-to-1.1','Changes made in update from 1.0 to 1.1'],
      ['/opencl-book/changes-made-in-opencl-specification-1.2/changes-made-in-update-from-1.1-to-1.2','Changes made in update from 1.1 to 1.2'],
      ]
    },
    '/opencl-book/references',
    '/opencl-book/notes',
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

