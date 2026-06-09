export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/plots/index',
    'pages/orders/index',
    'pages/dispatch/index',
    'pages/mine/index',
    'pages/plot-detail/index',
    'pages/demand-publish/index',
    'pages/order-detail/index',
    'pages/work-submit/index',
    'pages/settlement/index',
    'pages/weather-detail/index',
    'pages/order-history/index',
    'pages/machine-manage/index',
    'pages/notice-publish/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#F59E0B',
    navigationBarTitleText: '小麦抢收',
    navigationBarTextStyle: 'white',
    backgroundColor: '#FFFBEB'
  },
  tabBar: {
    color: '#9CA3AF',
    selectedColor: '#F59E0B',
    backgroundColor: '#FFFFFF',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/plots/index',
        text: '地块'
      },
      {
        pagePath: 'pages/orders/index',
        text: '订单'
      },
      {
        pagePath: 'pages/dispatch/index',
        text: '调度'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
